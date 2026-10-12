import { Component, type ReactNode, useEffect } from 'react';
import { Guia } from './art/Guias';
import { configurarVoz } from './audio/voz';
import { iniciar, useEstado, useJugadora } from './datos/estado';
import { iniciarNube } from './datos/nube';
import { Jugar } from './juego/Jugar';
import { Ajustes } from './pantallas/Ajustes';
import { CrearCuenta, EntrarAdulta } from './pantallas/Adulta';
import { AvatarEditor } from './pantallas/AvatarEditor';
import { Bienvenida } from './pantallas/Bienvenida';
import { ElegirMascota } from './pantallas/ElegirMascota';
import { ElegirDibujos, Entrar } from './pantallas/Entrar';
import { Festejo } from './pantallas/Festejo';
import { Galeria } from './pantallas/Galeria';
import { Grupo } from './pantallas/Grupo';
import { ElegirGuia } from './pantallas/Guia';
import { Mapa } from './pantallas/Mapa';
import { MiMascota } from './pantallas/MiMascota';
import { Mundo } from './pantallas/Mundo';
import { Nivel } from './pantallas/Nivel';
import { Panel } from './pantallas/Panel';
import { PerfilNuevo } from './pantallas/PerfilNuevo';
import { Perfiles } from './pantallas/Perfiles';
import { Tienda } from './pantallas/Tienda';
import { Cargando } from './ui/comunes';
import { coincide, ir, useRuta } from './ui/router';

class Atrapar extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="pantalla angosta centro col">
        <div className="empuja" />
        <Guia guia="chispa" size={110} expr="pensando" />
        <h1>¡Uy! Algo se trabó</h1>
        <p className="suave">No se perdió nada: todo está guardado.</p>
        <button className="boton ancho" onClick={() => { this.setState({ error: false }); ir('/mapa'); }}>Volver al mapa</button>
        <div className="empuja" />
      </main>
    );
  }
}

/** Pasos del primer ingreso: dibujos → guía → avatar → mascota → mapa. */
function siguientePaso(j: ReturnType<typeof useJugadora>): string {
  if (!j) return '/perfiles';
  if (!j.dibujosHash) return '/dibujos';
  if (!j.guia) return '/guia';
  if (!j.avatar) return '/avatar';
  if (!j.mascota) return '/mascota/elegir';
  return '/mapa';
}

const RUTAS_LIBRES = ['/', '/adulta/cuenta', '/adulta/perfil', '/adulta/entrar', '/adulta/panel', '/perfiles', '/entrar', '/dibujos', '/galeria'];

function Rutas() {
  const ruta = useRuta();
  const e = useEstado();
  const j = useJugadora();
  const camino = ruta.split('?')[0];
  const query = new URLSearchParams(ruta.split('?')[1] ?? '');

  useEffect(() => {
    if (j) configurarVoz(j.guia ?? 'chispa', j.ajustes.silencio);
  }, [j?.guia, j?.ajustes.silencio]); // eslint-disable-line react-hooks/exhaustive-deps

  if (e.cargando) return <Cargando />;
  if (e.error) {
    return (
      <main className="pantalla angosta centro col">
        <Guia guia="chispa" size={100} expr="pensando" />
        <h1>No pudimos abrir el juego</h1>
        <p className="suave">Puede que el navegador esté en modo privado. Probá abrirlo en una ventana normal.</p>
      </main>
    );
  }

  // Zonas sin necesidad de que la nena haya entrado.
  if (camino === '/' && !e.cuenta && e.jugadoras.length === 0) return <Bienvenida />;
  if (camino === '/') {
    ir(e.jugadoras.length ? (e.adentro ? '/mapa' : '/perfiles') : e.cuenta ? '/adulta/perfil' : '/', true);
    return e.jugadoras.length ? null : <Bienvenida />;
  }
  if (camino === '/galeria') return <Galeria />;
  if (camino === '/adulta/cuenta') return e.cuenta ? (ir('/adulta/perfil', true), null) : <CrearCuenta />;
  if (camino === '/adulta/entrar') return <EntrarAdulta destino={query.get('a') ?? '/adulta/panel'} />;
  if (camino === '/adulta/perfil') {
    if (!e.cuenta) return (ir('/adulta/cuenta', true), null);
    if (!e.adultaAdentro) return (ir('/adulta/entrar?a=/adulta/perfil', true), null);
    return <PerfilNuevo />;
  }
  if (camino === '/adulta/panel') return <Panel />;
  if (camino === '/perfiles') return <Perfiles />;
  if (camino === '/entrar') return <Entrar />;
  if (camino === '/dibujos') return <ElegirDibujos />;

  // Desde acá, la nena tiene que haber entrado con sus dibujos.
  if (!j) return (ir('/perfiles', true), null);
  if (!e.adentro) return (ir(j.dibujosHash ? '/entrar' : '/dibujos', true), null);
  if (camino === '/inicio') return (ir(siguientePaso(j), true), null);
  if (camino === '/guia') return <ElegirGuia />;
  if (!j.guia) return (ir('/guia', true), null);
  if (camino === '/avatar') return <AvatarEditor />;
  if (!j.avatar) return (ir('/avatar', true), null);
  if (camino === '/mascota/elegir') return <ElegirMascota />;
  if (!j.mascota) return (ir('/mascota/elegir', true), null);

  if (camino === '/mapa') return <Mapa />;
  if (camino === '/mascota') return <MiMascota />;
  if (camino === '/tienda') return <Tienda />;
  if (camino === '/grupo') return <Grupo />;
  if (camino === '/ajustes') return <Ajustes />;
  if (camino === '/festejo') return <Festejo />;
  let p = coincide('/mundo/:id', camino);
  if (p) return <Mundo id={p.id} />;
  p = coincide('/nivel/:id', camino);
  if (p) return <Nivel id={p.id} />;
  p = coincide('/jugar/:id/:grado', camino);
  if (p) return <Jugar key={ruta} nivelId={p.id} grado={Math.min(5, Math.max(1, Number(p.grado) || 1))} />;
  p = coincide('/repaso/:tag', camino);
  if (p) return <Jugar key={ruta} nivelId="repaso" grado={1} repasoTag={p.tag} />;
  if (!RUTAS_LIBRES.includes(camino)) ir('/mapa', true);
  return null;
}

export function App() {
  useEffect(() => {
    iniciar().then(iniciarNube);
  }, []);
  return (
    <div className="app">
      <Atrapar>
        <Rutas />
      </Atrapar>
    </div>
  );
}
