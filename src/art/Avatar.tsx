// Avatar por capas. Cada pieza es un SVG de content/avatar/svg/ con colores variables
// (--piel, --pelo, --tela, --tela2) que se reemplazan acá por los colores elegidos.
import { memo, useId } from 'react';
import { ITEM, svgDe } from '../content/catalogo';
import type { Avatar } from '../datos/tipos';

const T = '#2B2350';
const S = `stroke="${T}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

function cuerpo(): string {
  const brazo = (d: string) => `<path d="${d}" fill="none" stroke="${T}" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="var(--piel)" stroke-width="14" stroke-linecap="round"/>`;
  return (
    brazo('M72 168 Q58 186 59 212') +
    brazo('M128 168 Q142 186 141 212') +
    `<circle cx="59" cy="216" r="9" fill="var(--piel)" ${S}/><circle cx="141" cy="216" r="9" fill="var(--piel)" ${S}/>` +
    `<rect x="80" y="204" width="17" height="44" rx="8" fill="var(--piel)" ${S}/><rect x="103" y="204" width="17" height="44" rx="8" fill="var(--piel)" ${S}/>` +
    `<rect x="90" y="138" width="20" height="22" fill="var(--piel)" ${S}/>` +
    `<path d="M70 166 Q70 156 84 154 L116 154 Q130 156 130 166 L132 214 Q100 222 68 214 Z" fill="var(--piel)" ${S}/>`
  );
}

function cabeza(): string {
  return (
    `<circle cx="45" cy="106" r="11" fill="var(--piel)" ${S}/><circle cx="155" cy="106" r="11" fill="var(--piel)" ${S}/>` +
    `<ellipse cx="100" cy="96" rx="56" ry="54" fill="var(--piel)" ${S}/>`
  );
}

function ojos(tipo: string): string {
  const par = (f: (x: number) => string) => f(78) + f(122);
  switch (tipo) {
    case 'grandes':
      return par((x) => `<ellipse cx="${x}" cy="104" rx="9" ry="11" fill="var(--ojos)"/><circle cx="${x + 3}" cy="99" r="3.6" fill="#fff"/><circle cx="${x - 3}" cy="108" r="1.6" fill="#fff"/>`);
    case 'almendra':
      return par((x) => `<path d="M${x - 10} 104 Q${x} 92 ${x + 10} 104 Q${x} 113 ${x - 10} 104 Z" fill="var(--ojos)"/><circle cx="${x + 2}" cy="101" r="2.6" fill="#fff"/>`);
    case 'pestanas':
      return par(
        (x) =>
          `<ellipse cx="${x}" cy="104" rx="7" ry="8.5" fill="var(--ojos)"/><circle cx="${x + 2.5}" cy="100.5" r="2.6" fill="#fff"/>` +
          `<path d="M${x - 8} 97 L${x - 12} 93 M${x - 4} 95 L${x - 6} 90 M${x + 8} 97 L${x + 12} 93" stroke="${T}" stroke-width="2.5" stroke-linecap="round"/>`,
      );
    default:
      return par((x) => `<ellipse cx="${x}" cy="104" rx="7" ry="8.5" fill="var(--ojos)"/><circle cx="${x + 2.5}" cy="100.5" r="2.6" fill="#fff"/>`);
  }
}

function boca(expr: string): string {
  const mejillas = (o: number) => `<circle cx="66" cy="122" r="8" fill="#E8505B" opacity="${o}"/><circle cx="134" cy="122" r="8" fill="#E8505B" opacity="${o}"/>`;
  if (expr === 'feliz') return mejillas(0.35) + `<path d="M86 124 Q100 144 114 124 Z" fill="${T}" ${S}/><path d="M93 132 Q100 137 107 132" fill="#E8505B"/>`;
  if (expr === 'timida') return mejillas(0.55) + `<path d="M93 128 Q100 133 107 128" fill="none" ${S}/>`;
  return mejillas(0.35) + `<path d="M86 124 Q100 138 114 124" fill="none" ${S}/>`;
}

function conColores(svg: string, tela?: string, tela2?: string): string {
  return svg
    .replace(/var\(--tela2,(#[0-9A-Fa-f]{3,6})\)/g, (_m, f) => tela2 ?? f)
    .replace(/var\(--tela2\)/g, tela2 ?? '#FFFFFF')
    .replace(/var\(--tela\)/g, tela ?? '#5B3FE0');
}

function pieza(id: string | undefined, cual: 'svg' | 'svgAtras' | 'svgFrente' = 'svg'): string {
  if (!id) return '';
  const it = ITEM[id];
  const nombre = it?.[cual];
  if (!nombre) return '';
  const brillo = it.brilla && cual === 'svg' ? `<g class="brilla"></g>` : '';
  return conColores(svgDe(nombre), it.colores?.tela, it.colores?.tela2) + brillo;
}

/** Arma el SVG completo del avatar (sin la etiqueta <svg>). */
export function componerAvatar(a: Avatar, idGradiente: string, sinFondo = false): string {
  const colorPelo = ITEM[a.colorPelo]?.valor ?? '#6B3F27';
  const pelo = colorPelo === 'arcoiris' ? `url(#${idGradiente})` : colorPelo;
  const jardinero = ITEM[a.abajo ?? '']?.svg === 'jardinero';
  const ropa = a.vestido
    ? pieza(a.vestido)
    : jardinero
      ? pieza(a.arriba) + pieza(a.abajo)
      : pieza(a.abajo) + pieza(a.arriba);
  const capas = [
    sinFondo ? '' : pieza(a.fondo),
    pieza(a.espalda),
    pieza(a.pelo, 'svgAtras'),
    cuerpo(),
    pieza(a.calzado),
    ropa,
    pieza(a.cuello),
    pieza(a.espalda, 'svgFrente'),
    cabeza(),
    ojos(a.ojos),
    boca(a.expresion),
    pieza(a.detalle),
    pieza(a.pelo),
    pieza(a.cara),
    pieza(a.cabeza),
    pieza(a.mano),
    sinFondo ? '' : pieza(a.marco),
  ].join('');
  const grad =
    `<defs><linearGradient id="${idGradiente}" x1="0" y1="0" x2="0" y2="1">` +
    ['#E8505B', '#F29A2E', '#FFC93C', '#3DBE7A', '#7CC6F2', '#9A7BF0'].map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('') +
    `</linearGradient></defs>`;
  return (
    grad +
    capas
      .replace(/var\(--piel\)/g, a.piel)
      .replace(/var\(--pelo\)/g, pelo)
      .replace(/var\(--ojos\)/g, a.colorOjos)
  );
}

