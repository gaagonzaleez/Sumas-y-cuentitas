# mateAventuras: especificación para Codex

2026-10-12 · @Gabriel

## Resumen

mateAventuras es una app de matemáticas y finanzas para nenas de 2.º grado (7 a 8 años), planteada como juego de aventura con avatar y mascota propios.

- **Objetivo pedagógico:** que practiquen números, sumas, restas, tablas, dinero y problemas, y que aprendan a ahorrar, comparar precios y armar un presupuesto simple.
- **Cómo se juega:** recorren un mapa de 7 mundos con niveles de 5 grados cada uno, ganan estrellas, monedas y premios especiales, personalizan su avatar y hacen crecer una mascota.
- **Cuando se equivocan:** el juego les explica paso a paso cómo resolverlo, sin castigo.
- **Entre amigas:** cada nena juega sola y también en un grupo con código, con tabla de posiciones semanal.
- **Plataforma:** app web instalable (PWA) para celular y tablet.
- **Idioma y moneda:** español rioplatense y pesos argentinos.
- **Alcance de la versión 1:** modo Aventura y modo Mascota. El modo Ciudad o Almacén queda para la versión 2.
- **Nombre de trabajo:** mateAventuras (nombre definitivo elegido por Ga). El repositorio se sigue llamando Sumas-y-cuentitas.
- **Referencia de diseño:** 15 pantallas en `docs/design/` (imágenes PNG y fuentes HTML; ver `docs/design/README.md`). Sus dibujos son provisorios; sirven de guía de diseño, no de arte final.

## Plataforma, usuarios y roles

La app es una PWA pensada primero para celular en vertical y tablet; cada nena tiene su propio perfil y lo abre desde su dispositivo.

| Rol | Qué hace | Cómo entra |
|---|---|---|
| Adulta o adulto responsable | Crea el perfil de la nena la primera vez (apodo, grado, código de grupo, consentimiento). Puede cambiar el apodo, ver el progreso y borrar el perfil. | Cuenta propia con correo y contraseña |
| Nena | Juega, personaliza su avatar, cuida su mascota y compite en su grupo. | Elige su perfil y pone un PIN de dibujos: toca 3 dibujos en orden, elegidos entre 9 |
| Organizadora del grupo | Crea un grupo, comparte el código y puede quitar jugadoras. Suele ser una de las madres. | Cuenta de adulta |

**Flujo del primer ingreso:**

1. La adulta crea su cuenta y el perfil de la nena.
2. La nena abre la app en su dispositivo y entra con su contraseña de dibujos.
3. Elige a su guía: Chispa o Seño Cande.
4. Crea su avatar. Es lo primero que hace y la guía lo festeja.
5. Elige y nombra a su mascota.
6. Llega al mapa de la aventura.

Jugar sin grupo está permitido; en ese caso no aparece tabla de posiciones.

## Estilo visual y personajes

El estilo es colorido, redondeado y cálido, en la línea de los juegos de avatares como Avatar World: personajes personalizables, escenarios ilustrados y mucho festejo. Todo el arte debe ser original.

**Regla importante:** no copiar personajes, escenarios, íconos, logos ni ilustraciones de Avatar World ni de ningún otro juego. Solo se toma la idea general: avatar protagonista, mundos para recorrer y recompensas visuales.

**Dirección de arte:**

- Formas planas con bordes suaves, personajes de cabeza grande, ojos expresivos y proporciones tiernas.
- Escenarios ilustrados por mundo: isla, valle, montaña, bosque, mercado, pueblo e isla del tesoro.
- Caminos de puntitos entre niveles y personajes que acompañan el recorrido.
- Festejos en cada acierto: brillos, confeti y rebote suave. Nada de violencia ni sustos.
- Un solo tono emocional: amable, alegre y paciente.

**Paleta y tipografía de la guía de diseño:**

| Uso | Valor |
|---|---|
| Violeta principal (botones, selección) | #5B3FE0 |
| Amarillo estrella y monedas | #FFC93C |
| Turquesa (aciertos, progreso) | #0FA88F |
| Coral (mascota, detalles) | #E8505B |
| Tinta (texto) | #2B2350 |
| Fondo | #F3EEFF |

Títulos en Fredoka y texto en Nunito, ambas de Google Fonts.

**Componentes base:**

- Botones grandes y redondeados, de al menos 44 px de alto, con sombra inferior sólida.
- Texto de lectura de 16 px o más.
- Contraste de texto 4.5:1 como mínimo. El color nunca es la única señal de algo.
- Íconos con trazo, no emojis.

**Producción de arte:** el avatar se arma por capas (cuerpo, piel, ojos, boca, pelo, ropa, accesorios) para poder combinarlas. Mascotas y personajes guía en SVG o PNG con una versión por etapa de crecimiento y por estado de ánimo.

## Pantallas y navegación

La versión 1 tiene 15 pantallas diseñadas (ver `docs/design/`). Todas son para celular vertical (390 × 844 px de referencia) y deben adaptarse a tablet.

El menú inferior tiene 4 botones: Aventura, Mascota, Grupo y Tienda. El mapa es la pantalla de inicio de cada día.

