// Catálogo de avatar, mascotas, premios y frases.
import itemsJson from '../../content/avatar/items.json';
import opcionesJson from '../../content/avatar/opciones.json';
import premiosJson from '../../content/premios.json';
import mascotasJson from '../../content/mascotas.json';
import frasesJson from '../../content/frases.json';
import dibujosJson from '../../content/dibujos.json';
import { config } from './index';
import type { Avatar } from '../datos/tipos';

export interface Item {
  id: string;
  capa: string;
  nombre: string;
  svg?: string;
  svgAtras?: string;
  svgFrente?: string;
  valor?: string;
  colores?: { tela?: string; tela2?: string };
  rareza: string;
  desbloqueo: 'gratis' | 'tienda' | 'premio';
  precio?: number;
  mundo?: string;
  brilla?: boolean;
}

export const ITEMS = itemsJson.items as Item[];
export const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i])) as Record<string, Item>;

export function precioDe(item: Item): number {
  if (item.precio !== undefined) return item.precio;
  const p = config.economia.precioPorRareza as Record<string, number>;
  return p[item.rareza] ?? p.comun;
}

export const ITEMS_GRATIS = ITEMS.filter((i) => i.desbloqueo === 'gratis').map((i) => i.id);

/** SVG de cada pieza, como texto (se insertan en línea para usar los colores variables). */
const SVGS = import.meta.glob('../../content/avatar/svg/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
export function svgDe(nombre: string): string {
  const s = SVGS[`../../content/avatar/svg/${nombre}.svg`];
  if (!s) return '';
  return s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

export const OPCIONES_AVATAR = opcionesJson;
export const AVATAR_INICIAL = opcionesJson.inicial as Avatar;

export interface Mascota {
  id: string;
  nombre: string;
  tipo: 'real' | 'fantasia' | 'mar';
  precio: number;
  color: string;
  color2: string;
}
export const MASCOTAS = mascotasJson.mascotas as Mascota[];
export const TIPOS_MASCOTA = mascotasJson.tipos;
export const mascotaPorId = (id: string) => MASCOTAS.find((m) => m.id === id) ?? MASCOTAS[0];

export interface PremioNivel {
  grado1: string;
  todos: string;
  estampita: string;
}
export const PREMIOS = premiosJson as unknown as {
  niveles: Record<string, PremioNivel>;
  jefes: Record<string, { grados: Record<string, string[]>; todos: string[] }>;
  sets: { id: string; nombre: string; mundo: string; items: string[]; dorado: string[] }[];
};

export type Guia = 'chispa' | 'cande';
type Frases = Record<string, string | string[]>;
export const FRASES = frasesJson as unknown as Record<Guia, Frases>;

export function frase(guia: Guia, clave: string, azar = Math.random): string {
  const f = FRASES[guia][clave];
  if (f === undefined) return '';
  return Array.isArray(f) ? f[Math.floor(azar() * f.length)] : f;
}

export const DIBUJOS = dibujosJson.dibujos;
