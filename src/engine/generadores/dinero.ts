// Mundo 5: Mercado de Monedas. Billetes y monedas didácticos (no se reproducen billetes reales).
import { saltos } from '../explicar';
import { PRODUCTOS, type Producto } from '../../content';
import type { Azar } from '../azar';
import {
  descomponerPlata,
  type Generador,
  mayuscula,
  opcionesNumericas,
  rellenar,
  texto,
  uid,
} from './comun';

export const VALORES_PLATA = [...PRODUCTOS.billetes, ...PRODUCTOS.monedas].sort((a, b) => b - a);

export function esMoneda(v: number): boolean {
  return PRODUCTOS.monedas.includes(v);
}

/** Precio "redondo" según el tamaño: hasta 100 de a 1 o 5, después de a 10 o 50. */
function precioEn(az: Azar, min: number, max: number): number {
  const p = az.entero(Math.max(1, min), Math.max(min, max));
  if (p > 300) return Math.max(10, Math.round(p / 50) * 50);
  if (p > 100) return Math.max(10, Math.round(p / 10) * 10);
  if (p > 30 && az.chance(0.5)) return Math.round(p / 5) * 5;
  return p;
}

function productoPara(az: Azar, precio: number): Producto {
  const lista = PRODUCTOS.productos.filter((p) => p.min <= precio && precio <= p.max);
  return az.elegir(lista.length ? lista : PRODUCTOS.productos);
}

function sinArticulo(nombre: string): string {
  return nombre.replace(/^(el|la|los|las) /, '');
}

export const reconocerBillete: Generador = (az, ctx) => {
  const disponibles = VALORES_PLATA.filter((v) => v <= Math.max(100, ctx.rango));
  const v = az.elegir(disponibles);
  const moneda = esMoneda(v);
  const pesos = v === 1 ? '1 peso' : `${v} pesos`;
  const mismos = disponibles.filter((x) => esMoneda(x) === moneda && x !== v);
  const otros = az.mezclar(mismos.length >= 3 ? mismos : disponibles.filter((x) => x !== v)).slice(0, 3);
  const opciones = az.mezclar([
    { valor: String(v), dibujo: `plata-${v}`, texto: `$${v}` },
    ...otros.map((x) => ({ valor: String(x), dibujo: `plata-${x}`, texto: `$${x}`, errorTag: 'dinero.valor-billete' })),
  ]);
  return {
    uid: uid('reconocer-billete', { v }),
    plantillaId: 'reconocer-billete',
    tema: 'dinero',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'reconocer-billete', moneda ? 'consignaMoneda' : 'consigna'), { pesos }),
    respuesta: String(v),
    opciones,
    errorTagPorDefecto: 'dinero.valor-billete',
    leccion: { r: v, sumaTexto: String(v), pesosTxt: pesos },
    explicacion: rellenar(texto(az, 'reconocer-billete', moneda ? 'explicacionMoneda' : 'explicacion'), { pesos }),
    pista: texto(az, 'reconocer-billete', 'pista'),
    params: { v },
  };
};

export const contarPlata: Generador = (az, ctx) => {
  const soloMonedas = Boolean(ctx.params.soloMonedas);
  const valores = soloMonedas ? PRODUCTOS.monedas : VALORES_PLATA.filter((v) => v <= Math.max(10, ctx.rango));
  const piezas: number[] = [];
  const tope = Math.max(10, soloMonedas ? Math.min(ctx.rango, 60) : ctx.rango);
  const cantidad = az.entero(2, soloMonedas ? 6 : 5);
  for (let i = 0; i < cantidad; i++) {
    const total = piezas.reduce((a, b) => a + b, 0);
    const posibles = valores.filter((v) => total + v <= tope);
    if (!posibles.length) break;
    piezas.push(az.elegir(posibles));
  }
  if (!piezas.length) piezas.push(Math.min(...valores));
  piezas.sort((a, b) => b - a);
  const r = piezas.reduce((a, b) => a + b, 0);
  const sinUna = r - piezas[piezas.length - 1];
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [sinUna, 'dinero.contar'],
      [r + piezas[0], 'dinero.contar'],
      [piezas.length, 'dinero.contar'],
    ],
    'dinero.contar',
    4,
    1,
  );
  return {
    uid: uid('contar-plata', { p: piezas.join('-') }),
    plantillaId: 'contar-plata',
    tema: 'dinero',
    modo: 'opciones',
    consigna: texto(az, 'contar-plata', 'consigna'),
    visual: { tipo: 'billetes', valores: piezas },
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'dinero.contar',
    leccion: { r, sumaTexto: piezas.join(' + ') },
    explicacion: rellenar(texto(az, 'contar-plata', 'explicacion'), { r }),
    pista: texto(az, 'contar-plata', 'pista'),
    params: { p: piezas.join('-') },
  };
};

