# Proveedores y mantenimiento de los textos legales

Revisión: 4 de noviembre de 2026. Esta ficha documenta la implementación técnica y sus fuentes; no certifica cumplimiento jurídico ni acredita la firma de contratos por Events Mayaan SL.

## Fuente y cambios autorizados

La base es el documento `TEXTOS LEGALES BARCELONA COUNTRY FEST.docx`, enviado por Javier González desde `xavierglez@msn.com` el 2 de noviembre de 2026, a las 12:22 (Europe/Madrid), en «RV: HOLA SAMI: CAMBIOS PARA BARCELONA CF». Contiene privacidad, cookies, aviso legal y un bloque separado para el futuro pie de newsletter. Se preservan las secciones y las disposiciones generales de las tres políticas. El bloque de correo no se integra en esta tarea y no se activa el autoreply.

El usuario facilita y autoriza incorporar el dato registral: «Inscrita en el Registro Mercantil de Barcelona, Sección 8.ª, Hoja B-663513, Inscripción 1.ª.» También autoriza la newsletter opcional, los controles de cookies, reflejar dónde se suele bailar y completar los proveedores reales.

Cambios respecto del documento de Javier:

- Ambos dominios del festival, manteniendo el buzón `privacidad@barcelonacountry.com`.
- Datos del lugar de baile y país asociado al prefijo, con finalidad limitada a conocer la comunidad de baile y organizar los contactos; no geolocalización ni nacionalidad inferida.
- Consentimiento de newsletter opcional, desmarcado, independiente de la aceptación del tratamiento del registro.
- Inventario de proveedores y transferencias posibles, sin afirmar acuerdos privados no comprobados.
- Política de cookies adaptada a tecnologías reales: almacenamiento local y Google Maps opcional. Se retiran categorías genéricas que insinuaban herramientas propias de publicidad/analítica inexistentes.
- Se corrige la repetición «modificar o modificar parcialmente» del aviso legal sin cambiar su sentido.

Los documentos públicos viven en `src/privacy/legal-content.ts`; no se sirven desde el DOCX ni contienen HTML arbitrario. Son textos en castellano facilitados por la organización. No generar traducciones legales como si fueran textos aprobados.

## Inventario técnico

| Servicio | Uso en este proyecto | Datos relevantes y alcance | Estado |
| --- | --- | --- | --- |
| Vercel | Web, distribución de recursos y API del formulario | Solicitudes HTTP y datos enviados al endpoint de registro | En uso |
| Supabase | PostgreSQL, autenticación administrativa y archivos del blog | Inscripciones, consentimiento, sesión administrativa y medios públicos del blog | En uso; proyecto `barcelona-country-admin`, región `eu-west-3` (París), comprobada con el proveedor el 04/11/2026 |
| Arsys | Dominios, DNS y buzón de privacidad | Datos de dominio/operación y mensajes dirigidos al buzón | En uso, según configuración del proyecto y confirmación del usuario |
| Google Maps | Mapa de Fira Cornellà | Conexión del navegador al proveedor, IP, navegador y cookies según su sesión/ajustes | Opcional; bloquear iframe hasta consentimiento y retirarlo al revocar |
| Resend / Plus Five Five, Inc. | Futuro envío de newsletters | Nombre, correo, mensaje y metadatos necesarios de envío; no teléfono ni lugar de baile | Integración preparada; autoreply fuera de esta tarea y número 1 todavía no publicado en la revisión inicial |

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

La política incluye NID (6 meses desde último uso) y `_Secure-ENID` (13 meses) **como ejemplos del catálogo oficial de Google**, no como resultados de una auditoría de todas las sesiones. No copiar una tabla de cookies de otra web como si fueran cookies detectadas aquí. Las cookies efectivamente entregadas deben contrastarse en navegador limpio, con y sin cuenta de Google, al revisar cambios en el embed. Revocar consentimiento impide nuevas cargas desde esta web, pero no deshace transmisiones anteriores ni elimina cookies de dominios externos.

## Revisión obligatoria al cambiar servicios

Cada integración, cambio de dominio, formulario, embed, script, recurso remoto, sistema de pagos, analítica, publicidad o correo debe incluir esta revisión en la misma tarea:

1. Identificar proveedor y entidad, finalidad, datos realmente recibidos y momento de la conexión. Comprobar también imágenes, fuentes, vídeos y URLs multimedia editoriales, no solo dependencias npm.
2. Distinguir servicio activo, previsto, retirado y herramienta de desarrollo. No publicar un proveedor futuro como si ya recibiera los datos.
3. Consultar documentación oficial vigente, cuenta/plan, regiones y acuerdo aplicable. No completar garantías con suposiciones. Registrar lo que deba validar Events Mayaan SL.
4. Actualizar este inventario, las secciones afectadas de `src/privacy/legal-content.ts` y su fecha, y pedir validación al responsable si cambia la finalidad o una condición jurídica.
5. Para servicios no necesarios, bloquear todas sus solicitudes antes del consentimiento; incorporar controles reales, rechazo, retirada, persistencia y pruebas. No basta ocultar un iframe con CSS.
6. Si cambia el alcance de las preferencias, incrementar la versión del consentimiento y solicitar nueva elección. No reutilizar un consentimiento de Maps para analítica/publicidad.
7. Verificar en un navegador limpio que no se contacta al tercero al rechazar, que aceptar lo carga y que retirar lo descarga. Revisar móvil, teclado, expiración y almacenamiento bloqueado.
8. Para correo, validar base jurídica, campos transmitidos, enlace de baja y pie legal antes de cualquier prueba/envío autorizado. Publicar estos textos no autoriza campañas ni reintentos a inscritos anteriores.

No existe monitorización automática de servicios añadidos por otras personas fuera del flujo de desarrollo. La obligación de revisar se aplica a los cambios del proyecto; requiere que esos cambios sean visibles y revisados.

## Responsabilidades que no sustituye esta implementación

Events Mayaan SL debe validar el texto final y conservar la documentación contractual y de protección de datos que corresponda. Esta implementación identifica los servicios, controles y fuentes, pero no acredita por sí sola la formalización de encargos, evaluaciones de transferencias, plazos internos concretos de conservación, atención de derechos ni decisiones sobre menores. Tampoco es una certificación de cumplimiento jurídico. No eliminar estas comprobaciones del proceso solo porque las páginas ya estén publicadas.

## Verificación técnica de esta entrega

El 04/11/2026 pasan 22 pruebas automatizadas (`npm test`), la compilación de producción (`npm run build`) y `git diff --check`. Las pruebas cubren consentimiento explícito, ausencia de correo para altas sin newsletter, validación de privacidad en servidor, caducidad y datos de preferencias inválidos.

En Chromium se comprueban primera visita, rechazo persistente, aceptación de Maps con petición real a Google, retirada del iframe y ausencia de peticiones a Google tras recargar con rechazo; cierre con Escape y recuperación del foco; registro con y sin newsletter contra una API simulada; tres documentos legales y los seis idiomas, sin desbordamiento a 320 y 390 px. Se inspeccionan capturas a 1440 px y móvil. También se prueban almacenamiento bloqueado, consentimiento corrupto/caducado y acceso al panel desde la demo de entradas. No se detectan errores JavaScript no controlados.

Una inserción de prueba en Supabase, dentro de una transacción revertida, confirma que se conservan `newsletter_consent: false` y la fecha de privacidad sin marca de envío. Se comprueba después que no queda ese registro. No se altera el esquema ni se envían correos. Las verificaciones del navegador local no equivalen por sí solas a una prueba real de entrega de correo.
