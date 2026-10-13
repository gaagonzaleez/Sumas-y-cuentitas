// Mundo 6: Pueblo de los Problemas (y los problemas que aparecen desde el grado 3 en otros mundos).
import type { Azar } from '../azar';
import { HISTORIAS, type Historia } from '../../content';
import type { Contexto, Ejercicio, Visual } from '../tipos';
import { dosNombres, genero, type Generador, objeto, opcionesNumericas, opcionesTexto, rellenar, texto, uid } from './comun';

type Op = '+' | '−';

const PISTA_OP: Record<Op, string> = {
  '+': 'Si se junta o se agrega, sumamos.',
  '−': 'Si se quita o comparamos, restamos.',
};

function calcular(op: Op, a: number, b: number): number {
  return op === '+' ? a + b : a - b;
}

function contraria(op: Op): Op {
  return op === '+' ? '−' : '+';
}

function objetoDe(az: Azar, h: Historia): string {
  return h.objeto ?? az.elegir(h.objetos ?? ['estrella']);
}

function visualHistoria(obj: string, cantidades: number[], op: Op): Visual {
  if (cantidades.every((c) => c <= 12)) {
    return { tipo: 'escena', objeto: obj, cantidades, nombre: op === '−' ? 'quitar' : 'juntar' };
  }
  return { tipo: 'dibujo', objeto: obj };
}

function base(
  h: Historia,
  az: Azar,
  vars: Record<string, unknown>,
): { consigna: string; nombre: string; nombre2: string } {
  const [nombre, nombre2] = dosNombres(az);
  const consigna = rellenar(h.texto, { ...vars, nombre, nombre2 });
  return { consigna, nombre, nombre2 };
}

/** Arma un problema de un paso con números dados (lo usan sumas y restas desde el grado 3). */
export function problemaConNumeros(az: Azar, ctx: Contexto, op: Op, a: number, b: number, tipos?: string[]): Ejercicio {
  const candidatos = (tipos ?? (op === '+' ? ['juntar', 'agregar'] : ['quitar', 'comparar']))
    .flatMap((t) => HISTORIAS[t] ?? [])
    .filter((h) => h.op === op);
  // Solo historias donde esos números tienen sentido (si no hay ninguna, las que no tienen tope).
  const grande = op === '+' ? a + b : a;
  const caben = candidatos.filter((h) => (h.max ?? Infinity) >= grande);
  const h = az.elegir(caben.length ? caben : candidatos);
  const obj = objetoDe(az, h);
  const { consigna } = base(h, az, { a, b, objetos: objeto(obj), ...genero(obj) });
  const r = calcular(op, a, b);
  const otra = calcular(contraria(op), a, b);
  const previstos: [number, string][] = [];
  if (otra >= 0 && otra !== r) previstos.push([otra, 'problema.operacion']);
  previstos.push([r + 1, 'problema.calculo'], [r - 1, 'problema.calculo']);
  if (r >= 20) previstos.push([r + 10, 'problema.calculo']);
  const { opciones, erroresPrevistos } = opcionesNumericas(az, r, previstos, 'problema.calculo', 4, 0);
  const cuentaTexto = `${a} ${op} ${b} = ${r}`;
  return {
    uid: uid('problema', { a, b, op, h: h.texto.slice(0, 12) }),
    plantillaId: 'problema',
    tema: 'problemas',
    modo: 'opciones',
    consigna,
    visual: visualHistoria(obj, op === '+' ? [a, b] : [a - b, b], op),
    visualEsAyuda: ctx.caracter.ayudas === 'nunca',
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'problema.calculo',
    leccion: { a, b, r, pistaOperacion: PISTA_OP[op], cuentaTexto },
    explicacion: rellenar(texto(az, 'problema', 'explicacion'), { cuentaTexto }),
    pista: texto(az, 'problema', 'pista', op),
    params: { tipo: 'simple', op, a, b },
  };
}

