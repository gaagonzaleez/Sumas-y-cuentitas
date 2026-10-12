import { Chispa } from './art/Guias';

export function App() {
  return (
    <div className="app">
      <main className="pantalla angosta centro col">
        <div className="empuja" />
        <Chispa size={140} expr="feliz" className="rebota" />
        <h1 style={{ fontSize: 44, color: 'var(--violeta)' }}>mateAventuras</h1>
        <p className="suave">Aventuras de matemática con tu avatar y tu mascota.</p>
        <div className="empuja" />
        <button className="boton ancho">¡Empezar!</button>
      </main>
    </div>
  );
}
