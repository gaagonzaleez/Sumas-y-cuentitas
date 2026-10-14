// Pantalla 7: cuidar a la mascota. Darle de comer (se ve cómo se come la comida), jugar a la
// pelota, bañarla con la esponja, hacerle mimos y vestirla. La barra de crecimiento 0–300 sube y baja.
import { type PointerEvent as PE, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icono, Moneda, type NombreIcono } from '../art/Iconos';
import { bocaDe, MascotaSVG, VISTA, type Boca } from '../art/Mascota';
import { Objeto, ObjetoMordido } from '../art/Objetos';
import { config } from '../content';
import { frase, fraseMascota, ITEMS, mascotaPorId } from '../content/catalogo';
import { animoDe, avisoBarra, enRegresoFeliz, etapaDe, necesidadDe, panzaLlena } from '../engine/mascota';
import { diaArgentina } from '../engine/semana';
import { useEstado, useJugadora } from '../datos/estado';
import { alimentarMascota, banarMascota, comprarItem, jugarConMascota, mimarMascota, precioFinal, vestirMascota } from '../datos/juego';
import { sonido } from '../audio/voz';
import { MenuInferior, Modal, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';

type Modo = 'casa' | 'comer' | 'pelota' | 'banio';
type Reaccion = '' | 'saltito' | 'giro' | 'no-no';
interface Flotante { id: number; x: number; y: number; tipo: 'corazon' | 'miga' | 'brillo' | 'burbuja' | 'gota' | 'nota'; dx?: number; }

const TAM = 190;
let siguienteId = 1;
const azar = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)];

