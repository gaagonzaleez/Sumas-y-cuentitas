// Etapa 5: sincronización con Supabase (plan gratuito). Solo funciona si se configuraron
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY al compilar; si no, el juego sigue 100 % local.
import type { SupabaseClient } from '@supabase/supabase-js';
import gruposCfg from '../../content/config/grupos.json';
import { lunesDeLaSemana } from '../engine/semana';
import { engancharNube, leerEstado, reemplazarJugadoras } from './estado';
import type { Avatar, Jugadora } from './tipos';
import { resumirJugadora, type ResumenPerfil } from './resumen';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const CLAVE = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const nubeConfigurada = Boolean(URL && CLAVE);
export const configGrupos = gruposCfg;

let cliente: Promise<SupabaseClient> | null = null;
function sb(): Promise<SupabaseClient> {
  if (!nubeConfigurada) return Promise.reject(new Error('sin-nube'));
  cliente ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL!, CLAVE!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'mateaventuras-nube' } }),
  );
  return cliente;
}

export async function sesionNube(): Promise<{ email?: string } | null> {
  if (!nubeConfigurada) return null;
  const { data } = await (await sb()).auth.getSession();
  return data.session ? { email: data.session.user.email } : null;
}

export type ResultadoConexion = 'ok' | 'confirmar-correo' | 'clave-incorrecta' | 'error';

/** La adulta conecta su cuenta (la crea si no existe). */
export async function conectar(email: string, clave: string): Promise<ResultadoConexion> {
  const c = await sb();
  const ent = await c.auth.signInWithPassword({ email, password: clave });
  if (!ent.error) return 'ok';
  if (/confirm/i.test(ent.error.message)) return 'confirmar-correo';
  const reg = await c.auth.signUp({ email, password: clave });
  if (reg.error) return /registered|already/i.test(reg.error.message) ? 'clave-incorrecta' : 'error';
  return reg.data.session ? 'ok' : 'confirmar-correo';
}

export async function desconectar() {
  if (nubeConfigurada) await (await sb()).auth.signOut();
}

// ---------- Subir y bajar perfiles ----------
function leerLocal(k: string): string | undefined {
  try {
    return localStorage.getItem(`mateaventuras:${k}`) ?? undefined;
  } catch {
    return undefined;
  }
}
function guardarLocal(k: string, v: string | undefined) {
  try {
    if (v === undefined) localStorage.removeItem(`mateaventuras:${k}`);
    else localStorage.setItem(`mateaventuras:${k}`, v);
  } catch {
    /* sin almacenamiento */
  }
}

/** Perfiles borrados: nunca se vuelven a subir ni a bajar (aunque el borrado en la nube falle). */
const borradas = (): string[] => JSON.parse(leerLocal('borradas') ?? '[]') as string[];

/** Resumen anónimo del avance para el panel de la creadora (no necesita que la familia se conecte). */
async function subirResumen(j: Jugadora) {
  if (borradas().includes(j.id)) return;
  await (await sb()).rpc('guardar_resumen', { p_id: j.id, p_apodo: j.apodo, p_grado: j.grado, p_datos: resumirJugadora(j) });
}

async function subir(j: Jugadora) {
  if (borradas().includes(j.id)) return;
  await subirResumen(j).catch(() => undefined);
  const c = await sb();
  const { data } = await c.auth.getSession();
  if (!data.session) return;
  await c.from('players').upsert({ id: j.id, apodo: j.apodo, avatar: j.avatar });
  await c.from('player_snapshots').upsert({ player_id: j.id, datos: j, actualizado_en: new Date(j.actualizadaEn).toISOString() });
  if (j.codigoGrupo) {
    // Solo se une cuando el código es nuevo: si la organizadora la quitó, no vuelve a entrar sola.
    if (leerLocal(`unida:${j.id}`) !== j.codigoGrupo) {
      const { error } = await c.rpc('unirse_grupo', { p_player: j.id, p_codigo: j.codigoGrupo });
      if (!error) guardarLocal(`unida:${j.id}`, j.codigoGrupo);
    }
    // Esta semana y la anterior (por si jugó el domingo sin internet).
    const semanas = Object.keys(j.estrellasPorSemana).sort().slice(-2);
    for (const semana of semanas.length ? semanas : [lunesDeLaSemana()])
      await c.rpc('sumar_estrellas', { p_player: j.id, p_semana: semana, p_estrellas: j.estrellasPorSemana[semana] ?? 0 });
  } else {
    guardarLocal(`unida:${j.id}`, undefined);
    await c.rpc('salir_grupo', { p_player: j.id });
  }
}

/** Trae los perfiles de la nube y se queda con la versión más nueva de cada uno. */
export async function bajarYMezclar(): Promise<number> {
  const c = await sb();
  const { data, error } = await c.from('player_snapshots').select('datos');
  if (error || !data) return 0;
  const fuera = borradas();
  const remotas = data.map((d) => d.datos as Jugadora).filter((r) => !fuera.includes(r.id));
  const locales = leerEstado().jugadoras;
  const porId = new Map(locales.map((j) => [j.id, j]));
  for (const r of remotas) {
    const l = porId.get(r.id);
    if (!l || r.actualizadaEn > l.actualizadaEn) porId.set(r.id, r);
  }
  const todas = [...porId.values()];
  reemplazarJugadoras(todas);
  // Se suben las que la nube no tiene o tiene más viejas.
  await Promise.all(
    todas
      .filter((j) => {
        const r = remotas.find((x) => x.id === j.id);
        return !r || j.actualizadaEn > r.actualizadaEn;
      })
      .map(subir),
  );
  return remotas.length;
}

