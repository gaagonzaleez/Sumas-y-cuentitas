// Una sesión de juego de un grado: tiempo activo, ejercicios resueltos, monedas y estrellas.
import { config } from '../content';
import type { EstadoEscalera, LimitesGrado } from './escalera';
import { nuevaEscalera, registrar } from './escalera';

export interface Sesion {
  nivelId: string;
  grado: number;
  esJefe: boolean;
  esRepaso: boolean;
  lim: LimitesGrado;
  escalera: EstadoEscalera;
  resueltos: number;
  /** Primer intento correcto (true) o no (false), por ejercicio resuelto. */
  historial: boolean[];
  usoPistas: boolean;
  activoMs: number;
  monedas: number;
  mejorRango: number;
  uids: string[];
}

export function nuevaSesion(nivelId: string, grado: number, lim: LimitesGrado, esJefe = false, esRepaso = false): Sesion {
  const escalera = nuevaEscalera(lim);
  return {
    nivelId, grado, esJefe, esRepaso, lim, escalera,
    resueltos: 0, historial: [], usoPistas: false, activoMs: 0, monedas: 0, mejorRango: escalera.rango, uids: [],
  };
}

export interface Respuesta {
  correcta: boolean;
  /** ¿Ya se equivocó en este ejercicio o usó una pista antes de esta respuesta? */
  conAyuda: boolean;
  /** Ejercicio parecido propuesto al terminar una minilección. */
  despuesDeLeccion: boolean;
}

export interface ResultadoRespuesta {
  sesion: Sesion;
  monedas: number;
  activarPista: boolean;
  subio: boolean;
  bajo: boolean;
}

/** Monedas por una respuesta correcta. Los errores nunca restan. */
export function monedasPorAcierto(r: Respuesta): number {
  const m = config.economia.monedas;
  if (!r.correcta) return 0;
  if (r.despuesDeLeccion && !r.conAyuda) return m.correctaDespuesDeLeccion;
  return r.conAyuda ? m.correctaConAyuda : m.correctaPrimerIntento;
}

export function responder(s: Sesion, r: Respuesta): ResultadoRespuesta {
  const res = registrar(s.escalera, s.lim, r.correcta, r.conAyuda);
  const monedas = monedasPorAcierto(r);
  const sesion: Sesion = {
    ...s,
    escalera: res.estado,
    monedas: s.monedas + monedas,
    mejorRango: Math.max(s.mejorRango, res.estado.rango),
  };
  return { sesion, monedas, activarPista: res.activarPista, subio: res.subio, bajo: res.bajo };
}

/** Marca un ejercicio como resuelto (acertado, o terminado con la minilección). */
export function resolver(s: Sesion, primerIntento: boolean, uid: string, usoPista: boolean): Sesion {
  return {
    ...s,
    resueltos: s.resueltos + 1,
    historial: [...s.historial, primerIntento],
    usoPistas: s.usoPistas || usoPista,
    uids: [...s.uids, uid],
  };
}

export function sumarTiempo(s: Sesion, ms: number): Sesion {
  return { ...s, activoMs: s.activoMs + ms };
}

/** Porcentaje de aciertos al primer intento en los últimos ejercicios (ventana configurable). */
export function aciertoReciente(s: Sesion): number {
  const v = config.economia.grado.ventanaAcierto;
  const ult = s.historial.slice(-v);
  return ult.length ? ult.filter(Boolean).length / ult.length : 0;
}

export function aciertoTotal(s: Sesion): number {
  return s.historial.length ? s.historial.filter(Boolean).length / s.historial.length : 0;
}

/**
 * Un grado se completa al resolver los ejercicios mínimos (15). Decisión de Ga: no se espera tiempo.
 * minutosActivos y aciertoMinimo siguen en la configuración por si se quieren volver a usar (0 = apagado).
 */
export function gradoCompleto(s: Sesion): boolean {
  const g = config.economia.grado;
  return s.activoMs >= g.minutosActivos * 60_000 && s.resueltos >= g.ejerciciosMinimos && aciertoReciente(s) >= g.aciertoMinimo;
}

/** Progreso del grado de 0 a 1 (para la barra): el mínimo entre tiempo y ejercicios. */
export function avanceGrado(s: Sesion): number {
  const g = config.economia.grado;
  const t = g.minutosActivos > 0 ? s.activoMs / (g.minutosActivos * 60_000) : 1;
  const e = s.resueltos / g.ejerciciosMinimos;
  return Math.max(0, Math.min(1, Math.min(t, e)));
}

/** 1 estrella al completar; 2 con 75 % al primer intento; 3 con 90 % y sin pistas. */
export function estrellasDe(s: Sesion): number {
  const e = config.economia.estrellas;
  const a = aciertoTotal(s);
  if (a >= e.tresEstrellasPrimerIntento && !s.usoPistas) return 3;
  if (a >= e.dosEstrellasPrimerIntento) return 2;
  return 1;
}
