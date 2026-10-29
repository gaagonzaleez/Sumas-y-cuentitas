// Los 8 niveles y el jefe de un mundo, con su camino de puntitos.
import { Icono } from '../art/Iconos';
import { Camino, IslaMundo } from '../art/Mundos';
import { mundoPorId } from '../content';
import { estrellasNivel, gradoDesbloqueado, nivelActual } from '../engine/progreso';
import { useJugadora } from '../datos/estado';
import { BotonVolver, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';
import { Estrella } from '../art/Iconos';

const ALTO = 112;

export function Mundo({ id }: { id: string }) {
  const j = useJugadora();
  const m = mundoPorId(id);
  if (!j || !m) return null;
  const niveles = [...m.niveles, m.jefe];
  const act = nivelActual(j.progreso, m);
  const puntos = niveles.map((_, i) => ({ x: [22, 50, 78, 50][i % 4], y: (niveles.length - 1 - i) * ALTO + 56 }));
  const alto = niveles.length * ALTO + 20;
  return (
    <main className="pantalla angosta" style={{ gap: 12 }}>
      <div className="fila entre">
        <BotonVolver a="/mapa" />
        <div className="col" style={{ gap: 0, flex: 1 }}>
          <span className="suave chico">Mundo {m.numero}</span>
          <h2>{m.nombre}</h2>
        </div>
        <PildoraMonedas n={j.monedas} />
      </div>
      {m.nota && <p className="aviso-caja amarillo" style={{ margin: 0 }}>{m.nota}</p>}
      <div style={{ position: 'relative', height: alto, borderRadius: 32, background: `radial-gradient(420px 260px at 85% 0%, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%), linear-gradient(180deg, ${m.colores.cielo} 0%, ${m.colores.suelo} 100%)`, boxShadow: 'var(--sombra-tarjeta)', overflow: 'hidden' }}>
        <Camino puntos={puntos} alto={alto} />
        <div className="flota-suave" style={{ position: 'absolute', right: 6, top: 8 }}><IslaMundo id={m.id} suelo={m.colores.suelo} acento={m.colores.acento} size={104} /></div>
        {niveles.map((n, i) => {
          const abierto = gradoDesbloqueado(j.progreso, m, n.id, 1);
          const esJefe = n.id === m.jefe.id;
          const actual = act.id === n.id;
          const est = estrellasNivel(j.progreso, n.id);
          const p = puntos[i];
          return (
            <button key={n.id} onClick={() => abierto && ir(`/nivel/${n.id}`)} aria-disabled={!abierto}
              aria-label={`${esJefe ? 'Gran desafío: ' : `Nivel ${i + 1}: `}${n.nombre}${abierto ? `, ${est} estrellas de 15` : ', bloqueado'}`}
              className={actual ? 'flota-suave' : undefined}
              style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', background: 'none', border: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 116, zIndex: actual ? 2 : 1 }}>
              <span style={{ position: 'relative', display: 'flex' }}>
                {actual && <span className="halo" />}
                <span className={`ficha${esJefe ? ' jefe' : ''}${!abierto ? ' cerrada' : actual ? ' actual' : est > 0 ? ' hecha' : ''}`}>
                  {!abierto ? <Icono nombre="candado" /> : esJefe ? <Icono nombre="trofeo" size={34} /> : i + 1}
                </span>
              </span>
              <span className="cartel" style={{ fontSize: 16, fontWeight: 800, padding: '3px 8px', lineHeight: 1.15 }}>
                {esJefe ? n.nombre : n.nombre}
              </span>
              {abierto && <span className="fila" style={{ gap: 2, fontSize: 16, fontWeight: 800 }}><Estrella size={14} /> {est}/15</span>}
            </button>
          );
        })}
      </div>
    </main>
  );
}