export const armarMonto: Generador = (az, ctx) => {
  const max = Math.max(10, ctx.rango);
  const precio = precioEn(az, Math.max(3, Math.floor(max / 4)), max);
  const conProducto = Boolean(ctx.params.producto);
  const prod = productoPara(az, precio);
  const billetera = VALORES_PLATA.filter((v) => v <= Math.max(precio, 10) * 2 && v <= 1000);
  const vars = { precio, producto: prod.nombre, Producto: mayuscula(prod.nombre) };
  return {
    uid: uid('armar-monto', { precio }),
    plantillaId: 'armar-monto',
    tema: 'dinero',
    modo: 'dinero',
    consigna: rellenar(texto(az, 'armar-monto', conProducto ? 'consignaProducto' : 'consigna'), vars),
    respuesta: String(precio),
    datos: { dinero: { precio, billetera, objeto: conProducto ? prod.id : 'moneda', nombre: conProducto ? sinArticulo(prod.nombre) : '' } },
    errorTagPorDefecto: 'dinero.falta',
    leccion: { precio, sumaTexto: descomponerPlata(precio, VALORES_PLATA).join(' + ') },
    explicacion: rellenar(texto(az, 'armar-monto', 'explicacion'), vars),
    pista: texto(az, 'armar-monto', 'pista'),
    params: { precio },
  };
};

export const compararPrecios: Generador = (az, ctx) => {
  const max = Math.max(20, ctx.rango);
  const a = precioEn(az, Math.floor(max / 5), max);
  let b = precioEn(az, Math.floor(max / 5), max);
  if (b === a) b = a + (a > 10 ? 10 : 2);
  const p1 = productoPara(az, a);
  let p2 = productoPara(az, b);
  for (let i = 0; i < 10 && p2.id === p1.id; i++) p2 = productoPara(az, b);
  if (p2.id === p1.id) p2 = PRODUCTOS.productos.find((p) => p.id !== p1.id)!;
  const [barato, caro, pb, pc] = a < b ? [p1, p2, a, b] : [p2, p1, b, a];
  const opciones = az.mezclar([
    { valor: barato.id, texto: `${mayuscula(sinArticulo(barato.nombre))}: $${pb}`, dibujo: barato.id },
    { valor: caro.id, texto: `${mayuscula(sinArticulo(caro.nombre))}: $${pc}`, dibujo: caro.id, errorTag: 'precios.comparar' },
  ]);
  return {
    uid: uid('comparar-precios', { a, b, p: p1.id + p2.id }),
    plantillaId: 'comparar-precios',
    tema: 'dinero',
    modo: 'opciones',
    consigna: texto(az, 'comparar-precios', 'consigna'),
    visual: {
      tipo: 'productos',
      productos: [
        { objeto: p1.id, nombre: sinArticulo(p1.nombre), precio: a },
        { objeto: p2.id, nombre: sinArticulo(p2.nombre), precio: b },
      ],
    },
    respuesta: barato.id,
    opciones,
    errorTagPorDefecto: 'precios.comparar',
    leccion: {
      r: sinArticulo(barato.nombre),
      Barato: mayuscula(barato.nombre),
      comparacion: `${mayuscula(barato.nombre)} cuesta ${pb} y ${caro.nombre} cuesta ${pc}.`,
      mayor: pc,
      menor: pb,
    },
    explicacion: rellenar(texto(az, 'comparar-precios', 'explicacion'), {
      Barato: mayuscula(barato.nombre),
      caro: caro.nombre,
      pb,
      pc,
    }),
    pista: texto(az, 'comparar-precios', 'pista'),
    params: { a, b, p: p1.id + p2.id },
  };
};

