// Voz de las guías: reproduce audios pregenerados (content/audio/<guia>/*.mp3).
// Cada texto se parte en frases fijas y números (ver engine/voz.ts). Si falta algún audio,
// no suena nada raro: el subtítulo siempre está en pantalla.
import { useSyncExternalStore } from 'react';
import { clavesAudio, partirTexto } from '../engine/voz';

type Guia = 'chispa' | 'cande';

interface EstadoAudio {
  silencio: boolean;
  guia: Guia;
  hablando: boolean;
}

let est: EstadoAudio = { silencio: false, guia: 'chispa', hablando: false };
const oyentes = new Set<() => void>();
const emitir = (p: Partial<EstadoAudio>) => {
  est = { ...est, ...p };
  oyentes.forEach((f) => f());
};

export function useAudioEstado(): EstadoAudio {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => est,
  );
}

export function configurarVoz(guia: Guia, silencio: boolean) {
  if (guia !== est.guia || silencio !== est.silencio) emitir({ guia, silencio });
  if (silencio) callar();
}

const base = () => `${import.meta.env.BASE_URL}audio/`;
const indices: Partial<Record<Guia, Promise<Set<string>>>> = {};

function indice(guia: Guia): Promise<Set<string>> {
  indices[guia] ??= fetch(`${base()}${guia}/index.json`)
    .then((r) => (r.ok ? r.json() : { claves: [] }))
    .then((j: { claves: string[] }) => new Set(j.claves))
    .catch(() => new Set<string>());
  return indices[guia]!;
}

let turno = 0;
let actual: HTMLAudioElement | null = null;

export function callar() {
  turno++;
  actual?.pause();
  actual = null;
  if (est.hablando) emitir({ hablando: false });
}

function reproducir(url: string, mio: number): Promise<void> {
  return new Promise((res) => {
    if (mio !== turno) return res();
    const a = new Audio(url);
    actual = a;
    a.onended = () => res();
    a.onerror = () => res();
    a.play().catch(() => res());
  });
}

/** Lee un texto con la voz de la guía elegida. */
export async function decir(texto: string, op: { forzar?: boolean } = {}): Promise<void> {
  if (est.silencio && !op.forzar) return;
  callar();
  const mio = turno;
  const guia = est.guia;
  const claves = partirTexto(texto).flatMap(clavesAudio);
  const disponibles = await indice(guia);
  if (mio !== turno || !claves.length || !claves.every((c) => disponibles.has(c))) return;
  emitir({ hablando: true });
  for (const c of claves) {
    await reproducir(`${base()}${guia}/${c}.mp3`, mio);
    if (mio !== turno) return;
  }
  emitir({ hablando: false });
}

/** Precarga audios (quedan guardados para jugar sin conexión). */
export async function precargar(textos: string[], numerosHasta = 100): Promise<void> {
  const guia = est.guia;
  const disponibles = await indice(guia);
  const claves = new Set(textos.flatMap((t) => partirTexto(t).flatMap(clavesAudio)));
  for (let n = 0; n <= Math.min(1000, numerosHasta); n++) claves.add(`n-${n}`);
  const lista = [...claves].filter((c) => disponibles.has(c));
  for (let i = 0; i < lista.length; i += 8) {
    await Promise.all(lista.slice(i, i + 8).map((c) => fetch(`${base()}${guia}/${c}.mp3`).catch(() => undefined)));
  }
}

/** Sonidos cortos de acierto y festejo, generados con Web Audio (sin archivos). */
let ctx: AudioContext | null = null;
export function sonido(tipo: 'acierto' | 'casi' | 'festejo' | 'toque') {
  if (est.silencio) return;
  try {
    ctx ??= new AudioContext();
    const notas = { acierto: [660, 880], casi: [440, 392], festejo: [523, 659, 784, 1047], toque: [520] }[tipo];
    notas.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t = ctx!.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch {
    /* sin audio */
  }
}
