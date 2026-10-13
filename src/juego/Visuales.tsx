// Ayudas visuales de las consignas: objetos, grupos, bloques, columnas, recta, plata…
import { Objeto } from '../art/Objetos';
import { Plata } from '../art/Plata';
import type { Visual } from '../engine/tipos';
import { cifras } from '../engine/generadores/comun';

const T = '#2B2350';

export function Bloques({ numero, max = 9 }: { numero: number; max?: number }) {
  const [u, d = 0, c = 0] = cifras(numero);
  return (
    <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 10, alignItems: 'flex-end' }} aria-label={`${c} centenas, ${d} decenas y ${u} unidades`}>
      {Array.from({ length: Math.min(c, max) }, (_, i) => (
        <svg key={`c${i}`} width="66" height="66" viewBox="0 0 46 46" aria-hidden="true">
          <rect x="2" y="2" width="42" height="42" rx="3" fill="#9A7BF0" stroke={T} strokeWidth="2.5" />
          {[1, 2, 3].map((k) => <path key={k} d={`M${2 + k * 10.5} 2v42M2 ${2 + k * 10.5}h42`} stroke={T} strokeWidth="0.8" opacity=".5" />)}
        </svg>
      ))}
      {d > 0 && (
        <div className="fila" style={{ gap: 3 }}>
          {Array.from({ length: d }, (_, i) => (
            <svg key={`d${i}`} width="18" height="70" viewBox="0 0 12 46" aria-hidden="true">
              <rect x="1.5" y="1.5" width="9" height="43" rx="2" fill="#0FA88F" stroke={T} strokeWidth="2" />
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => <path key={k} d={`M1.5 ${1.5 + k * 4.3}h9`} stroke={T} strokeWidth=".7" opacity=".5" />)}
            </svg>
          ))}
        </div>
      )}
      {u > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 18px)', gap: 4 }}>
          {Array.from({ length: u }, (_, i) => (
            <svg key={`u${i}`} width="18" height="18" viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="#FFC93C" stroke={T} strokeWidth="2" /></svg>
          ))}
        </div>
      )}
    </div>
  );
}

export function Columnas({ a, b, c, op, resaltar, mostrarResultado }: { a: number; b: number; c?: number; op: '+' | '−'; resaltar?: 'u' | 'd' | 'todo'; mostrarResultado?: number }) {
  const nums = [a, b, ...(c !== undefined ? [c] : [])];
  const largo = Math.max(...nums.map((n) => String(n).length), mostrarResultado !== undefined ? String(mostrarResultado).length : 0);
  const etiquetas = ['U', 'D', 'C', 'M'].slice(0, largo).reverse();
  const celda = (txt: string, i: number, color = T) => {
    const pos = largo - 1 - i; // 0 = unidades
    const marcado = (resaltar === 'u' && pos === 0) || (resaltar === 'd' && pos === 1) || resaltar === 'todo';
    return (
      <span key={i} style={{ width: 40, textAlign: 'center', fontFamily: 'var(--fuente-titulo)', fontSize: 40, fontWeight: 600, color, background: marcado ? '#FFF4D1' : undefined, borderRadius: 8 }}>{txt}</span>
    );
  };
  const fila = (n: number | string, color?: string) => {
    const s = String(n).padStart(largo, ' ');
    return s.split('').map((ch, i) => celda(ch.trim(), i, color));
  };
  return (
    <div className="col" style={{ alignItems: 'flex-end', gap: 0 }} aria-label={`${nums.join(` ${op} `)}`}>
      <div className="fila" style={{ gap: 0 }}>
        <span style={{ width: 36 }} />
        {etiquetas.map((e) => <span key={e} style={{ width: 40, textAlign: 'center', color: 'var(--violeta)', fontWeight: 800 }}>{e}</span>)}
      </div>
      {nums.map((n, i) => (
        <div key={i} className="fila" style={{ gap: 0 }}>
          <span style={{ width: 36, fontFamily: 'var(--fuente-titulo)', fontSize: 36, color: 'var(--violeta)' }}>{i === nums.length - 1 ? op : ''}</span>
          {fila(n)}
        </div>
      ))}
      <div style={{ height: 4, background: T, borderRadius: 2, width: 36 + 40 * largo }} />
      {mostrarResultado !== undefined && (
        <div className="fila" style={{ gap: 0 }}>
          <span style={{ width: 36 }} />
          {fila(mostrarResultado, 'var(--turquesa-oscuro)')}
        </div>
      )}
    </div>
  );
}

