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
  /** Qué tan limpia está (0 a 100): baja con los días y sube al bañarla. */
  limpieza: number;
  /** Cuándo aparece cada caca (milisegundos). Las que ya llegaron se ven en la escena. */
  cacas?: number[];
  /** Está enfermita: necesita el remedio. Nunca se muere ni se va. */
  enferma?: boolean;
  /** Cuándo se curó por última vez (después queda protegida unas horas). */
  curadaEn?: number;
  /** Día en que la bañó por última vez (bañar suma puntos una vez por día). */
  ultimoBano?: string;
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
    limpieza: C().limpieza.inicial,
    ultimaVisita: hoy,
    accesorios: [],
  };
}

/**
 * Al abrir la app: si pasaron más días de gracia sin jugar, baja la barra 5 puntos por día
 * (sin bajar de 0), y bajan Contento y Panza llena hasta su mínimo. Al volver, empieza el
 * "regreso feliz" (puntos dobles por 3 días). Nunca desaparece ni se enferma.
 */
export function alVolver(m: EstadoMascota, hoy: string, ahora = Date.now()): EstadoMascota {
  const dias = diasEntre(m.ultimaVisita, hoy);
  if (dias <= 0) return m;
  // Mientras no estuvo, hizo caca (una por día, con un tope).
  const nuevas = Array.from({ length: Math.min(dias * C().caca.porDiaAusente, C().caca.maximo) }, () => ahora);
  m = { ...m, cacas: [...(m.cacas ?? []), ...nuevas].slice(-C().caca.maximo) };
  const cfg = C();
  const diasDePerdida = Math.max(0, dias - cfg.diasDeGracia);
  const crecimiento = Math.max(0, m.crecimiento - diasDePerdida * cfg.perdidaPorDia);
  const contento = Math.max(cfg.contento.minimo, m.contento - dias * cfg.contento.bajaPorDia);
  const panza = Math.max(cfg.panza.minimo, m.panza - dias * cfg.panza.bajaPorDia);
  const limpieza = Math.max(cfg.limpieza.minimo, (m.limpieza ?? cfg.limpieza.inicial) - dias * cfg.limpieza.bajaPorDia);
  const regresoFelizHasta = diasDePerdida > 0 ? sumarDias(hoy, cfg.diasRegresoFeliz - 1) : m.regresoFelizHasta;
  const r = { ...m, crecimiento, contento, panza, limpieza, ultimaVisita: hoy, regresoFelizHasta };
  return debeEnfermarse(r, ahora) ? { ...r, enferma: true } : r;
}

export function cacasVisibles(m: EstadoMascota, ahora = Date.now()): number {
  return (m.cacas ?? []).filter((t) => t <= ahora).length;
}

/** Limpia una caca (la más vieja). */
export function limpiarCaca(m: EstadoMascota, ahora = Date.now()): EstadoMascota {
  const lista = [...(m.cacas ?? [])].sort((a, b) => a - b);
  const i = lista.findIndex((t) => t <= ahora);
  if (i < 0) return m;
  lista.splice(i, 1);
  return { ...m, cacas: lista, contento: Math.min(100, m.contento + C().caca.contentoAlLimpiar) };
}

/** Se enferma si está muy sucia, con mucha hambre o con mucha caca, salvo recién curada. */
export function debeEnfermarse(m: EstadoMascota, ahora = Date.now()): boolean {
  const e = C().enfermedad;
  if (m.enferma) return false;
  if (m.curadaEn && ahora - m.curadaEn < e.horasProtegidaDespuesDeCurar * 3_600_000) return false;
  return (m.limpieza ?? 100) < e.limpiezaMenorA || m.panza < e.panzaMenorA || cacasVisibles(m, ahora) >= e.cacasDesde;
}

export function curar(m: EstadoMascota, ahora = Date.now()): EstadoMascota {
  return { ...m, enferma: false, curadaEn: ahora, contento: Math.min(100, m.contento + C().enfermedad.contentoAlCurar) };
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

export type Comida = (typeof import('../../content/config/mascota.json'))['comidas'][number];

export function comidaPorId(id: string): Comida {
  return C().comidas.find((c) => c.id === id) ?? C().comidas[0];
}

/** Con la panza llena no quiere comer más (así no se gastan todas las monedas en comida). */
export function panzaLlena(m: EstadoMascota): boolean {
  return m.panza >= C().panzaLlena;
}

export function alimentar(m: EstadoMascota, hoy: string, comidaId = 'manzana', favorita?: string, ahora = Date.now()): EstadoMascota {
  const comida = comidaPorId(comidaId);
  const r = sumar(m, C().puntosAlimentar, hoy);
  const extra = favorita === comida.id ? C().contentoFavorita : 0;
  // Lo que entra… sale: un ratito después hace caca.
  const cacas = [...(m.cacas ?? []), ahora + C().caca.minutosDespuesDeComer * 60_000].slice(-C().caca.maximo);
  return { ...r, panza: Math.min(100, m.panza + comida.panza), contento: Math.min(100, m.contento + extra), cacas };
}

/** Bañarla la deja limpita; suma puntos de crecimiento una vez por día. */
export function banar(m: EstadoMascota, hoy: string): EstadoMascota {
  const base = m.ultimoBano !== hoy ? sumar(m, C().puntosBanar, hoy) : { ...m, ultimaVisita: hoy };
  return { ...base, limpieza: 100, contento: Math.min(100, m.contento + C().mimos.subeContento), ultimoBano: hoy };
}

/** Mimos y cosquillas: siempre la ponen un poquito más contenta. */
export function mimar(m: EstadoMascota): EstadoMascota {
  return { ...m, contento: Math.min(100, m.contento + C().mimos.subeContento) };
}

export type Necesidad = 'enferma' | 'caca' | 'hambre' | 'aburrida' | 'sucia' | null;

/** Lo que más necesita ahora (para que lo pida en su globito). */
export function necesidadDe(m: EstadoMascota, ahora = Date.now()): Necesidad {
  if (m.enferma) return 'enferma';
  if (cacasVisibles(m, ahora) > 0) return 'caca';
  const n = C().necesidad;
  const faltas: [Necesidad, number][] = [
    ['hambre', n.panza - m.panza],
    ['aburrida', n.contento - m.contento],
    ['sucia', n.limpieza - (m.limpieza ?? 100)],
  ];
  const peor = faltas.sort((a, b) => b[1] - a[1])[0];
  return peor[1] > 0 ? peor[0] : null;
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
