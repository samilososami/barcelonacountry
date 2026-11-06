# Barcelona Country News

## Estado al 6 de noviembre de 2026

Tras la aclaración de Xavi del 4 de noviembre, el formulario sirve exclusivamente para suscribirse a Barcelona Country News. Se conserva la primera casilla de privacidad, obligatoria y desmarcada de inicio, y se retira la segunda casilla de newsletter. El botón indica siempre «Suscribirme» y el párrafo de presentación vuelve al texto facilitado por Javier. El envío explícito solicita la suscripción: el cliente manda `consent: true` y el servidor exige ese valor junto con `privacy_accepted: true`; una petición sin cualquiera de esas aceptaciones se rechaza antes de guardar o enviar. El servidor guarda su propia fecha en `privacy_accepted_at`.

Esta corrección sustituye el registro de interesados con newsletter opcional introducido anteriormente el mismo día. Los registros históricos no se modifican ni se les atribuye una aceptación que no dieron; quien tenga `newsletter_consent: false` sigue excluido de los envíos.

Las tres páginas legales ya incorporan los textos de Javier del 2 de noviembre, los datos registrales facilitados por el cliente, el lugar donde se suele bailar y los proveedores revisados. Fuentes, límites y mantenimiento: [proveedores-y-privacidad.md](proveedores-y-privacidad.md). Google Maps queda bloqueado hasta aceptar en el nuevo panel; rechazar y retirar el permiso son opciones disponibles, también desde el pie. La elección dura 180 días y es propia de cada dominio y navegador. El formulario de `/backup` conserva su aspecto como archivo, pero está deshabilitado y remite al formulario actual.

Resend está configurado para producción. El dominio `news.bcncountryfest.com` figura como verificado, la clave queda limitada al envío desde ese dominio y Vercel contiene las variables privadas de Resend, Supabase y firma de bajas. El panel confirma «Remitente configurado». No se ha enviado ningún correo real: la tabla `newsletter_issues` todavía no contiene el número 1 y los registros que esperan la bienvenida permanecen pendientes.

La documentación histórica siguiente conserva el contexto de las primeras entregas; el estado actual es el indicado en este apartado.

## Cambios del 30 de octubre de 2026

Se sigue el correo de Javier del 29 de octubre: título «¡No te pierdas nada!», texto de suscripción, botón «Suscribirme», autorización facilitada por el cliente, prefijo telefónico sin «Selecciona» y una pestaña Blog. Se mantiene el diseño general del festival y se retira «Reserva tu plaza» del CTA público.

El blog está en `/newsletters` y `/blog`. Solo muestra números publicados; no se ha inventado ni publicado el contenido del primer número. La pestaña Newsletters del dashboard permite crear borradores, previsualizar, publicar y retirar números. Los enlaces de un número se conservan al editar su título.

## Activación del correo

La API dispone en producción de la configuración pública de Supabase y de las variables privadas necesarias para enviar, actualizar el estado de entrega y firmar las bajas. Los valores secretos permanecen en Vercel y no se guardan en GitHub.

1. El cliente debe proporcionar el contenido definitivo del número 1.
2. Un administrador debe guardar y publicar ese número desde el panel.

La configuración ya instalada usa estas variables:

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL pública del proyecto, necesaria también en runtime |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública, necesaria también en runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Lectura de pendientes y actualización de envíos/bajas; nunca en el navegador |
| `RESEND_API_KEY` | Envío de correo |
| `NEWSLETTER_FROM_EMAIL` | Dirección verificada, sin nombre ni corchetes |
| `NEWSLETTER_SIGNING_SECRET` | Secreto estable para firmar las bajas; si falta se usa la clave de servicio |

Al publicar el nº 1 y configurar el remitente, las nuevas suscripciones reciben automáticamente ese número. El correo contiene el contenido, el enlace al número, el blog y la baja. El idioma de la bienvenida sigue el formulario; el contenido editorial es exactamente el que publique la organización, sin traducción automática.

Sin configuración, sin nº 1 o si falla el proveedor, el registro se conserva como pendiente. No se le dice al usuario que se ha enviado un correo. Los administradores ven el estado y pueden reintentar hasta diez pendientes por acción; publicar una newsletter por sí solo no dispara envíos a toda la base.

