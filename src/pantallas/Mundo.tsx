// Los 8 niveles y el jefe de un mundo, con su camino de puntitos.
import { Icono } from '../art/Iconos';
import { Camino, EscenaMundo } from '../art/Mundos';
import { mundoPorId } from '../content';
import { estrellasNivel, gradoDesbloqueado, nivelActual } from '../engine/progreso';
import { useJugadora } from '../datos/estado';
import { BotonVolver, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';
import { Estrella } from '../art/Iconos';

const ALTO = 96;

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
      <div style={{ position: 'relative', height: alto, borderRadius: 28, background: `linear-gradient(${m.colores.cielo}, ${m.colores.suelo})` }}>
        <Camino puntos={puntos} alto={alto} />
        <div style={{ position: 'absolute', right: 10, top: 10, opacity: 0.9 }}><EscenaMundo id={m.id} size={86} /></div>
        {niveles.map((n, i) => {
          const abierto = gradoDesbloqueado(j.progreso, m, n.id, 1);
          const esJefe = n.id === m.jefe.id;
          const actual = act.id === n.id;
          const est = estrellasNivel(j.progreso, n.id);
          const p = puntos[i];
          return (
            <button key={n.id} onClick={() => abierto && ir(`/nivel/${n.id}`)} aria-disabled={!abierto}
              aria-label={`${esJefe ? 'Gran desafío: ' : `Nivel ${i + 1}: `}${n.nombre}${abierto ? `, ${est} estrellas de 15` : ', bloqueado'}`}
              className={actual ? 'late' : undefined}
              style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', background: 'none', border: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 110 }}>
              <span style={{
                width: esJefe ? 72 : 60, height: esJefe ? 72 : 60, borderRadius: esJefe ? 22 : '50%', border: '4px solid #fff',
                boxShadow: actual ? '0 0 0 4px var(--violeta)' : '0 3px 0 rgba(43,35,80,.15)',
                background: !abierto ? '#CFC6F5' : actual ? 'var(--violeta)' : est > 0 ? 'var(--amarillo)' : '#fff',
                color: actual ? '#fff' : 'var(--tinta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fuente-titulo)', fontSize: 26, fontWeight: 700,
              }}>
                {!abierto ? <Icono nombre="candado" /> : esJefe ? <Icono nombre="trofeo" size={34} /> : i + 1}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,.85)', borderRadius: 10, padding: '2px 6px', lineHeight: 1.15 }}>
                {esJefe ? n.nombre : n.nombre}
              </span>
              {abierto && <span className="fila" style={{ gap: 2, fontSize: 13, fontWeight: 800 }}><Estrella size={14} /> {est}/15</span>}
            </button>
          );
        })}
      </div>
    </main>
  );
}