| # | Pantalla | Para qué sirve | Elementos clave |
|---|---|---|---|
| 1 | Registro de la mamá | La adulta crea el perfil | Apodo, código de grupo, grado, casilla de consentimiento |
| 2 | Crear avatar | La nena arma su personaje | Piel, pelo, ropa, ítems bloqueados con precio en monedas |
| 3 | Elegir mascota | Elige y nombra a su mascota | Pestañas Todas, Reales, Fantasía y Mar; campo de nombre |
| 4 | Elegir guía | Elige entre Chispa y Seño Cande | Frase de ejemplo y botón para escuchar la voz |
| 5 | Mapa de la aventura | Recorre los 7 mundos | Camino, mundos bloqueados, mascota, monedas, estrellas |
| 6 | Ejercicio | Resuelve problemas | Barra de progreso, consigna con audio, opciones, mensaje de acierto |
| 7 | Mi mascota | La cuida y la hace crecer | Barra de crecimiento que sube y baja con avisos, ánimo y hambre; Alimentar, Jugar, Vestir |
| 8 | Tabla de posiciones | Compite con su grupo | Podio, su lugar, reto grupal |
| 9 | Si se equivocan | Mini lección paso a paso | Cuenta en columnas, diagnóstico, 3 pasos, Ver de nuevo, Siguiente paso |

**Pantallas 10 a 15 (diseñadas después):**

| # | Pantalla | Archivo |
| --- | --- | --- |
| 10 | Elegir grado de un nivel: los 5 grados con sus estrellas, bloqueos y "+10 monedas al repetir" | `GradoElegir` |
| 11 | Festejo de premio especial al pasar un nivel o vencer a un jefe | `Festejo` |
| 12 | Tienda de ítems de avatar y mascotas, con ofertas semanales y premios de jefe bloqueados | `Tienda` |
| 13 | Ejercicio de dinero: pagar con billetes y monedas | `Dinero` |
| 14 | Panel de la adulta: progreso, errores frecuentes, cambiar apodo y borrar perfil | `Panel` |
| 15 | Entrar con 3 dibujos secretos | `LoginDibujos` |

**Estados a cubrir en cada pantalla:** cargando, sin conexión, error y vacío (por ejemplo, grupo sin otras jugadoras).

## Mundos, niveles y grados (2.º grado)

Hay 7 mundos de 8 niveles cada uno, más un jefe final por mundo. Cada nivel tiene 5 grados de dificultad y cada grado dura al menos 5 minutos de juego.

**Límites de contenido:**

- Números hasta el 1.000. Un desafío opcional llega al 10.000.
- Sumas y restas con y sin llevar. Arrancan chicas y el rango sube de a 10 hasta 100, y después hasta 1.000, según cómo juegue.
- Tablas del 2, 5, 10, 3 y 4 en los primeros grados. Las del 6 al 9 aparecen como desafío en los grados 4 y 5.
- Dinero con valores simples de kiosco. Los montos arrancan chicos y suben hasta $1.000.

**Orden de desbloqueo (propuesta):** los mundos 1 a 4 van en orden. El Mercado (5) se abre al terminar el mundo 2, el Pueblo (6) al terminar el 4 y la Isla del Tesoro (7) al terminar el 5. Así alternan matemática y dinero.

### Niveles y grados

Cada nivel tiene 5 grados que suben la dificultad dentro del mismo tema, y cada grado dura al menos 5 minutos de juego.

**Cómo se avanza:**

- Al completar el grado 1 de un nivel se desbloquea el grado 1 del nivel siguiente.
- La nena puede volver a cualquier nivel anterior para jugar sus grados 2 a 5, practicar y ganar monedas para comprar más cosas para su avatar.
- Cada grado se desbloquea al completar el anterior.
- El jefe de cada mundo se abre al completar el grado 1 del nivel 8. Vencerlo en grado 1 abre el mundo siguiente y da el premio principal. También tiene 5 grados.

**Cuánto dura un grado:** mínimo 5 minutos de juego activo y 15 ejercicios resueltos, con 70 % de aciertos o más. Las pausas no cuentan. Si termina los ejercicios antes de los 5 minutos, el juego agrega más hasta llegar.

**Qué cambia en cada grado (ejemplo con sumas y restas):**

| Grado | Rango inicial | Techo | Qué cambia |
|---|---|---|---|
| 1 | 20 | 100 | Ayudas visibles: dibujos y bloques |
| 2 | 50 | 200 | Menos ayudas |
| 3 | 100 | 500 | Ejercicios mezclados con problemas |
| 4 | 200 | 1.000 | Con llevada o préstamo y más pasos |
| 5 | 500 | 1.000 | Tres sumandos y reloj opcional |

**Regla clave:** los rangos que se nombran en los niveles de los mundos 2 y 3 (como sumas hasta 10 o hasta 20) son el punto de partida, no un tope. El rango sube con la escalera de dificultad. En los otros temas el mismo mecanismo sube los factores de las tablas, los montos de dinero o el tamaño de los números.

### Mundo 1: Isla de los Números

1. Contar y escribir hasta 20.
2. Leer y escribir hasta 100.
3. Anterior y siguiente.
4. Comparar y ordenar (mayor, menor, igual).
5. Familias de los números: familia del 10 (10 al 19), del 20 (20 al 29), y así hasta el 90.
6. Descomponer en decenas y unidades (hasta 99).
7. Centenas, decenas y unidades hasta el 1.000, y la familia de los cien.
8. Escribir con letras los números hasta el 100.

Jefe: armar y escribir un número de 3 cifras de varias maneras.

### Mundo 2: Valle de las Sumas

1. Sumas hasta 10.
2. Sumas hasta 20.
3. Sumar decenas exactas (20 + 30).
4. Sumas de 2 cifras sin llevar.
5. Sumas de 2 cifras llevando.
6. Sumar 3 números.
7. Sumas de hasta 3 cifras.
8. Problemas de sumar.

