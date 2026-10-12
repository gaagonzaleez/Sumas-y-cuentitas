// Escenarios en miniatura de los 7 mundos (arte original).
import type { ReactNode } from 'react';

const T = '#2B2350';
const s = { stroke: T, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const E: Record<string, ReactNode> = {
  isla: <><ellipse cx="40" cy="62" rx="34" ry="10" fill="#FFE6A8" {...s} /><path d="M42 60c2-14 0-26-4-34" fill="none" stroke="#8A5A3B" strokeWidth="6" strokeLinecap="round" /><path d="M38 26c-10-8-22-4-26 2 10-2 18 0 26-2zM38 26c4-12 18-14 24-10-10 2-16 6-24 10zM38 26c12-4 24 2 26 10-8-6-18-6-26-10z" fill="#3DBE7A" {...s} /><circle cx="36" cy="30" r="4" fill="#8A5A3B" {...s} strokeWidth={2} /><circle cx="44" cy="30" r="4" fill="#8A5A3B" {...s} strokeWidth={2} /></>,
  valle: <><path d="M4 66c10-20 30-24 36-16 8-12 26-10 36 16z" fill="#B7E8A0" {...s} /><g>{[[22, 44, '#F28FB8'], [40, 36, '#FFC93C'], [58, 46, '#9A7BF0']].map(([x, y, c]) => <g key={String(x)}><path d={`M${x} ${Number(y) + 6}v14`} {...s} /><circle cx={Number(x)} cy={Number(y)} r="7" fill={String(c)} {...s} /><circle cx={Number(x)} cy={Number(y)} r="2.5" fill="#FFF4D1" /></g>)}</g></>,
  montana: <><path d="M4 66L28 22l14 22 10-14 24 36z" fill="#C9C3E6" {...s} /><path d="M22 33l6-11 6 10-6 4zM48 34l4-4 6 8-5 2z" fill="#fff" {...s} strokeWidth={2} /><path d="M28 22V8l12 5-12 4" fill="#E8505B" {...s} strokeWidth={2} /></>,
  bosque: <>{[16, 40, 64].map((x) => <g key={x}><path d={`M${x} 50v14`} stroke="#8A5A3B" strokeWidth="5" strokeLinecap="round" /><circle cx={x} cy="40" r="13" fill="#3DBE7A" {...s} /></g>)}<circle cx="40" cy="24" r="4" fill="#E8505B" {...s} strokeWidth={2} /></>,
  mercado: <><rect x="12" y="34" width="56" height="30" rx="3" fill="#FFF4D1" {...s} /><path d="M8 34l6-16h52l6 16z" fill="#E8505B" {...s} /><path d="M22 18l-4 16M34 18l-2 16M46 18l2 16M58 18l4 16" stroke="#fff" strokeWidth="4" /><circle cx="28" cy="48" r="5" fill="#FFC93C" {...s} strokeWidth={2} /><circle cx="44" cy="50" r="5" fill="#3DBE7A" {...s} strokeWidth={2} /></>,
  pueblo: <><path d="M8 64V38l14-12 14 12v26z" fill="#CDE9FF" {...s} /><path d="M40 64V30l16-14 16 14v34z" fill="#FFE3E6" {...s} /><rect x="17" y="48" width="9" height="16" fill="#5B3FE0" {...s} strokeWidth={2} /><rect x="51" y="44" width="10" height="20" fill="#0FA88F" {...s} strokeWidth={2} /><circle cx="64" cy="20" r="0" /></>,
  tesoro: <><ellipse cx="40" cy="64" rx="34" ry="8" fill="#FFE6A8" {...s} /><rect x="18" y="36" width="44" height="24" rx="3" fill="#C98A5C" {...s} /><path d="M18 36c0-14 44-14 44 0z" fill="#E7B36A" {...s} /><rect x="35" y="38" width="10" height="10" rx="2" fill="#FFC93C" {...s} strokeWidth={2} /><path d="M58 18l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#FFC93C" {...s} strokeWidth={1.5} /></>,
};

export function EscenaMundo({ id, size = 64 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 72" aria-hidden="true">
      {E[id]}
    </svg>
  );
}

/** Camino de puntitos que une los nodos (coordenadas en % del contenedor). */
export function Camino({ puntos, alto }: { puntos: { x: number; y: number }[]; alto: number }) {
  if (puntos.length < 2) return null;
  let d = `M${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  return (
    <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
      <path d={d} fill="none" stroke="#9ED9C4" strokeWidth="9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="0 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
