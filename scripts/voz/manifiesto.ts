// Arma content/audio/manifiesto.json: todas las frases que la app puede decir, partidas en
// pedacitos (frases fijas y números). La app usa exactamente la misma partición (src/engine/voz.ts),
// así cada pedacito tiene su archivo de audio por guía.
//
// Uso: npm run audio:manifiesto   (lo corre también la acción "Voces" de GitHub)
import { writeFileSync } from 'node:fs';
import { FRASES } from '../../src/content/catalogo';
import { ERRORES, MUNDOS } from '../../src/content/index';
import { crearAzar } from '../../src/engine/azar';
import { limitesGrado } from '../../src/engine/escalera';
import { generarEjercicio } from '../../src/engine/generar';
import { armarLeccion } from '../../src/engine/leccion';
import { enLetras } from '../../src/engine/numerosEnLetras';
import { clavesAudio, partirTexto } from '../../src/engine/voz';

const textos = new Set<string>();
const sumar = (t: string) => {
  for (const p of partirTexto(t)) if (p.tipo === 'texto') textos.add(p.texto);
};

// Frases de las guías.
for (const guia of Object.values(FRASES)) for (const v of Object.values(guia)) (Array.isArray(v) ? v : [v]).forEach(sumar);
for (const e of Object.values(ERRORES)) sumar(e.frase);
[
  'Tocá tus 3 dibujos secretos',
  '¡Hola! Tocá tus 3 dibujos secretos.',
  'Elegí 3 dibujos secretos. Acordate el orden: son tu contraseña.',
  'Ahora tocalos otra vez, en el mismo orden.',
  '¡Terminaste el repaso! ¡Qué bien!',
].forEach(sumar);

// Consignas, explicaciones, pistas y minilecciones: se simulan muchos ejercicios de cada nivel y grado.
const az = crearAzar(2026);
for (const mundo of MUNDOS) {
  for (const nivel of [...mundo.niveles, mundo.jefe]) {
    for (let grado = 1; grado <= 5; grado++) {
      const lim = limitesGrado(nivel, mundo.escala, grado);
      for (const rango of lim.escalera.filter((p) => p >= lim.minimo && p <= lim.techo)) {
        for (let i = 0; i < 30; i++) {
          const ej = generarEjercicio(az, mundo, nivel, grado, rango);
          [ej.consigna, ej.explicacion, ej.pista].forEach(sumar);
          const tags = new Set([ej.errorTagPorDefecto, ...((ej.opciones ?? []).map((o) => o.errorTag).filter(Boolean) as string[])]);
          for (const t of tags) armarLeccion(t, ej).pasos.forEach(sumar);
        }
      }
    }
  }
}

const claves: Record<string, string> = {};
for (const t of textos) for (const c of clavesAudio({ tipo: 'texto', texto: t })) claves[c] = t;
for (let n = 0; n <= 1000; n++) claves[`n-${n}`] = enLetras(n);
for (let m = 1; m <= 10; m++) claves[`m-${m}`] = enLetras(m * 1000);

const orden = Object.fromEntries(Object.entries(claves).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(
  'content/audio/manifiesto.json',
  JSON.stringify({ _nota: 'Generado por scripts/voz/manifiesto.ts. Clave de archivo → texto a decir.', claves: orden }, null, 1) + '\n',
);
console.log(`${Object.keys(orden).length} audios por guía (${textos.size} frases y 1011 números)`);
