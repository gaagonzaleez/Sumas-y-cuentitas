// Mundo 4: Bosque de las Tablas.
import { config } from '../../content';
import type { Azar } from '../azar';
import type { Contexto } from '../tipos';
import { genero, plural, type Generador, objeto, opcionesNumericas, opcionesTexto, rellenar, sumaRepetidaTexto, texto, uid, usaTeclado, visualEsAyuda } from './comun';

const OBJ_GRUPOS = ['manzana', 'frutilla', 'flor', 'hongo', 'estrella', 'caramelo'];

export function datosGrupos(g: number, p: number) {
  return { g, p, r: g * p, sumaRepetida: sumaRepetidaTexto(g, p), gTxt: plural(g, 'grupo', 'grupos') };
}

/** Elige la tabla: las del nivel y, en grados de desafío, a veces una del 6 al 9. */
export function elegirTabla(az: Azar, ctx: Contexto): number {
  const tablas = (ctx.params.tablas as number[]) ?? [2];
  const desafio = (ctx.params.desafio as boolean) || ctx.caracter.desafioTablas;
  if (desafio && az.chance(0.3)) return az.elegir(config.dificultad.tablasDesafio);
  return az.elegir(tablas);
}

export const gruposIguales: Generador = (az, ctx) => {
  const tope = Math.min(6, Math.max(3, ctx.rango));
  const g = az.entero(2, Math.min(5, tope));
  const p = az.entero(2, tope);
  const obj = az.elegir(OBJ_GRUPOS);
  const r = g * p;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [g + p, 'tabla.suma-en-vez'],
      [(g + 1) * p, 'grupos.cuenta-uno'],
      [(g - 1) * p, 'grupos.cuenta-uno'],
      [r + 1, 'tabla.calculo'],
    ],
    'tabla.calculo',
    4,
    1,
  );
  return {
    uid: uid('grupos-iguales', { g, p, obj }),
    plantillaId: 'grupos-iguales',
    tema: 'tablas',
    modo: 'opciones',
    consigna: rellenar(texto(az, 'grupos-iguales', 'consigna'), { g, p, grupos: objeto('canasta', g), objetos: objeto(obj, p), ...genero(obj) }),
    cuenta: `${g} × ${p} = ?`,
    visual: { tipo: 'grupos', objeto: obj, grupos: g, porGrupo: p },
    respuesta: String(r),
    opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'tabla.calculo',
    leccion: datosGrupos(g, p),
    explicacion: rellenar(texto(az, 'grupos-iguales', 'explicacion'), { g, p, r }),
    pista: texto(az, 'grupos-iguales', 'pista'),
    params: { g, p, obj },
  };
};

export const sumaRepetida: Generador = (az, ctx) => {
  const g = az.entero(2, 5);
  const p = az.entero(2, Math.max(3, ctx.rango));
  const suma = sumaRepetidaTexto(g, p);
  const r = g * p;
  const variante = az.chance(0.5) ? 'resultado' : 'multiplicacion';
  const base = {
    uid: uid('suma-repetida', { g, p, variante }),
    plantillaId: 'suma-repetida',
    tema: 'tablas' as const,
    modo: 'opciones' as const,
    consigna: rellenar(texto(az, 'suma-repetida', 'consigna', variante), { suma }),
    visual: { tipo: 'grupos' as const, objeto: az.elegir(OBJ_GRUPOS), grupos: g, porGrupo: p },
    visualEsAyuda: visualEsAyuda(az, ctx),
    errorTagPorDefecto: 'tabla.calculo',
    leccion: datosGrupos(g, p),
    explicacion: rellenar(texto(az, 'suma-repetida', 'explicacion'), { suma, g, p, r }),
    pista: texto(az, 'suma-repetida', 'pista'),
    params: { g, p, variante },
  };
  if (variante === 'multiplicacion') {
    const correcta = `${g} × ${p}`;
    return {
      ...base,
      respuesta: correcta,
      opciones: opcionesTexto(
        az,
        correcta,
        [
          [`${g} + ${p}`, 'tabla.suma-en-vez'],
          [`${g + 1} × ${p}`, 'grupos.cuenta-uno'],
          [`${p} × ${p}`, 'grupos.cuenta-uno'],
          [`${Math.max(1, g - 1)} × ${p}`, 'grupos.cuenta-uno'],
        ],
        4,
      ),
    };
  }
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [g + p, 'tabla.suma-en-vez'],
      [(g + 1) * p, 'grupos.cuenta-uno'],
      [(g - 1) * p, 'grupos.cuenta-uno'],
    ],
    'tabla.calculo',
    4,
    1,
  );
  return { ...base, cuenta: `${suma} = ?`, respuesta: String(r), opciones, erroresPrevistos };
};

