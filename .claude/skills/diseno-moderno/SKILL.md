---
name: diseno-moderno
description: Guía visual de mateAventuras para que se vea como un juego de celular actual (no de los 80/90). Usala SIEMPRE que toques pantallas, estilos (src/styles.css), arte SVG (src/art, content/avatar/svg), animaciones o festejos.
---

# Diseño moderno de mateAventuras

Pedido de Ga: que el juego se vea moderno, con mejores gráficos y animaciones, "no como un videojuego de los 80/90".
Referencias de estilo (mecánicas visuales, nunca copiar arte ni marcas): juegos actuales para chicos en celular,
con volumen suave, colores vivos, mucho movimiento chiquito y festejos generosos.

## Lo que NO se toca (reglas del proyecto)
- Paleta base de `:root` en `src/styles.css` (violeta, turquesa, amarillo, coral, naranja, tinta). Se pueden sumar
  tonos derivados (más claros/oscuros) para degradados, siempre como variables.
- Tipografías Fredoka (títulos) y Nunito (texto).
- Accesibilidad: botones ≥ 44 px, texto ≥ 16 px, contraste 4,5:1 del texto sobre su fondo real (también sobre degradados),
  el color nunca es la única señal, y todo movimiento se apaga con `prefers-reduced-motion`.

## Volumen y profundidad (en vez de "plano con borde negro")
- Superficies: tarjetas blancas con sombra en capas suave (`--sombra-tarjeta`), radio 24–28 px, borde blanco translúcido.
- Botones: degradado vertical (claro arriba, oscuro abajo), brillo interno arriba (`inset 0 2px 0 rgba(255,255,255,.35)`),
  canto inferior de 4 px y sombra difusa. Al tocar: se hunden (translateY) con transición tipo resorte.
- Fondos: nunca un color liso. Degradado suave + manchas de color difuminadas (blur) que se mueven muy lento.
- Arte SVG: usar `linearGradient`/`radialGradient` para dar volumen (luz arriba-izquierda), un brillo blanco
  semitransparente y sombra de contacto (elipse oscura con blur o baja opacidad) debajo de personajes y objetos.
  Contornos en `#2B2350` más finos (2–3 px) que antes; preferir contornos del mismo color oscurecido.
- Vidrio esmerilado (`backdrop-filter: blur`) para menús y paneles flotantes sobre escenas.

## Movimiento
- Todo lo que aparece entra con una animación corta (200–350 ms, `cubic-bezier(.2,.9,.3,1.2)` para el rebote).
- Pantallas: entran con fundido + deslizamiento de 12 px.
- Elementos vivos: respiración/flote lento (3–6 s) en personajes, nubes y elementos del mapa.
- Recompensas: partículas (estrellas, confeti, monedas que vuelan hasta el contador), destellos y "pop" de escala.
- Preferir CSS (transform/opacity) y Web Animations API; nada que trabe en celulares de gama baja
  (no animar `filter` ni `box-shadow` grandes en bucle; usar `will-change` con cuidado).
- Siempre respetar `prefers-reduced-motion: reduce` (ya hay una regla global en styles.css).

## Cómo trabajar
1. Antes de cambiar algo visual, sacá captura con Playwright (360–430 px de ancho) y mirála.
2. Hacé el cambio con variables y clases reutilizables en `src/styles.css`; evitá estilos sueltos repetidos.
3. Volvé a capturar y compará. Revisá contraste y tamaño de botones (hay una prueba e2e de 44 px).
4. Anotá decisiones grandes en "Decisiones finales" de `docs/SPEC.md`.
