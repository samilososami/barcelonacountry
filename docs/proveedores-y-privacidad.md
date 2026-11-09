# Proveedores y mantenimiento de los textos legales

Revisión: 4 de noviembre de 2026. Esta ficha documenta la implementación técnica y sus fuentes; no certifica cumplimiento jurídico ni acredita la firma de contratos por Events Mayaan SL.

## Fuente y cambios autorizados

La fuente es el documento `TEXTOS LEGALES BARCELONA COUNTRY FEST.docx`, enviado por Javier González desde `xavierglez@msn.com` el 2 de noviembre de 2026, a las 12:22 (Europe/Madrid), en «RV: HOLA SAMI: CAMBIOS PARA BARCELONA CF». Contiene privacidad, cookies, aviso legal y un bloque separado para el futuro pie de newsletter. El adjunto se ha vuelto a descargar y su SHA-256 coincide con la copia utilizada: `e956dad2040c37f5adb6ebbf2955058a03d0f0127135aa710775f37feebcc903`. El bloque de correo no se integra en esta tarea y no se activa el autoreply.

La instrucción vigente del usuario es restaurar los tres documentos completos, tal cual los originales de Javier, sin añadir contenido. Se conservan sus títulos, fechas del 2 de noviembre, dominio original, puntuación, párrafos, listas y orden. La única sustitución es el marcador registral del aviso legal por el dato facilitado posteriormente por el usuario: «Inscrita en el Registro Mercantil de Barcelona, Sección 8.ª, Hoja B-663513, Inscripción 1.ª.»

El cotejo debe comparar los 82 párrafos de privacidad, 32 de cookies y 49 del aviso legal, incluidos títulos y fechas, con 18, 8 y 6 elementos de lista respectivamente. Solo se normalizan espacios de maquetación; los saltos internos del contacto final de privacidad se conservan. Los enlaces se aplican a palabras ya existentes, sin agregar texto visible. La portada del conjunto y las instrucciones del bloque de correo no forman parte de estas tres páginas.

Esta restauración reemplaza las adaptaciones anteriores sobre dominios, formulario, proveedores y cookies. También devuelve las frases que el original mantiene sobre registro de interesados, casilla opcional y datos de proveedores por completar, así como la repetición «actualizar, modificar o modificar parcialmente». No corregirlas ni omitirlas por iniciativa propia: cualquier revisión del contenido corresponde a Javier. La fidelidad documental no implica que esas descripciones se hayan contrastado jurídicamente con el funcionamiento actual.

El formulario sigue siendo exclusivamente de suscripción, con el botón «Suscribirme» y una única casilla requerida de privacidad, desmarcada de inicio, según la corrección anterior de Xavi. Se conservan los controles de cookies, el bloqueo de Google Maps y el inventario técnico interno. Restaurar los textos no modifica esos comportamientos.

Los documentos públicos viven en `src/privacy/legal-content.ts`; no se sirven desde el DOCX ni contienen HTML arbitrario. Son textos en castellano facilitados por la organización. No generar traducciones legales como si fueran textos aprobados.

La restauración supera un cotejo independiente contra el XML del DOCX y una comparación de los 163 párrafos renderizados en Chromium, con la única sustitución registral documentada. Se comprueban las 32 viñetas, enlaces del índice, apertura de preferencias de cookies y ausencia de desbordamientos a 320, 390, 768, 1024 y 1440 px. La etiqueta telefónica se muestra completa en castellano y catalán. Compilación y 22 pruebas existentes correctas; no se envían correos ni se crean suscripciones durante la verificación.

## Inventario técnico

