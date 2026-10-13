// Pantalla 9: minilección de hasta 3 pasos cuando se equivocan dos veces (o piden ayuda).
import { useEffect, useState } from 'react';
import { Icono } from '../art/Iconos';
import { Objeto } from '../art/Objetos';
import { Plata } from '../art/Plata';
import { decir } from '../audio/voz';
import type { LeccionArmada } from '../engine/leccion';
import type { Ejercicio } from '../engine/tipos';
import { Bloques, Columnas, Recta, VisualEjercicio } from './Visuales';

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v));

function Dibujo({ lec, ej, paso }: { lec: LeccionArmada; ej: Ejercicio; paso: number }) {
  const d = ej.leccion;
  switch (lec.visual) {
    case 'columnas-suma':
      if (d.c) return <Columnas a={num(d.a)} b={num(d.b)} c={num(d.c)} op="+" resaltar={paso === 0 ? 'u' : paso === 1 ? 'd' : 'todo'} mostrarResultado={paso >= 2 ? num(d.r) : undefined} />;
      return (
        <div className="col" style={{ alignItems: 'flex-end' }}>
          {d.llevada && paso >= 0 && <span style={{ marginRight: 50, width: 30, height: 30, borderRadius: '50%', border: '3px solid var(--amarillo)', background: '#FFF4D1', textAlign: 'center', fontWeight: 800 }} aria-label="Nos llevamos 1">1</span>}
          <Columnas a={num(d.a)} b={num(d.b)} op="+" resaltar={paso === 0 ? 'u' : paso === 1 ? 'd' : 'todo'} mostrarResultado={paso >= 2 ? num(d.r) : undefined} />
        </div>
      );
    case 'columnas-resta':
      return <Columnas a={num(d.a)} b={num(d.b)} op="−" resaltar={paso === 0 ? 'u' : paso === 1 ? 'd' : 'todo'} mostrarResultado={paso >= 2 ? num(d.r) : undefined} />;
    case 'valor-posicional':
      return (
        <div className="col centro" style={{ gap: 10 }}>
          <Bloques numero={num(d.n)} />
          <div className="fila" style={{ gap: 6 }}>
            {[['C', d.c, '#E9E3FF'], ['D', d.d, '#D7F5EE'], ['U', d.u, '#FFF4D1']].filter(([l]) => l !== 'C' || d.tieneCentenas).map(([l, v, bg]) => (
              <div key={String(l)} className="col centro" style={{ background: String(bg), borderRadius: 12, padding: '4px 14px', gap: 0 }}>
                <span style={{ fontWeight: 800, color: 'var(--violeta)' }}>{String(l)}</span>
                <span className="titulo" style={{ fontSize: 30 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'recta': {
      // Adivinanza: la recta de la familia y el número que cumple las pistas.
      if (d.pista1 !== undefined) return <Recta desde={num(d.desde)} hasta={num(d.hasta)} objetivo={paso >= 2 ? num(d.r) : undefined} />;
      // Contar saltando de un número al otro (restas, vuelto, cuánto falta).
      if (d.saltosTexto !== undefined) {
        const puntos = String(d.saltosTexto).split(' → ').map(Number);
        return <Recta desde={puntos[0]} hasta={puntos[puntos.length - 1]} marca={puntos[0]} saltos={paso >= 1 ? puntos : undefined} objetivo={paso >= 1 ? puntos[puntos.length - 1] : undefined} />;
      }
      const desde = num(d.desde ?? d.a ?? d.n ?? d.mayor ?? 0);
      if (d.meta !== undefined) return <Recta desde={num(d.a)} hasta={num(d.meta)} marca={num(d.a)} objetivo={paso >= 2 ? num(d.meta) : undefined} />;
      if (d.cual) return <Recta desde={Math.max(0, num(d.n) - 3)} hasta={num(d.n) + 3} marca={num(d.n)} objetivo={paso >= 1 ? num(d.r) : undefined} />;
      const r = num(d.r);
      return <Recta desde={Math.max(0, Math.min(desde, r) - 1)} hasta={Math.max(desde, r) + 1} marca={desde} objetivo={paso >= 1 ? r : undefined} />;
    }
    case 'comparar':
      return (
        <div className="fila" style={{ justifyContent: 'center', gap: 24 }}>
          {[d.mayor, d.menor].map((n, i) => (
            <span key={i} className="titulo" style={{ fontSize: 44, color: i === 0 && paso >= 2 ? 'var(--turquesa-oscuro)' : 'var(--tinta)' }}>
              <span style={{ background: paso >= 0 ? '#FFF4D1' : undefined, borderRadius: 8 }}>{String(n).charAt(0)}</span>{String(n).slice(1)}
            </span>
          ))}
        </div>
      );
    case 'grupos':
      return <VisualEjercicio v={{ tipo: 'grupos', objeto: 'manzana', grupos: Math.min(num(d.g), 6), porGrupo: Math.min(num(d.p), 10) }} />;
    case 'billetes': {
      const valores = String(d.sumaTexto ?? '').split('+').map((x) => Number(x.trim())).filter((x) => x > 0);
      if (d.pago !== undefined) return <div className="fila" style={{ justifyContent: 'center', gap: 10 }}><Plata valor={num(d.pago)} /><Icono nombre="adelante" /><span className="titulo" style={{ fontSize: 30 }}>${String(paso >= 2 ? d.r : '?')}</span></div>;
      return <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>{valores.slice(0, 8).map((v, i) => <Plata key={i} valor={v} size={0.8} />)}</div>;
    }
    case 'operacion':
      return <span className="titulo" style={{ fontSize: 64, color: 'var(--violeta)', textAlign: 'center' }}>{String(d.signo ?? '+')}</span>;
    case 'historia':
      return ej.visual ? <VisualEjercicio v={ej.visual} /> : null;
    case 'alcancia':
      return <VisualEjercicio v={{ tipo: 'alcancia', meta: num(d.meta ?? d.plata ?? 100), guardado: num(d.porSemana ?? d.guardo ?? 0) }} />;
    case 'contar':
      return ej.visual ? <VisualEjercicio v={ej.visual} /> : null;
    default:
      return ej.visual?.tipo === 'dibujo' ? <div className="centro" style={{ display: 'flex' }}><Objeto id={ej.visual.objeto} size={80} /></div> : null;
  }
}

export function Leccion({
  lec,
  ej,
  respuesta,
  alTerminar,
  intro,
}: {
  lec: LeccionArmada;
  ej: Ejercicio;
  respuesta?: string;
  alTerminar: () => void;
  /** Frase de la guía que se dice antes del primer paso. */
  intro?: string;
}) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    decir(paso === 0 && intro ? [intro, lec.pasos[0]] : lec.pasos[paso]);
  }, [paso, lec]); // eslint-disable-line react-hooks/exhaustive-deps
  const ultimo = paso >= lec.pasos.length - 1;
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="tarjeta fila" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px', display: 'flex', justifyContent: 'center' }}>
          <Dibujo lec={lec} ej={ej} paso={paso} />
        </div>
        {respuesta && respuesta !== 'ok' && (
          <div className="col" style={{ flex: '1 1 140px', gap: 6 }}>
            <div style={{ background: 'var(--naranja-claro)', borderRadius: 14, padding: '8px 12px' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--naranja-texto)' }}>Tu respuesta</span>
              <div className="titulo" style={{ fontSize: 26 }}>{respuesta}</div>
            </div>
            <p style={{ fontSize: 16 }}>{lec.diagnostico}</p>
          </div>
        )}
      </div>
      <ol className="col" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 10 }} aria-label="Pasos">
        {lec.pasos.map((t, i) => {
          const hecho = i < paso;
          const actual = i === paso;
          return (
            <li key={i} className="fila" aria-current={actual ? 'step' : undefined} style={{ alignItems: 'flex-start', gap: 12, borderRadius: 20, padding: 14, background: hecho ? 'var(--turquesa-claro)' : '#fff', border: actual ? '4px solid var(--violeta)' : '4px solid transparent', opacity: i > paso ? 0.6 : 1 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hecho ? 'var(--turquesa-oscuro)' : actual ? 'var(--violeta)' : 'var(--lavanda)', color: hecho || actual ? '#fff' : 'var(--tinta)', fontWeight: 800 }}>
                {hecho ? <Icono nombre="tilde" size={20} grosor={3} /> : i + 1}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: hecho ? 'var(--turquesa-oscuro)' : 'var(--tinta)' }}>{t}</span>
            </li>
          );
        })}
      </ol>
      <div className="fila" style={{ gap: 10, marginTop: 'auto' }}>
        <button className="boton borde" style={{ flex: 1 }} onClick={() => decir(lec.pasos[paso], { forzar: true })}>Ver de nuevo</button>
        <button className="boton" style={{ flex: 1.3 }} onClick={() => (ultimo ? alTerminar() : setPaso(paso + 1))}>{ultimo ? '¡Probemos!' : 'Siguiente paso'}</button>
      </div>
    </div>
  );
}