export function Recta({ desde, hasta, marca, objetivo, saltos }: { desde: number; hasta: number; marca?: number; objetivo?: number; saltos?: number[] }) {
  const total = hasta - desde;
  const paso = total > 12 ? Math.ceil(total / 10) : 1;
  let marcas: number[] = [];
  for (let v = desde; v <= hasta; v += paso) marcas.push(v);
  if (marcas[marcas.length - 1] !== hasta) marcas.push(hasta);
  // Con saltos (185 → 190 → 200 → 203) se marcan solo esos números.
  if (saltos?.length) marcas = saltos;
  const x = (v: number) => 16 + ((v - desde) / Math.max(1, total)) * 288;
  return (
    <svg viewBox="0 0 320 76" width="100%" style={{ maxWidth: 420 }} aria-label={`Recta numérica del ${desde} al ${hasta}`}>
      <path d="M8 40h304" stroke={T} strokeWidth="3" strokeLinecap="round" />
      <path d="M304 34l8 6-8 6" fill="none" stroke={T} strokeWidth="3" />
      {marcas.map((v) => (
        <g key={v}>
          <path d={`M${x(v)} 32v16`} stroke={T} strokeWidth="2.5" />
          <text x={x(v)} y="68" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="14" fill={v === marca ? '#5B3FE0' : T}>{v}</text>
        </g>
      ))}
      {marca !== undefined && <circle cx={x(marca)} cy="40" r="9" fill="#5B3FE0" stroke="#fff" strokeWidth="3" />}
      {objetivo !== undefined && <circle cx={x(objetivo)} cy="40" r="9" fill="#0FA88F" stroke="#fff" strokeWidth="3" />}
      {saltos?.slice(1).map((v, i) => (
        <path key={`s${v}`} d={`M${x(saltos[i])} 26 Q${(x(saltos[i]) + x(v)) / 2} 4 ${x(v)} 26`} fill="none" stroke="#0FA88F" strokeWidth="3" strokeDasharray="5 4" />
      ))}
      {!saltos?.length && marca !== undefined && objetivo !== undefined && (
        <path d={`M${x(marca)} 26 Q${(x(marca) + x(objetivo)) / 2} 0 ${x(objetivo)} 26`} fill="none" stroke="#0FA88F" strokeWidth="3" strokeDasharray="5 4" />
      )}
    </svg>
  );
}

