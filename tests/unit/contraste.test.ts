import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Contraste de texto 4,5:1 como mínimo para todas las combinaciones de texto de la interfaz.
const css = readFileSync('src/styles.css', 'utf8');
const token = (n: string) => css.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`))![1];

function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const PARES: [string, string][] = [
  ['tinta', 'fondo'], ['tinta', 'blanco'], ['tinta-suave', 'fondo'], ['tinta-suave', 'blanco'], ['tinta-suave', 'lavanda'],
  ['blanco', 'violeta'], ['violeta', 'blanco'], ['violeta', 'lavanda'], ['violeta', 'fondo'], ['tinta', 'amarillo'], ['tinta', 'amarillo-claro'],
  ['turquesa-oscuro', 'turquesa-claro'], ['turquesa-oscuro', 'blanco'], ['blanco', 'turquesa-oscuro'],
  ['naranja-texto', 'naranja-claro'], ['coral-oscuro', 'blanco'], ['coral-oscuro', 'coral-claro'], ['tinta', 'lavanda'], ['tinta', 'turquesa-claro'], ['tinta', 'coral-claro'],
];

describe('contraste de colores (WCAG AA)', () => {
  it.each(PARES)('%s sobre %s ≥ 4,5:1', (t, f) => {
    expect(contraste(token(t), token(f))).toBeGreaterThanOrEqual(4.5);
  });
});
