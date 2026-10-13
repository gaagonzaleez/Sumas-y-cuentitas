// Juegos que se suman a los niveles de sumas, restas y tablas para que no sea siempre lo mismo:
// la cuenta con un hueco, "¿está bien esta cuenta?", la memoria de cuentas y los dobles.
import { datosFalta } from '../explicar';
import type { Contexto, Ejercicio } from '../tipos';
import { type Generador, opcionesNumericas, rellenar, texto, uid, usaTeclado } from './comun';
import { datosResta, datosSuma, hayLlevada, hayPrestamo, par, restaInvertida, sumaSinLlevar } from './sumasRestas';
import { datosGrupos, elegirTabla } from './tablas';

type Op = '+' | '−' | '×';


function opDe(ctx: Contexto): Op {
  return (ctx.params.op as Op) ?? '+';
}

/** Cuenta con un hueco: 7 + __ = 12, 15 − __ = 9, 4 × __ = 20. */
export const cuentaFaltante: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx);
  let a: number, x: number, r: number, previstos: [number, string][], tag: string, leccion: Ejercicio['leccion'];
  if (op === '×') {
    const t = elegirTabla(az, ctx);
    x = az.entero(2, Math.max(2, ctx.rango));
    a = t;
    r = t * x;
    previstos = [[r - t, 'tabla.suma-en-vez'], [x + 1, 'tabla.vecino'], [x - 1, 'tabla.vecino'], [r, 'tabla.calculo']];
    tag = 'tabla.calculo';
    leccion = datosGrupos(x, t);
  } else if (op === '+') {
    [a, x] = par(az, ctx, '+');
    r = a + x;
    previstos = [[r, 'falta.da-el-total'], [x + 1, 'falta.calculo'], [x - 1, 'falta.calculo'], [x + 10, 'falta.calculo']];
    tag = 'falta.calculo';
    leccion = datosFalta(a, r);
  } else {
    // a − x = r  → lo que falta es a − r
    let b: number;
    [a, b] = par(az, ctx, '−');
    x = b;
    r = a - b;
    previstos = [[a, 'falta.da-el-total'], [x + 1, 'falta.calculo'], [x - 1, 'falta.calculo'], [x + 10, 'falta.calculo']];
    tag = 'falta.calculo';
    leccion = datosFalta(r, a);
  }
  // En las tablas, "__ × 5 = 20" se lee "¿cuántos grupos de 5 son 20?" (igual que 4 × 5 = 4 grupos de 5).
  const cuenta = op === '×' ? `__ × ${a} = ${r}` : `${a} ${op} __ = ${r}`;
  const { opciones, erroresPrevistos } = opcionesNumericas(az, x, previstos, tag, 4, 0);
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('cuenta-faltante', { op, a, x }),
    plantillaId: 'cuenta-faltante',
    tema: op === '+' ? 'sumas' : op === '−' ? 'restas' : 'tablas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: texto(az, 'cuenta-faltante', 'consigna'),
    cuenta,
    visual: op === '×' ? { tipo: 'grupos', objeto: 'estrella', grupos: Math.min(x, 10), porGrupo: a } : { tipo: 'recta', desde: Math.min(a, r), hasta: Math.max(a, r), marca: Math.min(a, r) },
    visualEsAyuda: true,
    respuesta: String(x),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: tag,
    leccion,
    explicacion: rellenar(texto(az, 'cuenta-faltante', 'explicacion'), { cuenta: cuenta.replace('__', String(x)) }),
    pista: texto(az, 'cuenta-faltante', 'pista', op),
    params: { op, a, x },
  };
};

