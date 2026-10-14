// Pantalla 15: entrar con 3 dibujos secretos (y elegirlos la primera vez).
import { useEffect, useState } from 'react';
import { AvatarSVG } from '../art/Avatar';
import { Chispa } from '../art/Guias';
import { DibujoSecreto } from '../art/Dibujos';
import { Icono } from '../art/Iconos';
import { config } from '../content';
import { DIBUJOS } from '../content/catalogo';
import { alEntrar, comprobarDibujos, definirDibujos, useJugadora } from '../datos/estado';
import { decir, sonido } from '../audio/voz';
import { ir } from '../ui/router';

const N = () => config.app.dibujosSecretos;

function Teclado({ elegidos, alTocar }: { elegidos: string[]; alTocar: (id: string) => void }) {
  return (
    <div className="grilla-3" style={{ maxWidth: 340, margin: '0 auto', width: '100%' }}>
      {DIBUJOS.map((d) => {
        const ultimo = elegidos[elegidos.length - 1] === d.id;
        return (
          <button key={d.id} className="tarjeta centro" onClick={() => alTocar(d.id)} aria-label={d.nombre}
            style={{ display: 'flex', height: 92, padding: 8, border: `3px solid ${ultimo ? 'var(--violeta)' : 'var(--lavanda)'}`, background: ultimo ? 'var(--lavanda)' : '#fff' }}>
            <DibujoSecreto id={d.id} size={56} />
          </button>
        );
      })}
    </div>
  );
}

function Casillas({ elegidos }: { elegidos: string[] }) {
  return (
    <div className="fila" style={{ justifyContent: 'center', gap: 12 }} aria-label={`${elegidos.length} de ${N()} dibujos`}>
      {Array.from({ length: N() }, (_, i) => (
        <div key={i} style={{ width: 76, height: 76, borderRadius: 18, border: elegidos[i] ? '3px solid var(--violeta)' : '3px dashed #9C8FC4', background: elegidos[i] ? 'var(--lavanda)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {elegidos[i] && <DibujoSecreto id={elegidos[i]} size={50} />}
        </div>
      ))}
    </div>
  );
}

export function Entrar() {
  const j = useJugadora();
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');
  const consigna = 'Tocá tus 3 dibujos secretos';
  useEffect(() => {
    if (j) decir(`¡Hola! ${consigna}.`);
  }, [j]);
  if (!j) {
    ir('/perfiles', true);
    return null;
  }
  if (!j.dibujosHash) {
    ir('/dibujos', true);
    return null;
  }
  async function tocar(id: string) {
    // Mientras se comprueban los 3 dibujos, los toques de más no cuentan.
    if (elegidos.length >= N()) return;
    sonido('toque');
    const nuevos = [...elegidos, id];
    setElegidos(nuevos);
    setMensaje('');
    if (nuevos.length === N()) {
      if (await comprobarDibujos(nuevos)) {
        await alEntrar();
        ir('/inicio', true);
      } else {
        setMensaje('¡Casi! Esos no eran. Probá otra vez despacito.');
        decir('¡Casi! Probemos de nuevo juntas.');
        setElegidos([]);
      }
    }
  }
  return (
    <main className="pantalla angosta centro col">
      {j.avatar ? <AvatarSVG avatar={j.avatar} size={96} modo="busto" /> : <Chispa size={90} />}
      <h1>¡Hola, {j.apodo}!</h1>
      <div className="fila" style={{ justifyContent: 'center' }}>
        <p style={{ fontWeight: 800 }}>{consigna}</p>
        <button className="boton-icono violeta" onClick={() => decir(consigna, { forzar: true })} aria-label="Escuchar"><Icono nombre="altavoz" /></button>
      </div>
      <Casillas elegidos={elegidos} />
      {mensaje && <p className="aviso-caja naranja" role="alert">{mensaje}</p>}
      <Teclado elegidos={elegidos} alTocar={tocar} />
      <button className="boton-link" onClick={() => setElegidos([])}>Borrar y empezar de nuevo</button>
      <div className="empuja" />
      <p className="suave chico">
        <a href="#/perfiles" className="boton-link" style={{ color: 'var(--tinta-suave)' }}>No soy {j.apodo}</a>·
        <a href="#/adulta/entrar?a=/adulta/panel" className="boton-link" style={{ color: 'var(--tinta-suave)' }}>Entrar como persona adulta</a>
      </p>
    </main>
  );
}

/** La primera vez: la nena elige sus 3 dibujos y los repite para confirmar. */
export function ElegirDibujos() {
  const j = useJugadora();
  const [primera, setPrimera] = useState<string[] | null>(null);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');
  const texto = primera ? 'Ahora tocalos otra vez, en el mismo orden.' : 'Elegí 3 dibujos secretos. Acordate el orden: son tu contraseña.';
  useEffect(() => {
    decir(texto);
  }, [texto]);
  if (!j) {
    ir('/perfiles', true);
    return null;
  }
  async function tocar(id: string) {
    // Mientras se comprueban los 3 dibujos, los toques de más no cuentan.
    if (elegidos.length >= N()) return;
    sonido('toque');
    const nuevos = [...elegidos, id];
    setElegidos(nuevos);
    if (nuevos.length < N()) return;
    if (!primera) {
      setPrimera(nuevos);
      setElegidos([]);
      return;
    }
    if (nuevos.join() === primera.join()) {
      await definirDibujos(nuevos);
      await alEntrar();
      ir('/inicio', true);
    } else {
      setMensaje('¡Casi! No eran iguales. Elegí tus 3 dibujos otra vez.');
      setPrimera(null);
      setElegidos([]);
    }
  }
  return (
    <main className="pantalla angosta centro col">
      <Chispa size={80} expr="feliz" />
      <h1>{j.apodo}, elegí tu contraseña</h1>
      <p style={{ fontWeight: 800 }}>{texto}</p>
      <Casillas elegidos={elegidos} />
      {mensaje && <p className="aviso-caja naranja" role="alert">{mensaje}</p>}
      <Teclado elegidos={elegidos} alTocar={tocar} />
      <button className="boton-link" onClick={() => { setElegidos([]); setPrimera(null); }}>Borrar y empezar de nuevo</button>
    </main>
  );
}
