// Acciones del juego que cambian a la jugadora: comprar, equipar, cuidar la mascota,
// terminar un grado y repartir premios. Los errores nunca restan monedas ni estrellas.
import { config, nivelPorId } from '../content';
import { ITEM, MASCOTAS, PREMIOS, precioDe } from '../content/catalogo';
import * as M from '../engine/mascota';
import { clave, completado } from '../engine/progreso';
import { diaArgentina, lunesDeLaSemana, numeroDeSemana } from '../engine/semana';
import { actualizar, jugadoraActual } from './estado';
import { guardarIntento } from './db';
import type { Avatar, CapaAvatar, Intento, Jugadora } from './tipos';
import { crearAzar } from '../engine/azar';
import { ITEMS } from '../content/catalogo';

// ---------- Tienda ----------
export function ofertasDeLaSemana(fecha = new Date()): string[] {
  const az = crearAzar(numeroDeSemana(fecha) * 7919);
  const comprables = ITEMS.filter((i) => i.desbloqueo === 'tienda');
  return az.mezclar(comprables).slice(0, config.economia.tienda.ofertasPorSemana).map((i) => i.id);
}

export function precioFinal(itemId: string, fecha = new Date()): number {
  const base = precioDe(ITEM[itemId]);
  if (!ofertasDeLaSemana(fecha).includes(itemId)) return base;
  return Math.round(base * (1 - config.economia.tienda.descuentoOferta));
}

export type ResultadoCompra = 'ok' | 'sin-monedas' | 'ya-lo-tenes' | 'no-se-vende';

export async function comprarItem(itemId: string): Promise<ResultadoCompra> {
  const j = jugadoraActual();
  const it = ITEM[itemId];
  if (!j || !it) return 'no-se-vende';
  if (j.items.includes(itemId)) return 'ya-lo-tenes';
  if (it.desbloqueo !== 'tienda') return 'no-se-vende';
  const precio = precioFinal(itemId);
  if (j.monedas < precio) return 'sin-monedas';
  await actualizar((x) => ({
    ...x,
    monedas: x.monedas - precio,
    items: [...x.items, itemId],
    alcancia: x.alcancia?.itemId === itemId ? undefined : x.alcancia,
  }));
  return 'ok';
}

export async function comprarMascota(id: string): Promise<ResultadoCompra> {
  const j = jugadoraActual();
  const m = MASCOTAS.find((x) => x.id === id);
  if (!j || !m) return 'no-se-vende';
  if (m.precio === 0 || j.mascotasCompradas.includes(id)) return 'ya-lo-tenes';
  if (j.monedas < m.precio) return 'sin-monedas';
  await actualizar((x) => ({ ...x, monedas: x.monedas - m.precio, mascotasCompradas: [...x.mascotasCompradas, id] }));
  return 'ok';
}

export function tieneMascota(j: Jugadora, id: string): boolean {
  const m = MASCOTAS.find((x) => x.id === id);
  return Boolean(m && (m.precio === 0 || j.mascotasCompradas.includes(id) || j.mascota?.especie === id));
}

// ---------- Avatar ----------
export const CAPAS_OPCIONALES: CapaAvatar[] = ['cabeza', 'cara', 'cuello', 'mano', 'espalda', 'detalle', 'marco', 'vestido'];

export function equipar(a: Avatar, itemId: string | undefined, capa: string): Avatar {
  const n: Avatar = { ...a };
  if (capa === 'colorPelo') return itemId ? { ...n, colorPelo: itemId } : n;
  if (capa === 'vestido') {
    n.vestido = itemId;
    return n;
  }
  if (capa === 'arriba' || capa === 'abajo') {
    n.vestido = undefined;
    n[capa] = itemId ?? n[capa];
    return n;
  }
  (n as unknown as Record<string, string | undefined>)[capa] = itemId;
  return n;
}

export async function guardarAvatar(a: Avatar) {
  await actualizar((x) => ({ ...x, avatar: a }));
}

export async function guardarEnRopero(i: number, a: Avatar) {
  await actualizar((x) => ({ ...x, ropero: x.ropero.map((r, k) => (k === i ? a : r)) }));
}

// ---------- Mascota ----------
export async function elegirMascota(especie: string, nombre: string) {
  await actualizar((x) => ({ ...x, mascota: { ...M.nuevaMascota(especie, nombre, diaArgentina()), accesorios: x.mascota?.accesorios ?? [] } }));
}

