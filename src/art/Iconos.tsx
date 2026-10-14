// Íconos de interfaz con trazo (nunca emojis). Lienzo 24 × 24.
import type { ReactNode } from 'react';

const P: Record<string, ReactNode> = {
  mapa: <><path d="M12 21s-6-5.5-6-10.5a6 6 0 0 1 12 0C18 15.5 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.3" /></>,
  huella: <><ellipse cx="12" cy="15.5" rx="4" ry="3.4" /><circle cx="6.5" cy="10" r="1.7" /><circle cx="9.7" cy="6.8" r="1.7" /><circle cx="14.3" cy="6.8" r="1.7" /><circle cx="17.5" cy="10" r="1.7" /></>,
  trofeo: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" /></>,
  bolsa: <><path d="M6 8h12l-1 12H7z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  moneda: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /></>,
  estrella: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />,
  candado: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  tilde: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cruz: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  atras: <path d="M15 5l-7 7 7 7" />,
  adelante: <path d="M9 5l7 7-7 7" />,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  altavoz: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  silencio: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
  manzana: <><path d="M12 7.5c-2-1.5-7-1.5-7 4 0 4 3 8.5 5 8.5 1 0 1.3-.6 2-.6s1 .6 2 .6c2 0 5-4.5 5-8.5 0-5.5-5-5.5-7-4z" /><path d="M12 7.5c0-2 1-3.5 3-4" /></>,
  pelota: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c-3 3-3 14 0 17M12 3.5c3 3 3 14 0 17" /></>,
  gorro: <><path d="M5 17a7 7 0 0 1 14 0z" /><path d="M3.5 17h17" /></>,
  bombita: <><path d="M9 14l-3 3M7 18l-1 1" /><path d="M14 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" /><circle cx="12" cy="15" r="2.5" /></>,
  foco: <><path d="M9 17.5h6M10 20.5h4M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1 1.5-1 2.5h-5c0-1-.2-1.9-1-2.5z" /></>,
  repetir: <><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4.5V9h-4.5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 19.5V15h4.5" /></>,
  ajustes: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  flecha_arriba: <path d="M12 19V5M6 11l6-6 6 6" />,
  flecha_abajo: <path d="M12 5v14M6 13l6 6 6-6" />,
  lapiz: <><path d="M4 20l1-4.5L15.5 5l3.5 3.5L8.5 19z" /><path d="M13.5 7l3.5 3.5" /></>,
  borrar: <><path d="M9 6h11v12H9l-6-6z" /><path d="M12 9.5l5 5M17 9.5l-5 5" /></>,
  usuaria: <><circle cx="12" cy="8" r="4" /><path d="M4 20.5a8 8 0 0 1 16 0" /></>,
  salir: <><path d="M14 4.5h4.5v15H14" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  regalo: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9h18M12 9v11" /><path d="M12 9C10 5 6.5 5 7 7.5 7.5 9 12 9 12 9zM12 9c2-4 5.5-4 5-1.5C16.5 9 12 9 12 9z" /></>,
  alcancia: <><path d="M4 12.5c0-3.5 3.5-6 8-6s8 2.5 8 6-2 4.5-3 5v2.5h-3v-1.5h-4v1.5H7V17.5c-1.5-1-3-2.5-3-5z" /><path d="M11 6.5V4.5h3M19.5 11.5h1.5" /><circle cx="8.5" cy="11" r=".6" /></>,
  wifi_no: <><path d="M3 8.5a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 15.5a4.5 4.5 0 0 1 6 0" /><circle cx="12" cy="19" r="1" /><path d="M4 4l16 16" /></>,
  reloj: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  corazon: <path d="M12 20s-8-5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20z" />,
  ropero: <><rect x="4.5" y="3.5" width="15" height="17" rx="1.5" /><path d="M12 3.5v17M10 11v2M14 11v2" /></>,
  lupa: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></>,
  gota: <path d="M12 3.5c3 4 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 3-6.5 6-10.5z" />,
  peine: <><path d="M4 9.5h16v3H4z" /><path d="M6 12.5v6M9 12.5v6M12 12.5v6M15 12.5v6M18 12.5v6" /></>,
  dados: <><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1" /><circle cx="15" cy="15" r="1" /><circle cx="15" cy="9" r="1" /><circle cx="9" cy="15" r="1" /></>,
  luna: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  botiquin: <><rect x="3.5" y="7" width="17" height="12.5" rx="2.5" /><path d="M9 7V5h6v2M12 10.5v5.5M9.25 13.25h5.5" /></>,
  copia: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></>,
};

export type NombreIcono = keyof typeof P;

export function Icono({ nombre, size = 24, grosor = 2.2, className }: { nombre: NombreIcono; size?: number; grosor?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {P[nombre]}
    </svg>
  );
}

export function Moneda({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="#FFC93C" stroke="#2B2350" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#2B2350" strokeWidth="1.8" />
    </svg>
  );
}

export function Estrella({ size = 24, llena = true }: { size?: number; llena?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8l2.8 5.8 6.3.8-4.6 4.4 1.1 6.3L12 17.1l-5.6 3 1.1-6.3L2.9 9.4l6.3-.8z" fill={llena ? '#FFC93C' : '#F3EEFF'} stroke="#2B2350" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
