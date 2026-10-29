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
      <path d={d} fill="none" stroke="rgba(91,63,224,0.12)" strokeWidth="18" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="#FFF4D1" strokeWidth="11" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path className="camino-anda" d={d} fill="none" stroke="#FFC93C" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Islita flotante con volumen: la escena del mundo arriba de un pedazo de tierra con pasto,
 * luz de arriba, costado más oscuro y sombra en el piso. Bloqueada, se ve apagada.
 */
export function IslaMundo({ id, suelo, acento, size = 96, abierta = true }: { id: string; suelo: string; acento: string; size?: number; abierta?: boolean }) {
  const g = `isla-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ overflow: 'visible', filter: abierta ? undefined : 'grayscale(0.85) opacity(0.75)' }}>
      <defs>
        <linearGradient id={`${g}-tierra`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C98A5C" />
          <stop offset="1" stopColor="#7E4F31" />
        </linearGradient>
        <radialGradient id={`${g}-pasto`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor={suelo} />
          <stop offset="1" stopColor={acento} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="116" rx="34" ry="5" fill="#2B2350" opacity="0.14" />
      <path d="M14 72 Q60 62 106 72 L94 90 Q80 104 60 108 Q40 104 26 90 Z" fill={`url(#${g}-tierra)`} />
      <path d="M40 98 Q46 103 52 100 M70 101 Q76 98 80 92" stroke="#5A3825" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="60" cy="72" rx="47" ry="14" fill={`url(#${g}-pasto)`} />
      <ellipse cx="46" cy="68" rx="18" ry="4" fill="#fff" opacity="0.35" />
      <g transform="translate(20 6)">
        <svg width="80" height="72" viewBox="0 0 80 72">{E[id]}</svg>
      </g>
    </svg>
  );
}

/** Cielo del mapa: degradado, sol, nubes que pasan lento y colinas lejanas. */
export function CieloMapa({ alto }: { alto: number }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 32 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #B9DCFF 0%, #DDEBFF 35%, #E8F7EE 75%, #CFEFD9 100%)' }} />
      <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6C9 0%, rgba(255,233,140,0.6) 35%, rgba(255,233,140,0) 70%)' }} />
      {[0.08, 0.3, 0.55, 0.78].map((y, i) => (
        <svg key={y} className="nube" width={i % 2 ? 120 : 90} height={44} viewBox="0 0 120 44" style={{ position: 'absolute', top: y * alto, left: 0, animationDuration: `${48 + i * 14}s`, animationDelay: `${-i * 13}s`, opacity: 0.9 }}>
          <path d="M14 38 Q2 38 4 28 Q6 18 20 20 Q24 6 42 8 Q56 0 66 12 Q82 6 90 20 Q108 18 112 30 Q114 38 102 38 Z" fill="#fff" />
        </svg>
      ))}
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 140 }}>
        <path d="M0 70 Q60 30 130 60 T260 50 T400 60 V120 H0 Z" fill="#BDE8C8" />
        <path d="M0 95 Q90 60 190 90 T400 85 V120 H0 Z" fill="#A6DEB4" />
      </svg>
    </div>
  );
}