export async function alimentarMascota(): Promise<ResultadoCompra> {
  const j = jugadoraActual();
  if (!j?.mascota) return 'no-se-vende';
  const precio = config.mascota.precioAlimentar;
  if (j.monedas < precio) return 'sin-monedas';
  await actualizar((x) => ({ ...x, monedas: x.monedas - precio, mascota: M.alimentar(x.mascota!, diaArgentina()) }));
  return 'ok';
}

export async function jugarConMascota(): Promise<boolean> {
  const j = jugadoraActual();
  if (!j?.mascota) return false;
  const sumo = M.puedeJugar(j.mascota, diaArgentina());
  await actualizar((x) => ({ ...x, mascota: M.jugar(x.mascota!, diaArgentina()) }));
  return sumo;
}

export async function vestirMascota(accesorio: string) {
  await actualizar((x) => {
    if (!x.mascota) return x;
    const tiene = x.mascota.accesorios.includes(accesorio);
    return { ...x, mascota: { ...x.mascota, accesorios: tiene ? x.mascota.accesorios.filter((a) => a !== accesorio) : [...x.mascota.accesorios, accesorio] } };
  });
}

// ---------- Jugar ----------
export async function registrarIntento(i: Omit<Intento, 'jugadoraId' | 'creadoEn'>) {
  const j = jugadoraActual();
  if (!j) return;
  await guardarIntento({ ...i, jugadoraId: j.id, creadoEn: Date.now() });
}

/** Suma monedas por aciertos (y estrellas, que hacen crecer a la mascota y suman en la tabla). */
export async function ganar(monedas: number, estrellas = 0) {
  const hoy = diaArgentina();
  const semana = lunesDeLaSemana();
  await actualizar((x) => ({
    ...x,
    monedas: x.monedas + monedas,
    estrellas: x.estrellas + estrellas,
    estrellasPorSemana: estrellas ? { ...x.estrellasPorSemana, [semana]: (x.estrellasPorSemana[semana] ?? 0) + estrellas } : x.estrellasPorSemana,
    mascota: estrellas && x.mascota ? M.porEstrellas(x.mascota, estrellas, hoy) : x.mascota,
  }));
}

export async function anotarError(tag: string) {
  const hoy = diaArgentina();
  await actualizar((x) => ({ ...x, errores: [...x.errores, { tag, dia: hoy }].slice(-400) }));
}

export async function sumarTiempoDeJuego(segundos: number) {
  if (segundos <= 0) return;
  const hoy = diaArgentina();
  await actualizar((x) => ({ ...x, tiempoPorDia: { ...x.tiempoPorDia, [hoy]: (x.tiempoPorDia[hoy] ?? 0) + segundos } }));
}

export interface Premios {
  monedas: number;
  estrellas: number;
  estrellasNuevas: number;
  items: string[];
  estampita?: string;
  esJefe: boolean;
  primeraVez: boolean;
  mundoNuevo?: string;
  racha: boolean;
}

