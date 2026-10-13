// Pantalla 12: tienda de ítems de avatar y mascotas, con ofertas semanales,
// premios de jefe bloqueados y alcancía para ahorrar hacia una meta.
import { ir } from '../ui/router';
import { useState } from 'react';
import { ItemSVG } from '../art/Avatar';
import { Icono, Moneda } from '../art/Iconos';
import { MascotaSVG } from '../art/Mascota';
import { Objeto } from '../art/Objetos';
import { config } from '../content';
import { frase, ITEM, ITEMS, MASCOTAS, precioDe } from '../content/catalogo';
import { useJugadora } from '../datos/estado';
import { comprarItem, comprarMascota, elegirMeta, faltaParaComprar, guardarEnAlcancia, ofertasDeLaSemana, precioFinal, tieneMascota } from '../datos/juego';
import { decir, sonido } from '../audio/voz';
import { MenuInferior, Modal, PildoraMonedas } from '../ui/comunes';

type Pestana = 'pelo' | 'ropa' | 'accesorios' | 'zapatos' | 'fondos' | 'mascotas' | 'alcancia';
const PESTANAS: { id: Pestana; texto: string; capas: string[] }[] = [
  { id: 'pelo', texto: 'Pelo', capas: ['pelo', 'colorPelo'] },
  { id: 'ropa', texto: 'Ropa', capas: ['arriba', 'abajo', 'vestido'] },
  { id: 'accesorios', texto: 'Accesorios', capas: ['cabeza', 'cara', 'cuello', 'espalda', 'mano', 'detalle'] },
  { id: 'zapatos', texto: 'Zapatos', capas: ['calzado'] },
  { id: 'fondos', texto: 'Fondos', capas: ['fondo', 'marco'] },
  { id: 'mascotas', texto: 'Mascotas', capas: ['mascota'] },
  { id: 'alcancia', texto: 'Alcancía', capas: [] },
];
const FONDOS = ['#FFE3E6', '#D7F5EE', '#E9E3FF', '#CDE9FF', '#FFF4D1'];

