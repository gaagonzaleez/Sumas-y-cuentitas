// Lo que se muestra en la pantalla de festejo después de terminar un grado.
import type { Premios } from '../datos/juego';

export interface DatosFestejo extends Premios {
  nivelId: string;
  grado: number;
  estrellasGrado: number;
  repaso?: boolean;
}

let ultimo: DatosFestejo | null = null;
export const guardarFestejo = (d: DatosFestejo) => {
  ultimo = d;
};
export const leerFestejo = () => ultimo;