Jefe: una cuenta larga que combina los pasos anteriores.

### Mundo 3: Montaña de las Restas

1. Restas hasta 10.
2. Restas hasta 20.
3. Restar decenas exactas (50 − 20).
4. Restas de 2 cifras sin pedir prestado.
5. Restas de 2 cifras pidiendo prestado.
6. ¿Cuánto falta para...? (completar hasta 10, 20 o 100).
7. Restas de hasta 3 cifras.
8. Sumas y restas juntas, y la cuenta inversa para comprobar.

Jefe: una cuenta de varios pasos con sumas y restas.

### Mundo 4: Bosque de las Tablas

1. Grupos iguales de objetos.
2. Suma repetida (4 + 4 + 4).
3. Tabla del 2.
4. Tabla del 5.
5. Tabla del 10.
6. Tabla del 3.
7. Tabla del 4.
8. Repaso mezclado de todas las tablas.

Jefe: carrera de tablas sin tiempo límite. Desafío extra: tablas del 6, 7, 8 y 9.

### Mundo 5: Mercado de Monedas

1. Reconocer billetes y monedas.
2. Contar monedas.
3. Armar un monto hasta $100.
4. Pagar justo.
5. Armar montos hasta $1.000 con billetes.
6. Comparar precios: cuál es más barato.
7. Dar vuelto simple.
8. Compras con varios productos.

Jefe: atender la caja del mercado con varios clientes seguidos.

Los billetes y monedas del juego son didácticos, con valores simples (por ejemplo $1, $2, $5, $10 y billetes de $20, $50, $100, $200, $500 y $1.000). No se reproducen billetes reales.

### Mundo 6: Pueblo de los Problemas

1. Problemas de juntar.
2. Problemas de agregar.
3. Problemas de quitar.
4. Problemas de comparar.
5. Elegir qué operación usar.
6. Problemas de 2 pasos.
7. Problemas con dinero.
8. Problemas con un dato que sobra o falta.

Jefe: un misterio con 3 problemas encadenados.

Todos los problemas tienen historia corta, dibujo y audio.

### Mundo 7: Isla del Tesoro (finanzas)

1. Qué es el dinero y para qué sirve.
2. Ahorrar: la alcancía y las metas.
3. Necesidad o deseo.
4. Comparar precios y elegir la mejor compra.
5. Presupuesto simple ("tengo $1.000, ¿qué compro?").
6. El trabajo y el dinero: quién trabaja y cómo cobra.
7. Compartir y donar.
8. Un plan de ahorro para llegar a una meta.

Jefe: armar el plan del tesoro con presupuesto, ahorro y una parte para compartir.

La parte de finanzas usa conceptos muy visuales (alcancía que se llena, dos productos para comparar) y poca lectura.

## Ejercicios y dificultad adaptativa

Cada nivel mezcla varios tipos de ejercicio para que no sea todo tocar la respuesta, y la dificultad se ajusta sola según cómo le va a cada nena.

**Tipos de ejercicio:**

| Tipo | Cómo se juega | Se usa en |
|---|---|---|
| Elegir respuesta | Toca una de 3 o 4 opciones grandes | Todos los mundos |
| Arrastrar y soltar | Mueve objetos a grupos, o billetes a la caja | Tablas, dinero |
| Completar | Escribe con un teclado numérico grande | Sumas, restas, números |
| Armar con bloques | Junta centenas, decenas y unidades | Números, descomponer |
| Pagar y dar vuelto | Elige billetes y monedas | Mercado, finanzas |
| Ordenar | Ordena números o productos de menor a mayor | Números, precios |
| Memoria | Une cada cuenta con su resultado | Tablas |
| Carrera contra el reloj | Opcional, apagada por defecto | Tablas, sumas |

**Los ejercicios se generan por plantillas**, no se escriben uno por uno. Cada plantilla define el enunciado, los números posibles según la dificultad, la respuesta correcta y las respuestas incorrectas típicas (ver la sección de errores). Así cada nivel tiene un banco amplio y no se repite el mismo ejercicio dentro de una sesión.

**Dificultad adaptativa (valores iniciales, deben poder ajustarse en un archivo de configuración):**

- Cada grado tiene un rango inicial y un techo (ver Niveles y grados) y arranca en su rango inicial.
- Cinco aciertos seguidos sin errores ni ayudas suben un peldaño de la escalera de rango: 20, 30, 40 y así hasta 100, y después 200, 300 y así hasta 1.000.
- Un error no cambia el rango. Dos errores seguidos bajan un peldaño y activan una pista.
- Nunca se pierde por tiempo. La carrera contra el reloj es opcional y no cambia las estrellas.

**Estrellas por ****grado (hasta 15 por nivel)****:**

- 1 estrella: completa el grado.
- 2 estrellas: acierta el 75 % o más al primer intento.
- 3 estrellas: acierta el 90 % o más y no usa pistas.

**Pistas:**

1. Primera pista: la guía da un indicio con voz.
2. Segunda pista: se muestra un dibujo que ayuda.
3. Tercera pista o botón de ayuda: se abre la mini lección paso a paso.

## Errores y mini lecciones

Cuando una nena se equivoca, el juego le explica con calma cómo resolverlo; el error nunca resta monedas ni estrellas ya ganadas.

**Flujo:**