export function Tienda() {
  const j = useJugadora();
  const [pestana, setPestana] = useState<Pestana>('ropa');
  const [elegido, setElegido] = useState<{ tipo: 'item' | 'mascota'; id: string } | null>(null);
  const [mensaje, setMensaje] = useState('');
  if (!j) return null;
  const guia = j.guia ?? 'chispa';
  const ofertas = ofertasDeLaSemana();
  const capas = PESTANAS.find((p) => p.id === pestana)!.capas;
  // En la tienda se ven los ítems que se compran y los premios de jefe (bloqueados), no los gratis.
  const lista = ITEMS.filter((i) => capas.includes(i.capa) && i.desbloqueo !== 'gratis' && (i.desbloqueo === 'tienda' || i.id.startsWith('jefe-') || i.id === 'alas-cristal' || j.items.includes(i.id)))
    .filter((i) => !i.id.endsWith('-dorado') || j.items.includes(i.id))
    .slice(0, 80);

  async function comprar() {
    if (!elegido) return;
    const r = elegido.tipo === 'item' ? await comprarItem(elegido.id) : await comprarMascota(elegido.id);
    if (r === 'ok') {
      // La ventana queda abierta mostrando "¡Es tuyo!" (antes el aviso aparecía arriba de todo, fuera de la vista).
      sonido('festejo');
      setMensaje(frase(guia, 'compra'));
      decir(frase(guia, 'compra'));
      return;
    }
    if (r === 'sin-monedas') {
      setMensaje(frase(guia, 'sinMonedas'));
      decir(frase(guia, 'sinMonedas'));
    }
    setElegido(null);
  }

  function Tarjeta({ id, i }: { id: string; i: number }) {
    const it = ITEM[id];
    const tiene = j!.items.includes(id);
    const premio = it.desbloqueo === 'premio';
    const oferta = ofertas.includes(id);
    return (
      <button className="tarjeta col centro" style={{ gap: 6, padding: 10, border: 0, position: 'relative' }} onClick={() => !tiene && !premio && setElegido({ tipo: 'item', id })}
        aria-label={`${it.nombre}${tiene ? ', ya lo tenés' : premio ? ', premio de un gran desafío, no se compra' : `, ${precioFinal(id)} monedas`}`}>
        {oferta && !tiene && <span className="pildora chica" style={{ position: 'absolute', top: 6, right: 6, background: 'var(--amarillo)' }}>Oferta</span>}
        <span style={{ background: FONDOS[i % FONDOS.length], borderRadius: 16, width: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
          {it.capa === 'mascota' && j!.mascota ? <MascotaSVG especie={j!.mascota.especie} etapa="bebe" animo="contenta" size={72} accesorios={[id]} /> : <ItemSVG id={id} size={72} piel={j!.avatar?.piel} />}
        </span>
        <span style={{ fontWeight: 800, lineHeight: 1.2 }}>{it.nombre}</span>
        {tiene ? (
          <span style={{ color: 'var(--turquesa-oscuro)', fontWeight: 800 }}>Ya lo tenés</span>
        ) : premio ? (
          <span className="fila suave chico" style={{ gap: 4 }}><Icono nombre="candado" size={18} /> Premio de desafío</span>
        ) : (
          <span className="fila" style={{ gap: 4, fontWeight: 800 }}>
            <Moneda size={22} /> {oferta && <s className="suave chico">{precioDe(it)}</s>} {precioFinal(id)}
          </span>
        )}
      </button>
    );
  }

  return (
    <main className="pantalla con-menu" style={{ gap: 14 }}>
      <div className="fila entre">
        <h1>Tienda</h1>
        <PildoraMonedas n={j.monedas} />
      </div>
      <button className="fila entre" style={{ background: 'linear-gradient(90deg, var(--violeta), #7A5BD9)', color: '#fff', borderRadius: 22, padding: '14px 16px', border: 0, textAlign: 'left' }} onClick={() => setElegido({ tipo: 'item', id: ofertas.find((o) => !j.items.includes(o)) ?? ofertas[0] })}>
        <span className="col" style={{ gap: 0 }}>
          <span className="titulo" style={{ fontSize: 22 }}>Ofertas de la semana</span>
          <span style={{ fontSize: 16 }}>{ofertas.length} ítems · cambian el lunes</span>
        </span>
        <span className="pildora" style={{ background: 'var(--amarillo)', color: 'var(--tinta)' }}>−{Math.round(config.economia.tienda.descuentoOferta * 100)}%</span>
      </button>
      <div className="fila" style={{ gap: 8, overflowX: 'auto' }}>
        {ofertas.map((o, i) => (
          <button key={o} className="tarjeta col centro" style={{ minWidth: 92, padding: 6, border: 0, gap: 2 }} onClick={() => !j.items.includes(o) && setElegido({ tipo: 'item', id: o })} aria-label={`Oferta: ${ITEM[o].nombre}`}>
            <span style={{ background: FONDOS[i], borderRadius: 12, padding: 4 }}><ItemSVG id={o} size={48} piel={j.avatar?.piel} /></span>
            <span className="fila chico" style={{ gap: 2, fontWeight: 800 }}>{j.items.includes(o) ? 'Ya lo tenés' : <><Moneda size={16} />{precioFinal(o)}</>}</span>
          </button>
        ))}
      </div>
      {mensaje && <p className="aviso-caja lila" role="status">{mensaje}</p>}
      <div className="chips" role="tablist">
        {PESTANAS.map((p) => <button key={p.id} role="tab" className="chip" aria-selected={pestana === p.id} onClick={() => setPestana(p.id)}>{p.texto}</button>)}
      </div>
      {pestana === 'mascotas' && (
        <>
          <h3>Nuevas mascotas</h3>
          <div className="grilla-2 ancha">
            {MASCOTAS.filter((m) => m.precio > 0).map((m) => {
              const tiene = tieneMascota(j, m.id);
              return (
                <button key={m.id} className="tarjeta col centro" style={{ border: 0, gap: 4, padding: 10 }} onClick={() => !tiene && setElegido({ tipo: 'mascota', id: m.id })}>
                  <MascotaSVG especie={m.id} etapa="bebe" animo="contenta" size={84} />
                  <span style={{ fontWeight: 800 }}>{m.nombre}</span>
                  {tiene ? <span style={{ color: 'var(--turquesa-oscuro)', fontWeight: 800 }}>Ya la tenés</span> : <span className="fila" style={{ gap: 4, fontWeight: 800 }}><Moneda size={22} /> {m.precio}</span>}
                </button>
              );
            })}
          </div>
          <h3>Para vestir a tu mascota</h3>
        </>
      )}
      {pestana === 'alcancia' ? (
        <Alcancia />
      ) : (
        <div className="grilla-2 ancha">{lista.map((it, i) => <Tarjeta key={it.id} id={it.id} i={i} />)}</div>
      )}
      {elegido && (
        <Modal titulo="Comprar" alCerrar={() => setElegido(null)}>
          {elegido.tipo === 'item' ? (
            <>
              <div className="centro col"><div style={{ background: 'var(--fondo)', borderRadius: 18, padding: 8 }}><ItemSVG id={elegido.id} size={110} piel={j.avatar?.piel} /></div></div>
              <h2 style={{ textAlign: 'center' }}>{ITEM[elegido.id].nombre}</h2>
            </>
          ) : (
            <div className="centro col"><MascotaSVG especie={elegido.id} etapa="bebe" animo="contenta" size={110} /><h2>{MASCOTAS.find((m) => m.id === elegido.id)!.nombre}</h2></div>
          )}
          {(() => {
            // Si es la meta de la alcancía, lo ahorrado cuenta para pagar.
            const precio = elegido.tipo === 'item' ? faltaParaComprar(j, elegido.id) : MASCOTAS.find((m) => m.id === elegido.id)!.precio;
            const usaAlcancia = elegido.tipo === 'item' && j.alcancia?.itemId === elegido.id && j.alcancia.guardado > 0;
            // Recién comprado (o ya lo tenía): el festejo y el atajo quedan a la vista, en la misma ventana.
            if (elegido.tipo === 'item' && j.items.includes(elegido.id))
              return (
                <>
                  <p className="aviso-caja verde">¡Es tuyo! Ponételo en tu personaje.</p>
                  <button className="boton ancho" onClick={() => ir('/avatar')}>¡Ponérmelo ahora!</button>
                </>
              );
            if (elegido.tipo === 'mascota' && j.mascotasCompradas.includes(elegido.id))
              return (
                <>
                  <p className="aviso-caja verde">¡Ya es tuya! La podés elegir cuando quieras.</p>
                  <button className="boton ancho" onClick={() => ir('/mascota')}>Ir a mi mascota</button>
                </>
              );
            const ahorrar = elegido.tipo === 'item' && j.alcancia?.itemId !== elegido.id && (
              <button className="boton borde ancho" onClick={() => { elegirMeta(elegido.id); setElegido(null); setPestana('alcancia'); }}><Icono nombre="alcancia" /> Ahorrar para esto</button>
            );
            return j.monedas >= precio ? (
              <>
                <button className="boton ancho" onClick={comprar}><Moneda size={26} /> Comprar por {precio}</button>
                {usaAlcancia && <p className="suave centro">Usás también las {j.alcancia!.guardado} monedas de tu alcancía.</p>}
                {ahorrar}
              </>
            ) : (
              <>
                <p className="aviso-caja amarillo">Te faltan {precio - j.monedas} monedas. ¡Jugando las conseguís!</p>
                {ahorrar}
              </>
            );
          })()}
          <button className="boton blanco ancho" onClick={() => setElegido(null)}>Ahora no</button>
        </Modal>
      )}
      <MenuInferior actual="tienda" />
    </main>
  );
}

/** Alcancía: elegir una meta y guardar monedas hasta llegar (con un bono al final). */
function Alcancia() {
  const j = useJugadora()!;
  const [msg, setMsg] = useState('');
  const a = j.alcancia;
  const bono = Math.round(config.economia.alcancia.bonoAlLlegar * 100);
  if (!a) {
    return (
      <div className="tarjeta col centro" style={{ gap: 10, textAlign: 'center' }}>
        <Objeto id="alcancia" size={96} />
        <h2>Tu alcancía</h2>
        <p className="suave">Elegí algo de la tienda que te guste y tocá “Ahorrar para esto”. Guardá monedas de a poco y, al llegar, ¡te regalamos un {bono} % extra!</p>
      </div>
    );
  }
  if (!ITEM[a.itemId]) return null;
  const precio = precioFinal(a.itemId);
  const pct = Math.min(100, (a.guardado / precio) * 100);
  async function poner(n: number) {
    const r = await guardarEnAlcancia(n);
    if (r === 'meta') {
      sonido('festejo');
      setMsg(`¡Llegaste a la meta! Ya tenés: ${ITEM[a!.itemId].nombre}. ¡Y te ganaste un bono de monedas!`);
    } else if (r === 'ok') {
      sonido('acierto');
      setMsg('¡Guardado! Cada monedita te acerca a tu meta.');
    } else setMsg('No tenés monedas para guardar ahora. ¡Jugando conseguís más!');
  }
  return (
    <div className="tarjeta col" style={{ gap: 12 }}>
      <div className="fila" style={{ gap: 14 }}>
        <Objeto id="alcancia" size={84} />
        <div className="col" style={{ gap: 4, flex: 1 }}>
          <span className="suave chico">Tu meta</span>
          <span className="fila" style={{ gap: 8 }}><ItemSVG id={a.itemId} size={44} /><h3>{ITEM[a.itemId].nombre}</h3></span>
        </div>
      </div>
      <div className="barra" style={{ height: 20 }} role="progressbar" aria-valuenow={a.guardado} aria-valuemin={0} aria-valuemax={precio} aria-label="Ahorro">
        <span style={{ width: `${pct}%`, background: 'var(--coral)' }} />
      </div>
      <p style={{ fontWeight: 800 }}>Guardaste {a.guardado} de {precio} monedas. Te faltan {Math.max(0, precio - a.guardado)}.</p>
      <div className="fila" style={{ gap: 8 }}>
        {[5, 10, 20].map((n) => <button key={n} className="boton chico" style={{ flex: 1 }} onClick={() => poner(n)}>+{n}</button>)}
      </div>
      {msg && <p className="aviso-caja lila" role="status">{msg}</p>}
      <button className="boton-link" onClick={() => elegirMeta(undefined)}>Cambiar de meta (te devuelvo lo guardado)</button>
    </div>
  );
}
