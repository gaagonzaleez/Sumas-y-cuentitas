# AGENTS.md — instrucciones para Codex

Estás construyendo **mateAventuras**, un juego educativo de matemáticas y finanzas para nenas de 8 años (2.º grado, Argentina). La dueña del proyecto es Ga, que **no programa y quiere hacer lo menos posible**. Trabajá con autonomía total.

## Libertad creativa (decisión de Ga, octubre 2026)
Ga dio **100 % de libertad creativa** para hacer y mejorar el juego. Este archivo, el spec y los diseños son **un punto de partida, no un contrato**: podés cambiar pantallas, mecánicas, mundos, premios, textos, paleta, estructura o lo que sea si eso hace que mateAventuras sea más divertida y enseñe mejor. Inspirate en los mejores juegos y apps para chicos (copiando mecánicas, no arte ni marcas), proponé y hacé sin pedir permiso. Si cambiás algo importante, anotalo en la sección “Decisiones finales” de `docs/SPEC.md`.

Lo único que se mantiene siempre, porque cuida a las nenas: todo gratis y sin publicidad ni compras, privacidad de menores (sin datos reales ni chat), arte propio, tono cálido sin castigar errores y accesibilidad.

## Leé esto primero, en este orden
1. `docs/SPEC.md` — especificación completa. La sección **“Decisiones finales”** (al final) prevalece sobre todo lo demás.
2. `docs/design/README.md` y `docs/design/png/` — 15 pantallas de referencia (estructura, jerarquía, paleta, tipografía). Podés mejorar detalles, no cambiar la paleta, la tipografía ni las reglas de accesibilidad.
3. Este archivo.

## Permisos
Tenés permiso para ejecutar todo sin pedir confirmación: crear el proyecto, instalar dependencias, hacer commits directo a `main`, configurar CI y despliegue, generar arte SVG, audio y contenido. No hace falta abrir PRs ni esperar aprobación.

## Cuándo hablar con Ga
Casi nunca. Si necesitás algo que solo ella puede dar (crear una cuenta, pegar una clave, una decisión de producto que no está en el spec), **no frenes**: anotalo en `NECESITO_DE_GA.md` con pasos de copiar y pegar, en español simple, y seguí con otra parte. Nunca le pidas que ejecute comandos ni edite archivos.

## Stack
- App: React + TypeScript + Vite, PWA (service worker, instalable), mobile-first 360–430 px, adaptable hasta 1024 px.
- Estado local: IndexedDB (por ejemplo con `idb`). Las etapas 1–4 no dependen de ningún servidor.
- Hosting: GitHub Pages (el repo es público) con GitHub Actions. Usá `base: '/Sumas-y-cuentitas/'` en Vite (o la ruta que corresponda) y asegurate de que el service worker y el manifiesto respeten esa ruta.
- Backend (solo etapa 5, grupos y tabla): Supabase plan gratuito, con reglas de acceso por fila. Agregá una GitHub Action programada gratuita que “despierte” el proyecto para que no se pause por inactividad.
- Pruebas: Vitest (lógica) y Playwright (flujos). El CI corre ambos y bloquea el despliegue si fallan.
- Contenido como datos: mundos, niveles, plantillas, ítems, premios y precios en JSON dentro de `content/` (ver spec, “Arquitectura técnica sugerida”). Nada de números mágicos en el código.

## Reglas que no se negocian
- **Todo gratis.** Ningún servicio pago, sin publicidad, sin analítica de terceros, sin compras con dinero real.
- **Privacidad de menores.** Sin nombre real, apellido, foto, ubicación, chat ni texto libre entre nenas. Solo apodo (con filtro de palabras), avatar y puntos. Borrar un perfil elimina todos sus datos.
- **Arte 100 % original.** Inspiración general de Avatar World (avatar protagonista, mundos, premios visuales) pero **no copies** personajes, escenarios, íconos ni logos de ese juego ni de otro.
- **Tono.** Cálido, paciente, español rioplatense. Nunca “mal” ni “incorrecto”; usá “¡Casi!”. Los errores no restan monedas ni estrellas ya ganadas.
- **Accesibilidad.** Botones ≥ 44 px, texto ≥ 16 px, contraste 4,5:1, el color nunca es la única señal, todo audio con subtítulo y botón de silenciar.
- **Nombre en pantalla:** siempre `mateAventuras`.

## Voz (gratis y lo más natural posible)
Script reproducible que genera los audios una vez y los guarda en el repo (`content/audio/`). Probá Piper (voz es_AR si existe) y otras voces abiertas gratuitas; comparalas y elegí la más cálida para una nena de 8 años. Chispa (aguda, juguetona) y Seño Cande (pausada, maternal) deben sonar claramente distintas. Anotá la licencia de cada voz en `docs/voces.md` y descartá las que no permitan uso comercial. El script debe poder cambiarse por otra voz sin tocar la app.

## Arte
Armá primero `docs/guia-de-estilo.md` (proporciones, grosor de línea, paleta, expresiones) y hacé todo el arte siguiéndola. Avatar por capas SVG (cuerpo, piel, ojos, boca, pelo, ropa, calzado, accesorios, fondo) con 3–4 tonos de piel y 25 estilos de pelo como meta; **lanzamiento con unos 100 ítems**, y un sistema para sumar más cada mes solo agregando JSON + SVG. Mascotas con una versión por etapa (bebé, joven, grande) y por ánimo (contenta, normal, extrañando).

## Etapas (cada una jugable y desplegada por sí sola)
Seguí el plan del spec (“Plan de entrega y criterios de aceptación”):
1. Base: proyecto PWA, estilo, registro de la adulta, perfiles, ingreso con 3 dibujos, guía, avatar y mascota (pantallas 1–4 y 15).
2. Núcleo: mapa, niveles de 5 grados, escalera de dificultad, motor de plantillas, mundos 1–4, monedas y estrellas, voz y subtítulos (5, 6, 10).
3. Errores y repaso: `errorTag`, minilecciones de máx. 3 pasos, repaso (9).
4. Mascota y tienda: barra de crecimiento 0–300 que sube y baja, tienda, premios y festejos (7, 11, 12).
5. Grupos: código, tabla semanal, Supabase (8). Necesita a Ga una sola vez: ver `NECESITO_DE_GA.md`.
6. Dinero y finanzas: mundos 5–7, panel de la adulta (13, 14). Después, el reto grupal semanal y la alcancía.

Al terminar cada etapa: pruebas en verde, despliegue hecho, y actualizá `README.md` con la URL y qué se puede probar desde el celular.

## Valores iniciales
Mascota: 3 días de gracia, luego −5 puntos por día (≈ 24 días de grande a joven con la barra llena); +1 por estrella, +3 alimentar, +2 jugar (diario); puntos dobles 3 días al volver. Sin tope diario de monedas ni estrellas. Todo en `content/config/`.

## Primer paso
Creá el proyecto, el pipeline de despliegue a GitHub Pages y `NECESITO_DE_GA.md` (vacío al inicio). Publicá una primera pantalla de bienvenida con el nombre y la paleta. Después, etapa 1.
