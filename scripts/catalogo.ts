// Muestra lo que ve una nena en cada juego de cada nivel: consigna, explicación, pista y la
// minilección de cada error posible. Sirve para revisar los textos de un vistazo.
// Uso: npm run -s catalogo > catalogo.txt
import { MUNDOS, ERRORES } from '../src/content';
import { crearAzar } from '../src/engine/azar';
import { limitesGrado } from '../src/engine/escalera';
import { generarEjercicio } from '../src/engine/generar';
import { armarLeccion } from '../src/engine/leccion';
const az = crearAzar(3);
const out: string[] = [];
for (const m of MUNDOS) for (const n of [...m.niveles, m.jefe]) {
  out.push(`\n######## ${n.id} — ${n.nombre}`);
  const vistos = new Set<string>();
  for (const grado of [1, 4]) {
    const lim = limitesGrado(n, m.escala, grado);
    for (const p of n.plantillas) {
      const k = p.id + JSON.stringify(p.params ?? {});
      if (vistos.has(k + grado)) continue; vistos.add(k + grado);
      const ej = generarEjercicio(az, m, n, grado, grado === 1 ? lim.minimo : lim.techo, new Set(), p);
      out.push(`\n[${p.id} g${grado} r${grado === 1 ? lim.minimo : lim.techo}] ${ej.consigna}${ej.cuenta ? '  «' + ej.cuenta + '»' : ''}  → ${ej.respuesta}`);
      out.push(`  ✔ ${ej.explicacion}`);
      out.push(`  💡 ${ej.pista}`);
      const tags = [...new Set([ej.errorTagPorDefecto, ...(ej.opciones ?? []).map(o => o.errorTag).filter(Boolean) as string[], ...Object.values(ej.erroresPrevistos ?? {})])];
      for (const t of tags) out.push(`  ✘ ${t}: «${ERRORES[t].frase}» → ${armarLeccion(t, ej).pasos.join(' / ')}`);
    }
  }
}
console.log(out.join('\n'));
