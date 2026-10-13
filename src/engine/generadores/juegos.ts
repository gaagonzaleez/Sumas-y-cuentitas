// Juegos inspirados en los que se usan en el aula y en casa (guerra de cartas, escoba, lotería,
// dados, balanza, pirámide, adivinanzas) y en educación financiera para chicos (¿me alcanza?,
// el carrito del súper, la alcancía, cobrar por un trabajo). Todo el arte y los textos son propios.
import { FINANZAS, HISTORIAS, NOMBRES, PLANTILLAS, PRODUCTOS } from '../../content';
import type { Azar } from '../azar';
import { datosFalta } from '../explicar';
import { enLetras } from '../numerosEnLetras';
import type { Contexto, Ejercicio } from '../tipos';
import {
  cifras,
  descomponerPlata,
  dosNombres,
  type Generador,
  genero,
  mayuscula,
  objeto,
  opcionesNumericas,
  opcionesTexto,
  rellenar,
  texto,
  uid,
} from './comun';
import { datosComparar, datosValor } from './numeros';
import { numerosPara, rangoHistoria } from './problemas';
import { datosResta, datosSuma, par } from './sumasRestas';
import { datosGrupos, elegirTabla } from './tablas';
import { VALORES_PLATA } from './dinero';

type Op = '+' | '−' | '×' | 'num' | '$';
const opDe = (ctx: Contexto, def: Op): Op => (ctx.params.op as Op) ?? def;
const max = (ctx: Contexto, min = 10) => Math.max(min, ctx.rango);

function sinArticulo(nombre: string): string {
  return nombre.replace(/^(el|la|los|las) /, '');
}

/** Precio redondo dentro de un rango (igual criterio que en el Mercado). */
function precio(az: Azar, min: number, tope: number): number {
  const p = az.entero(Math.max(1, min), Math.max(min, tope));
  if (p > 300) return Math.max(10, Math.round(p / 50) * 50);
  if (p > 100) return Math.max(10, Math.round(p / 10) * 10);
  return p;
}

function productosCon(az: Azar, cantidad: number, tope: number) {
  return az.mezclar(PRODUCTOS.productos).slice(0, cantidad).map((p) => ({ ...p, precio: precio(az, Math.min(p.min, tope), Math.min(p.max, tope)) }));
}

function listaTexto(nombres: string[]): string {
  return nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Guerra de cartas: cada una da vuelta cartas; gana el resultado más alto.
export const guerraCartas: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx, 'num');
  const [rival] = az.mezclar(NOMBRES);
  const tope = op === '×' ? 10 : op === '$' ? 0 : op === 'num' ? max(ctx, 20) : Math.max(10, Math.floor(max(ctx) / 2));
  const carta = () => (op === 'num' ? az.entero(1, tope) : az.entero(1, Math.max(2, tope)));
  const valorDe = (c: number[]) =>
    op === '+' ? c[0] + c[1] : op === '−' ? Math.abs(c[0] - c[1]) : op === '×' ? c[0] * c[1] : op === '$' ? c.reduce((a, b) => a + b, 0) : c[0];
  const mano = (): number[] => {
    if (op === '$') {
      const piezas = VALORES_PLATA.filter((v) => v <= Math.max(10, ctx.rango));
      return Array.from({ length: az.entero(2, 3) }, () => az.elegir(piezas)).sort((a, b) => b - a);
    }
    // Tablas: una carta es siempre de la tabla del nivel.
    if (op === '×') return az.mezclar([az.entero(1, Math.min(10, Math.max(3, ctx.rango))), elegirTabla(az, ctx)]);
    // Sumas y restas: respetan el tema del nivel (decenas, sin llevar, llevando…).
    if (op === '+' || op === '−') return par(az, ctx, op);
    return [carta()];
  };
  let mia = mano();
  let suya = mano();
  // Empates solo a veces (son menos divertidos).
  for (let i = 0; i < 10 && valorDe(mia) === valorDe(suya) && !az.chance(0.1); i++) suya = mano();
  if (op === 'num' && az.chance(0.4) && mia[0] > 10 && suya[0] > 10) {
    // Números que "engañan": 29 contra 31.
    const d = az.entero(1, Math.max(1, Math.floor(tope / 10) - 1));
    mia = [d * 10 + az.entero(6, 9)];
    suya = [(d + 1) * 10 + az.entero(0, 3)];
    if (az.chance(0.5)) [mia, suya] = [suya, mia];
  }
  const a = valorDe(mia);
  const b = valorDe(suya);
  const vos = texto(az, 'guerra-cartas', 'vos');
  const empate = texto(az, 'guerra-cartas', 'empate');
  const correcta = a > b ? vos : b > a ? rival : empate;
  const detalle = (nombre: string, c: number[], v: number) =>
    op === 'num' ? `${nombre}: ${v}.` : op === '$' ? `${nombre}: ${c.join(' + ')} = ${v}.` : `${nombre}: ${c[0]} ${op === '−' ? '−' : op} ${c[1]} = ${v}.`.replace(`${c[0]} − ${c[1]}`, `${Math.max(...c)} − ${Math.min(...c)}`);
  const tag = op === 'num' ? 'numeros.comparar' : op === '+' ? 'suma.calculo' : op === '−' ? 'resta.calculo' : op === '×' ? 'tabla.calculo' : 'dinero.contar';
  const leccion =
    op === '+' ? datosSuma(mia[0], mia[1]) : op === '−' ? datosResta(Math.max(...mia), Math.min(...mia)) : op === '×' ? datosGrupos(mia[0], mia[1]) : op === '$' ? { r: a, sumaTexto: mia.join(' + ') } : { ...datosComparar(a, b), a, b, r: Math.max(a, b) };
  return {
    uid: uid('guerra-cartas', { op, m: mia.join('-'), s: suya.join('-') }),
    plantillaId: 'guerra-cartas',
    tema: op === 'num' ? 'numeros' : op === '+' ? 'sumas' : op === '−' ? 'restas' : op === '×' ? 'tablas' : 'dinero',
    modo: 'opciones',
    consigna: texto(az, 'guerra-cartas', 'consigna', op),
    visual: op === '$' ? { tipo: 'cartas', manos: [{ nombre: vos, cartas: mia.map((x) => -x) }, { nombre: rival, cartas: suya.map((x) => -x) }] } : { tipo: 'cartas', manos: [{ nombre: vos, cartas: mia }, { nombre: rival, cartas: suya }] },
    respuesta: correcta,
    opciones: [vos, rival, empate].map((v) => ({ valor: v, errorTag: v === correcta ? undefined : tag })),
    errorTagPorDefecto: tag,
    leccion,
    explicacion: rellenar(texto(az, 'guerra-cartas', correcta === empate ? 'explicacionEmpate' : 'explicacion'), {
      detalle: `${detalle(vos, mia, a)} ${detalle(rival, suya, b)}`,
      cierre: correcta === vos ? texto(az, 'guerra-cartas', 'cierreVos') : rellenar(texto(az, 'guerra-cartas', 'cierreRival'), { ganador: rival }),
    }),
    pista: texto(az, 'guerra-cartas', 'pista', op),
    params: { op, m: mia.join('-'), s: suya.join('-') },
  };
};

