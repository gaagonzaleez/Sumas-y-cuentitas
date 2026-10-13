// Pantalla 7: cuidar a la mascota. Barra de crecimiento 0–300 que sube y baja, con avisos.
import { useState } from 'react';
import { Icono, Moneda } from '../art/Iconos';
import { MascotaSVG } from '../art/Mascota';
import { config } from '../content';
import { frase, ITEMS, mascotaPorId } from '../content/catalogo';
import { animoDe, avisoBarra, enRegresoFeliz, etapaDe } from '../engine/mascota';
import { diaArgentina } from '../engine/semana';
import { useEstado, useJugadora } from '../datos/estado';
import { alimentarMascota, comprarItem, jugarConMascota, precioFinal, vestirMascota } from '../datos/juego';
import { decir, sonido } from '../audio/voz';
import { MenuInferior, Modal, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';

export function MiMascota() {
  const j = useJugadora();
  const e = useEstado();
  const [mensaje, setMensaje] = useState('');
  const [salta, setSalta] = useState(false);
  const [vestir, setVestir] = useState(false);
  if (!j) return null;
  const m = j.mascota;
  if (!m) {
    ir('/mascota/elegir', true);
    return null;
  }
  const cfg = config.mascota;
  const hoy = diaArgentina();
  const etapa = etapaDe(m.crecimiento);
  const animo = animoDe(m, hoy, e.diasAusente);
  const aviso = avisoBarra(m);
  const especie = mascotaPorId(m.especie);
  const nombreEtapa = cfg.etapas.find((x) => x.id === etapa)!.nombre;
  const guia = j.guia ?? 'chispa';
  const saludo = mensaje || (animo === 'extranando' ? `¡Te extrañé, ${j.apodo}! ¿Jugamos?` : animo === 'contenta' ? `¡Hola, ${j.apodo}! ¡Estoy feliz!` : `¡Hola, ${j.apodo}! ¿Me das de comer?`);

  async function alimentar() {
    const r = await alimentarMascota();
    if (r === 'ok') {
      sonido('acierto');
      setMensaje('¡Ñam ñam! ¡Gracias!');
      saltar();
    } else {
      setMensaje(frase(guia, 'sinMonedas'));
      decir(frase(guia, 'sinMonedas'));
    }
  }
  async function jugar() {
    const sumo = await jugarConMascota();
    sonido('festejo');
    setMensaje(sumo ? '¡Qué divertido! ¡Me encanta jugar con vos!' : '¡Otra vez! Hoy ya sumamos puntos jugando, pero igual me pongo contenta.');
    saltar();
  }
  function saltar() {
    setSalta(true);
    setTimeout(() => setSalta(false), 1700);
  }
  const marcas = cfg.etapas.slice(1).map((x) => x.desde / cfg.maximo);
  const accesorios = ITEMS.filter((i) => i.capa === 'mascota');

  return (
    <main className="pantalla con-menu" style={{ gap: 14, maxWidth: 560, margin: '0 auto' }}>
      <div className="fila entre">
        <h1>Mi mascota</h1>
        <PildoraMonedas n={j.monedas} />
      </div>
      <section style={{ borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(#CDE9FF 60%, #9ED9A8 60%)', padding: 16, position: 'relative', minHeight: 300 }}>
        <p className="burbuja" style={{ display: 'inline-block', maxWidth: '85%' }} aria-live="polite">{saludo}</p>
        <div className="centro" style={{ display: 'flex', marginTop: 8 }}>
          <div className={salta ? 'rebota' : undefined}>
            <MascotaSVG especie={m.especie} etapa={etapa} animo={mensaje ? 'contenta' : animo} size={200} accesorios={m.accesorios} />
          </div>
        </div>
      </section>
      <div className="fila entre">
        <h2>{m.nombre}</h2>
        <span className="pildora violeta">{especie.nombre} {nombreEtapa}</span>
      </div>
      <div className="col" style={{ gap: 6 }}>
        <div className="fila entre">
          <span className="etiqueta">Etapa de {m.nombre}</span>
          <span style={{ fontWeight: 800 }}>{m.crecimiento} de {cfg.maximo}</span>
        </div>
        <div className="barra" style={{ height: 18 }} role="progressbar" aria-label="Crecimiento" aria-valuemin={0} aria-valuemax={cfg.maximo} aria-valuenow={m.crecimiento}>
          <span style={{ width: `${(m.crecimiento / cfg.maximo) * 100}%`, background: 'var(--violeta)' }} />
          {marcas.map((x) => <i key={x} style={{ position: 'absolute', left: `${x * 100}%`, top: 0, bottom: 0, width: 3, background: '#fff' }} />)}
        </div>
        <div className="fila entre chico" style={{ fontWeight: 800 }}>
          {cfg.etapas.map((x) => <span key={x.id} style={{ color: x.id === etapa ? 'var(--violeta)' : 'var(--tinta-suave)', textTransform: 'capitalize' }}>{x.nombre}</span>)}
        </div>
        {aviso.tipo === 'crecer' && (
          <p className="aviso-caja verde"><Icono nombre="flecha_arriba" size={20} />
            {aviso.faltan <= cfg.avisoFaltaParaCrecer ? `¡${m.nombre} está por crecer! ${aviso.faltan === 1 ? 'Falta 1 punto' : `Faltan ${aviso.faltan} puntos`}.` : `Jugá hoy y sumá: faltan ${aviso.faltan} para ser ${etapa === 'bebe' ? 'joven' : 'grande'}.`}
          </p>
        )}
        {aviso.tipo === 'max' && <p className="aviso-caja verde"><Icono nombre="estrella" size={20} />¡{m.nombre} creció todo lo que puede!</p>}
        {aviso.tipo === 'bajar' ? (
          <p className="aviso-caja naranja"><Icono nombre="flecha_abajo" size={20} />{m.nombre} te extraña. ¡Vení a jugar un ratito!</p>
        ) : (
          <p className="aviso-caja naranja"><Icono nombre="flecha_abajo" size={20} />Si pasan {cfg.diasDeGracia} días sin jugar, empieza a bajar.</p>
        )}
        {enRegresoFeliz(m, hoy) && <p className="aviso-caja amarillo"><Icono nombre="corazon" size={20} />¡Regreso feliz! Puntos dobles hasta el {m.regresoFelizHasta!.split('-').reverse().slice(0, 2).join('/')}.</p>}
      </div>
      <div className="grilla-2">
        <div className="col" style={{ gap: 4 }}>
          <span className="etiqueta">Contento</span>
          <div className="barra"><span style={{ width: `${m.contento}%`, background: 'var(--coral)' }} /></div>
        </div>
        <div className="col" style={{ gap: 4 }}>
          <span className="etiqueta">Panza llena</span>
          <div className="barra"><span style={{ width: `${m.panza}%`, background: 'var(--naranja)' }} /></div>
        </div>
      </div>
      <div className="grilla-3">
        {[
          { icono: 'manzana' as const, t: 'Alimentar', s: `${cfg.precioAlimentar} monedas`, f: alimentar },
          { icono: 'pelota' as const, t: 'Jugar', s: 'Gratis', f: jugar },
          { icono: 'gorro' as const, t: 'Vestir', s: 'Gorros y más', f: () => setVestir(true) },
        ].map((b) => (
          <button key={b.t} className="tarjeta col centro" style={{ gap: 2, padding: '14px 6px', border: 0, minHeight: 100 }} onClick={b.f}>
            <span style={{ color: 'var(--violeta)' }}><Icono nombre={b.icono} size={30} /></span>
            <span className="titulo" style={{ fontSize: 20 }}>{b.t}</span>
            <span className="suave chico">{b.s}</span>
          </button>
        ))}
      </div>
      <button className="boton-link" onClick={() => ir('/mascota/elegir')}>Cambiar de mascota</button>
      {vestir && (
        <Modal titulo="Vestir" alCerrar={() => setVestir(false)}>
          <h2>Vestir a {m.nombre}</h2>
          <div className="grilla-3">
            {accesorios.map((a) => {
              const tiene = j.items.includes(a.id);
              const puesto = m.accesorios.includes(a.id);
              return (
                <button key={a.id} className="col centro" style={{ gap: 2, borderRadius: 16, padding: 6, border: `3px solid ${puesto ? 'var(--violeta)' : 'var(--lavanda)'}`, background: puesto ? 'var(--lavanda)' : '#fff' }}
                  aria-pressed={puesto}
                  onClick={async () => {
                    if (tiene) return vestirMascota(a.id);
                    const r = await comprarItem(a.id);
                    if (r === 'ok') { sonido('festejo'); vestirMascota(a.id); } else setMensaje(frase(guia, 'sinMonedas'));
                  }}>
                  <MascotaSVG especie={m.especie} etapa={etapa} animo="contenta" size={64} accesorios={[a.id]} />
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{a.nombre}</span>
                  {!tiene && <span className="fila chico" style={{ gap: 3 }}><Moneda size={16} /> {precioFinal(a.id)}</span>}
                </button>
              );
            })}
          </div>
          <button className="boton ancho" onClick={() => setVestir(false)}>Listo</button>
        </Modal>
      )}
      <MenuInferior actual="mascota" />
    </main>
  );
}
