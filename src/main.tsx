import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles.css';
import { App } from './App';
import { registerSW } from 'virtual:pwa-register';
import { vigilarVersiones } from './actualizar';

// Service worker: guarda el juego para usarlo sin internet y busca versiones nuevas
// cada minuto y al volver a la app; cuando hay una, recarga sola.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registro) {
    if (!registro) return;
    const buscar = () => registro.update().catch(() => undefined);
    setInterval(buscar, 60_000);
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && buscar());
  },
});

// Plan B: si el service worker se traba, la app compara su versión con la publicada.
vigilarVersiones();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
