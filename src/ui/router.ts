// Enrutador mínimo por "hash" (funciona en GitHub Pages sin configuración extra).
import { useEffect, useState } from 'react';

export function rutaActual(): string {
  return location.hash.replace(/^#/, '') || '/';
}

export function ir(ruta: string, reemplazar = false) {
  if (reemplazar) location.replace(`#${ruta}`);
  else location.hash = ruta;
}

export function useRuta(): string {
  const [r, setR] = useState(rutaActual());
  useEffect(() => {
    const f = () => {
      setR(rutaActual());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

/** Compara "/nivel/:id" con "/nivel/valle-3" y devuelve { id: "valle-3" }. */
export function coincide(patron: string, ruta: string): Record<string, string> | null {
  const a = patron.split('/');
  const b = ruta.split('?')[0].split('/');
  if (a.length !== b.length) return null;
  const r: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) r[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return r;
}
