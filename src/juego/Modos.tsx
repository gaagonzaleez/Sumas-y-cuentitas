// Formas de responder: opciones, teclado, bloques, ordenar, dinero, memoria y arrastrar.
import { type PointerEvent, useMemo, useRef, useState } from 'react';
import { Icono } from '../art/Iconos';
import { Objeto } from '../art/Objetos';
import { Plata } from '../art/Plata';
import { sonido } from '../audio/voz';
import type { Ejercicio } from '../engine/tipos';
import { mismasLetras } from '../engine/letras';
import { Bloques } from './Visuales';

type Responder = (valor: string) => void;

export interface EstadoOpcion {
  /** Opciones ya probadas (incorrectas) en este ejercicio. */
  descartadas: string[];
  correcta?: string;
}

export function Opciones({ ej, responder, estado }: { ej: Ejercicio; responder: Responder; estado: EstadoOpcion }) {
  const ops = ej.opciones ?? [];
  const largas = ops.some((o) => (o.texto ?? o.valor).length > 14);
  // Cartón de lotería: 9 números en una grilla de 3.
  const carton = ops.length > 6 && !largas;
  // Cuentas o textos medianos ("3 + 13 + 13", "Manzana: $11"): letra un poco más chica, sin cortarse.
  const medianas = !largas && ops.some((o) => (o.texto ?? o.valor).length > 7);
  return (
    <div className={largas ? 'col' : carton ? 'grilla-3 carton' : 'grilla-2'} style={{ gap: carton ? 8 : 12 }}>
      {ops.map((o) => {
        const ok = estado.correcta === o.valor;
        const mal = estado.descartadas.includes(o.valor);
        const dibujo = o.dibujo?.startsWith('plata-') ? <Plata valor={Number(o.dibujo.slice(6))} size={0.9} /> : o.dibujo ? <Objeto id={o.dibujo} size={44} /> : null;
        return (
          <button key={o.valor} onClick={() => responder(o.valor)} disabled={!!estado.correcta || mal}
            aria-label={`${o.texto ?? o.valor}${ok ? ', correcta' : mal ? ', ya probaste esta' : ''}`}
            style={{
              minHeight: carton ? 64 : 72, borderRadius: 20, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: largas ? 'flex-start' : 'center', gap: 10,
              border: `4px solid ${ok ? 'var(--turquesa-oscuro)' : mal ? '#E9B8BC' : 'var(--lavanda)'}`,
              background: ok ? 'var(--turquesa-claro)' : mal ? '#FBF3F4' : '#fff',
              color: ok ? 'var(--turquesa-oscuro)' : mal ? '#8C7F9E' : 'var(--tinta)',
              fontFamily: largas ? 'var(--fuente-texto)' : 'var(--fuente-titulo)', fontWeight: largas ? 800 : 600, fontSize: largas ? 19 : carton ? 28 : medianas ? 22 : 32, textAlign: largas ? 'left' : 'center', whiteSpace: largas ? 'normal' : 'nowrap',
              textDecoration: mal ? 'line-through' : undefined,
            }}>
            {dibujo}
            {(!dibujo || !o.dibujo?.startsWith('plata-')) && <span>{o.texto ?? o.valor}</span>}
            {ok && <Icono nombre="tilde" size={26} grosor={3} />}
          </button>
        );
      })}
    </div>
  );
}

