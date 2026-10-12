// Revisa que todos los archivos JSON de content/ sean válidos.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function recorrer(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? recorrer(p) : p.endsWith('.json') ? [p] : [];
  });
}

let errores = 0;
for (const archivo of recorrer('content')) {
  try {
    JSON.parse(readFileSync(archivo, 'utf8'));
  } catch (e) {
    errores++;
    console.error(`✗ ${archivo}: ${(e as Error).message}`);
  }
}
if (errores) process.exit(1);
console.log('Contenido OK');
