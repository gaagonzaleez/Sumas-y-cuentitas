import { describe, expect, it } from 'vitest';
import { config, MUNDOS } from '../../src/content';
import { limitesGrado, nuevaEscalera, registrar } from '../../src/engine/escalera';
import { estrellasDe, gradoCompleto, monedasPorAcierto, nuevaSesion, resolver, responder, sumarTiempo } from '../../src/engine/sesion';

const valle = MUNDOS[1];

describe('escalera de dificultad', () => {
  it('decisión de Ga: el grado 1 llega hasta 150 y cada grado suma 150 (en todos los mundos)', () => {
    for (const m of MUNDOS) {
      if (m.escala === 'tablas') continue;
      for (const n of [...m.niveles, m.jefe]) {
        const inicios = [1, 2, 3, 4, 5].map((g) => limitesGrado(n, m.escala, g).inicio);
        expect(inicios, n.id).toEqual([100, 250, 400, 550, 700]);
      }
    }
    expect([1, 2, 3, 4, 5].map((g) => limitesGrado(valle.niveles[4], 'sumas', g).techo)).toEqual([150, 300, 450, 600, 750]);
  });

  it('ningún grado queda trabado en un solo número (salvo en el techo del nivel)', () => {
    for (const m of MUNDOS)
      for (const n of [...m.niveles, m.jefe])
        for (let g = 1; g <= 5; g++) {
          const l = limitesGrado(n, m.escala, g);
          expect(l.inicio, `${n.id} g${g}`).toBeLessThanOrEqual(l.techo);
          if (g < 5 && l.techo < (n.techoNivel ?? Infinity) && l.techo < l.escalera[l.escalera.length - 1])
            expect(l.techo, `${n.id} g${g}`).toBeGreaterThan(l.inicio);
        }
  });

  it('sube un peldaño tras 5 aciertos seguidos sin ayuda', () => {
    const lim = limitesGrado(valle.niveles[1], 'sumas', 1);
    let e = nuevaEscalera(lim);
    expect(e.rango).toBe(100);
    for (let i = 0; i < 4; i++) {
      const r = registrar(e, lim, true, false);
      expect(r.subio).toBe(false);
      e = r.estado;
    }
    const r = registrar(e, lim, true, false);
    expect(r.subio).toBe(true);
    expect(r.estado.rango).toBe(150);
  });

  it('una respuesta con ayuda corta la racha', () => {
    const lim = limitesGrado(valle.niveles[1], 'sumas', 1);
    let e = nuevaEscalera(lim);
    for (let i = 0; i < 4; i++) e = registrar(e, lim, true, false).estado;
    e = registrar(e, lim, true, true).estado;
    expect(registrar(e, lim, true, false).subio).toBe(false);
  });

  it('un error no cambia el rango; dos seguidos bajan un peldaño y activan una pista', () => {
    const lim = limitesGrado(valle.niveles[4], 'sumas', 3);
    const e = { ...nuevaEscalera(lim), rango: 450 };
    const r1 = registrar(e, lim, false, false);
    expect(r1.estado.rango).toBe(450);
    expect(r1.activarPista).toBe(false);
    const r2 = registrar(r1.estado, lim, false, true);
    expect(r2.estado.rango).toBe(400);
    expect(r2.bajo).toBe(true);
    expect(r2.activarPista).toBe(true);
  });

  it('sube de a 50 y no supera el techo del grado', () => {
    const lim = limitesGrado(valle.niveles[4], 'sumas', 3);
    let e = { ...nuevaEscalera(lim), rango: 400 };
    for (let i = 0; i < 5; i++) e = registrar(e, lim, true, false).estado;
    expect(e.rango).toBe(450);
    for (let i = 0; i < 20; i++) e = registrar(e, lim, true, false).estado;
    expect(e.rango).toBe(450); // techo del grado 3
  });

  it('las tablas suben los factores', () => {
    const lim = limitesGrado(MUNDOS[3].niveles[2], 'tablas', 1);
    expect(lim.inicio).toBe(6);
    expect(lim.techo).toBe(7);
    expect(limitesGrado(MUNDOS[3].niveles[2], 'tablas', 3).inicio).toBe(8);
  });
});