/** Al completar un grado: guarda el progreso y entrega monedas, estrellas y premios únicos. */
export async function completarGrado(nivelId: string, grado: number, estrellas: number, mejorRango: number, segundos: number): Promise<Premios> {
  const j = jugadoraActual()!;
  const info = nivelPorId(nivelId)!;
  const k = clave(nivelId, grado);
  const previo = j.progreso[k];
  const primeraVez = !previo?.completadoEn;
  const eco = config.economia;
  const estrellasNuevas = Math.max(0, estrellas - (previo?.estrellas ?? 0));
  let monedas = primeraVez ? eco.monedas.completarGrado : eco.monedas.repetirGrado;
  let estrellasJefe = 0;
  const items: string[] = [];
  let estampita: string | undefined;
  const progreso = {
    ...j.progreso,
    [k]: {
      estrellas: Math.max(estrellas, previo?.estrellas ?? 0),
      completadoEn: previo?.completadoEn ?? Date.now(),
      veces: (previo?.veces ?? 0) + 1,
      mejorRango: Math.max(mejorRango, previo?.mejorRango ?? 0),
      tiempoActivoS: (previo?.tiempoActivoS ?? 0) + segundos,
    },
  };
  const todosLos5 = (p: typeof progreso) => [1, 2, 3, 4, 5].every((g) => completado(p, nivelId, g));
  if (primeraVez) {
    if (info.esJefe) {
      monedas += eco.monedas.vencerJefe;
      estrellasJefe = grado === 1 ? eco.estrellas.vencerJefe : 0;
      const pj = PREMIOS.jefes[info.mundo.id];
      items.push(...(pj?.grados[String(grado)] ?? []));
      if (todosLos5(progreso)) items.push(...(pj?.todos ?? []));
    } else {
      const pn = PREMIOS.niveles[nivelId];
      if (pn && grado === 1) items.push(pn.grado1);
      if (pn && todosLos5(progreso)) {
        items.push(pn.todos);
        estampita = pn.estampita;
      }
    }
  }
  // Racha: 3 días seguidos jugando (se cobra una vez cada 3 días).
  const hoy = diaArgentina();
  const dias = new Set(j.diasJugados);
  const racha =
    [0, 1, 2].every((d) => dias.has(M.sumarDias(hoy, -d))) &&
    (!j.ultimaRachaPremiada || M.diasEntre(j.ultimaRachaPremiada, hoy) >= 3);
  if (racha) monedas += eco.monedas.racha3Dias;
  const nuevosItems = items.filter((i) => !j.items.includes(i));
  const totalEstrellas = estrellasNuevas + estrellasJefe;
  const semana = lunesDeLaSemana();
  let mundoNuevo: string | undefined;
  await actualizar((x) => ({
    ...x,
    progreso,
    monedas: x.monedas + monedas,
    estrellas: x.estrellas + totalEstrellas,
    estrellasPorSemana: totalEstrellas ? { ...x.estrellasPorSemana, [semana]: (x.estrellasPorSemana[semana] ?? 0) + totalEstrellas } : x.estrellasPorSemana,
    items: [...x.items, ...nuevosItems],
    estampitas: estampita && !x.estampitas.includes(estampita) ? [...x.estampitas, estampita] : x.estampitas,
    mascota: totalEstrellas && x.mascota ? M.porEstrellas(x.mascota, totalEstrellas, hoy) : x.mascota,
    ultimaRachaPremiada: racha ? hoy : x.ultimaRachaPremiada,
  }));
  if (info.esJefe && grado === 1 && primeraVez) {
    const desbloqueados = Object.entries(config.progreso.desbloqueoMundos).filter(([, req]) => req === info.mundo.id).map(([m]) => m);
    mundoNuevo = desbloqueados[0];
  }
  return { monedas, estrellas: totalEstrellas, estrellasNuevas, items: nuevosItems, estampita, esJefe: info.esJefe, primeraVez, mundoNuevo, racha };
}

// ---------- Alcancía ----------
export async function elegirMeta(itemId: string | undefined) {
  // Lo ya guardado nunca se pierde: pasa a la nueva meta o vuelve a la billetera.
  await actualizar((x) => ({ ...x, alcancia: itemId ? { itemId, guardado: x.alcancia?.guardado ?? 0 } : undefined, monedas: x.monedas + (itemId ? 0 : (x.alcancia?.guardado ?? 0)) }));
}

/** Pasa monedas a la alcancía. Al llegar a la meta suma un bono y compra el ítem. */
export async function guardarEnAlcancia(cuanto: number): Promise<'ok' | 'meta' | 'nada'> {
  const j = jugadoraActual();
  if (!j?.alcancia) return 'nada';
  const precio = precioFinal(j.alcancia.itemId);
  const falta = precio - j.alcancia.guardado;
  const pone = Math.min(cuanto, j.monedas, falta);
  if (pone <= 0) return 'nada';
  const guardado = j.alcancia.guardado + pone;
  if (guardado >= precio) {
    const bono = Math.round(precio * config.economia.alcancia.bonoAlLlegar);
    const itemId = j.alcancia.itemId;
    await actualizar((x) => ({ ...x, monedas: x.monedas - pone + bono, items: [...x.items, itemId], alcancia: undefined }));
    return 'meta';
  }
  await actualizar((x) => ({ ...x, monedas: x.monedas - pone, alcancia: { ...x.alcancia!, guardado } }));
  return 'ok';
}

/** Errores repetidos en la semana que conviene repasar (3 o más del mismo tipo). */
export function erroresParaRepasar(j: Jugadora, hoy = diaArgentina()): { tag: string; veces: number }[] {
  const { erroresParaSugerir, dias } = config.progreso.repaso;
  const cuenta: Record<string, number> = {};
  for (const e of j.errores) if (M.diasEntre(e.dia, hoy) < dias) cuenta[e.tag] = (cuenta[e.tag] ?? 0) + 1;
  return Object.entries(cuenta)
    .filter(([, v]) => v >= erroresParaSugerir)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, veces]) => ({ tag, veces }));
}
