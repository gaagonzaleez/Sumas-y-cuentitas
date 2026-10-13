import type { Azar } from '../azar';
import type { Contexto, Ejercicio, Opcion } from '../tipos';
import { NOMBRES, OBJETOS, PLANTILLAS } from '../../content';

export type Generador = (az: Azar, ctx: Contexto) => Ejercicio;

/** Reemplaza {clave} por su valor. */
export function rellenar(texto: string, vars: Record<string, unknown>): string {
  return (
    texto
      .replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : String(vars[k])))
      // "1 pesos" → "1 peso" (los números salen al azar).
      .replace(/(^|[^\d.,$])1 pesos\b/g, (_m, antes: string) => `${antes}1 peso`)
  );
}

export function mayuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Texto de una plantilla: acepta string, lista (elige una) o diccionario por variante. */
export function texto(az: Azar, plantilla: string, clave: string, variante?: string): string {
  const t = PLANTILLAS[plantilla]?.[clave];
  if (t === undefined) throw new Error(`Falta el texto ${plantilla}.${clave}`);
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) return az.elegir(t as string[]);
  const dic = t as Record<string, string | string[]>;
  const v = variante !== undefined ? dic[variante] : undefined;
  if (v === undefined) throw new Error(`Falta la variante ${plantilla}.${clave}.${variante}`);
  return typeof v === 'string' ? v : az.elegir(v);
}

export function objeto(id: string, cantidad = 2): string {
  const o = OBJETOS[id];
  if (!o) throw new Error(`Objeto desconocido: ${id}`);
  return cantidad === 1 ? o.uno : o.varios;
}

/** "cuántos" o "cuántas" y "los" o "las" según el objeto. */
export function genero(id: string): { cuantos: string; Cuantos: string; los: string } {
  const f = OBJETOS[id]?.f;
  return { cuantos: f ? 'cuántas' : 'cuántos', Cuantos: f ? 'Cuántas' : 'Cuántos', los: f ? 'las' : 'los' };
}

/** "1 centena", "4 decenas", "1 unidad"… */
export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export function cdu(c: number, d: number, u: number) {
  return {
    cTxt: plural(c, 'centena', 'centenas'),
    dTxt: plural(d, 'decena', 'decenas'),
    uTxt: plural(u, 'unidad', 'unidades'),
  };
}

export function dosNombres(az: Azar): [string, string] {
  const [a, b] = az.mezclar(NOMBRES);
  return [a, b];
}

/**
 * Arma opciones numéricas: la respuesta, los errores previstos (cada uno con su errorTag)
 * y, si faltan, números cercanos con el errorTag por defecto.
 */
export function opcionesNumericas(
  az: Azar,
  respuesta: number,
  previstos: [number, string][],
  tagDefecto: string,
  cantidad = 4,
  minimo = 0,
): { opciones: Opcion[]; erroresPrevistos: Record<string, string> } {
  const usados = new Set<number>([respuesta]);
  const elegidos: Opcion[] = [];
  const erroresPrevistos: Record<string, string> = {};
  for (const [v, tag] of previstos) {
    if (!Number.isInteger(v) || v < minimo || usados.has(v)) continue;
    erroresPrevistos[String(v)] = tag;
    if (elegidos.length < cantidad - 1) {
      usados.add(v);
      elegidos.push({ valor: String(v), errorTag: tag });
    }
  }
  const saltos = respuesta >= 20 ? [1, -1, 10, -10, 2, -2, 20, 5] : [1, -1, 2, -2, 3, -3, 4];
  for (const s of saltos) {
    if (elegidos.length >= cantidad - 1) break;
    const v = respuesta + s;
    if (v < minimo || usados.has(v)) continue;
    usados.add(v);
    elegidos.push({ valor: String(v), errorTag: tagDefecto });
  }
  let extra = 3;
  while (elegidos.length < cantidad - 1) {
    const v = respuesta + extra++;
    if (usados.has(v)) continue;
    usados.add(v);
    elegidos.push({ valor: String(v), errorTag: tagDefecto });
  }
  return { opciones: az.mezclar([{ valor: String(respuesta) }, ...elegidos]), erroresPrevistos };
}

/** Opciones de texto: la correcta y las incorrectas con su errorTag. */
export function opcionesTexto(az: Azar, correcta: string, incorrectas: [string, string][], cantidad = 4): Opcion[] {
  const vistos = new Set([correcta]);
  const lista: Opcion[] = [{ valor: correcta }];
  for (const [v, tag] of incorrectas) {
    if (vistos.has(v) || lista.length >= cantidad) continue;
    vistos.add(v);
    lista.push({ valor: v, errorTag: tag });
  }
  return az.mezclar(lista);
}

/** Cifras de un número, de la unidad hacia arriba: 352 → [2, 5, 3]. */
export function cifras(n: number): number[] {
  const r: number[] = [];
  do {
    r.push(n % 10);
    n = Math.floor(n / 10);
  } while (n > 0);
  return r;
}

export function redondearA(n: number, paso: number): number {
  return Math.max(paso, Math.round(n / paso) * paso);
}

export function uid(plantilla: string, params: Record<string, unknown>): string {
  return `${plantilla}:${Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(',')}`;
}

/** ¿El visual se ve desde el principio o queda como pista? */
export function visualEsAyuda(az: Azar, ctx: Contexto): boolean {
  const a = ctx.caracter.ayudas;
  return a === 'nunca' || (a === 'a-veces' && az.chance(0.5));
}

/** ¿Este ejercicio se contesta con teclado? (Desde el grado 2, a veces.) */
export function usaTeclado(az: Azar, ctx: Contexto): boolean {
  return ctx.grado >= 2 && az.chance(0.3);
}

export function sumaRepetidaTexto(g: number, p: number): string {
  if (g <= 5) return Array.from({ length: g }, () => String(p)).join(' + ');
  return `${p} + ${p} + ${p}… ${g} veces`;
}

/** Descompone un monto con billetes y monedas (de mayor a menor). */
export function descomponerPlata(monto: number, valores: number[]): number[] {
  const r: number[] = [];
  let resto = monto;
  for (const v of [...valores].sort((a, b) => b - a)) {
    while (resto >= v) {
      r.push(v);
      resto -= v;
    }
  }
  return r;
}
