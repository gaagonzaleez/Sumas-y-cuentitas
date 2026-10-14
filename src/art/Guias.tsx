// Personajes guía: Chispa (estrellita mágica), Seño Cande (maestra) y Lucho (carpincho explorador).
// Arte original. Ver docs/guia-de-estilo.md.
export type Expresion = 'contenta' | 'feliz' | 'pensando' | 'animando';

const T = '#2B2350';

function Ojos({ cx, cy, sep, expr, r = 5 }: { cx: number; cy: number; sep: number; expr: Expresion; r?: number }) {
  if (expr === 'feliz') {
    return (
      <g fill="none" stroke={T} strokeWidth={r * 0.9} strokeLinecap="round">
        <path d={`M${cx - sep - r} ${cy + 1} Q${cx - sep} ${cy - r * 1.5} ${cx - sep + r} ${cy + 1}`} />
        <path d={`M${cx + sep - r} ${cy + 1} Q${cx + sep} ${cy - r * 1.5} ${cx + sep + r} ${cy + 1}`} />
      </g>
    );
  }
  const dx = expr === 'pensando' ? r * 0.35 : 0;
  return (
    <g>
      <ellipse cx={cx - sep} cy={cy} rx={r} ry={r * 1.2} fill={T} />
      <ellipse cx={cx + sep} cy={cy} rx={r} ry={r * 1.2} fill={T} />
      <circle cx={cx - sep + r * 0.35 + dx} cy={cy - r * 0.45} r={r * 0.38} fill="#fff" />
      <circle cx={cx + sep + r * 0.35 + dx} cy={cy - r * 0.45} r={r * 0.38} fill="#fff" />
    </g>
  );
}

function Boca({ cx, cy, w, expr }: { cx: number; cy: number; w: number; expr: Expresion }) {
  if (expr === 'feliz' || expr === 'animando') {
    return <path d={`M${cx - w} ${cy - 2} Q${cx} ${cy + w * 1.4} ${cx + w} ${cy - 2} Z`} fill={T} stroke={T} strokeWidth={2} strokeLinejoin="round" />;
  }
  if (expr === 'pensando') {
    return <path d={`M${cx - w * 0.5} ${cy + 2} Q${cx} ${cy - 1} ${cx + w * 0.5} ${cy + 1}`} fill="none" stroke={T} strokeWidth={3.2} strokeLinecap="round" />;
  }
  return <path d={`M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}`} fill="none" stroke={T} strokeWidth={3.6} strokeLinecap="round" />;
}

export function Chispa({ size = 56, expr = 'contenta', className }: { size?: number; expr?: Expresion; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      {expr === 'animando' && (
        <g fill="#FFC93C" stroke={T} strokeWidth={2}>
          <path d="M10 18 l3 6 6 1 -5 4 1 6 -5-3 -5 3 1-6 -5-4 6-1z" />
          <path d="M86 12 l2 4 4 1 -3 3 1 4 -4-2 -4 2 1-4 -3-3 4-1z" />
        </g>
      )}
      <path d="M50 6 L61 37 L94 38 L68 58 L78 92 L50 72 L22 92 L32 58 L6 38 L39 37 Z" fill="#FFC93C" stroke={T} strokeWidth={5} strokeLinejoin="round" />
      <path d="M50 16 L56 34" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <Ojos cx={50} cy={50} sep={9} expr={expr} r={4.2} />
      <circle cx={34} cy={60} r={4.5} fill="#E8505B" opacity={0.45} />
      <circle cx={66} cy={60} r={4.5} fill="#E8505B" opacity={0.45} />
      <Boca cx={50} cy={61} w={6} expr={expr} />
    </svg>
  );
}