// ---------------------------------------------------------------------------
// Escoba: tocar las cartas (o monedas) que suman justo el objetivo.
export const escoba: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx, '+');
  let objetivo: number;
  let solucion: number[];
  let resto: number[];
  if (op === '$') {
    objetivo = precio(az, 5, Math.min(max(ctx), 500));
    solucion = descomponerPlata(objetivo, VALORES_PLATA);
    resto = Array.from({ length: Math.max(2, 6 - solucion.length) }, () => az.elegir(VALORES_PLATA.filter((v) => v <= objetivo)));
  } else if (op === 'num') {
    // Formar un número con cartas de centenas, decenas y unidades: 300 + 40 + 7.
    // Siempre con por lo menos dos cartas: nada de números redondos.
    do objetivo = az.entero(11, Math.max(20, Math.min(999, ctx.rango)));
    while (objetivo % 10 === 0);
    const [u, d, c = 0] = cifras(objetivo);
    solucion = [c * 100, d * 10, u].filter((x) => x > 0);
    resto = [u * 10, d, (d + 1) * 10, c ? c : u + 1].filter((x) => x > 0 && !solucion.includes(x)).slice(0, 3);
  } else {
    const opciones = [10, 15, 20, 50, 100, 200, 500, 1000].filter((x) => x <= Math.max(10, ctx.rango));
    objetivo = az.elegir(opciones.length ? opciones : [10]);
    const partes = az.chance(0.5) ? 2 : 3;
    solucion = [];
    let falta = objetivo;
    for (let i = 0; i < partes - 1; i++) {
      const paso = objetivo > 50 ? 5 : 1;
      const v = Math.max(paso, Math.round(az.entero(1, Math.max(1, falta - paso * (partes - 1 - i))) / paso) * paso);
      if (v >= falta) break;
      solucion.push(v);
      falta -= v;
    }
    solucion.push(falta);
    resto = Array.from({ length: 6 - solucion.length }, () => az.entero(1, Math.max(2, Math.floor(objetivo * 0.8))));
  }
  const valores = az.mezclar([...solucion, ...resto]);
  const items = valores.map((v, i) => ({ id: `c${i}`, valor: v, texto: op === '$' ? `$${v}` : String(v), dibujo: op === '$' ? `plata-${v}` : undefined }));
  const cuenta = `${solucion.join(' + ')}`;
  const tagMas = op === '$' ? 'dinero.se-pasa' : op === 'num' ? 'valor.posicion' : 'suma.calculo';
  const tagMenos = op === '$' ? 'dinero.falta' : op === 'num' ? 'valor.posicion' : 'suma.calculo';
  return {
    uid: uid('escoba', { op, objetivo, v: valores.join('-') }),
    plantillaId: 'escoba',
    tema: op === '$' ? 'dinero' : op === 'num' ? 'numeros' : 'sumas',
    modo: 'elegir',
    consigna: rellenar(texto(az, 'escoba', 'consigna', op), { objetivo }),
    respuesta: 'ok',
    datos: { elegir: { items, regla: 'suma', objetivo, estilo: op === '$' ? 'plata' : 'cartas' } },
    erroresPrevistos: { 'se-pasa': tagMas, falta: tagMenos },
    errorTagPorDefecto: tagMenos,
    leccion:
      op === '$' ? { precio: objetivo, sumaTexto: cuenta } : op === 'num' ? datosValor(objetivo) : solucion.length === 2 ? datosSuma(solucion[0], solucion[1]) : datosSuma(solucion[0], solucion[1], solucion[2]),
    explicacion: rellenar(texto(az, 'escoba', solucion.length === 1 ? 'explicacionUna' : 'explicacion'), { cuenta, objetivo }),
    pista: texto(az, 'escoba', 'pista', op),
    params: { op, objetivo, v: valores.join('-') },
  };
};

