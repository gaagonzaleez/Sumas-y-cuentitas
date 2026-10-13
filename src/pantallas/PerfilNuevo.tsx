// Pantalla 1: la adulta crea el perfil de la nena (apodo, grupo, grado, consentimiento).
import { type FormEvent, useState } from 'react';
import { Icono } from '../art/Iconos';
import { config } from '../content';
import { limpiarApodo, MENSAJES_APODO, validarApodo } from '../engine/apodo';
import { crearJugadora, salirAdulta, useEstado } from '../datos/estado';
import { normalizarCodigo, validarCodigo } from '../datos/grupos';
import { ir } from '../ui/router';
import { EncabezadoAdulta } from './Adulta';

export function PerfilNuevo() {
  const e = useEstado();
  const [apodo, setApodo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [grado, setGrado] = useState(config.app.grados[1]);
  const [acepto, setAcepto] = useState(false);
  const [tocado, setTocado] = useState(false);
  const problema = validarApodo(apodo);
  const codigoMal = codigo.trim() !== '' && !validarCodigo(codigo);
  const lleno = e.jugadoras.length >= config.app.maxPerfiles;

  const [enviando, setEnviando] = useState(false);
  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    setTocado(true);
    if (problema || codigoMal || !acepto || lleno || enviando) return;
    setEnviando(true);
    await crearJugadora(limpiarApodo(apodo), grado, codigo.trim() ? normalizarCodigo(codigo) : undefined);
    ir('/dibujos', true);
    // El celular pasa a la nena: lo de la adulta vuelve a pedir contraseña. Se cierra después de
    // cambiar de pantalla (si no, la pantalla del perfil pedía la contraseña otra vez).
    setTimeout(salirAdulta, 0);
  }

  return (
    <main className="pantalla angosta">
      <EncabezadoAdulta />
      <div className="col" style={{ gap: 6 }}>
        <h1>Creá el perfil de la nena</h1>
        <p className="suave">Solo lo hacés una vez. Después ella entra sola y empieza a jugar.</p>
      </div>
      <form className="col" style={{ gap: 16 }} onSubmit={enviar} noValidate>
        <div className="tarjeta col" style={{ gap: 16 }}>
          <div className="campo">
            <label htmlFor="apodo">Apodo de juego</label>
            <input id="apodo" value={apodo} maxLength={config.app.apodo.max + 4} placeholder="Estrellita" autoComplete="off" onChange={(ev) => setApodo(ev.target.value)} onBlur={() => setTocado(true)} aria-describedby="apodo-ayuda" aria-invalid={tocado && !!problema} />
            <span id="apodo-ayuda" className="ayuda">No uses su nombre real ni apellido.</span>
            {tocado && problema && <span className="aviso" role="alert"><Icono nombre="foco" size={18} />{MENSAJES_APODO[problema]}</span>}
          </div>
          <div className="campo">
            <label htmlFor="codigo">Código del grupo</label>
            <input id="codigo" value={codigo} placeholder="LUNA-4821" autoComplete="off" autoCapitalize="characters" style={{ fontFamily: 'var(--fuente-titulo)', letterSpacing: 3 }} onChange={(ev) => setCodigo(ev.target.value.toUpperCase())} />
            <span className="ayuda">Te lo pasó quien armó el grupo. Si no tenés, podés jugar sin grupo.</span>
            {codigoMal && <span className="aviso" role="alert">El código tiene una palabra, un guion y 4 números. Por ejemplo: LUNA-4821.</span>}
          </div>
          <div className="campo">
            <label htmlFor="grado">Grado</label>
            <select id="grado" value={grado} onChange={(ev) => setGrado(ev.target.value)}>
              {config.app.grados.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <label className="casilla">
          <input type="checkbox" checked={acepto} onChange={(ev) => setAcepto(ev.target.checked)} />
          <span>Acepto que la nena juegue con apodo y avatar, sin fotos ni datos personales. El apodo y el avance pueden guardarse en la nube del juego para mejorarlo.</span>
        </label>
        {tocado && !acepto && <p className="campo aviso" role="alert">Para seguir, marcá que aceptás.</p>}
        {lleno && <p className="campo aviso" role="alert">Ya hay {config.app.maxPerfiles} perfiles en este dispositivo.</p>}
        <button className="boton ancho">Crear perfil</button>
      </form>
    </main>
  );
}
