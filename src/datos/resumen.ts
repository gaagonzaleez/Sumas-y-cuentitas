// Resumen del avance de un perfil para el panel de la creadora. Solo datos de juego:
// apodo, grado escolar, progreso, tiempo y temas difíciles (nada de nombres reales ni fotos).
import { config, MUNDOS } from '../content';
import { infoError } from '../engine/leccion';
import { diasEntre } from '../engine/mascota';
import { completado, mundoDesbloqueado, nivelActual, sinModoCreadora } from '../engine/progreso';
import { diaArgentina } from '../engine/semana';
import type { Jugadora } from './tipos';

export interface ResumenMundo {
  id: string;
  nombre: string;
  abierto: boolean;
  /** Niveles con el grado 1 pasado (de 8) y si pasó el Gran desafío. */
  niveles: number;
  desafio: boolean;
  /** Grados completados de los 45 del mundo (9 niveles × 5 grados). */
  grados: number;
  estrellas: number;
}

export interface ResumenPerfil {
  id: string;
  apodo: string;
  grado: string;
  creadaEn: number;
  ultimoDia?: string;
  diasJugados: number;
  minutosTotal: number;
  minutos7: number;
  monedas: number;
  estrellas: number;
  gradosCompletados: number;
  /** Dónde está ahora: "Valle de las Sumas · nivel 3". */
  dondeEsta: string;
  mundos: ResumenMundo[];
  /** Temas con más errores en los últimos 14 días. */
  temasDificiles: { tema: string; veces: number }[];
  /** Niveles donde más se equivocó (últimos 14 días). */
  nivelesDificiles: { nivelId: string; veces: number }[];
  mascota?: { especie: string; crecimiento: number };
  minutosPorDia: { dia: string; minutos: number }[];
}

export function resumirJugadora(j: Jugadora, hoy = diaArgentina()): ResumenPerfil {
  return sinModoCreadora(() => resumir(j, hoy));
}

function resumir(j: Jugadora, hoy: string): ResumenPerfil {
  const p = j.progreso ?? {};
  const tiempo = j.tiempoPorDia ?? {};
  const segTotal = Object.values(tiempo).reduce((a, b) => a + b, 0);
  const seg7 = Object.entries(tiempo).filter(([d]) => diasEntre(d, hoy) < 7).reduce((a, [, s]) => a + s, 0);
  const mundos: ResumenMundo[] = MUNDOS.map((m) => {
    const ids = [...m.niveles, m.jefe].map((n) => n.id);
    let grados = 0;
    let estrellas = 0;
    for (const id of ids)
      for (let g = 1; g <= 5; g++) {
        const r = p[`${id}#${g}`];
        if (r?.completadoEn) grados++;
        estrellas += r?.estrellas ?? 0;
      }
    return {
      id: m.id,
      nombre: m.nombre,
      abierto: mundoDesbloqueado(p, m.id),
      niveles: m.niveles.filter((n) => completado(p, n.id, 1)).length,
      desafio: completado(p, m.jefe.id, 1),
      grados,
      estrellas,
    };
  });
  // El mundo donde está jugando: el último abierto que todavía no terminó.
  const orden = config.progreso.mundosOrden;
  const abiertos = orden.map((id) => MUNDOS.find((m) => m.id === id)!).filter((m) => mundoDesbloqueado(p, m.id));
  const actual = abiertos.find((m) => !completado(p, m.jefe.id, 1)) ?? abiertos[abiertos.length - 1];
  const n = nivelActual(p, actual);
  const dondeEsta = `${actual.nombre} · ${n.indice >= actual.niveles.length ? 'Gran desafío' : `nivel ${n.indice + 1}`}`;
  const recientes = (j.errores ?? []).filter((e) => diasEntre(e.dia, hoy) < 14);
  const porTema: Record<string, number> = {};
  const porNivel: Record<string, number> = {};
  for (const e of recientes) {
    try {
      const t = infoError(e.tag).tema;
      porTema[t] = (porTema[t] ?? 0) + 1;
    } catch {
      /* errorTag viejo que ya no existe */
    }
    if (e.nivelId) porNivel[e.nivelId] = (porNivel[e.nivelId] ?? 0) + 1;
  }
  const dias = [...(j.diasJugados ?? [])].sort();
  const minutosPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.parse(`${hoy}T12:00:00Z`) - (6 - i) * 86_400_000).toISOString().slice(0, 10);
    return { dia: d, minutos: Math.round((tiempo[d] ?? 0) / 60) };
  });
  return {
    id: j.id,
    apodo: j.apodo,
    grado: j.grado,
    creadaEn: j.creadaEn,
    ultimoDia: dias[dias.length - 1],
    diasJugados: dias.length,
    minutosTotal: Math.round(segTotal / 60),
    minutos7: Math.round(seg7 / 60),
    monedas: j.monedas ?? 0,
    estrellas: j.estrellas ?? 0,
    gradosCompletados: Object.values(p).filter((r) => r?.completadoEn).length,
    dondeEsta,
    mundos,
    temasDificiles: Object.entries(porTema).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tema, veces]) => ({ tema, veces })),
    nivelesDificiles: Object.entries(porNivel).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([nivelId, veces]) => ({ nivelId, veces })),
    mascota: j.mascota ? { especie: j.mascota.especie, crecimiento: j.mascota.crecimiento } : undefined,
    minutosPorDia,
  };
}

/** Totales para la cabecera del panel. */
export function totales(perfiles: ResumenPerfil[], hoy = diaArgentina()) {
  const activos7 = perfiles.filter((r) => r.ultimoDia && diasEntre(r.ultimoDia, hoy) < 7).length;
  const temas: Record<string, number> = {};
  for (const r of perfiles) for (const t of r.temasDificiles) temas[t.tema] = (temas[t.tema] ?? 0) + t.veces;
  const porMundo = MUNDOS.map((m) => ({ nombre: m.nombre, perfiles: perfiles.filter((r) => r.mundos.find((x) => x.id === m.id)?.abierto).length }));
  return {
    perfiles: perfiles.length,
    activos7,
    minutos7: perfiles.reduce((a, r) => a + r.minutos7, 0),
    minutosTotal: perfiles.reduce((a, r) => a + r.minutosTotal, 0),
    grados: perfiles.reduce((a, r) => a + r.gradosCompletados, 0),
    temasDificiles: Object.entries(temas).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tema, veces]) => ({ tema, veces })),
    porMundo,
  };
}
