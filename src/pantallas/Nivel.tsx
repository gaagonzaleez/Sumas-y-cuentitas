// Pantalla 10: elegir grado de un nivel (5 grados, estrellas, bloqueos y "+10 monedas al repetir").
import { Estrella, Icono } from '../art/Iconos';
import { config, nivelPorId } from '../content';
import { descripcionGrado } from '../engine/escalera';
import { clave, completado, gradoDesbloqueado } from '../engine/progreso';
import { useJugadora } from '../datos/estado';
import { BotonVolver, Estrellas, PildoraMonedas } from '../ui/comunes';
import { ir } from '../ui/router';

export function Nivel({ id }: { id: string }) {
  const j = useJugadora();
  const info = nivelPorId(id);
  if (!j || !info) return null;
  const { mundo, nivel, esJefe, indice } = info;
  const proximo = [1, 2, 3, 4, 5].find((g) => !completado(j.progreso, id, g));
  return (
    <main className="pantalla angosta" style={{ gap: 12 }}>
      <div className="fila entre" style={{ alignItems: 'flex-start' }}>
        <BotonVolver a={`/mundo/${mundo.id}`} />
        <div className="col" style={{ gap: 0, flex: 1 }}>
          <span className="suave chico">{mundo.nombre}</span>
          <h1 style={{ fontSize: 26 }}>{esJefe ? nivel.nombre : `Nivel ${indice + 1} · ${nivel.nombre}`}</h1>
        </div>
        <PildoraMonedas n={j.monedas} />
      </div>
      {esJefe && <p className="aviso-caja lila">{(nivel as { descripcion?: string }).descripcion} Cada grado es una versión más poderosa, ¡y cada una da su premio!</p>}
      {[1, 2, 3, 4, 5].map((g) => {
        const hecho = completado(j.progreso, id, g);
        const abierto = gradoDesbloqueado(j.progreso, mundo, id, g);
        const est = j.progreso[clave(id, g)]?.estrellas ?? 0;
        const actual = g === proximo && abierto;
        const desc = descripcionGrado(nivel, mundo.escala, g);
        return (
          <section key={g} className="tarjeta col" style={{ border: `4px solid ${actual ? 'var(--violeta)' : 'transparent'}`, background: abierto ? '#fff' : 'var(--lavanda)', gap: 10, padding: '14px 14px' }}>
            <div className="fila" style={{ gap: 14 }}>
            <span style={{ width: 54, height: 54, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hecho ? 'var(--turquesa-oscuro)' : actual ? 'var(--violeta)' : '#D9D0F7', color: hecho || actual ? '#fff' : 'var(--tinta)', fontFamily: 'var(--fuente-titulo)', fontSize: 26 }}>
              {hecho ? <Icono nombre="tilde" size={30} grosor={3} /> : abierto ? g : <Icono nombre="candado" />}
            </span>
            <div className="col" style={{ gap: 2, flex: 1 }}>
              <h3 style={{ color: abierto ? 'var(--tinta)' : 'var(--tinta-suave)', whiteSpace: 'nowrap' }}>Grado {g}</h3>
              <span className="suave chico" style={{ lineHeight: 1.25 }}>{desc}</span>
            </div>
            {!hecho && abierto && <button className="boton chico" style={{ flex: 'none' }} onClick={() => ir(`/jugar/${id}/${g}`)}>Jugar</button>}
            </div>
            {hecho && (
              <div className="fila entre" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Estrellas n={est} size={26} />
                <button className="boton chico verde" style={{ fontSize: 16 }} onClick={() => ir(`/jugar/${id}/${g}`)}>Repetir · +{config.economia.monedas.repetirGrado} monedas</button>
              </div>
            )}
            {!abierto && <span className="suave chico">{g === 1 ? 'Terminá el nivel anterior para abrirlo.' : `Terminá el grado ${g - 1} para abrirlo.`}</span>}
          </section>
        );
      })}
      <p className="aviso-caja amarillo"><Estrella size={22} /> Volvé a cualquier grado para practicar, ganar monedas y conseguir más estrellas.</p>
    </main>
  );
}
