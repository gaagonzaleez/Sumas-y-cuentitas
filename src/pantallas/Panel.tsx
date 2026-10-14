// Pantalla 14: panel de la adulta. Progreso, tiempo de juego, errores frecuentes,
// cambiar apodo y borrar el perfil (borra todos sus datos).
import { useState } from 'react';
import { AvatarCirculo } from '../art/Avatar';
import { Icono } from '../art/Iconos';
import { config } from '../content';
import { infoError } from '../engine/leccion';
import { limpiarApodo, MENSAJES_APODO, validarApodo } from '../engine/apodo';
import { diasEntre, sumarDias } from '../engine/mascota';
import { gradosCompletados } from '../engine/progreso';
import { diaArgentina, lunesDeLaSemana } from '../engine/semana';
import { actualizarPorId, borrarJugadora, elegirJugadora, salirAdulta, useEstado } from '../datos/estado';
import { normalizarCodigo, validarCodigo } from '../datos/grupos';
import type { Jugadora } from '../datos/tipos';
import { BotonVolver, Modal } from '../ui/comunes';
import { ir } from '../ui/router';
import { PanelGrupos } from './PanelGrupos';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function tiempoTexto(seg: number): string {
  const min = Math.round(seg / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

export function erroresFrecuentes(j: Jugadora, dias = 7) {
  const hoy = diaArgentina();
  const cuenta: Record<string, number> = {};
  for (const e of j.errores) if (diasEntre(e.dia, hoy) < dias) cuenta[e.tag] = (cuenta[e.tag] ?? 0) + 1;
  // Se agrupan por tema para que la adulta vea algo claro.
  const porTema: Record<string, { veces: number; frase: string; consejo: string }> = {};
  for (const [tag, n] of Object.entries(cuenta)) {
    const i = infoError(tag);
    porTema[i.tema] ??= { veces: 0, frase: i.frase, consejo: i.consejo };
    porTema[i.tema].veces += n;
  }
  return Object.entries(porTema).sort((a, b) => b[1].veces - a[1].veces).slice(0, 5);
}

export function Panel() {
  const e = useEstado();
  const [verId, setVerId] = useState<string | undefined>(e.actualId ?? e.jugadoras[0]?.id);
  const [editar, setEditar] = useState(false);
  const [borrar, setBorrar] = useState(false);
  const [apodo, setApodo] = useState('');
  const [codigo, setCodigo] = useState('');
  if (!e.adultaAdentro) {
    ir('/adulta/entrar?a=/adulta/panel', true);
    return null;
  }
  const j = e.jugadoras.find((x) => x.id === verId) ?? e.jugadoras[0];
  if (!j) {
    return (
      <main className="pantalla angosta">
        <div className="fila"><BotonVolver a="/" /><h1>Panel para personas adultas</h1></div>
        <div className="tarjeta col centro"><p>Todavía no hay perfiles.</p><button className="boton" onClick={() => ir('/adulta/perfil')}>Crear un perfil</button></div>
      </main>
    );
  }
  const lunes = lunesDeLaSemana();
  const semana = Array.from({ length: 7 }, (_, i) => j.tiempoPorDia[sumarDias(lunes, i)] ?? 0);
  const totalSemana = semana.reduce((a, b) => a + b, 0);
  const max = Math.max(60, ...semana);
  const errores = erroresFrecuentes(j);
  const problema = validarApodo(apodo);

  return (
    <main className="pantalla angosta" style={{ gap: 14 }}>
      <div className="fila">
        <BotonVolver a={e.adentro ? '/mapa' : '/'} />
        <div className="col" style={{ gap: 0, flex: 1 }}>
          <span className="suave chico">Panel para personas adultas</span>
          <h1 style={{ fontSize: 26 }}>{j.apodo} · {j.grado}</h1>
        </div>
      </div>
      {e.jugadoras.length > 1 && (
        <div className="chips">
          {e.jugadoras.map((x) => <button key={x.id} className="chip" aria-pressed={x.id === j.id} onClick={() => setVerId(x.id)}>{x.avatar && <AvatarCirculo avatar={x.avatar} size={28} />}{x.apodo}</button>)}
        </div>
      )}
      <div className="grilla-2">
        <div className="tarjeta col" style={{ gap: 2 }}>
          <span className="suave chico">Esta semana</span>
          <span className="titulo" style={{ fontSize: 28 }}>{tiempoTexto(totalSemana)}</span>
          <span className="chico">de juego activo</span>
        </div>
        <div className="tarjeta col" style={{ gap: 2 }}>
          <span className="suave chico">Grados</span>
          <span className="titulo" style={{ fontSize: 28 }}>{gradosCompletados(j.progreso)}</span>
          <span className="chico">completados · {j.estrellas} estrellas</span>
        </div>
      </div>
      <div className="tarjeta col" style={{ gap: 8 }}>
        <span style={{ fontWeight: 800 }}>Minutos por día</span>
        <div className="fila" style={{ alignItems: 'flex-end', gap: 8, height: 110 }} role="img" aria-label={`Minutos por día: ${semana.map((s, i) => `${DIAS[i]} ${Math.round(s / 60)}`).join(', ')}`}>
          {semana.map((s, i) => (
            <div key={i} className="col centro" style={{ flex: 1, gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <span className="chico" style={{ fontWeight: 800 }}>{Math.round(s / 60) || ''}</span>
              <div style={{ width: '100%', height: `${Math.max(4, (s / max) * 70)}px`, background: s ? 'var(--turquesa)' : 'var(--lavanda)', borderRadius: 8 }} />
              <span className="chico" style={{ fontWeight: 800 }}>{DIAS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <h2>Para repasar juntas</h2>
      {errores.length === 0 ? (
        <p className="tarjeta suave">Esta semana no hubo errores repetidos. ¡Viene muy bien!</p>
      ) : (
        errores.map(([tema, x]) => (
          <div key={tema} className="tarjeta fila" style={{ gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--naranja-claro)', color: 'var(--naranja-texto)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flex: 'none' }}>{x.veces}</span>
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontWeight: 800 }}>{tema}</span>
              <span className="suave chico">{x.frase} {x.consejo}</span>
            </div>
          </div>
        ))
      )}
      <div className="tarjeta col" style={{ gap: 10 }}>
        <span style={{ fontWeight: 800 }}>Grupo</span>
        <p className="suave chico">{j.codigoGrupo ? `Código: ${j.codigoGrupo}` : 'Juega sin grupo.'}</p>
        <div className="fila" style={{ gap: 8 }}>
          <input aria-label="Código del grupo" placeholder="LUNA-4821" value={codigo} onChange={(ev) => setCodigo(ev.target.value.toUpperCase())} style={{ flex: 1, minWidth: 0, height: 50, borderRadius: 14, border: '2px solid var(--lila)', padding: '0 12px', fontSize: 18 }} />
          <button className="boton chico" disabled={!validarCodigo(codigo)} onClick={async () => { await actualizarPorId(j.id, (x) => ({ ...x, codigoGrupo: normalizarCodigo(codigo) })); setCodigo(''); }}>Guardar</button>
        </div>
        {j.codigoGrupo && <button className="boton-link" style={{ alignSelf: 'flex-start' }} onClick={() => actualizarPorId(j.id, (x) => ({ ...x, codigoGrupo: undefined }))}>Salir del grupo</button>}
      </div>
      <PanelGrupos />
      <div className="fila" style={{ gap: 10 }}>
        <button className="boton blanco" style={{ flex: 1, fontSize: 18 }} onClick={() => { setApodo(j.apodo); setEditar(true); }}>Cambiar apodo</button>
        <button className="boton peligro" style={{ flex: 1, fontSize: 18 }} onClick={() => setBorrar(true)}>Borrar perfil</button>
      </div>
      <p className="suave chico" style={{ textAlign: 'center' }}>Borrar el perfil elimina todos sus datos. Para entrar acá hace falta la contraseña de la persona adulta.</p>
      <div className="fila" style={{ gap: 10 }}>
        <button className="boton blanco chico" style={{ flex: 1 }} onClick={() => ir('/adulta/perfil')}><Icono nombre="usuaria" /> Otro perfil</button>
        <button className="boton blanco chico" style={{ flex: 1 }} onClick={() => { salirAdulta(); ir(e.adentro ? '/mapa' : '/'); }}><Icono nombre="salir" /> Salir</button>
      </div>
      {editar && (
        <Modal titulo="Cambiar apodo" alCerrar={() => setEditar(false)}>
          <h2>Cambiar apodo</h2>
          <div className="campo">
            <label htmlFor="nuevo-apodo">Apodo de juego</label>
            <input id="nuevo-apodo" value={apodo} onChange={(ev) => setApodo(ev.target.value)} />
            {problema && <span className="aviso">{MENSAJES_APODO[problema]}</span>}
          </div>
          <button className="boton ancho" disabled={!!problema} onClick={async () => { await actualizarPorId(j.id, (x) => ({ ...x, apodo: limpiarApodo(apodo) })); setEditar(false); }}>Guardar</button>
          <button className="boton blanco ancho" onClick={() => setEditar(false)}>Cancelar</button>
        </Modal>
      )}
      {borrar && (
        <Modal titulo="Borrar perfil" alCerrar={() => setBorrar(false)}>
          <h2>¿Borrar el perfil de {j.apodo}?</h2>
          <p>Se eliminan para siempre su avatar, su mascota, sus monedas, su progreso y sus respuestas, en este dispositivo y en la nube si estaba conectada. No se puede deshacer.</p>
          <button className="boton peligro ancho" onClick={async () => { const eraLaActual = e.actualId === j.id; await borrarJugadora(j.id); setBorrar(false); if (eraLaActual) elegirJugadora(undefined); setVerId(undefined); }}>Sí, borrar todo</button>
          <button className="boton ancho" onClick={() => setBorrar(false)}>No, volver</button>
        </Modal>
      )}
      <p className="suave chico" style={{ textAlign: 'center' }}>Datos que guardamos: apodo, grado, avatar, mascota, progreso y puntos. Nada más. {config.app.nombre} no tiene publicidad ni compras con dinero real.</p>
    </main>
  );
}