// ---------------------------------------------------------------------------
// Lotería: sale un número (o una cuenta) y hay que encontrarlo en el cartón de 9.
export const loteria: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx, 'num');
  let r: number;
  let cuenta = '';
  let tag = 'numeros.cifra-cercana';
  let leccion: Ejercicio['leccion'];
  const previstos: [number, string][] = [];
  if (op === '+' || op === '−') {
    const [a, b] = par(az, ctx, op);
    r = op === '+' ? a + b : a - b;
    cuenta = `${a} ${op} ${b}`;
    tag = op === '+' ? 'suma.calculo' : 'resta.calculo';
    previstos.push([op === '+' ? Math.abs(a - b) : a + b, op === '+' ? 'suma.resta-en-vez' : 'resta.suma-en-vez']);
    leccion = op === '+' ? datosSuma(a, b) : datosResta(a, b);
  } else if (op === '×') {
    const t = elegirTabla(az, ctx);
    const k = az.entero(2, Math.max(2, Math.min(10, ctx.rango)));
    r = k * t;
    cuenta = `${k} × ${t}`;
    tag = 'tabla.calculo';
    previstos.push([k + t, 'tabla.suma-en-vez'], [(k + 1) * t, 'tabla.vecino'], [(k - 1) * t, 'tabla.vecino']);
    leccion = datosGrupos(k, t);
  } else {
    r = az.entero(10, Math.max(20, Math.min(999, ctx.rango)));
    const inv = Number(String(r).split('').reverse().join(''));
    if (inv !== r && r % 10) previstos.push([inv, 'numeros.invierte-cifras']);
    leccion = datosValor(r);
  }
  // Cartón de 9 números distintos y cercanos (para que haya que leer bien).
  for (const s of [1, -1, 10, -10, 2, -2, 11, -11, 20, 5, -5, 3]) previstos.push([r + s, tag]);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tag, 9, 0);
  return {
    uid: uid('loteria', { op, r, cuenta }),
    plantillaId: 'loteria',
    tema: op === 'num' ? 'numeros' : op === '+' ? 'sumas' : op === '−' ? 'restas' : 'tablas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'loteria', 'consigna', op === 'num' ? 'num' : 'op'), { letras: enLetras(r), cuenta }),
    cuenta: cuenta ? `${cuenta} = ?` : undefined,
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: tag,
    leccion,
    explicacion: rellenar(texto(az, 'loteria', 'explicacion'), { r }),
    pista: texto(az, 'loteria', 'pista', op === 'num' ? 'num' : 'op'),
    params: { op, r, cuenta },
  };
};

// ---------------------------------------------------------------------------
// Dados: sumar los puntos, contar grupos iguales o ver la diferencia.
export const dados: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx, '+');
  let valores: number[];
  let r: number;
  let cuenta: string;
  let leccion: Ejercicio['leccion'];
  let previstos: [number, string][];
  let tag: string;
  if (op === '×') {
    const g = az.entero(2, Math.min(6, Math.max(2, ctx.rango)));
    const p = az.entero(1, 6);
    valores = Array.from({ length: g }, () => p);
    r = g * p;
    cuenta = `${g} × ${p}`;
    leccion = datosGrupos(g, p);
    tag = 'tabla.calculo';
    previstos = [[g + p, 'tabla.suma-en-vez'], [(g + 1) * p, 'grupos.cuenta-uno'], [(g - 1) * p, 'grupos.cuenta-uno']];
  } else if (op === '−') {
    // Sin empates: siempre hay un dado con más puntos.
    const alto = az.entero(2, 6);
    valores = az.mezclar([alto, az.entero(1, alto - 1)]);
    const [a, b] = [Math.max(...valores), Math.min(...valores)];
    r = a - b;
    cuenta = `${a} − ${b}`;
    leccion = datosResta(a, b);
    tag = 'resta.uno-mas-menos';
    previstos = [[a + b, 'resta.suma-en-vez'], [r + 1, tag]];
  } else {
    const n = ctx.rango >= 15 ? 3 : 2;
    valores = Array.from({ length: n }, () => az.entero(1, 6));
    r = valores.reduce((a, b) => a + b, 0);
    cuenta = valores.join(' + ');
    leccion = n === 3 ? datosSuma(valores[0], valores[1], valores[2]) : datosSuma(valores[0], valores[1]);
    tag = n === 3 ? 'suma.tres-calculo' : 'suma.uno-mas-menos';
    previstos = n === 3 ? [[valores[0] + valores[1], 'suma.olvida-sumando'], [r + 1, tag], [r - 1, tag]] : [[r + 1, tag], [r - 1, tag]];
  }
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tag, 4, 0);
  return {
    uid: uid('dados', { op, v: valores.join('-') }),
    plantillaId: 'dados',
    tema: op === '×' ? 'tablas' : op === '−' ? 'restas' : 'sumas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'dados', 'consigna', op), { g: valores.length, puntos: valores[0] === 1 ? '1 punto' : `${valores[0]} puntos` }),
    visual: { tipo: 'dados', valores },
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: tag,
    leccion,
    explicacion: rellenar(texto(az, 'dados', 'explicacion'), { cuenta, r }),
    pista: rellenar(texto(az, 'dados', 'pista', op), { p: valores[0] }),
    params: { op, v: valores.join('-') },
  };
};

