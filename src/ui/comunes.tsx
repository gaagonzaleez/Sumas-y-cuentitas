// Piezas de interfaz compartidas.
import { type ReactNode, useEffect, useState } from 'react';
import { Estrella, Icono, Moneda, type NombreIcono } from '../art/Iconos';
import { Guia, type Expresion } from '../art/Guias';
import { ir } from './router';
import { decir, useAudioEstado } from '../audio/voz';
import type { Guia as NombreGuia } from '../content/catalogo';

export function PildoraMonedas({ n }: { n: number }) {
  return (
    <span className="pildora monedas" aria-label={n === 1 ? '1 moneda' : `${n} monedas`}>
      <Moneda size={24} /> {n}
    </span>
  );
}

export function PildoraEstrellas({ n }: { n: number }) {
  return (
    <span className="pildora estrellas" aria-label={`${n} estrellas`}>
      <Estrella size={24} /> {n}
    </span>
  );
}

export function Estrellas({ n, de = 3, size = 26 }: { n: number; de?: number; size?: number }) {
  return (
    <span className="fila" style={{ gap: 2 }} aria-label={`${n} de ${de} estrellas`}>
      {Array.from({ length: de }, (_, i) => <Estrella key={i} size={size} llena={i < n} />)}
    </span>
  );
}

export function BotonVolver({ a, etiqueta = 'Volver' }: { a?: string; etiqueta?: string }) {
  return (
    <button className="boton-icono" onClick={() => (a ? ir(a) : history.back())} aria-label={etiqueta}>
      <Icono nombre="atras" />
    </button>
  );
}

/** Burbuja de la guía con subtítulo siempre visible y botón para repetir el audio. */
export function GuiaDice({
  guia,
  texto,
  expr = 'contenta',
  autoLeer = true,
  tamGuia = 52,
}: {
  guia: NombreGuia;
  texto: string;
  expr?: Expresion;
  autoLeer?: boolean;
  tamGuia?: number;
}) {
  const audio = useAudioEstado();
  useEffect(() => {
    if (autoLeer && texto) decir(texto);
  }, [texto, autoLeer]);
  return (
    <div className="fila" style={{ alignItems: 'flex-start', gap: 12 }}>
      <Guia guia={guia} size={tamGuia} expr={expr} />
      <div className="burbuja fila" style={{ alignItems: 'center', gap: 10 }}>
        <p style={{ flex: 1 }} aria-live="polite">{texto}</p>
        <button
          className="boton-icono violeta"
          style={{ width: 52, height: 52 }}
          onClick={() => decir(texto, { forzar: true })}
          aria-label={audio.silencio ? 'La voz está apagada. Tocá para escuchar igual' : 'Escuchar otra vez'}
        >
          <Icono nombre={audio.silencio ? 'silencio' : 'altavoz'} />
        </button>
      </div>
    </div>
  );
}

export function MenuInferior({ actual }: { actual: 'mapa' | 'mascota' | 'grupo' | 'tienda' }) {
  const items: { id: typeof actual; ruta: string; texto: string; icono: NombreIcono }[] = [
    { id: 'mapa', ruta: '/mapa', texto: 'Aventura', icono: 'mapa' },
    { id: 'mascota', ruta: '/mascota', texto: 'Mascota', icono: 'huella' },
    { id: 'grupo', ruta: '/grupo', texto: 'Grupo', icono: 'trofeo' },
    { id: 'tienda', ruta: '/tienda', texto: 'Tienda', icono: 'bolsa' },
  ];
  return (
    <div className="menu">
      <nav aria-label="Menú principal">
        {items.map((i) => (
          <a key={i.id} href={`#${i.ruta}`} aria-current={actual === i.id ? 'page' : undefined}>
            <Icono nombre={i.icono} size={26} />
            {i.texto}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <main className="pantalla angosta centro col" aria-busy="true">
      <div className="empuja" />
      <Guia guia="chispa" size={96} expr="feliz" />
      <p className="suave" role="status">{texto}</p>
      <div className="empuja" />
    </main>
  );
}

export function Modal({ children, alCerrar, titulo }: { children: ReactNode; alCerrar?: () => void; titulo: string }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar?.();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [alCerrar]);
  return (
    <div className="modal-fondo" onClick={alCerrar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function useEnLinea(): boolean {
  const [en, setEn] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setEn(true);
    const off = () => setEn(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return en;
}

export function AvisoSinConexion() {
  const en = useEnLinea();
  if (en) return null;
  return (
    <div className="sin-conexion fila" style={{ justifyContent: 'center' }} role="status">
      <Icono nombre="wifi_no" size={20} /> Sin conexión: podés seguir jugando y se guarda todo.
    </div>
  );
}
