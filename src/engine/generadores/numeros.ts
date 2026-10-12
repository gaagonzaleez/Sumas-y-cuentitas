// Mundo 1: Isla de los Números.
import { config } from '../../content';
import { enLetras } from '../numerosEnLetras';
import type { Ejercicio } from '../tipos';
import {
  cdu,
  cifras,
  genero,
  plural,
  type Generador,
  mayuscula,
  objeto,
  opcionesNumericas,
  opcionesTexto,
  rellenar,
  texto,
  uid,
  usaTeclado,
  visualEsAyuda,
} from './comun';

const OBJETOS_CONTAR = ['manzana', 'estrella', 'flor', 'pez', 'caracol', 'globo', 'mariposa', 'frutilla'];

/** Datos de la lección de valor posicional para un número. */
export function datosValor(n: number): Record<string, string | number | boolean> {
  const [u, d = 0, c = 0] = cifras(n);
  const partes = [c ? c * 100 : 0, d ? d * 10 : 0, u].filter((x) => x > 0);
  return {
    n,
    c,
    d,
    u,
    ...cdu(c, d, u),
    tieneCentenas: n >= 100,
    descompuesto: partes.length > 1 ? partes.join(' + ') : String(n),
    letras: n <= 10000 ? enLetras(n) : String(n),
  };
}

function invertirCifras(n: number): number {
  return Number(String(n).split('').reverse().join(''));
}

function numeroEnRango(az: ReturnType<typeof import('../azar').crearAzar>, rango: number, min = 1): number {
  const bajo = Math.max(min, Math.floor(rango / 3));
  return az.entero(bajo, Math.max(bajo, rango));
}

export const contar: Generador = (az, ctx) => {
  const max = Math.min(ctx.rango, 20);
  const n = az.entero(Math.max(3, Math.floor(max / 2)), max);
  const obj = az.elegir(OBJETOS_CONTAR);
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    n,
    [
      [n + 1, 'contar.uno-mas-menos'],
      [n - 1, 'contar.uno-mas-menos'],
      [n + 2, 'contar.uno-mas-menos'],
    ],
    'contar.uno-mas-menos',
    4,
    1,
  );
  const vars = { objetos: objeto(obj), r: n, ...genero(obj) };
  return {
    uid: uid('contar', { n, obj }),
    plantillaId: 'contar',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'contar', 'consigna'), vars),
    visual: { tipo: 'objetos', objeto: obj, cantidad: n },
    respuesta: String(n),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'contar.uno-mas-menos',
    leccion: { r: n },
    explicacion: rellenar(texto(az, 'contar', 'explicacion'), vars),
    pista: texto(az, 'contar', 'pista'),
    params: { n, obj },
  };
};

export const leerNumero: Generador = (az, ctx) => {
  const d = config.dificultad.desafioDiezMil;
  const desafio = ctx.grado >= d.desdeGrado && az.chance(d.probabilidad);
  const n = desafio ? az.entero(1001, 9999) : numeroEnRango(az, ctx.rango, 10);
  const previstos: [number, string][] = [];
  const inv = invertirCifras(n);
  if (inv !== n && n % 10 !== 0) previstos.push([inv, 'numeros.invierte-cifras']);
  if (n >= 20 && n < 100 && n % 10 !== 0) previstos.push([Math.floor(n / 10) * 100 + (n % 10), 'numeros.escribe-separado']);
  if (n >= 100 && n < 1000 && n % 100 !== 0) previstos.push([Math.floor(n / 100) * 1000 + (n % 100), 'numeros.escribe-separado']);
  previstos.push([n + 10, 'numeros.cifra-cercana'], [n - 1, 'numeros.cifra-cercana']);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, n, previstos, 'numeros.cifra-cercana', 4, 0);
  const letras = enLetras(n);
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('leer-numero', { n }),
    plantillaId: 'leer-numero',
    tema: 'numeros',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'leer-numero', 'consigna'), { letras }),
    visual: n <= 999 ? { tipo: 'bloques', numero: n } : undefined,
    visualEsAyuda: true,
    respuesta: String(n),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'numeros.cifra-cercana',
    leccion: datosValor(n),
    explicacion: mayuscula(rellenar(texto(az, 'leer-numero', 'explicacion'), { letras, r: n.toLocaleString('es-AR') })),
    pista: texto(az, 'leer-numero', 'pista'),
    params: { n },
  };
};

