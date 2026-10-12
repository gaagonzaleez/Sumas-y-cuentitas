// Elige una plantilla del nivel (según su peso) y genera un ejercicio sin repetir en la sesión.
import type { Mundo, Nivel, PlantillaNivel } from '../content';
import type { Azar } from './azar';
import { caracterGrado } from './escalera';
import { GENERADORES } from './plantillas';
import type { Contexto, Ejercicio } from './tipos';

export function elegirPlantilla(az: Azar, plantillas: PlantillaNivel[]): PlantillaNivel {
  const total = plantillas.reduce((s, p) => s + p.peso, 0);
  let x = az() * total;
  for (const p of plantillas) {
    x -= p.peso;
    if (x < 0) return p;
  }
  return plantillas[plantillas.length - 1];
}

export function contextoPara(nivel: Nivel, plantilla: PlantillaNivel, grado: number, rango: number): Contexto {
  return {
    rango,
    grado,
    caracter: caracterGrado(grado),
    params: { minimo: nivel.minimo ?? 0, ...(plantilla.params ?? {}) },
  };
}

export function generarEjercicio(
  az: Azar,
  _mundo: Mundo,
  nivel: Nivel,
  grado: number,
  rango: number,
  evitar: Set<string> = new Set(),
  plantillaFija?: PlantillaNivel,
): Ejercicio {
  let ultimo: Ejercicio | undefined;
  for (let i = 0; i < 25; i++) {
    const p = plantillaFija ?? elegirPlantilla(az, nivel.plantillas);
    const gen = GENERADORES[p.id];
    if (!gen) throw new Error(`Plantilla sin generador: ${p.id}`);
    ultimo = gen(az, contextoPara(nivel, p, grado, rango));
    if (!evitar.has(ultimo.uid)) return ultimo;
  }
  return ultimo!;
}

/** Busca la plantilla del nivel que generó un ejercicio (para armar "una cuenta parecida"). */
export function plantillaDe(nivel: Nivel, ej: Ejercicio): PlantillaNivel | undefined {
  const candidatas = nivel.plantillas.filter((p) => p.id === ej.plantillaId);
  if (candidatas.length <= 1) return candidatas[0];
  const modo = ej.params.modo;
  return candidatas.find((p) => (p.params as { modo?: string } | undefined)?.modo === modo) ?? candidatas[0];
}
