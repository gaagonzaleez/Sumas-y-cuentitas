import { describe, expect, it } from 'vitest';
import { config, MUNDOS } from '../../src/content';
import { limitesGrado, nuevaEscalera, registrar } from '../../src/engine/escalera';
import { estrellasDe, gradoCompleto, monedasPorAcierto, nuevaSesion, resolver, responder, sumarTiempo } from '../../src/engine/sesion';

const valle = MUNDOS[1];

describe('escalera de dificultad', () => {
  it('cada grado arranca más arriba que el anterior y puede subir 3 peldaños', () => {
    const nivel = valle.niveles[4]; // sumas con llevada (empieza en 50)
    const inicios = [1, 2, 3, 4, 5].map((g) => limitesGrado(nivel, 'sumas', g).inicio);
    expect(inicios).toEqual([50, 70, 90, 200, 400]);
    expect(limitesGrado(nivel, 'sumas', 1).techo).toBe(80);
    expect(limitesGrado(nivel, 'sumas', 4).techo).toBe(500);
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

  it('las primeras sumas empiezan en 10 y crecen grado a grado', () => {
    const lim = limitesGrado(valle.niveles[0], 'sumas', 1);
    expect(lim.inicio).toBe(10);
    expect(lim.techo).toBe(40);
    expect(limitesGrado(valle.niveles[0], 'sumas', 5).techo).toBe(300);
  });

  it('sube un peldaño tras 5 aciertos seguidos sin ayuda', () => {
    const lim = limitesGrado(valle.niveles[1], 'sumas', 1);
    let e = nuevaEscalera(lim);
    expect(e.rango).toBe(20);
    for (let i = 0; i < 4; i++) {
      const r = registrar(e, lim, true, false);
      expect(r.subio).toBe(false);
      e = r.estado;
    }
    const r = registrar(e, lim, true, false);
    expect(r.subio).toBe(true);
    expect(r.estado.rango).toBe(30);
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
    let e = { ...nuevaEscalera(lim), rango: 200 };
    const r1 = registrar(e, lim, false, false);
    expect(r1.estado.rango).toBe(200);
    expect(r1.activarPista).toBe(false);
    const r2 = registrar(r1.estado, lim, false, true);
    expect(r2.estado.rango).toBe(100);
    expect(r2.bajo).toBe(true);
    expect(r2.activarPista).toBe(true);
  });

  it('pasa de 100 a 200 (después de 100 sube de a 100) y no supera el techo', () => {
    const lim = limitesGrado(valle.niveles[4], 'sumas', 3);
    let e = { ...nuevaEscalera(lim), rango: 100 };
    for (let i = 0; i < 5; i++) e = registrar(e, lim, true, false).estado;
    expect(e.rango).toBe(200);
    for (let i = 0; i < 20; i++) e = registrar(e, lim, true, false).estado;
    expect(e.rango).toBe(300); // techo del grado 3
  });

  it('las tablas suben los factores', () => {
    const lim = limitesGrado(MUNDOS[3].niveles[2], 'tablas', 1);
    expect(lim.inicio).toBe(6);
    expect(lim.techo).toBe(9);
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

  it('se completa al contestar las 15 preguntas, sin esperar tiempo (decisión de Ga)', () => {
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

  it('monedas: 5 al primer intento, 2 con ayuda, nunca resta', () => {
    expect(monedasPorAcierto({ correcta: true, conAyuda: false, despuesDeLeccion: false })).toBe(5);
    expect(monedasPorAcierto({ correcta: true, conAyuda: true, despuesDeLeccion: false })).toBe(2);
    expect(monedasPorAcierto({ correcta: true, conAyuda: false, despuesDeLeccion: true })).toBe(5);
    expect(monedasPorAcierto({ correcta: false, conAyuda: false, despuesDeLeccion: false })).toBe(0);
    let s = nuevaSesion('valle-1', 1, lim);
    s = responder(s, { correcta: true, conAyuda: false, despuesDeLeccion: false }).sesion;
    const antes = s.monedas;
    s = responder(s, { correcta: false, conAyuda: false, despuesDeLeccion: false }).sesion;
    expect(s.monedas).toBe(antes);
  });
});
