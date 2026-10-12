// Genera los íconos PNG de la PWA a partir de public/favicon.svg.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const out = 'public/icons/';
await sharp(svg).resize(192, 192).png().toFile(out + 'icon-192.png');
await sharp(svg).resize(512, 512).png().toFile(out + 'icon-512.png');
await sharp(svg).resize(180, 180).flatten({ background: '#5B3FE0' }).png().toFile(out + 'apple-touch-icon.png');
// Versión "maskable": el dibujo achicado al 80 % sobre fondo violeta lleno.
const inner = await sharp(svg).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#5B3FE0' } })
  .composite([{ input: inner, top: 56, left: 56 }])
  .png()
  .toFile(out + 'icon-maskable-512.png');
console.log('Íconos listos');
