import { describe, expect, it } from 'vitest';
import { validarApodo } from '../../src/engine/apodo';
import { enLetras } from '../../src/engine/numerosEnLetras';
import { diaArgentina, diasQueFaltan, lunesDeLaSemana } from '../../src/engine/semana';
import { clavesAudio, partirTexto } from '../../src/engine/voz';

describe('números en letras', () => {
  it.each([
    [0, 'cero'], [16, 'dieciséis'], [21, 'veintiuno'], [47, 'cuarenta y siete'], [100, 'cien'], [101, 'ciento uno'],
    [407, 'cuatrocientos siete'], [555, 'quinientos cincuenta y cinco'], [999, 'novecientos noventa y nueve'],
    [1000, 'mil'], [2350, 'dos mil trescientos cincuenta'], [10000, 'diez mil'],
  ])('%i → %s', (n, t) => expect(enLetras(n)).toBe(t));
});

describe('semana en hora de Argentina', () => {
  it('el domingo 23:59 sigue siendo la semana anterior', () => {
    // Domingo 18/10/2026 23:59 en Argentina = lunes 19/10 02:59 UTC.
    const d = new Date('2026-10-19T02:59:00Z');
    expect(diaArgentina(d)).toBe('2026-10-18');
    expect(lunesDeLaSemana(d)).toBe('2026-10-12');
  });
  it('el lunes 00:00 empieza la semana nueva', () => {
    const d = new Date('2026-10-19T03:00:00Z');
    expect(lunesDeLaSemana(d)).toBe('2026-10-19');
    expect(diasQueFaltan(d)).toBe(7);
  });
});

describe('apodos', () => {
  it('acepta apodos de juego', () => {
    for (const a of ['Estrellita', 'Luna Feliz', 'Gatita 22', 'Dragui']) expect(validarApodo(a)).toBeNull();
  });
  it('rechaza groserías, contacto, nombres reales y teléfonos', () => {
    expect(validarApodo('boluda')).toBe('groseria');
    expect(validarApodo('Superpelotuda')).toBe('groseria');
    expect(validarApodo('ana@mail')).toBe('contacto');
    expect(validarApodo('mi insta')).toBe('contacto');
    expect(validarApodo('Sofía')).toBe('nombre');
    expect(validarApodo('Gati 1144556677')).toBe('numeros');
    expect(validarApodo('ab')).toBe('corto');
    expect(validarApodo('<script>')).toBe('caracteres');
  });
});

describe('voz por pedacitos', () => {
  it('separa texto fijo, números y pesos', () => {
    expect(partirTexto('El helado cuesta $75. Armá ese pago.')).toEqual([
      { tipo: 'texto', texto: 'El helado cuesta' },
      { tipo: 'numero', n: 75 },
      { tipo: 'texto', texto: 'pesos' },
      { tipo: 'texto', texto: '. Armá ese pago.' },
    ]);
  });
  it('lee los signos de las cuentas', () => {
    const p = partirTexto('3 × 4 = 12');
    expect(p.map((x) => (x.tipo === 'numero' ? x.n : x.texto))).toEqual([3, 'por', 4, 'es igual a', 12]);
  });
  it('arma los miles con dos audios', () => {
    expect(clavesAudio({ tipo: 'numero', n: 2350 })).toEqual(['m-2', 'n-350']);
    expect(clavesAudio({ tipo: 'numero', n: 1.0e3 })).toEqual(['n-1000']);
    expect(partirTexto('1.000')[0]).toEqual({ tipo: 'numero', n: 1000 });
  });
});
