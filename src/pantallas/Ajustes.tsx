// Ajustes de la nena: voz, guía, carrera contra el reloj, salir.
import { Guia } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { actualizar, salir, useJugadora } from '../datos/estado';
import { configurarVoz } from '../audio/voz';
import { BotonVolver } from '../ui/comunes';
import { ir } from '../ui/router';
import { Estampita } from '../art/Estampita';

function Interruptor({ etiqueta, ayuda, valor, alCambiar }: { etiqueta: string; ayuda: string; valor: boolean; alCambiar: (v: boolean) => void }) {
  return (
    <button className="tarjeta fila entre" style={{ border: 0, textAlign: 'left' }} role="switch" aria-checked={valor} onClick={() => alCambiar(!valor)}>
      <span className="col" style={{ gap: 2 }}>
        <span style={{ fontWeight: 800 }}>{etiqueta}</span>
        <span className="suave chico">{ayuda}</span>
      </span>
      <span style={{ width: 60, height: 36, borderRadius: 999, background: valor ? 'var(--violeta)' : 'var(--lila)', position: 'relative', flex: 'none' }}>
        <span style={{ position: 'absolute', top: 4, left: valor ? 28 : 4, width: 28, height: 28, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
        <span className="sr-only">{valor ? 'Activado' : 'Apagado'}</span>
      </span>
    </button>
  );
}

export function Ajustes() {
  const j = useJugadora();
  if (!j) return null;
  return (
    <main className="pantalla angosta" style={{ gap: 12 }}>
      <div className="fila"><BotonVolver a="/mapa" /><h1>Ajustes</h1></div>
      <Interruptor etiqueta="Voz de la guía" ayuda="Los subtítulos se ven siempre." valor={!j.ajustes.silencio}
        alCambiar={(v) => { configurarVoz(j.guia ?? 'chispa', !v); actualizar((x) => ({ ...x, ajustes: { ...x.ajustes, silencio: !v } })); }} />
      <Interruptor etiqueta="Carrera contra el reloj" ayuda="Muestra el tiempo en tablas, sumas y restas. Nunca se pierde por tiempo." valor={j.ajustes.reloj}
        alCambiar={(v) => actualizar((x) => ({ ...x, ajustes: { ...x.ajustes, reloj: v } }))} />
      <button className="tarjeta fila" style={{ border: 0, textAlign: 'left' }} onClick={() => ir('/guia')}>
        <Guia guia={j.guia ?? 'chispa'} size={48} />
        <span style={{ fontWeight: 800, flex: 1 }}>Cambiar de guía</span>
        <Icono nombre="adelante" />
      </button>
      <button className="tarjeta fila" style={{ border: 0, textAlign: 'left' }} onClick={() => ir('/avatar')}>
        <Icono nombre="ropero" size={32} />
        <span style={{ fontWeight: 800, flex: 1 }}>Mi personaje y mi ropero</span>
        <Icono nombre="adelante" />
      </button>
      <div className="tarjeta col" style={{ gap: 8 }}>
        <span style={{ fontWeight: 800 }}>Mis estampitas ({j.estampitas.length} de 56)</span>
        {j.estampitas.length === 0 ? <span className="suave chico">Completá los 5 grados de un nivel para ganar su estampita.</span> : (
          <div className="fila" style={{ flexWrap: 'wrap', gap: 8 }}>{j.estampitas.map((e) => <Estampita key={e} id={e} size={52} />)}</div>
        )}
      </div>
      <div className="empuja" />
      <button className="boton blanco ancho" onClick={() => ir('/adulta/entrar?a=/adulta/panel')}><Icono nombre="usuaria" /> Panel de la adulta</button>
      <button className="boton blanco ancho" onClick={() => { salir(); ir('/entrar'); }}><Icono nombre="salir" /> Salir</button>
      <button className="boton-link" style={{ alignSelf: 'center', color: 'var(--tinta-suave)' }} onClick={() => location.reload()}>
        Versión del {__VERSION__} · tocá para buscar actualización
      </button>
    </main>
  );
}
