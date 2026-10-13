// Actualizaciones a prueba de todo. Además del service worker (que a veces queda trabado en
// celulares), la app pregunta al servidor qué versión hay publicada. Si es otra, borra la copia
// guardada del juego (no los datos de la nena, que están en IndexedDB) y carga la nueva.
const CLAVE_INTENTO = 'mateaventuras:actualizando';

async function versionPublicada(): Promise<string | null> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const { id } = (await r.json()) as { id?: string };
    return id ?? null;
  } catch {
    return null; // Sin internet: se sigue jugando con la versión guardada.
  }
}

/** Devuelve el id de la versión nueva, o null si ya está al día (o no hay internet). */
export async function hayVersionNueva(): Promise<string | null> {
  if (import.meta.env.DEV) return null;
  const id = await versionPublicada();
  return id && id !== __VERSION_ID__ ? id : null;
}

/** Borra la copia guardada del juego y recarga desde el servidor. */
export async function actualizarAhora(id: string, forzar = false): Promise<void> {
  // Si ya se intentó con esta misma versión en esta sesión, no se insiste solo (evita recargas en bucle).
  try {
    if (!forzar && sessionStorage.getItem(CLAVE_INTENTO) === id) return;
    sessionStorage.setItem(CLAVE_INTENTO, id);
  } catch {
    if (!forzar) return;
  }
  try {
    const registros = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(registros.map((r) => r.unregister()));
    // Los audios se conservan: no cambian entre versiones y tardan en bajarse.
    const nombres = (await caches?.keys()) ?? [];
    await Promise.all(nombres.filter((n) => n !== 'audios').map((n) => caches.delete(n)));
  } catch {
    // Aunque falle la limpieza, se recarga igual.
  }
  // El parámetro evita que el navegador use una copia vieja de la página.
  location.replace(`${import.meta.env.BASE_URL}?v=${encodeURIComponent(id)}${location.hash}`);
}

/** Revisa cada tanto y actualiza sola, pero nunca en medio de un ejercicio. */
export function vigilarVersiones(): void {
  if (import.meta.env.DEV) return;
  const revisar = async () => {
    if (location.hash.startsWith('#/jugar')) return;
    const id = await hayVersionNueva();
    if (id) await actualizarAhora(id);
  };
  void revisar();
  setInterval(revisar, 2 * 60_000);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void revisar());
  window.addEventListener('hashchange', () => void revisar());
}