`welcome_newsletter_sent_at` indica aceptación por el proveedor, no entrega confirmada en la bandeja de entrada. Se usa una clave de idempotencia por registro y se excluyen los ya marcados; no es una garantía de entrega exactamente una vez si el proveedor acepta un envío, falla la escritura en la base y se reintenta fuera de la ventana de idempotencia del proveedor. La baja firmada requiere POST y confirma antes de ejecutarse en la página web; GET no modifica datos.

## Textos legales en la entrega del 30 de octubre

El párrafo de autorización era el facilitado por Javier. En esa entrega los documentos completos estaban pendientes y las páginas `/privacidad`, `/aviso-legal` y `/cookies` lo indicaban. Este estado queda sustituido por la integración de los documentos descrita arriba.

La autorización de newsletter se registraba en `newsletter_consent`, con el instante de alta en `created_at` y el idioma en `subscription_locale`. Entonces no se marcaba `privacy_accepted_at` porque aún no se presentaba una política completa. Desde el cambio del 4 de noviembre sí se registra la aceptación en las nuevas altas, sin completar retrospectivamente las antiguas.

## Respuestas técnicas para Javier

- No se han encontrado scripts de analítica/publicidad ni escrituras de cookies propias en el código revisado. La preferencia de idioma se guarda en `localStorage`, que no es una cookie.
- La sesión del administrador usa Supabase Auth y almacenamiento local. No se necesita una cuenta para suscribirse.
- La web incorpora un iframe de Google Maps. Debe revisarse como servicio de tercero para la política de cookies y el consentimiento correspondiente; no se afirma que la web esté libre de cookies de terceros. No se ha realizado una auditoría legal de cookies.
- Los registros están en PostgreSQL de Supabase, proyecto `barcelona-country-admin`, región `eu-west-3` (París), comprobada en el proveedor. Se transmiten por HTTPS.
- Las políticas RLS permiten altas públicas, pero no lectura pública del listado de inscritos. La gestión y los borradores están reservados a usuarios autorizados en `admin_users`. Los números publicados son públicos.
- No se han verificado en esta tarea la retención de copias, garantías contractuales ni todos los controles de infraestructura. Si se conecta Resend, será un proveedor adicional que procesa los datos necesarios para entregar el correo.

## Verificación y reversión

`npm test` cubre persistencia, validación, duplicados, correo aceptado/rechazado, configuración pendiente, permisos de administrador, bajas firmadas y escape de HTML. El proveedor se simula en esas pruebas; no se han enviado mensajes reales.

Se ha comprobado un alta desde el navegador contra Supabase y el rechazo de su duplicado. El registro temporal se ha eliminado después. El formulario y el blog se revisan en escritorio y móvil; la compilación se comprueba con `npm run build`.

La lectura pública y la exclusión de borradores se han probado con la API real y una transacción de prueba revertida. Los inscritos y administradores siguen sin lectura anónima. También se ha completado desde el navegador, con sesión administrativa real, el ciclo de crear un borrador, recargarlo, editarlo, previsualizarlo, publicarlo, abrir su enlace público y retirarlo. El enlace conserva su slug al cambiar el título y, tras retirar la publicación, la API anónima deja de devolverla. Se utilizó el número técnico 900001, nunca el nº 1, y se eliminó al terminar; no quedan publicaciones de prueba.

La cuenta administradora adicional solicitada se creó mediante Supabase Auth, se confirmó por correo y se autorizó en `admin_users`. Se verificaron su inicio de sesión y el guardado persistente de una edición. No se guardaron credenciales en el repositorio. La creación de cuentas, como cualquier dato de Supabase, es independiente del commit y no se revierte con Git. El envío real con Resend queda pendiente de sus credenciales y del contenido aprobado del nº 1.

El esquema de newsletter ya existía en la base de producción. Se recupera su migración histórica en el repositorio para instalaciones nuevas, sin volver a aplicarla. Se aplica una corrección de permisos: los visitantes anónimos solo pueden leer números publicados sin que la política consulte la tabla privada `admin_users`; los administradores conservan el acceso autenticado. No se otorgan permisos públicos sobre administradores o inscritos. Esta corrección está en `20261030140728_fix_newsletter_public_read.sql`.

No se despliegan Edge Functions independientes: frontend y API de Vercel pertenecen al mismo commit.

