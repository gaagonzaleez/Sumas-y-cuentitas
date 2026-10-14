// Mascotas: una versión por etapa (bebé, joven, grande) y por ánimo (contenta, normal, extrañando).
// Dibujo paramétrico original; nunca se enferman ni desaparecen.
import { memo, type ReactNode } from 'react';
import { mascotaPorId } from '../content/catalogo';
import type { Animo, Etapa } from '../engine/mascota';

const T = '#2B2350';
const s = { stroke: T, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const ETAPA = {
  bebe: { cy: 92, r: 52, by: 152, brx: 38, bry: 30, ojo: 9.5 },
  joven: { cy: 80, r: 46, by: 146, brx: 46, bry: 40, ojo: 8 },
  grande: { cy: 70, r: 42, by: 140, brx: 54, bry: 48, ojo: 7 },
};

export type Boca = 'abierta' | 'mastica';

function Cara({ cx, cy, r, ojo, animo, boca, enferma, dormida }: { cx: number; cy: number; r: number; ojo: number; animo: Animo; boca?: Boca; enferma?: boolean; dormida?: boolean }) {
  const sep = r * 0.42;
  const oy = cy - r * 0.02;
  const by = cy + r * 0.36;
  return (
    <g>
      {animo === 'extranando' && (
        <g fill="none" {...s} strokeWidth={3}>
          <path d={`M${cx - sep - ojo} ${oy - ojo * 1.9} L${cx - sep + ojo * 0.8} ${oy - ojo * 2.4}`} />
          <path d={`M${cx + sep + ojo} ${oy - ojo * 1.9} L${cx + sep - ojo * 0.8} ${oy - ojo * 2.4}`} />
        </g>
      )}
      {dormida ? (
        <g fill="none" {...s} strokeWidth={3.5}>
          {[cx - sep, cx + sep].map((x) => <path key={x} d={`M${x - ojo} ${oy} Q${x} ${oy + ojo} ${x + ojo} ${oy}`} />)}
        </g>
      ) : (
        <>
      {[cx - sep, cx + sep].map((x) => (
        <g key={x} className="parpadeo">
          <ellipse cx={x} cy={oy} rx={ojo} ry={ojo * 1.15} fill={T} />
          <circle cx={x + ojo * 0.35} cy={oy - ojo * 0.45} r={ojo * (animo === 'extranando' ? 0.55 : 0.4)} fill="#fff" />
          {animo === 'extranando' && <circle cx={x - ojo * 0.35} cy={oy + ojo * 0.4} r={ojo * 0.2} fill="#fff" />}
        </g>
      ))}
          {enferma && (
            <g fill="none" {...s} strokeWidth={3}>
              {[cx - sep, cx + sep].map((x) => <path key={x} d={`M${x - ojo * 1.3} ${oy - ojo * 0.35} h${ojo * 2.6}`} />)}
            </g>
          )}
        </>
      )}
      <circle cx={cx - sep - ojo * 1.4} cy={by - 4} r={ojo * 0.8} fill={enferma ? '#7BBF4E' : '#E8505B'} opacity={enferma ? 0.7 : 0.4} />
      <circle cx={cx + sep + ojo * 1.4} cy={by - 4} r={ojo * 0.8} fill={enferma ? '#7BBF4E' : '#E8505B'} opacity={enferma ? 0.7 : 0.4} />
      {enferma && !boca && (
        <g>
          <path d={`M${cx - 7} ${by + 5} Q${cx} ${by} ${cx + 7} ${by + 5}`} fill="none" {...s} strokeWidth={3.5} />
          <g transform={`rotate(-25 ${cx + 6} ${by + 4})`}>
            <rect x={cx + 6} y={by + 1} width={30} height={7} rx={3.5} fill="#fff" {...s} strokeWidth={2.5} />
            <circle cx={cx + 36} cy={by + 4.5} r={5} fill="#E8505B" {...s} strokeWidth={2.5} />
          </g>
          <path d={`M${cx + r * 0.75} ${cy - r * 0.55} q5 8 0 12 q-5 -4 0 -12z`} fill="#7CC6F2" {...s} strokeWidth={2} />
        </g>
      )}
      {boca === 'abierta' && (
        <g>
          <ellipse cx={cx} cy={by + 3} rx={11} ry={12} fill={T} {...s} strokeWidth={3} />
          <ellipse cx={cx} cy={by + 9} rx={6} ry={4} fill="#F28FB8" />
        </g>
      )}
      {boca === 'mastica' && <ellipse className="mastica" cx={cx} cy={by + 2} rx={9} ry={5} fill={T} {...s} strokeWidth={3} />}
      {!boca && !enferma && !dormida && animo === 'contenta' && <path d={`M${cx - 9} ${by - 2} Q${cx} ${by + 12} ${cx + 9} ${by - 2} Z`} fill={T} {...s} strokeWidth={3} />}
      {!boca && !enferma && (animo === 'normal' || (dormida && animo === 'contenta')) && <path d={`M${cx - 8} ${by} Q${cx} ${by + 7} ${cx + 8} ${by}`} fill="none" {...s} strokeWidth={3.5} />}
      {!boca && !enferma && animo === 'extranando' && <path d={`M${cx - 6} ${by + 4} Q${cx} ${by - 1} ${cx + 6} ${by + 4}`} fill="none" {...s} strokeWidth={3.5} />}
    </g>
  );
}

function Accesorio({ id, cx, cy, r, color }: { id: string; cx: number; cy: number; r: number; color: string }) {
  const top = cy - r;
  switch (id) {
    case 'mono':
      return <g><path d={`M${cx + r * 0.6} ${top + 10} l-16 -10 2 22z M${cx + r * 0.6} ${top + 10} l16 -10 -2 22z`} fill={color} {...s} strokeWidth={3} /><circle cx={cx + r * 0.6} cy={top + 11} r={5} fill="#FFC93C" {...s} strokeWidth={3} /></g>;
    case 'gorrito':
      return <g><path d={`M${cx - 16} ${top + 6} L${cx} ${top - 30} L${cx + 16} ${top + 6} Z`} fill={color} {...s} strokeWidth={3} /><circle cx={cx} cy={top - 32} r={5} fill="#FFC93C" {...s} strokeWidth={3} /></g>;
    case 'anteojos':
      return <g fill="none" stroke={color} strokeWidth={3.5}><circle cx={cx - r * 0.42} cy={cy} r={r * 0.27} /><circle cx={cx + r * 0.42} cy={cy} r={r * 0.27} /><path d={`M${cx - r * 0.15} ${cy} h${r * 0.3}`} /></g>;
    case 'corona':
      return <path d={`M${cx - 20} ${top + 6} L${cx - 22} ${top - 18} L${cx - 10} ${top - 6} L${cx} ${top - 22} L${cx + 10} ${top - 6} L${cx + 22} ${top - 18} L${cx + 20} ${top + 6} Z`} fill={color} {...s} strokeWidth={3} />;
    case 'bufanda':
      return <path d={`M${cx - r * 0.8} ${cy + r * 0.85} Q${cx} ${cy + r * 1.2} ${cx + r * 0.8} ${cy + r * 0.85} L${cx + r * 0.85} ${cy + r * 1.1} Q${cx} ${cy + r * 1.45} ${cx - r * 0.85} ${cy + r * 1.1} Z`} fill={color} {...s} strokeWidth={3} />;
    case 'flor':
      return <g>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={cx - r * 0.65} cy={top + 6} r={6} transform={`rotate(${a} ${cx - r * 0.65} ${top + 12})`} fill={color} {...s} strokeWidth={2.5} />)}<circle cx={cx - r * 0.65} cy={top + 12} r={4.5} fill="#FFC93C" {...s} strokeWidth={2.5} /></g>;
    default:
      return null;
  }
}

