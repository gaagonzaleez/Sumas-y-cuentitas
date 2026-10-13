// Pantallas 6 y 13: el ejercicio. Maneja errores (con errorTag), pistas, minilecciones,
// escalera de dificultad, tiempo activo, monedas y el final del grado.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Guia } from '../art/Guias';
import { Icono, Moneda } from '../art/Iconos';
import { config, MUNDOS, nivelPorId, type Mundo, type Nivel } from '../content';
import { frase } from '../content/catalogo';
import { crearAzar } from '../engine/azar';
import { limitesGrado } from '../engine/escalera';
import { generarEjercicio, plantillaDe } from '../engine/generar';
import { armarLeccion, errorTagDe, infoError, type LeccionArmada } from '../engine/leccion';
import { avanceGrado, estrellasDe, gradoCompleto, nuevaSesion, resolver, responder, type Sesion, sumarTiempo } from '../engine/sesion';
import type { Ejercicio } from '../engine/tipos';
import { actualizar, useJugadora } from '../datos/estado';
import { anotarError, completarGrado, ganar, registrarIntento, sumarTiempoDeJuego } from '../datos/juego';
import { callar, configurarVoz, decir, precargar, sonido, useAudioEstado } from '../audio/voz';
import { Modal } from '../ui/comunes';
import { ir } from '../ui/router';
import { guardarFestejo } from './festejo';
import { Leccion } from './Leccion';
import { ArmarBloques, ArmarGrupos, Dinero, type EstadoOpcion, Memoria, Opciones, Ordenar, Teclado } from './Modos';
import { VisualEjercicio } from './Visuales';

type Fase = 'pregunta' | 'acierto' | 'leccion';

interface Props {
  nivelId: string;
  grado: number;
  /** Repaso de un error frecuente: 8 ejercicios con ayuda, sin avanzar de grado. */
  repasoTag?: string;
}

/** Busca el nivel que mejor practica un errorTag (para el repaso). */
export function nivelParaRepaso(tag: string): { mundo: Mundo; nivel: Nivel } {
  const az = crearAzar(42);
  let mejor = { mundo: MUNDOS[1], nivel: MUNDOS[1].niveles[0], n: 0 };
  for (const mundo of MUNDOS) {
    for (const nivel of mundo.niveles) {
      const lim = limitesGrado(nivel, mundo.escala, 1);
      let n = 0;
      for (let i = 0; i < 12; i++) {
        const ej = generarEjercicio(az, mundo, nivel, 1, lim.inicio);
        if (ej.errorTagPorDefecto === tag || ej.opciones?.some((o) => o.errorTag === tag) || Object.values(ej.erroresPrevistos ?? {}).includes(tag)) n++;
      }
      if (n > mejor.n) mejor = { mundo, nivel, n };
    }
  }
  return mejor;
}

