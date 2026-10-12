// Validación del apodo: sin nombre real, sin groserías y sin datos de contacto.
import lista from '../../content/palabras-bloqueadas.json';
import { config } from '../content';

export type ProblemaApodo = 'corto' | 'largo' | 'caracteres' | 'numeros' | 'groseria' | 'contacto' | 'nombre';

export const MENSAJES_APODO: Record<ProblemaApodo, string> = {
  corto: `Tiene que tener al menos ${config.app.apodo.min} letras.`,
  largo: `Puede tener hasta ${config.app.apodo.max} letras.`,
  caracteres: 'Usá solo letras, espacios y hasta 2 números.',
  numeros: 'Usá como mucho 2 números (nada de teléfonos ni fechas).',
  groseria: 'Ese apodo no se puede usar. Probá con otro más tierno.',
  contacto: 'El apodo no puede tener datos de contacto ni redes.',
  nombre: 'Parece un nombre real. Mejor un apodo de juego, como "Estrellita".',
};

export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function validarApodo(apodo: string): ProblemaApodo | null {
  const limpio = apodo.trim().replace(/\s+/g, ' ');
  const n = normalizar(limpio);
  for (const c of lista.contacto) if (n.includes(c)) return 'contacto';
  if (limpio.length < config.app.apodo.min) return 'corto';
  if (limpio.length > config.app.apodo.max) return 'largo';
  if (!/^[\p{L} 0-9]+$/u.test(limpio)) return 'caracteres';
  if ((limpio.match(/[0-9]/g) ?? []).length > 2) return 'numeros';
  const compacto = n.replace(/[^a-z]/g, '');
  const palabras = n.split(/[^a-z]+/).filter(Boolean);
  for (const g of lista.groserias) {
    if (palabras.includes(g) || (g.length >= 5 && compacto.includes(g))) return 'groseria';
  }
  for (const nombre of lista.nombresComunes) if (palabras.includes(nombre)) return 'nombre';
  return null;
}

export function limpiarApodo(apodo: string): string {
  return apodo.trim().replace(/\s+/g, ' ');
}