export type ModoAvatar = 'cuerpo' | 'busto';

export const AvatarSVG = memo(function AvatarSVG({
  avatar,
  size = 160,
  modo = 'cuerpo',
  sinFondo = false,
  className,
  titulo,
}: {
  avatar: Avatar;
  size?: number;
  modo?: ModoAvatar;
  sinFondo?: boolean;
  className?: string;
  titulo?: string;
}) {
  const id = useId().replace(/:/g, '');
  const viewBox = modo === 'busto' ? '24 14 152 152' : '0 0 200 260';
  const alto = modo === 'busto' ? size : (size * 260) / 200;
  return (
    <svg
      width={size}
      height={alto}
      viewBox={viewBox}
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      dangerouslySetInnerHTML={{ __html: componerAvatar(avatar, `arco${id}`, sinFondo || modo === 'busto') }}
    />
  );
});

/** Avatar en un círculo (para encabezados, tabla, panel). */
export function AvatarCirculo({ avatar, size = 48, fondo = '#FFE3E6' }: { avatar: Avatar; size?: number; fondo?: string }) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: '50%', background: fondo, display: 'inline-flex', overflow: 'hidden', flex: 'none', alignItems: 'flex-end', justifyContent: 'center' }}
      aria-hidden="true"
    >
      <AvatarSVG avatar={avatar} size={size} modo="busto" />
    </span>
  );
}

/** Vista previa de un ítem suelto (para la tienda). */
export function ItemSVG({ id, size = 72, piel = '#F3C49A', pelo = '#6B3F27' }: { id: string; size?: number; piel?: string; pelo?: string }) {
  const it = ITEM[id];
  if (!it) return null;
  if (it.capa === 'colorPelo') {
    const c = it.valor === 'arcoiris' ? 'url(#arco-tienda)' : it.valor;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="arco-tienda" x1="0" y1="0" x2="1" y2="1">
            {['#E8505B', '#FFC93C', '#3DBE7A', '#7CC6F2', '#9A7BF0'].map((col, i) => <stop key={col} offset={i / 4} stopColor={col} />)}
          </linearGradient>
        </defs>
        <path d="M14 40 Q10 10 32 10 Q54 10 50 40 L52 56 L12 56 Z" fill={c} stroke={T} strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }
  const vb: Record<string, string> = {
    pelo: '20 10 160 200', arriba: '40 140 120 100', abajo: '45 190 110 70', vestido: '40 140 120 120', calzado: '60 220 80 40',
    cabeza: '10 0 180 110', cara: '50 75 100 60', cuello: '60 140 80 70', mano: '120 50 80 190', espalda: '0 100 200 160',
    detalle: '50 90 100 60', fondo: '0 0 200 260', marco: '0 0 200 260',
  };
  const contenido =
    (it.capa === 'pelo' ? pieza(id, 'svgAtras') : '') + pieza(id) + (it.svgFrente ? pieza(id, 'svgFrente') : '');
  const html = contenido.replace(/var\(--piel\)/g, piel).replace(/var\(--pelo\)/g, pelo).replace(/var\(--ojos\)/g, T);
  return <svg width={size} height={size} viewBox={vb[it.capa] ?? '0 0 200 260'} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
