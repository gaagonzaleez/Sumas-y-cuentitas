/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { cpSync, createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/** Publica los audios de content/audio/<guia>/ en /audio/<guia>/ (en desarrollo y al compilar). */
function audios(): Plugin {
  const origen = 'content/audio';
  return {
    name: 'audios-de-las-guias',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/\/audio\/(chispa|cande)\/([\w-]+\.(?:mp3|json))$/);
        const archivo = m && join(origen, m[1], m[2]);
        if (!archivo || !existsSync(archivo)) return next();
        res.setHeader('Content-Type', archivo.endsWith('.mp3') ? 'audio/mpeg' : 'application/json');
        createReadStream(archivo).pipe(res);
      });
    },
    writeBundle(opciones) {
      for (const guia of ['chispa', 'cande']) {
        const dir = join(origen, guia);
        if (existsSync(dir)) cpSync(dir, join(opciones.dir ?? 'dist', 'audio', guia), { recursive: true });
      }
    },
  };
}

// GitHub Pages sirve el sitio en /Sumas-y-cuentitas/
const base = process.env.BASE_PATH ?? '/Sumas-y-cuentitas/';

// Versión visible en Ajustes (fecha y hora de compilación, hora de Argentina).
const version = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short' });
// Identificador único de cada compilación: la app lo compara con version.json del servidor.
const versionId = `${process.env.GITHUB_SHA?.slice(0, 7) ?? 'local'}-${Date.now()}`;

/** Publica version.json (fuera del service worker) para saber si hay una versión nueva. */
function archivoVersion(): Plugin {
  return {
    name: 'archivo-de-version',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: versionId, version }) });
    },
  };
}

export default defineConfig({
  base,
  define: { __VERSION__: JSON.stringify(version), __VERSION_ID__: JSON.stringify(versionId) },
  plugins: [
    react(),
    audios(),
    archivoVersion(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'mateAventuras',
        short_name: 'mateAventuras',
        description: 'Aventuras de matemática y finanzas con tu avatar y tu mascota.',
        lang: 'es-AR',
        start_url: base,
        scope: base,
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'portrait',
        background_color: '#F3EEFF',
        theme_color: '#5B3FE0',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        // version.json siempre se pide al servidor: es lo que avisa que hay algo nuevo.
        globIgnores: ['version.json', 'muestras-voz/**'],
        navigateFallback: `${base}index.html`,
        // La página para comparar voces es aparte de la app.
        navigateFallbackDenylist: [/\/muestras-voz\//],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Audios de las guías: se guardan al escucharlos o al precargar un nivel.
            urlPattern: ({ url }) => url.pathname.includes('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'audios',
              expiration: { maxEntries: 4000, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
