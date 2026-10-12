// Carga y tipa todo el contenido de content/ (JSON). La lógica nunca tiene números mágicos:
// todo lo ajustable vive en estos archivos.
import app from '../../content/config/app.json';
import economia from '../../content/config/economia.json';
import mascotaCfg from '../../content/config/mascota.json';
import dificultad from '../../content/config/dificultad.json';
import progresoCfg from '../../content/config/progreso.json';
import plantillas from '../../content/plantillas.json';
import historias from '../../content/historias.json';
import finanzas from '../../content/finanzas.json';
import errores from '../../content/errores.json';
import lecciones from '../../content/lecciones.json';
import objetos from '../../content/objetos.json';
import productos from '../../content/productos.json';
import nombres from '../../content/nombres.json';
import m1 from '../../content/worlds/1-isla.json';
import m2 from '../../content/worlds/2-valle.json';
import m3 from '../../content/worlds/3-montana.json';
import m4 from '../../content/worlds/4-bosque.json';
import m5 from '../../content/worlds/5-mercado.json';
import m6 from '../../content/worlds/6-pueblo.json';
import m7 from '../../content/worlds/7-tesoro.json';
import type { CaracterGrado, Tema } from '../engine/tipos';

export interface PlantillaNivel {
  id: string;
  peso: number;
  params?: Record<string, unknown>;
}
export interface Nivel {
  id: string;
  nombre: string;
  corto: string;
  inicio?: number;
  techoNivel?: number;
  minimo?: number;
  escala?: Tema;
  plantillas: PlantillaNivel[];
}
export interface Jefe extends Nivel {
  descripcion: string;
  avatar: string;
}
export interface Mundo {
  id: string;
  numero: number;
  nombre: string;
  escala: Tema;
  etiqueta?: string;
  colores: { cielo: string; suelo: string; acento: string };
  niveles: Nivel[];
  jefe: Jefe;
}

export const config = {
  app,
  economia,
  mascota: mascotaCfg,
  dificultad: dificultad as typeof dificultad & {
    escaleras: Record<Tema, number[]>;
    grados: Record<Tema, { inicio: number; techo: number }[]>;
    caracterGrado: CaracterGrado[];
  },
  progreso: progresoCfg as typeof progresoCfg & { desbloqueoMundos: Record<string, string | null> },
};

export const MUNDOS: Mundo[] = [m1, m2, m3, m4, m5, m6, m7] as Mundo[];

export function mundoPorId(id: string): Mundo | undefined {
  return MUNDOS.find((m) => m.id === id);
}

/** Busca un nivel (o el jefe, con id "<mundo>-jefe"). */
export function nivelPorId(id: string): { mundo: Mundo; nivel: Nivel; esJefe: boolean; indice: number } | undefined {
  for (const mundo of MUNDOS) {
    if (mundo.jefe.id === id) return { mundo, nivel: mundo.jefe, esJefe: true, indice: mundo.niveles.length };
    const i = mundo.niveles.findIndex((n) => n.id === id);
    if (i >= 0) return { mundo, nivel: mundo.niveles[i], esJefe: false, indice: i };
  }
  return undefined;
}

type Textos = Record<string, unknown>;
export const PLANTILLAS = plantillas as unknown as Record<string, Textos>;

export interface Historia {
  texto: string;
  op?: '+' | '−';
  ops?: ('+' | '−')[];
  objeto?: string;
  objetos?: string[];
  pesos?: boolean;
  sobra?: string;
}
export const HISTORIAS = historias as unknown as Record<string, Historia[]>;

export interface PreguntaFinanzas {
  pregunta: string;
  dibujo: string;
  opciones?: string[];
  opcionesCalculadas?: string;
  correcta?: number;
  explicacion: string;
  explica1: string;
  explica2: string;
}
export const FINANZAS = finanzas as unknown as {
  temas: Record<string, PreguntaFinanzas[]>;
  necesidadDeseo: { cosa: string; tipo: 'necesidad' | 'deseo'; objeto: string }[];
};

export interface InfoError {
  leccion: string;
  tema: string;
  frase: string;
  consejo: string;
}
export const ERRORES = Object.fromEntries(Object.entries(errores).filter(([k]) => !k.startsWith('_'))) as Record<string, InfoError>;

export interface PasoLeccion {
  texto: string;
  si?: string;
  sino?: string;
}
export const LECCIONES = Object.fromEntries(Object.entries(lecciones).filter(([k]) => !k.startsWith('_'))) as Record<
  string,
  { visual: string; pasos: PasoLeccion[] }
>;

export const OBJETOS = Object.fromEntries(Object.entries(objetos).filter(([k]) => !k.startsWith('_'))) as Record<
  string,
  { uno: string; varios: string; f: boolean }
>;

export interface Producto {
  id: string;
  nombre: string;
  min: number;
  max: number;
}
export const PRODUCTOS = productos as { productos: Producto[]; billetes: number[]; monedas: number[] };
export const NOMBRES = nombres.nombres;
