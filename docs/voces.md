# Voces de las guías

La voz se genera **una sola vez** con herramientas gratuitas de código abierto y se guarda como archivos mp3 en `content/audio/<guia>/`. Después la app solo los reproduce: no hay costo, no se usa la voz del celular y funciona sin internet.

## Cómo funciona

1. `npm run audio:manifiesto` arma `content/audio/manifiesto.json` con **todas** las frases que la app puede decir. Las consignas que cambian (números, nombres, precios) se parten en pedacitos: frases fijas + un audio por número (0 a 1.000, y los miles). Así “Hay 3 canastas con 4 manzanas” suena con 5 audios cortos.
2. `python scripts/voz/generar.py` genera los mp3 que falten para cada guía con la voz configurada en `scripts/voz/voces.json`.
3. La acción de GitHub **“Voces de las guías”** hace los pasos 1 y 2 sola cada vez que cambia el contenido, guarda los audios en el repo y vuelve a publicar el sitio.

Para cambiar de voz (incluso a una paga en el futuro) se edita `scripts/voz/voces.json` o el script: **la app no cambia**.

## Voces probadas (licencias verificadas por el script)

| Voz | Motor | Acento | Licencia leída de su tarjeta | ¿Uso comercial? |
|---|---|---|---|---|
| es_AR-daniela-high | Piper | Rioplatense (Argentina) | Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) | Sí, con atribución |
| es_MX-claude-high | Piper | Latino (México) | Apache 2.0 | Sí |
| es_ES-sharvard-medium | Piper | España | CC BY 3.0 | Sí, pero el acento es de España (solo para comparar) |
| ef_dora (Kokoro-82M) | Kokoro | Español neutro | Apache 2.0 | Sí |

El script **descarga la tarjeta de cada modelo (MODEL_CARD) y lee su licencia antes de usarlo**; si es “no comercial” (NC) o no está en la lista permitida, la descarta y prueba la siguiente. El resultado queda en `docs/voces-licencias.json`. Las muestras de cada voz están en `docs/voces-muestras/` para escucharlas y comparar.

## Elección

- **Chispa** (estrellita, aguda y juguetona): Piper **es_AR-daniela-high**, la única voz neuronal abierta con acento rioplatense, con el tono 3 semitonos más agudo y un poco más rápida.
- **Seño Cande** (maestra, pausada y maternal): Piper **es_MX-claude-high**, una voz base distinta, más lenta y con el tono apenas más grave.

Así las dos guías suenan claramente distintas: voz base, tono y velocidad. Si una voz deja de estar disponible, el script usa la siguiente candidata de `scripts/voz/voces.json` (Kokoro ef_dora como respaldo).

**Atribución (CC BY-SA 4.0):** voz de Chispa basada en el modelo Piper “es_AR-daniela”, entrenado con el conjunto “Crowdsourced high-quality Argentinian Spanish speech data set” (OpenSLR 61). Voz de la Seño Cande: Piper “es_MX-claude” (Apache 2.0). Respaldo: Kokoro-82M (Apache 2.0).

## Límites

Las voces gratuitas suenan bien, pero son menos expresivas que las pagas. Si en algún momento no alcanza, Ga puede decidir pagar una voz: solo hay que cambiar el motor en `scripts/voz/generar.py`.
