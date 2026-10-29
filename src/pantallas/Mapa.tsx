// Pantalla 5: mapa de la aventura con los 7 mundos.
import { AvatarCirculo } from '../art/Avatar';
import { Icono } from '../art/Iconos';
import { MascotaSVG } from '../art/Mascota';
import { Camino, CieloMapa, IslaMundo } from '../art/Mundos';
import { config, mundoPorId } from '../content';
import { frase } from '../content/catalogo';
import { animoDe, etapaDe } from '../engine/mascota';
import { esCreadora, estrellasMundo, mundoActual, mundoDesbloqueado, mundoTerminado, nivelActual } from '../engine/progreso';
import { diaArgentina } from '../engine/semana';
import { infoError } from '../engine/leccion';
import { useEstado, useJugadora } from '../datos/estado';
import { erroresParaRepasar } from '../datos/juego';
import { AvisoSinConexion, Estrellas, GuiaDice, MenuInferior, PildoraEstrellas, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';

const ALTO = 150;

export function Encabezado() {
  const j = useJugadora()!;
  const actual = mundoActual(j.progreso);
  const n = nivelActual(j.progreso, actual);
  return (
    <header className="fila entre" style={{ background: '#fff', margin: '-20px -20px 0', padding: 'calc(14px + var(--seguro-arriba)) 16px 14px' }}>
      <button className="fila" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', minHeight: 48, flex: 1, minWidth: 0 }} onClick={() => ir('/avatar')} aria-label="Cambiar mi personaje">
        {j.avatar && <AvatarCirculo avatar={j.avatar} size={48} />}
        <span className="col" style={{ gap: 0, minWidth: 0 }}>
          <span className="titulo recorte" style={{ fontSize: 20 }}>{j.apodo}</span>
          {esCreadora(j.apodo) && <span className="chico recorte" style={{ fontWeight: 800, color: 'var(--violeta)' }}>Modo creadora · todo abierto</span>}
          <span className="suave chico recorte">{n.indice >= 8 ? 'Gran desafío' : `Nivel ${n.indice + 1}`} · {actual.nombre.split(' ').slice(-1)[0]}</span>
        </span>
      </button>
      <div className="fila encabezado-pildoras" style={{ gap: 4, flex: 'none' }}>
        <PildoraMonedas n={j.monedas} />
        <PildoraEstrellas n={j.estrellas} />
        <button className="boton-icono" onClick={() => ir('/ajustes')} aria-label="Ajustes"><Icono nombre="ajustes" /></button>
      </div>
    </header>
  );
}

export function Mapa() {
  const j = useJugadora();
  const e = useEstado();
  if (!j) return null;
  const orden = config.progreso.mundosOrden;
  const actual = mundoActual(j.progreso);
  const hoy = diaArgentina();
  const repasar = erroresParaRepasar(j)[0];
  const guia = j.guia ?? 'chispa';
  const puntos = orden.map((_, i) => ({ x: i % 2 === 0 ? 24 : 72, y: (orden.length - 1 - i) * ALTO + 90 }));
  const altoTotal = orden.length * ALTO + 40;
  return (
    <main className="pantalla con-menu" style={{ paddingTop: 20, gap: 12 }}>
      <Encabezado />
      <AvisoSinConexion />
      {e.diasAusente >= 2 && <GuiaDice guia={guia} texto={frase(guia, 'bienvenida')} />}
      {repasar && (
        <button className="tarjeta fila" style={{ border: '3px solid var(--amarillo)', textAlign: 'left' }} onClick={() => ir(`/repaso/${repasar.tag}`)}>
          <Icono nombre="foco" size={32} />
          <span className="col" style={{ gap: 2, flex: 1 }}>
            <span style={{ fontWeight: 800 }}>¿Repasamos {infoError(repasar.tag).tema.toLowerCase()}?</span>
            <span className="suave chico">Un ratito de práctica con ayuda. ¡También da monedas!</span>
          </span>
          <Icono nombre="adelante" />
        </button>
      )}
      <div style={{ position: 'relative', height: altoTotal, borderRadius: 32, margin: '0 -8px', maxWidth: 560, alignSelf: 'center', width: '100%', boxShadow: 'var(--sombra-tarjeta)' }}>
        <CieloMapa alto={altoTotal} />
        <Camino puntos={puntos.map((p) => ({ x: p.x, y: p.y }))} alto={altoTotal} />
        {orden.map((id, i) => {
          const m = mundoPorId(id)!;
          const abierto = mundoDesbloqueado(j.progreso, id);
          const terminado = mundoTerminado(j.progreso, m);
          const esActual = m.id === actual.id;
          const p = puntos[i];
          const izq = p.x < 50;
          const nAct = nivelActual(j.progreso, m);
          const tam = esActual ? 120 : 96;
          return (
            <div key={id} ref={esActual ? (el) => el?.scrollIntoView({ block: 'center' }) : undefined} style={{ position: 'absolute', left: `${p.x}%`, top: p.y, transform: 'translate(-50%, -50%)', zIndex: esActual ? 2 : 1 }}>
              <button
                onClick={() => (abierto ? ir(`/mundo/${id}`) : undefined)}
                aria-disabled={!abierto}
                aria-label={`${m.nombre}${abierto ? (terminado ? ', terminado' : (nAct.indice >= 8 ? ', gran desafío' : `, nivel ${nAct.indice + 1} de 8`)) : ', bloqueado'}`}
                className={`isla-boton ${esActual ? '' : 'flota-suave'}`}
                style={{ width: tam, height: tam, animationDelay: `${-i * 0.7}s`, cursor: abierto ? 'pointer' : 'default' }}>
                {esActual && <span className="halo" />}
                <IslaMundo id={id} suelo={m.colores.suelo} acento={m.colores.acento} size={tam} abierta={abierto} />
                {!abierto && (
                  <span className="isla-insignia" style={{ background: '#fff', color: 'var(--tinta-suave)' }}><Icono nombre="candado" size={20} /></span>
                )}
                {abierto && (
                  <span className="isla-insignia" style={{ background: terminado ? 'linear-gradient(180deg,#FFE27A,#FFC93C)' : esActual ? 'linear-gradient(180deg,var(--violeta-claro),var(--violeta))' : '#fff', color: esActual ? '#fff' : 'var(--tinta)' }}>
                    {terminado ? <Icono nombre="estrella" size={18} /> : m.numero}
                  </span>
                )}
              </button>
              <div className="cartel" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [izq ? 'left' : 'right']: tam - 4, width: 140, textAlign: izq ? 'left' : 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.15, color: abierto ? 'var(--tinta)' : 'var(--tinta-suave)' }}>{m.nombre}</div>
                {m.etiqueta && <span className="pildora chica" style={{ background: 'var(--amarillo)', minHeight: 24, fontSize: 16, marginTop: 2 }}>{m.etiqueta}</span>}
                {esActual && !terminado && <div style={{ color: 'var(--violeta)', fontWeight: 800, fontSize: 16 }}>{nAct.indice >= 8 ? '¡Gran desafío!' : `Nivel ${nAct.indice + 1} de 8`}</div>}
                {terminado && <Estrellas n={Math.min(3, Math.round(estrellasMundo(j.progreso, m) / 45))} size={18} />}
              </div>
              {esActual && j.mascota && (
                <div style={{ position: 'absolute', [izq ? 'right' : 'left']: tam * 0.55, top: -40, zIndex: 3 }} className="rebota">
                  <MascotaSVG especie={j.mascota.especie} etapa={etapaDe(j.mascota.crecimiento)} animo={animoDe(j.mascota, hoy, e.diasAusente)} size={68} accesorios={j.mascota.accesorios} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <MenuInferior actual="mapa" />
    </main>
  );
}
