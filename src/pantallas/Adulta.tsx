// Cuenta de la adulta: se crea una vez y protege el panel y los cambios del perfil.
import { type FormEvent, useState } from 'react';
import { Chispa } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { config } from '../content';
import { cambiarClaveAdulta, crearCuenta, useEstado, verificarAdulta } from '../datos/estado';
import { BotonVolver } from '../ui/comunes';
import { ir } from '../ui/router';

function Encabezado() {
  return (
    <div className="fila entre">
      <div className="fila">
        <Chispa size={44} />
        <span className="titulo" style={{ color: 'var(--violeta)', fontSize: 22 }}>mateAventuras</span>
      </div>
      <span className="pildora" style={{ border: '2px solid var(--violeta)', color: 'var(--violeta)', background: '#fff', fontSize: 16 }}>
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
      <h1>Creá tu cuenta de persona adulta</h1>
      <p className="suave">Con esta contraseña vas a entrar al panel, ver el progreso y cuidar los perfiles de quienes juegan.</p>
      <form className="tarjeta col" style={{ gap: 16 }} onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="correo">Tu correo</label>
          <input id="correo" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <span className="ayuda">Es tuyo, no de quien juega. No mandamos publicidad.</span>
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

/**
 * "Me olvidé la contraseña". La contraseña vive solo en este celular (no hay mail para recuperarla),
 * así que se crea una nueva después de una cuenta difícil para alguien de 8 años (control parental).
 */
function NuevaClave({ alTerminar, alCancelar }: { alTerminar: () => void; alCancelar: () => void }) {
  const [reto] = useState(() => {
    const a = 13 + Math.floor(Math.random() * 15);
    const b = 6 + Math.floor(Math.random() * 4);
    const c = 11 + Math.floor(Math.random() * 30);
    return { texto: `${a} × ${b} + ${c}`, r: a * b + c };
  });
  const [respuesta, setRespuesta] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [error, setError] = useState('');
  const min = config.app.contrasenaAdultaMin;
  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (Number(respuesta.trim()) !== reto.r) return setError('Esa no es la cuenta. Probá de nuevo.');
    if (clave.length < min) return setError(`La contraseña nueva necesita al menos ${min} caracteres.`);
    if (clave !== clave2) return setError('Las dos contraseñas no son iguales.');
    await cambiarClaveAdulta(clave);
    alTerminar();
  }
  return (
    <form className="tarjeta col" style={{ gap: 16 }} onSubmit={enviar} noValidate>
      <p style={{ margin: 0 }}>Creá una contraseña nueva. Los perfiles y todo lo jugado quedan igual.</p>
      <div className="campo">
        <label htmlFor="reto">Solo para personas adultas: ¿cuánto es {reto.texto}?</label>
        <input id="reto" inputMode="numeric" autoComplete="off" value={respuesta} onChange={(ev) => setRespuesta(ev.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="clave-nueva">Contraseña nueva</label>
        <input id="clave-nueva" type="password" autoComplete="new-password" value={clave} onChange={(ev) => setClave(ev.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="clave-nueva2">Repetí la contraseña nueva</label>
        <input id="clave-nueva2" type="password" autoComplete="new-password" value={clave2} onChange={(ev) => setClave2(ev.target.value)} />
      </div>
      {error && <p className="campo aviso" role="alert">{error}</p>}
      <button className="boton ancho">Guardar y entrar</button>
      <button type="button" className="boton-link" onClick={alCancelar}>Volver</button>
    </form>
  );
}

/** Pide la contraseña de la adulta antes de entrar a una zona protegida. */
export function EntrarAdulta({ destino }: { destino: string }) {
  const e = useEstado();
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [olvido, setOlvido] = useState(false);
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
        <h2>Entrar como persona adulta</h2>
      </div>
      {olvido ? (
        <NuevaClave alTerminar={() => ir(destino, true)} alCancelar={() => setOlvido(false)} />
      ) : (
      <form className="tarjeta col" style={{ gap: 16 }} onSubmit={enviar}>
        <p className="suave">Cuenta: {e.cuenta.email}</p>
        <div className="campo">
          <label htmlFor="clave-adulta">Contraseña de la persona adulta</label>
          <input id="clave-adulta" type="password" autoComplete="current-password" value={clave} onChange={(ev) => setClave(ev.target.value)} autoFocus />
        </div>
        {error && <p className="campo aviso" role="alert">{error}</p>}
        <button className="boton ancho">Entrar</button>
        <button type="button" className="boton-link" onClick={() => setOlvido(true)}>Me olvidé la contraseña</button>
      </form>
      )}
    </main>
  );
}

export { Encabezado as EncabezadoAdulta };
