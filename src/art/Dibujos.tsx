// Los 9 dibujos de la contraseña de las nenas.
import type { ReactNode } from 'react';

const T = '#2B2350';
const s = { stroke: T, strokeWidth: 3.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const D: Record<string, ReactNode> = {
  sol: <><circle cx="32" cy="32" r="11" fill="#FFC93C" {...s} />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M32 10v6" transform={`rotate(${a} 32 32)`} {...s} />)}</>,
  luna: <path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z" fill="#FFE6A8" {...s} />,
  corazon: <path d="M32 54S10 40 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 16-22 30-22 30z" fill="#E8505B" {...s} />,
  pez: <><path d="M8 32c10-13 30-13 40 0-10 13-30 13-40 0z" fill="#0FA88F" {...s} /><path d="M48 32l10-9v18z" fill="#0FA88F" {...s} /><circle cx="20" cy="30" r="2.5" fill={T} /></>,
  flor: <>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx="32" cy="20" r="8" transform={`rotate(${a} 32 32)`} fill="#F28FB8" {...s} />)}<circle cx="32" cy="32" r="7" fill="#FFC93C" {...s} /></>,
  gato: <><path d="M14 22l4-12 10 8h8l10-8 4 12v14c0 12-8 18-18 18S14 48 14 36z" fill="#F4A259" {...s} /><circle cx="25" cy="34" r="2.5" fill={T} /><circle cx="39" cy="34" r="2.5" fill={T} /><path d="M28 42q4 3 8 0" fill="none" {...s} /></>,
  arbol: <><path d="M28 40h8v16h-8z" fill="#8A5A3B" {...s} /><circle cx="32" cy="26" r="16" fill="#3DBE7A" {...s} /></>,
  casa: <><path d="M12 30L32 12l20 18v24H12z" fill="#FFE6A8" {...s} /><rect x="27" y="38" width="10" height="16" fill="#E8505B" {...s} /></>,
  nube: <path d="M18 46a10 10 0 0 1 0-20 13 13 0 0 1 25-4 10 10 0 0 1 3 24z" fill="#CDE9FF" {...s} />,
};

export function DibujoSecreto({ id, size = 48 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {D[id]}
    </svg>
  );
}
