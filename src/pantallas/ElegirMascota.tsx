// Pantalla 3: elegir y nombrar a la mascota. Las bloqueadas se compran con monedas.
import { useState } from 'react';
import { Icono } from '../art/Iconos';
import { MascotaSVG } from '../art/Mascota';
import { MASCOTAS, TIPOS_MASCOTA, frase } from '../content/catalogo';
import { limpiarApodo, MENSAJES_APODO, validarApodo } from '../engine/apodo';
import { useJugadora } from '../datos/estado';
import { comprarMascota, elegirMascota, tieneMascota } from '../datos/juego';
import { GuiaDice, Modal, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';
import { sonido } from '../audio/voz';

export function ElegirMascota() {
  const j = useJugadora();
  const [tipo, setTipo] = useState('todas');
  const [especie, setEspecie] = useState(j?.mascota?.especie ?? 'dragoncito');
  const [nombre, setNombre] = useState(j?.mascota?.nombre ?? '');
  const [comprar, setComprar] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  if (!j) return null;
  const guia = j.guia ?? 'chispa';
  const primeraVez = !j.mascota;
  const nombreLimpio = limpiarApodo(nombre);
  // El nombre de la mascota pasa el mismo filtro que los apodos (sin groserías ni datos).
  const problema = nombreLimpio ? validarApodo(nombreLimpio) : 'corto';
  const lista = MASCOTAS.filter((m) => tipo === 'todas' || m.tipo === tipo);

  async function confirmar() {
    if (problema) return;
    await elegirMascota(especie, nombreLimpio);
    sonido('festejo');
    ir(primeraVez ? '/mapa' : '/mascota', true);
  }

  async function comprarla() {
    if (!comprar) return;
    const r = await comprarMascota(comprar);
    if (r === 'ok') {
      setEspecie(comprar);
      sonido('festejo');
    } else if (r === 'sin-monedas') setAviso(frase(guia, 'sinMonedas'));
    setComprar(null);
  }

  return (
    <main className="pantalla angosta">
      <div className="fila entre">
        <h1>Elegí tu mascota</h1>
        <PildoraMonedas n={j.monedas} />
      </div>
      {aviso && <GuiaDice guia={guia} texto={aviso} />}
      <div className="chips" role="tablist">
        {TIPOS_MASCOTA.map((t) => <button key={t.id} role="tab" className="chip" aria-selected={tipo === t.id} onClick={() => setTipo(t.id)}>{t.nombre}</button>)}
      </div>
      <div className="grilla-2 ancha">
        {lista.map((m) => {
          const tiene = tieneMascota(j, m.id);
          const sel = especie === m.id;
          return (
            <button key={m.id} onClick={() => (tiene ? setEspecie(m.id) : setComprar(m.id))} aria-pressed={sel}
              aria-label={`${m.nombre}${tiene ? '' : `, cuesta ${m.precio} monedas`}`}
              style={{ position: 'relative', borderRadius: 22, padding: '12px 8px', background: tiene ? (sel ? 'var(--lavanda)' : '#fff') : '#F3EEFF', border: `4px ${tiene ? 'solid' : 'dashed'} ${sel ? 'var(--violeta)' : tiene ? 'var(--lavanda)' : '#9C8FC4'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {sel && <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--violeta)', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icono nombre="tilde" size={20} /></span>}
              {!tiene && <span className="pildora chica" style={{ position: 'absolute', top: 8, right: 8, background: 'var(--amarillo)' }}><Icono nombre="candado" size={14} /> {m.precio}</span>}
              <MascotaSVG especie={m.id} etapa="bebe" animo={sel ? 'contenta' : 'normal'} size={92} />
              <span style={{ fontWeight: 800 }}>{m.nombre}</span>
            </button>
          );
        })}
      </div>
      <div className="campo">
        <label htmlFor="nombre-mascota">Ponele un nombre</label>
        <input id="nombre-mascota" value={nombre} maxLength={16} placeholder="Dragui" onChange={(e) => setNombre(e.target.value)} />
        {nombre && problema && <span className="aviso" role="alert">{problema === 'nombre' ? 'Elegí un nombre de mascota, como Dragui o Pelusa.' : MENSAJES_APODO[problema]}</span>}
      </div>
      <button className="boton ancho" disabled={!!problema} onClick={confirmar}>
        {nombreLimpio && !problema ? `Quiero a ${nombreLimpio}` : 'Ponele un nombre'}
      </button>
      {comprar && (
        <Modal titulo="Comprar mascota" alCerrar={() => setComprar(null)}>
          <div className="centro col">
            <MascotaSVG especie={comprar} etapa="bebe" animo="contenta" size={110} />
            <h3>{MASCOTAS.find((m) => m.id === comprar)!.nombre}</h3>
          </div>
          {j.monedas >= MASCOTAS.find((m) => m.id === comprar)!.precio ? (
            <button className="boton ancho" onClick={comprarla}>Comprar por {MASCOTAS.find((m) => m.id === comprar)!.precio} monedas</button>
          ) : (
            <p className="aviso-caja amarillo">Te faltan {MASCOTAS.find((m) => m.id === comprar)!.precio - j.monedas} monedas. ¡Jugando las conseguís!</p>
          )}
          <button className="boton blanco ancho" onClick={() => setComprar(null)}>Ahora no</button>
        </Modal>
      )}
    </main>
  );
}