export function Teclado({ responder, bloqueado }: { responder: Responder; bloqueado: boolean }) {
  const [v, setV] = useState('');
  const tecla = (t: string) => {
    sonido('toque');
    setV((x) => (x.length >= 5 ? x : (x + t).replace(/^0+(?=\d)/, '')));
  };
  return (
    <div className="col" style={{ gap: 10, maxWidth: 380, width: '100%', alignSelf: 'center' }}>
      <output aria-live="polite" aria-label="Tu respuesta" style={{ minHeight: 72, borderRadius: 20, border: '4px solid var(--violeta)', background: '#fff', fontFamily: 'var(--fuente-titulo)', fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {v || <span style={{ color: '#B3A9D6' }}>?</span>}
      </output>
      <div className="grilla-3" style={{ gap: 8 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((t) => (
          <button key={t} className="boton blanco" style={{ fontSize: 30 }} onClick={() => tecla(t)} disabled={bloqueado}>{t}</button>
        ))}
        <button className="boton blanco" onClick={() => setV((x) => x.slice(0, -1))} aria-label="Borrar" disabled={bloqueado}><Icono nombre="borrar" size={30} /></button>
        <button className="boton blanco" style={{ fontSize: 30 }} onClick={() => tecla('0')} disabled={bloqueado}>0</button>
        <button className="boton" onClick={() => { if (v) { responder(v); setV(''); } }} disabled={!v || bloqueado} aria-label="Listo"><Icono nombre="tilde" size={32} grosor={3} /></button>
      </div>
    </div>
  );
}

export function ArmarBloques({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const [c, setC] = useState(0);
  const [d, setD] = useState(0);
  const [u, setU] = useState(0);
  const valor = c * 100 + d * 10 + u;
  const conCentenas = (ej.datos?.bloques?.numero ?? 0) >= 100;
  const Contador = ({ nombre, n, set, color }: { nombre: string; n: number; set: (f: (x: number) => number) => void; color: string }) => (
    <div className="col centro" style={{ gap: 4, background: '#fff', borderRadius: 18, padding: 6, flex: 1, minWidth: 0 }}>
      <span className="recorte" style={{ fontWeight: 800, color, maxWidth: '100%' }}>{nombre}</span>
      <span className="titulo" style={{ fontSize: 32 }}>{n}</span>
      <div className="fila" style={{ gap: 4 }}>
        <button className="boton-icono" style={{ background: 'var(--lavanda)', fontSize: 26, fontWeight: 800 }} aria-label={`Sacar ${nombre}`} onClick={() => set((x) => Math.max(0, x - 1))} disabled={bloqueado}>−</button>
        <button className="boton-icono violeta" style={{ fontSize: 26, fontWeight: 800 }} aria-label={`Agregar ${nombre}`} onClick={() => { sonido('toque'); set((x) => Math.min(9, x + 1)); }} disabled={bloqueado}>+</button>
      </div>
    </div>
  );
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="tarjeta centro" style={{ minHeight: 90, display: 'flex' }}>{valor > 0 ? <Bloques numero={valor} /> : <span className="suave">Agregá bloques</span>}</div>
      <div className="fila" style={{ gap: 8 }}>
        {conCentenas && <Contador nombre="Centenas" n={c} set={setC} color="#7A5BD9" />}
        <Contador nombre="Decenas" n={d} set={setD} color="var(--turquesa-oscuro)" />
        <Contador nombre="Unidades" n={u} set={setU} color="var(--naranja-texto)" />
      </div>
      <button className="boton ancho" disabled={valor === 0 || bloqueado} onClick={() => responder(String(valor))}>Listo: {valor}</button>
    </div>
  );
}

export function Ordenar({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const nums = ej.datos?.ordenar ?? [];
  const [orden, setOrden] = useState<number[]>([]);
  const tocar = (n: number) => {
    sonido('toque');
    const nuevo = [...orden, n];
    setOrden(nuevo);
    if (nuevo.length === nums.length) {
      responder(nuevo.join(','));
      setTimeout(() => setOrden([]), 600);
    }
  };
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="fila" style={{ justifyContent: 'center', gap: 8 }} aria-label="Tu orden">
        {nums.map((_, i) => (
          <span key={i} style={{ width: 70, height: 64, borderRadius: 16, border: orden[i] !== undefined ? '3px solid var(--violeta)' : '3px dashed #9C8FC4', background: orden[i] !== undefined ? 'var(--lavanda)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fuente-titulo)', fontSize: 26 }}>
            {orden[i] ?? ''}
          </span>
        ))}
      </div>
      <div className="fila" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        {nums.map((n) => (
          <button key={n} className="boton blanco" style={{ fontSize: 28, minWidth: 80 }} disabled={orden.includes(n) || bloqueado} onClick={() => tocar(n)}>{n}</button>
        ))}
      </div>
      <button className="boton-link" onClick={() => setOrden([])}>Empezar de nuevo</button>
    </div>
  );
}

export function Dinero({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const d = ej.datos!.dinero!;
  const [pago, setPago] = useState<number[]>([]);
  const total = pago.reduce((a, b) => a + b, 0);
  const falta = d.precio - total;
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="tarjeta fila" style={{ gap: 16 }}>
        <Objeto id={d.objeto} size={84} />
        <div className="col" style={{ gap: 2, flex: 1 }}>
          <span className="suave chico">Precio</span>
          <span className="titulo" style={{ fontSize: 40 }}>${d.precio.toLocaleString('es-AR')}</span>
          <div style={{ height: 2, background: 'var(--lavanda)' }} />
          <span className="suave chico">Tu pago</span>
          <span className="titulo" style={{ fontSize: 34, color: 'var(--violeta)' }}>${total.toLocaleString('es-AR')}</span>
          {total > 0 && (
            <span style={{ fontWeight: 800, color: falta > 0 ? 'var(--coral-oscuro)' : falta < 0 ? 'var(--naranja-texto)' : 'var(--turquesa-oscuro)' }}>
              {falta > 0 ? `Te faltan $${falta}` : falta < 0 ? `Te pasaste $${-falta}` : '¡Justo!'}
            </span>
          )}
        </div>
      </div>
      <div style={{ minHeight: 84, border: '3px dashed #9C8FC4', borderRadius: 22, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }} aria-label="Tu pago">
        {pago.length === 0 && <span className="suave chico">Tocá billetes y monedas para pagar</span>}
        {pago.map((v, i) => (
          <button key={i} style={{ background: 'none', border: 0, padding: 0, minWidth: 48, minHeight: 48 }} onClick={() => setPago(pago.filter((_, k) => k !== i))} aria-label={`Sacar $${v}`} disabled={bloqueado}><Plata valor={v} size={0.9} /></button>
        ))}
      </div>
      <span className="etiqueta">Tu billetera · tocá para pagar</span>
      <div className="tarjeta fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {d.billetera.map((v) => (
          <button key={v} style={{ background: 'none', border: 0, padding: 2, minWidth: 48, minHeight: 48 }} onClick={() => { sonido('toque'); setPago([...pago, v]); }} aria-label={`Agregar $${v}`} disabled={bloqueado}>
            <Plata valor={v} size={1} />
          </button>
        ))}
      </div>
      <div className="fila" style={{ gap: 10 }}>
        <button className="boton blanco" style={{ flex: 1 }} onClick={() => setPago([])} disabled={bloqueado}>Borrar</button>
        <button className="boton" style={{ flex: 1.4 }} disabled={total === 0 || bloqueado} onClick={() => responder(String(total))}>Pagar</button>
      </div>
    </div>
  );
}