const pendientes = new Map<string, ReturnType<typeof setTimeout>>();
function programar(j: Jugadora) {
  clearTimeout(pendientes.get(j.id));
  pendientes.set(j.id, setTimeout(() => subir(j).catch(() => undefined), gruposCfg.sincronizarCadaSeg * 1000));
}

async function borrarRemota(id: string) {
  clearTimeout(pendientes.get(id));
  pendientes.delete(id);
  if (!borradas().includes(id)) guardarLocal('borradas', JSON.stringify([...borradas(), id]));
  await reintentarBorrados();
}

/** Borra en la nube los perfiles borrados acá (si antes no había conexión, se reintenta). */
async function reintentarBorrados() {
  for (const id of borradas()) {
    try {
      await (await sb()).rpc('borrar_resumen', { p_id: id });
      const { error } = await (await sb()).from('players').delete().eq('id', id);
      if (error) return;
    } catch {
      return;
    }
  }
}

export function iniciarNube() {
  if (!nubeConfigurada) return;
  engancharNube(programar, borrarRemota);
  // Primero se baja y se mezcla (así no se pisa lo jugado en otro dispositivo) y después se sube.
  const sincronizar = () =>
    sesionNube()
      .then((s) => s && reintentarBorrados().then(() => bajarYMezclar()))
      .catch(() => undefined);
  void sincronizar();
  // Los resúmenes para la creadora se suben aunque la familia no haya conectado su cuenta.
  leerEstado().jugadoras.forEach((j) => void subirResumen(j).catch(() => undefined));
  window.addEventListener('online', () => void sincronizar());
}

// ---------- Tabla de posiciones ----------
export interface FilaTabla {
  player_id: string;
  apodo: string;
  avatar: Avatar | null;
  semana: number;
  siempre: number;
  es_mia: boolean;
  grupo: string;
  codigo: string;
  jugadoras: number;
}

export type EstadoTabla = { tipo: 'ok'; filas: FilaTabla[] } | { tipo: 'sin-sesion' } | { tipo: 'sin-grupo' } | { tipo: 'error' };

export async function tablaDelGrupo(j: Jugadora): Promise<EstadoTabla> {
  try {
    if (!(await sesionNube())) return { tipo: 'sin-sesion' };
    await subir(j);
    const { data, error } = await (await sb()).rpc('tabla_grupo', { p_player: j.id, p_semana: lunesDeLaSemana() });
    if (error) return { tipo: 'error' };
    if (!data?.length) return { tipo: 'sin-grupo' };
    return { tipo: 'ok', filas: data as FilaTabla[] };
  } catch {
    return { tipo: 'error' };
  }
}

// ---------- Organizadora ----------
export async function crearGrupo(nombre: string): Promise<string | null> {
  const { data, error } = await (await sb()).rpc('crear_grupo', { p_nombre: nombre });
  return error ? null : (data as string);
}

export interface GrupoMio {
  id: string;
  nombre: string;
  codigo: string;
  cerrado: boolean;
  jugadoras: { id: string; apodo: string }[];
}

export async function misGrupos(): Promise<GrupoMio[]> {
  const { data } = await (await sb()).rpc('mis_grupos');
  const r = new Map<string, GrupoMio>();
  for (const f of (data ?? []) as { group_id: string; nombre: string; codigo: string; cerrado: boolean; player_id: string | null; apodo: string | null }[]) {
    const g = r.get(f.group_id) ?? { id: f.group_id, nombre: f.nombre, codigo: f.codigo, cerrado: f.cerrado, jugadoras: [] };
    if (f.player_id && f.apodo) g.jugadoras.push({ id: f.player_id, apodo: f.apodo });
    r.set(f.group_id, g);
  }
  return [...r.values()];
}

export async function quitarJugadora(grupo: string, jugadora: string) {
  await (await sb()).rpc('quitar_jugadora', { p_group: grupo, p_player: jugadora });
}

export async function cerrarGrupo(grupo: string, cerrado: boolean) {
  await (await sb()).rpc('cerrar_grupo', { p_group: grupo, p_cerrado: cerrado });
}

// ---------- Panel de la creadora ----------
export type EstadoCreadora = { tipo: 'ok'; perfiles: ResumenPerfil[] } | { tipo: 'sin-nube' } | { tipo: 'sin-sesion' } | { tipo: 'no-creadora' } | { tipo: 'error' };

/** Todos los perfiles de todos los dispositivos (solo si la cuenta conectada es de la creadora). */
export async function perfilesDeTodos(): Promise<EstadoCreadora> {
  if (!nubeConfigurada) return { tipo: 'sin-nube' };
  try {
    if (!(await sesionNube())) return { tipo: 'sin-sesion' };
    const { data, error } = await (await sb()).rpc('resumen_creadora');
    if (error) return /creadora/.test(error.message) ? { tipo: 'no-creadora' } : { tipo: 'error' };
    return { tipo: 'ok', perfiles: ((data ?? []) as { datos: ResumenPerfil }[]).map((f) => f.datos) };
  } catch {
    return { tipo: 'error' };
  }
}
