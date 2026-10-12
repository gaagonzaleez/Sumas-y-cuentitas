import type { EstadoMascota } from '../engine/mascota';
import type { Progreso } from '../engine/progreso';

export type CapaAvatar =
  | 'fondo' | 'espalda' | 'pelo' | 'arriba' | 'abajo' | 'vestido' | 'calzado'
  | 'cuello' | 'cabeza' | 'cara' | 'mano' | 'detalle' | 'marco';

export interface Avatar {
  piel: string;
  ojos: string;
  colorOjos: string;
  expresion: string;
  pelo: string;
  colorPelo: string;
  arriba?: string;
  abajo?: string;
  vestido?: string;
  calzado?: string;
  cuello?: string;
  cabeza?: string;
  cara?: string;
  mano?: string;
  espalda?: string;
  detalle?: string;
  fondo?: string;
  marco?: string;
}

export interface Ajustes {
  silencio: boolean;
  reloj: boolean;
}

export interface ErrorReciente {
  tag: string;
  dia: string;
}

export interface Jugadora {
  id: string;
  apodo: string;
  grado: string;
  codigoGrupo?: string;
  creadaEn: number;
  dibujosHash?: string;
  guia: 'chispa' | 'cande' | null;
  avatar: Avatar | null;
  mascota: EstadoMascota | null;
  mascotasCompradas: string[];
  monedas: number;
  estrellas: number;
  items: string[];
  progreso: Progreso;
  estampitas: string[];
  ropero: (Avatar | null)[];
  ajustes: Ajustes;
  diasJugados: string[];
  tiempoPorDia: Record<string, number>;
  errores: ErrorReciente[];
  alcancia?: { itemId: string; guardado: number };
  ultimaRachaPremiada?: string;
  retosCobrados: string[];
  /** Estrellas por semana (lunes AAAA-MM-DD) para la tabla del grupo. */
  estrellasPorSemana: Record<string, number>;
  actualizadaEn: number;
}

export interface CuentaAdulta {
  id: 'adulta';
  email: string;
  sal: string;
  hash: string;
  creadaEn: number;
}

export interface Intento {
  id?: number;
  jugadoraId: string;
  nivelId: string;
  plantillaId: string;
  params: string;
  respuesta: string;
  correcta: boolean;
  errorTag?: string;
  pistas: number;
  ms: number;
  creadoEn: number;
}