export const numeroEnLetras: Generador = (az, ctx) => {
  const n = numeroEnRango(az, Math.min(ctx.rango, 1000), 11);
  const incorrectas: [string, string][] = [];
  const inv = invertirCifras(n);
  if (inv !== n && n % 10 !== 0 && inv <= 1000) incorrectas.push([enLetras(inv), 'numeros.invierte-cifras']);
  if (n >= 21 && n < 100 && n % 10 !== 0) {
    incorrectas.push([`${enLetras(Math.floor(n / 10))} ${enLetras(n % 10)}`, 'numeros.escribe-separado']);
  }
  for (const v of [n + 1, n - 1, n + 10, n - 10]) if (v > 0 && v <= 1000) incorrectas.push([enLetras(v), 'numeros.letras']);
  const letras = enLetras(n);
  return {
    uid: uid('numero-en-letras', { n }),
    plantillaId: 'numero-en-letras',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'numero-en-letras', 'consigna'), { n }),
    visual: { tipo: 'bloques', numero: n },
    visualEsAyuda: true,
    respuesta: letras,
    opciones: opcionesTexto(az, letras, incorrectas, 3),
    errorTagPorDefecto: 'numeros.letras',
    leccion: datosValor(n),
    explicacion: rellenar(texto(az, 'numero-en-letras', 'explicacion'), { n, r: letras }),
    pista: texto(az, 'numero-en-letras', 'pista'),
    params: { n },
  };
};

export const anteriorSiguiente: Generador = (az, ctx) => {
  const cual = az.chance(0.5) ? 'siguiente' : 'anterior';
  const max = Math.max(12, ctx.rango);
  let n: number;
  if (az.chance(0.35)) {
    // Casos de cambio de decena: 39 → 40, 40 → 39.
    const dec = az.entero(1, Math.max(1, Math.floor((max - 1) / 10))) * 10;
    n = cual === 'siguiente' ? dec - 1 : dec;
  } else {
    n = az.entero(2, max - 1);
  }
  const r = cual === 'siguiente' ? n + 1 : n - 1;
  const previstos: [number, string][] = [[cual === 'siguiente' ? n - 1 : n + 1, 'numeros.anterior-siguiente']];
  if (cual === 'siguiente' && n % 10 === 9) previstos.push([n - 9, 'numeros.cambio-decena']);
  if (cual === 'anterior' && n % 10 === 0) previstos.push([n + 9, 'numeros.cambio-decena']);
  previstos.push([r + (cual === 'siguiente' ? 1 : -1), 'numeros.anterior-siguiente']);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, 'numeros.anterior-siguiente', 4, 0);
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('anterior-siguiente', { n, cual }),
    plantillaId: 'anterior-siguiente',
    tema: 'numeros',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'anterior-siguiente', 'consigna', cual), { n }),
    visual: { tipo: 'recta', desde: Math.max(0, n - 3), hasta: n + 3, marca: n },
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'numeros.anterior-siguiente',
    leccion: { n, r, cual },
    explicacion: rellenar(texto(az, 'anterior-siguiente', 'explicacion', cual), { n, r }),
    pista: texto(az, 'anterior-siguiente', 'pista', cual),
    params: { n, cual },
  };
};

function frasesComparacion(a: number, b: number): string {
  const [mayor, menor] = a > b ? [a, b] : [b, a];
  const cm = cifras(mayor);
  const cn = cifras(menor);
  if (cm.length > cn.length) return `El ${mayor} tiene más cifras que el ${menor}.`;
  for (let i = cm.length - 1; i >= 0; i--) {
    if (cm[i] !== cn[i]) {
      const lugar = i === 2 ? 'centenas' : i === 1 ? 'decenas' : 'unidades';
      const sing = lugar === 'unidades' ? 'unidad' : lugar.slice(0, -1);
      return `${plural(cm[i], sing, lugar)} es más que ${plural(cn[i], sing, lugar)}.`;
    }
  }
  return `Los dos números son iguales.`;
}

