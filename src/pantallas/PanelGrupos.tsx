// Parte del panel de la adulta: conectar a la nube, crear y organizar grupos.
import { useEffect, useState } from 'react';
import { Icono } from '../art/Iconos';
import { useEstado } from '../datos/estado';
import { bajarYMezclar, cerrarGrupo, conectar, crearGrupo, desconectar, type GrupoMio, misGrupos, nubeConfigurada, quitarJugadora, sesionNube } from '../datos/nube';
import { useEnLinea } from '../ui/comunes';

export function PanelGrupos() {
  const e = useEstado();
  const enLinea = useEnLinea();
  const [sesion, setSesion] = useState<{ email?: string } | null>(null);
  const [clave, setClave] = useState('');
  const [msg, setMsg] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupos, setGrupos] = useState<GrupoMio[]>([]);
  const [cargando, setCargando] = useState(false);

  async function refrescar() {
    const s = await sesionNube().catch(() => null);
    setSesion(s);
    if (s) setGrupos(await misGrupos().catch(() => []));
  }
  useEffect(() => {
    if (nubeConfigurada) refrescar();
  }, []);

  if (!nubeConfigurada) {
    return (
      <div className="tarjeta col" style={{ gap: 6 }}>
        <span style={{ fontWeight: 800 }}>Grupos y copia en la nube</span>
        <p className="suave chico">Todavía no están activados. Mientras tanto, todo se guarda en este dispositivo y se puede jugar sin internet.</p>
      </div>
    );
  }
  if (!enLinea) return <p className="aviso-caja naranja"><Icono nombre="wifi_no" /> Sin conexión: los grupos necesitan internet.</p>;

  async function entrar() {
    setCargando(true);
    const r = await conectar(e.cuenta?.email ?? '', clave);
    setCargando(false);
    setClave('');
    if (r === 'ok') {
      const n = await bajarYMezclar();
      setMsg(n ? `¡Conectada! Se trajeron ${n} perfiles de la nube.` : '¡Conectada! El progreso se guarda también en la nube.');
      refrescar();
    } else if (r === 'confirmar-correo') setMsg('Te mandamos un correo. Tocá el enlace para confirmar y después volvé a conectar.');
    else if (r === 'clave-incorrecta') setMsg('Ese correo ya tiene cuenta en la nube con otra contraseña.');
    else setMsg('No se pudo conectar. Probá de nuevo en un rato.');
  }

  return (
    <div className="tarjeta col" style={{ gap: 10 }}>
      <span style={{ fontWeight: 800 }}>Grupos y copia en la nube</span>
      {!sesion ? (
        <>
          <p className="suave chico">Conectá tu cuenta para jugar en grupo y seguir en otro dispositivo. Se guardan solo apodo, avatar, progreso y puntos.</p>
          <div className="campo">
            <label htmlFor="clave-nube">Contraseña de la persona adulta ({e.cuenta?.email})</label>
            <input id="clave-nube" type="password" value={clave} onChange={(ev) => setClave(ev.target.value)} />
          </div>
          <button className="boton chico" disabled={!clave || cargando} onClick={entrar}>Conectar</button>
        </>
      ) : (
        <>
          <p className="aviso-caja verde chico"><Icono nombre="tilde" size={18} /> Conectada como {sesion.email}</p>
          <div className="fila" style={{ gap: 8 }}>
            <input aria-label="Nombre del grupo nuevo" placeholder="Las Estrellitas" value={nombre} maxLength={30} onChange={(ev) => setNombre(ev.target.value)} style={{ flex: 1, height: 50, borderRadius: 14, border: '2px solid var(--lila)', padding: '0 12px', fontSize: 17 }} />
            <button className="boton chico" disabled={nombre.trim().length < 2} onClick={async () => { const c = await crearGrupo(nombre); setMsg(c ? `Grupo creado. Código: ${c}. Pasáselo a las otras familias.` : 'No se pudo crear el grupo.'); setNombre(''); refrescar(); }}>Crear grupo</button>
          </div>
          {grupos.map((g) => (
            <div key={g.id} className="col" style={{ gap: 6, borderTop: '2px solid var(--lavanda)', paddingTop: 8 }}>
              <div className="fila entre"><span style={{ fontWeight: 800 }}>{g.nombre}</span><span className="pildora estrellas chica" style={{ letterSpacing: 2 }}>{g.codigo}</span></div>
              {g.jugadoras.length === 0 && <span className="suave chico">Todavía no se sumó nadie.</span>}
              {g.jugadoras.map((p) => (
                <div key={p.id} className="fila entre"><span>{p.apodo}</span><button className="boton-link" onClick={async () => { await quitarJugadora(g.id, p.id); refrescar(); }}>Quitar</button></div>
              ))}
              <button className="boton-link" style={{ alignSelf: 'flex-start' }} onClick={async () => { await cerrarGrupo(g.id, !g.cerrado); refrescar(); }}>{g.cerrado ? 'Abrir el grupo' : 'Cerrar el grupo (nadie más puede entrar)'}</button>
            </div>
          ))}
          <button className="boton-link" style={{ alignSelf: 'flex-start' }} onClick={async () => { await desconectar(); refrescar(); }}>Desconectar</button>
        </>
      )}
      {msg && <p className="aviso-caja lila chico" role="status">{msg}</p>}
    </div>
  );
}