1. Primer error: la guía dice algo cariñoso y señala el tipo de error en una frase. Puede reintentar.
2. Segundo error en el mismo ejercicio, o toque en el botón de ayuda: se abre la mini lección.
3. La mini lección tiene como máximo 3 pasos. Cada paso tiene un texto de hasta 15 palabras, audio y dibujo. El paso actual se resalta y los resueltos quedan en verde.
4. Botones: Ver de nuevo y Siguiente paso.
5. Al terminar, el juego propone una cuenta parecida. Si la acierta, gana las monedas completas.

**Cómo se detecta el error:** por reglas, no por inteligencia artificial en tiempo real. Cada respuesta incorrecta posible de una plantilla de ejercicio lleva una etiqueta de error (`errorTag`) que dice qué se equivocó. Por ejemplo, en 47 + 38 la respuesta 75 corresponde a olvidar la llevada.

**Errores típicos y cómo se explican:**

| Tema | Error típico | Cómo se explica |
|---|---|---|
| Suma con llevada | Olvida la llevada (47 + 38 = 75) | Columnas de decenas y unidades, 10 unidades se agrupan en 1 decena |
| Resta pidiendo prestado | Resta el número menor del mayor en cada columna (52 − 27 = 35) | Bloques: se desarma una decena en 10 unidades |
| Tablas | Suma en vez de multiplicar (3 × 4 = 7) | Grupos iguales y suma repetida (4 + 4 + 4) |
| Dinero y vuelto | Suma en vez de restar para el vuelto | Billetes y monedas que se mueven en pantalla |
| Descomponer | Invierte decenas y unidades (47 = 7 decenas y 4 unidades) | Tablero de valor posicional con bloques |
| Escribir números | Escribe 407 para cuarenta y siete | Tablero de centenas, decenas y unidades |
| Problemas | Elige la operación contraria | Se resaltan los datos de la historia y se dibuja la situación |

**Repaso inteligente:** el juego guarda cada `errorTag`. Si el mismo error aparece 3 veces en una semana, el mapa muestra una tarjeta que sugiere repasar ese tema. La adulta ve esos errores frecuentes en su panel.

**Tono de los mensajes:** nunca "mal" o "incorrecto". Se usan frases como "¡Casi! Probemos de nuevo juntas" o "Equivocarse también es aprender".

## Economía del juego

Hay dos recompensas: las monedas se gastan en la tienda, y las estrellas miden el avance, hacen crecer a la mascota y suman puntos en la tabla.

Las monedas del juego no son dinero real ni se compran con dinero real.

**Cómo se ganan (valores iniciales, ajustables en un archivo de configuración):**

| Evento | Monedas | Estrellas |
|---|---|---|
| Respuesta correcta al primer intento | 5 | 0 |
| Respuesta correcta después de una ayuda | 2 | 0 |
| Completar un grado | 20 | 1 a 3 |
| Vencer a un jefe | 50 | 3 |
| Jugar 3 días seguidos | 15 | 0 |
| Completar el reto grupal | 30 | 0 |
| Repetir un grado ya completado | 10 | 0 |

**Cómo se gastan (precios de ejemplo del diseño):**

| Ítem | Monedas |
|---|---|
| Alimentar a la mascota | 10 |
| Pelo de color especial | 20 |
| Ropa o vestido | 30 |
| Tiburoncito | 40 |
| Unicornio bebé | 60 |

Los demás precios se definen por rareza, entre 10 y 100 monedas, en el catálogo de ítems.

**Alcancía (propuesta para enseñar a ahorrar):** la nena puede elegir un ítem de la tienda como meta y guardar monedas para llegar a él. Al alcanzar la meta recibe un pequeño bono, por ejemplo 10 %. Esto conecta el juego con el contenido de la Isla del Tesoro.

**Límites:** sin publicidad, sin compras con dinero real y sin cajas sorpresa pagas.

### Recompensas especiales

Además de las monedas, pasar de nivel y vencer a un jefe dan premios únicos que no se pueden comprar con monedas. Así hay motivos para avanzar y también para volver a jugar niveles anteriores.

| Logro | Premio |
|---|---|
| Completar el grado 1 de un nivel | Un ítem exclusivo de avatar: un vestido, un accesorio o un peinado con el tema del mundo |
| Completar los 5 grados de un nivel | Un accesorio raro y una estampita coleccionable |
| Vencer a un jefe en grado 1 | Un avatar completo, con su ropa y accesorios. Puede usarlo entero o mezclar sus partes |
| Vencer a un jefe en los 5 grados | Una versión dorada de ese avatar y un marco especial |

**Avatares de los jefes (ejemplos para empezar):**

| Mundo | Avatar del jefe |
|---|---|
| 1. Isla de los Números | Exploradora de la isla |
| 2. Valle de las Sumas | Jardinera mágica |
| 3. Montaña de las Restas | Alpinista |
| 4. Bosque de las Tablas | Hada del bosque |
| 5. Mercado de Monedas | Tendera del mercado |
| 6. Pueblo de los Problemas | Detective |
| 7. Isla del Tesoro | Capitana del tesoro |

Cada premio se entrega en una pantalla de festejo donde la nena lo ve puesto en su avatar y puede ponérselo al instante. Un premio no se repite. Son 56 ítems de nivel (7 mundos por 8 niveles), 7 avatares de jefe y sus versiones doradas.

## Avatar y mascotas

El avatar es el gancho del juego: crearlo es lo primero que hace la nena, con la guía festejando, y aparece en el mapa, en la tabla y junto a su mascota.

**Avatar por capas:**