Para retirar esta implementación, usar `git revert <commit-de-estos-cambios>` y publicar el resultado. Esto retira la interfaz y la API. La corrección de permisos seguirá aplicada en la base: es compatible con la web anterior y no cambia sus registros. Los datos ya registrados y los correos ya enviados no se deshacen con Git. Las variables de Vercel tampoco se revierten con Git.

## Ajustes móviles y propuestas gráficas

La publicación incluye flechas SVG en los controles públicos para evitar su representación como emoji, interlineado y ancho adaptables en el CTA, separación entre menú e idiomas en tablet y correcciones de ancho en el mapa y los detalles del festival. Los menús se cierran mutuamente y pueden desplazarse en pantallas de poca altura. Se han revisado los seis idiomas en tamaños móviles y también el diseño de escritorio.

`deliverables/` y `generated/` conservan las propuestas gráficas preparadas durante el proyecto. Son archivos de revisión, no se importan ni se copian automáticamente a la web: esta publicación mantiene el logo y las fotografías actualmente integrados.

## Archivos multimedia

El editor permite subir varios archivos desde el apartado **Multimedia**, insertarlos en la posición del cursor, editar su descripción, quitarlos del contenido y previsualizarlos antes de guardar o publicar. El formato de los números anteriores sigue siendo compatible.

- Imágenes: JPG, PNG, GIF animado y WebP; hasta 5 MB. Se conserva el original, sin recortar ni aplanar los GIF.
- Vídeo: MP4 y WebM; hasta 25 MB, con controles y sin reproducción automática.
- Audio: MP3, M4A, OGG y WAV; hasta 25 MB, con controles.
- Documentos: PDF hasta 5 MB, con enlace para abrirlos.
- Se pueden seleccionar hasta ocho archivos por tanda. El contenido completo conserva el límite de 30.000 caracteres; las subidas no cuentan como texto binario, solo como enlaces.

Las imágenes y los GIF se insertan también en el HTML del correo. Vídeos, audio y PDF se representan como enlaces, sin depender de reproductores de correo. La alternativa de texto plano incluye las URLs. Esto prepara la plantilla; no activa Resend ni demuestra la entrega en clientes de correo reales.

Los archivos se almacenan en el bucket público `newsletter-media`, creado por `20261031115508_add_newsletter_media_storage.sql`. **Cualquier persona con el enlace puede ver un archivo desde que se sube, incluso si el número es un borrador. No subir datos privados.** El editor muestra este aviso. Solo los usuarios de `admin_users` pueden subir o listar objetos; cada subida utiliza una ruta de usuario y UUID nuevo. No se permite sobrescribir archivos. La eliminación técnica queda limitada a administradores sobre sus propios objetos. Quitar un bloque del editor no elimina físicamente el archivo, para no romper números o correos anteriores; los archivos sin uso deben revisarse antes de eliminarlos desde Storage.

La subida valida tipo, tamaño y cabecera del archivo en el cliente; Storage impone una lista de MIME permitidos y un máximo de 25 MB. SVG, HTML y ejecutables quedan excluidos. El lector web y la plantilla de correo comparten `shared/newsletter-content.mjs`: solo reconocen bloques de medios con URLs HTTPS y escapan texto/HTML. No se interpreta HTML editorial arbitrario. Esta validación no sustituye un análisis antivirus de archivos.

Los bloques guardados son `![Descripción](https://...)`, `@video[Descripción](https://...)`, `@audio[Descripción](https://...)` y `@file[Descripción](https://...)`, separados por líneas en blanco. El panel los crea automáticamente y mantiene las descripciones editables. `npm test` cubre el formato compartido, URLs inseguras, límites, cabeceras, inserción y plantilla multimedia de correo.

Revertir el commit retira el editor y el renderizado multimedia; no borra el bucket ni sus archivos. Los números que ya incluyan medios conservarán los enlaces en su contenido. La protección de contraseñas filtradas de Supabase estaba desactivada antes de este cambio; no se ha modificado la configuración de Auth.

Verificación del 31 de octubre: 16 pruebas automatizadas y compilación correctas; subida real desde el panel de PNG, GIF, MP4, WAV y PDF, edición de descripción, retirada de un bloque, guardado y recarga. Se comprobó que la subida anónima se rechaza, que el borrador no se puede leer anónimamente y que el GIF servido coincide byte por byte con el original. Revisión visual del editor a 1440 y 390 píxeles, sin desbordamiento horizontal. Las pruebas utilizan el número técnico 900002, nunca el número 1, y no disparan envíos.
