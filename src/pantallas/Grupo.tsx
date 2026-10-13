// Pantalla 8: tabla de posiciones del grupo (semana y siempre) y reto grupal.
import { useEffect, useState } from 'react';
import { AvatarCirculo } from '../art/Avatar';
import { Guia } from '../art/Guias';
import { Icono } from '../art/Iconos';
import { ITEM } from '../content/catalogo';
import { avatarInicial, actualizar, useJugadora } from '../datos/estado';
import { liquidarAlcancia } from '../datos/juego';
import { configGrupos, type EstadoTabla, nubeConfigurada, tablaDelGrupo } from '../datos/nube';
import { diasQueFaltan, lunesDeLaSemana } from '../engine/semana';
import { crearAzar } from '../engine/azar';
import { sonido } from '../audio/voz';
import { Cargando, MenuInferior, useEnLinea } from '../ui/comunes';

const FONDOS = ['#CDE9FF', '#FFF4D1', '#FFE3E6', '#D7F5EE', '#E9E3FF'];

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  const j = useJugadora();
  return (
    <div className="tarjeta col centro" style={{ gap: 10, textAlign: 'center', padding: 24 }}>
      <Guia guia={j?.guia ?? 'chispa'} size={90} expr="pensando" />
      <h2>{titulo}</h2>
      <p className="suave">{texto}</p>
    </div>
  );
}