| Capa | Gratis al empezar | Meta de catálogo a mediano plazo |
|---|---|---|
| Tono de piel | 8 tonos | 10 tonos |
| Ojos | 4 formas, 6 colores | 12 formas, 10 colores |
| Detalles de la cara | Ninguno | Pecas, hoyuelos, brillos de fiesta y distintas sonrisas |
| Estilo de pelo | Largo, corto, rulos, colitas | 25 estilos: trenzas, chongos, flequillos, rulos, ondas y más |
| Color de pelo | Negro, castaño, rubio, colorado | 12 colores, con colores de fantasía: rosa, celeste, violeta y arcoíris |
| Ropa (remeras, pantalones, polleras, vestidos, camperas) | 4 prendas básicas | 60 prendas |
| Disfraces y sets temáticos | Ninguno | 7 sets de mundos y al menos 10 de temporada |
| Calzado | 2 pares | 12 pares |
| Accesorios (moños, gorros, anteojos, mochilas, alas, coronas, varitas, collares) | Ninguno | 60 accesorios |
| Fondos y marcos del avatar | 3 fondos | 15 fondos y 10 marcos |
| Expresiones y poses | 3 | 8 |

**Lanzamiento:** la primera versión sale con unos 100 ítems en total, priorizando pelo, ropa y accesorios, y se suman ítems nuevos cada mes hasta llegar a esta meta.

Puede cambiar su look cuando quiera. Al pasar de nivel y vencer a jefes gana ropa y accesorios exclusivos (ver Recompensas especiales). Los estilos de pelo y tonos de piel deben mostrar diversidad real.

**Variedad y renovación (propuesta):** la variedad de avatar y accesorios es una prioridad del juego, porque es lo que más engancha.

- Ropero con 5 conjuntos guardados para cambiar de look rápido.
- Cada semana la tienda destaca 4 ítems en oferta, para que siempre haya algo nuevo que desear.
- Sets de temporada (primavera, Navidad, vacaciones de invierno) que se agregan sin actualizar el código, porque el catálogo es contenido.
- Todo ítem tiene versión para cualquier tono de piel y tipo de pelo.

**Mascotas:**

| Tipo | Mascotas |
|---|---|
| Reales | Gatito, perrito, conejito |
| Fantasía | Dragoncito, unicornio bebé, fénix |
| Mar | Tiburoncito, delfín, pulpito, tortuga marina |

Gratis al empezar: gatito, perrito, conejito y dragoncito. El resto se desbloquea con monedas. Cada mascota se puede nombrar.

**Barra de crecimiento (sube y baja):** la mascota tiene una barra de 0 a 300 puntos con 3 etapas. La barra muestra cuánto falta para crecer y avisa cuando está por volver a una etapa anterior.

- Bebé: de 0 a 99 puntos.
- Joven: de 100 a 199 puntos.
- Grande: de 200 a 300 puntos.

**Cómo sube (valores iniciales):** +1 punto por cada estrella ganada, +3 al alimentarla y +2 al jugar con ella (una vez por día).

**Cómo baja:** si pasan 3 días sin jugar, empieza a perder 5 puntos por día. Con la barra llena tarda 24 días en volver a joven y unos 44 en volver a bebé. Una mascota grande vuelve a ser joven, y después bebé, si la nena tarda muchos días en volver.

**Avisos en la barra:**

- Flecha verde y mensaje cuando faltan 15 puntos o menos para crecer: “¡Dragui está por crecer!”.
- Flecha naranja y mensaje suave cuando está a 15 puntos o menos de volver a una etapa anterior: “Dragui te extraña, ¡jugá hoy para que no se achique!”.

**Al volver a jugar:** durante 3 días gana puntos dobles (“regreso feliz”) para recuperar rápido.

**Reglas:** al cambiar de etapa cambia el dibujo, con una animación tierna. La mascota nunca desaparece, mantiene su nombre y sus accesorios, y la etapa mínima es bebé.

Cada mascota necesita un dibujo por etapa y por estado de ánimo (contenta, normal, extrañando).

**Cuidado:**

- Alimentar cuesta 10 monedas y sube la barra Panza llena.
- Jugar es gratis y sube la barra Contento.
- Vestir usa los accesorios de la mascota.
- Si pasa días sin jugar, la mascota la extraña con ternura y su barra de crecimiento empieza a bajar. Contento baja hasta un mínimo de 30 y Panza llena hasta 20.
- La mascota nunca se enferma, se escapa ni muere. Puede volver a ser bebé, pero nunca desaparece. No hay mensajes de culpa.

## Voz y personajes guía

La voz es parte central del juego: lee las consignas, festeja y anima, con un tono simpático, divertido, empático y amoroso.

**Dos guías, a elección de la nena (se puede cambiar cuando quiera):**

| Guía | Quién es | Ejemplo de frase |
|---|---|---|
| Chispa | Estrellita mágica, divertida y cariñosa | "¡Hola, campeona! ¿Lista para contar estrellitas conmigo?" |
| Seño Cande | Maestra simpática que anima y da pistas con paciencia.  | "¡Muy bien, campeona! Vamos a resolverlo juntas." |

**Voz en español rioplatense**, con ritmo pausado y claro. Cada guía necesita su propio juego de audios.

**Implementación:**

- Usar audio generado en la nube y guardado como archivos (mp3 u ogg), no la voz del dispositivo, que suena distinto en cada celular.
- La voz debe ser gratis y lo más natural y simpática posible (ver Decisiones finales).
- Las consignas con números cambian según el ejercicio, así que el audio se genera por plantilla y se guarda en caché por texto. Los audios del nivel se precargan al entrar.
- Cada consigna tiene botón de altavoz para repetirla y subtítulo siempre visible.
- Debe haber una opción para silenciar la voz.