export const tabla: Generador = (az, ctx) => {
  const t = elegirTabla(az, ctx);
  const k = az.entero(2, Math.max(2, ctx.rango));
  const r = k * t;
  const cuenta = `${k} × ${t}`;
  const { opciones, erroresPrevistos } = opcionesNumericas(
    az,
    r,
    [
      [k + t, 'tabla.suma-en-vez'],
      [(k + 1) * t, 'tabla.vecino'],
      [(k - 1) * t, 'tabla.vecino'],
      [r + 1, 'tabla.calculo'],
    ],
    'tabla.calculo',
    4,
    0,
  );
  const teclado = usaTeclado(az, ctx);
  return {
    uid: uid('tabla', { k, t }),
    plantillaId: 'tabla',
    tema: 'tablas',
    modo: teclado ? 'teclado' : 'opciones',
    consigna: rellenar(texto(az, 'tabla', 'consigna'), { cuenta, t }),
    cuenta: `${cuenta} = ?`,
    visual: { tipo: 'grupos', objeto: az.elegir(OBJ_GRUPOS), grupos: k, porGrupo: t },
    visualEsAyuda: k > 6 || t > 6 ? true : visualEsAyuda(az, ctx),
    respuesta: String(r),
    opciones: teclado ? undefined : opciones,
    erroresPrevistos,
    errorTagPorDefecto: 'tabla.calculo',
    leccion: datosGrupos(k, t),
    explicacion: rellenar(texto(az, 'tabla', 'explicacion'), { g: k, p: t, r }),
    pista: rellenar(texto(az, 'tabla', 'pista'), { g: k, p: t }),
    params: { k, t },
  };
};

export const memoriaTablas: Generador = (az, ctx) => {
  const pares: { cuenta: string; resultado: string }[] = [];
  const usados = new Set<number>();
  let intentos = 0;
  while (pares.length < 4 && intentos++ < 100) {
    const t = elegirTabla(az, ctx);
    const k = az.entero(2, Math.max(2, ctx.rango));
    if (usados.has(k * t)) continue;
    usados.add(k * t);
    pares.push({ cuenta: `${k} × ${t}`, resultado: String(k * t) });
  }
  const [k0, t0] = pares[0].cuenta.split(' × ').map(Number);
  return {
    uid: uid('memoria-tablas', { p: pares.map((p) => p.cuenta).join('|') }),
    plantillaId: 'memoria-tablas',
    tema: 'tablas',
    modo: 'memoria',
    consigna: texto(az, 'memoria-tablas', 'consigna'),
    respuesta: 'ok',
    datos: { memoria: pares },
    errorTagPorDefecto: 'tabla.calculo',
    leccion: datosGrupos(k0, t0),
    explicacion: texto(az, 'memoria-tablas', 'explicacion'),
    pista: texto(az, 'memoria-tablas', 'pista'),
    params: { p: pares.map((p) => p.cuenta).join('|') },
  };
};

export const armarGrupos: Generador = (az, ctx) => {
  const g = az.entero(2, 4);
  const p = az.entero(2, Math.min(5, Math.max(2, ctx.rango)));
  const obj = az.elegir(OBJ_GRUPOS);
  const r = g * p;
  return {
    uid: uid('armar-grupos', { g, p }),
    plantillaId: 'armar-grupos',
    tema: 'tablas',
    modo: 'arrastrar',
    consigna: rellenar(texto(az, 'armar-grupos', 'consigna'), { p, objetos: objeto(obj, p) }),
    respuesta: Array.from({ length: g }, () => p).join(','),
    datos: { arrastrar: { grupos: g, porGrupo: p, objeto: obj } },
    errorTagPorDefecto: 'grupos.cuenta-uno',
    leccion: datosGrupos(g, p),
    explicacion: rellenar(texto(az, 'armar-grupos', 'explicacion'), { g, p, r, objetos: objeto(obj, r) }),
    pista: texto(az, 'armar-grupos', 'pista'),
    params: { g, p },
  };
};
