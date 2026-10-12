import { describe, expect, it } from 'vitest';
import { ERRORES, MUNDOS } from '../../src/content';
import { crearAzar } from '../../src/engine/azar';
import { limitesGrado } from '../../src/engine/escalera';
import { generarEjercicio } from '../../src/engine/generar';
import { armarLeccion, contarPalabras } from '../../src/engine/leccion';
import { restaInvertida, restaOlvidaPrestamo, sumaSinLlevar } from '../../src/engine/generadores/sumasRestas';
import type { Ejercicio } from '../../src/engine/tipos';

const SIN_LLAVES = /\{\w+\}/;

function revisar(ej: Ejercicio, donde: string) {
  const ctx = `${donde} → ${ej.uid}`;
  expect(ej.respuesta, ctx).toBeTruthy();
  for (const t of [ej.consigna, ej.explicacion, ej.pista]) {
    expect(t, ctx).not.toMatch(SIN_LLAVES);
    expect(t, ctx).not.toContain('undefined');
    expect(t, ctx).not.toContain('NaN');
  }
  expect(ERRORES[ej.errorTagPorDefecto], `${ctx} errorTag por defecto ${ej.errorTagPorDefecto}`).toBeDefined();
  const tags = new Set<string>([ej.errorTagPorDefecto]);
  if (ej.modo === 'opciones') {
    const ops = ej.opciones ?? [];
    expect(ops.length, ctx).toBeGreaterThanOrEqual(2);
    expect(new Set(ops.map((o) => o.valor)).size, `${ctx} opciones repetidas`).toBe(ops.length);
    expect(ops.filter((o) => o.valor === ej.respuesta).length, `${ctx} una sola correcta`).toBe(1);
    for (const o of ops) {
      if (o.valor === ej.respuesta) {
        expect(o.errorTag, ctx).toBeUndefined();
      } else {
        expect(o.errorTag, `${ctx} opción ${o.valor} sin errorTag`).toBeTruthy();
        tags.add(o.errorTag!);
      }
      if (/^-?\d+$/.test(o.valor)) expect(Number(o.valor), ctx).toBeGreaterThanOrEqual(0);
    }
  }
  for (const [v, t] of Object.entries(ej.erroresPrevistos ?? {})) {
    expect(v, ctx).not.toBe(ej.respuesta);
    tags.add(t);
  }
  if (ej.modo === 'teclado') expect(ej.respuesta, ctx).toMatch(/^\d+$/);
  if (ej.modo === 'ordenar') expect(ej.datos?.ordenar?.length, ctx).toBe(4);
  if (ej.modo === 'dinero') expect(ej.datos?.dinero?.precio, ctx).toBeGreaterThan(0);
  if (ej.modo === 'memoria') expect(ej.datos?.memoria?.length, ctx).toBeGreaterThanOrEqual(3);
  if (ej.modo === 'arrastrar') expect(ej.datos?.arrastrar?.grupos, ctx).toBeGreaterThan(1);
  if (ej.modo === 'bloques') expect(ej.datos?.bloques?.numero, ctx).toBeGreaterThan(0);
  // Cada errorTag posible tiene una minilección de máximo 3 pasos y 15 palabras por paso.
  for (const t of tags) {
    expect(ERRORES[t], `${ctx} errorTag ${t} no está en el vocabulario`).toBeDefined();
    const lec = armarLeccion(t, ej);
    expect(lec.pasos.length, `${ctx} ${t}`).toBeGreaterThanOrEqual(1);
    expect(lec.pasos.length, `${ctx} ${t}`).toBeLessThanOrEqual(3);
    for (const p of lec.pasos) {
      expect(p, `${ctx} ${t} paso sin completar`).not.toMatch(SIN_LLAVES);
      expect(p, `${ctx} ${t}`).not.toContain('undefined');
      expect(contarPalabras(p), `${ctx} ${t} "${p}" tiene más de 15 palabras`).toBeLessThanOrEqual(15);
    }
  }
}

describe('generadores de ejercicios', () => {
  for (const mundo of MUNDOS) {
    for (const nivel of [...mundo.niveles, mundo.jefe]) {
      it(`${nivel.id}: todos los grados generan ejercicios válidos`, () => {
        const az = crearAzar(1234);
        for (let grado = 1; grado <= 5; grado++) {
          const lim = limitesGrado(nivel, mundo.escala, grado);
          const peldanos = lim.escalera.filter((p) => p >= lim.minimo && p >= lim.inicio && p <= lim.techo);
          expect(peldanos.length, `${nivel.id} grado ${grado}`).toBeGreaterThan(0);
          for (const rango of peldanos) {
            for (let i = 0; i < 25; i++) {
              revisar(generarEjercicio(az, mundo, nivel, grado, rango), `${nivel.id} g${grado} r${rango}`);
            }
          }
          // También el rango más bajo posible (después de bajar peldaños).
          for (let i = 0; i < 10; i++) revisar(generarEjercicio(az, mundo, nivel, grado, lim.minimo), `${nivel.id} g${grado} min`);
        }
      });
    }
  }

  it('no repite ejercicios en la misma sesión cuando hay variedad', () => {
    const az = crearAzar(7);
    const mundo = MUNDOS[1];
    const nivel = mundo.niveles[4];
    const vistos = new Set<string>();
    for (let i = 0; i < 15; i++) {
      const ej = generarEjercicio(az, mundo, nivel, 1, 100, vistos);
      expect(vistos.has(ej.uid)).toBe(false);
      vistos.add(ej.uid);
    }
  });

  it('los ejercicios correctos son correctos', () => {
    const az = crearAzar(99);
    const valle = MUNDOS[1];
    for (let i = 0; i < 200; i++) {
      const ej = generarEjercicio(az, valle, valle.niveles[4], 1, 100);
      if (ej.plantillaId !== 'suma') continue;
      const { a, b } = ej.params as { a: number; b: number };
      expect(Number(ej.respuesta)).toBe(a + b);
    }
  });
});

describe('errores típicos', () => {
  it('olvidar la llevada: 47 + 38 = 75', () => expect(sumaSinLlevar(47, 38)).toBe(75));
  it('resta dando vuelta columnas: 52 − 27 = 35', () => expect(restaInvertida(52, 27)).toBe(35));
  it('olvida descontar el préstamo: 61 − 28 = 43', () => expect(restaOlvidaPrestamo(61, 28)).toBe(43));
});
