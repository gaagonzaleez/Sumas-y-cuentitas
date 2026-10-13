// Panel de la creadora del juego: cuántos perfiles hay, cómo avanza cada uno y qué temas cuestan más.
// "Este celular" funciona siempre; "Todos" junta los perfiles de todos los dispositivos (necesita la nube).
import { type FormEvent, useEffect, useState } from 'react';
import { nivelPorId } from '../content';
import { useEstado } from '../datos/estado';
import { conectar, perfilesDeTodos, type EstadoCreadora } from '../datos/nube';
import { resumirJugadora, totales, type ResumenPerfil } from '../datos/resumen';
import { diasEntre } from '../engine/mascota';
import { diaArgentina } from '../engine/semana';
import { BotonVolver } from '../ui/comunes';

function haceCuanto(dia?: string): string {
  if (!dia) return 'todavía no jugó';
  const d = diasEntre(dia, diaArgentina());
  return d === 0 ? 'jugó hoy' : d === 1 ? 'jugó ayer' : `jugó hace ${d} días`;
}

function minutos(m: number): string {
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function Dato({ n, texto }: { n: string | number; texto: string }) {
  return (
    <div className="tarjeta col centro" style={{ gap: 0, padding: '12px 8px' }}>
      <span className="titulo" style={{ fontSize: 28 }}>{n}</span>
      <span className="suave chico" style={{ textAlign: 'center' }}>{texto}</span>
    </div>
  );
}

function Perfil({ r }: { r: ResumenPerfil }) {
  const [abierto, setAbierto] = useState(false);
  const max = Math.max(10, ...r.minutosPorDia.map((d) => d.minutos));
  return (
    <section className="tarjeta col" style={{ gap: 8 }}>
      <button className="fila entre" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', minHeight: 44 }} onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <span className="col" style={{ gap: 2, minWidth: 0 }}>
          <span className="titulo recorte" style={{ fontSize: 20 }}>{r.apodo}</span>
          <span className="suave chico">{r.grado} · {haceCuanto(r.ultimoDia)}</span>
          <span className="chico" style={{ fontWeight: 800 }}>{r.dondeEsta}</span>
        </span>
        <span className="col" style={{ alignItems: 'flex-end', gap: 0, flex: 'none' }}>
          <span style={{ fontWeight: 800 }}>⭐ {r.estrellas}</span>
          <span className="suave chico">{minutos(r.minutos7)} esta semana</span>
          <span className="suave chico">{minutos(r.minutosTotal)} en total</span>
          <span className="chico" style={{ color: 'var(--violeta)', fontWeight: 800 }}>{abierto ? 'Cerrar' : 'Ver más'}</span>
        </span>
      </button>
      {abierto && (
        <div className="col" style={{ gap: 10 }}>
          <div className="col" style={{ gap: 6 }}>
            <span className="etiqueta">Avance por mundo</span>
            {r.mundos.map((m) => (
              <div key={m.id} className="col" style={{ gap: 2 }}>
                <span className="fila entre chico">
                  <span style={{ fontWeight: 800 }}>{m.nombre}</span>
                  <span className="suave">{m.abierto ? `${m.niveles}/8 niveles${m.desafio ? ' + desafío' : ''} · ${m.grados}/45 grados` : 'cerrado'}</span>
                </span>
                <div className="barra" style={{ height: 10 }} role="progressbar" aria-label={m.nombre} aria-valuenow={m.grados} aria-valuemin={0} aria-valuemax={45}>
                  <span style={{ width: `${(m.grados / 45) * 100}%`, background: 'var(--turquesa)' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="col" style={{ gap: 4 }}>
            <span className="etiqueta">Minutos por día (última semana)</span>
            <div className="fila" style={{ alignItems: 'flex-end', gap: 6, height: 70 }}>
              {r.minutosPorDia.map((d) => (
                <div key={d.dia} className="col centro" style={{ flex: 1, gap: 2 }}>
                  <span className="chico" style={{ fontWeight: 800 }}>{d.minutos || ''}</span>
                  <span style={{ width: '100%', height: Math.max(3, (d.minutos / max) * 44), background: 'var(--violeta)', borderRadius: 6 }} />
                </div>
              ))}
            </div>
          </div>
          <p className="chico" style={{ margin: 0 }}>
            <b>Total:</b> {minutos(r.minutosTotal)} en {r.diasJugados} días · {r.gradosCompletados} grados completados · {r.monedas} monedas
            {r.mascota && ` · mascota en ${r.mascota.crecimiento}/300`}
          </p>
          {r.temasDificiles.length > 0 && (
            <p className="chico" style={{ margin: 0 }}><b>Le cuesta:</b> {r.temasDificiles.map((t) => `${t.tema} (${t.veces})`).join(', ')}</p>
          )}
          {r.nivelesDificiles.length > 0 && (
            <p className="chico" style={{ margin: 0 }}><b>Niveles con más errores:</b> {r.nivelesDificiles.map((n) => nivelPorId(n.nivelId)?.nivel.nombre ?? n.nivelId).join(', ')}</p>
          )}
          <p className="suave chico" style={{ margin: 0 }}>Perfil creado el {new Date(r.creadaEn).toLocaleDateString('es-AR')}</p>
        </div>
      )}
    </section>
  );
}

function Tablero({ perfiles }: { perfiles: ResumenPerfil[] }) {
  const t = totales(perfiles);
  const orden = [...perfiles].sort((a, b) => (b.ultimoDia ?? '').localeCompare(a.ultimoDia ?? ''));
  return (
    <>
      <div className="grilla-2" style={{ gap: 8 }}>
        <Dato n={t.perfiles} texto="perfiles" />
        <Dato n={t.activos7} texto="jugaron esta semana" />
        <Dato n={minutos(t.minutos7)} texto="jugados esta semana" />
        <Dato n={minutos(t.minutosTotal)} texto="jugados en total" />
        <Dato n={t.grados} texto="grados completados" />
        <Dato n={t.perfiles ? minutos(Math.round(t.minutosTotal / t.perfiles)) : '0 min'} texto="en promedio por perfil" />
      </div>
      {t.temasDificiles.length > 0 && (
        <div className="tarjeta col" style={{ gap: 4 }}>
          <span className="etiqueta">Temas que más cuestan (últimos 14 días)</span>
          {t.temasDificiles.map((x) => <span key={x.tema} className="fila entre"><span>{x.tema}</span><b>{x.veces} errores</b></span>)}
        </div>
      )}
      <div className="tarjeta col" style={{ gap: 4 }}>
        <span className="etiqueta">Hasta dónde llegaron</span>
        {t.porMundo.map((m) => <span key={m.nombre} className="fila entre"><span>{m.nombre}</span><b>{m.perfiles} de {t.perfiles}</b></span>)}
      </div>
      {orden.map((r) => <Perfil key={r.id} r={r} />)}
    </>
  );
}

function Nube() {
  const [estado, setEstado] = useState<EstadoCreadora | null>(null);
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    perfilesDeTodos().then(setEstado);
  }, []);
  async function entrar(ev: FormEvent) {
    ev.preventDefault();
    const r = await conectar(email.trim(), clave);
    if (r !== 'ok') return setAviso(r === 'confirmar-correo' ? 'Revisá tu correo para confirmar la cuenta y volvé a entrar.' : 'No pudimos entrar. Revisá el correo y la contraseña.');
    setEstado(await perfilesDeTodos());
  }
  if (!estado) return <p className="suave">Buscando los perfiles…</p>;
  if (estado.tipo === 'sin-nube')
    return (
      <p className="aviso-caja amarillo">
        Para ver los perfiles de todos los celulares hace falta activar la nube (paso 2 de NECESITO_DE_GA.md). Mientras tanto, en «Este celular» ves los perfiles de este aparato.
      </p>
    );
  if (estado.tipo === 'sin-sesion')
    return (
      <form className="tarjeta col" style={{ gap: 10 }} onSubmit={entrar}>
        <p style={{ margin: 0 }}>Entrá con la cuenta de la creadora para ver todos los perfiles.</p>
        <label className="campo"><span>Correo</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="campo"><span>Contraseña</span><input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" /></label>
        {aviso && <p className="campo aviso" role="alert">{aviso}</p>}
        <button className="boton ancho" disabled={!email || clave.length < 6}>Entrar</button>
      </form>
    );
  if (estado.tipo === 'no-creadora') return <p className="aviso-caja amarillo">Esta cuenta no es la de la creadora del juego.</p>;
  if (estado.tipo === 'error') return <p className="aviso-caja amarillo">No pudimos traer los perfiles. Probá de nuevo en un ratito.</p>;
  if (!estado.perfiles.length) return <p className="suave">Todavía no hay perfiles en la nube.</p>;
  return <Tablero perfiles={estado.perfiles} />;
}

export function Creadora() {
  const e = useEstado();
  const [vista, setVista] = useState<'celular' | 'todos'>('celular');
  const locales = e.jugadoras.map((j) => resumirJugadora(j));
  return (
    <main className="pantalla angosta" style={{ gap: 12 }}>
      <div className="fila" style={{ gap: 8 }}>
        <BotonVolver a="/ajustes" />
        <h1>Panel de creadora</h1>
      </div>
      <div className="fila" style={{ gap: 8 }} role="tablist">
        <button className="chip" role="tab" aria-selected={vista === 'celular'} onClick={() => setVista('celular')}>Este celular</button>
        <button className="chip" role="tab" aria-selected={vista === 'todos'} onClick={() => setVista('todos')}>Todos los celulares</button>
      </div>
      {vista === 'celular' ? <Tablero perfiles={locales} /> : <Nube />}
      <p className="suave chico">Solo se ve el apodo, el grado escolar y el avance en el juego. Nada de nombres reales, fotos ni datos de contacto.</p>
    </main>
  );
}
