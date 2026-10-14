// Estado global de la app (sin librerías): una tienda simple con suscripción.
import { useSyncExternalStore } from 'react';
import { AVATAR_INICIAL, ITEM, ITEMS_GRATIS } from '../content/catalogo';
import { config } from '../content';
import { alVolver, diasEntre } from '../engine/mascota';
import { diaArgentina } from '../engine/semana';
import { hashClave, hashDibujos, nuevaSal, nuevoId } from './cripto';
import * as db from './db';
import type { CuentaAdulta, Jugadora } from './tipos';

export interface Estado {
  cargando: boolean;
  error?: string;
  cuenta?: CuentaAdulta;
  jugadoras: Jugadora[];
  actualId?: string;
  /** La adulta puso su contraseña en esta visita. */
  adultaAdentro: boolean;
  /** Días que pasaron sin jugar antes de esta visita (para que la mascota diga "te extrañé"). */
  diasAusente: number;
  /** La nena ya puso sus dibujos secretos en esta visita. */
  adentro: boolean;
}

let estado: Estado = { cargando: true, jugadoras: [], adultaAdentro: false, diasAusente: 0, adentro: false };
const oyentes = new Set<() => void>();

function emitir(nuevo: Partial<Estado>) {
  estado = { ...estado, ...nuevo };
  oyentes.forEach((f) => f());
}

export function useEstado(): Estado {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => estado,
  );
}

export const leerEstado = () => estado;

export function jugadoraActual(): Jugadora | undefined {
  return estado.jugadoras.find((j) => j.id === estado.actualId);
}

export function useJugadora(): Jugadora | undefined {
  const e = useEstado();
  return e.jugadoras.find((j) => j.id === e.actualId);
}

const CLAVE_ULTIMA = 'mateaventuras:ultima';
// Mientras la app siga abierta (aunque se recargue o se actualice), la nena no tiene que
// volver a poner sus dibujos. Se borra al cerrar la app o al tocar "Salir".
const CLAVE_ADENTRO = 'mateaventuras:adentro';

function leerSesion(clave: string): string | undefined {
  try {
    return sessionStorage.getItem(clave) ?? undefined;
  } catch {
    return undefined;
  }
}

function guardarSesion(clave: string, valor: string | undefined) {
  try {
    if (valor) sessionStorage.setItem(clave, valor);
    else sessionStorage.removeItem(clave);
  } catch {
    /* sin almacenamiento: se pedirán los dibujos otra vez */
  }
}

export async function iniciar(): Promise<void> {
  try {
    const [cuenta, guardadas] = await Promise.all([db.leerCuenta(), db.leerJugadoras()]);
    const jugadoras = guardadas.map(normalizarJugadora);
    let ultima: string | undefined;
    try {
      ultima = localStorage.getItem(CLAVE_ULTIMA) ?? undefined;
    } catch {
      ultima = undefined;
    }
    const actualId = jugadoras.find((j) => j.id === ultima)?.id ?? (jugadoras.length === 1 ? jugadoras[0].id : undefined);
    const adentro = Boolean(actualId && leerSesion(CLAVE_ADENTRO) === actualId);
    emitir({ cargando: false, cuenta, jugadoras, actualId, adentro });
    // Si la app se recargó (por ejemplo, al actualizarse) un día nuevo, igual se cuenta el día.
    if (adentro) await nuevoDia();
  } catch (e) {
    emitir({ cargando: false, error: (e as Error).message });
  }
}

// ---------- Adulta ----------
export async function crearCuenta(email: string, clave: string): Promise<void> {
  const sal = nuevaSal();
  const cuenta: CuentaAdulta = { id: 'adulta', email: email.trim().toLowerCase(), sal, hash: await hashClave(clave, sal), creadaEn: Date.now() };
  await db.guardarCuenta(cuenta);
  emitir({ cuenta, adultaAdentro: true });
}

export async function verificarAdulta(clave: string): Promise<boolean> {
  const c = estado.cuenta;
  if (!c) return false;
  const ok = (await hashClave(clave, c.sal)) === c.hash;
  if (ok) emitir({ adultaAdentro: true });
  return ok;
}

export function salirAdulta() {
  emitir({ adultaAdentro: false });
}

/** La nena sale (vuelve a la pantalla de dibujos). */
export function salir() {
  guardarSesion(CLAVE_ADENTRO, undefined);
  emitir({ adentro: false });
}

// ---------- Jugadoras ----------
export function jugadoraNueva(apodo: string, grado: string, codigoGrupo?: string): Jugadora {
  return {
    id: nuevoId(),
    apodo,
    grado,
    codigoGrupo: codigoGrupo || undefined,
    creadaEn: Date.now(),
    guia: null,
    avatar: null,
    mascota: null,
    mascotasCompradas: [],
    monedas: config.economia.monedasIniciales,
    estrellas: 0,
    items: [...ITEMS_GRATIS],
    progreso: {},
    estampitas: [],
    ropero: [null, null, null, null, null],
    ajustes: { silencio: false, reloj: false },
    diasJugados: [],
    tiempoPorDia: {},
    errores: [],
    retosCobrados: [],
    estrellasPorSemana: {},
    actualizadaEn: Date.now(),
  };
}

export async function crearJugadora(apodo: string, grado: string, codigoGrupo?: string): Promise<Jugadora> {
  const j = jugadoraNueva(apodo, grado, codigoGrupo);
  await db.guardarJugadora(j);
  emitir({ jugadoras: [...estado.jugadoras, j], actualId: j.id });
  recordarUltima(j.id);
  return j;
}

