// Pantalla 2: crear y cambiar el avatar. Ítems bloqueados muestran su precio en monedas.
import { useState } from 'react';
import { AvatarSVG, ItemSVG } from '../art/Avatar';
import { Icono, Moneda } from '../art/Iconos';
import { ITEMS, ITEM, OPCIONES_AVATAR, frase } from '../content/catalogo';
import { actualizar, avatarInicial, useJugadora } from '../datos/estado';
import { comprarItem, equipar, guardarAvatar, guardarEnRopero, precioFinal } from '../datos/juego';
import type { Avatar } from '../datos/tipos';
import { GuiaDice, Modal, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';
import { sonido } from '../audio/voz';

type Pestana = 'piel' | 'cara' | 'pelo' | 'ropa' | 'zapatos' | 'accesorios' | 'fondo' | 'ropero';
const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: 'piel', texto: 'Piel' }, { id: 'pelo', texto: 'Pelo' }, { id: 'ropa', texto: 'Ropa' }, { id: 'zapatos', texto: 'Zapatos' },
  { id: 'accesorios', texto: 'Accesorios' }, { id: 'cara', texto: 'Cara' }, { id: 'fondo', texto: 'Fondo' }, { id: 'ropero', texto: 'Ropero' },
];
const CAPAS: Record<string, string[]> = {
  ropa: ['arriba', 'abajo', 'vestido'],
  zapatos: ['calzado'],
  accesorios: ['cabeza', 'cara', 'cuello', 'espalda', 'mano'],
  fondo: ['fondo', 'marco'],
};
const NOMBRE_CAPA: Record<string, string> = {
  pelo: 'Peinados',
  arriba: 'Remeras y buzos', abajo: 'Pantalones y polleras', vestido: 'Vestidos y trajes', calzado: 'Calzado', cabeza: 'Para la cabeza',
  cara: 'Anteojos', cuello: 'Collares y bufandas', espalda: 'En la espalda', mano: 'En la mano', fondo: 'Fondos', marco: 'Marcos', detalle: 'Detalles de la cara',
};
const OPCIONAL = new Set(['vestido', 'cabeza', 'cara', 'cuello', 'espalda', 'mano', 'detalle', 'marco']);

function Circulo({ color, sel, etiqueta, onClick }: { color: string; sel: boolean; etiqueta: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={etiqueta} aria-pressed={sel}
      style={{ width: 52, height: 52, borderRadius: '50%', background: color, border: `4px solid ${sel ? 'var(--violeta)' : 'var(--lavanda)'}`, boxShadow: sel ? '0 0 0 2px #fff inset' : undefined, flex: 'none' }} />
  );
}

