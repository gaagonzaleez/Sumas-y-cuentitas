// Escalera de dificultad: cada grado arranca en su rango inicial y sube o baja de a un peldaño.
import { config, type Nivel } from '../content';
import type { CaracterGrado, Tema } from './tipos';

export interface EstadoEscalera {
  rango: number;
  aciertosSeguidos: number;
  erroresSeguidos: number;
}

export interface LimitesGrado {
  escalera: number[];
  inicio: number;
  techo: number;
  minimo: number;
}

/** Calcula la escalera y los límites para un nivel y grado. */
export function limitesGrado(nivel: Nivel, escalaMundo: Tema, grado: number): LimitesGrado {
  const escala = nivel.escala ?? escalaMundo;
  const escalera = config.dificultad.escaleras[escala];
  const g = config.dificultad.grados[escala][grado - 1];
  const techoNivel = nivel.techoNivel ?? Infinity;
  const minimo = nivel.minimo ?? escalera[0];
  // El rango que nombra el nivel ("sumas hasta 10") es el punto de partida del grado 1.
  let inicio = grado === 1 && nivel.inicio !== undefined ? nivel.inicio : Math.max(g.inicio, nivel.inicio ?? 0);
  let techo = Math.min(g.techo, techoNivel);
  inicio = Math.max(minimo, Math.min(inicio, techo));
  techo = Math.max(techo, inicio);
  return { escalera, inicio: ajustar(escalera, inicio), techo: ajustar(escalera, techo), minimo: ajustar(escalera, minimo) };
}

/** Lleva un valor al peldaño más cercano (hacia abajo) de la escalera. */
function ajustar(escalera: number[], v: number): number {
  let r = escalera[0];
  for (const p of escalera) if (p <= v) r = p;
  return v < escalera[0] ? escalera[0] : r;
}

export function nuevaEscalera(lim: LimitesGrado): EstadoEscalera {
  return { rango: lim.inicio, aciertosSeguidos: 0, erroresSeguidos: 0 };
}

export interface ResultadoEscalera {
  estado: EstadoEscalera;
  subio: boolean;
  bajo: boolean;
  /** Dos errores seguidos activan una pista. */
  activarPista: boolean;
}

/**
 * Registra una respuesta.
 * - 5 aciertos seguidos sin errores ni ayudas suben un peldaño (hasta el techo del grado).
 * - Un error no cambia el rango. 2 errores seguidos bajan un peldaño y activan una pista.
 */
export function registrar(
  e: EstadoEscalera,
  lim: LimitesGrado,
  correcta: boolean,
  conAyuda: boolean,
): ResultadoEscalera {
  const cfg = config.dificultad;
  const i = lim.escalera.indexOf(e.rango);
  if (correcta && !conAyuda) {
    const aciertos = e.aciertosSeguidos + 1;
    if (aciertos >= cfg.aciertosParaSubir && e.rango < lim.techo) {
      return { estado: { rango: lim.escalera[i + 1], aciertosSeguidos: 0, erroresSeguidos: 0 }, subio: true, bajo: false, activarPista: false };
    }
    return { estado: { ...e, aciertosSeguidos: aciertos, erroresSeguidos: 0 }, subio: false, bajo: false, activarPista: false };
  }
  if (correcta) {
    // Correcta con ayuda: no suma a la racha, pero corta los errores seguidos.
    return { estado: { ...e, aciertosSeguidos: 0, erroresSeguidos: 0 }, subio: false, bajo: false, activarPista: false };
  }
  const errores = e.erroresSeguidos + 1;
  if (errores >= cfg.erroresParaBajar) {
    const bajar = e.rango > lim.minimo && i > 0;
    return {
      estado: { rango: bajar ? lim.escalera[i - 1] : e.rango, aciertosSeguidos: 0, erroresSeguidos: 0 },
      subio: false,
      bajo: bajar,
      activarPista: true,
    };
  }
  return { estado: { ...e, aciertosSeguidos: 0, erroresSeguidos: errores }, subio: false, bajo: false, activarPista: false };
}

export function caracterGrado(grado: number): CaracterGrado {
  return config.dificultad.caracterGrado[grado - 1];
}

/** Descripción corta de un grado, por ejemplo "Sumas hasta 100 · con ayudas". */
export function descripcionGrado(nivel: Nivel, escalaMundo: Tema, grado: number): string {
  const lim = limitesGrado(nivel, escalaMundo, grado);
  const escala = nivel.escala ?? escalaMundo;
  const hasta = escala === 'tablas' ? `hasta × ${lim.techo}` : escala === 'finanzas' ? `hasta $${lim.techo.toLocaleString('es-AR')}` : `hasta ${lim.techo.toLocaleString('es-AR')}`;
  return `${nivel.corto} ${hasta} · ${caracterGrado(grado).descripcion}`;
}
