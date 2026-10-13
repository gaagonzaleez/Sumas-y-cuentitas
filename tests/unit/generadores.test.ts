import { describe, expect, it } from 'vitest';
import { ERRORES, MUNDOS } from '../../src/content';
import { crearAzar } from '../../src/engine/azar';
import { limitesGrado } from '../../src/engine/escalera';
import { generarEjercicio } from '../../src/engine/generar';
import { armarLeccion, contarPalabras } from '../../src/engine/leccion';
import { restaInvertida, restaOlvidaPrestamo, sumaSinLlevar } from '../../src/engine/generadores/sumasRestas';
import type { Ejercicio } from '../../src/engine/tipos';

const SIN_LLAVES = /\{\w+\}/;

/** Toda cuenta escrita en una explicación tiene que estar bien hecha: "13 − 4 = 9", "6 + 10 + 4 = 20". */
function revisarCuentas(texto: string, donde: string) {
  for (const m of texto.matchAll(/(?<![\d$])(\d+(?: [+−×] \d+)+) = (\d+)(?!\d| [+−×])/g)) {
    const partes = m[1].split(' ');
    let total = Number(partes[0]);
    for (let i = 1; i < partes.length; i += 2) {
      const n = Number(partes[i + 1]);
      total = partes[i] === '+' ? total + n : partes[i] === '−' ? total - n : total * n;
    }
    expect(total, `${donde}: "${m[0]}" en "${texto}"`).toBe(Number(m[2]));
  }
  // Singular y plural: nada de "1 pesos", "faltan 1" ni "quedan 1".
  expect(texto, donde).not.toMatch(/(?<![\d.])1 (pesos|decenas|centenas|unidades|puntos|grupos)\b|\b(faltan|quedan|sobran) 1\b/);
}

describe('variedad', () => {
  it('cada nivel tiene por lo menos 5 juegos distintos', () => {
    for (const m of MUNDOS) for (const n of [...m.niveles, m.jefe]) expect(new Set(n.plantillas.map((p) => p.id)).size, n.id).toBeGreaterThanOrEqual(5);
  });
});

function revisar(ej: Ejercicio, donde: string) {
  const ctx = `${donde} → ${ej.uid}`;
  expect(ej.respuesta, ctx).toBeTruthy();
  for (const t of [ej.consigna, ej.explicacion, ej.pista]) {
    revisarCuentas(t, ctx);
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
  if (ej.modo === 'elegir') {
    const e = ej.datos!.elegir!;
    const valores = e.items.map((i) => i.valor);
    if (e.regla === 'suma') {
      // Tiene que haber alguna combinación que sume justo el objetivo.
      const sumas = valores.reduce((acc, v) => new Set([...acc, ...[...acc].map((x) => x + v)]), new Set([0]));
      expect(sumas.has(e.objetivo!), `${ctx} escoba sin solución`).toBe(true);
    } else if (e.regla === 'presupuesto') {
      const baratos = [...valores].sort((a, b) => a - b).slice(0, e.cantidad);
      expect(baratos.reduce((a, b) => a + b, 0), `${ctx} carrito imposible`).toBeLessThanOrEqual(e.objetivo!);
    } else expect(e.correctas?.length, ctx).toBeGreaterThan(0);
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
      revisarCuentas(p, `${ctx} ${t}`);
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

describe('opciones sin pistas escondidas', () => {
  it('la respuesta correcta no se adivina por su tamaño (ni siempre la del medio)', () => {
    const az = crearAzar(77);
    const pos = [0, 0, 0, 0];
    for (const mundo of MUNDOS)
      for (const nivel of mundo.niveles)
        for (const grado of [1, 3, 5]) {
          const lim = limitesGrado(nivel, mundo.escala, grado);
          for (const p of nivel.plantillas)
            for (let i = 0; i < 6; i++) {
              const ej = generarEjercicio(az, mundo, nivel, grado, lim.inicio, new Set(), p);
              const nums = ej.opciones?.map((o) => Number(o.valor));
              if (!nums || nums.length !== 4 || nums.some(Number.isNaN)) continue;
              pos[[...nums].sort((a, b) => a - b).indexOf(Number(ej.respuesta))]++;
            }
        }
    const total = pos.reduce((a, b) => a + b, 0);
    for (const n of pos) expect(n / total).toBeGreaterThan(0.15);
  });
});