// ---------------------------------------------------------------------------
// Balanza: 8 + 5 = 10 + __ (los dos lados dan lo mismo).
export const balanza: Generador = (az, ctx): Ejercicio => {
  const op = opDe(ctx, '+') === '−' ? '−' : '+';
  const m = max(ctx, 10);
  // El lado completo respeta el tema del nivel; en "decenas" el otro lado también usa decenas.
  const paso = ctx.params.modo === 'decenas' ? 10 : 1;
  let [a, b] = par(az, ctx, op);
  for (let i = 0; i < 20 && (op === '+' ? a + b < 2 * paso + 1 : a - b < 1); i++) [a, b] = par(az, ctx, op);
  let total: number, c: number, r: number;
  if (op === '+') {
    total = a + b;
    const candidatos: number[] = [];
    for (let x = paso; x < total; x += paso) if (x !== a && x !== b) candidatos.push(x);
    c = candidatos.length ? az.elegir(candidatos) : Math.max(1, total - paso);
    r = total - c;
  } else {
    total = a - b;
    c = total + paso * az.entero(1, Math.max(1, Math.floor((Math.max(m, total + paso) - total) / paso)));
    r = c - total;
  }
  const completo = `${a} ${op} ${b}`;
  const incompleto = `${c} ${op} ${r}`;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [total, 'igualdad.balanza'],
      [r + 1, 'igualdad.balanza'],
      [r - 1, 'igualdad.balanza'],
    ],
    'igualdad.balanza',
    4,
    0,
  );
  return {
    uid: uid('balanza', { op, a, b, c }),
    plantillaId: 'balanza',
    tema: op === '+' ? 'sumas' : 'restas',
    modo: 'opciones',
    consigna: texto(az, 'balanza', 'consigna'),
    cuenta: `${completo} = ${c} ${op} __`,
    visual: { tipo: 'balanza', izquierda: completo, derecha: `${c} ${op} ?` },
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'igualdad.balanza',
    leccion: { completo, incompleto, total, r },
    explicacion: rellenar(texto(az, 'balanza', 'explicacion'), { total }),
    pista: texto(az, 'balanza', 'pista'),
    params: { op, a, b, c },
  };
};

// ---------------------------------------------------------------------------
// Pirámide de sumas: el bloque de arriba es la suma de los dos de abajo.
export const piramide: Generador = (az, ctx): Ejercicio => {
  const [a, b] = par(az, ctx, '+');
  const s = a + b;
  const arriba = az.chance(0.5);
  const r = arriba ? s : b;
  const tag = arriba ? (s <= 20 ? 'suma.uno-mas-menos' : 'suma.calculo') : 'falta.calculo';
  const previstos: [number, string][] = arriba
    ? [[Math.abs(a - b), 'suma.resta-en-vez'], [s + 1, tag], [s - 1, tag], [s + 10, tag]]
    : [[s, 'falta.da-el-total'], [b + 1, tag], [b - 1, tag], [b + 2, tag]];
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, tag, 4, 0);
  return {
    uid: uid('piramide', { a, b, arriba: arriba ? 1 : 0 }),
    plantillaId: 'piramide',
    tema: 'sumas',
    modo: 'opciones',
    consigna: texto(az, 'piramide', 'consigna', arriba ? 'arriba' : 'abajo'),
    visual: { tipo: 'piramide', abajo: arriba ? [a, b] : [a, null], arriba: arriba ? null : s },
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: tag,
    leccion: arriba ? datosSuma(a, b) : datosFalta(a, s),
    explicacion: rellenar(texto(az, 'piramide', 'explicacion'), { cuenta: `${a} + ${b} = ${s}` }),
    pista: texto(az, 'piramide', 'pista'),
    params: { a, b, arriba: arriba ? 1 : 0 },
  };
};

// ---------------------------------------------------------------------------
// Adivinanza: "Pensé un número: es mayor que 40, menor que 50 y termina en 3".
export const adivinanza: Generador = (az, ctx): Ejercicio => {
  const m = Math.max(30, Math.min(999, ctx.rango));
  const r = az.entero(12, m);
  const [u, d] = cifras(r);
  const desde = Math.floor(r / 10) * 10;
  const pistas: string[] = [];
  if (r >= 100) pistas.push(`está entre ${desde} y ${desde + 10}`);
  else pistas.push(`es mayor que ${desde - 1 > 0 ? desde - 1 : 0}`, `es menor que ${desde + 10}`);
  pistas.push(`termina en ${u}`);
  const opciones = [r, d * 10 + ((u + 5) % 10) + (r >= 100 ? Math.floor(r / 100) * 100 : 0), r + 10, u * 10 + d].filter((x, i, l) => x > 0 && l.indexOf(x) === i);
  const { opciones: ops, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    opciones.filter((x) => x !== r).map((x): [number, string] => [x, 'numeros.pistas']),
    'numeros.pistas',
    4,
    0,
  );
  return {
    uid: uid('adivinanza', { r }),
    plantillaId: 'adivinanza',
    tema: 'numeros',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'adivinanza', 'consigna'), { pistas: listaTexto(pistas) }),
    visual: { tipo: 'recta', desde: Math.max(0, desde - (r >= 100 ? 0 : 0)), hasta: desde + 10 },
    visualEsAyuda: true,
    respuesta: String(r),
    opciones: ops,
    erroresPrevistos,
    errorTagPorDefecto: 'numeros.pistas',
    leccion: { pista1: listaTexto(pistas.slice(0, -1)), pista2: pistas[pistas.length - 1], desde, hasta: desde + 9, r },
    explicacion: rellenar(texto(az, 'adivinanza', 'explicacion'), { r }),
    pista: texto(az, 'adivinanza', 'pista'),
    params: { r },
  };
};

