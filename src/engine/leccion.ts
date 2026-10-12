// Minilecciones: hasta 3 pasos de hasta 15 palabras, con dibujo y voz.
import { ERRORES, LECCIONES } from '../content';
import type { Ejercicio } from './tipos';
import { rellenar } from './generadores/comun';

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
  if (ej.erroresPrevistos?.[respuesta]) return ej.erroresPrevistos[respuesta];
  return ej.errorTagPorDefecto;
}

export function armarLeccion(errorTag: string, ej: Ejercicio): LeccionArmada {
  const info = infoError(errorTag);
  const lec = LECCIONES[info.leccion];
  if (!lec) throw new Error(`Falta la lección ${info.leccion}`);
  const pasos = lec.pasos
    .map((p) => {
      if (p.si === undefined) return p.texto;
      return ej.leccion[p.si] ? p.texto : p.sino;
    })
    .filter((t): t is string => Boolean(t))
    .map((t) => rellenar(t, ej.leccion))
    .slice(0, 3);
  return { id: info.leccion, visual: lec.visual, pasos, diagnostico: info.frase, errorTag };
}

/** Cuenta palabras (los signos sueltos como +, −, × o = no cuentan). */
export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}