export function Memoria({ ej, responder, alError, bloqueado }: { ej: Ejercicio; responder: Responder; alError: () => void; bloqueado: boolean }) {
  const pares = ej.datos?.memoria ?? [];
  const resultados = useMemo(() => [...pares.map((p) => p.resultado)].sort(() => 0.5 - Math.random()), [ej.uid]); // eslint-disable-line react-hooks/exhaustive-deps
  const [elegida, setElegida] = useState<string | null>(null);
  const [hechas, setHechas] = useState<string[]>([]);
  const [mal, setMal] = useState<string | null>(null);
  function tocarResultado(r: string) {
    if (!elegida) return;
    const par = pares.find((p) => p.cuenta === elegida)!;
    if (par.resultado === r) {
      sonido('acierto');
      const nuevas = [...hechas, elegida];
      setHechas(nuevas);
      setElegida(null);
      if (nuevas.length === pares.length) responder('ok');
    } else {
      setMal(r);
      setTimeout(() => setMal(null), 600);
      setElegida(null);
      alError();
    }
  }
  const estilo = (activo: boolean, hecho: boolean, error: boolean) => ({
    minHeight: 64, borderRadius: 18, fontFamily: 'var(--fuente-titulo)', fontSize: 26,
    border: `4px solid ${hecho ? 'var(--turquesa-oscuro)' : error ? 'var(--coral)' : activo ? 'var(--violeta)' : 'var(--lavanda)'}`,
    background: hecho ? 'var(--turquesa-claro)' : activo ? 'var(--lavanda)' : '#fff',
    color: hecho ? 'var(--turquesa-oscuro)' : 'var(--tinta)',
  });
  return (
    <div className="grilla-2" style={{ gap: 10 }}>
      <div className="col" style={{ gap: 10 }}>
        {pares.map((p) => (
          <button key={p.cuenta} style={estilo(elegida === p.cuenta, hechas.includes(p.cuenta), false)} disabled={hechas.includes(p.cuenta) || bloqueado} onClick={() => { sonido('toque'); setElegida(p.cuenta); }} aria-pressed={elegida === p.cuenta}>
            {p.cuenta}
          </button>
        ))}
      </div>
      <div className="col" style={{ gap: 10 }}>
        {resultados.map((r) => {
          const hecho = pares.some((p) => p.resultado === r && hechas.includes(p.cuenta));
          return (
            <button key={r} style={estilo(false, hecho, mal === r)} disabled={hecho || !elegida || bloqueado} onClick={() => tocarResultado(r)}>
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ArmarGrupos({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const a = ej.datos!.arrastrar!;
  const total = a.grupos * a.porGrupo;
  const [canastas, setCanastas] = useState<number[]>(Array(a.grupos).fill(0));
  const usados = canastas.reduce((x, y) => x + y, 0);
  const libres = Math.max(0, total - usados);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [arrastre, setArrastre] = useState<{ x: number; y: number } | null>(null);

  const poner = (i: number) => {
    if (libres <= 0) return;
    sonido('toque');
    setCanastas((c) => c.map((v, k) => (k === i ? v + 1 : v)));
  };
  const sacar = (i: number) => setCanastas((c) => c.map((v, k) => (k === i && v > 0 ? v - 1 : v)));

  function soltar(e: PointerEvent) {
    setArrastre(null);
    const i = refs.current.findIndex((r) => {
      if (!r) return false;
      const b = r.getBoundingClientRect();
      return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    });
    if (i >= 0) poner(i);
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="fila" style={{ gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {canastas.map((n, i) => (
          <div key={i} ref={(el) => { refs.current[i] = el; }} className="col centro" style={{ background: '#FFF4D1', borderRadius: 20, padding: 6, minWidth: 92, border: '3px solid #E7B36A', gap: 4 }}>
            {/* Toda la canasta se puede tocar para poner uno adentro. */}
            <button onClick={() => poner(i)} disabled={bloqueado} aria-label={`Poner en la canasta ${i + 1}. Tiene ${n}`} className="col centro" style={{ background: 'none', border: 0, gap: 4, minWidth: 88, minHeight: 130, padding: 0 }}>
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 86, minHeight: 50, alignContent: 'flex-end' }}>
                {Array.from({ length: n }, (_, k) => <Objeto key={k} id={a.objeto} size={22} />)}
              </span>
              <Objeto id="canasta" size={40} />
              <span style={{ fontWeight: 800 }}>{n}</span>
            </button>
            <button className="boton-icono" style={{ background: 'var(--lavanda)', fontSize: 24, fontWeight: 800, visibility: n > 0 ? 'visible' : 'hidden' }} onClick={() => sacar(i)} disabled={bloqueado || n === 0} aria-label={`Sacar uno de la canasta ${i + 1}`}>−</button>
          </div>
        ))}
      </div>
      <div className="tarjeta col centro" style={{ gap: 6 }}>
        <span className="suave chico">Arrastrá cada uno a una canasta (o tocá la canasta)</span>
        <div className="fila" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 6, touchAction: 'none' }}>
          {Array.from({ length: libres }, (_, k) => (
            <span key={k} role="presentation" style={{ cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); setArrastre({ x: e.clientX, y: e.clientY }); }}
              onPointerMove={(e) => arrastre && setArrastre({ x: e.clientX, y: e.clientY })}
              onPointerUp={soltar}>
              <Objeto id={a.objeto} size={34} />
            </span>
          ))}
        </div>
      </div>
      {arrastre && (
        <div style={{ position: 'fixed', left: arrastre.x - 20, top: arrastre.y - 20, pointerEvents: 'none', zIndex: 40 }}><Objeto id={a.objeto} size={40} /></div>
      )}
      <button className="boton ancho" disabled={usados === 0 || bloqueado} onClick={() => responder(canastas.join(','))}>Listo</button>
    </div>
  );
}

/** Escribir el número con letras usando el teclado del celular (sin autocorrector). */
export function EscribirLetras({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const [v, setV] = useState('');
  function enviar() {
    const t = v.trim();
    if (!t) return;
    // Mayúsculas, tildes y espacios de más no cuentan como error.
    responder(mismasLetras(t, ej.respuesta) ? ej.respuesta : t);
    setV('');
  }
  return (
    <form className="col" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); enviar(); }}>
      <label htmlFor="letras" className="sr-only">Escribí el número con letras</label>
      <input
        id="letras"
        value={v}
        onChange={(e) => setV(e.target.value)}
        disabled={bloqueado}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="done"
        placeholder="Escribilo acá"
        style={{ minHeight: 72, borderRadius: 20, border: '4px solid var(--violeta)', background: '#fff', fontFamily: 'var(--fuente-titulo)', fontSize: 30, textAlign: 'center', padding: '0 14px', width: '100%' }}
      />
      <button className="boton ancho" disabled={!v.trim() || bloqueado}>Listo</button>
    </form>
  );
}

/** Tocar varias cosas: cartas que suman justo un número, compras que entran en la plata, necesidades. */
export function Elegir({ ej, responder, bloqueado }: { ej: Ejercicio; responder: Responder; bloqueado: boolean }) {
  const e = ej.datos!.elegir!;
  const [sel, setSel] = useState<string[]>([]);
  const suma = e.items.filter((i) => sel.includes(i.id)).reduce((a, i) => a + i.valor, 0);
  const mostrarSuma = e.regla !== 'conjunto';
  function tocar(id: string) {
    sonido('toque');
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function listo() {
    let r = 'ok';
    if (e.regla === 'suma') r = suma === e.objetivo ? 'ok' : suma > (e.objetivo ?? 0) ? 'se-pasa' : 'falta';
    else if (e.regla === 'presupuesto') r = suma > (e.objetivo ?? 0) ? 'se-pasa' : sel.length < (e.cantidad ?? 1) ? 'falta' : 'ok';
    else {
      const bien = new Set(e.correctas ?? []);
      r = sel.length === bien.size && sel.every((x) => bien.has(x)) ? 'ok' : 'mal';
    }
    responder(r);
    if (r !== 'ok') setSel([]);
  }
  const estiloCarta = (on: boolean) => ({
    minHeight: e.estilo === 'productos' ? 96 : 84, borderRadius: e.estilo === 'cartas' ? 14 : 20, padding: '8px 6px',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 4,
    border: `4px solid ${on ? 'var(--violeta)' : 'var(--lavanda)'}`,
    background: on ? 'var(--lavanda)' : '#fff', color: 'var(--tinta)',
    transform: on ? 'translateY(-4px)' : undefined, boxShadow: on ? '0 6px 0 #C9BEF0' : '0 3px 0 #E4DDF7',
    fontFamily: e.estilo === 'cartas' ? 'var(--fuente-titulo)' : 'var(--fuente-texto)', fontWeight: e.estilo === 'cartas' ? 600 : 800,
    fontSize: e.estilo === 'cartas' ? 30 : 17,
  });
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className={e.items.length > 4 ? 'grilla-3' : 'grilla-2'} style={{ gap: 8 }}>
        {e.items.map((i) => {
          const on = sel.includes(i.id);
          return (
            <button key={i.id} onClick={() => tocar(i.id)} disabled={bloqueado} aria-pressed={on} aria-label={`${i.texto}${on ? ', elegida' : ''}`} style={estiloCarta(on)}>
              {i.dibujo?.startsWith('plata-') ? <Plata valor={Number(i.dibujo.slice(6))} size={0.8} /> : i.dibujo ? <Objeto id={i.dibujo} size={40} /> : null}
              {!i.dibujo?.startsWith('plata-') && <span>{i.texto}</span>}
              {on && <Icono nombre="tilde" size={20} grosor={3} />}
            </button>
          );
        })}
      </div>
      {mostrarSuma && (
        <p className="centro" aria-live="polite" style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>
          {e.estilo === 'cartas' ? 'Llevás' : 'Sumás'}: {e.estilo === 'cartas' ? suma : `$${suma}`}
          {e.regla === 'presupuesto' && ` de $${e.objetivo} · ${sel.length} de ${e.cantidad} cosas`}
        </p>
      )}
      <button className="boton ancho" disabled={!sel.length || bloqueado} onClick={listo}>Listo</button>
    </div>
  );
}