// ---------------------------------------------------------------------------
// ¿Te alcanza? Sí o no, sumando precios.
export const alcanza: Generador = (az, ctx): Ejercicio => {
  const tope = Math.max(20, Math.min(1000, ctx.rango));
  const prods = productosCon(az, az.entero(1, 2), Math.floor(tope / 2));
  const total = prods.reduce((s, p) => s + p.precio, 0);
  // Tres casos parejos: sobra, justo o falta (así no se contesta al azar con sí o no).
  const caso = az.elegir(['sobra', 'justo', 'falta'] as const);
  const plata =
    caso === 'justo'
      ? total
      : caso === 'sobra'
        ? total + az.elegir([1, 2, 5, 10, 20].filter((x) => x <= Math.max(1, Math.floor(tope / 4))))
        : Math.max(1, total - az.elegir([1, 2, 5, 10].filter((x) => x < total).concat([1])));
  const textos = { sobra: texto(az, 'alcanza', 'si'), justo: texto(az, 'alcanza', 'justo'), falta: texto(az, 'alcanza', 'no') };
  const real = plata > total ? 'sobra' : plata === total ? 'justo' : 'falta';
  const alcanzaDe = plata >= total;
  return {
    uid: uid('alcanza', { plata, t: prods.map((p) => p.id + p.precio).join('-') }),
    plantillaId: 'alcanza',
    tema: 'dinero',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'alcanza', 'consigna'), { plata, lista: listaTexto(prods.map((p) => p.nombre)) }),
    visual: { tipo: 'productos', productos: prods.map((p) => ({ objeto: p.id, nombre: sinArticulo(p.nombre), precio: p.precio })) },
    respuesta: textos[real],
    opciones: (['sobra', 'justo', 'falta'] as const).map((k) => ({ valor: textos[k], errorTag: k === real ? undefined : 'dinero.alcanza' })),
    errorTagPorDefecto: 'dinero.alcanza',
    leccion: {
      r: total,
      total,
      plata,
      sumaTexto: prods.map((p) => p.precio).join(' + '),
      variosProductos: prods.length > 1,
      caso: plata > total ? 'sobra' : plata === total ? 'justo' : 'falta',
      dif: Math.abs(plata - total),
      sobranTxt: plata - total === 1 ? 'sobra 1 peso' : `sobran ${plata - total} pesos`,
      faltanTxt: total - plata === 1 ? 'falta 1 peso' : `faltan ${total - plata} pesos`,
    },
    explicacion: rellenar(texto(az, 'alcanza', prods.length === 1 ? 'explicacionUno' : 'explicacion'), {
      total,
      plata,
      cierre: rellenar(texto(az, 'alcanza', plata === total ? 'cierreJusto' : alcanzaDe ? 'cierreSi' : 'cierreNo'), {
        sobranTxt: plata - total === 1 ? 'sobra 1 peso' : `sobran ${plata - total} pesos`,
        faltanTxt: total - plata === 1 ? 'falta 1 peso' : `faltan ${total - plata} pesos`,
      }),
    }),
    pista: texto(az, 'alcanza', 'pista'),
    params: { plata, t: prods.map((p) => p.id + p.precio).join('-') },
  };
};

// ---------------------------------------------------------------------------
// Carrito del súper: elegir N cosas sin pasarse del presupuesto.
export const carrito: Generador = (az, ctx): Ejercicio => {
  const plata = Math.max(50, Math.round(Math.max(50, Math.min(1000, ctx.rango)) / 10) * 10);
  const cantidad = 2;
  // Al menos dos cosas que entran y otras más caras; los precios se reparten según lo que
  // suele costar cada cosa (una mochila no puede costar menos que una manzana).
  const precios = [20, 45, 40, 90, 90].map((tope, i) => Math.max(1, Math.round((plata * az.entero(i < 2 ? 15 : 40, tope)) / 100))).sort((a, b) => a - b);
  const prods = productosCon(az, 5, plata)
    .sort((a, b) => a.max - b.max)
    .map((p, i) => ({ ...p, precio: precios[i] }));
  const lista = az.mezclar(prods);
  const items = lista.map((p, i) => ({ id: `p${i}`, valor: p.precio, texto: `${mayuscula(sinArticulo(p.nombre))} $${p.precio}`, dibujo: p.id }));
  const baratos = [...lista].sort((a, b) => a.precio - b.precio).slice(0, 2);
  const total = baratos[0].precio + baratos[1].precio;
  return {
    uid: uid('carrito', { plata, l: lista.map((p) => p.precio).join('-') }),
    plantillaId: 'carrito',
    tema: 'finanzas',
    modo: 'elegir',
    consigna: rellenar(texto(az, 'carrito', 'consigna'), { plata, cantidad }),
    respuesta: 'ok',
    datos: { elegir: { items, regla: 'presupuesto', objetivo: plata, cantidad, estilo: 'productos' } },
    erroresPrevistos: { 'se-pasa': 'finanzas.presupuesto', falta: 'finanzas.presupuesto' },
    errorTagPorDefecto: 'finanzas.presupuesto',
    leccion: { plata, total, opcionCorrecta: `${mayuscula(sinArticulo(baratos[0].nombre))} y ${sinArticulo(baratos[1].nombre)}` },
    explicacion: rellenar(texto(az, 'carrito', 'explicacion'), { plata }),
    pista: texto(az, 'carrito', 'pista'),
    params: { plata, l: lista.map((p) => p.precio).join('-') },
  };
};