export function MiMascota() {
  const j = useJugadora();
  const e = useEstado();
  const [modo, setModo] = useState<Modo>('casa');
  const [mensaje, setMensaje] = useState('');
  const [reaccion, setReaccion] = useState<Reaccion>('');
  const [boca, setBoca] = useState<Boca | undefined>();
  const [flotantes, setFlotantes] = useState<Flotante[]>([]);
  const [comiendo, setComiendo] = useState<{ id: string; mordidas: number; desde?: { x: number; y: number } } | null>(null);
  const [arrastre, setArrastre] = useState<{ id: string; x: number; y: number } | null>(null);
  const [vestir, setVestir] = useState(false);
  const [atrapadas, setAtrapadas] = useState(0);
  const [burbujas, setBurbujas] = useState(0);
  const [enjuagando, setEnjuagando] = useState(false);
  const ocupada = useRef(false);
  const escena = useRef<HTMLElement>(null);
  const mascotaRef = useRef<HTMLDivElement>(null);
  const comidaRef = useRef<HTMLDivElement>(null);
  const pelotaRef = useRef<HTMLDivElement>(null);
  const pos = useRef(0.5);
  const timers = useRef<number[]>([]);
  const tocarComida = useRef<{ id: string; x: number; y: number; movio: boolean } | null>(null);
  const ultimaBurbuja = useRef<{ x: number; y: number } | null>(null);
  const cuentaBurbujas = useRef(0);

  const despues = (ms: number, f: () => void) => {
    timers.current.push(window.setTimeout(f, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Pelota: la mascota va y viene; hay que tirar cuando está en el medio.
  useEffect(() => {
    if (modo !== 'pelota') {
      pos.current = 0.5;
      if (mascotaRef.current) mascotaRef.current.style.transform = '';
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const paso = (t: number) => {
      const vel = 1.3 + atrapadas * 0.25;
      if (!ocupada.current) {
        pos.current = 0.5 + 0.5 * Math.sin(((t - t0) / 1000) * vel);
        const ancho = (escena.current?.clientWidth ?? 320) - TAM - 32;
        if (mascotaRef.current) mascotaRef.current.style.transform = `translateX(${(pos.current - 0.5) * ancho}px)`;
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [modo, atrapadas]);

  // La comida vuela desde la bandeja hasta la boca.
  useLayoutEffect(() => {
    const el = comidaRef.current;
    if (!el || !comiendo?.desde || comiendo.mordidas !== 0) return;
    const r = el.getBoundingClientRect();
    const dx = comiendo.desde.x - (r.left + r.width / 2);
    const dy = comiendo.desde.y - (r.top + r.height / 2);
    el.animate?.([{ transform: `translate(${dx}px, ${dy}px) scale(1.3)` }, { transform: 'translate(0, 0) scale(1)' }], { duration: 550, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }, [comiendo]);

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
  const necesidad = necesidadDe(m);
  const limpieza = m.limpieza ?? 100;
  const saludo =
    mensaje ||
    (animo === 'extranando'
      ? fraseMascota('extrana', j.apodo)
      : necesidad
        ? fraseMascota(necesidad, j.apodo, () => 0)
        : fraseMascota(animo === 'contenta' ? 'contenta' : 'normal', j.apodo, () => 0));

  // Posición de la boca dentro de la escena (en px), para poner la comida justo ahí.
  const bocaPx = (() => {
    const b = bocaDe(etapa);
    return { x: ((b.x - VISTA.x) / VISTA.ancho) * TAM, y: ((b.y - VISTA.y) / VISTA.alto) * TAM };
  })();

  function reaccionar(r: Reaccion, ms = 800) {
    setReaccion('');
    requestAnimationFrame(() => setReaccion(r));
    despues(ms, () => setReaccion(''));
  }

  /** Corazones, migas, burbujas o brillos que aparecen y se van (x, y en px dentro de la escena). */
  function flotar(tipo: Flotante['tipo'], x: number, y: number, n = 1, ms = 1500) {
    const nuevos: Flotante[] = Array.from({ length: n }, () => ({ id: siguienteId++, tipo, x: x + (Math.random() - 0.5) * (n > 1 ? 60 : 0), y: y + (Math.random() - 0.5) * (n > 1 ? 30 : 0), dx: (Math.random() - 0.5) * 60 }));
    setFlotantes((f) => [...f, ...nuevos].slice(-60));
    if (tipo !== 'burbuja') despues(ms, () => setFlotantes((f) => f.filter((x) => !nuevos.includes(x))));
  }

  /** Coordenadas de la boca relativas a la escena. */
  function bocaEnEscena() {
    const esc = escena.current?.getBoundingClientRect();
    const mas = mascotaRef.current?.getBoundingClientRect();
    if (!esc || !mas) return { x: 150, y: 120 };
    return { x: mas.left - esc.left + bocaPx.x, y: mas.top - esc.top + bocaPx.y };
  }

  // ---------- Comer ----------
  async function darComida(id: string, desde?: { x: number; y: number }) {
    if (ocupada.current) return;
    if (panzaLlena(m!)) {
      setMensaje(fraseMascota('llena', j!.apodo));
      reaccionar('no-no', 950);
      return;
    }
    ocupada.current = true;
    const r = await alimentarMascota(id);
    if (r !== 'ok') {
      ocupada.current = false;
      setMensaje(r === 'llena' ? fraseMascota('llena', j!.apodo) : frase(guia, 'sinMonedas'));
      reaccionar('no-no', 950);
      return;
    }
    const favorita = especie.favorita === id;
    setMensaje('');
    setBoca('abierta');
    setComiendo({ id, mordidas: 0, desde });
    // Tres mordiscos: ñam, ñam, ñam… y se terminó.
    [1, 2, 3].forEach((k) =>
      despues(550 + k * 600, () => {
        sonido('nam');
        const b = bocaEnEscena();
        flotar('miga', b.x, b.y + 10, 4, 900);
        setBoca('mastica');
        despues(330, () => setBoca(k < 3 ? 'abierta' : 'mastica'));
        if (k < 3) setComiendo((c) => (c ? { ...c, mordidas: k, desde: undefined } : c));
        else setComiendo(null);
      }),
    );
    despues(550 + 3 * 600 + 700, () => {
      setBoca(undefined);
      sonido(favorita ? 'festejo' : 'acierto');
      const b = bocaEnEscena();
      flotar('corazon', b.x, b.y - 40, favorita ? 6 : 3);
      reaccionar('saltito', 750);
      setMensaje(fraseMascota(favorita ? 'favorita' : 'comer', j!.apodo));
      ocupada.current = false;
    });
  }

  function comidaAbajo(ev: PE<HTMLButtonElement>, id: string) {
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
    tocarComida.current = { id, x: ev.clientX, y: ev.clientY, movio: false };
  }
  function comidaMueve(ev: PE<HTMLButtonElement>) {
    const t = tocarComida.current;
    if (!t) return;
    if (!t.movio && Math.hypot(ev.clientX - t.x, ev.clientY - t.y) > 10) t.movio = true;
    if (t.movio) setArrastre({ id: t.id, x: ev.clientX, y: ev.clientY });
  }
  function comidaArriba(ev: PE<HTMLButtonElement>) {
    const t = tocarComida.current;
    tocarComida.current = null;
    setArrastre(null);
    if (!t) return;
    if (!t.movio) {
      const r = ev.currentTarget.getBoundingClientRect();
      return darComida(t.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    // Soltó la comida: si cayó cerca de la mascota, se la come.
    const mas = mascotaRef.current?.getBoundingClientRect();
    if (mas && ev.clientX > mas.left - 30 && ev.clientX < mas.right + 30 && ev.clientY > mas.top - 30 && ev.clientY < mas.bottom + 30)
      darComida(t.id, { x: ev.clientX, y: ev.clientY });
  }

  // ---------- Mimos ----------
  function mimos(ev: PE<HTMLDivElement>) {
    if (modo !== 'casa' || ocupada.current) return;
    const esc = escena.current!.getBoundingClientRect();
    sonido('risa');
    flotar(Math.random() < 0.7 ? 'corazon' : 'nota', ev.clientX - esc.left, ev.clientY - esc.top - 20, 2);
    reaccionar(azar<Reaccion>(['saltito', 'saltito', 'giro']));
    setMensaje(fraseMascota('mimos', j!.apodo));
    void mimarMascota();
  }

  // ---------- Pelota ----------
  function tirarPelota() {
    if (ocupada.current) return;
    ocupada.current = true;
    const atrapa = Math.abs(pos.current - 0.5) < cfg.pelota.zonaCentro;
    const el = pelotaRef.current;
    const b = bocaEnEscena();
    const pr = el?.getBoundingClientRect();
    const esc = escena.current?.getBoundingClientRect();
    sonido('boing');
    if (el && pr && esc) {
      const dx = b.x - (pr.left - esc.left + pr.width / 2);
      const dy = b.y - (pr.top - esc.top + pr.height / 2);
      el.animate?.(
        atrapa
          ? [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(0.8)` }]
          : [{ transform: 'none' }, { transform: `translate(${dx + (pos.current < 0.5 ? 140 : -140)}px, ${dy - 60}px) scale(0.7)`, opacity: 0.2 }],
        { duration: 500, easing: 'ease-out' },
      );
    }
    despues(480, async () => {
      if (atrapa) {
        reaccionar('saltito', 700);
        flotar('brillo', b.x, b.y - 30, 3, 900);
        const n = atrapadas + 1;
        setAtrapadas(n);
        if (n >= cfg.pelota.atrapadasParaGanar) {
          const sumo = await jugarConMascota();
          sonido('festejo');
          flotar('corazon', b.x, b.y - 40, 7);
          reaccionar('giro', 900);
          setMensaje(fraseMascota(sumo ? 'pelotaGana' : 'pelotaYaJugo', j!.apodo));
          despues(1200, () => {
            setModo('casa');
            setAtrapadas(0);
            ocupada.current = false;
          });
          return;
        }
        setMensaje(fraseMascota('pelotaAtrapa', j!.apodo));
      } else {
        setMensaje(fraseMascota('pelotaErra', j!.apodo));
      }
      despues(250, () => (ocupada.current = false));
    });
  }

  // ---------- Baño ----------
  function esponja(ev: PE<HTMLElement>) {
    if (modo !== 'banio' || enjuagando || (ev.pointerType === 'mouse' && ev.buttons === 0)) return;
    if (ev.type === 'pointerdown') {
      ev.preventDefault();
      ev.currentTarget.setPointerCapture?.(ev.pointerId);
    }
    const esc = escena.current!.getBoundingClientRect();
    const mas = mascotaRef.current!.getBoundingClientRect();
    if (ev.clientX < mas.left || ev.clientX > mas.right || ev.clientY < mas.top || ev.clientY > mas.bottom) return;
    const x = ev.clientX - esc.left;
    const y = ev.clientY - esc.top;
    const u = ultimaBurbuja.current;
    if (u && Math.hypot(u.x - x, u.y - y) < 18) return;
    ultimaBurbuja.current = { x, y };
    flotar('burbuja', x, y);
    const n = ++cuentaBurbujas.current;
    setBurbujas(n);
    if (n % 5 === 0) {
      sonido('burbuja');
      if (n % 10 === 0) {
        setMensaje(fraseMascota('banioRisa', j!.apodo));
        reaccionar('saltito', 600);
      }
    }
  }
  async function enjuagar() {
    setEnjuagando(true);
    sonido('agua');
    const ancho = escena.current?.clientWidth ?? 320;
    flotar('gota', ancho / 2, 0, 18, 1300);
    despues(900, async () => {
      setFlotantes((f) => f.filter((x) => x.tipo !== 'burbuja'));
      await banarMascota();
      const b = bocaEnEscena();
      flotar('brillo', b.x, b.y - 30, 8, 1400);
      sonido('festejo');
      reaccionar('giro', 900);
      setMensaje(fraseMascota('banioListo', j!.apodo));
      setBurbujas(0);
      cuentaBurbujas.current = 0;
      setEnjuagando(false);
      despues(600, () => setModo('casa'));
    });
  }

  function cambiarModo(n: Modo) {
    if (ocupada.current) return;
    sonido('toque');
    setFlotantes([]);
    setAtrapadas(0);
    setBurbujas(0);
    cuentaBurbujas.current = 0;
    setModo(n);
    setMensaje(n === 'comer' ? fraseMascota('elegirComida') : n === 'pelota' ? fraseMascota('pelotaEmpezar') : n === 'banio' ? fraseMascota('banioEmpezar') : '');
    escena.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const marcas = cfg.etapas.slice(1).map((x) => x.desde / cfg.maximo);
  const accesorios = ITEMS.filter((i) => i.capa === 'mascota');
  const llenaBurbujas = burbujas >= cfg.limpieza.burbujasParaLimpiar;
  const fondo = modo === 'banio' ? 'linear-gradient(#D7F5EE 62%, #B9E6F5 62%)' : 'linear-gradient(#CDE9FF 60%, #9ED9A8 60%)';

  return (
    <main className="pantalla con-menu" style={{ gap: 14, maxWidth: 560, margin: '0 auto' }}>
      <div className="fila entre">
        <h1>Mi mascota</h1>
        <PildoraMonedas n={j.monedas} />
      </div>
      <section ref={escena} className="escena-mascota" style={{ background: fondo }} onPointerMove={esponja} onPointerDown={esponja}>
        <p className="burbuja" style={{ display: 'inline-block', maxWidth: '85%', margin: 0 }} aria-live="polite">{saludo}</p>
        {modo === 'pelota' && (
          <p className="pildora" style={{ position: 'absolute', right: 12, top: 12, background: '#fff' }}>
            Atrapadas: {atrapadas} de {cfg.pelota.atrapadasParaGanar}
          </p>
        )}
        <div className="centro" style={{ display: 'flex', marginTop: 8, position: 'relative' }}>
          {modo === 'pelota' && <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, width: TAM * 0.9, height: 22, borderRadius: '50%', border: '4px dashed #fff', opacity: 0.9 }} />}
          <div ref={mascotaRef} style={{ position: 'relative', width: TAM, height: TAM }}>
            <div
              className={reaccion || 'respira'}
              onPointerDown={modo === 'casa' ? mimos : undefined}
              role={modo === 'casa' ? 'button' : undefined}
              aria-label={modo === 'casa' ? `Hacerle mimos a ${m.nombre}` : undefined}
              tabIndex={modo === 'casa' ? 0 : undefined}
              onKeyDown={(ev) => modo === 'casa' && ev.key === 'Enter' && mimos(ev as unknown as PE<HTMLDivElement>)}
              style={{ cursor: modo === 'casa' ? 'pointer' : undefined }}
            >
              <MascotaSVG especie={m.especie} etapa={etapa} animo={mensaje && modo === 'casa' ? 'contenta' : animo} size={TAM} accesorios={m.accesorios} boca={boca} sucia={limpieza < 40 && modo !== 'banio'} />
            </div>
            {comiendo && (
              <div ref={comidaRef} className="flota" style={{ left: bocaPx.x - 26, top: bocaPx.y - 30, zIndex: 3 }}>
                <ObjetoMordido id={comiendo.id} size={52} mordidas={comiendo.mordidas} />
              </div>
            )}
          </div>
        </div>
        {modo === 'pelota' && (
          <div ref={pelotaRef} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button className="boton-icono" style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff' }} onClick={tirarPelota} aria-label="Tirar la pelota">
              <Objeto id="pelota" size={56} />
            </button>
          </div>
        )}
        {flotantes.map((f) => (
          <span key={f.id} className="flota" aria-hidden="true"
            style={{
              left: f.tipo === 'gota' ? f.x - 14 + (f.dx ?? 0) * 4 : f.x - 14,
              top: f.y - 14,
              ...(f.tipo === 'miga' ? { animation: 'migas 0.9s ease-out both', ['--dx' as string]: `${f.dx}px` } : f.tipo === 'gota' ? { animation: `gotas 1.1s ${(f.id % 5) / 10}s ease-in both` } : f.tipo === 'burbuja' ? { animation: 'aparecer 0.25s ease both' } : f.tipo === 'brillo' ? { animation: 'brillo 1s ease both' } : { animation: 'subeYSeVa 1.5s ease-out both' }),
            }}>
            {f.tipo === 'corazon' && <span style={{ color: '#E8505B' }}><Icono nombre="corazon" size={28} grosor={3} /></span>}
            {f.tipo === 'nota' && <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--violeta)' }}>♪</span>}
            {f.tipo === 'miga' && <span style={{ display: 'block', width: 9, height: 9, borderRadius: 3, background: '#D9A066' }} />}
            {f.tipo === 'brillo' && <span style={{ color: '#FFC93C' }}><Icono nombre="estrella" size={26} grosor={3} /></span>}
            {f.tipo === 'gota' && <span style={{ color: '#3E8FD6' }}><Icono nombre="gota" size={22} grosor={3} /></span>}
            {f.tipo === 'burbuja' && <span style={{ display: 'block', width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', border: '2px solid #9FD3F0' }} />}
          </span>
        ))}
      </section>

      {/* Acciones justo debajo de la mascota. */}
      {modo === 'casa' && (
        <div className="grilla-2" style={{ gap: 8 }}>
          {(
            [
              { icono: 'manzana', t: 'Comer', s: necesidad === 'hambre' ? '¡Tiene hambre!' : 'Comidas ricas', f: () => cambiarModo('comer') },
              { icono: 'pelota', t: 'Jugar', s: necesidad === 'aburrida' ? '¡Quiere jugar!' : 'A la pelota', f: () => cambiarModo('pelota') },
              { icono: 'gota', t: 'Bañar', s: necesidad === 'sucia' ? '¡Se ensució!' : 'Con burbujas', f: () => cambiarModo('banio') },
              { icono: 'gorro', t: 'Vestir', s: 'Gorros y más', f: () => setVestir(true) },
            ] as { icono: NombreIcono; t: string; s: string; f: () => void }[]
          ).map((b) => (
            <button key={b.t} className="tarjeta fila" style={{ gap: 10, padding: '12px 12px', border: 0, minHeight: 72, justifyContent: 'flex-start', textAlign: 'left' }} onClick={b.f}>
              <span style={{ color: 'var(--violeta)', flex: 'none' }}><Icono nombre={b.icono} size={32} /></span>
              <span className="col" style={{ gap: 0 }}>
                <span className="titulo" style={{ fontSize: 20 }}>{b.t}</span>
                <span className={b.s.startsWith('¡') ? 'chico' : 'suave chico'} style={b.s.startsWith('¡') ? { color: 'var(--coral-oscuro)', fontWeight: 800 } : undefined}>{b.s}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {modo === 'comer' && (
        <section className="tarjeta col" style={{ gap: 10 }}>
          <div className="fila entre">
            <h2>¿Qué le das?</h2>
            <button className="boton blanco chico" onClick={() => cambiarModo('casa')}>Listo</button>
          </div>
          <div className="bandeja">
            {cfg.comidas.map((c) => {
              const alcanza = j.monedas >= c.precio;
              return (
                <button key={c.id} aria-disabled={!alcanza} aria-label={`${c.nombre}, ${c.precio} monedas${especie.favorita === c.id ? ', su favorita' : ''}`}
                  onPointerDown={(ev) => comidaAbajo(ev, c.id)} onPointerMove={comidaMueve} onPointerUp={comidaArriba} onPointerCancel={() => { tocarComida.current = null; setArrastre(null); }}
                  onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && darComida(c.id)}>
                  <span style={{ position: 'relative' }}>
                    <Objeto id={c.id} size={44} />
                    {especie.favorita === c.id && <span style={{ position: 'absolute', right: -10, top: -6, color: '#E8505B' }}><Icono nombre="corazon" size={18} grosor={3} /></span>}
                  </span>
                  <span>{c.nombre}</span>
                  <span className="fila chico" style={{ gap: 3 }}><Moneda size={16} /> {c.precio}</span>
                </button>
              );
            })}
          </div>
          <p className="suave chico" style={{ margin: 0 }}>El corazón marca su comida favorita. Con la panza llena no quiere más.</p>
        </section>
      )}
      {modo === 'pelota' && (
        <section className="tarjeta col" style={{ gap: 8 }}>
          <p style={{ margin: 0 }}>Tocá la pelota cuando {m.nombre} esté arriba del círculo blanco. ¡Atrapá {cfg.pelota.atrapadasParaGanar}!</p>
          <button className="boton blanco ancho" onClick={() => cambiarModo('casa')}>Terminar</button>
        </section>
      )}
      {modo === 'banio' && (
        <section className="tarjeta col" style={{ gap: 8 }}>
          <p style={{ margin: 0 }}>Frotá con el dedo arriba de {m.nombre} para hacer espuma.</p>
          <div className="barra" role="progressbar" aria-label="Espuma" aria-valuemin={0} aria-valuemax={cfg.limpieza.burbujasParaLimpiar} aria-valuenow={Math.min(burbujas, cfg.limpieza.burbujasParaLimpiar)}>
            <span style={{ width: `${Math.min(100, (burbujas / cfg.limpieza.burbujasParaLimpiar) * 100)}%`, background: '#7CC6F2' }} />
          </div>
          {llenaBurbujas ? (
            <button className="boton ancho" onClick={enjuagar} disabled={enjuagando}><Icono nombre="gota" /> ¡A enjuagar!</button>
          ) : (
            <button className="boton blanco ancho" onClick={() => cambiarModo('casa')}>Terminar</button>
          )}
        </section>
      )}

      <div className="fila entre">
        <h2>{m.nombre}</h2>
        <span className="pildora violeta">{especie.nombre} {nombreEtapa}</span>
      </div>
      <div className="grilla-3" style={{ gap: 8 }}>
        {[
          { t: 'Panza', v: m.panza, c: 'var(--naranja)' },
          { t: 'Contento', v: m.contento, c: 'var(--turquesa)' },
          { t: 'Limpieza', v: limpieza, c: '#7CC6F2' },
        ].map((b) => (
          <div key={b.t} className="col" style={{ gap: 4 }}>
            <span className="etiqueta">{b.t}</span>
            <div className="barra" role="progressbar" aria-label={b.t} aria-valuenow={b.v} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${b.v}%`, background: b.c, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
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
            {aviso.faltan <= cfg.avisoFaltaParaCrecer ? `¡${m.nombre} está por crecer! ${aviso.faltan === 1 ? 'Falta 1 punto' : `Faltan ${aviso.faltan} puntos`}.` : `Faltan ${aviso.faltan} puntos para ser ${etapa === 'bebe' ? 'joven' : 'grande'}. Crece con las estrellas, la comida, los juegos y el baño.`}
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
      <button className="boton-link" onClick={() => ir('/mascota/elegir')}>Cambiar de mascota</button>

      {arrastre && (
        <div aria-hidden="true" style={{ position: 'fixed', left: arrastre.x - 30, top: arrastre.y - 30, zIndex: 40, pointerEvents: 'none', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.25))' }}>
          <Objeto id={arrastre.id} size={60} />
        </div>
      )}
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
                    if (tiene) {
                      sonido('toque');
                      reaccionar('saltito', 700);
                      return vestirMascota(a.id);
                    }
                    const r = await comprarItem(a.id);
                    if (r === 'ok') { sonido('festejo'); vestirMascota(a.id); reaccionar('giro', 900); } else setMensaje(frase(guia, 'sinMonedas'));
                  }}>
                  <MascotaSVG especie={m.especie} etapa={etapa} animo="contenta" size={64} accesorios={[a.id]} />
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{a.nombre}</span>
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
