// Barra de crecimiento de la mascota (0 a 300): sube jugando y baja si pasan días sin jugar.
// Se recalcula al abrir la app a partir de la última visita, sin tareas programadas.
import { config } from '../content';

export type Etapa = 'bebe' | 'joven' | 'grande';
export type Animo = 'contenta' | 'normal' | 'extranando';

export interface EstadoMascota {
  especie: string;
  nombre: string;
  crecimiento: number;
  contento: number;
  panza: number;
  /** Día (AAAA-MM-DD, hora de Argentina) de la última vez que jugó. */
  ultimaVisita: string;
  /** Hasta qué día (inclusive) dura el "regreso feliz" con puntos dobles. */
  regresoFelizHasta?: string;
  /** Día en que jugó con la mascota por última vez (jugar suma una vez por día). */
  ultimoJuego?: string;
  accesorios: string[];
}

const C = () => config.mascota;
const DIA = 86_400_000;

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(hasta + 'T12:00:00Z') - Date.parse(desde + 'T12:00:00Z')) / DIA);
}

export function sumarDias(dia: string, n: number): string {
  return new Date(Date.parse(dia + 'T12:00:00Z') + n * DIA).toISOString().slice(0, 10);
}

export function etapaDe(puntos: number): Etapa {
  let e: Etapa = 'bebe';
  for (const et of C().etapas) if (puntos >= et.desde) e = et.id as Etapa;
  return e;
}

export function nuevaMascota(especie: string, nombre: string, hoy: string): EstadoMascota {
  return {
    especie,
    nombre,
    crecimiento: 0,
    contento: C().contento.inicial,
    panza: C().panza.inicial,
    ultimaVisita: hoy,
    accesorios: [],
  };
}

/**
 * Al abrir la app: si pasaron más días de gracia sin jugar, baja la barra 5 puntos por día
 * (sin bajar de 0), y bajan Contento y Panza llena hasta su mínimo. Al volver, empieza el
 * "regreso feliz" (puntos dobles por 3 días). Nunca desaparece ni se enferma.
 */
export function alVolver(m: EstadoMascota, hoy: string): EstadoMascota {
  const dias = diasEntre(m.ultimaVisita, hoy);
  if (dias <= 0) return m;
  const cfg = C();
  const diasDePerdida = Math.max(0, dias - cfg.diasDeGracia);
  const crecimiento = Math.max(0, m.crecimiento - diasDePerdida * cfg.perdidaPorDia);
  const contento = Math.max(cfg.contento.minimo, m.contento - dias * cfg.contento.bajaPorDia);
  const panza = Math.max(cfg.panza.minimo, m.panza - dias * cfg.panza.bajaPorDia);
  const regresoFelizHasta = diasDePerdida > 0 ? sumarDias(hoy, cfg.diasRegresoFeliz - 1) : m.regresoFelizHasta;
  return { ...m, crecimiento, contento, panza, ultimaVisita: hoy, regresoFelizHasta };
}

export function enRegresoFeliz(m: EstadoMascota, hoy: string): boolean {
  return Boolean(m.regresoFelizHasta && hoy <= m.regresoFelizHasta);
}

function sumar(m: EstadoMascota, puntos: number, hoy: string): EstadoMascota {
  const mult = enRegresoFeliz(m, hoy) ? C().multiplicadorRegreso : 1;
  return { ...m, crecimiento: Math.min(C().maximo, m.crecimiento + puntos * mult), ultimaVisita: hoy };
}

export function porEstrellas(m: EstadoMascota, estrellas: number, hoy: string): EstadoMascota {
  return sumar(m, estrellas * C().puntosPorEstrella, hoy);
}

export function alimentar(m: EstadoMascota, hoy: string): EstadoMascota {
  const r = sumar(m, C().puntosAlimentar, hoy);
  return { ...r, panza: Math.min(100, m.panza + C().panza.subeAlAlimentar) };
}

export function puedeJugar(m: EstadoMascota, hoy: string): boolean {
  return m.ultimoJuego !== hoy;
}

/** Jugar es gratis; suma puntos una vez por día y siempre sube Contento. */
export function jugar(m: EstadoMascota, hoy: string): EstadoMascota {
  const base = puedeJugar(m, hoy) ? sumar(m, C().puntosJugar, hoy) : { ...m, ultimaVisita: hoy };
  return { ...base, contento: Math.min(100, m.contento + C().contento.subeAlJugar), ultimoJuego: hoy };
}

export function animoDe(m: EstadoMascota, hoy: string, diasSinJugarAntes = 0): Animo {
  if (diasSinJugarAntes >= C().estadoAnimo.extrananoDesdeDias && !enRegresoFeliz(m, hoy)) return 'extranando';
  if (m.contento >= C().estadoAnimo.contentaDesdeContento) return 'contenta';
  if (m.contento <= C().contento.minimo) return 'extranando';
  return 'normal';
}

export interface AvisoBarra {
  tipo: 'crecer' | 'bajar' | 'gracia' | 'max';
  faltan: number;
}

/** Avisos de la barra: cerca de crecer (flecha verde) o cerca de volver a una etapa anterior (flecha naranja). */
export function avisoBarra(m: EstadoMascota): AvisoBarra {
  const cfg = C();
  const p = m.crecimiento;
  if (p >= cfg.maximo) return { tipo: 'max', faltan: 0 };
  const sig = cfg.etapas.find((e) => e.desde > p);
  const actual = [...cfg.etapas].reverse().find((e) => e.desde <= p)!;
  if (actual.desde > 0 && p - actual.desde < cfg.avisoCercaDeBajar) return { tipo: 'bajar', faltan: p - actual.desde + 1 };
  if (sig && sig.desde - p <= cfg.avisoFaltaParaCrecer) return { tipo: 'crecer', faltan: sig.desde - p };
  return sig ? { tipo: 'crecer', faltan: sig.desde - p } : { tipo: 'gracia', faltan: 0 };
}