export const darVuelto: Generador = (az, ctx) => {
  const max = Math.max(20, ctx.rango);
  const precio = precioEn(az, 3, Math.max(5, max - 1));
  const billetesMayores = PRODUCTOS.billetes.filter((v) => v > precio).sort((a, b) => a - b);
  const pago = billetesMayores.length ? az.elegir(billetesMayores.slice(0, 2)) : Math.ceil((precio + 1) / 100) * 100;
  const prod = productoPara(az, precio);
  const r = pago - precio;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [pago + precio, 'vuelto.suma-en-vez'],
      [r + 10, 'vuelto.calculo'],
      [r - 10, 'vuelto.calculo'],
      [precio, 'vuelto.calculo'],
    ],
    'vuelto.calculo',
    4,
    0,
  );
  const vars = { precio, pago, r, Producto: mayuscula(prod.nombre) };
  return {
    uid: uid('dar-vuelto', { precio, pago }),
    plantillaId: 'dar-vuelto',
    tema: 'dinero',
    modo: usaTecladoDinero(az, ctx.grado) ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'dar-vuelto', 'consigna'), vars),
    cuenta: `${pago} − ${precio} = ?`,
    visual: { tipo: 'productos', productos: [{ objeto: prod.id, nombre: sinArticulo(prod.nombre), precio }] },
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'vuelto.calculo',
    leccion: { precio, pago, r, ...saltos(precio, pago) },
    explicacion: rellenar(texto(az, 'dar-vuelto', 'explicacion'), vars),
    pista: texto(az, 'dar-vuelto', 'pista'),
    params: { precio, pago },
  };
};

function usaTecladoDinero(az: Azar, grado: number): boolean {
  return grado >= 3 && az.chance(0.3);
}

export const compraVarios: Generador = (az, ctx) => {
  const max = Math.max(20, ctx.rango);
  const cuantos = ctx.grado >= 4 ? 3 : 2;
  const precios = Array.from({ length: cuantos }, () => precioEn(az, 2, Math.max(3, Math.floor(max / cuantos))));
  const prods: Producto[] = [];
  for (const pr of precios) {
    let p = productoPara(az, pr);
    for (let i = 0; i < 10 && prods.some((x) => x.id === p.id); i++) p = productoPara(az, pr);
    if (prods.some((x) => x.id === p.id)) p = PRODUCTOS.productos.find((x) => !prods.some((y) => y.id === x.id))!;
    prods.push(p);
  }
  const r = precios.reduce((a, b) => a + b, 0);
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [r - precios[precios.length - 1], 'compra.olvida-producto'],
      [r - precios[0], 'compra.olvida-producto'],
      [r + 10, 'compra.calculo'],
      [r - 10, 'compra.calculo'],
    ],
    'compra.calculo',
    4,
    1,
  );
  const lista = prods
    .map((p) => p.nombre)
    .map((n, i, l) => (i === l.length - 1 && l.length > 1 ? `y ${n}` : n))
    .join(', ')
    .replace(', y', ' y');
  return {
    uid: uid('compra-varios', { p: precios.join('-') }),
    plantillaId: 'compra-varios',
    tema: 'dinero',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'compra-varios', 'consigna'), { lista }),
    visual: { tipo: 'productos', productos: prods.map((p, i) => ({ objeto: p.id, nombre: sinArticulo(p.nombre), precio: precios[i] })) },
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'compra.calculo',
    leccion: { r, sumaTexto: precios.join(' + ') },
    explicacion: rellenar(texto(az, 'compra-varios', 'explicacion'), { r }),
    pista: texto(az, 'compra-varios', 'pista'),
    params: { p: precios.join('-') },
  };
};

