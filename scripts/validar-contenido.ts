// Revisa el contenido (content/): JSON válidos y referencias cruzadas sanas.
// Se corre en CI antes de compilar: `npm run contenido`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ERRORES, LECCIONES, MUNDOS, OBJETOS } from '../src/content/index';
import { ITEMS, ITEM, MASCOTAS, PREMIOS } from '../src/content/catalogo';
import { GENERADORES } from '../src/engine/plantillas';
import gruposCfg from '../content/config/grupos.json';

const problemas: string[] = [];
const mal = (m: string) => problemas.push(m);

function recorrer(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? recorrer(p) : p.endsWith('.json') ? [p] : [];
  });
}
for (const archivo of recorrer('content')) {
  try {
    JSON.parse(readFileSync(archivo, 'utf8'));
  } catch (e) {
    mal(`${archivo}: JSON inválido (${(e as Error).message})`);
  }
}

// Ítems
const ids = new Set<string>();
for (const it of ITEMS) {
  if (ids.has(it.id)) mal(`Ítem repetido: ${it.id}`);
  ids.add(it.id);
  for (const k of ['svg', 'svgAtras', 'svgFrente'] as const) {
    const s = it[k];
    if (s && !existsSync(`content/avatar/svg/${s}.svg`) && it.capa !== 'mascota') mal(`${it.id}: falta content/avatar/svg/${s}.svg`);
  }
}
const lanzamiento = ITEMS.filter((i) => i.desbloqueo !== 'premio' && i.capa !== 'mascota').length;
if (lanzamiento < 90) mal(`El catálogo de lanzamiento tiene ${lanzamiento} ítems (meta: unos 100)`);
const pelos = ITEMS.filter((i) => i.capa === 'pelo').length;
if (pelos < 12) mal(`Hay ${pelos} peinados`);

// Premios
for (const [nivel, p] of Object.entries(PREMIOS.niveles)) for (const i of [p.grado1, p.todos]) if (!ITEM[i]) mal(`Premio de ${nivel} inexistente: ${i}`);
for (const [m, p] of Object.entries(PREMIOS.jefes)) for (const i of [...Object.values(p.grados).flat(), ...p.todos]) if (!ITEM[i]) mal(`Premio de la jefa de ${m} inexistente: ${i}`);
for (const i of gruposCfg.itemsSorpresa) if (!ITEM[i]) mal(`Ítem sorpresa inexistente: ${i}`);

// Mundos y niveles
for (const m of MUNDOS) {
  if (m.niveles.length !== 8) mal(`${m.nombre} tiene ${m.niveles.length} niveles (deben ser 8)`);
  for (const n of [...m.niveles, m.jefe]) {
    for (const p of n.plantillas) if (!GENERADORES[p.id]) mal(`${n.id}: plantilla sin generador ${p.id}`);
    if (n !== m.jefe && !PREMIOS.niveles[n.id]) mal(`${n.id}: no tiene premio`);
  }
  if (!PREMIOS.jefes[m.id]) mal(`La jefa de ${m.id} no tiene premios`);
}

// Errores y lecciones
for (const [tag, e] of Object.entries(ERRORES)) if (!LECCIONES[e.leccion]) mal(`${tag}: falta la lección ${e.leccion}`);
for (const [id, l] of Object.entries(LECCIONES)) if (l.pasos.length > 3) mal(`Lección ${id}: tiene más de 3 pasos`);
for (const o of Object.keys(OBJETOS)) if (!o) mal('Objeto sin id');
if (MASCOTAS.filter((x) => x.precio === 0).length < 4) mal('Tiene que haber al menos 4 mascotas gratis');

if (problemas.length) {
  problemas.forEach((p) => console.error('✗', p));
  process.exit(1);
}
console.log(`Contenido OK: ${MUNDOS.length} mundos, ${ITEMS.length} ítems (${lanzamiento} de lanzamiento), ${Object.keys(ERRORES).length} tipos de error.`);
