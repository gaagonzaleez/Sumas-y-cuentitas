// Pantalla 4: elegir la guía (Chispa, Seño Cande o Lucho). Se puede cambiar cuando quiera.
import { useState } from 'react';
import { Guia as DibujoGuia } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { FRASES, type Guia } from '../content/catalogo';
import { actualizar, useJugadora } from '../datos/estado';
import { configurarVoz, decir } from '../audio/voz';
import { ir } from '../ui/router';

const INFO: Record<Guia, { nombre: string; desc: string; escuchar: string }> = {
  chispa: { nombre: 'Chispa', desc: 'Estrellita mágica, divertida y cariñosa.', escuchar: 'Escuchar a Chispa' },
  cande: { nombre: 'Seño Cande', desc: 'Maestra simpática que anima y da pistas con paciencia.', escuchar: 'Escuchar a la Seño Cande' },
  lucho: { nombre: 'Lucho', desc: 'Carpincho explorador, tranquilo y muy gracioso.', escuchar: 'Escuchar a Lucho' },
};

export function ElegirGuia() {
  const j = useJugadora();
  const [elegida, setElegida] = useState<Guia>(j?.guia ?? 'chispa');
  if (!j) return null;
  const primeraVez = !j.guia;

  function escuchar(g: Guia) {
    setElegida(g);
    configurarVoz(g, j!.ajustes.silencio);
    decir(FRASES[g].presentacion as string, { forzar: true });
  }

  async function confirmar() {
    await actualizar((x) => ({ ...x, guia: elegida }));
    configurarVoz(elegida, j!.ajustes.silencio);
    ir(primeraVez ? '/avatar' : '/ajustes', true);
  }

  return (
    <main className="pantalla angosta">
      <div className="col" style={{ gap: 6 }}>
        <h1>¿Quién te acompaña?</h1>
        <p className="suave">Te va a leer las consignas y festejar cada logro. Podés cambiar cuando quieras.</p>
      </div>
      {(['chispa', 'cande', 'lucho'] as Guia[]).map((g) => {
        const sel = elegida === g;
        return (
          <section key={g} className="tarjeta col" style={{ border: `4px solid ${sel ? 'var(--violeta)' : 'var(--lavanda)'}`, position: 'relative', gap: 12 }}>
            {sel && <span className="pildora violeta chica" style={{ position: 'absolute', top: -14, right: 16 }}>Elegida</span>}
            <button className="fila" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0, gap: 14 }} onClick={() => setElegida(g)} aria-pressed={sel}>
              <DibujoGuia guia={g} size={92} expr={sel ? 'feliz' : 'contenta'} />
              <span className="col" style={{ gap: 2 }}>
                <span className="titulo" style={{ fontSize: 28 }}>{INFO[g].nombre}</span>
                <span className="suave">{INFO[g].desc}</span>
              </span>
            </button>
            <p className="burbuja" style={{ background: 'var(--fondo)', borderRadius: 16 }}>“{FRASES[g].presentacion as string}”</p>
            <button className="boton borde chico ancho" onClick={() => escuchar(g)}>
              <Icono nombre="play" /> {INFO[g].escuchar}
            </button>
          </section>
        );
      })}
      <div className="empuja" />
      <button className="boton ancho" onClick={confirmar}>¡A jugar con {INFO[elegida].nombre}!</button>
    </main>
  );
}