| Servicio | Uso en este proyecto | Datos relevantes y alcance | Estado |
| --- | --- | --- | --- |
| Vercel | Web, distribución de recursos y API del formulario | Solicitudes HTTP y datos enviados al endpoint de suscripción | En uso |
| Supabase | PostgreSQL, autenticación administrativa y archivos del blog | Inscripciones, consentimiento, sesión administrativa y medios públicos del blog | En uso; proyecto `barcelona-country-admin`, región `eu-west-3` (París), comprobada con el proveedor el 04/11/2026 |
| Arsys | Dominios, DNS y buzón de privacidad | Datos de dominio/operación y mensajes dirigidos al buzón | En uso, según configuración del proyecto y confirmación del usuario |
| Google Maps | Mapa de Fira Cornellà | Conexión del navegador al proveedor, IP, navegador y cookies según su sesión/ajustes | Opcional; bloquear iframe hasta consentimiento y retirarlo al revocar |
| Resend / Plus Five Five, Inc. | Envío de newsletters | Nombre, correo, mensaje y metadatos necesarios de envío; no teléfono ni lugar de baile | Configurado en producción con `news.bcncountryfest.com`; dominio verificado y clave restringida al envío desde ese dominio. El número 1 todavía no está publicado y no se han iniciado envíos reales |

No confundir proveedores operativos con herramientas de desarrollo. GitHub guarda el código, no debe recibir la base de inscritos ni secretos. Las fotografías y tipografías de la página inicial se sirven localmente; los enlaces a Instagram y créditos externos no son embeds. El contenido editorial puede añadir medios HTTPS externos: antes de publicar uno nuevo, revisar si introduce un proveedor adicional que recibe datos del visitante.

## Fuentes oficiales y transferencias

Consultadas el 04/11/2026. Son información pública del proveedor, no prueba de que un contrato particular esté formalizado o de que una certificación cubra cada tratamiento de esta web.

