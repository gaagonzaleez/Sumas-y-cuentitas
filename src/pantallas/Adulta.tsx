// Cuenta de la adulta: se crea una vez y protege el panel y los cambios del perfil.
import { type FormEvent, useState } from 'react';
import { Chispa } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { config } from '../content';
import { crearCuenta, useEstado, verificarAdulta } from '../datos/estado';
import { BotonVolver } from '../ui/comunes';
import { ir } from '../ui/router';

function Encabezado() {
  return (
    <div className="fila entre">
      <div className="fila">
        <Chispa size={44} />
        <span className="titulo" style={{ color: 'var(--violeta)', fontSize: 22 }}>mateAventuras</span>
      </div>
      <span className="pildora" style={{ border: '2px solid var(--violeta)', color: 'var(--violeta)', background: '#fff', fontSize: 14 }}>
        Para mamá o papá
      </span>
    </div>
  );
}

export function CrearCuenta() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const min = config.app.contrasenaAdultaMin;

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Revisá el correo: falta algo.');
    if (clave.length < min) return setError(`La contraseña necesita al menos ${min} caracteres.`);
    if (clave !== clave2) return setError('Las dos contraseñas no son iguales.');
    setEnviando(true);
    await crearCuenta(email, clave);
    ir('/adulta/perfil', true);
  }

  return (
    <main className="pantalla angosta">
      <Encabezado />
      <h1>Creá tu cuenta de adulta</h1>
      <p className="suave">Con esta contraseña vas a entrar al panel, ver el progreso y cuidar el perfil de tu hija.</p>
      <form className="tarjeta col" style={{ gap: 16 }} onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="correo">Tu correo</label>
          <input id="correo" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <span className="ayuda">Es tuyo, no de la nena. No mandamos publicidad.</span>
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="clave2">Repetí la contraseña</label>
          <input id="clave2" type="password" autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} />
        </div>
        {error && <p className="campo aviso" role="alert"><Icono nombre="foco" size={20} />{error}</p>}
        <button className="boton ancho" disabled={enviando}>Seguir</button>
      </form>
    </main>
  );
}

/** Pide la contraseña de la adulta antes de entrar a una zona protegida. */
export function EntrarAdulta({ destino }: { destino: string }) {
  const e = useEstado();
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  if (!e.cuenta) {
    ir('/adulta/cuenta', true);
    return null;
  }
  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (await verificarAdulta(clave)) ir(destino, true);
    else setError('Esa no es la contraseña. Probá de nuevo.');
  }
  return (
    <main className="pantalla angosta">
      <div className="fila">
        <BotonVolver />
        <h2>Entrar como adulta</h2>
      </div>
      <form className="tarjeta col" style={{ gap: 16 }} onSubmit={enviar}>
        <p className="suave">Cuenta: {e.cuenta.email}</p>
        <div className="campo">
          <label htmlFor="clave-adulta">Contraseña de la adulta</label>
          <input id="clave-adulta" type="password" autoComplete="current-password" value={clave} onChange={(ev) => setClave(ev.target.value)} autoFocus />
        </div>
        {error && <p className="campo aviso" role="alert">{error}</p>}
        <button className="boton ancho">Entrar</button>
      </form>
    </main>
  );
}

export { Encabezado as EncabezadoAdulta };
