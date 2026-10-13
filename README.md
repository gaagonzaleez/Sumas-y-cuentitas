# mateAventuras

Juego de aventura para que nenas de 8 años practiquen matemáticas y finanzas con su avatar y su mascota. Gratis, sin publicidad y pensado para celulares y tablets.

## Jugar

**https://gaagonzaleez.github.io/Sumas-y-cuentitas/**

(Si todavía no abre, falta encender GitHub Pages: ver [`NECESITO_DE_GA.md`](NECESITO_DE_GA.md), paso 1.)

### Instalarlo en el celular
- **Android (Chrome):** abrí el enlace → menú ⋮ → **Instalar app** (o “Agregar a la pantalla principal”).
- **iPhone (Safari):** abrí el enlace → botón **Compartir** → **Agregar a inicio**.

Se abre en pantalla completa y funciona sin internet (menos la tabla del grupo).

## Qué se puede probar desde el celular

| Etapa | Estado | Qué probar |
|---|---|---|
| 1. Base | ✅ | Bienvenida, cuenta de la adulta, perfil de la nena (apodo con filtro, grado, código de grupo, consentimiento), contraseña de 3 dibujos, elegir guía (Chispa o Seño Cande), crear avatar por capas, elegir y nombrar mascota |
| 2. Núcleo | ✅ | Mapa de 7 mundos, niveles con 5 grados, escalera de dificultad, ejercicios generados por plantillas (opciones, teclado, bloques, ordenar, memoria, arrastrar), monedas y estrellas, voz y subtítulos, botón de silencio |
| 3. Errores y repaso | ✅ | Equivocate una vez (“¡Casi!” + explicación) y otra vez: se abre la minilección de 3 pasos. Botón “Pedir una pista”. Con 3 errores iguales en la semana aparece la tarjeta de repaso en el mapa |
| 4. Mascota y tienda | ✅ | Barra de crecimiento 0–300 que sube y baja con avisos, alimentar, jugar, vestir; tienda con ofertas semanales, premios de jefa bloqueados; festejo con premio al pasar de nivel |
| 5. Grupos | 🟡 Listo, falta activar | Tabla semanal y “siempre”, podio, reto grupal, código de grupo, copia en la nube. Se activa con el paso 2 de `NECESITO_DE_GA.md` |
| 6. Dinero y finanzas | ✅ | Mundos 5 a 7 (Mercado, Pueblo, Isla del Tesoro), pagar con billetes, vuelto, presupuesto; panel de la adulta; alcancía con meta y bono; reto grupal |

Truco para probar rápido: un perfil con el apodo **kimbo** tiene todo abierto (modo creadora). Para las nenas, cada mundo se abre al pasar el nivel 4 del anterior. Cada grado se completa al contestar 10 preguntas (sin esperar tiempo, decisión de Ga). Los números arrancan en 200 en el grado 1 y suben de a 200 por grado (hasta 1000 en el grado 5); los juegos difíciles salen más seguido y «contar dibujitos» casi nunca.

**Variedad:** cada nivel mezcla por lo menos 5 juegos distintos (lo controla `npm run contenido`). Además de los ejercicios clásicos hay juegos de aula y de casa: guerra de cartas (de números, sumas, restas, tablas y plata), escoba (cartas o monedas que suman justo), lotería con cartón de 9, dados, balanza, pirámide de sumas, adivinanzas con pistas, escribir números con letras, memoria de cuentas, verdadero o falso, y para finanzas ¿me alcanza?, carrito del súper con presupuesto, ordenar precios, pagar con menos billetes, cobrar por un trabajo, cuánto falta para la meta y necesidades o deseos.

## Cómo está hecho

- React + TypeScript + Vite, PWA instalable (service worker), datos en el dispositivo (IndexedDB).
- Contenido como datos en [`content/`](content): mundos, niveles, plantillas, errores, minilecciones, ítems, premios, precios y reglas (`content/config/`).
- Motor de ejercicios en [`src/engine/`](src/engine): generadores por plantilla, escalera de dificultad, detección de errores por `errorTag`, mascota, semana en hora de Argentina.
- Arte 100 % original en SVG ([guía de estilo](docs/guia-de-estilo.md)). Galería interna: `#/galeria`.
- Voces gratuitas generadas una vez con Piper/Kokoro ([detalle y licencias](docs/voces.md)).
- Grupos con Supabase (plan gratuito) y reglas de acceso por fila ([`supabase/esquema.sql`](supabase/esquema.sql)).
- Pruebas: Vitest (lógica) y Playwright (flujos). El CI corre ambas y bloquea el despliegue si fallan.

## Documentos

- Especificación completa: [`docs/SPEC.md`](docs/SPEC.md)
- Pantallas de diseño: [`docs/design/`](docs/design/README.md)
- Instrucciones para agentes: [`AGENTS.md`](AGENTS.md)
- Pendientes que requieren a Ga: [`NECESITO_DE_GA.md`](NECESITO_DE_GA.md)

## Para desarrollar

```bash
npm install
npm run dev          # servidor local
npm test             # pruebas de lógica
npm run test:e2e     # pruebas de flujos (compilar antes con npm run build)
npm run contenido    # revisa el contenido
```

Para sumar ítems nuevos cada mes: agregar una entrada en `content/avatar/items.json` (y su SVG en `content/avatar/svg/` si es un dibujo nuevo, siguiendo la guía de estilo). No hace falta tocar código.
