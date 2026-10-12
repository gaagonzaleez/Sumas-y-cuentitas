// Estampitas coleccionables: una por nivel completo (los 5 grados), con el escenario del mundo.
import { EscenaMundo } from './Mundos';

export function Estampita({ id, size = 64 }: { id: string; size?: number }) {
  const [, mundo, n] = id.match(/^estampita-(\w+)-(\d+)$/) ?? [];
  return (
    <span style={{ width: size, height: size * 1.25, borderRadius: 12, background: '#fff', border: '3px solid var(--amarillo)', boxShadow: '0 3px 0 #E8B21F', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none' }} aria-label={`Estampita del nivel ${n}`}>
      <EscenaMundo id={mundo ?? 'isla'} size={size * 0.75} />
      <span className="titulo" style={{ fontSize: size * 0.22 }}>{n}</span>
    </span>
  );
}