**Catálogo de frases a producir, por guía:**

- Bienvenida y despedida.
- Consignas de cada tipo de ejercicio.
- Aciertos, al menos 8 variantes.
- Errores amorosos, al menos 8 variantes.
- Pistas.
- Mini lecciones, paso por paso.
- Mascota que extraña a la nena.
- Festejo al terminar un nivel, un jefe y un reto grupal.

**Tono:** nunca sarcasmo ni la palabra "mal". En lugar de "incorrecto" se dice "casi". Los textos deben revisarse como español de Argentina.

## Grupos y tabla de posiciones

Un grupo es un club de nenas que comparten un código y una tabla semanal; la competencia es suave y todas tienen chance de ganar.

**Grupos:**

- La organizadora (una adulta) crea el grupo y recibe un código con formato PALABRA-4 dígitos, por ejemplo LUNA-4821.
- Cada nena entra al grupo con ese código, que carga la mamá al crear el perfil.
- En la versión 1, una nena pertenece a un solo grupo. Máximo de 30 jugadoras por grupo (propuesta).
- La organizadora puede quitar jugadoras y cerrar el grupo.

**Tabla de posiciones:**

- Los puntos son las estrellas ganadas en la semana, de lunes 00:00 a domingo 23:59, hora de Argentina.
- Hay dos pestañas: Esta semana y Siempre.
- Se muestra un podio con las 3 primeras y la lista de las demás. La nena siempre ve su propia posición resaltada.
- No hay tope diario de estrellas ni de monedas (decisión de Ga): cuanto más juega, más gana.

**Reto grupal semanal:**

- Meta de estrellas que juntan entre todas, calculada según la cantidad de jugadoras. Ejemplo del diseño: 2.500 estrellas con 6 jugadoras.
- Se muestra una barra de progreso y los días que faltan.
- Al cumplirlo, cada integrante recibe 30 monedas y un ítem sorpresa.

**Lo que NO hay:** chat, mensajes libres, fotos ni enlaces entre nenas. Solo se ve apodo, avatar y puntos.

## Seguridad y privacidad de menores

La app es para menores de edad, así que guarda los datos mínimos y no tiene ninguna forma de contacto con desconocidos.

**Datos que se guardan:** apodo, grado, avatar, mascota, progreso y puntos. Nada más.

**Datos que no se piden ni se guardan:** nombre real, apellido, foto, ubicación, contactos, micrófono, cámara ni identificadores de publicidad.

**Reglas:**

- El perfil lo crea una persona adulta y debe aceptar de forma explícita que la nena juegue con apodo y avatar.
- El apodo se valida: sin nombre real, sin groserías y sin datos de contacto. Se usa una lista de palabras bloqueadas. La adulta puede cambiarlo.
- No hay chat, mensajes libres, fotos, enlaces externos, publicidad ni compras con dinero real.
- No se usan servicios de analítica de terceros con fines de publicidad. Solo eventos propios y mínimos.
- Los datos viajan por HTTPS y se guardan cifrados en el servidor. Cada perfil solo puede leer sus propios datos y los de su grupo, con reglas de acceso por fila en la base.
- Recordatorio suave a los 30 minutos de juego seguido: "¡Hora de descansar!" (propuesta).

**Panel de la adulta:** ve el progreso de la nena, el tiempo de juego y los errores frecuentes, y puede borrar el perfil. Al borrar el perfil se eliminan todos sus datos.

**Normativa:** revisar con un profesional las obligaciones de la Ley 25.326 de Protección de Datos Personales de Argentina antes de publicar la app. Este documento no es asesoramiento legal.

## Arquitectura técnica sugerida

Se propone una PWA hecha con React y TypeScript, un backend administrado con base Postgres y audios guardados como archivos. Codex puede cambiar estas elecciones si justifica otra mejor.

| Capa | Propuesta | Notas |
|---|---|---|
| App | React, TypeScript y Vite | Diseño mobile-first de 360 a 430 px, adaptable hasta 1024 px |
| Instalable | PWA con service worker | Ícono, pantalla completa, actualización automática |
| Estado local | IndexedDB | El progreso se guarda en el dispositivo y se sincroniza |
| Backend | Supabase (Postgres, Auth, Storage y funciones) | Alternativa: Firebase |
| Seguridad de datos | Reglas de acceso por fila | Cada perfil lee solo lo suyo y lo de su grupo |
| Audio | Archivos mp3 u ogg en almacenamiento con CDN | Precarga de audios por nivel |
| Arte | SVG por capas para avatar, mascotas y guías | Animación con CSS o Lottie |
| Pruebas | Vitest y Playwright | Ver criterios de aceptación |

**Funcionamiento sin internet:** los niveles ya visitados y sus audios se pueden jugar sin conexión. El progreso se sincroniza al volver la conexión. La tabla de posiciones y el cambio de grupo requieren conexión.

**Estructura de carpetas sugerida:**

- `src/features/`: auth, avatar, pet, map, exercise, lesson, group, shop.
- `src/engine/`: generadores de ejercicios, dificultad adaptativa, puntaje y detección de errores.
- `content/worlds/`: un archivo por mundo con niveles y plantillas de ejercicio.
- `content/config/`: premios, precios, umbrales de estrellas y reglas de dificultad.
- `content/audio/`: textos y audios por guía.

**Contenido como datos:** mundos, niveles, plantillas, ítems y precios viven en archivos JSON, no dentro del código, para poder agregar contenido sin tocar la lógica.

