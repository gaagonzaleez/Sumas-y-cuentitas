// Mundos 2 y 3: Valle de las Sumas y Montaña de las Restas.
import type { Azar } from '../azar';
import type { Contexto, Ejercicio, Visual } from '../tipos';
import { cifras, type Generador, opcionesNumericas, opcionesTexto, rellenar, texto, uid, usaTeclado, visualEsAyuda } from './comun';
import { problemaConNumeros } from './problemas';

type ModoSuma = 'hasta' | 'decenas' | 'sin-llevar' | 'llevando' | 'tres' | 'cualquiera';
type ModoResta = 'hasta' | 'decenas' | 'sin-prestamo' | 'prestando' | 'cualquiera';

/** Suma "olvidando" las llevadas: cada columna se queda con su última cifra (salvo la primera de la izquierda). */
export function sumaSinLlevar(a: number, b: number): number {
  const ca = cifras(a);
  const cb = cifras(b);
  const largo = Math.max(ca.length, cb.length);
  let r = 0;
  for (let i = 0; i < largo; i++) {
    const s = (ca[i] ?? 0) + (cb[i] ?? 0);
    r += (i === largo - 1 ? s : s % 10) * 10 ** i;
  }
  return r;
}

/** Resta "dando vuelta" cada columna: resta la cifra chica de la grande. */
export function restaInvertida(a: number, b: number): number {
  const ca = cifras(a);
  const cb = cifras(b);
  let r = 0;
  for (let i = 0; i < ca.length; i++) r += Math.abs(ca[i] - (cb[i] ?? 0)) * 10 ** i;
  return r;
}

/** Resta pidiendo prestado en las unidades pero sin descontar la decena prestada. */
export function restaOlvidaPrestamo(a: number, b: number): number {
  const ca = cifras(a);
  const cb = cifras(b);
  let r = 0;
  for (let i = 0; i < ca.length; i++) {
    const x = ca[i];
    const y = cb[i] ?? 0;
    r += (x >= y ? x - y : x + 10 - y) * 10 ** i;
  }
  return r;
}

export function hayLlevada(a: number, b: number): boolean {
  return sumaSinLlevar(a, b) !== a + b;
}

export function hayPrestamo(a: number, b: number): boolean {
  const ca = cifras(a);
  const cb = cifras(b);
  return cb.some((y, i) => y > (ca[i] ?? 0));
}

function sinLlevarPar(az: Azar, max: number): [number, number] {
  for (let i = 0; i < 200; i++) {
    const a = az.entero(10, max - 10);
    const b = az.entero(10, max - a);
    if (b >= 1 && !hayLlevada(a, b)) return [a, b];
  }
  return [12, 13];
}

function llevandoPar(az: Azar, max: number): [number, number] {
  for (let i = 0; i < 200; i++) {
    const a = az.entero(11, max - 11);
    const b = az.entero(11, max - a);
    if (b >= 1 && a % 10 + (b % 10) >= 10) return [a, b];
  }
  return [17, 15];
}

/** Datos para la lección de columnas (suma). */
export function datosSuma(a: number, b: number, c?: number) {
  const r = a + b + (c ?? 0);
  const u1 = a % 10;
  const u2 = b % 10;
  const su = u1 + u2;
  const d1 = Math.floor(a / 10) % 10;
  const d2 = Math.floor(b / 10) % 10;
  const llevada = su >= 10;
  return {
    a, b, c: c ?? 0, r, u1, u2, su, ru: su % 10, d1, d2,
    sd: d1 + d2 + (llevada ? 1 : 0),
    llevada,
    ab: a + b,
    mayor: Math.max(a, b),
    menor: Math.min(a, b),
    signo: '+',
    signoNombre: 'más',
    signoExplica: 'Sumar es juntar: el resultado es más grande.',
  };
}

export function datosResta(a: number, b: number) {
  const r = a - b;
  const u1 = a % 10;
  const u2 = b % 10;
  const d1 = Math.floor(a / 10) % 10;
  const d2 = Math.floor(b / 10) % 10;
  const prestamo = u1 < u2;
  return {
    a, b, r, u1, u2,
    ru: prestamo ? u1 + 10 - u2 : u1 - u2,
    u1p: u1 + 10,
    d1, d2,
    d1m: d1 - 1,
    rd: Math.floor(r / 10) % 10,
    prestamo,
    signo: '−',
    signoNombre: 'menos',
    signoExplica: 'Restar es quitar: el resultado es más chico.',
  };
}

function visualSuma(a: number, b: number, c?: number): Visual {
  if (a + b + (c ?? 0) <= 20) return { tipo: 'escena', objeto: 'manzana', cantidades: c ? [a, b, c] : [a, b] };
  return { tipo: 'columnas', a, b, c, op: '+' };
}