function Objetos({ objeto, cantidad, tam = 34 }: { objeto: string; cantidad: number; tam?: number }) {
  const t = cantidad > 12 ? Math.max(24, tam - 8) : tam;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cantidad <= 5 ? cantidad : Math.ceil(cantidad / Math.ceil(cantidad / 5))}, ${t}px)`, gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: cantidad }, (_, i) => <Objeto key={i} id={objeto} size={t} />)}
    </div>
  );
}

export function VisualEjercicio({ v }: { v: Visual }) {
  switch (v.tipo) {
    case 'objetos':
      return <Objetos objeto={v.objeto} cantidad={v.cantidad} />;
    case 'grupos':
      return (
        <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {Array.from({ length: Math.min(v.grupos, 10) }, (_, g) => (
            <div key={g} style={{ background: '#FFF4D1', borderRadius: 16, padding: 8, minWidth: 64 }}>
              <Objetos objeto={v.objeto} cantidad={v.porGrupo} tam={v.porGrupo > 6 ? 18 : 26} />
            </div>
          ))}
        </div>
      );
    case 'bloques':
      return v.numero > 0 ? <Bloques numero={v.numero} /> : null;
    case 'columnas':
      return <Columnas a={v.a} b={v.b} c={v.c} op={v.op} />;
    case 'recta':
      return <Recta desde={v.desde} hasta={v.hasta} marca={v.marca} />;
    case 'billetes':
      return (
        <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {v.valores.map((x, i) => <Plata key={i} valor={x} size={x >= 10 ? 0.9 : 1} />)}
        </div>
      );
    case 'productos':
      return (
        <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {v.productos.map((p, i) => (
            <div key={i} className="col centro" style={{ background: '#FFF4D1', borderRadius: 18, padding: '8px 14px', gap: 2 }}>
              <Objeto id={p.objeto} size={56} />
              <span style={{ fontWeight: 800 }}>{p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}</span>
              <span className="titulo" style={{ fontSize: 24 }}>${p.precio.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
      );
    case 'escena':
      return (
        <div className="fila" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {v.cantidades.map((c, i) => (
            <div key={i} className="fila" style={{ gap: 10 }}>
              {i > 0 && <span className="titulo" style={{ fontSize: 32, color: 'var(--violeta)' }}>{v.nombre === 'quitar' ? '' : '+'}</span>}
              <div style={{ background: i > 0 && v.nombre === 'quitar' ? '#FFE3E6' : '#FFF4D1', borderRadius: 16, padding: 8, position: 'relative', opacity: i > 0 && v.nombre === 'quitar' ? 0.75 : 1 }}>
                <Objetos objeto={v.objeto} cantidad={c} tam={28} />
                {i > 0 && v.nombre === 'quitar' && (
                  <svg viewBox="0 0 10 10" preserveAspectRatio="none" style={{ position: 'absolute', inset: 4, width: 'calc(100% - 8px)', height: 'calc(100% - 8px)' }} aria-hidden="true">
                    <path d="M1 1L9 9M9 1L1 9" stroke="#B8323D" strokeWidth=".6" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    case 'alcancia':
      return (
        <div className="fila" style={{ justifyContent: 'center', gap: 16 }}>
          <Objeto id="alcancia" size={84} />
          <div className="col" style={{ gap: 4, minWidth: 140 }}>
            <span className="suave chico">{v.titulo ?? 'Meta'}</span>
            <span className="titulo" style={{ fontSize: 28 }}>${v.meta.toLocaleString('es-AR')}</span>
            <div className="barra" style={{ height: 16 }}><span style={{ width: `${Math.min(100, (v.guardado / v.meta) * 100)}%`, background: 'var(--turquesa)' }} /></div>
          </div>
        </div>
      );
    case 'dibujo':
      return <div className="centro" style={{ display: 'flex' }}><Objeto id={v.objeto} size={96} /></div>;
    case 'cartas':
      return (
        <div className="fila" style={{ justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          {v.manos.map((m, i) => (
            <div key={i} className="col centro" style={{ gap: 6, background: i === 0 ? 'var(--lavanda)' : '#FFF4D1', borderRadius: 18, padding: '8px 10px' }}>
              <span style={{ fontWeight: 800 }}>{m.nombre}</span>
              <div className="fila" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 170 }}>
                {m.cartas.map((c, k) => (c < 0 ? <Plata key={k} valor={-c} size={0.7} /> : <Carta key={k} n={c} color={i === 0 ? '#7A5BD9' : '#D9603B'} />))}
              </div>
            </div>
          ))}
        </div>
      );
    case 'dados':
      return (
        <div className="fila" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }} aria-label={`Dados: ${v.valores.join(', ')}`}>
          {v.valores.map((n, i) => <Dado key={i} n={n} />)}
        </div>
      );
    case 'balanza':
      return <Balanza izquierda={v.izquierda} derecha={v.derecha} />;
    case 'piramide':
      return <Piramide abajo={v.abajo} arriba={v.arriba} />;
  }
}

/** Carta propia de mateAventuras: número grande y una estrellita en las esquinas. */
function Carta({ n, color }: { n: number; color: string }) {
  return (
    <svg width="56" height="78" viewBox="0 0 56 78" role="img" aria-label={`Carta ${n}`}>
      <rect x="2" y="2" width="52" height="74" rx="8" fill="#fff" stroke={T} strokeWidth="2.5" />
      <rect x="7" y="7" width="42" height="64" rx="5" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M12 10l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill={color} />
      <path d="M44 58l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill={color} />
      <text x="28" y="48" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize={n >= 100 ? 20 : 28} fill={T}>{n}</text>
    </svg>
  );
}

const PUNTOS: Record<number, [number, number][]> = {
  1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]],
  5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]],
};
function Dado({ n }: { n: number }) {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" role="img" aria-label={`Dado con ${n}`}>
      <rect x="3" y="3" width="52" height="52" rx="12" fill="#fff" stroke={T} strokeWidth="3" />
      {(PUNTOS[n] ?? []).map(([x, y], i) => <circle key={i} cx={4 + x * 12.5} cy={4 + y * 12.5} r="5" fill={T} />)}
    </svg>
  );
}

function Balanza({ izquierda, derecha }: { izquierda: string; derecha: string }) {
  const plato = (x: number, t: string) => (
    <g>
      <path d={`M${x} 34L${x - 50} 62M${x} 34L${x + 50} 62`} stroke={T} strokeWidth="2" />
      <path d={`M${x - 58} 62h116l-12 30h-92z`} fill="#FFF4D1" stroke={T} strokeWidth="2.5" strokeLinejoin="round" />
      <text x={x} y="85" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="22" fill={T}>{t}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 300 140" width="100%" style={{ maxWidth: 340 }} role="img" aria-label={`Balanza: ${izquierda} pesa igual que ${derecha}`}>
      <path d="M150 34v94M110 132h80" stroke={T} strokeWidth="5" strokeLinecap="round" />
      <path d="M62 34h176" stroke="#7A5BD9" strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="30" r="8" fill="#FFC93C" stroke={T} strokeWidth="2.5" />
      {plato(62, izquierda)}
      {plato(238, derecha)}
    </svg>
  );
}

function Piramide({ abajo, arriba }: { abajo: (number | null)[]; arriba: number | null }) {
  const bloque = (n: number | null, key: string) => (
    <span key={key} style={{ width: 80, height: 56, borderRadius: 12, border: `3px ${n === null ? 'dashed #9C8FC4' : `solid ${T}`}`, background: n === null ? '#fff' : '#FFF4D1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fuente-titulo)', fontSize: 28, color: n === null ? '#9C8FC4' : T }}>
      {n ?? '?'}
    </span>
  );
  return (
    <div className="col centro" style={{ gap: 6 }} aria-label={`Pirámide: arriba ${arriba ?? 'falta'}, abajo ${abajo.map((x) => x ?? 'falta').join(' y ')}`}>
      <div className="fila" style={{ justifyContent: 'center' }}>{bloque(arriba, 'a')}</div>
      <div className="fila" style={{ justifyContent: 'center', gap: 6 }}>{abajo.map((n, i) => bloque(n, `b${i}`))}</div>
    </div>
  );
}