**Accesibilidad:** textos mínimos de 16 px, botones de 44 px o más, contraste 4.5:1, navegación comprensible sin leer y subtítulos en todo audio.

## Modelo de datos

Estas son las tablas mínimas para la versión 1; Codex puede ajustar nombres y tipos.

| Tabla | Campos clave | Notas |
|---|---|---|
| guardians | id, email, creado_en | Cuenta de la adulta |
| players | id, guardian_id, apodo, grado, dibujos_hash, guia (chispa o cande), activo | Perfil de la nena |
| groups | id, nombre, codigo, organizadora_id, max_jugadoras | Código único |
| group_members | group_id, player_id, unido_en | Una fila por nena |
| wallets | player_id, monedas, estrellas_total | Saldo y avance |
| level_progress | player_id, world_id, level_id, grado (1 a 5), estrellas (0 a 3), mejor_rango, tiempo_activo_s, completado_en | Un registro por nivel y grado |
| attempts | id, player_id, level_id, plantilla_id, params, respuesta, correcta, error_tag, pistas, ms, creado_en | Cada respuesta |
| avatar_items | id, capa, nombre, precio, desbloqueo, asset | Catálogo |
| player_items | player_id, item_id, equipado | Ítems propios y puestos |
| pets | id, especie, tipo (real, fantasía, mar), precio, assets_por_etapa | Catálogo |
| player_pets | player_id, pet_id, nombre, crecimiento (0 a 300), contento, panza_llena, ultima_visita | Mascota elegida |
| weekly_scores | group_id, player_id, semana, estrellas | Tabla de posiciones |
| group_challenges | id, group_id, semana, meta, progreso, premio | Reto grupal |
| audio_assets | id, guia, texto_hash, url | Caché de audios |
| rewards | id, tipo (nivel o jefe), world_id, level_id, grado, item_id o set_id | Premios únicos por logro |
| avatar_sets | id, nombre, world_id, item_ids | Avatares completos de los jefes |

**Reglas de datos:**

- Los mundos, niveles, plantillas, premios y precios están en archivos de contenido, y las tablas solo guardan referencias por id.
- `error_tag` usa un vocabulario fijo definido en el contenido, para poder contar errores frecuentes.
- Todo dato de una nena se borra en cascada al borrar su perfil.
- La semana se calcula en hora de Argentina (America/Argentina/Buenos_Aires).

- El crecimiento de la mascota se recalcula al abrir la app a partir de ultima_visita, sin tareas programadas.

## Plan de entrega y criterios de aceptación

Conviene construir en 6 etapas, cada una jugable por sí sola, para probarla con nenas reales antes de seguir.

**Etapas:**

1. **Base:** proyecto PWA, estilo visual, registro de la adulta, perfiles, guía, avatar y mascota (pantallas 1 a 4).
2. **Núcleo del juego:** mapa, niveles con 5 grados, escalera de dificultad, motor de ejercicios por plantillas, mundos 1 a 4, monedas y estrellas, voz y subtítulos (pantallas 5 y 6).
3. **Errores y repaso:** etiquetas de error, mini lecciones y repaso (pantalla 9).
4. **Mascota y tienda:** cuidado de la mascota con barra de crecimiento que sube y baja, tienda, alcancía y recompensas especiales (pantalla 7 y tienda).
5. **Grupos:** código, tabla semanal y reto grupal (pantalla 8).
6. **Dinero y finanzas:** mundos 5, 6 y 7, y panel de la adulta. Después, pulido y prueba con un grupo piloto.

**Criterios de aceptación:**

- Se instala desde el navegador en Android y iPhone y abre en pantalla completa.
- Una nena nueva crea su avatar y llega al mapa en menos de 3 minutos.
- Todos los botones miden 44 px o más y los textos cumplen contraste 4.5:1.
- Cada consigna tiene audio y subtítulo, y se puede repetir y silenciar.
- Cada respuesta incorrecta de cada plantilla tiene `error_tag` y una mini lección asociada.
- El progreso se conserva al abrir la app en otro dispositivo.
- La tabla semanal se reinicia el lunes a las 00:00, hora de Argentina.
- Borrar un perfil elimina todos sus datos.
- La app no pide ni muestra datos personales fuera de los permitidos.
- Los generadores de ejercicios y las reglas de dificultad tienen pruebas automáticas.
- No hay publicidad ni compras con dinero real.

- Cada grado dura al menos 5 minutos de juego activo y 15 ejercicios resueltos.
- Completar el grado 1 desbloquea el nivel siguiente, y se pueden seguir jugando los grados 2 a 5 de los niveles anteriores.
- El rango de números sube un peldaño tras 5 aciertos seguidos sin errores ni ayudas, y baja tras 2 errores seguidos.
- Pasar un nivel y vencer a un jefe entregan una recompensa de avatar única.
- La mascota grande vuelve a ser joven y después bebé tras muchos días sin jugar, con aviso previo en la barra, y nunca desaparece.

## Decisiones finales (prevalecen sobre todo lo anterior)

Ga cerró estas decisiones el 12 de octubre de 2026. Codex no necesita volver a preguntarlas.

**Marca y repositorio**

- Nombre de la app: **mateAventuras**. En pantalla, manifiesto PWA, títulos y audios se usa solo este nombre.
- Repositorio: github.com/gaagonzaleez/Sumas-y-cuentitas (el nombre del repo no cambia).

**Modo de trabajo de Codex (Ga quiere hacer lo menos posible)**