describe('sesión de un grado', () => {
  const lim = limitesGrado(valle.niveles[0], 'sumas', 1);
  const g = config.economia.grado;

  function jugar(n: number, primerIntento: (i: number) => boolean, minutos: number, pistas = false) {
    let s = nuevaSesion('valle-1', 1, lim);
    for (let i = 0; i < n; i++) s = resolver(s, primerIntento(i), `e${i}`, pistas);
    return sumarTiempo(s, minutos * 60_000);
  }

  it('se completa al contestar las 10 preguntas, sin esperar tiempo (decisión de Ga)', () => {
    expect(gradoCompleto(jugar(g.ejerciciosMinimos, () => true, 0))).toBe(true);
    expect(gradoCompleto(jugar(g.ejerciciosMinimos, (i) => i % 2 === 0, 0))).toBe(true);
    expect(gradoCompleto(jugar(g.ejerciciosMinimos - 1, () => true, 10))).toBe(false);
  });

  it('estrellas: 1 al completar, 2 con 75 %, 3 con 90 % y sin pistas', () => {
    expect(estrellasDe(jugar(20, (i) => i % 2 === 0, 6))).toBe(1);
    expect(estrellasDe(jugar(20, (i) => i % 5 !== 0, 6))).toBe(2);
    expect(estrellasDe(jugar(20, () => true, 6))).toBe(3);
    expect(estrellasDe(jugar(20, () => true, 6, true))).toBe(2);
  });

  it('monedas por acierto según la configuración (los errores se restan aparte, en el juego)', () => {
    const mc = config.economia.monedas;
    expect(monedasPorAcierto({ correcta: true, conAyuda: false, despuesDeLeccion: false })).toBe(mc.correctaPrimerIntento);
    expect(monedasPorAcierto({ correcta: true, conAyuda: true, despuesDeLeccion: false })).toBe(mc.correctaConAyuda);
    expect(monedasPorAcierto({ correcta: true, conAyuda: false, despuesDeLeccion: true })).toBe(mc.correctaDespuesDeLeccion);
    expect(monedasPorAcierto({ correcta: false, conAyuda: false, despuesDeLeccion: false })).toBe(0);
    let s = nuevaSesion('valle-1', 1, lim);
    s = responder(s, { correcta: true, conAyuda: false, despuesDeLeccion: false }).sesion;
    const antes = s.monedas;
    s = responder(s, { correcta: false, conAyuda: false, despuesDeLeccion: false }).sesion;
    expect(s.monedas).toBe(antes);
  });
});

describe('qué juegos salen más (decisión de Ga)', () => {
  const j = config.juegos as unknown as Record<string, string[]> & { pesos: Record<string, number> };
  const nivelDe = (id: string) => (['muyFacil', 'facil', 'medio', 'dificil'] as const).find((k) => j[k].includes(id));

  it('todos los juegos tienen dificultad y contar dibujitos es el que menos sale', () => {
    for (const m of MUNDOS)
      for (const n of [...m.niveles, m.jefe]) {
        const pesos = n.plantillas.map((p) => p.peso);
        for (const p of n.plantillas) {
          expect(nivelDe(p.id), `${n.id} ${p.id}`).toBeDefined();
          if (p.id === 'contar') expect(p.peso).toBe(Math.min(...pesos));
          // Un juego difícil nunca sale menos que uno fácil del mismo nivel.
          if (nivelDe(p.id) === 'dificil') expect(p.peso, `${n.id} ${p.id}`).toBe(Math.max(...pesos));
        }
      }
  });

  it('no repite el mismo juego en preguntas seguidas', async () => {
    const { crearAzar } = await import('../../src/engine/azar');
    const { generarEjercicio } = await import('../../src/engine/generar');
    const az = crearAzar(7);
    for (const m of MUNDOS)
      for (const n of m.niveles) {
        const ids: string[] = [];
        for (let i = 0; i < 10; i++) ids.push(generarEjercicio(az, m, n, 1, 200, new Set(), undefined, ids).plantillaId);
        for (let i = 1; i < ids.length; i++) expect(ids[i], `${n.id}: ${ids.join(', ')}`).not.toBe(ids[i - 1]);
      }
  });
});
