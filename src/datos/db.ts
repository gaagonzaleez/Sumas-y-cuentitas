// Guardado local en IndexedDB. Las etapas 1 a 4 funcionan sin servidor.
import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { CuentaAdulta, Intento, Jugadora } from './tipos';

interface Esquema extends DBSchema {
  cuenta: { key: string; value: CuentaAdulta };
  jugadoras: { key: string; value: Jugadora };
  intentos: { key: number; value: Intento; indexes: { porJugadora: string } };
}

let promesa: Promise<IDBPDatabase<Esquema>> | null = null;

export function abrir(): Promise<IDBPDatabase<Esquema>> {
  promesa ??= openDB<Esquema>('mateaventuras', 1, {
    upgrade(db) {
      db.createObjectStore('cuenta', { keyPath: 'id' });
      db.createObjectStore('jugadoras', { keyPath: 'id' });
      const i = db.createObjectStore('intentos', { keyPath: 'id', autoIncrement: true });
      i.createIndex('porJugadora', 'jugadoraId');
    },
  });
  return promesa;
}

export async function leerCuenta(): Promise<CuentaAdulta | undefined> {
  return (await abrir()).get('cuenta', 'adulta');
}

export async function guardarCuenta(c: CuentaAdulta): Promise<void> {
  await (await abrir()).put('cuenta', c);
}

export async function leerJugadoras(): Promise<Jugadora[]> {
  return (await abrir()).getAll('jugadoras');
}

export async function guardarJugadora(j: Jugadora): Promise<void> {
  await (await abrir()).put('jugadoras', j);
}

export async function guardarIntento(i: Intento): Promise<void> {
  await (await abrir()).add('intentos', i);
}

export async function intentosDe(jugadoraId: string): Promise<Intento[]> {
  return (await abrir()).getAllFromIndex('intentos', 'porJugadora', jugadoraId);
}

/** Borra el perfil y TODOS sus datos (intentos incluidos). */
export async function borrarJugadora(id: string): Promise<void> {
  const db = await abrir();
  const tx = db.transaction(['jugadoras', 'intentos'], 'readwrite');
  await tx.objectStore('jugadoras').delete(id);
  const idx = tx.objectStore('intentos').index('porJugadora');
  for (let c = await idx.openCursor(id); c; c = await c.continue()) await c.delete();
  await tx.done;
}

/** Borra todo lo guardado en este dispositivo. */
export async function borrarTodo(): Promise<void> {
  const db = await abrir();
  await Promise.all([db.clear('cuenta'), db.clear('jugadoras'), db.clear('intentos')]);
}
