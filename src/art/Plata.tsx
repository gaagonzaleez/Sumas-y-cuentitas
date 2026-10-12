// Billetes y monedas didácticos: valores simples, colores propios y sin imitar billetes reales.
const COLORES: Record<number, [string, string]> = {
  1000: ['#FFE3A0', '#C98A1F'],
  500: ['#D9F2C9', '#3E8A3A'],
  200: ['#FFD6DE', '#B8323D'],
  100: ['#E5D9FF', '#5B3FE0'],
  50: ['#CDE9FF', '#2C6BB0'],
  20: ['#D7F5EE', '#0B7A68'],
  10: ['#FFD9B0', '#A85200'],
};

export function esMonedaValor(v: number) {
  return v < 10;
}

export function Plata({ valor, size = 1 }: { valor: number; size?: number }) {
  if (esMonedaValor(valor)) {
    const r = 22 * size;
    return (
      <svg width={r * 2} height={r * 2} viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="20" fill={valor >= 5 ? '#E8D9A0' : '#E6E0F5'} stroke="#2B2350" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="15" fill="none" stroke="#2B2350" strokeWidth="1" strokeDasharray="2 2" />
        <text x="22" y="27.5" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="15" fill="#2B2350">${valor}</text>
      </svg>
    );
  }
  const [fondo, borde] = COLORES[valor] ?? COLORES[10];
  const w = 80 * size;
  return (
    <svg width={w} height={w * 0.55} viewBox="0 0 80 44" aria-hidden="true">
      <rect x="1.5" y="1.5" width="77" height="41" rx="7" fill={fondo} stroke="#2B2350" strokeWidth="2.5" />
      <rect x="6" y="6" width="68" height="32" rx="4" fill="none" stroke={borde} strokeWidth="1.5" />
      <circle cx="16" cy="22" r="7" fill="none" stroke={borde} strokeWidth="1.5" />
      <text x="48" y="29" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize={valor >= 1000 ? 15 : 18} fill="#2B2350">${valor}</text>
    </svg>
  );
}