// ---------------------------------------------------------------------------
// Ordenar precios de menor a mayor.
export const ordenarPrecios: Generador = (az, ctx): Ejercicio => {
  const tope = Math.max(20, Math.min(1000, ctx.rango));
  const precios = new Set<number>();
  while (precios.size < 4) precios.add(precio(az, 2, tope));
  const lista = [...precios];
  const orden = [...lista].sort((a, b) => a - b);
  return {
    uid: uid('ordenar-precios', { l: orden.join('-') }),
    plantillaId: 'ordenar-precios',
    tema: 'dinero',
    modo: 'ordenar',
    consigna: texto(az, 'ordenar-precios', 'consigna'),
    respuesta: orden.join(','),
    datos: { ordenar: az.mezclar(lista) },
    errorTagPorDefecto: 'precios.ordenar',
    leccion: { menor: orden[0], mayor: orden[3], r: orden.map((x) => `$${x}`).join(', ') },
    explicacion: rellenar(texto(az, 'ordenar-precios', 'explicacion'), { r: orden.map((p) => `$${p}`).join(', ') }),
    pista: texto(az, 'ordenar-precios', 'pista'),
    params: { l: orden.join('-') },
  };
};

// ---------------------------------------------------------------------------
// ¿Con qué pago usás menos billetes y monedas?
export const menosBilletes: Generador = (az, ctx): Ejercicio => {
  const p = precio(az, 11, Math.max(20, Math.min(1000, ctx.rango)));
  const optimo = descomponerPlata(p, VALORES_PLATA);
  // Otras formas: con monedas chicas o partiendo un billete.
  const chicos = descomponerPlata(p, VALORES_PLATA.filter((v) => v < optimo[0]));
  const medio = descomponerPlata(p, VALORES_PLATA.filter((v) => v !== optimo[0] && v !== optimo[1]));
  const formatear = (l: number[]) => l.map((v) => `$${v}`).join(' + ');
  const correcta = formatear(optimo);
  const incorrectas: [string, string][] = [chicos, medio].filter((l) => l.length > optimo.length).map((l): [string, string] => [formatear(l), 'dinero.menos-piezas']);
  if (!incorrectas.length) incorrectas.push([formatear(descomponerPlata(p, [1])).slice(0, 60), 'dinero.menos-piezas']);
  return {
    uid: uid('menos-billetes', { p }),
    plantillaId: 'menos-billetes',
    tema: 'dinero',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'menos-billetes', 'consigna'), { precio: p }),
    respuesta: correcta,
    opciones: opcionesTexto(az, correcta, incorrectas, 3),
    errorTagPorDefecto: 'dinero.menos-piezas',
    leccion: { precio: p, sumaTexto: optimo.join(' + '), k: optimo.length },
    explicacion: rellenar(texto(az, 'menos-billetes', 'explicacion'), { opcion: correcta }),
    pista: texto(az, 'menos-billetes', 'pista'),
    params: { p },
  };
};

// ---------------------------------------------------------------------------
// Problemas: elegir la pregunta, la cuenta, estimar y "¿tiene razón?".
function historiaSimple(az: Azar, ctx: Contexto, excluir: string[] = []) {
  // "Elegir la operación" ya pregunta por la cuenta: acá se usan historias que preguntan un número.
  const tipos = ((ctx.params.tipos as string[]) ?? ['juntar', 'agregar', 'quitar']).filter(
    (t) => t !== 'elegir-operacion' && !excluir.includes(t) && HISTORIAS[t]?.some((h) => h.op),
  );
  const tipo = az.elegir(tipos.length ? tipos : ['juntar', 'agregar', 'quitar']);
  const h = az.elegir(HISTORIAS[tipo].filter((x) => x.op));
  const op = h.op as '+' | '−';
  // Números con sentido para la historia (nada de 800 flores en un florero).
  const [a, b] = numerosPara(az, rangoHistoria(h, ctx.rango), op);
  const obj = h.objeto ?? az.elegir(h.objetos ?? ['estrella']);
  const [nombre, nombre2] = dosNombres(az);
  const c = az.entero(3, 12);
  const vars = { a, b, c, nombre, nombre2, objetos: objeto(obj), ...genero(obj) };
  const completa = rellenar(h.texto, vars);
  // La historia sin la pregunta final (para "elegir la pregunta").
  const pregunta = completa.match(/¿[^¿?]*\?\s*$/)?.[0].trim() ?? '';
  const sinPregunta = completa.slice(0, completa.length - pregunta.length).trim();
  const r = op === '+' ? a + b : a - b;
  return { op, a, b, r, completa, sinPregunta, pregunta, obj, nombre, nombre2, tipo };
}