export const comparar: Generador = (az, ctx) => {
  const variante = az.chance(0.5) ? 'mayor' : 'menor';
  const max = Math.max(20, ctx.rango);
  let a = az.entero(10, max);
  let b = az.entero(10, max);
  const iguales = az.chance(0.08);
  if (iguales) b = a;
  else {
    // A veces las unidades "engañan": 47 contra 52.
    if (az.chance(0.5) && a >= 20) {
      const da = Math.floor(a / 10);
      const db = Math.max(1, da - az.entero(1, 2));
      a = da * 10 + az.entero(0, 4);
      b = db * 10 + az.entero(5, 9);
    }
    while (b === a) b = az.entero(10, max);
  }
  const iguTexto = texto(az, 'comparar', 'iguales');
  const correcta = iguales ? iguTexto : String(variante === 'mayor' ? Math.max(a, b) : Math.min(a, b));
  const otro = variante === 'mayor' ? Math.min(a, b) : Math.max(a, b);
  const incorrectas: [string, string][] = [
    ...[String(a), String(b)].filter((x) => x !== correcta).map((x): [string, string] => [x, 'numeros.comparar']),
    ...(iguales ? [] : [[iguTexto, 'numeros.comparar'] as [string, string]]),
  ];
  const ops = az.mezclar([String(a), String(b)].filter((x, i, l) => l.indexOf(x) === i));
  const opciones = [...ops, iguTexto].map((v) => ({
    valor: v,
    errorTag: v === correcta ? undefined : incorrectas.find((x) => x[0] === v)?.[1] ?? 'numeros.comparar',
  }));
  return {
    uid: uid('comparar', { a, b, variante }),
    plantillaId: 'comparar',
    tema: 'numeros',
    modo: 'opciones',
    consigna: texto(az, 'comparar', 'consigna', variante),
    respuesta: correcta,
    opciones,
    errorTagPorDefecto: 'numeros.comparar',
    leccion: { mayor: Math.max(a, b), menor: Math.min(a, b), comparacion: frasesComparacion(a, b), a, b, r: correcta },
    explicacion: iguales
      ? `${a} y ${b} son iguales.`
      : rellenar(texto(az, 'comparar', 'explicacion', variante), { r: correcta, otro }),
    pista: texto(az, 'comparar', 'pista'),
    params: { a, b, variante },
  };
};

export const ordenar: Generador = (az, ctx) => {
  const max = Math.max(20, ctx.rango);
  const nums = new Set<number>();
  while (nums.size < 4) nums.add(az.entero(1, max));
  const lista = [...nums];
  const orden = [...lista].sort((x, y) => x - y);
  const [menor, , , mayor] = orden;
  return {
    uid: uid('ordenar', { l: orden.join('-') }),
    plantillaId: 'ordenar',
    tema: 'numeros',
    modo: 'ordenar',
    consigna: texto(az, 'ordenar', 'consigna'),
    respuesta: orden.join(','),
    datos: { ordenar: az.mezclar(lista) },
    errorTagPorDefecto: 'numeros.ordenar',
    leccion: { mayor, menor, comparacion: frasesComparacion(mayor, menor), r: orden.join(', ') },
    explicacion: rellenar(texto(az, 'ordenar', 'explicacion'), { r: orden.join(', ') }),
    pista: texto(az, 'ordenar', 'pista'),
    params: { l: orden.join('-') },
  };
};

export const familia: Generador = (az, ctx) => {
  const max = Math.min(99, Math.max(19, ctx.rango));
  const n = az.entero(10, max);
  const [u, d] = cifras(n);
  const f = d * 10;
  const op = (x: number) => rellenar(texto(az, 'familia', 'opcion'), { f: x });
  const incorrectas: [string, string][] = [];
  if (u !== d && u !== 0) incorrectas.push([op(u * 10), 'numeros.familia']);
  if (d < 9) incorrectas.push([op(f + 10), 'numeros.familia']);
  if (d > 1) incorrectas.push([op(f - 10), 'numeros.familia']);
  if (d < 8) incorrectas.push([op(f + 20), 'numeros.familia']);
  return {
    uid: uid('familia', { n }),
    plantillaId: 'familia',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'familia', 'consigna'), { n }),
    visual: { tipo: 'bloques', numero: n },
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: op(f),
    opciones: opcionesTexto(az, op(f), incorrectas, 3),
    errorTagPorDefecto: 'numeros.familia',
    leccion: datosValor(n),
    explicacion: rellenar(texto(az, 'familia', 'explicacion'), { n, r: f }),
    pista: texto(az, 'familia', 'pista'),
    params: { n },
  };
};

