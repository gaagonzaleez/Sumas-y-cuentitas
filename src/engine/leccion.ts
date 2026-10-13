// Minilecciones: hasta 3 pasos de hasta 15 palabras, con dibujo y voz.
import { ERRORES, LECCIONES } from '../content';
import type { Ejercicio } from './tipos';
import { rellenar } from './generadores/comun';
import { distancia, mismasLetras } from './letras';

export interface LeccionArmada {
  id: string;
  visual: string;
  pasos: string[];
  /** Frase cariñosa que explica el error en una línea. */
  diagnostico: string;
  errorTag: string;
}

export function infoError(errorTag: string) {
  const e = ERRORES[errorTag];
  if (!e) throw new Error(`errorTag desconocido: ${errorTag}`);
  return e;
}

/** Clasifica una respuesta incorrecta con su errorTag. */
export function errorTagDe(ej: Ejercicio, respuesta: string): string {
  const op = ej.opciones?.find((o) => o.valor === respuesta);
  if (op?.errorTag) return op.errorTag;
  if (ej.modo === 'letras') {
    const previsto = Object.entries(ej.erroresPrevistos ?? {}).find(([v]) => mismasLetras(v, respuesta));
    if (previsto) return previsto[1];
    // Muy parecido: es un tema de ortografía, no de números.
    if (distancia(respuesta, ej.respuesta) <= Math.max(2, Math.floor(ej.respuesta.length / 6))) return 'numeros.ortografia';
    return ej.errorTagPorDefecto;
  }
  if (ej.erroresPrevistos?.[respuesta]) return ej.erroresPrevistos[respuesta];
  return ej.errorTagPorDefecto;
}

export function armarLeccion(errorTag: string, ej: Ejercicio): LeccionArmada {
  const info = infoError(errorTag);
  let id = info.leccion;
  let lec = LECCIONES[id];
  if (!lec) throw new Error(`Falta la lección ${id}`);
  // Algunas lecciones dependen de los números: 8 + 5 se explica completando el 10, 46 + 37 por columnas.
  const otra = lec.segun ? ej.leccion[lec.segun] : undefined;
  if (typeof otra === 'string' && LECCIONES[otra]) {
    id = otra;
    lec = LECCIONES[otra];
  }
  const pasos = lec.pasos
    .map((p) => {
      if (p.casos) return p.casos[String(ej.leccion[p.segun ?? ''])];
      if (p.si === undefined) return p.texto;
      return ej.leccion[p.si] ? p.texto : p.sino;
    })
    .filter((t): t is string => Boolean(t))
    .map((t) => rellenar(t, ej.leccion))
    .slice(0, 3);
  return { id, visual: lec.visual, pasos, diagnostico: info.frase, errorTag };
}

/** Cuenta palabras (los signos sueltos como +, −, × o = no cuentan). */
export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}
