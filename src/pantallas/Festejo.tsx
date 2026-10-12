// Pantalla 11: festejo al terminar un grado, pasar de nivel o vencer a una jefa.
import { useEffect, useMemo, useState } from 'react';
import { AvatarSVG, ItemSVG } from '../art/Avatar';
import { Guia } from '../art/Guias';
import { Estrella, Moneda } from '../art/Iconos';
import { mundoPorId, nivelPorId } from '../content';
import { frase, ITEM } from '../content/catalogo';
import { useJugadora } from '../datos/estado';
import { equipar, guardarAvatar } from '../datos/juego';
import { leerFestejo } from '../juego/festejo';
import { decir, sonido } from '../audio/voz';
import { ir } from '../ui/router';
import { Estampita } from '../art/Estampita';

function Confeti() {
  const piezas = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ left: Math.random() * 100, delay: Math.random() * 2, dur: 3 + Math.random() * 3, color: ['#FFC93C', '#0FA88F', '#E8505B', '#5B3FE0', '#F28FB8'][i % 5], size: 8 + Math.random() * 8 })), []);
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {piezas.map((p, i) => (
        <span key={i} style={{ position: 'absolute', top: -20, left: `${p.left}%`, width: p.size, height: p.size, borderRadius: i % 2 ? '50%' : 3, background: p.color, animation: `caer ${p.dur}s linear ${p.delay}s infinite` }} />
      ))}
    </div>
  );
}

export function Festejo() {
  const j = useJugadora();
  const d = leerFestejo();
  const [puesto, setPuesto] = useState(false);
  const guia = j?.guia ?? 'chispa';
  const info = d ? nivelPorId(d.nivelId) : undefined;
  const item = d?.items[0];
  const texto = !d ? '' : d.repaso ? '¡Terminaste el repaso! ¡Qué bien!' : d.esJefe && d.primeraVez ? frase(guia, 'festejoJefe') : item ? frase(guia, 'festejoNivel') : frase(guia, 'festejoGrado');
  useEffect(() => {
    sonido('festejo');
    if (texto) decir(texto);
  }, [texto]);
  if (!j || !d) {
    ir('/mapa', true);
    return null;
  }
  const volver = () => ir(d.repaso ? '/mapa' : `/nivel/${d.nivelId}`, true);
  const conItem = item && j.avatar ? equipar(j.avatar, item, ITEM[item].capa) : j.avatar;
  async function ponerlo() {
    if (!conItem) return;
    await guardarAvatar(conItem);
    setPuesto(true);
    sonido('acierto');
  }
  return (
    <main className="pantalla angosta centro col" style={{ background: 'var(--coral-claro)', position: 'relative' }}>
      <Confeti />
      <div className="col centro" style={{ zIndex: 1, gap: 10, width: '100%' }}>
        {info && !d.repaso && (
          <span className="pildora violeta" style={{ fontSize: 15 }}>
            {d.esJefe ? `Jefa vencida · ${info.mundo.nombre}` : `Grado ${d.grado} completo · ${info.nivel.nombre}`}
          </span>
        )}
        <h1 style={{ fontSize: 38 }}>{item ? '¡Premio nuevo!' : d.repaso ? '¡Repaso listo!' : '¡Lo lograste!'}</h1>
        <div className="aparece" style={{ position: 'relative' }}>
          {item && conItem ? <AvatarSVG avatar={conItem} size={190} sinFondo titulo="Tu personaje con el premio" /> : <Guia guia={guia} size={150} expr="feliz" />}
        </div>
        {d.items.map((id) => (
          <div key={id} className="tarjeta fila" style={{ width: '100%', gap: 14 }}>
            <div style={{ background: 'var(--amarillo-claro)', borderRadius: 16, padding: 6 }}><ItemSVG id={id} size={56} /></div>
            <div className="col" style={{ gap: 2, textAlign: 'left' }}>
              <h3>{ITEM[id]?.nombre}</h3>
              <span className="suave chico">Premio exclusivo · no se compra</span>
            </div>
          </div>
        ))}
        {d.estampita && (
          <div className="tarjeta fila" style={{ width: '100%', gap: 14 }}>
            <Estampita id={d.estampita} size={60} />
            <div className="col" style={{ gap: 2, textAlign: 'left' }}>
              <h3>¡Estampita nueva!</h3>
              <span className="suave chico">Completaste los 5 grados del nivel.</span>
            </div>
          </div>
        )}
        {d.mundoNuevo && <p className="aviso-caja verde">¡Se abrió un mundo nuevo: {mundoPorId(d.mundoNuevo)?.nombre}!</p>}
        {d.racha && <p className="aviso-caja amarillo">¡3 días seguidos jugando! Ganaste monedas extra.</p>}
        <div className="fila" style={{ justifyContent: 'center', gap: 10 }}>
          <span className="pildora monedas"><Moneda size={24} /> +{d.monedas}</span>
          {!d.repaso && Array.from({ length: 3 }, (_, i) => <Estrella key={i} size={34} llena={i < d.estrellasGrado} />)}
        </div>
        {d.estrellasNuevas === 0 && !d.primeraVez && !d.repaso && <p className="suave chico">Ya tenías estas estrellas. ¡Igual ganaste monedas!</p>}
      </div>
      <div className="empuja" />
      <div className="col" style={{ width: '100%', zIndex: 1 }}>
        {item && !puesto && <button className="boton ancho" onClick={ponerlo}>Ponérmelo ahora</button>}
        {puesto && <p className="aviso-caja verde centro">¡Ya lo tenés puesto!</p>}
        <button className={item && !puesto ? 'boton blanco ancho' : 'boton ancho'} onClick={volver}>Seguir</button>
      </div>
    </main>
  );
}
