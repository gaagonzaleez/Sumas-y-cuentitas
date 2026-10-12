// Números al azar con semilla, para que las pruebas sean reproducibles.
export interface Azar {
  (): number;
  entero(min: number, max: number): number;
  elegir<T>(lista: readonly T[]): T;
  mezclar<T>(lista: readonly T[]): T[];
  chance(p: number): boolean;
}

export function crearAzar(semilla: number = Date.now() ^ (Math.random() * 1e9)): Azar {
  let s = semilla >>> 0;
  const r = (() => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Azar;
  r.entero = (min, max) => {
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(r() * (max - min + 1));
  };
  r.elegir = (lista) => lista[Math.floor(r() * lista.length)];
  r.mezclar = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  r.chance = (p) => r() < p;
  return r;
}
