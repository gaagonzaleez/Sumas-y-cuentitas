# Voces de las guías

La voz se genera **una sola vez** con herramientas gratuitas de código abierto y se guarda como archivos mp3 en `content/audio/<guia>/`. Después la app solo los reproduce: no hay costo, no se usa la voz del celular y funciona sin internet.

## Cómo funciona

1. `npm run audio:manifiesto` arma `content/audio/manifiesto.json` con **todas** las frases que la app puede decir. Las consignas que cambian (números, nombres, precios) se parten en pedacitos: frases fijas + un audio por número (0 a 1.000, y los miles). Así “Hay 3 canastas con 4 manzanas” suena con 5 audios cortos.
2. `python scripts/voz/generar.py` genera los mp3 que falten para cada guía con la voz configurada en `scripts/voz/voces.json`.
3. La acción de GitHub **“Voces de las guías”** hace los pasos 1 y 2 sola cada vez que cambia el contenido, guarda los audios en el repo y vuelve a publicar el sitio.

Para cambiar de voz (incluso a una paga en el futuro) se edita `scripts/voz/voces.json` o el script: **la app no cambia**.

## Voces probadas

| Voz | Motor | Acento | Licencia | ¿Se puede usar? |
|---|---|---|---|---|
| es_AR-daniela-high | Piper | Rioplatense (Argentina) | Datos “Argentinian Spanish” de Google (OpenSLR 61), CC BY-SA 4.0 según su tarjeta; el script la vuelve a verificar | Sí: permite uso comercial con atribución |
| es_MX-claude-high | Piper | Latino (México) | La que figure en su MODEL_CARD (el script la verifica antes de usarla) | Solo si la licencia lo permite; si no, se descarta sola |
| es_ES-sharvard-medium | Piper | España | La que figure en su MODEL_CARD (el script la verifica) | Solo para comparar: el acento es de España |
| ef_dora (Kokoro-82M) | Kokoro | Español neutro | Apache 2.0 | Sí |

El script **descarga la tarjeta de cada modelo (MODEL_CARD) y lee su licencia antes de usarlo**; si dice “NC” (no comercial) o no tiene una licencia de la lista permitida, la descarta y prueba la siguiente. El resultado queda en `docs/voces-licencias.json`. Las muestras de cada voz candidata quedan en `docs/voces-muestras/` para escucharlas y comparar.

## Elección

- **Chispa** (estrellita, aguda y juguetona): Piper **es_AR-daniela-high**, la única voz neuronal abierta con acento rioplatense. Se sube el tono 3 semitonos y se acelera un poco para que suene más aniñada y juguetona.
- **Seño Cande** (maestra, pausada y maternal): una **voz base distinta** — Piper es_MX-claude-high si su licencia lo permite, si no Kokoro ef_dora — más lenta y con el tono apenas más grave. Como último recurso usa daniela mucho más lenta y grave.

Así las dos guías suenan claramente distintas (voz base, tono y velocidad).

**Atribución (CC BY-SA 4.0):** voz de Chispa basada en el modelo Piper “es_AR-daniela” entrenado con el conjunto de datos “Crowdsourced high-quality Argentinian Spanish speech data set” de Google (OpenSLR 61). Kokoro-82M © hexgrad, Apache 2.0.

## Límites

Las voces gratuitas suenan bien, pero son menos expresivas que las pagas. Si en algún momento no alcanza, Ga puede decidir pagar una voz: solo hay que cambiar el motor en `scripts/voz/generar.py`.
