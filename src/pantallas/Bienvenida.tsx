import { Chispa, SenoCande } from '../art/Guias';
import { useEstado } from '../datos/estado';
import { ir } from '../ui/router';

export function Bienvenida() {
  const e = useEstado();
  return (
    <main className="pantalla angosta centro col">
      <div className="empuja" />
      <div className="fila" style={{ justifyContent: 'center', gap: 8 }}>
        <Chispa size={120} expr="feliz" className="rebota" />
        <SenoCande size={96} expr="contenta" />
      </div>
      <h1 style={{ fontSize: 46, color: 'var(--violeta)' }}>mateAventuras</h1>
      <p className="suave" style={{ fontSize: 19, maxWidth: 340 }}>
        Aventuras de matemática y finanzas con tu avatar y tu mascota.
      </p>
      <div className="empuja" />
      {e.cuenta ? (
        <button className="boton ancho" onClick={() => ir('/perfiles')}>¡A jugar!</button>
      ) : (
        <>
          <button className="boton ancho" onClick={() => ir('/adulta/cuenta')}>Empezar</button>
          <p className="suave chico">La primera vez, una persona adulta crea el perfil. Tarda 1 minuto.</p>
        </>
      )}
    </main>
  );
}
