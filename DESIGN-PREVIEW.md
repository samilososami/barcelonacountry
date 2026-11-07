# BCN · Propuesta de diseño en pruebas

## Aislamiento

La rama `design/bcn-preview` parte de `v0` (árbol de `2795f94`). No se publica en el proyecto ni en los dominios del festival. La propuesta se sirve bajo `/BCN/` en un proyecto separado y sin credenciales. El formulario solo demuestra el recorrido: no guarda datos ni envía correos. El archivo de noticias muestra su estado vacío; los documentos legales conservan su contenido original.

## Dirección visual

Fotografía cálida a todo color, negro casi puro #10100f, papel #f2f1eb y rojo #c40000 como acento. Instrument Serif regular e italic para titulares; Manrope para lectura y controles. Márgenes amplios, líneas finas, sin tarjetas decorativas ni efectos metálicos. El logo aprobado mantiene sus proporciones y colores.

Portada de casi una pantalla, revelado editorial de la introducción, carril de retratos con biografías desplegables, cuatro capítulos de experiencias, ubicación panorámica y formulario despejado. Todo el contenido existente sigue accesible. Las fotografías de las personas son las originales, no las ilustradas en las referencias.

## Movimiento

GSAP ScrollTrigger y Lenis: entrada inicial, profundidad suave en fotografías, aparición de bloques al desplazarse y transición de capítulos. Sin secuestrar el scroll, sin carrusel automático. Controles de teclado y desplazamiento táctil nativos. `prefers-reduced-motion` elimina desplazamientos y muestra todo inmediatamente.

## Referencias de composición

Cinco conceptos generados y revisados antes de implementar: portada, festival, artistas, experiencias y contacto. Se conserva su escala y contraste; las fotografías, nombres, textos legales y traducciones reales prevalecen sobre cualquier contenido inventado en los bocetos. No se usa un boceto como imagen de la interfaz.

## Comprobación

Revisar escritorio y móvil, todas las biografías, cuatro capítulos, idiomas, formulario simulado, cookies, enlaces bajo `/BCN/`, rutas legales y movimiento reducido. Confirmar que los dominios del festival siguen sirviendo el CSS de v0 y que la portada del portfolio no cambia.

## Portada y patrocinadores

Apertura finita en dos hojas, título revelado por líneas y luz de entrada sobre la fotografía aprobada. Botones con mayor contraste, controles visibles y logo oficial de Wow My City en SVG local. La fotografía conserva el encuadre y se distribuye en WebP de 840 y 1672 píxeles (115 y 293 KB).

Tres niveles de movimiento: completo en escritorio con capacidad suficiente; ligero en móvil, ahorro de datos, hasta 4 núcleos o hasta 4 GB cuando el navegador ofrece esas señales; sin movimiento si se solicita reducirlo. Una muestra de 90 frames reduce la profundidad y retira Lenis si supera 28 ms de media. La entrada no se repite en bucle; no hay vídeo, canvas ni WebGL. Una pestaña oculta pausa el desplazamiento y la entrada. /BCN y /bcn sirven la misma propuesta, incluidas las rutas interiores.