/** "¿Está bien esta cuenta?": a veces está bien y a veces tiene un error típico. */
export const verdaderoFalso: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx);
  let a: number, b: number, real: number, falsa: number, tagFalsa: string, tagDefecto: string, leccion: Ejercicio['leccion'];
  if (op === '×') {
    const t = elegirTabla(az, ctx);
    a = az.entero(2, Math.max(2, ctx.rango));
    b = t;
    real = a * b;
    [falsa, tagFalsa] = az.chance(0.5) ? [a + b, 'tabla.suma-en-vez'] : [(a + 1) * b, 'tabla.vecino'];
    if (falsa === real) [falsa, tagFalsa] = [real + b, 'tabla.vecino'];
    tagDefecto = 'tabla.calculo';
    leccion = datosGrupos(a, b);
  } else if (op === '+') {
    [a, b] = par(az, ctx, '+');
    real = a + b;
    [falsa, tagFalsa] = hayLlevada(a, b) ? [sumaSinLlevar(a, b), 'suma.olvida-llevada'] : [real + az.elegir(real <= 20 ? [1, -1, 2] : [1, -1, 10]), real <= 20 ? 'suma.uno-mas-menos' : 'suma.calculo'];
    tagDefecto = real <= 20 ? 'suma.uno-mas-menos' : 'suma.calculo';
    leccion = datosSuma(a, b);
  } else {
    [a, b] = par(az, ctx, '−');
    real = a - b;
    [falsa, tagFalsa] = hayPrestamo(a, b) ? [restaInvertida(a, b), 'resta.invierte-columna'] : [Math.max(0, Math.min(a - 1, real + az.elegir(a <= 20 ? [1, -1, 2] : [1, -1, 10]))), a <= 20 ? 'resta.uno-mas-menos' : 'resta.calculo'];
    if (falsa < 0) falsa = real + 1;
    tagDefecto = a <= 20 ? 'resta.uno-mas-menos' : 'resta.calculo';
    leccion = datosResta(a, b);
  }
  const estaBien = az.chance(0.5);
  const mostrado = estaBien ? real : falsa;
  const si = texto(az, 'verdadero-falso', 'si');
  const no = texto(az, 'verdadero-falso', 'no');
  return {
    uid: uid('verdadero-falso', { op, a, b, mostrado }),
    plantillaId: 'verdadero-falso',
    tema: op === '+' ? 'sumas' : op === '−' ? 'restas' : 'tablas',
    modo: 'opciones',
    consigna: texto(az, 'verdadero-falso', 'consigna'),
    cuenta: `${a} ${op} ${b} = ${mostrado}`,
    respuesta: estaBien ? si : no,
    opciones: [
      { valor: si, errorTag: estaBien ? undefined : tagFalsa },
      { valor: no, errorTag: estaBien ? tagDefecto : undefined },
    ],
    errorTagPorDefecto: tagDefecto,
    leccion,
    explicacion: rellenar(texto(az, 'verdadero-falso', estaBien ? 'explicacionBien' : 'explicacionMal'), { cuenta: `${a} ${op} ${b}`, r: real, mostrado }),
    pista: texto(az, 'verdadero-falso', 'pista'),
    params: { op, a, b, mostrado },
  };
};

/** Memoria: unir cada cuenta con su resultado (sumas o restas). */
export const memoriaCuentas: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx) === '−' ? '−' : '+';
  const pares: { cuenta: string; resultado: string }[] = [];
  const usados = new Set<number>();
  let primero: [number, number] = [0, 0];
  for (let i = 0; pares.length < 4 && i < 60; i++) {
    const [a, b] = par(az, ctx, op);
    const r = op === '+' ? a + b : a - b;
    if (usados.has(r)) continue;
    usados.add(r);
    if (!pares.length) primero = [a, b];
    pares.push({ cuenta: `${a} ${op} ${b}`, resultado: String(r) });
  }
  // Si el modo del nivel deja pocas cuentas distintas (por ejemplo, todas dan 30), se completa con otras del mismo rango.
  const max = Math.max(10, ctx.rango);
  for (let i = 0; pares.length < 4 && i < 200; i++) {
    const a = op === '+' ? az.entero(1, max - 1) : az.entero(2, max);
    const b = op === '+' ? az.entero(1, Math.max(1, max - a)) : az.entero(1, a - 1);
    const r = op === '+' ? a + b : a - b;
    if (usados.has(r)) continue;
    usados.add(r);
    pares.push({ cuenta: `${a} ${op} ${b}`, resultado: String(r) });
  }
  const tag = op === '+' ? 'suma.calculo' : 'resta.calculo';
  return {
    uid: uid('memoria-cuentas', { p: pares.map((p) => p.cuenta).join('|') }),
    plantillaId: 'memoria-cuentas',
    tema: op === '+' ? 'sumas' : 'restas',
    modo: 'memoria',
    consigna: texto(az, 'memoria-cuentas', 'consigna'),
    respuesta: 'ok',
    datos: { memoria: pares },
    errorTagPorDefecto: tag,
    leccion: op === '+' ? datosSuma(...primero) : datosResta(...primero),
    explicacion: texto(az, 'memoria-cuentas', 'explicacion'),
    pista: texto(az, 'memoria-cuentas', 'pista'),
    params: { op, p: pares.map((p) => p.cuenta).join('|') },
  };
};

/** Dobles: 6 + 6, 25 + 25… una estrategia de cálculo mental. */
export const dobles: Generador = (az, ctx): Ejercicio => {
  const n = az.entero(2, Math.max(3, Math.floor(Math.max(10, ctx.rango) / 2)));
  const r = n * 2;
  const tag = r <= 20 ? 'suma.uno-mas-menos' : 'suma.calculo';
  const previstos: [number, string][] = [[r + 1, tag], [r - 1, tag], [n, 'suma.doble']];
  if (hayLlevada(n, n)) previstos.unshift([sumaSinLlevar(n, n), 'suma.olvida-llevada']);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tag, 4, 0);
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('dobles', { n }),
    plantillaId: 'dobles',
    tema: 'sumas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'dobles', 'consigna'), { n }),
    cuenta: `${n} + ${n} = ?`,
    visual: r <= 20 ? { tipo: 'escena', objeto: 'frutilla', cantidades: [n, n] } : { tipo: 'columnas', a: n, b: n, op: '+' },
    visualEsAyuda: ctx.caracter.ayudas !== 'siempre',
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: tag,
    leccion: datosSuma(n, n),
    explicacion: rellenar(texto(az, 'dobles', 'explicacion'), { n, r }),
    pista: texto(az, 'dobles', 'pista'),
    params: { n },
  };
};
