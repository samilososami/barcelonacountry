# Identidad editorial y checkpoint v0

## Versión de referencia

La etiqueta anotada `v0` apunta a `10aabd84e4a9a765daf2a3ad0f5ce24615a704e5`, la versión aprobada inmediatamente anterior a este rediseño. Está publicada en GitHub y conserva el árbol completo del proyecto. El directorio histórico `/backup` conserva su contenido anterior; no sustituye esta etiqueta.

Si se solicita volver a v0, revertir el commit de este restyling en una nueva revisión y publicar normalmente. Si existen cambios posteriores, revisarlos primero para no perder trabajo ajeno al diseño. No reescribir el historial remoto con `reset --hard` ni `push --force`.

## Dirección visual

Una composición editorial inspirada en la sobriedad de [Aman](https://www.aman.com/) y el carácter rural de [Blackberry Farm](https://www.blackberryfarm.com/), adaptada a la identidad aprobada del festival. Referencias consultadas el 7 de noviembre de 2026.

- Negro tinta `#111110`, blanco roto `#f5f4ef`, gris `#686862` y rojo `#c40000` como acento.
- Bodoni Moda para titulares y Manrope para texto y controles. Archivos locales de [Google Fonts](https://github.com/google/fonts), con sus respectivas licencias OFL en `public/fonts`. No se consulta Google Fonts desde el navegador.
- Portada dividida, fotografía a color sin filtro, fecha tipográfica, espacios amplios, líneas finas y esquinas rectas.
- Artistas con retratos y biografías sobre papel claro; experiencias y suscripción sobre negro.
- Categorías con hover, foco y pulsación; fotografía de tamaño estable y contenido sin scroll interior.
- Menú compacto en móvil, isotipo al desplazarse, controles de al menos 44 px y respeto por la preferencia de movimiento reducido.

## Implementación y alcance

`src/editorial.css` reúne los tokens y estilos del restyling, con alcance principal `.editorial.modern-page`. `src/main.tsx` adapta la composición y mantiene los textos, traducciones, artistas, imágenes, enlaces y lógica de suscripción. Las páginas públicas de lectura comparten tipografía y superficies. El panel administrativo y la versión histórica no se rediseñan.

Se mantienen los originales legales, el formulario exclusivo de newsletter, su casilla de privacidad, el bloqueo de Maps hasta consentimiento y la venta de entradas oculta. Esta revisión no activa envíos, publica newsletters ni modifica datos.

## Cotejo visual

Se prepararon cuatro referencias visuales independientes: portada/festival, artistas, detalles y ubicación/suscripción. Se contrastan composición, paleta, jerarquía tipográfica, retratos, botones y espaciado con las capturas del navegador.

Las referencias son guías de composición, no fuentes de contenido. Se conservan los nombres, textos, fotos y orden reales del proyecto, aunque una maqueta generada muestre ejemplos distintos. La cabecera queda negra para alojar el logo aprobado sin crear una variante nueva; Maps conserva su estado de consentimiento real.

| Punto revisado | Resultado y decisión |
| --- | --- |
| Portada | División 48/52, título serif, fotografía original sin filtro y cartel de fecha legible; composición apilada en móvil. |
| Tipografía | Ajustado el eje óptico de Bodoni para evitar trazos demasiado finos en títulos, cifras y el guion de la fecha. |
| Paleta | Tinta y papel claro constantes; corregido el contraste de las etiquetas de estadísticas heredadas del tema oscuro. |
| Artistas | Cuatro columnas en escritorio y dos en móvil; mismos archivos y recortes aprobados, sin tarjetas anidadas. |
| Detalles | Cuatro categorías accesibles por pulsación y foco, con hover en escritorio; imagen estable y texto completo sin scroll interior. |
| Suscripción | Etiquetas legibles, campos con línea fina, botón claro con hover rojo; mismos campos, autorización y única casilla de privacidad. |

Verificación local: compilación de producción y 22 pruebas existentes correctas; navegación, cuatro categorías, ausencia de overflow, Maps bloqueado y entradas ocultas a 320, 390, 768, 1024, 1440 y 1920 px. Revisados los seis idiomas a 390 px. El envío del formulario se verifica interceptando la API local con una respuesta de prueba; no crea registros ni envía correos. Capturas e informe de revisión fuera del repositorio, en `/tools/codex/workspace/bcf-restyle-qa`.