function recordarUltima(id: string) {
  try {
    localStorage.setItem(CLAVE_ULTIMA, id);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function elegirJugadora(id: string | undefined) {
  guardarSesion(CLAVE_ADENTRO, undefined);
  emitir({ actualId: id, adentro: false });
  if (id) recordarUltima(id);
}

/** Cambia la jugadora actual y la guarda. */
export async function actualizar(cambio: (j: Jugadora) => Jugadora): Promise<Jugadora | undefined> {
  const j = jugadoraActual();
  if (!j) return undefined;
  const nueva = { ...cambio(j), actualizadaEn: Date.now() };
  emitir({ jugadoras: estado.jugadoras.map((x) => (x.id === nueva.id ? nueva : x)) });
  await db.guardarJugadora(nueva);
  notificarCambio(nueva);
  return nueva;
}

export async function actualizarPorId(id: string, cambio: (j: Jugadora) => Jugadora): Promise<void> {
  const j = estado.jugadoras.find((x) => x.id === id);
  if (!j) return;
  const nueva = { ...cambio(j), actualizadaEn: Date.now() };
  emitir({ jugadoras: estado.jugadoras.map((x) => (x.id === id ? nueva : x)) });
  await db.guardarJugadora(nueva);
  notificarCambio(nueva);
}

export async function definirDibujos(dibujos: string[]): Promise<void> {
  const j = jugadoraActual();
  if (!j) return;
  const h = await hashDibujos(j.id, dibujos);
  await actualizar((x) => ({ ...x, dibujosHash: h }));
}

export async function comprobarDibujos(dibujos: string[]): Promise<boolean> {
  const j = jugadoraActual();
  if (!j?.dibujosHash) return false;
  return (await hashDibujos(j.id, dibujos)) === j.dibujosHash;
}

/** Al entrar: recalcula la mascota según los días sin jugar y anota el día. */
export async function alEntrar(): Promise<void> {
  const j = jugadoraActual();
  if (!j) return;
  guardarSesion(CLAVE_ADENTRO, j.id);
  // La adulta ya no está: lo suyo vuelve a pedir contraseña.
  emitir({ adentro: true, adultaAdentro: false });
  await contarDia();
}

/** Si cambió el día desde la última vez (app abierta toda la noche, recarga), lo cuenta. */
export async function nuevoDia(): Promise<void> {
  const j = jugadoraActual();
  if (!j || !estado.adentro) return;
  if (j.diasJugados[j.diasJugados.length - 1] === diaArgentina()) return;
  await contarDia();
}

async function contarDia(): Promise<void> {
  const j = jugadoraActual();
  if (!j) return;
  const hoy = diaArgentina();
  const ultimo = j.diasJugados[j.diasJugados.length - 1];
  emitir({ diasAusente: ultimo && ultimo !== hoy ? diasEntre(ultimo, hoy) : estado.diasAusente });
  await actualizar((x) => ({
    ...x,
    mascota: x.mascota ? alVolver(x.mascota, hoy) : null,
    diasJugados: x.diasJugados.includes(hoy) ? x.diasJugados : [...x.diasJugados, hoy].slice(-30),
    avatar: x.avatar,
  }));
}

export async function borrarJugadora(id: string): Promise<void> {
  await db.borrarJugadora(id);
  const jugadoras = estado.jugadoras.filter((j) => j.id !== id);
  emitir({ jugadoras, actualId: estado.actualId === id ? undefined : estado.actualId });
  borradoRemoto?.(id);
}

export function avatarInicial() {
  return { ...AVATAR_INICIAL };
}

// ---------- Sincronización (etapa 5): se engancha desde datos/nube.ts si hay Supabase ----------
let notificarCambio: (j: Jugadora) => void = () => {};
let borradoRemoto: ((id: string) => void) | undefined;
export function engancharNube(alCambiar: (j: Jugadora) => void, alBorrar: (id: string) => void) {
  notificarCambio = alCambiar;
  borradoRemoto = alBorrar;
}

export function reemplazarJugadoras(jugadoras: Jugadora[]) {
  const normalizadas = jugadoras.map(normalizarJugadora);
  emitir({ jugadoras: normalizadas });
  normalizadas.forEach((j) => db.guardarJugadora(j).catch(() => undefined));
}

/**
 * Datos guardados por versiones anteriores (o de la nube) pueden no tener los campos nuevos:
 * se completan con los valores iniciales para que nada se rompa. Lo que ya no existe en el
 * catálogo se saca (y lo ahorrado en la alcancía vuelve a la billetera).
 */
export function normalizarJugadora(raw: Jugadora): Jugadora {
  const base = jugadoraNueva(raw.apodo ?? '', raw.grado ?? '');
  const j = { ...base, ...raw, id: raw.id } as Jugadora;
  for (const k of Object.keys(base) as (keyof Jugadora)[]) {
    const b = base[k];
    if (Array.isArray(b) && !Array.isArray(j[k])) (j as unknown as Record<string, unknown>)[k] = b;
    else if (b && typeof b === 'object' && !Array.isArray(b) && (j[k] === null || typeof j[k] !== 'object'))
      (j as unknown as Record<string, unknown>)[k] = b;
  }
  j.ajustes = { ...base.ajustes, ...raw.ajustes };
  j.items = [...new Set([...j.items.filter((i) => ITEM[i]), ...ITEMS_GRATIS])];
  if (j.mascota)
    j.mascota = {
      ...j.mascota,
      accesorios: Array.isArray(j.mascota.accesorios) ? j.mascota.accesorios : [],
      limpieza: typeof j.mascota.limpieza === 'number' ? j.mascota.limpieza : config.mascota.limpieza.inicial,
    };
  if (j.alcancia && !ITEM[j.alcancia.itemId]) {
    j.monedas += j.alcancia.guardado ?? 0;
    j.alcancia = undefined;
  }
  return j;
}