export function Grupo() {
  const j = useJugadora();
  const enLinea = useEnLinea();
  const [tab, setTab] = useState<'semana' | 'siempre'>('semana');
  const [estado, setEstado] = useState<EstadoTabla | null>(null);
  const [cobrado, setCobrado] = useState('');
  useEffect(() => {
    if (j && nubeConfigurada && j.codigoGrupo && enLinea) tablaDelGrupo(j).then(setEstado);
  }, [j?.codigoGrupo, enLinea]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!j) return null;

  let cuerpo;
  if (!j.codigoGrupo) cuerpo = <Vacio titulo="Jugás sin grupo" texto="Si tu familia tiene un código de grupo, la adulta lo puede cargar en su panel. ¡Igual podés jugar y ganar todo!" />;
  else if (!nubeConfigurada) cuerpo = <Vacio titulo="¡Muy pronto!" texto="La tabla del grupo se activa en una próxima actualización. Tus estrellas ya se están guardando." />;
  else if (!enLinea) cuerpo = <Vacio titulo="Sin conexión" texto="La tabla del grupo necesita internet. Podés seguir jugando y tus estrellas se suman cuando vuelva la conexión." />;
  else if (!estado) return <Cargando texto="Buscando a tu grupo…" />;
  else if (estado.tipo === 'sin-sesion') cuerpo = <Vacio titulo="Falta conectar" texto="La adulta tiene que conectar mateAventuras a la nube desde su panel para ver la tabla." />;
  else if (estado.tipo === 'sin-grupo') cuerpo = <Vacio titulo="No encontramos el grupo" texto="Revisá el código con la adulta. Puede que el grupo esté lleno o cerrado." />;
  else if (estado.tipo === 'error') cuerpo = <Vacio titulo="Uy, algo no anduvo" texto="No pudimos traer la tabla. Probá de nuevo en un ratito." />;
  else {
    const filas = [...estado.filas].sort((a, b) => b[tab] - a[tab] || a.apodo.localeCompare(b.apodo));
    const yo = filas.findIndex((f) => f.es_mia && f.player_id === j.id);
    const podio = filas.slice(0, 3);
    const total = estado.filas.reduce((s, f) => s + f.semana, 0);
    const meta = configGrupos.metaRetoPorJugadora * estado.filas[0].jugadoras;
    const semana = lunesDeLaSemana();
    const cumplido = total >= meta;
    const yaCobrado = j.retosCobrados.includes(semana);
    const alturas = [110, 80, 56];
    const orden = [1, 0, 2].filter((i) => podio[i]);
    async function cobrar() {
      const quedan = configGrupos.itemsSorpresa.filter((i) => !j!.items.includes(i));
      const sorpresa = quedan.length ? crearAzar(Date.parse(semana)).elegir(quedan) : '';
      // Todo junto y comprobando adentro: tocar dos veces no cobra dos veces.
      await actualizar((x) =>
        x.retosCobrados.includes(semana)
          ? x
          : liquidarAlcancia({
              ...x,
              monedas: x.monedas + configGrupos.premioRetoMonedas,
              retosCobrados: [...x.retosCobrados, semana],
              items: !sorpresa || x.items.includes(sorpresa) ? x.items : [...x.items, sorpresa],
            }),
      );
      sonido('festejo');
      setCobrado(sorpresa || 'monedas');
    }
    cuerpo = (
      <>
        <div className="fila" style={{ gap: 8 }}>
          {(['semana', 'siempre'] as const).map((t) => (
            <button key={t} className="chip" aria-pressed={tab === t} onClick={() => setTab(t)} style={{ fontSize: 17, padding: '10px 18px' }}>{t === 'semana' ? 'Esta semana' : 'Siempre'}</button>
          ))}
        </div>
        <div className="fila" style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 8, minHeight: 230 }}>
          {orden.map((i) => {
            const f = podio[i];
            return (
              <div key={f.player_id} className="col centro" style={{ gap: 4, flex: 1, maxWidth: 120 }}>
                {i === 0 && <Icono nombre="trofeo" size={30} />}
                <AvatarCirculo avatar={f.avatar ?? avatarInicial()} size={i === 0 ? 66 : 54} fondo={FONDOS[i]} />
                <span style={{ fontWeight: 800 }}>{f.apodo}{f.player_id === j.id ? ' (vos)' : ''}</span>
                <div className="col centro" style={{ width: '100%', height: alturas[i], borderRadius: '14px 14px 0 0', background: ['var(--amarillo)', '#C9C3E6', '#F2C8A0'][i], gap: 0 }}>
                  <span className="titulo" style={{ fontSize: 32 }}>{i + 1}</span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{f[tab]}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col" style={{ gap: 8 }}>
          {filas.slice(3).map((f, k) => {
            const mia = f.player_id === j.id;
            return (
              <div key={f.player_id} className="tarjeta fila" style={{ padding: '10px 14px', border: mia ? '4px solid var(--violeta)' : '4px solid transparent' }}>
                <span className="titulo" style={{ width: 28, fontSize: 22 }}>{k + 4}</span>
                <AvatarCirculo avatar={f.avatar ?? avatarInicial()} size={40} fondo={FONDOS[k % 5]} />
                <span style={{ flex: 1, fontWeight: 800 }}>{f.apodo}{mia ? ' (vos)' : ''}</span>
                <span style={{ fontWeight: 800 }}>{f[tab]}</span>
              </div>
            );
          })}
          {yo >= 0 && yo < 3 && <p className="aviso-caja lila">¡Estás en el puesto {yo + 1}! Seguí jugando para sumar estrellas.</p>}
          {filas.length === 1 && <p className="aviso-caja lila">Todavía sos la única del grupo. ¡Cuando se sumen tus amigas van a aparecer acá!</p>}
        </div>
        <section className="tarjeta col" style={{ gap: 8 }}>
          <div className="fila entre"><h3>Reto del grupo</h3><span className="suave chico">Faltan {diasQueFaltan()} días</span></div>
          <p style={{ fontWeight: 800 }}>Juntar {meta.toLocaleString('es-AR')} estrellas entre todas para abrir un cofre sorpresa.</p>
          <div className="barra" style={{ height: 16 }} role="progressbar" aria-valuenow={total} aria-valuemin={0} aria-valuemax={meta} aria-label="Reto del grupo">
            <span style={{ width: `${Math.min(100, (total / meta) * 100)}%` }} />
          </div>
          <span className="suave chico">{total.toLocaleString('es-AR')} de {meta.toLocaleString('es-AR')} estrellas</span>
          {cumplido && !yaCobrado && <button className="boton verde ancho" onClick={cobrar}><Icono nombre="regalo" /> ¡Abrir el cofre!</button>}
          {cobrado && <p className="aviso-caja verde">¡Ganaste {configGrupos.premioRetoMonedas} monedas{ITEM[cobrado] ? ` y ${ITEM[cobrado].nombre}` : ''}!</p>}
        </section>
      </>
    );
  }

  return (
    <main className="pantalla con-menu" style={{ gap: 14, maxWidth: 560, margin: '0 auto' }}>
      <div className="fila entre">
        <div className="col" style={{ gap: 0 }}>
          <h1>{estado?.tipo === 'ok' ? estado.filas[0].grupo : 'Mi grupo'}</h1>
          {estado?.tipo === 'ok' && <span className="suave chico">{estado.filas[0].jugadoras} jugadoras en el grupo</span>}
        </div>
        {j.codigoGrupo && <span className="pildora estrellas" style={{ color: 'var(--violeta)', letterSpacing: 2, fontFamily: 'var(--fuente-titulo)' }}>{j.codigoGrupo}</span>}
      </div>
      {cuerpo}
      <MenuInferior actual="grupo" />
    </main>
  );
}
