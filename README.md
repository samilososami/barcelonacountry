# Barcelona Country

Web oficial de Barcelona Country, un encuentro internacional dedicado al line dance, la música country y la cultura western. La página presenta el festival, sus artistas y espacios, facilita el registro de personas interesadas y ofrece un área privada para la gestión de asistentes.

Sitios en producción: [bcncountryfest.com](https://bcncountryfest.com) y [barcelonacountry.com](https://barcelonacountry.com)

## Tecnologías

- React 19 y TypeScript
- Vite 8 para desarrollo y compilación
- Supabase para registros, autenticación de administración y políticas RLS
- Vercel para el despliegue de la aplicación estática

## Estructura del proyecto

```text
public/
  assets/                 Imágenes, elementos gráficos y fondo principal
  fonts/                  Tipografías locales de la identidad visual
  Map/                    Datos de apoyo del mapa
src/
  admin/                  Acceso y dashboard de administración
  lib/                    Cliente de Supabase, tipos, países y consola SQL controlada
  newsletters/            Archivo público y lector de newsletters
  main.tsx                Aplicación pública, contenidos por idioma y formulario
  styles.css              Estilos de la web pública
supabase/
  functions/              Alta pública y envío automático del primer número
  migrations/             Esquema, seguridad y evolución de la base de datos
vercel.json               Configuración de rutas SPA para Vercel
```

## Funcionalidades principales

- Contenido público en español, catalán, alemán, francés, inglés e italiano.
- Selector de prefijo telefónico que guarda el país elegido en formato ISO.
- Registro de interés con validación y prevención de correos duplicados.
- Dashboard protegido con Supabase Auth y RLS para consultar, crear, editar y borrar registros.
- Identificación de país por bandera y prefijo, filtrado por país y búsqueda por país o prefijo en `/dashboard`.
- Consentimientos separados para privacidad y envío de comunicaciones.
- Archivo público de newsletters y editor de borradores/publicaciones en el dashboard.
- Entrega automática de la newsletter nº 1 mediante una Supabase Edge Function cuando el número está publicado.

## Desarrollo local

### Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase con la migración de `supabase/migrations/` aplicada

### Instalación

```bash
npm install
cp .env.example .env.local
```

Configura estas variables en `.env.local`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publicable
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

## Base de datos, newsletters y seguridad

La tabla `public.registrations` contiene los datos del formulario y el campo `country_iso`, que mantiene el país elegido junto con el prefijo telefónico. Las migraciones aplican restricciones de formato, índice de país y políticas RLS: el formulario público solo puede insertar, mientras que las personas incluidas en `public.admin_users` pueden gestionar los registros desde el dashboard.

Los teléfonos históricos se clasifican por su prefijo cuando es posible. El prefijo `+1` sin país previamente guardado se asigna a Estados Unidos; los nuevos registros conservan la elección explícita entre Estados Unidos y Canadá.

La tabla `public.newsletter_issues` guarda borradores y publicaciones. Las personas administradoras pueden redactarlas desde la pestaña **Newsletters** de `/dashboard`; la web pública solo puede leer los números marcados como publicados.

La función `subscribe-newsletter` registra el formulario y, si la newsletter nº 1 ya está publicada, la envía automáticamente. Cuando se publica ese primer número desde el dashboard, `dispatch-welcome-newsletter` entrega también los envíos que hubieran quedado pendientes. Para activar el envío configura estos secretos en Supabase:

```bash
RESEND_API_KEY=re_...
NEWSLETTER_FROM_EMAIL=news@tu-dominio-verificado.com
```

El dominio de `NEWSLETTER_FROM_EMAIL` debe estar verificado en Resend. Sin esos secretos, las altas se guardan igualmente y el envío queda pendiente de configuración.

## Despliegue

Cada cambio incorporado en la rama `main` se despliega en Vercel. Antes de publicar, configura en Vercel las mismas variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` que se usan en local. Los dominios de producción son `bcncountryfest.com` y `barcelonacountry.com`.