function visualResta(a: number, b: number): Visual {
  if (a <= 20) return { tipo: 'escena', objeto: 'galletita', cantidades: [a - b, b], nombre: 'quitar' };
  return { tipo: 'columnas', a, b, op: '−' };
}

function armarSuma(az: Azar, ctx: Contexto, modo: ModoSuma): Ejercicio {
  const max = Math.max(10, ctx.rango);
  const llevadaForzada = ctx.caracter.llevadaForzada && max >= 30;
  const tres = modo === 'tres' || (ctx.caracter.tresTerminos && (modo === 'cualquiera' || modo === 'hasta') && az.chance(0.4));
  let a: number;
  let b: number;
  let c: number | undefined;
  if (tres) {
    a = az.entero(1, Math.max(1, Math.floor(max / 3)));
    b = az.entero(1, Math.max(1, Math.floor(max / 3)));
    c = az.entero(1, Math.max(1, max - a - b));
  } else if (modo === 'decenas') {
    const paso = max > 100 && az.chance(0.5) ? 100 : 10;
    const tope = Math.max(max, paso === 10 ? 50 : 300);
    a = az.entero(1, Math.max(1, Math.floor(tope / paso) - 1)) * paso;
    b = az.entero(1, Math.max(1, Math.floor((tope - a) / paso))) * paso;
  } else if (modo === 'sin-llevar') {
    [a, b] = sinLlevarPar(az, Math.max(30, max));
  } else if (modo === 'llevando' || (llevadaForzada && az.chance(0.7))) {
    [a, b] = llevandoPar(az, Math.max(30, max));
  } else {
    a = az.entero(1, max - 1);
    b = az.entero(1, Math.max(1, max - a));
  }
  if (!tres && ctx.caracter.problemas > 0 && a + b <= 1000 && az.chance(ctx.caracter.problemas)) {
    return problemaConNumeros(az, ctx, '+', a, b);
  }
  const r = a + b + (c ?? 0);
  const previstos: [number, string][] = [];
  const chica = r <= 20;
  if (c !== undefined) {
    previstos.push([a + b, 'suma.olvida-sumando'], [a + c, 'suma.olvida-sumando'], [b + c, 'suma.olvida-sumando']);
  } else {
    if (hayLlevada(a, b)) previstos.push([sumaSinLlevar(a, b), 'suma.olvida-llevada']);
    if (a !== b) previstos.push([Math.abs(a - b), 'suma.resta-en-vez']);
  }
  const tagCerca = c !== undefined ? 'suma.tres-calculo' : chica ? 'suma.uno-mas-menos' : 'suma.calculo';
  previstos.push([r + 1, tagCerca], [r - 1, tagCerca]);
  if (r >= 20 && c === undefined) previstos.push([r + 10, 'suma.decenas'], [r - 10, 'suma.decenas']);
  const tagDefecto = c !== undefined ? 'suma.tres-calculo' : chica ? 'suma.uno-mas-menos' : 'suma.calculo';
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tagDefecto, 4, 0);
  const cuenta = c !== undefined ? `${a} + ${b} + ${c}` : `${a} + ${b}`;
  const teclado = usaTeclado(az, ctx);
  const pistaVar = c !== undefined ? 'tres' : hayLlevada(a, b) ? 'llevada' : chica ? 'chica' : 'simple';
  return {
    uid: uid('suma', { a, b, c: c ?? '' }),
    plantillaId: 'suma',
    tema: 'sumas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'suma', 'consigna'), { cuenta }),
    cuenta: `${cuenta} = ?`,
    visual: visualSuma(a, b, c),
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: tagDefecto,
    leccion: datosSuma(a, b, c),
    explicacion: rellenar(texto(az, 'suma', 'explicacion'), { cuenta, r }),
    pista: texto(az, 'suma', 'pista', pistaVar),
    params: { modo, a, b, ...(c !== undefined ? { c } : {}) },
  };
}

