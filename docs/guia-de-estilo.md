# Guía de estilo de arte — mateAventuras

Todo el arte del juego es SVG original y sigue estas reglas para que el conjunto se vea coherente. Inspiración general: juegos de avatares (personaje protagonista, mundos, premios visuales). **No se copia** nada de Avatar World ni de ningún otro juego.

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--violeta` | `#5B3FE0` | Botones, selección, camino activo |
| `--violeta-oscuro` | `#3F28B8` | Sombra sólida de botones |
| `--amarillo` | `#FFC93C` | Estrellas, monedas, Chispa |
| `--turquesa` | `#0FA88F` | Aciertos, progreso |
| `--turquesa-oscuro` | `#0B7A68` | Texto de acierto sobre fondo claro (contraste ≥ 4,5:1) |
| `--coral` | `#E8505B` | Mascota, detalles, "volver a bajar" |
| `--naranja` | `#B55A00` | Texto de aviso suave (contraste ≥ 4,5:1) |
| `--tinta` | `#2B2350` | Texto y contorno de todo el arte |
| `--tinta-suave` | `#5E5780` | Texto secundario (≥ 4,5:1 sobre fondo) |
| `--fondo` | `#F3EEFF` | Fondo general |
| `--lila` | `#CFC6F5` | Bordes de campos y tarjetas |
| `--lavanda` | `#E9E3FF` | Fondos de chips y elementos bloqueados |

Colores de apoyo para arte (no para texto): celeste `#CDE9FF`, menta `#D7F5EE`, rosa `#FFE3E6`, crema `#FFF4D1`, durazno `#FFD9B0`, verde hoja `#3DBE7A`, marrón tierra `#8A5A3B`, dorado `#E8B21F`.

**Tonos de piel (8):** `#FBE0CC`, `#F3C49A`, `#E0A878`, `#C98A5C`, `#A86F4A`, `#8A5638`, `#6B3F27`, `#4A2B1B`.

**Colores de pelo (12):** negro `#2A2238`, castaño oscuro `#4B2E22`, castaño `#6B3F27`, castaño claro `#9A6236`, rubio `#E7C15A`, rubio claro `#F2DC8C`, colorado `#C4572A`, cobre `#A8431F`, rosa `#F28FB8`, celeste `#7CC6F2`, violeta `#9A7BF0`, arcoíris (degradado).

## Tipografía
- Títulos: **Fredoka** 600–700.
- Texto: **Nunito** 600–800. Mínimo 16 px para lectura; 13–14 px solo para aclaraciones secundarias cortas.
- Se sirven desde el propio sitio (paquetes `@fontsource`), sin pedidos a terceros.

## Línea y formas
- Contorno: color tinta `#2B2350`, **4 unidades** en lienzos de 200 (≈ 2 %), extremos y uniones redondeadas.
- Íconos de interfaz: lienzo 24 × 24, trazo 2,2, sin relleno salvo acentos. Nunca emojis.
- Formas planas, sin degradados salvo brillos sutiles (blanco al 60 %) y el pelo arcoíris.
- Esquinas siempre redondeadas. Radios de interfaz: 14 (campos), 18–24 (tarjetas), 999 (chips).
- Botones: alto mínimo 52 px (nunca menos de 44), sombra inferior sólida de 4 px del tono oscuro.

## Proporciones de personajes
- Lienzo del avatar: `0 0 200 260`. Cabeza grande: centro (100, 96), ancho 116, alto 112 → la cabeza ocupa ~43 % del alto total (proporción 1 : 2,3, tierna).
- Cuello corto (y 146–158). Torso de y 150 a 220, piernas hasta 250, pies 244–256.
- Ojos: óvalos de 11 × 13 a 38 px del centro, con brillo blanco arriba a la derecha. Mejillas: círculos coral al 35 %.
- Las capas comparten el mismo lienzo y se apilan en este orden: fondo → pelo de atrás → cuerpo → calzado → ropa de abajo → ropa de arriba/vestido → cabeza → cara (ojos, boca, detalles) → pelo de adelante → accesorios.
- Colores variables en los SVG: `var(--piel)`, `var(--pelo)`, `var(--tela)`, `var(--tela2)`. Así un mismo dibujo sirve para cualquier tono de piel y pelo.
- Mascotas: lienzo `0 0 200 200`. Bebé: cabeza 70 % del cuerpo, ojos enormes. Joven: cabeza 55 %, aparecen detalles (cuernitos, orejas más largas). Grande: cabeza 45 %, detalles completos (alas, cola, melena).
- Guías: Chispa es una estrella amarilla de 5 puntas con cara; Seño Cande es una maestra con rodete, anteojos redondos y blusa turquesa.

## Expresiones
| Nombre | Ojos | Boca | Cejas |
|---|---|---|---|
| contenta | óvalos con brillo | sonrisa curva | relajadas |
| feliz / festejo | arcos cerrados (^ ^) | boca abierta | arriba |
| normal | óvalos | línea apenas curva | — |
| pensando | mirada a un costado | boca chiquita | una arriba |
| sorprendida | círculos grandes | "o" | arriba |
| extrañando | óvalos con brillo grande | sonrisa pequeña hacia abajo | inclinadas hacia arriba en el centro (ternura, nunca llanto) |

## Escenarios de los 7 mundos
Cada mundo tiene color de cielo/suelo y un elemento icónico propio:
1. Isla de los Números — arena y mar, palmera con números en los cocos.
2. Valle de las Sumas — pasto verde, flores, molino.
3. Montaña de las Restas — picos con nieve, banderín.
4. Bosque de las Tablas — árboles redondos en filas iguales.
5. Mercado de Monedas — puestitos con toldo a rayas.
6. Pueblo de los Problemas — casitas con techos de colores y lupa.
7. Isla del Tesoro — cofre, mapa y alcancía.

## Tono emocional
Amable, alegre y paciente. Nada de violencia, sustos ni caras enojadas. Los festejos usan brillos, confeti y un rebote suave (se reducen si el dispositivo pide menos movimiento).