- **Vercel:** su [aviso de privacidad](https://vercel.com/legal/privacy-notice) describe tratamiento internacional y mecanismos de transferencia. Su [Trust Center](https://vercel.com/legal/sub-processors) publica documentación de encargados/subencargados. **Atención:** el [DPA público](https://vercel.com/legal/dpa) consultado indica en su introducción que forma parte de acuerdos Enterprise; comprobar las condiciones aplicables a la cuenta concreta antes de afirmar que ese DPA está firmado o incorporado. No deducir la región de ejecución de la API a partir de la región de Supabase.
- **Supabase:** la [FAQ de residencia y transferencias](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq) distingue el alojamiento regional de accesos de soporte, operaciones y CDN. El [DPA](https://supabase.com/legal/customer-resources/data-processing-addendum) identifica Supabase Pte. Ltd. (Singapur) y contempla cláusulas contractuales tipo. París no equivale a ausencia de transferencias. No afirmar que copias, soporte y recursos distribuidos jamás salen del EEE.
- **Arsys:** [datos societarios, políticas y condiciones](https://www.arsys.es/legal/politica-de-privacidad). No se atribuye al buzón una región de alojamiento o un subencargado no comprobados. La documentación contractual específica del servicio y de su titular debe conservarla la organización.
- **Google:** [política de privacidad](https://policies.google.com/privacy?hl=es), [marcos de transferencia](https://policies.google.com/privacy/frameworks?hl=es) y [cookies y duraciones](https://policies.google.com/technologies/cookies?hl=es). El mapa debe permanecer bloqueado antes de aceptar; no declarar que Google actúa exclusivamente como encargado de esta web.
- **Resend:** [DPA](https://resend.com/legal/dpa) y [privacidad](https://resend.com/legal/privacy-policy). Su DPA identifica Plus Five Five, Inc. y tratamiento principal en Estados Unidos con mecanismos de transferencia. Verificar alcance contractual y configuración antes de habilitar envíos; esta tarea no hace esa activación.

## Almacenamiento del navegador

| Identificador | Quién lo usa | Finalidad | Duración o retirada |
| --- | --- | --- | --- |
| `bcf-cookie-consent` | Web del festival | Guardar elección Google Maps y versión de preferencias | Validez de 180 días; invalidar al cambiar versión; borrar datos del sitio elimina el registro |
| `barcelona-country-language` | Web del festival | Idioma elegido expresamente | Sin vencimiento propio; hasta cambio o borrado de datos del sitio |
| Claves de Supabase Auth (`sb-…-auth-token`) | Panel administrativo | Mantener la sesión solicitada del administrador | Depende de sesión, renovación/expiración/revocación; cierre de sesión o borrado local retira la sesión local |
| Cookies de Google | Google Maps, únicamente tras autorizarlo | Según servicio, sesión y ajustes del visitante | Variable, fijada por Google; la web no puede borrarlas desde su dominio |

La adaptación pública anterior incluía NID (6 meses desde último uso) y `_Secure-ENID` (13 meses) como ejemplos del catálogo oficial de Google; la restauración literal elimina esas adiciones. Este inventario interno no debe copiarse a los textos públicos sin validación. Las cookies efectivamente entregadas deben contrastarse en navegador limpio, con y sin cuenta de Google, al revisar cambios en el embed. Revocar consentimiento impide nuevas cargas desde esta web, pero no deshace transmisiones anteriores ni elimina cookies de dominios externos.

## Revisión obligatoria al cambiar servicios

Cada integración, cambio de dominio, formulario, embed, script, recurso remoto, sistema de pagos, analítica, publicidad o correo debe incluir esta revisión en la misma tarea:

1. Identificar proveedor y entidad, finalidad, datos realmente recibidos y momento de la conexión. Comprobar también imágenes, fuentes, vídeos y URLs multimedia editoriales, no solo dependencias npm.
2. Distinguir servicio activo, previsto, retirado y herramienta de desarrollo. No publicar un proveedor futuro como si ya recibiera los datos.
3. Consultar documentación oficial vigente, cuenta/plan, regiones y acuerdo aplicable. No completar garantías con suposiciones. Registrar lo que deba validar Events Mayaan SL.
4. Actualizar este inventario y contrastar las secciones afectadas de `src/privacy/legal-content.ts` con lo aprobado por Javier. Preparar para su validación cualquier cambio necesario en lo informado antes de activar una nueva integración; no incorporar automáticamente listados ni enlaces técnicos a las páginas públicas.
5. Para servicios no necesarios, bloquear todas sus solicitudes antes del consentimiento; incorporar controles reales, rechazo, retirada, persistencia y pruebas. No basta ocultar un iframe con CSS.
6. Si cambia el alcance de las preferencias, incrementar la versión del consentimiento y solicitar nueva elección. No reutilizar un consentimiento de Maps para analítica/publicidad.
7. Verificar en un navegador limpio que no se contacta al tercero al rechazar, que aceptar lo carga y que retirar lo descarga. Revisar móvil, teclado, expiración y almacenamiento bloqueado.
8. Para correo, validar base jurídica, campos transmitidos, enlace de baja y pie legal antes de cualquier prueba/envío autorizado. Publicar estos textos no autoriza campañas ni reintentos a inscritos anteriores.

No existe monitorización automática de servicios añadidos por otras personas fuera del flujo de desarrollo. La obligación de revisar se aplica a los cambios del proyecto; requiere que esos cambios sean visibles y revisados.

## Responsabilidades que no sustituye esta implementación

Events Mayaan SL debe validar el texto final y conservar la documentación contractual y de protección de datos que corresponda. Esta implementación identifica los servicios, controles y fuentes, pero no acredita por sí sola la formalización de encargos, evaluaciones de transferencias, plazos internos concretos de conservación, atención de derechos ni decisiones sobre menores. Tampoco es una certificación de cumplimiento jurídico. No eliminar estas comprobaciones del proceso solo porque las páginas ya estén publicadas.

## Verificación de la primera implementación (histórica)

El 04/11/2026 pasan 22 pruebas automatizadas (`npm test`), la compilación de producción (`npm run build`) y `git diff --check`. Las pruebas cubren consentimiento explícito, ausencia de correo para altas sin newsletter, validación de privacidad en servidor, caducidad y datos de preferencias inválidos.

En Chromium se comprueban primera visita, rechazo persistente, aceptación de Maps con petición real a Google, retirada del iframe y ausencia de peticiones a Google tras recargar con rechazo; cierre con Escape y recuperación del foco; registro con y sin newsletter contra una API simulada; tres documentos legales y los seis idiomas, sin desbordamiento a 320 y 390 px. Se inspeccionan capturas a 1440 px y móvil. También se prueban almacenamiento bloqueado, consentimiento corrupto/caducado y acceso al panel desde la demo de entradas. No se detectan errores JavaScript no controlados.

Una inserción de prueba en Supabase, dentro de una transacción revertida, confirma que se conservan `newsletter_consent: false` y la fecha de privacidad sin marca de envío. Se comprueba después que no queda ese registro. No se altera el esquema ni se envían correos. Las verificaciones del navegador local no equivalen por sí solas a una prueba real de entrega de correo.

Estas comprobaciones describen la versión anterior con newsletter opcional. En la corrección actual, el servidor exige `consent: true` y `privacy_accepted: true`; rechaza solicitudes sin ambos valores antes de guardar o enviar. Los registros históricos no se convierten en suscripciones. El aviso de cookies se hace compacto conservando sus controles y bloqueo previo de Google Maps. El autoreply no se activa con esta corrección.

La corrección supera las 22 pruebas, compilación y revisión de diferencias. Se verifica en Chromium la única casilla de privacidad, validación antes del envío, cuerpo de suscripción contra una API simulada, confirmación y reinicio del formulario. Los seis idiomas caben a 320, 390 y 1440 px; el encuadre de Johnny y el formulario se revisan también a 768 px. El aviso de cookies ocupa 420 × 198 px en escritorio y 300 × 225 px a 320 px de ancho; se comprueban rechazo persistente, carga de Google Maps solo tras aceptar, retirada del iframe, Escape y recuperación del foco. No se envían correos ni se crean inscripciones reales durante estas comprobaciones.

## Propuesta aislada /BCN — 7 de noviembre de 2026

El logotipo SVG de Wow My City se descarga de su web oficial (https://wowmycity.com/assets/images/logo-wow-white-DkS6nYbu.svg) y se sirve desde el propio proyecto. Solo contiene trazados; no carga scripts, recursos remotos, cookies ni analítica. El enlace al patrocinador se abre únicamente al pulsarlo, sin enviar el referrer. La visualización en blanco se aplica por CSS, conservando el archivo original.

La adaptación de movimiento usa preferencias locales de accesibilidad, ahorro de datos y señales de capacidad cuando están disponibles, además de una muestra acotada de tiempos de frame. Estas señales se procesan en memoria; no se almacenan ni se transmiten. GSAP, Lenis y las fuentes se sirven localmente. La propuesta sigue sin conectar formularios o newsletters a producción. No se modifica el documento legal público.

## Ajustes de la propuesta /BCN — 8 de noviembre de 2026

Por instrucción expresa del cliente se sustituye únicamente el correo de los documentos públicos por `privacidad@barcelonacountryfest.com`. Se conservan literalmente los demás textos legales, incluido el nombre abreviado que aparece en los originales y la autorización del formulario.

El nuevo formulario de contacto es una vista de prueba local, independiente de la newsletter. Muestra nombre, correo y mensaje, sin petición HTTP, almacenamiento, destinatario ni servicio de correo. El usuario ha pedido dejar el buzón de consultas pendiente. Antes de activar el envío real habrá que confirmar el destinatario y validar su información de privacidad. No se reutiliza la autorización de newsletter para consultas.

La cuenta atrás se calcula en memoria hasta el inicio del día 22/10/2027 en Barcelona (no afirma una hora de apertura), y se detiene fuera de pantalla o al ocultar la pestaña. El mapa permanece visible en su sección, pero continúa bloqueado hasta que el visitante autoriza Google Maps. El enlace de indicaciones solo conecta con Google al pulsarlo. No se añade ningún proveedor ni cookie.

## Ajustes visuales de /BCN — 9 de noviembre de 2026

Bodoni Moda se obtiene del repositorio oficial de Google Fonts (`google/fonts`, carpeta `ofl/bodonimoda`) y se sirve localmente en WOFF2, junto con su licencia SIL OFL. No hay conexión del visitante a Google Fonts. El título deja de ser una imagen y pasa a texto seleccionable.

El carrusel de artistas avanza cada cuatro segundos únicamente mientras está visible. Se detiene al interactuar, al abrir una biografía, con la pestaña oculta y queda inicialmente pausado si se prefiere movimiento reducido; incluye control de pausa y reanudación explícita. La nueva entrada móvil es una secuencia finita con transformaciones y opacidad, sin vídeo ni servicios externos. El icono de galería se genera con GPT Images y se aloja localmente; la galería queda anunciada como próxima, sin carga ni recogida de datos. No se modifican formularios, proveedores activos ni textos legales.
