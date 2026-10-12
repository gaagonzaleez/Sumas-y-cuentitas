// Galería interna para revisar el arte (no aparece en el menú): #/galeria
import { AvatarSVG } from '../art/Avatar';
import { Chispa, SenoCande } from '../art/Guias';
import { MascotaSVG } from '../art/Mascota';
import { EscenaMundo } from '../art/Mundos';
import { Objeto, OBJETOS_DIBUJADOS } from '../art/Objetos';
import { Plata } from '../art/Plata';
import { MUNDOS } from '../content';
import { AVATAR_INICIAL, ITEMS, MASCOTAS, OPCIONES_AVATAR, PREMIOS } from '../content/catalogo';
import type { Avatar } from '../datos/tipos';

const PELOS = ITEMS.filter((i) => i.capa === 'pelo').map((i) => i.id);
const COLORES = ITEMS.filter((i) => i.capa === 'colorPelo').map((i) => i.id);

export function Galeria() {
  const avatares: Avatar[] = PELOS.map((p, i) => ({
    ...AVATAR_INICIAL,
    pelo: p,
    piel: OPCIONES_AVATAR.pieles[i % 8],
    colorPelo: COLORES[i % COLORES.length],
    ojos: OPCIONES_AVATAR.ojos[i % 4].id,
    expresion: OPCIONES_AVATAR.expresiones[i % 3].id,
    arriba: ITEMS.filter((x) => x.capa === 'arriba')[i % 13].id,
    vestido: i % 4 === 3 ? ITEMS.filter((x) => x.capa === 'vestido')[i % 5].id : undefined,
    cabeza: i % 3 === 0 ? ITEMS.filter((x) => x.capa === 'cabeza')[i % 11].id : undefined,
    cara: i % 5 === 1 ? 'anteojos-lindos' : undefined,
    espalda: i % 6 === 2 ? 'alas-cristal' : undefined,
    mano: i % 7 === 4 ? 'varita' : undefined,
    fondo: ITEMS.filter((x) => x.capa === 'fondo')[i % 9].id,
  }));
  const jefes: Avatar[] = PREMIOS.sets.map((s, i) => {
    let a: Avatar = { ...AVATAR_INICIAL, piel: OPCIONES_AVATAR.pieles[(i * 3) % 8], pelo: PELOS[i + 2], fondo: 'fondo-dorado' };
    for (const id of s.items) {
      const it = ITEMS.find((x) => x.id === id)!;
      a = { ...a, [it.capa]: id };
    }
    return a;
  });
  return (
    <main className="pantalla" style={{ gap: 20 }}>
      <h1>Galería de arte</h1>
      <div className="fila" style={{ gap: 12 }}>
        {(['contenta', 'feliz', 'pensando', 'animando'] as const).map((e) => <Chispa key={e} size={80} expr={e} />)}
        {(['contenta', 'feliz', 'pensando'] as const).map((e) => <SenoCande key={e} size={80} expr={e} />)}
      </div>
      <h2>Avatares ({ITEMS.length} ítems en el catálogo)</h2>
      <div className="fila" style={{ flexWrap: 'wrap', gap: 8 }}>{avatares.map((a, i) => <AvatarSVG key={i} avatar={a} size={120} />)}</div>
      <h2>Jefas</h2>
      <div className="fila" style={{ flexWrap: 'wrap', gap: 8 }}>{jefes.map((a, i) => <AvatarSVG key={i} avatar={a} size={120} />)}</div>
      <h2>Mascotas</h2>
      {MASCOTAS.map((m) => (
        <div key={m.id} className="fila" style={{ flexWrap: 'wrap', gap: 4 }}>
          {(['bebe', 'joven', 'grande'] as const).map((et) => (['contenta', 'normal', 'extranando'] as const).map((an) => <MascotaSVG key={et + an} especie={m.id} etapa={et} animo={an} size={90} />))}
        </div>
      ))}
      <h2>Mundos, objetos y plata</h2>
      <div className="fila" style={{ flexWrap: 'wrap' }}>{MUNDOS.map((m) => <EscenaMundo key={m.id} id={m.id} size={80} />)}</div>
      <div className="fila" style={{ flexWrap: 'wrap' }}>{OBJETOS_DIBUJADOS.map((o) => <Objeto key={o} id={o} size={48} />)}</div>
      <div className="fila" style={{ flexWrap: 'wrap' }}>{[1000, 500, 200, 100, 50, 20, 10, 5, 2, 1].map((v) => <Plata key={v} valor={v} />)}</div>
    </main>
  );
}
