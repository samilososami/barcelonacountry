# Mantenimiento de privacidad y proveedores

Antes de añadir o sustituir un servicio que reciba datos personales, recursos externos, scripts, widgets, píxeles, cookies o almacenamiento del navegador:

1. Revisar y actualizar el inventario `docs/proveedores-y-privacidad.md` y los textos de `src/privacy/legal-content.ts` en el mismo cambio.
2. Comprobar con fuentes oficiales la entidad, finalidad, datos tratados y posibles transferencias. No dar por firmados contratos ni afirmar que todos los datos permanecen en Europa sin evidencia.
3. Bloquear integraciones opcionales hasta que exista autorización expresa. Revisar las categorías y la versión del consentimiento si cambia la finalidad o el proveedor. La configuración está en `shared/cookie-consent.mjs` y `src/privacy/CookieConsent.tsx`.
4. Probar la primera visita, el rechazo, la aceptación, la retirada y la persistencia. Verificar las peticiones de red, no solo la visibilidad del widget.
5. Actualizar los datos que declara recoger el formulario si se añaden campos, y conservar la suscripción a la newsletter como elección independiente y desmarcada por defecto.

La actualización se realiza con cada cambio de código; este inventario no es un monitor automático de cambios externos. Los compromisos y acuerdos jurídicos del responsable requieren su validación. No activar envíos de newsletter, Resend ni campañas sin la petición específica del usuario.
