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
  indice(guia);
  if (guia !== est.guia || silencio !== est.silencio) emitir({ guia, silencio });
  if (silencio) callar();
}

const base = () => `${import.meta.env.BASE_URL}audio/`;
interface Indice {
  claves: Set<string>;
  /** Cambia cuando cambia la voz: se agrega a la dirección para no usar audios viejos guardados. */
  version: string;
}
const indices: Partial<Record<Guia, Promise<Indice>>> = {};

function indice(guia: Guia): Promise<Indice> {
  indices[guia] ??= fetch(`${base()}${guia}/index.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : { claves: [] }))
    .then((j: { claves: string[]; hash?: string }) => ({ claves: new Set(j.claves), version: j.hash ?? '0' }))
    .catch(() => ({ claves: new Set<string>(), version: '0' }));
  return indices[guia]!;
}

const urlAudio = (guia: Guia, clave: string, i: Indice) => `${base()}${guia}/${clave}.mp3?v=${i.version}`;

let turno = 0;
let actual: HTMLAudioElement | null = null;
let fuentes: AudioBufferSourceNode[] = [];
let finHablar: number | undefined;

export function callar() {
  turno++;
  actual?.pause();
  actual = null;
  for (const f of fuentes) {
    try {
      f.stop();
    } catch {
      /* ya terminó */
    }
  }
  fuentes = [];
  clearTimeout(finHablar);
  if (est.hablando) emitir({ hablando: false });
}

// ---------- Web Audio: los pedacitos se encadenan sin cortes ----------
// Antes cada pedacito era un <audio> distinto y entre uno y otro quedaba un hueco
// (sonaba "Hay… 3… manzanas", muy robótico). Ahora se decodifican, se les recortan
// los silencios y se programan uno pegado al otro, con un fundido cortito.
const PAUSA_PEDACITOS = 0.03; // segundos entre pedacitos de una misma frase
const PAUSA_FRASES = 0.3; // entre frases distintas
const FUNDIDO = 0.008;

let ctx: AudioContext | null = null;
function contexto(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      // En iPhone, que se escuche aunque el celular esté en modo silencio (como un video).
      const sesion = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (sesion) sesion.type = 'playback';
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Recortado {
  buffer: AudioBuffer;
  desde: number;
  dur: number;
}
const buffers = new Map<string, Promise<Recortado>>();

function recortar(buffer: AudioBuffer): Recortado {
  const d = buffer.getChannelData(0);
  const umbral = 0.012;
  let i = 0;
  let j = d.length - 1;
  while (i < j && Math.abs(d[i]) < umbral) i++;
  while (j > i && Math.abs(d[j]) < umbral) j--;
  const margen = Math.round(buffer.sampleRate * 0.012);
  const ini = Math.max(0, i - margen);
  const fin = Math.min(d.length, j + margen);
  return { buffer, desde: ini / buffer.sampleRate, dur: Math.max(0.01, (fin - ini) / buffer.sampleRate) };
}

function cargar(c: AudioContext, url: string): Promise<Recortado> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('sin audio');
        return r.arrayBuffer();
      })
      .then((b) => new Promise<AudioBuffer>((res, rej) => c.decodeAudioData(b, res, rej)))
      .then(recortar);
    p.catch(() => buffers.delete(url));
    buffers.set(url, p);
    // Que la memoria no crezca sin fin.
    if (buffers.size > 400) buffers.delete(buffers.keys().next().value!);
  }
  return p;
}

async function reproducirSeguido(c: AudioContext, grupos: string[][], mio: number): Promise<boolean> {
  let piezas: Recortado[][];
  try {
    piezas = await Promise.all(grupos.map((g) => Promise.all(g.map((u) => cargar(c, u)))));
  } catch {
    return false;
  }
  if (mio !== turno) return true;
  let t = c.currentTime + 0.04;
  grupos.forEach((_, gi) => {
    if (gi > 0) t += PAUSA_FRASES;
    piezas[gi].forEach((p, pi) => {
      if (pi > 0) t += PAUSA_PEDACITOS;
      const src = c.createBufferSource();
      src.buffer = p.buffer;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + FUNDIDO);
      g.gain.setValueAtTime(1, t + p.dur - FUNDIDO);
      g.gain.linearRampToValueAtTime(0, t + p.dur);
      src.connect(g).connect(c.destination);
      src.start(t, p.desde, p.dur);
      fuentes.push(src);
      t += p.dur;
    });
  });
  await new Promise<void>((res) => {
    finHablar = window.setTimeout(res, (t - c.currentTime) * 1000 + 30);
  });
  return true;
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

/**
 * Lee un texto (o varias frases seguidas) con la voz de la guía elegida.
 * Cada frase se lee si tiene todos sus audios; si a una le falta alguno, se saltea solo esa.
 */
export async function decir(texto: string | string[], op: { forzar?: boolean } = {}): Promise<void> {
  if (est.silencio && !op.forzar) return;
  callar();
  const mio = turno;
  const guia = est.guia;
  const disponibles = await indice(guia);
  const grupos = (Array.isArray(texto) ? texto : [texto])
    .map((t) => partirTexto(t).flatMap(clavesAudio))
    .filter((c) => c.length && c.every((k) => disponibles.claves.has(k)))
    .map((c) => c.map((k) => urlAudio(guia, k, disponibles)));
  if (mio !== turno || !grupos.length) return;
  emitir({ hablando: true });
  const c = contexto();
  const ok = c ? await reproducirSeguido(c, grupos, mio) : false;
  if (!ok) {
    // Si el navegador no tiene Web Audio, se usa el modo de antes (un audio por vez).
    for (const u of grupos.flat()) {
      await reproducir(u, mio);
      if (mio !== turno) return;
    }
  }
  if (mio === turno) emitir({ hablando: false });
}

/** Precarga audios (quedan guardados para jugar sin conexión). */
export async function precargar(textos: string[], numerosHasta = 100): Promise<void> {
  const guia = est.guia;
  const disponibles = await indice(guia);
  const claves = new Set(textos.flatMap((t) => partirTexto(t).flatMap(clavesAudio)));
  for (let n = 0; n <= Math.min(1000, numerosHasta); n++) claves.add(`n-${n}`);
  const lista = [...claves].filter((c) => disponibles.claves.has(c));
  for (let i = 0; i < lista.length; i += 8) {
    await Promise.all(lista.slice(i, i + 8).map((c) => fetch(urlAudio(guia, c, disponibles)).catch(() => undefined)));
  }
}

/** Sonidos cortos de acierto y festejo, generados con Web Audio (sin archivos). */
export type Sonido = 'acierto' | 'casi' | 'festejo' | 'toque' | 'nam' | 'burbuja' | 'boing' | 'risa' | 'agua' | 'cepillo' | 'moneda';

export function sonido(tipo: Sonido) {
  if (est.silencio) return;
  try {
    const ctx = contexto();
    if (!ctx) return;
    const notas = {
      acierto: [660, 880],
      casi: [440, 392],
      festejo: [523, 659, 784, 1047],
      toque: [520],
      nam: [260, 210],
      burbuja: [900 + Math.random() * 400],
      boing: [330, 495, 660],
      risa: [784, 880, 784, 988],
      agua: [1200, 1000, 1300, 900],
      cepillo: [700, 760],
      moneda: [988, 1319],
    }[tipo];
    notas.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = tipo === 'nam' ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch {
    /* sin audio */
  }
}
