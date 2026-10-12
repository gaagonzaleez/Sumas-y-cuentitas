// Escribe números en letras, en español rioplatense (hasta 10.000).
const UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const ESPECIALES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const VEINTI = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function menorQueCien(n: number): string {
  if (n < 10) return UNIDADES[n];
  if (n < 20) return ESPECIALES[n - 10];
  if (n < 30) return VEINTI[n - 20];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} y ${UNIDADES[u]}`;
}

function menorQueMil(n: number): string {
  if (n < 100) return menorQueCien(n);
  if (n === 100) return 'cien';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  return resto === 0 ? CENTENAS[c] : `${CENTENAS[c]} ${menorQueCien(resto)}`;
}

export function enLetras(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 10000) throw new Error(`Número fuera de rango: ${n}`);
  if (n < 1000) return menorQueMil(n);
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const parteMiles = miles === 1 ? 'mil' : `${menorQueCien(miles)} mil`;
  return resto === 0 ? parteMiles : `${parteMiles} ${menorQueMil(resto)}`;
}

/** Formato argentino con punto de miles: 1.000, 10.000 */
export function formatoNumero(n: number): string {
  return n.toLocaleString('es-AR');
}