export const elegirPregunta: Generador = (az, ctx): Ejercicio => {
  // Sin "datos que sobran": esas historias cuentan cosas como la edad.
  const h = historiaSimple(az, ctx, ['dato-que-sobra']);
  const [otro] = az.mezclar(NOMBRES.filter((n) => !h.completa.includes(n)));
  const correcta = h.pregunta;
  const malas: [string, string][] = [
    [`¿Cuántos años tiene ${h.completa.includes(h.nombre) ? h.nombre : 'la seño'}?`, 'problema.pregunta'],
    [`¿De qué color son ${genero(h.obj).los} ${objeto(h.obj)}?`, 'problema.pregunta'],
    [`¿Cuántos ${objeto(h.obj) === 'figuritas' ? 'hermanos' : 'amigos'} tiene ${otro}?`, 'problema.pregunta'],
  ];
  const cuentaTexto = `${h.a} ${h.op} ${h.b} = ${h.r}`;
  return {
    uid: uid('elegir-pregunta', { a: h.a, b: h.b, t: h.tipo }),
    plantillaId: 'elegir-pregunta',
    tema: 'problemas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'elegir-pregunta', 'consigna'), { historia: h.sinPregunta }),
    visual: { tipo: 'dibujo', objeto: h.obj },
    respuesta: correcta,
    opciones: opcionesTexto(az, correcta, malas, 3),
    errorTagPorDefecto: 'problema.pregunta',
    leccion: { a: h.a, b: h.b, r: h.r, pistaOperacion: 'Solo se puede preguntar lo que la historia cuenta.', cuentaTexto },
    explicacion: rellenar(texto(az, 'elegir-pregunta', 'explicacion'), { cuenta: cuentaTexto }),
    pista: texto(az, 'elegir-pregunta', 'pista'),
    params: { a: h.a, b: h.b, t: h.tipo },
  };
};

export const elegirCuenta: Generador = (az, ctx): Ejercicio => {
  const h = historiaSimple(az, ctx);
  const correcta = `${h.a} ${h.op} ${h.b}`;
  const otra = h.op === '+' ? `${h.a} − ${h.b}` : `${h.a} + ${h.b}`;
  const cuentaTexto = `${correcta} = ${h.r}`;
  return {
    uid: uid('elegir-cuenta', { a: h.a, b: h.b, t: h.tipo }),
    plantillaId: 'elegir-cuenta',
    tema: 'problemas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'elegir-cuenta', 'consigna'), { historia: h.completa }),
    visual: { tipo: 'dibujo', objeto: h.obj },
    respuesta: correcta,
    opciones: opcionesTexto(az, correcta, [[otra, 'problema.operacion'], [`${h.a} + ${h.b} + ${h.b}`, 'problema.operacion']], 3),
    errorTagPorDefecto: 'problema.operacion',
    leccion: { a: h.a, b: h.b, r: h.r, pistaOperacion: h.op === '+' ? 'Si se junta o se agrega, sumamos.' : 'Si se quita o comparamos, restamos.', cuentaTexto },
    explicacion: rellenar(texto(az, 'elegir-cuenta', 'explicacion'), { cuenta: cuentaTexto }),
    pista: texto(az, 'elegir-cuenta', 'pista'),
    params: { a: h.a, b: h.b, t: h.tipo },
  };
};

export const estimar: Generador = (az, ctx): Ejercicio => {
  // Estimar tiene sentido con resultados de 15 para arriba.
  let h = historiaSimple(az, { ...ctx, rango: Math.max(30, ctx.rango) });
  for (let i = 0; i < 20 && h.r < 15; i++) h = historiaSimple(az, { ...ctx, rango: Math.max(30, ctx.rango) });
  const paso = h.r > 200 ? 50 : 10;
  const redondo = (x: number) => Math.round(x / paso) * paso;
  const v = redondo(h.r);
  const otra = redondo(h.op === '+' ? Math.abs(h.a - h.b) : h.a + h.b);
  const cerca = (x: number) => rellenar(texto(az, 'estimar', 'cerca'), { v: x });
  // Opciones que obligan a pensar: la cuenta contraria y números redondos vecinos (no ×10).
  const incorrectas: [string, string][] = [];
  if (otra !== v && otra > 0) incorrectas.push([cerca(otra), 'problema.operacion']);
  for (const d of az.mezclar([2, -2, 3, -3])) if (v + d * paso > 0 && v + d * paso !== otra) incorrectas.push([cerca(v + d * paso), 'problema.calculo']);
  return {
    uid: uid('estimar', { a: h.a, b: h.b, t: h.tipo }),
    plantillaId: 'estimar',
    tema: 'problemas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'estimar', 'consigna'), { historia: h.completa }),
    visual: { tipo: 'dibujo', objeto: h.obj },
    respuesta: cerca(v),
    opciones: opcionesTexto(az, cerca(v), incorrectas, 3),
    errorTagPorDefecto: 'problema.operacion',
    leccion: { a: h.a, b: h.b, r: h.r, pistaOperacion: h.op === '+' ? 'Si se agrega, el resultado es más grande.' : 'Si se quita, el resultado es más chico.', cuentaTexto: `${h.a} ${h.op} ${h.b} = ${h.r}` },
    explicacion: rellenar(texto(az, 'estimar', 'explicacion'), { r: h.r, v }),
    pista: texto(az, 'estimar', 'pista'),
    params: { a: h.a, b: h.b, t: h.tipo },
  };
};

export const historiaVF: Generador = (az, ctx): Ejercicio => {
  const h = historiaSimple(az, ctx);
  const bien = az.chance(0.5);
  const otra = h.op === '+' ? Math.abs(h.a - h.b) : h.a + h.b;
  const dice = bien ? h.r : otra !== h.r ? otra : h.r + 1;
  // Quien opina no es un personaje de la historia.
  const [quien] = az.mezclar(NOMBRES.filter((n) => n !== h.nombre && n !== h.nombre2));
  const si = texto(az, 'historia-vf', 'si');
  const no = texto(az, 'historia-vf', 'no');
  const cuentaTexto = `${h.a} ${h.op} ${h.b} = ${h.r}`;
  return {
    uid: uid('historia-vf', { a: h.a, b: h.b, dice }),
    plantillaId: 'historia-vf',
    tema: 'problemas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'historia-vf', 'consigna'), { historia: h.completa, nombre: quien, dice }),
    visual: { tipo: 'dibujo', objeto: h.obj },
    respuesta: bien ? si : no,
    opciones: [
      { valor: si, errorTag: bien ? undefined : 'problema.operacion' },
      { valor: no, errorTag: bien ? 'problema.calculo' : undefined },
    ],
    errorTagPorDefecto: 'problema.calculo',
    leccion: { a: h.a, b: h.b, r: h.r, pistaOperacion: h.op === '+' ? 'Si se junta o se agrega, sumamos.' : 'Si se quita o comparamos, restamos.', cuentaTexto },
    explicacion: rellenar(texto(az, 'historia-vf', bien ? 'explicacionBien' : 'explicacionMal'), { cuentaTexto, dice }),
    pista: texto(az, 'historia-vf', 'pista'),
    params: { a: h.a, b: h.b, dice },
  };
};

