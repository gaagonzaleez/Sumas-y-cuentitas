// Contraseñas: se guarda solo un hash (PBKDF2), nunca la contraseña.
const enc = new TextEncoder();

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function nuevaSal(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return hex(a.buffer);
}

export async function hashClave(clave: string, sal: string): Promise<string> {
  const base = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(sal), iterations: 120_000, hash: 'SHA-256' }, base, 256);
  return hex(bits);
}

export async function hashDibujos(jugadoraId: string, dibujos: string[]): Promise<string> {
  return hashClave(dibujos.join('|'), `dibujos:${jugadoraId}`);
}

export function nuevoId(): string {
  return crypto.randomUUID();
}
