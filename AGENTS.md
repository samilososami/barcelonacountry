# Mantenimiento de privacidad y proveedores

Antes de añadir o sustituir un servicio que reciba datos personales, recursos externos, scripts, widgets, píxeles, cookies o almacenamiento del navegador:

1. Revisar y actualizar el inventario interno `docs/proveedores-y-privacidad.md`. Los textos públicos de `src/privacy/legal-content.ts` son una transcripción del DOCX original de Javier del 02/11/2026, salvo los datos registrales facilitados después por el usuario. Conservar literalmente títulos, fechas, párrafos, listas y su orden; no corregir, completar ni añadir contenido por iniciativa propia. Si una nueva integración exige cambiar lo informado, preparar la propuesta para su validación antes de activarla.
2. Comprobar con fuentes oficiales la entidad, finalidad, datos tratados y posibles transferencias. No dar por firmados contratos ni afirmar que todos los datos permanecen en Europa sin evidencia.
3. Bloquear integraciones opcionales hasta que exista autorización expresa. Revisar las categorías y la versión del consentimiento si cambia la finalidad o el proveedor. La configuración está en `shared/cookie-consent.mjs` y `src/privacy/CookieConsent.tsx`.
4. Probar la primera visita, el rechazo, la aceptación, la retirada y la persistencia. Verificar las peticiones de red, no solo la visibilidad del widget.
5. Si se añaden campos, preparar para validación los cambios necesarios en la información del formulario y los textos legales. El formulario público es exclusivamente de suscripción a Barcelona Country News: conservar el envío explícito mediante «Suscribirme» y la casilla de aceptación de privacidad, desmarcada por defecto. No añadir un registro de interesados ni una segunda casilla de newsletter sin petición del cliente. La restauración literal del documento original no autoriza cambiar este comportamiento.

La actualización se realiza con cada cambio de código; este inventario no es un monitor automático de cambios externos. Los compromisos y acuerdos jurídicos del responsable requieren su validación. No activar envíos de newsletter, Resend ni campañas sin la petición específica del usuario.
