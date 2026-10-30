# Barcelona Country News

## Cambios del 30 de octubre de 2026

Se sigue el correo de Javier del 29 de octubre: título «¡No te pierdas nada!», texto de suscripción, botón «Suscribirme», autorización facilitada por el cliente, prefijo telefónico sin «Selecciona» y una pestaña Blog. Se mantiene el diseño general del festival y se retira «Reserva tu plaza» del CTA público.

El blog está en `/newsletters` y `/blog`. Solo muestra números publicados; no se ha inventado ni publicado el contenido del primer número. La pestaña Newsletters del dashboard permite crear borradores, previsualizar, publicar y retirar números. Los enlaces de un número se conservan al editar su título.

## Qué falta para activar el correo

La API necesita `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en el entorno de Vercel para guardar las suscripciones, aunque Resend siga sin configurar. El 31 de octubre se configuraron ambas variables públicas en el entorno de producción del proyecto existente. No se añadieron claves privadas de envío ni se modificó el proyecto de Supabase.

1. El cliente debe proporcionar el contenido definitivo del número 1.
2. Configurar un dominio/remitente verificado en Resend.
3. Añadir estas variables solo al servidor de Vercel y redesplegar:

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

## Textos legales

El párrafo de autorización es el facilitado por Javier. Los documentos completos están pendientes y las páginas `/privacidad`, `/aviso-legal` y `/cookies` lo indican expresamente. Los espacios se rellenan en `src/newsletters/LegalPage.tsx` cuando lleguen los textos aprobados. No son políticas legales redactadas por el desarrollador.

La autorización de newsletter queda registrada en `newsletter_consent`, con el instante de alta en `created_at` y el idioma en `subscription_locale`. No se marca `privacy_accepted_at`: no se ha presentado una política completa que el usuario pueda aceptar.

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