- Codex tiene permiso para ejecutar todo: crear el proyecto, instalar dependencias, hacer commits directo a la rama principal, configurar pruebas y el despliegue automático, y generar arte, audio y contenido.
- Cada etapa se publica sola para que Ga la pruebe en el celular: sitio estático gratis en GitHub Pages, con GitHub Actions. El repo es público, así que no cuesta nada.
- Si Codex queda trabado porque necesita una cuenta, una clave o una decisión que no puede tomar solo, no frena el resto: lo anota en un archivo `NECESITO_DE_GA.md`, con pasos de copiar y pegar, y sigue con otra parte.
- Ga no escribe código ni configura nada fuera de esos pasos puntuales.

**Todo gratis**

- Etapas 1 a 4 funcionan sin servidor: datos en el dispositivo (IndexedDB) y alojamiento en GitHub Pages. No requieren ninguna cuenta nueva.
- Los grupos y la tabla de posiciones (etapa 5) usan Supabase en plan gratuito. Es el único paso que necesita a Ga: crear la cuenta gratuita y pegar la URL y la clave pública como secretos del repo (Codex deja las instrucciones exactas en `NECESITO_DE_GA.md`).
- El plan gratuito de Supabase pausa el proyecto tras 7 días sin uso: Codex agrega una acción programada gratuita de GitHub que lo despierta.
- Sin servicios pagos, sin publicidad y sin compras con dinero real.

**Voz: gratis y lo más natural posible**

- Los audios se generan una sola vez con herramientas gratuitas de código abierto y se guardan como archivos en el repo. Después, la app los reproduce sin costo.
- Primera opción: Piper (voces neuronales abiertas, español de Argentina si está disponible; si no, español latino). Codex prueba además otras voces abiertas gratuitas (por ejemplo Kokoro) y elige la más cálida y clara para una nena de 8 años.
- Chispa y Seño Cande suenan distintas: tono, velocidad y voz base diferentes. Chispa es más aguda y juguetona; Seño Cande, más pausada y maternal.
- Codex verifica y deja anotada la licencia de cada voz antes de usarla, y descarta las que no permitan uso comercial.
- La generación es un script, así que se puede reemplazar por una voz paga más expresiva más adelante sin cambiar la app.
- Las voces gratuitas suenan bastante bien pero menos expresivas que las pagas. Si no alcanza, Ga decide después si vale la pena pagar.

**Arte**

- No hay ilustrador. Codex crea todo el arte como SVG original (avatar por capas, mascotas, guías, escenarios de los 7 mundos, íconos), con el estilo de los diseños y la inspiración general de Avatar World. No copiar nada de ese juego ni de otro (ver Estilo visual).
- Codex arma primero una guía de estilo corta (proporciones de cabeza, grosor de línea, paleta, expresiones) y todo el arte la sigue, para que el conjunto se vea coherente.
- Lanzamiento con unos 100 ítems de avatar, y se suman más cada mes.

**Economía sin topes**

- No hay tope diario de monedas ni de estrellas. Cuanto más juega, más gana (decisión de Ga).
- Se mantienen los valores iniciales de la tabla de monedas y los precios de 20 a 300 monedas según rareza. Todo vive en `content/config/` para ajustarlo sin tocar código.
- Las monedas por repetir un grado ya completado siguen siendo 10 y exigen terminar el grado.
- **Cambio del 12/10/2026:** un grado se completa al contestar las 15 preguntas. No hace falta esperar 5 minutos ni llegar a un porcentaje de aciertos (las estrellas siguen dependiendo de los aciertos).

**Jefes**

- Los avatares de los jefes mezclan todos los temas: exploradora, hada, detective, capitana, princesas, animales y profesiones.
- Cada jefe tiene 5 versiones, una por grado. A medida que la nena sube de grado dentro de un mundo, enfrenta una versión más poderosa (más pasos, números más grandes y un diseño más imponente). Cada versión entrega su premio.

**Entran en la etapa 6, no en la primera versión**

- Reto grupal semanal y alcancía de ahorro (quedan para después de probar la primera versión).

**Pantallas**

- Ga delegó el diseño de las pantallas que faltan. Están en el lienzo de diseño (pantallas 10 a 15). Codex las toma como guía y puede mejorar detalles manteniendo la paleta, la tipografía y las reglas de accesibilidad.

**Libertad creativa (octubre 2026)**

- Ga dio libertad creativa total: quien desarrolle puede cambiar y mejorar cualquier parte del juego (pantallas, mecánicas, mundos, premios, textos, diseño). Se mantienen siempre: gratis y sin publicidad, privacidad de menores, arte propio, tono cálido y accesibilidad.
- Cada nivel mezcla por lo menos 5 juegos distintos.
- Explicaciones: cada cuenta se explica con la estrategia que conviene para esos números (contar, completar el 10, decenas, columnas con centenas, contar saltando como el vuelto; tablas contando de a saltos o con la cuenta vecina). Cada error tiene su propia minilección. Después del primer "¡Casi!" se muestra qué mirar y una pista. Una prueba verifica que toda cuenta escrita en una explicación esté bien hecha.
- Dificultad: cada grado arranca 2 peldaños más arriba que el anterior (1 en tablas) desde el inicio del nivel y puede subir hasta 3 peldaños, sin pasar el techo del nivel (content/config/dificultad.json). Los niveles que prometían "hasta 10/20" se renombraron (Primeras sumas, Sumas más grandes, etc.) porque Ga pidió números más grandes. Los juegos nuevos respetan el tema del nivel (decenas, sin llevar, llevando, prestando) y la tabla del nivel.