export function AvatarEditor() {
  const j = useJugadora();
  const [a, setA] = useState<Avatar>(j?.avatar ?? avatarInicial());
  const [pestana, setPestana] = useState<Pestana>('piel');
  const [comprar, setComprar] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  if (!j) return null;
  const primeraVez = !j.avatar;
  const guia = j.guia ?? 'chispa';
  const tiene = (id: string) => j.items.includes(id);

  function elegir(id: string | undefined, capa: string) {
    if (id && !tiene(id)) {
      setComprar(id);
      return;
    }
    sonido('toque');
    setA((x) => equipar(x, id, capa));
  }

  async function confirmarCompra() {
    if (!comprar) return;
    const r = await comprarItem(comprar);
    if (r === 'ok') {
      sonido('festejo');
      setA((x) => equipar(x, comprar, ITEM[comprar].capa));
      setAviso(frase(guia, 'compra'));
    } else if (r === 'sin-monedas') setAviso(frase(guia, 'sinMonedas'));
    setComprar(null);
  }

  async function seguir() {
    await guardarAvatar(a);
    ir(primeraVez ? '/mascota/elegir' : '/mapa', true);
  }

  function Tarjeta({ id, capa }: { id: string; capa: string }) {
    const it = ITEM[id];
    const sel = (a as unknown as Record<string, string | undefined>)[capa] === id || (capa === 'colorPelo' && a.colorPelo === id);
    const bloqueado = !tiene(id);
    const premio = it.desbloqueo === 'premio';
    return (
      <button onClick={() => (premio && bloqueado ? setAviso('Este es un premio: se gana jugando.') : elegir(id, capa))} aria-pressed={sel}
        aria-label={`${it.nombre}${bloqueado ? (premio ? ', premio especial' : `, cuesta ${precioFinal(id)} monedas`) : ''}`}
        style={{ minHeight: 96, borderRadius: 18, border: `3px ${bloqueado ? 'dashed #9C8FC4' : 'solid'} ${sel ? 'var(--violeta)' : bloqueado ? '#9C8FC4' : 'var(--lavanda)'}`, background: sel ? 'var(--lavanda)' : bloqueado ? 'var(--coral-claro)' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4, gap: 2 }}>
        <ItemSVG id={id} size={54} piel={a.piel} pelo={ITEM[a.colorPelo]?.valor === 'arcoiris' ? '#9A7BF0' : ITEM[a.colorPelo]?.valor} />
        {bloqueado && (
          <span className="fila" style={{ gap: 3, fontSize: 16, fontWeight: 800 }}>
            <Icono nombre="candado" size={16} /> {premio ? 'Premio' : <>{precioFinal(id)}</>}
          </span>
        )}
      </button>
    );
  }

  function Grilla({ capa }: { capa: string }) {
    const lista = ITEMS.filter((i) => i.capa === capa && (i.desbloqueo !== 'premio' || tiene(i.id)));
    return (
      <div className="col" style={{ gap: 8 }}>
        <span className="etiqueta">{NOMBRE_CAPA[capa] ?? capa}</span>
        <div className="grilla-3 ancha" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))' }}>
          {OPCIONAL.has(capa) && (
            <button onClick={() => elegir(undefined, capa)} aria-pressed={!(a as unknown as Record<string, string | undefined>)[capa]}
              style={{ minHeight: 96, borderRadius: 18, border: `3px solid ${!(a as unknown as Record<string, string | undefined>)[capa] ? 'var(--violeta)' : 'var(--lavanda)'}`, background: '#fff', fontWeight: 800 }}>
              Nada
            </button>
          )}
          {lista.map((i) => <Tarjeta key={i.id} id={i.id} capa={capa} />)}
        </div>
      </div>
    );
  }

  return (
    <main className="pantalla angosta">
      <div className="fila entre">
        {!primeraVez ? <button className="boton-icono" onClick={() => ir('/mapa')} aria-label="Volver sin guardar"><Icono nombre="atras" /></button> : <span />}
        <PildoraMonedas n={j.monedas} />
      </div>
      <GuiaDice guia={guia} texto={aviso || frase(guia, 'avatar')} />
      <div className="centro" style={{ display: 'flex' }}>
        {/* Piel, pelo y cara se ven mejor de cerca; ropa, zapatos y fondo, de cuerpo entero. */}
        {['piel', 'pelo', 'cara'].includes(pestana) ? (
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: '#FFE3E6', border: '6px solid #fff', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <AvatarSVG avatar={a} size={200} modo="busto" titulo="Tu personaje" />
          </div>
        ) : (
          <div style={{ borderRadius: 28, background: '#FFE3E6', border: '6px solid #fff', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <AvatarSVG avatar={a} size={160} modo="cuerpo" titulo="Tu personaje" />
          </div>
        )}
      </div>
      <div className="chips" role="tablist" aria-label="Partes del personaje">
        {PESTANAS.map((p) => (
          <button key={p.id} role="tab" className="chip" aria-selected={pestana === p.id} onClick={() => setPestana(p.id)}>{p.texto}</button>
        ))}
      </div>
      <section className="tarjeta col" style={{ gap: 14 }}>
        {pestana === 'piel' && (
          <>
            <span className="etiqueta">Tono de piel</span>
            <div className="fila" style={{ flexWrap: 'wrap' }}>
              {OPCIONES_AVATAR.pieles.map((c, i) => <Circulo key={c} color={c} sel={a.piel === c} etiqueta={`Tono ${i + 1}`} onClick={() => setA({ ...a, piel: c })} />)}
            </div>
          </>
        )}
        {pestana === 'cara' && (
          <>
            <span className="etiqueta">Ojos</span>
            <div className="chips" style={{ flexWrap: 'wrap' }}>
              {OPCIONES_AVATAR.ojos.map((o) => <button key={o.id} className="chip" aria-pressed={a.ojos === o.id} onClick={() => setA({ ...a, ojos: o.id })}>{o.nombre}</button>)}
            </div>
            <span className="etiqueta">Color de ojos</span>
            <div className="fila" style={{ flexWrap: 'wrap' }}>
              {OPCIONES_AVATAR.coloresOjos.map((c, i) => <Circulo key={c} color={c} sel={a.colorOjos === c} etiqueta={`Color de ojos ${i + 1}`} onClick={() => setA({ ...a, colorOjos: c })} />)}
            </div>
            <span className="etiqueta">Expresión</span>
            <div className="chips" style={{ flexWrap: 'wrap' }}>
              {OPCIONES_AVATAR.expresiones.map((o) => <button key={o.id} className="chip" aria-pressed={a.expresion === o.id} onClick={() => setA({ ...a, expresion: o.id })}>{o.nombre}</button>)}
            </div>
            <Grilla capa="detalle" />
          </>
        )}
        {pestana === 'pelo' && (
          <>
            <Grilla capa="pelo" />
            <span className="etiqueta">Color de pelo</span>
            <div className="fila" style={{ flexWrap: 'wrap' }}>
              {ITEMS.filter((i) => i.capa === 'colorPelo').map((i) => {
                const bloq = !tiene(i.id);
                return (
                  <span key={i.id} style={{ position: 'relative' }}>
                    <Circulo color={i.valor === 'arcoiris' ? 'linear-gradient(#E8505B,#FFC93C,#3DBE7A,#7CC6F2,#9A7BF0)' : i.valor!} sel={a.colorPelo === i.id}
                      etiqueta={`${i.nombre}${bloq ? `, cuesta ${precioFinal(i.id)} monedas` : ''}`} onClick={() => elegir(i.id, 'colorPelo')} />
                    {bloq && <span style={{ position: 'absolute', right: -4, bottom: -4, background: '#fff', borderRadius: 999, padding: 2, display: 'flex' }}><Icono nombre="candado" size={16} /></span>}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {CAPAS[pestana]?.map((c) => <Grilla key={c} capa={c} />)}
        {pestana === 'ropero' && (
          <>
            <span className="etiqueta">Tu ropero: guardá hasta 5 looks</span>
            <div className="grilla-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
              {j.ropero.map((r, i) => (
                <div key={i} className="col centro" style={{ border: '3px solid var(--lavanda)', borderRadius: 18, padding: 8, gap: 6 }}>
                  {r ? <AvatarSVG avatar={r} size={64} modo="busto" /> : <span className="suave chico" style={{ height: 64, display: 'flex', alignItems: 'center' }}>Vacío</span>}
                  <div className="fila" style={{ gap: 4 }}>
                    {r && <button className="boton chico blanco" style={{ minHeight: 44, padding: '4px 8px', fontSize: 16 }} onClick={() => setA(r)}>Usar</button>}
                    <button className="boton chico" style={{ minHeight: 44, padding: '4px 8px', fontSize: 16 }} onClick={() => guardarEnRopero(i, a)}>Guardar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <div style={{ position: 'sticky', bottom: 'calc(12px + var(--seguro-abajo))' }}>
        <button className="boton ancho" onClick={seguir}>¡Me encanta! Seguir</button>
      </div>
      {comprar && (
        <Modal titulo="Comprar" alCerrar={() => setComprar(null)}>
          <div className="fila" style={{ gap: 16 }}>
            <div style={{ background: 'var(--fondo)', borderRadius: 18, padding: 8 }}><ItemSVG id={comprar} size={80} piel={a.piel} /></div>
            <div className="col" style={{ gap: 4 }}>
              <h3>{ITEM[comprar].nombre}</h3>
              <span className="fila" style={{ gap: 6 }}><Moneda size={22} /> {precioFinal(comprar)} monedas</span>
            </div>
          </div>
          {j.monedas >= precioFinal(comprar) ? (
            <button className="boton ancho" onClick={confirmarCompra}>Comprar</button>
          ) : (
            <p className="aviso-caja amarillo">Te faltan {precioFinal(comprar) - j.monedas} monedas. ¡Jugando las conseguís!</p>
          )}
          <button className="boton blanco ancho" onClick={() => setComprar(null)}>Ahora no</button>
        </Modal>
      )}
    </main>
  );
}

/** Guarda la guía elegida y vuelve (usado por la pantalla de ajustes). */
export async function cambiarGuia(g: 'chispa' | 'cande') {
  await actualizar((x) => ({ ...x, guia: g }));
}
