// Mundo 7: Isla del Tesoro (finanzas). Conceptos muy visuales y poca lectura.
import { FINANZAS, PRODUCTOS } from '../../content';
import { type Generador, mayuscula, opcionesNumericas, opcionesTexto, rellenar, texto, uid } from './comun';

export const finanzas: Generador = (az, ctx) => {
  const tema = (ctx.params.tema as string) ?? 'que-es-dinero';
  const banco = FINANZAS.temas[tema];
  if (!banco?.length) throw new Error(`No hay preguntas de finanzas para ${tema}`);
  const q = az.elegir(banco);

  if (q.opcionesCalculadas === 'oferta') {
    const p1 = az.elegir([20, 30, 40, 50, 60, 80, 100].filter((p) => p * 2 <= Math.max(200, ctx.rango)));
    const conviene = az.chance(0.5);
    const p2 = conviene ? p1 * 2 - az.elegir([10, 20]) : p1 * 2 + az.elegir([10, 20]);
    const sueltos = `Comprar dos sueltos ($${p1 * 2})`;
    const oferta = `Comprar la oferta ($${p2})`;
    const correcta = conviene ? oferta : sueltos;
    const vars = { p1, p2 };
    return {
      uid: uid('finanzas', { tema, p1, p2 }),
      plantillaId: 'finanzas',
      tema: 'finanzas',
      modo: 'opciones',
      consigna: rellenar(q.pregunta, vars),
      visual: { tipo: 'dibujo', objeto: q.dibujo },
      respuesta: correcta,
      opciones: opcionesTexto(az, correcta, [[conviene ? sueltos : oferta, 'finanzas.concepto']], 2),
      errorTagPorDefecto: 'finanzas.concepto',
      leccion: {
        explica1: rellenar(q.explica1, vars),
        explica2: rellenar(q.explica2, vars),
        respuestaTexto: correcta,
      },
      explicacion: rellenar(q.explicacion, { p1, p2, doble: p1 * 2, cual: conviene ? 'la oferta' : 'comprar dos sueltos' }),
      pista: texto(az, 'finanzas', 'pista'),
      params: { tema, p1, p2 },
    };
  }

  const opciones = q.opciones ?? [];
  const correcta = opciones[q.correcta ?? 0];
  return {
    uid: uid('finanzas', { tema, q: q.pregunta.slice(0, 16) }),
    plantillaId: 'finanzas',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: q.pregunta,
    visual: { tipo: 'dibujo', objeto: q.dibujo },
    respuesta: correcta,
    opciones: opcionesTexto(
      az,
      correcta,
      opciones.filter((o) => o !== correcta).map((o): [string, string] => [o, 'finanzas.concepto']),
      4,
    ),
    errorTagPorDefecto: 'finanzas.concepto',
    leccion: { explica1: q.explica1, explica2: q.explica2, respuestaTexto: correcta },
    explicacion: q.explicacion,
    pista: texto(az, 'finanzas', 'pista'),
    params: { tema, q: q.pregunta.slice(0, 16) },
  };
};

export const necesidadDeseo: Generador = (az) => {
  const item = az.elegir(FINANZAS.necesidadDeseo);
  const nec = texto(az, 'necesidad-deseo', 'necesidad');
  const des = texto(az, 'necesidad-deseo', 'deseo');
  const correcta = item.tipo === 'necesidad' ? nec : des;
  const tipoTexto = item.tipo === 'necesidad' ? 'una necesidad' : 'un deseo';
  // "Los útiles del cole son…", "Un helado es…".
  const verbo = /^(los|las) /.test(item.cosa) ? 'son' : 'es';
  return {
    uid: uid('necesidad-deseo', { c: item.cosa }),
    plantillaId: 'necesidad-deseo',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'necesidad-deseo', 'consigna'), { Cosa: mayuscula(item.cosa), verbo }),
    visual: { tipo: 'dibujo', objeto: item.objeto },
    respuesta: correcta,
    opciones: [
      { valor: nec, errorTag: item.tipo === 'necesidad' ? undefined : 'finanzas.necesidad-deseo' },
      { valor: des, errorTag: item.tipo === 'deseo' ? undefined : 'finanzas.necesidad-deseo' },
    ],
    errorTagPorDefecto: 'finanzas.necesidad-deseo',
    leccion: { cosa: item.cosa, tipoTexto, verbo },
    explicacion: rellenar(texto(az, 'necesidad-deseo', 'explicacion'), { Cosa: mayuscula(item.cosa), tipo: tipoTexto, verbo }),
    pista: texto(az, 'necesidad-deseo', 'pista'),
    params: { c: item.cosa },
  };
};

