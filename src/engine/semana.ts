// Fechas en hora de Argentina. La semana va de lunes 00:00 a domingo 23:59.
import { config } from '../content';

const TZ = () => config.app.zonaHoraria;

/** Día AAAA-MM-DD en hora de Argentina. */
export function diaArgentina(fecha: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ(), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(fecha);
  const v = (t: string) => p.find((x) => x.type === t)!.value;
  return `${v('year')}-${v('month')}-${v('day')}`;
}

/** Lunes (AAAA-MM-DD) de la semana de esa fecha, en hora de Argentina. */
export function lunesDeLaSemana(fecha: Date = new Date()): string {
  const dia = diaArgentina(fecha);
  const d = new Date(dia + 'T12:00:00Z');
  const dow = (d.getUTCDay() + 6) % 7; // 0 = lunes
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

/** Días que faltan para que termine la semana (incluye hoy). */
export function diasQueFaltan(fecha: Date = new Date()): number {
  const d = new Date(diaArgentina(fecha) + 'T12:00:00Z');
  const dow = (d.getUTCDay() + 6) % 7;
  return 7 - dow;
}

/** Índice de semana (para rotar ofertas): cantidad de semanas desde 2024-01-01 (lunes). */
export function numeroDeSemana(fecha: Date = new Date()): number {
  const lunes = Date.parse(lunesDeLaSemana(fecha) + 'T12:00:00Z');
  return Math.round((lunes - Date.parse('2024-01-01T12:00:00Z')) / (7 * 86_400_000));
}