function armarResta(az: Azar, ctx: Contexto, modo: ModoResta): Ejercicio {
  const max = Math.max(10, ctx.rango);
  let a: number;
  let b: number;
  const prestamoForzado = ctx.caracter.llevadaForzada && max >= 30;
  if (modo === 'decenas') {
    const paso = max > 100 && az.chance(0.5) ? 100 : 10;
    const tope = Math.max(max, paso === 10 ? 50 : 300);
    a = az.entero(2, Math.max(2, Math.floor(tope / paso))) * paso;
    b = az.entero(1, a / paso - 1) * paso;
  } else if (modo === 'sin-prestamo' || modo === 'prestando' || (prestamoForzado && az.chance(0.7))) {
    const quiere = modo !== 'sin-prestamo';
    const tope = Math.max(30, max);
    a = 21;
    b = 10;
    for (let i = 0; i < 300; i++) {
      const x = az.entero(20, tope);
      const y = az.entero(10, x - 1);
      if (hayPrestamo(x, y) === quiere && y % 10 !== 0) {
        a = x;
        b = y;
        break;
      }
    }
  } else {
    a = az.entero(2, max);
    b = az.entero(1, a - 1);
  }
  if (ctx.caracter.problemas > 0 && az.chance(ctx.caracter.problemas)) {
    return problemaConNumeros(az, ctx, '−', a, b);
  }
  const r = a - b;
  const previstos: [number, string][] = [];
  if (hayPrestamo(a, b)) {
    previstos.push([restaInvertida(a, b), 'resta.invierte-columna'], [restaOlvidaPrestamo(a, b), 'resta.olvida-prestamo']);
  }
  const chica = a <= 20;
  const tagCerca = chica ? 'resta.uno-mas-menos' : 'resta.calculo';
  if (a + b <= 2000) previstos.push([a + b, 'resta.suma-en-vez']);
  previstos.push([r + 1, tagCerca], [r - 1, tagCerca]);
  if (r >= 20) previstos.push([r + 10, 'resta.calculo'], [r - 10, 'resta.calculo']);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tagCerca, 4, 0);
  const cuenta = `${a} − ${b}`;
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('resta', { a, b }),
    plantillaId: 'resta',
    tema: 'restas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'resta', 'consigna'), { cuenta }),
    cuenta: `${cuenta} = ?`,
    visual: visualResta(a, b),
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: tagCerca,
    leccion: datosResta(a, b),
    explicacion: rellenar(texto(az, 'resta', 'explicacion'), { cuenta, r }),
    pista: texto(az, 'resta', 'pista', hayPrestamo(a, b) ? 'prestamo' : chica ? 'chica' : 'simple'),
    params: { modo, a, b },
  };
}

export const suma: Generador = (az, ctx) => armarSuma(az, ctx, ((ctx.params.modo as ModoSuma) ?? 'cualquiera'));
export const resta: Generador = (az, ctx) => armarResta(az, ctx, ((ctx.params.modo as ModoResta) ?? 'cualquiera'));

export const cuantoFalta: Generador = (az, ctx) => {
  const max = Math.max(10, ctx.rango);
  const metas = [10, 20, 50, 100, 200, 500, 1000].filter((m) => m <= max);
  const meta = metas.length ? az.elegir(metas) : 10;
  const a = az.entero(1, meta - 1);
  const r = meta - a;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [meta, 'falta.da-el-total'],
      [meta + a, 'falta.da-el-total'],
      [r + 1, 'falta.calculo'],
      [r - 1, 'falta.calculo'],
      [r + 10, 'falta.calculo'],
    ],
    'falta.calculo',
    4,
    0,
  );
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('cuanto-falta', { a, meta }),
    plantillaId: 'cuanto-falta',
    tema: 'restas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'cuanto-falta', 'consigna'), { a, meta }),
    cuenta: `${a} + ? = ${meta}`,
    visual: { tipo: 'recta', desde: a, hasta: meta, marca: a },
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'falta.calculo',
    leccion: { a, meta, r },
    explicacion: rellenar(texto(az, 'cuanto-falta', 'explicacion'), { a, meta, r }),
    pista: rellenar(texto(az, 'cuanto-falta', 'pista'), { a, meta }),
    params: { a, meta },
  };
};

export const cuentaInversa: Generador = (az, ctx) => {
  const max = Math.max(20, ctx.rango);
  const a = az.entero(10, max);
  const b = az.entero(1, a - 1);
  const r = a - b;
  const correcta = `${r} + ${b}`;
  const opciones = opcionesTexto(
    az,
    correcta,
    [
      [`${r} − ${b}`, 'inversa.operacion'],
      [`${a} + ${b}`, 'inversa.operacion'],
      [`${a} + ${r}`, 'inversa.operacion'],
    ],
    4,
  );
  return {
    uid: uid('cuenta-inversa', { a, b }),
    plantillaId: 'cuenta-inversa',
    tema: 'restas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'cuenta-inversa', 'consigna'), { a, b, r }),
    respuesta: correcta,
    opciones,
    errorTagPorDefecto: 'inversa.operacion',
    leccion: { a, b, r },
    explicacion: rellenar(texto(az, 'cuenta-inversa', 'explicacion'), { a, opcion: correcta }),
    pista: texto(az, 'cuenta-inversa', 'pista'),
    params: { a, b },
  };
};
