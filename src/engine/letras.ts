// Comparar lo que la nena escribe con letras: sin importar mayúsculas, tildes ni espacios de más.
export function normalizarLetras(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-zñ ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿Es la misma palabra? "Veintidos", "veintidós " y "VEINTIDÓS" valen igual. */
export function mismasLetras(a: string, b: string): boolean {
  const x = normalizarLetras(a);
  const y = normalizarLetras(b);
  return x === y || x.replace(/ /g, '') === y.replace(/ /g, '');
}

/** Distancia de edición (cuántas letras hay que cambiar, agregar o sacar). */
export function distancia(a: string, b: string): number {
  const x = normalizarLetras(a);
  const y = normalizarLetras(b);
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return d[x.length][y.length];
}