export const descomponer: Generador = (az, ctx) => {
  const conCentenas = ctx.rango >= 100 && (ctx.params.minimo as number) >= 100;
  const n = conCentenas ? az.entero(101, Math.min(999, ctx.rango)) : az.entero(11, Math.min(99, Math.max(20, ctx.rango)));
  const [u, d, c = 0] = cifras(n);
  const t = (cc: number, dd: number, uu: number) =>
    rellenar(texto(az, 'descomponer', conCentenas ? 'opcionCentenas' : 'opcion'), cdu(cc, dd, uu));
  const correcta = t(c, d, u);
  const incorrectas: [string, string][] = [];
  if (conCentenas) {
    incorrectas.push([t(u, d, c), 'valor.posicion'], [t(d, c, u), 'valor.posicion'], [t(c, u, d), 'valor.invierte']);
  } else {
    incorrectas.push([t(0, u, d), 'valor.invierte']);
  }
  incorrectas.push([t(c, d + 1, u), 'valor.posicion'], [t(c, Math.max(0, d - 1), u), 'valor.posicion'], [t(c, d, (u + 1) % 10), 'valor.posicion']);
  return {
    uid: uid('descomponer', { n }),
    plantillaId: 'descomponer',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'descomponer', conCentenas ? 'consignaCentenas' : 'consigna'), { n }),
    visual: { tipo: 'bloques', numero: n },
    visualEsAyuda: visualEsAyuda(az, ctx),
    respuesta: correcta,
    opciones: opcionesTexto(az, correcta, incorrectas, 3),
    errorTagPorDefecto: 'valor.posicion',
    leccion: datosValor(n),
    explicacion: rellenar(texto(az, 'descomponer', 'explicacion'), { n, texto: correcta }),
    pista: texto(az, 'descomponer', 'pista'),
    params: { n },
  };
};

export const armarBloques: Generador = (az, ctx) => {
  const min = Math.max(11, (ctx.params.minimo as number) ?? 0);
  const n = az.entero(Math.min(min, 999), Math.max(min, Math.min(999, ctx.rango)));
  const [u, d, c = 0] = cifras(n);
  const previstos: Record<string, string> = {};
  if (u !== d) previstos[String(c * 100 + u * 10 + d)] = 'valor.invierte';
  if (c && c !== d) previstos[String(d * 100 + c * 10 + u)] = 'valor.posicion';
  return {
    uid: uid('armar-bloques', { n }),
    plantillaId: 'armar-bloques',
    tema: 'numeros',
    modo: 'bloques',
    consigna: rellenar(texto(az, 'armar-bloques', 'consigna'), { n }),
    respuesta: String(n),
    datos: { bloques: { numero: n } },
    erroresPrevistos: previstos,
    errorTagPorDefecto: 'valor.posicion',
    leccion: datosValor(n),
    explicacion: rellenar(texto(az, 'armar-bloques', 'explicacion'), { n }),
    pista: texto(az, 'armar-bloques', 'pista'),
    params: { n },
  };
};

export const centenas: Generador = (az, ctx) => {
  const n = az.entero(101, Math.max(120, Math.min(999, ctx.rango)));
  const [u, d, c] = cifras(n);
  const variante = az.elegir(['c', 'd', 'u', 'cien', 'cien'] as const);
  let ej: Pick<Ejercicio, 'respuesta' | 'opciones' | 'erroresPrevistos'>;
  if (variante === 'cien') {
    const { opciones, erroresPrevistos } = opcionesNumericas(
      az,
      n,
      [
        [u * 100 + d * 10 + c, 'valor.posicion'],
        [c * 100 + u * 10 + d, 'valor.invierte'],
        [d * 100 + c * 10 + u, 'valor.posicion'],
        [c * 10 + d + u, 'valor.posicion'],
      ],
      'valor.posicion',
      4,
      0,
    );
    ej = { respuesta: String(n), opciones, erroresPrevistos };
  } else {
    const r = { c, d, u }[variante];
    const otros = [c, d, u].filter((x) => x !== r);
    const { opciones, erroresPrevistos } = opcionesNumericas(
      az,
      r,
      otros.map((x): [number, string] => [x, 'valor.posicion']),
      'valor.posicion',
      4,
      0,
    );
    ej = { respuesta: String(r), opciones, erroresPrevistos };
  }
  return {
    uid: uid('centenas', { n, variante }),
    plantillaId: 'centenas',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'centenas', 'consigna', variante), { n, ...cdu(c, d, u) }),
    visual: { tipo: 'bloques', numero: n },
    visualEsAyuda: visualEsAyuda(az, ctx),
    ...ej,
    errorTagPorDefecto: 'valor.posicion',
    leccion: datosValor(n),
    explicacion: rellenar(texto(az, 'centenas', 'explicacion'), { n, ...cdu(c, d, u) }),
    pista: texto(az, 'centenas', 'pista'),
    params: { n, variante },
  };
};