export function SenoCande({ size = 56, expr = 'contenta', className, fondo = true }: { size?: number; expr?: Expresion; className?: string; fondo?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      {fondo && <circle cx="50" cy="50" r="50" fill="#FFE3E6" />}
      <defs>
        <clipPath id="cande-clip"><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <g clipPath={fondo ? 'url(#cande-clip)' : undefined}>
        <path d="M18 104 Q18 78 50 76 Q82 78 82 104 Z" fill="#0FA88F" stroke={T} strokeWidth={3} />
        <path d="M42 77 L50 88 L58 77" fill="#fff" stroke={T} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x="44" y="64" width="12" height="14" rx="4" fill="#C98A5C" stroke={T} strokeWidth={3} />
        <circle cx="50" cy="19" r="10" fill="#6B3F27" stroke={T} strokeWidth={3} />
        <path d="M24 50 Q22 26 50 25 Q78 26 76 50 L76 62 L24 62 Z" fill="#6B3F27" stroke={T} strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx="50" cy="50" rx="23" ry="22" fill="#C98A5C" stroke={T} strokeWidth={3} />
        <path d="M28 42 Q38 30 52 34 Q64 30 73 42 Q66 34 50 33 Q34 33 28 42 Z" fill="#6B3F27" />
        <Ojos cx={50} cy={49} sep={9.5} expr={expr} r={3.4} />
        {expr !== 'feliz' && (
          <g fill="none" stroke={T} strokeWidth={2.4}>
            <circle cx="40.5" cy="49" r="7" />
            <circle cx="59.5" cy="49" r="7" />
            <path d="M47.5 49 L52.5 49" />
          </g>
        )}
        <circle cx="35" cy="58" r="3.6" fill="#E8505B" opacity={0.45} />
        <circle cx="65" cy="58" r="3.6" fill="#E8505B" opacity={0.45} />
        <Boca cx={50} cy={60} w={5} expr={expr} />
      </g>
    </svg>
  );
}

export function Lucho({ size = 56, expr = 'contenta', className, fondo = true }: { size?: number; expr?: Expresion; className?: string; fondo?: boolean }) {
  // Carpincho explorador: cara ancha, hocico grande, orejitas redondas, sombrero de explorador y pañuelo.
  const c = '#9A673F';
  const c2 = '#C4925F';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      {fondo && <circle cx="50" cy="50" r="50" fill="#D7F5EE" />}
      <defs>
        <clipPath id="lucho-clip"><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <g clipPath={fondo ? 'url(#lucho-clip)' : undefined}>
        <path d="M14 106 Q14 78 50 76 Q86 78 86 106 Z" fill={c} stroke={T} strokeWidth={3} />
        <path d="M34 78 L50 92 L66 78 Q50 84 34 78 Z" fill="#F29A2E" stroke={T} strokeWidth={2.5} strokeLinejoin="round" />
        <ellipse cx="25" cy="38" rx="4.5" ry="5.5" fill={c} stroke={T} strokeWidth={3} />
        <ellipse cx="75" cy="38" rx="4.5" ry="5.5" fill={c} stroke={T} strokeWidth={3} />
        <path d="M25 44 Q25 28 50 28 Q75 28 75 44 L78 64 Q78 78 50 78 Q22 78 22 64 Z" fill={c} stroke={T} strokeWidth={3} strokeLinejoin="round" />
        <rect x="28" y="49" width="44" height="27" rx="13" fill={c2} stroke={T} strokeWidth={2.5} />
        <rect x="38" y="52" width="24" height="9" rx="4.5" fill="#5A3825" />
        <path d="M43 55 v3 M57 55 v3" stroke="#C9976A" strokeWidth={2} strokeLinecap="round" />
        <Ojos cx={50} cy={41} sep={13} expr={expr} r={3} />
        <circle cx="26" cy="52" r="3.4" fill="#E8505B" opacity={0.4} />
        <circle cx="74" cy="52" r="3.4" fill="#E8505B" opacity={0.4} />
        <Boca cx={50} cy={67} w={5} expr={expr} />
        <path d="M18 30 Q50 22 82 30 Q78 24 70 22 Q66 8 50 8 Q34 8 30 22 Q22 24 18 30 Z" fill="#3DBE7A" stroke={T} strokeWidth={3} strokeLinejoin="round" />
        <path d="M31 21 Q50 16 69 21" fill="none" stroke="#FFC93C" strokeWidth={3.5} />
        {expr === 'animando' && (
          <g fill="#FFC93C" stroke={T} strokeWidth={2}>
            <path d="M10 46 l2 4 4 1 -3 3 1 4 -4-2 -4 2 1-4 -3-3 4-1z" />
            <path d="M88 44 l2 4 4 1 -3 3 1 4 -4-2 -4 2 1-4 -3-3 4-1z" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function Guia({ guia, size, expr }: { guia: 'chispa' | 'cande' | 'lucho'; size?: number; expr?: Expresion }) {
  if (guia === 'cande') return <SenoCande size={size} expr={expr} />;
  if (guia === 'lucho') return <Lucho size={size} expr={expr} />;
  return <Chispa size={size} expr={expr} />;
}
