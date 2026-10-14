// Dibujos de objetos para consignas y problemas (manzanas, flores, productos…).
import type { ReactNode } from 'react';

const T = '#2B2350';
const s = { stroke: T, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const D: Record<string, ReactNode> = {
  manzana: <><path d="M32 18c-6-5-20-4-20 10 0 12 9 24 15 24 3 0 3-2 5-2s2 2 5 2c6 0 15-12 15-24 0-14-14-15-20-10z" fill="#E8505B" {...s} /><path d="M32 18c0-5 2-9 7-11" fill="none" {...s} /><path d="M33 13c4-5 10-4 12-2-3 3-8 4-12 2z" fill="#3DBE7A" {...s} /><ellipse cx="22" cy="28" rx="3" ry="5" fill="#fff" opacity=".5" /></>,
  caca: <><path d="M14 52c-6 0-8-8-2-10-3-6 3-11 8-9 0-6 6-10 12-8 0-5 4-9 6-11 2 6 6 9 6 14 6 1 9 7 6 11 6 2 6 11-1 13z" fill="#8A5A3B" {...s} /><path d="M20 42c6 2 18 2 24 0M24 32c4 2 12 2 16 0" fill="none" stroke="#B9875F" strokeWidth="2.5" strokeLinecap="round" /><circle cx="26" cy="46" r="2.6" fill={T} /><circle cx="38" cy="46" r="2.6" fill={T} /></>,
  remedio: <><path d="M6 40l22-10" stroke="#9C8FC4" strokeWidth="5" strokeLinecap="round" /><ellipse cx="40" cy="27" rx="16" ry="10" fill="#C9C2E6" {...s} /><ellipse cx="40" cy="26" rx="11" ry="6" fill="#F28FB8" /></>,
  estrella: <path d="M32 6l7.5 15.5 17 2.3-12.3 11.8 3 16.8L32 44.3l-15.2 8.1 3-16.8L7.5 23.8l17-2.3z" fill="#FFC93C" {...s} />,
  flor: <>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="32" cy="18" rx="8" ry="11" transform={`rotate(${a} 32 30)`} fill="#F28FB8" {...s} />)}<circle cx="32" cy="30" r="7" fill="#FFC93C" {...s} /><path d="M32 42v16" {...s} fill="none" /></>,
  pez: <><path d="M8 32c10-14 30-14 40 0-10 14-30 14-40 0z" fill="#0FA88F" {...s} /><path d="M48 32l10-9v18z" fill="#0FA88F" {...s} /><circle cx="20" cy="29" r="3" fill={T} /></>,
  caracol: <><path d="M10 48h40c4 0 6-3 4-6" fill="none" {...s} /><circle cx="32" cy="34" r="14" fill="#F29A2E" {...s} /><path d="M32 34c0-4 5-4 5 0s-6 7-10 2-1-11 6-11 11 6 9 11" fill="none" {...s} /><path d="M50 42c2-6 4-12 0-16M54 42c4-4 6-10 4-14" fill="none" {...s} /></>,
  globo: <><ellipse cx="32" cy="26" rx="16" ry="19" fill="#E8505B" {...s} /><path d="M28 45h8l-4 5z" fill="#E8505B" {...s} /><path d="M32 50c-4 4 4 6 0 10" fill="none" {...s} /></>,
  galletita: <><circle cx="32" cy="32" r="20" fill="#D9A066" {...s} /><g fill={T}><circle cx="25" cy="26" r="2.5" /><circle cx="38" cy="24" r="2.5" /><circle cx="35" cy="38" r="2.5" /><circle cx="24" cy="38" r="2.5" /></g></>,
  lapiz: <><path d="M14 50l4-12 26-26 8 8-26 26z" fill="#FFC93C" {...s} /><path d="M14 50l4-12 8 8z" fill="#FFE6A8" {...s} /><path d="M44 12l8 8" {...s} /></>,
  pelota: <><circle cx="32" cy="32" r="20" fill="#7CC6F2" {...s} /><path d="M12 32h40M32 12c-8 8-8 32 0 40M32 12c8 8 8 32 0 40" fill="none" {...s} /></>,
  mariposa: <><path d="M32 30c-8-16-24-14-22-2 1 8 12 8 22 4zM32 30c8-16 24-14 22-2-1 8-12 8-22 4z" fill="#9A7BF0" {...s} /><path d="M32 32c-6 6-18 12-16 18 4 4 12-6 16-12zM32 32c6 6 18 12 16 18-4 4-12-6-16-12z" fill="#F28FB8" {...s} /><path d="M32 20v26" {...s} /></>,
  frutilla: <><path d="M32 54c-12-8-18-20-14-28 4-6 24-6 28 0 4 8-2 20-14 28z" fill="#E8505B" {...s} /><path d="M22 24l10-8 10 8-10-2z" fill="#3DBE7A" {...s} /><g fill="#FFF4D1"><circle cx="26" cy="32" r="1.6" /><circle cx="36" cy="30" r="1.6" /><circle cx="31" cy="40" r="1.6" /><circle cx="38" cy="40" r="1.6" /></g></>,
  hongo: <><path d="M10 32c0-14 44-14 44 0z" fill="#E8505B" {...s} /><path d="M24 32h16v18a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="#FFF4D1" {...s} /><g fill="#fff"><circle cx="22" cy="25" r="3" /><circle cx="38" cy="22" r="3" /></g></>,
  figurita: <><rect x="16" y="10" width="32" height="44" rx="5" fill="#fff" {...s} /><path d="M32 22l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#FFC93C" {...s} /></>,
  caramelo: <><circle cx="32" cy="32" r="12" fill="#F28FB8" {...s} /><path d="M20 32l-12-8v16zM44 32l12-8v16z" fill="#F28FB8" {...s} /><path d="M26 26l12 12" stroke="#fff" strokeWidth="3" /></>,
  moneda: <><circle cx="32" cy="32" r="20" fill="#FFC93C" {...s} /><circle cx="32" cy="32" r="12" fill="none" {...s} /></>,
  helado: <><path d="M20 30l12 28 12-28z" fill="#E7B36A" {...s} /><circle cx="26" cy="24" r="9" fill="#fff" {...s} /><circle cx="38" cy="22" r="9" fill="#F28FB8" {...s} /><circle cx="33" cy="12" r="5" fill="#FFC93C" {...s} /></>,
  alfajor: <><ellipse cx="32" cy="40" rx="20" ry="7" fill="#8A5A3B" {...s} /><rect x="12" y="28" width="40" height="12" fill="#FFF4D1" {...s} /><ellipse cx="32" cy="28" rx="20" ry="7" fill="#8A5A3B" {...s} /></>,
  jugo: <><rect x="20" y="16" width="24" height="38" rx="3" fill="#F29A2E" {...s} /><path d="M36 16l4-10" {...s} /><circle cx="32" cy="36" r="6" fill="#FFC93C" {...s} /></>,
  cuaderno: <><rect x="16" y="10" width="32" height="44" rx="3" fill="#5B3FE0" {...s} /><path d="M22 10v44" stroke="#fff" strokeWidth="3" /><rect x="28" y="20" width="14" height="8" rx="2" fill="#fff" {...s} /></>,
  libro: <><path d="M8 14c8-4 16-4 24 2v38c-8-6-16-6-24-2z" fill="#0FA88F" {...s} /><path d="M56 14c-8-4-16-4-24 2v38c8-6 16-6 24-2z" fill="#3DBE7A" {...s} /></>,
  peluche: <><circle cx="20" cy="18" r="7" fill="#C98A5C" {...s} /><circle cx="44" cy="18" r="7" fill="#C98A5C" {...s} /><circle cx="32" cy="30" r="16" fill="#C98A5C" {...s} /><ellipse cx="32" cy="36" rx="7" ry="5" fill="#FFE6A8" {...s} /><circle cx="26" cy="27" r="2.5" fill={T} /><circle cx="38" cy="27" r="2.5" fill={T} /><circle cx="32" cy="34" r="2" fill={T} /></>,
  mochila: <><rect x="14" y="16" width="36" height="40" rx="10" fill="#E8505B" {...s} /><path d="M24 16v-4a8 8 0 0 1 16 0v4" fill="none" {...s} /><rect x="20" y="34" width="24" height="14" rx="4" fill="#FFC93C" {...s} /></>,
  banana: <path d="M12 20c4 20 24 30 40 18 2-2 0-4-2-3-12 8-28 2-32-16-1-3-6-3-6 1z" fill="#FFC93C" {...s} />,
  chupetin: <><circle cx="32" cy="22" r="14" fill="#F28FB8" {...s} /><path d="M32 22c0-6 8-6 8 0s-12 8-14 0 6-12 14-8" fill="none" stroke="#fff" strokeWidth="3" /><path d="M32 36v22" {...s} /></>,
  canasta: <><path d="M10 30h44l-6 22H16z" fill="#E7B36A" {...s} /><path d="M18 30c0-14 28-14 28 0" fill="none" {...s} /></>,
  alcancia: <><path d="M10 34c0-12 10-18 22-18s22 6 22 18c0 8-6 12-8 13v6h-8v-4H26v4h-8v-6c-4-3-8-7-8-13z" fill="#F28FB8" {...s} /><path d="M28 16v-4h8" fill="none" {...s} /><circle cx="22" cy="30" r="2" fill={T} /></>,
  cofre: <><rect x="10" y="28" width="44" height="24" rx="3" fill="#C98A5C" {...s} /><path d="M10 28c0-12 44-12 44 0z" fill="#E7B36A" {...s} /><rect x="27" y="30" width="10" height="10" rx="2" fill="#FFC93C" {...s} /></>,
};

export function Objeto({ id, size = 40 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {D[id] ?? D.estrella}
    </svg>
  );
}

export const OBJETOS_DIBUJADOS = Object.keys(D);

/** La comida con mordiscos (0 = entera, 1 y 2 = mordida). */
export function ObjetoMordido({ id, size = 64, mordidas = 0 }: { id: string; size?: number; mordidas?: number }) {
  const bocados = [
    [50, 14, 13],
    [14, 44, 14],
    [52, 46, 12],
  ].slice(0, mordidas);
  const m = `mordida-${id}-${mordidas}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <mask id={m}>
        <rect width="64" height="64" fill="#fff" />
        {bocados.map(([x, y, r]) => (
          <g key={`${x}-${y}`} fill="#000">
            <circle cx={x} cy={y} r={r} />
            <circle cx={x - r * 0.7} cy={y + r * 0.6} r={r * 0.45} />
            <circle cx={x + r * 0.5} cy={y + r * 0.8} r={r * 0.4} />
          </g>
        ))}
      </mask>
      <g mask={`url(#${m})`}>{D[id] ?? D.estrella}</g>
    </svg>
  );
}
