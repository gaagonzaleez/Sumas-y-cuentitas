// Convierte cualquier texto en pedacitos de audio: frases fijas y números.
// Los números se leen con un audio por número (0 a 1.000 y los miles), así las consignas
// que cambian en cada ejercicio también tienen voz sin generar audio en el momento.

export type Pedazo = { tipo: 'texto'; texto: string } | { tipo: 'numero'; n: number };

const SIGNOS: Record<string, string> = { '+': 'más', '−': 'menos', '-': 'menos', '×': 'por', '=': 'es igual a', '?': '' };

/** Normaliza un texto para usarlo como clave de audio. */
export function claveTexto(t: string): string {
  return t.replace(/\s+/g, ' ').trim();
}

/** Hash FNV-1a de 32 bits en hexadecimal (nombre del archivo de audio). */
export function hashTexto(t: string): string {
  let h = 0x811c9dc5;
  const s = claveTexto(t);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function soloPuntuacion(t: string): boolean {
  return !/[\p{L}\p{N}]/u.test(t);
}

/**
 * Parte un texto en frases fijas y números.
 * "$75" → 75 + "pesos". "3 × 4 = 12" → 3, "por", 4, "es igual a", 12. "1.000" → 1000.
 */
export function partirTexto(texto: string): Pedazo[] {
  const r: Pedazo[] = [];
  const re = /\$?\d{1,3}(?:\.\d{3})+|\$?\d+|[+−×=]|(?<=\s)-(?=\s)/g;
  let ultimo = 0;
  const empujarTexto = (t: string) => {
    const c = claveTexto(t);
    if (c && !soloPuntuacion(c)) r.push({ tipo: 'texto', texto: c });
  };
  for (const m of texto.matchAll(re)) {
    empujarTexto(texto.slice(ultimo, m.index));
    const tok = m[0];
    if (tok in SIGNOS) {
      if (SIGNOS[tok]) r.push({ tipo: 'texto', texto: SIGNOS[tok] });
    } else {
      const pesos = tok.startsWith('$');
      const n = Number(tok.replace(/[$.]/g, ''));
      r.push({ tipo: 'numero', n });
      if (pesos) r.push({ tipo: 'texto', texto: 'pesos' });
    }
    ultimo = m.index! + tok.length;
  }
  empujarTexto(texto.slice(ultimo));
  return r;
}

/** Archivos de audio para un pedazo. Los números grandes se arman con "dos mil" + "trescientos". */
export function clavesAudio(p: Pedazo): string[] {
  if (p.tipo === 'texto') return [`t-${hashTexto(p.texto)}`];
  const n = p.n;
  if (n <= 1000) return [`n-${n}`];
  if (n > 10000) return String(n).split('').map((d) => `n-${d}`);
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  return resto ? [`m-${miles}`, `n-${resto}`] : [`m-${miles}`];
}