export const presupuesto: Generador = (az, ctx) => {
  const plata = Math.max(100, Math.round(Math.max(100, ctx.rango) / 100) * 100);
  const prods = az.mezclar(PRODUCTOS.productos.filter((p) => p.min <= plata / 2));
  const paso = plata >= 500 ? 50 : 10;
  const precio = (p: (typeof prods)[number], tope: number) =>
    Math.max(paso, Math.round(az.entero(Math.max(p.min, paso), Math.max(p.min, Math.min(p.max, tope))) / paso) * paso);
  // Una combinación que entra y dos que se pasan.
  const nombres = (a: string, b: string) => `${mayuscula(a.replace(/^(el|la) /, ''))} y ${b.replace(/^(el|la) /, '')}`;
  const [a, b, c, d, e, f] = [...prods, ...prods].slice(0, 6);
  const pa = precio(a, plata / 2 - paso);
  const pb = Math.min(precio(b, plata / 2), plata - pa);
  const okTotal = pa + pb;
  const pc = precio(c, plata);
  const pd = plata - pc + az.elegir([paso, paso * 2, paso * 3]);
  const pe = Math.ceil((plata * 0.6) / paso) * paso;
  const pf = plata - pe + paso * az.entero(1, 3);
  const ok = `${nombres(a.nombre, b.nombre)} ($${okTotal})`;
  const malo1 = `${nombres(c.nombre, d.nombre)} ($${pc + pd})`;
  const malo2 = `${nombres(e.nombre, f.nombre)} ($${pe + pf})`;
  return {
    uid: uid('presupuesto', { plata, pa, pb }),
    plantillaId: 'presupuesto',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'presupuesto', 'consigna'), { plata }),
    visual: { tipo: 'alcancia', meta: plata, guardado: plata, titulo: 'Tenés' },
    respuesta: ok,
    opciones: opcionesTexto(az, ok, [[malo1, 'finanzas.presupuesto'], [malo2, 'finanzas.presupuesto']], 3),
    errorTagPorDefecto: 'finanzas.presupuesto',
    leccion: { plata, total: okTotal, opcionCorrecta: nombres(a.nombre, b.nombre) },
    explicacion: rellenar(texto(az, 'presupuesto', 'explicacion'), { opcion: nombres(a.nombre, b.nombre), total: okTotal }),
    pista: rellenar(texto(az, 'presupuesto', 'pista'), { plata }),
    params: { plata, pa, pb },
  };
};

export const planAhorro: Generador = (az, ctx) => {
  const porSemana = az.elegir([10, 20, 50, 100].filter((p) => p * 2 <= Math.max(100, ctx.rango)));
  const semanas = az.entero(2, Math.min(8, Math.max(2, Math.floor(Math.max(100, ctx.rango) / porSemana))));
  const meta = porSemana * semanas;
  // Se ahorra para cosas que duran (una pelota, un libro), no para un alfajor.
  const paraAhorrar = PRODUCTOS.productos.filter((p) => p.ahorro);
  const prod = az.elegir(paraAhorrar.filter((p) => p.max >= meta).length ? paraAhorrar.filter((p) => p.max >= meta) : paraAhorrar);
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    semanas,
    [
      [semanas + 1, 'finanzas.ahorro'],
      [semanas - 1, 'finanzas.ahorro'],
    ],
    'finanzas.ahorro',
    4,
    1,
  );
  const vars = { producto: prod.nombre, meta, porSemana, r: semanas };
  return {
    uid: uid('plan-ahorro', { meta, porSemana }),
    plantillaId: 'plan-ahorro',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'plan-ahorro', 'consigna'), vars),
    visual: { tipo: 'alcancia', meta, guardado: porSemana },
    respuesta: String(semanas),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'finanzas.ahorro',
    leccion: { meta, porSemana, r: semanas },
    explicacion: rellenar(texto(az, 'plan-ahorro', 'explicacion'), vars),
    pista: rellenar(texto(az, 'plan-ahorro', 'pista'), vars),
    params: { meta, porSemana },
  };
};

export const repartirAhorro: Generador = (az, ctx) => {
  const paso = ctx.rango >= 500 ? 50 : 10;
  const plata = Math.max(paso * 5, Math.round(az.entero(paso * 5, Math.max(paso * 6, ctx.rango)) / paso) * paso);
  const guardo = Math.max(paso, Math.floor((plata * az.elegir([0.2, 0.3, 0.5])) / paso) * paso);
  const comparto = Math.max(paso, Math.floor((plata * 0.1) / paso) * paso);
  const r = plata - guardo - comparto;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [plata - guardo, 'finanzas.repartir'],
      [plata - comparto, 'finanzas.repartir'],
      [plata + guardo, 'finanzas.repartir'],
    ],
    'finanzas.repartir',
    4,
    0,
  );
  const vars = { plata, guardo, comparto, r };
  return {
    uid: uid('repartir-ahorro', vars),
    plantillaId: 'repartir-ahorro',
    tema: 'finanzas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'repartir-ahorro', 'consigna'), vars),
    visual: { tipo: 'alcancia', meta: plata, guardado: guardo },
    respuesta: String(r),
    opciones: opciones.map((o) => ({ ...o, texto: `$${o.valor}` })),
    erroresPrevistos,
    errorTagPorDefecto: 'finanzas.repartir',
    leccion: { plata, guardo, comparto, r },
    explicacion: rellenar(texto(az, 'repartir-ahorro', 'explicacion'), vars),
    pista: texto(az, 'repartir-ahorro', 'pista'),
    params: vars,
  };
};
