// Elegir perfil cuando hay más de una nena en el dispositivo.
import { AvatarCirculo } from '../art/Avatar';
import { Chispa } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { elegirJugadora, useEstado } from '../datos/estado';
import { ir } from '../ui/router';

export function Perfiles() {
  const e = useEstado();
  return (
    <main className="pantalla angosta">
      <div className="fila"><Chispa size={52} /><h1>¿Quién va a jugar?</h1></div>
      {e.jugadoras.length === 0 && (
        <div className="tarjeta col centro">
          <p>Todavía no hay perfiles en este dispositivo.</p>
        </div>
      )}
      <div className="col">
        {e.jugadoras.map((j) => (
          <button key={j.id} className="tarjeta fila" style={{ border: '3px solid var(--lavanda)', minHeight: 76, textAlign: 'left' }} onClick={() => { elegirJugadora(j.id); ir('/entrar'); }}>
            {j.avatar ? <AvatarCirculo avatar={j.avatar} size={56} /> : <Chispa size={56} />}
            <span className="titulo" style={{ fontSize: 24, flex: 1 }}>{j.apodo}</span>
            <Icono nombre="adelante" />
          </button>
        ))}
      </div>
      <div className="empuja" />
      <button className="boton blanco ancho" onClick={() => ir(e.adultaAdentro ? '/adulta/perfil' : '/adulta/entrar?a=/adulta/perfil')}>
        <Icono nombre="usuaria" /> Agregar otra nena (adulta)
      </button>
    </main>
  );
}