function Especie({ especie, etapa, c, c2 }: { especie: string; etapa: Etapa; c: string; c2: string }) {
  const e = ETAPA[etapa];
  const { cy, r, by, brx, bry } = e;
  const crece = etapa === 'bebe' ? 0 : etapa === 'joven' ? 1 : 2;
  const atras: ReactNode[] = [];
  const delante: ReactNode[] = [];
  const marino = ['tiburoncito', 'delfin', 'pulpito'].includes(especie);
  // Cuerpo
  let cuerpo: ReactNode = <ellipse cx={100} cy={by} rx={brx} ry={bry} fill={c} {...s} />;
  const panza = <ellipse cx={100} cy={by + 4} rx={brx * 0.6} ry={bry * 0.6} fill={c2} />;
  const patas = !marino && especie !== 'tortuga' && (
    <g fill={c} {...s}>
      <ellipse cx={100 - brx * 0.5} cy={by + bry - 2} rx={11} ry={8} />
      <ellipse cx={100 + brx * 0.5} cy={by + bry - 2} rx={11} ry={8} />
    </g>
  );
  switch (especie) {
    case 'gatito':
      atras.push(<path key="cola" d={`M${100 + brx - 6} ${by + 6} Q${150 + crece * 10} ${by - 10} ${140 + crece * 8} ${by - 40 - crece * 6}`} fill="none" stroke={T} strokeWidth={14} strokeLinecap="round" />, <path key="cola2" d={`M${100 + brx - 6} ${by + 6} Q${150 + crece * 10} ${by - 10} ${140 + crece * 8} ${by - 40 - crece * 6}`} fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />);
      atras.push(<path key="or" d={`M${100 - r * 0.85} ${cy - r * 0.3} L${100 - r * 0.7} ${cy - r * 1.2} L${100 - r * 0.15} ${cy - r * 0.85} Z M${100 + r * 0.85} ${cy - r * 0.3} L${100 + r * 0.7} ${cy - r * 1.2} L${100 + r * 0.15} ${cy - r * 0.85} Z`} fill={c} {...s} />);
      delante.push(<g key="big" stroke={T} strokeWidth={2.5} strokeLinecap="round"><path d={`M${100 - r * 0.55} ${cy + r * 0.3} l-22 -4 M${100 - r * 0.55} ${cy + r * 0.38} l-22 4 M${100 + r * 0.55} ${cy + r * 0.3} l22 -4 M${100 + r * 0.55} ${cy + r * 0.38} l22 4`} /></g>);
      break;
    case 'perrito':
      atras.push(<path key="cola" d={`M${100 + brx - 4} ${by - 4} q20 -10 18 -30`} fill="none" stroke={T} strokeWidth={13} strokeLinecap="round" />, <path key="cola2" d={`M${100 + brx - 4} ${by - 4} q20 -10 18 -30`} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" />);
      delante.push(<g key="or"><ellipse cx={100 - r * 0.95} cy={cy + r * 0.05} rx={r * 0.28} ry={r * (0.55 + crece * 0.08)} fill="#8A5A3B" {...s} transform={`rotate(15 ${100 - r * 0.95} ${cy})`} /><ellipse cx={100 + r * 0.95} cy={cy + r * 0.05} rx={r * 0.28} ry={r * (0.55 + crece * 0.08)} fill="#8A5A3B" {...s} transform={`rotate(-15 ${100 + r * 0.95} ${cy})`} /></g>);
      delante.push(<ellipse key="hocico" cx={100} cy={cy + r * 0.38} rx={r * 0.32} ry={r * 0.22} fill={c2} {...s} strokeWidth={3} />, <ellipse key="nariz" cx={100} cy={cy + r * 0.28} rx={6} ry={4.5} fill={T} />);
      break;
    case 'conejito':
      atras.push(<g key="or">{[-1, 1].map((k) => <g key={k}><ellipse cx={100 + k * r * 0.38} cy={cy - r * (1.15 + crece * 0.12)} rx={r * 0.22} ry={r * (0.62 + crece * 0.1)} fill={c} {...s} /><ellipse cx={100 + k * r * 0.38} cy={cy - r * (1.15 + crece * 0.12)} rx={r * 0.1} ry={r * (0.45 + crece * 0.08)} fill={c2} /></g>)}</g>);
      atras.push(<circle key="cola" cx={100 + brx - 4} cy={by + 10} r={12} fill="#fff" {...s} />);
      break;
    case 'dragoncito':
      atras.push(<path key="cola" d={`M${100 + brx - 8} ${by + 10} Q${160 + crece * 6} ${by + 20} ${168 + crece * 6} ${by - 14}`} fill="none" stroke={T} strokeWidth={16} strokeLinecap="round" />, <path key="cola2" d={`M${100 + brx - 8} ${by + 10} Q${160 + crece * 6} ${by + 20} ${168 + crece * 6} ${by - 14}`} fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" />);
      if (crece >= 1) atras.push(<path key="alas" d={`M${100 - brx + 8} ${by - 18} Q${40 - crece * 10} ${by - 70} ${30 - crece * 8} ${by - 20} Q${46} ${by - 26} ${100 - brx + 8} ${by - 4} Z M${100 + brx - 8} ${by - 18} Q${160 + crece * 10} ${by - 70} ${170 + crece * 8} ${by - 20} Q${154} ${by - 26} ${100 + brx - 8} ${by - 4} Z`} fill="#F7A8C4" {...s} />);
      atras.push(<path key="cuernos" d={`M${100 - r * 0.45} ${cy - r * 0.8} L${100 - r * 0.55} ${cy - r * (1.25 + crece * 0.12)} L${100 - r * 0.15} ${cy - r * 0.92} Z M${100 + r * 0.45} ${cy - r * 0.8} L${100 + r * 0.55} ${cy - r * (1.25 + crece * 0.12)} L${100 + r * 0.15} ${cy - r * 0.92} Z`} fill="#FFC93C" {...s} />);
      atras.push(<path key="orejas" d={`M${100 - r * 0.9} ${cy - r * 0.1} L${100 - r * 1.35} ${cy - r * 0.45} L${100 - r * 0.8} ${cy + r * 0.25} Z M${100 + r * 0.9} ${cy - r * 0.1} L${100 + r * 1.35} ${cy - r * 0.45} L${100 + r * 0.8} ${cy + r * 0.25} Z`} fill="#F7A8C4" {...s} />);
      delante.push(<ellipse key="hocico" cx={100} cy={cy + r * 0.4} rx={r * 0.45} ry={r * 0.27} fill={c2} opacity={0.9} />);
      break;
    case 'unicornio':
      atras.push(<path key="crin" d={`M${100 - r * 0.2} ${cy - r * 0.95} Q${100 - r * 1.3} ${cy - r * 0.6} ${100 - r * 1.05} ${cy + r * (0.4 + crece * 0.2)} Q${100 - r * 0.8} ${cy} ${100 - r * 0.4} ${cy - r * 0.6} Z`} fill="#9A7BF0" {...s} />);
      atras.push(<path key="crin2" d={`M${100 + r * 0.2} ${cy - r * 0.95} Q${100 + r * 1.3} ${cy - r * 0.6} ${100 + r * 1.05} ${cy + r * (0.4 + crece * 0.2)} Q${100 + r * 0.8} ${cy} ${100 + r * 0.4} ${cy - r * 0.6} Z`} fill="#F28FB8" {...s} />);
      delante.push(<path key="cuerno" d={`M${100 - 8} ${cy - r * 0.85} L${100} ${cy - r * (1.45 + crece * 0.15)} L${100 + 8} ${cy - r * 0.85} Z`} fill="#FFC93C" {...s} />);
      atras.push(<path key="cola" d={`M${100 + brx - 4} ${by} q26 -6 22 28 q-14 -8 -24 -14z`} fill="#7CC6F2" {...s} />);
      break;
    case 'fenix':
      atras.push(<path key="alas" d={`M${100 - brx + 6} ${by - 10} Q${30 - crece * 8} ${by - 40 - crece * 10} ${26 - crece * 6} ${by + 10} Q${50} ${by} ${100 - brx + 6} ${by + 12} Z M${100 + brx - 6} ${by - 10} Q${170 + crece * 8} ${by - 40 - crece * 10} ${174 + crece * 6} ${by + 10} Q${150} ${by} ${100 + brx - 6} ${by + 12} Z`} fill="#E8505B" {...s} />);
      atras.push(<path key="cresta" d={`M${100} ${cy - r * 0.9} Q${88} ${cy - r * (1.6 + crece * 0.15)} ${80} ${cy - r * 1.2} M${100} ${cy - r * 0.9} Q${100} ${cy - r * (1.8 + crece * 0.15)} ${108} ${cy - r * 1.4} M${100} ${cy - r * 0.9} Q${116} ${cy - r * (1.5 + crece * 0.15)} ${122} ${cy - r * 1.15}`} fill="none" stroke="#FFC93C" strokeWidth={8} strokeLinecap="round" />);
      delante.push(<path key="pico" d={`M${92} ${cy + r * 0.28} L${108} ${cy + r * 0.28} L${100} ${cy + r * 0.48} Z`} fill="#FFC93C" {...s} strokeWidth={3} />);
      break;
    case 'tiburoncito':
      atras.push(<path key="aleta" d={`M${100 - 14} ${by - bry + 4} L${100 + 6} ${by - bry - 26 - crece * 6} L${100 + 22} ${by - bry + 8} Z`} fill={c} {...s} />);
      atras.push(<path key="cola" d={`M${100 + brx - 6} ${by} L${100 + brx + 26} ${by - 22} L${100 + brx + 22} ${by + 22} Z`} fill={c} {...s} />);
      cuerpo = <ellipse cx={100} cy={by} rx={brx + 6} ry={bry} fill={c} {...s} />;
      break;
    case 'delfin':
      atras.push(<path key="aleta" d={`M${100 - 6} ${by - bry + 2} Q${100 + 4} ${by - bry - 26 - crece * 5} ${100 + 24} ${by - bry + 8} Z`} fill={c} {...s} />);
      atras.push(<path key="cola" d={`M${100 + brx - 4} ${by + 4} Q${100 + brx + 18} ${by - 4} ${100 + brx + 30} ${by - 18} Q${100 + brx + 26} ${by + 10} ${100 + brx + 30} ${by + 26} Q${100 + brx + 14} ${by + 14} ${100 + brx - 4} ${by + 14} Z`} fill={c} {...s} />);
      delante.push(<ellipse key="hocico" cx={100} cy={cy + r * 0.55} rx={r * 0.35} ry={r * 0.2} fill={c2} {...s} strokeWidth={3} />);
      break;
    case 'pulpito':
      cuerpo = (
        <g>
          {[-2, -1, 0, 1, 2].map((k) => (
            <path key={k} d={`M${100 + k * 16} ${by - 10} Q${100 + k * 22} ${by + bry + 8} ${100 + k * 26 + (k >= 0 ? 10 : -10)} ${by + bry - 2}`} fill="none" stroke={T} strokeWidth={17} strokeLinecap="round" />
          ))}
          {[-2, -1, 0, 1, 2].map((k) => (
            <path key={`c${k}`} d={`M${100 + k * 16} ${by - 10} Q${100 + k * 22} ${by + bry + 8} ${100 + k * 26 + (k >= 0 ? 10 : -10)} ${by + bry - 2}`} fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
      );
      break;
    case 'tortuga':
      cuerpo = (
        <g>
          <g fill={c} {...s}>
            <ellipse cx={100 - brx * 0.8} cy={by + bry * 0.6} rx={14} ry={9} />
            <ellipse cx={100 + brx * 0.8} cy={by + bry * 0.6} rx={14} ry={9} />
          </g>
          <path d={`M${100 - brx - 6} ${by + 10} Q${100 - brx} ${by - bry - 12} ${100} ${by - bry - 14} Q${100 + brx} ${by - bry - 12} ${100 + brx + 6} ${by + 10} Z`} fill={c2} {...s} />
          <path d={`M${100 - brx * 0.5} ${by - 6} L${100} ${by - bry + 4} L${100 + brx * 0.5} ${by - 6} L${100} ${by + 6} Z`} fill="none" stroke={T} strokeWidth={3} />
        </g>
      );
      break;
  }
  const cabeza = <circle cx={100} cy={cy} r={r} fill={c} {...s} />;
  return (
    <>
      {atras}
      {cuerpo}
      {!marino && especie !== 'tortuga' && especie !== 'pulpito' && panza}
      {marino && especie !== 'pulpito' && panza}
      {patas}
      {cabeza}
      {delante}
    </>
  );
}

/** Dónde está la boca, en coordenadas del dibujo (sirve para llevar la comida a la boca). */
export function bocaDe(etapa: Etapa): { x: number; y: number } {
  const e = ETAPA[etapa];
  return { x: 100, y: e.cy + e.r * 0.36 + 2 };
}
/** El dibujo usa viewBox "0 -14 200 214": para pasar de coordenadas a porcentaje del tamaño. */
export const VISTA = { x: 0, y: -14, ancho: 200, alto: 214 };

export const MascotaSVG = memo(function MascotaSVG({
  especie,
  etapa,
  animo,
  size = 120,
  accesorios = [],
  className,
  boca,
  sucia = false,
  enferma = false,
  dormida = false,
}: {
  especie: string;
  etapa: Etapa;
  animo: Animo;
  size?: number;
  accesorios?: string[];
  className?: string;
  boca?: Boca;
  /** Manchitas de barro: le pide un baño. */
  sucia?: boolean;
  /** Enfermita: cachetes verdes, termómetro y una gotita de sudor. */
  enferma?: boolean;
  /** Durmiendo: ojos cerrados. */
  dormida?: boolean;
}) {
  const m = mascotaPorId(especie);
  const e = ETAPA[etapa];
  const colorAcc: Record<string, string> = { mono: '#E8505B', gorrito: '#5B3FE0', anteojos: T, corona: '#FFC93C', bufanda: '#0FA88F', flor: '#F28FB8' };
  return (
    <svg width={size} height={size} viewBox="0 -14 200 214" aria-hidden="true" className={className}>
      <Especie especie={especie} etapa={etapa} c={m.color} c2={m.color2} />
      {sucia && (
        <g fill="#8A5A3B" opacity={0.45}>
          <ellipse cx={100 - e.brx * 0.45} cy={e.by + 6} rx={9} ry={6} />
          <ellipse cx={100 + e.brx * 0.35} cy={e.by - 8} rx={6} ry={4} />
          <ellipse cx={100 + e.r * 0.55} cy={e.cy - e.r * 0.55} rx={7} ry={5} />
          <circle cx={100 - e.r * 0.6} cy={e.cy - e.r * 0.4} r={3.5} />
        </g>
      )}
      <Cara cx={100} cy={e.cy} r={e.r} ojo={e.ojo} animo={animo} boca={boca} enferma={enferma} dormida={dormida} />
      {accesorios.map((a) => {
        const id = a.replace(/^mascota-/, '');
        return <Accesorio key={a} id={id} cx={100} cy={e.cy} r={e.r} color={colorAcc[id] ?? '#5B3FE0'} />;
      })}
    </svg>
  );
});