export function Jugar({ nivelId, grado, repasoTag }: Props) {
  const j = useJugadora();
  const audio = useAudioEstado();
  const az = useMemo(() => crearAzar(), []);
  const base = useMemo(() => {
    if (repasoTag) {
      const r = nivelParaRepaso(repasoTag);
      return { mundo: r.mundo, nivel: r.nivel, esJefe: false };
    }
    const info = nivelPorId(nivelId);
    return info ? { mundo: info.mundo, nivel: info.nivel, esJefe: info.esJefe } : null;
  }, [nivelId, repasoTag]);
  const lim = useMemo(() => (base ? limitesGrado(base.nivel, base.mundo.escala, grado) : null), [base, grado]);
  const [sesion, setSesion] = useState<Sesion | null>(() => (base && lim ? nuevaSesion(base.nivel.id, grado, lim, base.esJefe, Boolean(repasoTag)) : null));
  const [ej, setEj] = useState<Ejercicio | null>(null);
  const [fase, setFase] = useState<Fase>('pregunta');
  const [intento, setIntento] = useState(0);
  const [pista, setPista] = useState(0);
  const [despuesDeLeccion, setDespuesDeLeccion] = useState(false);
  // El mensaje de la guía va en partes: cada parte es una frase con su propio audio.
  const [partes, setMensaje] = useState<string[]>([]);
  const mensaje = partes.join(' ');
  const [opEstado, setOpEstado] = useState<EstadoOpcion>({ descartadas: [] });
  const [leccion, setLeccion] = useState<{ lec: LeccionArmada; respuesta?: string } | null>(null);
  const [ultimas, setUltimas] = useState(0);
  const [salir, setSalir] = useState(false);
  const [descanso, setDescanso] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const inicio = useRef(Date.now());
  const ejRef = useRef<Ejercicio | null>(null);
  const ultimaAccion = useRef(Date.now());
  const continuoMs = useRef(0);
  const avisoDescanso = useRef(false);
  const guia = j?.guia ?? 'chispa';

  useEffect(() => {
    if (j) configurarVoz(guia, j.ajustes.silencio);
  }, [guia, j?.ajustes.silencio]); // eslint-disable-line react-hooks/exhaustive-deps

  const nuevoEjercicio = useCallback(
    (s: Sesion, parecido?: Ejercicio) => {
      if (!base) return;
      const fija = parecido ? plantillaDe(base.nivel, parecido) : undefined;
      const e = generarEjercicio(az, base.mundo, base.nivel, grado, s.escalera.rango, new Set(s.uids), fija, ejRef.current?.plantillaId);
      ejRef.current = e;
      setEj(e);
      setFase('pregunta');
      setIntento(0);
      setPista(0);
      setOpEstado({ descartadas: [] });
      setMensaje([e.consigna]);
      setDespuesDeLeccion(Boolean(parecido));
      inicio.current = Date.now();
    },
    [az, base, grado],
  );

  // Primer ejercicio y precarga de audios del nivel.
  useEffect(() => {
    if (sesion && !ej) {
      nuevoEjercicio(sesion);
      if (lim) precargar([frase(guia, 'aciertos'), frase(guia, 'errores')], Math.min(1000, lim.techo));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lee la consigna (o el mensaje de la guía) cuando cambia.
  useEffect(() => {
    if (partes.length && fase !== 'leccion') decir(partes);
  }, [partes, fase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tiempo activo: cuenta solo con la pantalla visible y si tocó algo en el último minuto.
  useEffect(() => {
    const marcar = () => (ultimaAccion.current = Date.now());
    window.addEventListener('pointerdown', marcar);
    window.addEventListener('keydown', marcar);
    const t = setInterval(() => {
      const activo = document.visibilityState === 'visible' && Date.now() - ultimaAccion.current < config.app.pausaInactividadSeg * 1000;
      if (!activo) return;
      setSesion((s) => (s ? sumarTiempo(s, 1000) : s));
      setSegundos((x) => x + 1);
      continuoMs.current += 1000;
      if (!avisoDescanso.current && continuoMs.current >= config.app.recordatorioDescansoMin * 60_000) {
        avisoDescanso.current = true;
        setDescanso(true);
        decir(frase(guia, 'descanso'));
      }
    }, 1000);
    return () => {
      clearInterval(t);
      window.removeEventListener('pointerdown', marcar);
      window.removeEventListener('keydown', marcar);
    };
  }, [guia]);

  // Guarda los segundos jugados cada tanto (para el panel de la adulta).
  const segGuardados = useRef(0);
  useEffect(() => {
    if (segundos - segGuardados.current >= 30) {
      sumarTiempoDeJuego(segundos - segGuardados.current);
      segGuardados.current = segundos;
    }
  }, [segundos]);
  useEffect(
    () => () => {
      callar();
      sumarTiempoDeJuego(segundosRef.current - segGuardados.current);
    },
    [],
  );
  const segundosRef = useRef(0);
  segundosRef.current = segundos;

  if (!j || !base || !lim || !sesion) {
    return (
      <main className="pantalla angosta centro col">
        <p>No encontramos ese nivel.</p>
        <button className="boton" onClick={() => ir('/mapa')}>Volver al mapa</button>
      </main>
    );
  }

  const ejercicio = ej;
  const repaso = Boolean(repasoTag);
  const totalRepaso = config.progreso.repaso.ejercicios;

  async function terminarGrado(s: Sesion) {
    callar();
    if (repaso) {
      await actualizar((x) => ({ ...x, errores: x.errores.filter((e) => e.tag !== repasoTag) }));
      guardarFestejo({ nivelId: base!.nivel.id, grado, estrellasGrado: 0, monedas: s.monedas, estrellas: 0, estrellasNuevas: 0, items: [], esJefe: false, primeraVez: false, racha: false, repaso: true });
      ir('/festejo', true);
      return;
    }
    const est = estrellasDe(s);
    const premios = await completarGrado(base!.nivel.id, grado, est, s.mejorRango, Math.round(s.activoMs / 1000));
    guardarFestejo({ ...premios, nivelId: base!.nivel.id, grado, estrellasGrado: est, monedas: premios.monedas + s.monedas });
    ir('/festejo', true);
  }

  async function contestar(valor: string) {
    if (!ejercicio || fase !== 'pregunta') return;
    const correcta = valor === ejercicio.respuesta;
    const conAyuda = intento > 0 || pista > 0;
    const ms = Date.now() - inicio.current;
    const r = responder(sesion!, { correcta, conAyuda, despuesDeLeccion });
    let s = r.sesion;
    if (correcta) {
      sonido('acierto');
      s = resolver(s, intento === 0 && pista === 0, ejercicio.uid, pista > 0);
      setSesion(s);
      setOpEstado((o) => ({ ...o, correcta: valor }));
      setFase('acierto');
      setUltimas(r.monedas);
      await ganar(r.monedas);
      setMensaje([frase(guia, 'aciertos'), ejercicio.explicacion]);
      registrarIntento({ nivelId: base!.nivel.id, plantillaId: ejercicio.plantillaId, params: JSON.stringify(ejercicio.params), respuesta: valor, correcta: true, pistas: pista, ms });
      return;
    }
    const tag = errorTagDe(ejercicio, valor);
    anotarError(tag);
    registrarIntento({ nivelId: base!.nivel.id, plantillaId: ejercicio.plantillaId, params: JSON.stringify(ejercicio.params), respuesta: valor, correcta: false, errorTag: tag, pistas: pista, ms });
    sonido('casi');
    setSesion(s);
    setOpEstado((o) => ({ ...o, descartadas: [...o.descartadas, valor] }));
    const n = intento + 1;
    setIntento(n);
    if (n >= 2) {
      abrirLeccion(tag, valor);
      return;
    }
    if (r.activarPista && pista === 0) setPista(1);
    setMensaje([frase(guia, 'errores'), infoError(tag).frase, ...(r.activarPista && pista === 0 ? [ejercicio.pista] : [])]);
  }

  function abrirLeccion(tag: string, respuesta?: string) {
    if (!ejercicio) return;
    callar();
    setLeccion({ lec: armarLeccion(tag, ejercicio), respuesta });
    setFase('leccion');
    setMensaje([frase(guia, 'leccion')]);
    decir(frase(guia, 'leccion'));
  }

  function terminarLeccion() {
    if (!ejercicio) return;
    // El ejercicio queda resuelto (no al primer intento) y se propone uno parecido.
    const s = resolver(sesion!, false, ejercicio.uid, true);
    setSesion(s);
    setLeccion(null);
    if (!repaso && gradoCompleto(s)) return terminarGrado(s);
    nuevoEjercicio(s, ejercicio);
    setMensaje([frase(guia, 'parecida')]);
  }

  function pedirPista() {
    if (!ejercicio) return;
    const n = Math.min(config.progreso.pistas.maximo, pista + 1);
    setPista(n);
    if (n === 1) setMensaje([frase(guia, 'pista'), ejercicio.pista]);
    else if (n === 2) setMensaje([frase(guia, 'pistaDibujo'), ejercicio.pista]);
    else abrirLeccion(ejercicio.errorTagPorDefecto);
  }

  function seguir() {
    const s = sesion!;
    if (repaso ? s.resueltos >= totalRepaso : gradoCompleto(s)) return terminarGrado(s);
    nuevoEjercicio(s);
  }

  function alternarSilencio() {
    const nuevo = !audio.silencio;
    configurarVoz(guia, nuevo);
    actualizar((x) => ({ ...x, ajustes: { ...x.ajustes, silencio: nuevo } }));
  }

  const avance = repaso ? Math.min(1, sesion.resueltos / totalRepaso) : avanceGrado(sesion);
  const numPregunta = sesion.resueltos + 1;
  const minimo = repaso ? totalRepaso : config.economia.grado.ejerciciosMinimos;
  const verVisual = ejercicio?.visual && (!ejercicio.visualEsAyuda || pista >= 2);
  const reloj = j.ajustes.reloj && ['tablas', 'sumas', 'restas'].includes(ejercicio?.tema ?? '');
  const expr = fase === 'acierto' ? 'feliz' : intento > 0 ? 'pensando' : 'contenta';

  return (
    <main className="pantalla angosta" style={{ gap: 14, paddingBottom: fase === 'acierto' ? 200 : undefined }}>
      <div className="fila" style={{ gap: 10 }}>
        <button className="boton-icono" onClick={() => setSalir(true)} aria-label="Salir"><Icono nombre="cruz" /></button>
        <div className="col" style={{ flex: 1, gap: 4 }}>
          <span className="suave chico" style={{ lineHeight: 1.1 }}>
            {repaso ? 'Repaso' : base.mundo.nombre} · {numPregunta <= minimo ? `Pregunta ${numPregunta} de ${minimo}` : '¡Pregunta extra!'}
          </span>
          <div className="barra" role="progressbar" aria-label="Avance del grado" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(avance * 100)}>
            <span style={{ width: `${avance * 100}%` }} />
          </div>
        </div>
        <button className="boton-icono" onClick={alternarSilencio} aria-label={audio.silencio ? 'Activar la voz' : 'Silenciar la voz'} aria-pressed={audio.silencio}>
          <Icono nombre={audio.silencio ? 'silencio' : 'altavoz'} />
        </button>
        <span className="pildora monedas" aria-label={`${j.monedas} monedas`}><Moneda size={22} /> {j.monedas}</span>
      </div>

      {/* Guía con subtítulo siempre visible */}
      <div className="fila" style={{ alignItems: 'flex-start', gap: 10 }}>
        <Guia guia={guia} size={54} expr={expr} />
        <div className="burbuja fila" style={{ alignItems: 'center', gap: 10 }}>
          <p style={{ flex: 1 }} aria-live="polite">{fase === 'leccion' ? frase(guia, 'leccion') : mensaje}</p>
          <button className="boton-icono violeta" style={{ width: 54, height: 54 }} onClick={() => decir(fase === 'leccion' ? frase(guia, 'leccion') : partes, { forzar: true })} aria-label="Escuchar otra vez">
            <Icono nombre="altavoz" />
          </button>
        </div>
      </div>

      {fase === 'leccion' && leccion && ejercicio ? (
        <Leccion lec={leccion.lec} ej={ejercicio} respuesta={leccion.respuesta} alTerminar={terminarLeccion} />
      ) : ejercicio ? (
        <>
          {mensaje !== ejercicio.consigna && fase === 'pregunta' && (
            <p className="tarjeta" style={{ padding: '10px 14px', fontSize: 18 }}>{ejercicio.consigna}</p>
          )}
          {verVisual && ejercicio.visual && (
            <div className="tarjeta aparece" style={{ padding: 14 }}><VisualEjercicio v={ejercicio.visual} /></div>
          )}
          {ejercicio.cuenta && (
            <p className="titulo centro" style={{ fontSize: 40, textAlign: 'center' }} aria-label={ejercicio.cuenta.replace('?', 'cuánto')}>
              {fase === 'acierto' ? ejercicio.cuenta.replace('?', '') : ejercicio.cuenta.replace(' = ?', ' = ')}
              {fase === 'acierto' ? <span style={{ color: 'var(--turquesa-oscuro)' }}>{ejercicio.respuesta}</span> : <span style={{ color: '#9C8FC4' }}>?</span>}
            </p>
          )}
          {reloj && fase === 'pregunta' && <Reloj key={ejercicio.uid} />}
          <div key={ejercicio.uid}>
            {ejercicio.modo === 'opciones' && <Opciones ej={ejercicio} responder={contestar} estado={opEstado} />}
            {ejercicio.modo === 'teclado' && <Teclado responder={contestar} bloqueado={fase !== 'pregunta'} />}
            {ejercicio.modo === 'bloques' && <ArmarBloques ej={ejercicio} responder={contestar} bloqueado={fase !== 'pregunta'} />}
            {ejercicio.modo === 'ordenar' && <Ordenar ej={ejercicio} responder={contestar} bloqueado={fase !== 'pregunta'} />}
            {ejercicio.modo === 'dinero' && <Dinero ej={ejercicio} responder={contestar} bloqueado={fase !== 'pregunta'} />}
            {ejercicio.modo === 'memoria' && (
              <Memoria ej={ejercicio} responder={contestar} bloqueado={fase !== 'pregunta'} alError={() => contestar('x')} />
            )}
            {ejercicio.modo === 'arrastrar' && <ArmarGrupos ej={ejercicio} responder={contestar} bloqueado={fase !== 'pregunta'} />}
          </div>
          {fase === 'pregunta' && (
            <button className="boton blanco chico" style={{ alignSelf: 'center' }} onClick={pedirPista}>
              <Icono nombre="foco" /> {pista === 0 ? 'Pedir una pista' : pista === 1 ? 'Otra ayudita' : 'Explicámelo'}
            </button>
          )}
        </>
      ) : null}

      {fase === 'acierto' && ejercicio && (
        <div className="aparece" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--turquesa-claro)', borderRadius: '28px 28px 0 0', padding: '20px 20px calc(20px + var(--seguro-abajo))', zIndex: 20, display: 'flex', justifyContent: 'center' }}>
          <div className="col" style={{ width: '100%', maxWidth: 440, gap: 12 }}>
            <div className="fila entre">
              <div className="col" style={{ gap: 2 }}>
                <h2 style={{ color: 'var(--turquesa-oscuro)' }}>{intento === 0 ? '¡Genial, lo lograste!' : '¡Muy bien!'}</h2>
                <span style={{ fontWeight: 800, color: 'var(--turquesa-oscuro)' }}>{ejercicio.explicacion}</span>
              </div>
              <span className="pildora" style={{ background: '#fff' }}><Moneda size={22} /> +{ultimas}</span>
            </div>
            <button className="boton verde ancho" onClick={seguir} autoFocus>Seguir</button>
          </div>
        </div>
      )}

      {salir && (
        <Modal titulo="¿Salir?" alCerrar={() => setSalir(false)}>
          <h2>¿Querés salir?</h2>
          <p>Las monedas que ganaste ya están guardadas. Para completar el grado hay que contestar {config.economia.grado.ejerciciosMinimos} preguntas.</p>
          <button className="boton ancho" onClick={() => setSalir(false)}>Seguir jugando</button>
          <button className="boton blanco ancho" onClick={() => ir(repaso ? '/mapa' : `/nivel/${base.nivel.id}`, true)}>Salir</button>
        </Modal>
      )}
      {descanso && (
        <Modal titulo="Hora de descansar" alCerrar={() => setDescanso(false)}>
          <div className="centro col"><Guia guia={guia} size={90} expr="feliz" /></div>
          <h2 className="centro" style={{ textAlign: 'center' }}>¡Hora de descansar!</h2>
          <p style={{ textAlign: 'center' }}>Ya jugaste {config.app.recordatorioDescansoMin} minutos seguidos. Tomá agua y estirá las piernas.</p>
          <button className="boton ancho" onClick={() => { continuoMs.current = 0; avisoDescanso.current = false; setDescanso(false); }}>Ya descansé</button>
          <button className="boton blanco ancho" onClick={() => ir('/mapa', true)}>Salir por hoy</button>
        </Modal>
      )}
    </main>
  );
}

/** Carrera contra el reloj (opcional): solo muestra el tiempo, nunca se pierde por tiempo. */
function Reloj() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="pildora estrellas" style={{ alignSelf: 'center' }} aria-label={`${s} segundos`}>
      <Icono nombre="reloj" size={20} /> {s} s
    </span>
  );
}