export function numerosPara(az: Azar, rango: number, op: Op): [number, number] {
  const max = Math.max(10, rango);
  // Primero el resultado (repartido parejo) y después los números; el segundo, por lo menos 2.
  if (op === '+') {
    const r = az.entero(Math.max(5, Math.floor(max * 0.3)), max);
    const b = az.entero(2, Math.max(2, r - 2));
    return [r - b, b];
  }
  const r = az.entero(1, Math.max(1, max - 2));
  const b = az.entero(2, Math.max(2, max - r));
  return [r + b, b];
}

/** El rango del ejercicio, sin pasarse de lo que tiene sentido en la historia. */
export function rangoHistoria(h: Historia, rango: number): number {
  return Math.max(10, Math.min(rango, h.max ?? Infinity));
}

export const problema: Generador = (az, ctx): Ejercicio => {
  const tipos = (ctx.params.tipos as string[]) ?? ['juntar'];
  const tipo = az.elegir(tipos);
  const historias = HISTORIAS[tipo];
  if (!historias?.length) throw new Error(`No hay historias del tipo ${tipo}`);
  const h = az.elegir(historias);
  const obj = objetoDe(az, h);

  if (tipo === 'dos-pasos') {
    const [op1, op2] = h.ops as [Op, Op];
    const max = rangoHistoria(h, ctx.rango);
    let a = 0, b = 0, c = 0;
    for (let i = 0; i < 100; i++) {
      a = az.entero(3, Math.max(3, Math.floor(max * 0.6)));
      b = az.entero(1, Math.max(1, Math.floor(max * 0.3)));
      const m = calcular(op1, a, b);
      c = op2 === '−' ? az.entero(1, Math.max(1, m - 1)) : az.entero(1, Math.max(1, max - m));
      if (m > 0 && calcular(op2, m, c) >= 0) break;
    }
    const m = calcular(op1, a, b);
    const r = calcular(op2, m, c);
    const { consigna } = base(h, az, { a, b, c });
    const { opciones, erroresPrevistos } = opcionesNumericas(
      az,
      r,
      [
        [m, 'problema.un-paso'],
        [calcular(op2, a, c), 'problema.un-paso'],
        [a + b + c, 'problema.operacion'],
        [r + 1, 'problema.calculo'],
      ],
      'problema.calculo',
      4,
      0,
    );
    return {
      uid: uid('problema', { tipo, a, b, c }),
      plantillaId: 'problema',
      tema: 'problemas',
      modo: 'opciones',
      consigna,
      visual: { tipo: 'dibujo', objeto: obj },
      respuesta: String(r),
      opciones,
      erroresPrevistos,
      errorTagPorDefecto: 'problema.calculo',
      leccion: {
        a, b, c, r,
        paso1: `${a} ${op1} ${b} = ${m}`,
        paso2: `${m} ${op2} ${c} = ${r}`,
        pistaOperacion: texto(az, 'problema', 'pista', 'dos'),
        cuentaTexto: `${a} ${op1} ${b} ${op2} ${c} = ${r}`,
      },
      explicacion: rellenar(texto(az, 'problema', 'explicacion'), { cuentaTexto: `${a} ${op1} ${b} ${op2} ${c} = ${r}` }),
      pista: texto(az, 'problema', 'pista', 'dos'),
      params: { tipo, a, b, c },
    };
  }

  if (tipo === 'elegir-operacion') {
    const op = h.op as Op;
    const [a, b] = numerosPara(az, rangoHistoria(h, ctx.rango), op);
    const { consigna } = base(h, az, { a, b });
    const sumar = texto(az, 'problema', 'opcionSuma');
    const restar = texto(az, 'problema', 'opcionResta');
    const correcta = op === '+' ? sumar : restar;
    const r = calcular(op, a, b);
    return {
      uid: uid('problema', { tipo, a, b, op }),
      plantillaId: 'problema',
      tema: 'problemas',
      modo: 'opciones',
      consigna,
      visual: visualHistoria(obj, op === '+' ? [a, b] : [a - b, b], op),
      respuesta: correcta,
      opciones: [
        { valor: sumar, texto: `${sumar} (+)`, errorTag: op === '+' ? undefined : 'problema.operacion' },
        { valor: restar, texto: `${restar} (−)`, errorTag: op === '−' ? undefined : 'problema.operacion' },
      ],
      errorTagPorDefecto: 'problema.operacion',
      leccion: { a, b, r, pistaOperacion: PISTA_OP[op], cuentaTexto: `${a} ${op} ${b} = ${r}` },
      explicacion: `${PISTA_OP[op]} ${a} ${op} ${b} = ${r}.`,
      pista: texto(az, 'problema', 'pista', op),
      params: { tipo, a, b, op },
    };
  }

  if (tipo === 'dato-que-falta') {
    const [a, b] = numerosPara(az, ctx.rango, '+');
    const { consigna } = base(h, az, { a, b });
    const falta = texto(az, 'problema', 'noSePuede');
    const opciones = opcionesTexto(
      az,
      falta,
      [
        [String(a + b), 'problema.dato-que-falta'],
        [String(a), 'problema.dato-que-falta'],
        [String(b), 'problema.dato-que-falta'],
      ],
      4,
    );
    return {
      uid: uid('problema', { tipo, a, b, t: h.texto.slice(0, 10) }),
      plantillaId: 'problema',
      tema: 'problemas',
      modo: 'opciones',
      consigna,
      visual: { tipo: 'dibujo', objeto: obj },
      respuesta: falta,
      opciones,
      errorTagPorDefecto: 'problema.dato-que-falta',
      leccion: {
        a, b, r: falta,
        pistaOperacion: 'No sabemos cuántos había, entonces no se puede calcular.',
        cuentaTexto: 'Falta un dato',
      },
      explicacion: 'No sabemos uno de los números: ¡falta un dato!',
      pista: 'Fijate si la historia dice todos los números que necesitás.',
      params: { tipo, a, b },
    };
  }

  // juntar, agregar, quitar, comparar, dinero, dato-que-sobra
  const op = h.op as Op;
  const [a, b] = numerosPara(az, rangoHistoria(h, ctx.rango), op);
  const c = az.entero(3, 12);
  const { consigna } = base(h, az, { a, b, c, objetos: objeto(obj), ...genero(obj) });
  const r = calcular(op, a, b);
  const previstos: [number, string][] = [];
  if (h.sobra) {
    previstos.push([op === '+' ? a + b + c : a - b - c, 'problema.dato-que-sobra'], [op === '+' ? a + c : a - c, 'problema.dato-que-sobra']);
  }
  const otra = calcular(contraria(op), a, b);
  if (otra >= 0) previstos.push([otra, 'problema.operacion']);
  previstos.push([r + 1, 'problema.calculo'], [r - 1, 'problema.calculo']);
  const numericas = opcionesNumericas(az, r, previstos, 'problema.calculo', tipos.includes('dato-que-falta') ? 3 : 4, 0);
  const { erroresPrevistos } = numericas;
  // En el nivel de "datos que faltan", «Falta un dato» aparece siempre (si no, se adivinaba).
  const opciones = tipos.includes('dato-que-falta')
    ? az.mezclar([...numericas.opciones, { valor: texto(az, 'problema', 'noSePuede'), errorTag: 'problema.dato-que-falta' }])
    : numericas.opciones;
  const cuentaTexto = `${a} ${op} ${b} = ${r}`;
  return {
    uid: uid('problema', { tipo, a, b, t: h.texto.slice(0, 10) }),
    plantillaId: 'problema',
    tema: 'problemas',
    modo: 'opciones',
    consigna,
    visual: h.pesos ? { tipo: 'dibujo', objeto: obj } : visualHistoria(obj, op === '+' ? [a, b] : [a - b, b], op),
    visualEsAyuda: ctx.caracter.ayudas === 'nunca',
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'problema.calculo',
    leccion: { a, b, r, pistaOperacion: PISTA_OP[op], cuentaTexto },
    explicacion: rellenar(texto(az, 'problema', 'explicacion'), { cuentaTexto }),
    pista: texto(az, 'problema', 'pista', op),
    params: { tipo, a, b, op },
  };
};