// ---------------------------------------------------------------------------
// Finanzas: cuánto falta para la meta, cobrar por un trabajo y clasificar necesidades y deseos.
export const faltaMeta: Generador = (az, ctx): Ejercicio => {
  const paso = ctx.rango >= 300 ? 50 : 10;
  const meta = Math.max(paso * 3, Math.round(az.entero(paso * 3, Math.max(paso * 4, Math.min(1000, ctx.rango))) / paso) * paso);
  const tengo = Math.round(az.entero(paso, meta - paso) / 5) * 5;
  const r = meta - tengo;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [[meta, 'falta.da-el-total'], [meta + tengo, 'falta.da-el-total'], [r + 10, 'falta.calculo'], [r - 5, 'falta.calculo']],
    'falta.calculo',
    4,
    0,
  );
  return {
    uid: uid('falta-meta', { meta, tengo }),
    plantillaId: 'falta-meta',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'falta-meta', 'consigna'), { meta, tengo }),
    visual: { tipo: 'alcancia', meta, guardado: tengo },
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'falta.calculo',
    leccion: datosFalta(tengo, meta),
    explicacion: rellenar(texto(az, 'falta-meta', 'explicacion'), { meta, tengo, r }),
    pista: texto(az, 'falta-meta', 'pista'),
    params: { meta, tengo },
  };
};

export const trabajoCobro: Generador = (az, ctx): Ejercicio => {
  const pago = az.elegir([2, 5, 10, 20, 50, 100].filter((p) => p * 3 <= Math.max(30, ctx.rango)));
  const veces = az.entero(2, 6);
  const r = pago * veces;
  const tareas = (PLANTILLAS['trabajo-cobro']?.tareas as unknown as string[]) ?? ['ayudar'];
  const [nombre] = az.mezclar(NOMBRES);
  const vars = { nombre, pago, veces, tarea: az.elegir(tareas), r };
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [[pago + veces, 'tabla.suma-en-vez'], [pago * (veces + 1), 'tabla.vecino'], [pago * (veces - 1), 'tabla.vecino']],
    'tabla.calculo',
    4,
    1,
  );
  return {
    uid: uid('trabajo-cobro', { pago, veces }),
    plantillaId: 'trabajo-cobro',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'trabajo-cobro', 'consigna'), vars),
    visual: { tipo: 'billetes', valores: Array.from({ length: veces }, () => pago) },
    visualEsAyuda: true,
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'tabla.calculo',
    leccion: datosGrupos(veces, pago),
    explicacion: rellenar(texto(az, 'trabajo-cobro', 'explicacion'), vars),
    pista: rellenar(texto(az, 'trabajo-cobro', 'pista'), vars),
    params: { pago, veces },
  };
};


export const clasificar: Generador = (az): Ejercicio => {
  const tipo = az.chance(0.5) ? 'necesidad' : 'deseo';
  const nec = az.mezclar(FINANZAS.necesidadDeseo.filter((x) => x.tipo === 'necesidad')).slice(0, 2);
  const des = az.mezclar(FINANZAS.necesidadDeseo.filter((x) => x.tipo === 'deseo')).slice(0, 3);
  const lista = az.mezclar([...nec, ...des]);
  const items = lista.map((x, i) => ({ id: `x${i}`, valor: x.tipo === tipo ? 1 : 0, texto: mayuscula(x.cosa), dibujo: x.objeto }));
  const correctas = items.filter((i) => i.valor === 1).map((i) => i.id);
  const ejemplo = lista.find((x) => x.tipo === tipo)!;
  return {
    uid: uid('clasificar', { tipo, l: lista.map((x) => x.cosa).join('|') }),
    plantillaId: 'clasificar',
    tema: 'finanzas',
    modo: 'elegir',
    consigna: texto(az, 'clasificar', 'consigna', tipo),
    respuesta: 'ok',
    datos: { elegir: { items, regla: 'conjunto', correctas, estilo: 'productos' } },
    erroresPrevistos: { mal: 'finanzas.necesidad-deseo' },
    errorTagPorDefecto: 'finanzas.necesidad-deseo',
    leccion: { cosa: ejemplo.cosa, verbo: /^(los|las) /.test(ejemplo.cosa) ? 'son' : 'es', tipoTexto: tipo === 'necesidad' ? 'una necesidad' : 'un deseo' },
    explicacion: rellenar(texto(az, 'clasificar', 'explicacion'), { tipoPlural: tipo === 'necesidad' ? 'necesidades' : 'deseos' }),
    pista: texto(az, 'clasificar', 'pista'),
    params: { tipo, l: lista.map((x) => x.cosa).join('|') },
  };
};

