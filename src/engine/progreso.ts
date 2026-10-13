// Desbloqueo de mundos, niveles y grados.
import { config, MUNDOS, type Mundo } from '../content';

export interface RegistroGrado {
  estrellas: number;
  completadoEn?: number;
  veces: number;
  mejorRango: number;
  tiempoActivoS: number;
}

/** Progreso por nivel: clave "<nivelId>#<grado>". */
export type Progreso = Record<string, RegistroGrado>;

export const clave = (nivelId: string, grado: number) => `${nivelId}#${grado}`;

export function completado(p: Progreso, nivelId: string, grado: number): boolean {
  return Boolean(p[clave(nivelId, grado)]?.completadoEn);
}

// Modo creadora: con un perfil de prueba de la creadora (config.app.perfilesCreadora) todo está abierto.
let todoAbierto = false;
const normalizar = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export function esCreadora(apodo?: string): boolean {
  return Boolean(apodo) && config.app.perfilesCreadora.map(normalizar).includes(normalizar(apodo!));
}
export function modoCreadora(activo: boolean) {
  todoAbierto = activo;
}

/** Un mundo se abre al pasar el grado 1 del nivel 4 del mundo anterior (no hace falta terminarlo entero). */
export function mundoDesbloqueado(p: Progreso, mundoId: string): boolean {
  if (todoAbierto) return true;
  const req = config.progreso.desbloqueoMundos[mundoId];
  if (req === undefined) return false;
  if (req === null) return true;
  const previo = MUNDOS.find((m) => m.id === req);
  const nivelQueAbre = previo?.niveles[config.progreso.nivelQueAbreSiguiente - 1];
  return (nivelQueAbre !== undefined && completado(p, nivelQueAbre.id, 1)) || completado(p, `${req}-jefe`, 1);
}

/** ¿Se puede jugar este grado de este nivel (o del jefe)? */
export function gradoDesbloqueado(p: Progreso, mundo: Mundo, nivelId: string, grado: number): boolean {
  if (todoAbierto) return true;
  if (!mundoDesbloqueado(p, mundo.id)) return false;
  if (grado > 1) return completado(p, nivelId, grado - 1);
  if (nivelId === mundo.jefe.id) return completado(p, mundo.niveles[mundo.niveles.length - 1].id, 1);
  const i = mundo.niveles.findIndex((n) => n.id === nivelId);
  if (i <= 0) return i === 0;
  return completado(p, mundo.niveles[i - 1].id, 1);
}

export function estrellasNivel(p: Progreso, nivelId: string): number {
  let s = 0;
  for (let g = 1; g <= 5; g++) s += p[clave(nivelId, g)]?.estrellas ?? 0;
  return s;
}

export function estrellasMundo(p: Progreso, mundo: Mundo): number {
  return [...mundo.niveles, mundo.jefe].reduce((s, n) => s + estrellasNivel(p, n.id), 0);
}

/** Nivel actual del mundo: el primero con grado 1 sin completar (o el jefe). */
export function nivelActual(p: Progreso, mundo: Mundo): { indice: number; id: string } {
  for (let i = 0; i < mundo.niveles.length; i++) {
    if (!completado(p, mundo.niveles[i].id, 1)) return { indice: i, id: mundo.niveles[i].id };
  }
  return { indice: mundo.niveles.length, id: mundo.jefe.id };
}

export function mundoTerminado(p: Progreso, mundo: Mundo): boolean {
  return completado(p, mundo.jefe.id, 1);
}

/** El mundo "actual" del mapa: el último desbloqueado que no está terminado. */
export function mundoActual(p: Progreso): Mundo {
  const orden = config.progreso.mundosOrden;
  const abiertos = orden.map((id) => MUNDOS.find((m) => m.id === id)!).filter((m) => mundoDesbloqueado(p, m.id));
  return abiertos.find((m) => !mundoTerminado(p, m)) ?? abiertos[abiertos.length - 1];
}

export function gradosCompletados(p: Progreso): number {
  return Object.values(p).filter((r) => r.completadoEn).length;
}
