# Barcelona Country

Web oficial de Barcelona Country, un encuentro internacional dedicado al line dance, la música country y la cultura western. La página presenta el festival, sus artistas y espacios, facilita el registro de personas interesadas y ofrece un área privada para la gestión de asistentes.

Sitio en producción: [bcncountryfest.com](https://bcncountryfest.com). También disponible en [barcelonacountry.com](https://barcelonacountry.com).

## Tecnologías

- React 19 y TypeScript
- Vite 8 para desarrollo y compilación
- Supabase para registros, autenticación de administración y políticas RLS
- Vercel para la aplicación y la API de suscripciones

## Estructura del proyecto

```text
public/
  assets/                 Imágenes, elementos gráficos y fondo principal
  fonts/                  Tipografías locales de la identidad visual
  Map/                    Datos de apoyo del mapa
src/
  admin/                  Acceso y dashboard de administración
  components/             Iconos SVG compartidos, sin dependencia de emojis
  newsletters/            Blog, diseño de números y espacios legales
  lib/                    Cliente de Supabase, tipos, países y consola SQL controlada
  main.tsx                Aplicación pública, contenidos por idioma y formulario
  styles.css              Estilos de la web pública
  modern.css              Diseño actual de la web pública
api/
  newsletter.js           Entrada de la función de Vercel
server/
  newsletter.mjs          Suscripciones, bienvenida y bajas firmadas
tests/
  newsletter.test.mjs     Pruebas de suscripción y envío con proveedor simulado
supabase/
  migrations/             Esquema, seguridad y evolución de la base de datos
deliverables/             Propuestas gráficas y archivos entregables para revisión
generated/                Fondos generados durante el proyecto, no publicados automáticamente
vercel.json               Configuración de rutas SPA para Vercel
```

## Funcionalidades principales

- Contenido público en español, catalán, alemán, francés, inglés e italiano.
- Selector de prefijo telefónico que guarda el país elegido en formato ISO.
- Registro de interés con validación y prevención de correos duplicados.
- Dashboard protegido con Supabase Auth y RLS para consultar, crear, editar y borrar registros.
- Identificación de país por bandera y prefijo, filtrado por país y búsqueda por país o prefijo en `/dashboard`.
- Blog Barcelona Country News en `/newsletters` (también `/blog`), con borradores y publicaciones desde `/admin/newsletters`.
- Bienvenida con el número 1, preparada para conectar un remitente verificado en Resend. El registro funciona aunque el correo no esté configurado.
- Controles adaptados a móvil, flechas SVG y navegación sin solapamientos entre menú e idiomas.

## Desarrollo local

### Requisitos

- Node.js 22.12 o superior (verificado con Node.js 24)
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
npm test
```

## Base de datos y seguridad

La tabla `public.registrations` contiene los datos del formulario y el campo `country_iso`, que mantiene el país elegido junto con el prefijo telefónico. Las migraciones aplican restricciones de formato, índice de país y políticas RLS: el formulario público solo puede insertar, mientras que las personas incluidas en `public.admin_users` pueden gestionar los registros desde el dashboard.

Los teléfonos históricos se clasifican por su prefijo cuando es posible. El prefijo `+1` sin país previamente guardado se asigna a Estados Unidos; los nuevos registros conservan la elección explícita entre Estados Unidos y Canadá.

## Despliegue

Cada cambio incorporado en la rama `main` se despliega en Vercel. Antes de publicar, configura en Vercel las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` tanto para la compilación como para la función del servidor; tenerlas únicamente en `.env.production` no configura la función. El dominio principal es `bcncountryfest.com` y se mantiene `barcelonacountry.com`.

La activación del correo, las comprobaciones y los textos legales pendientes están documentados en [Newsletters: configuración y alcance](docs/newsletters.md). Las claves privadas solo van en variables del servidor; nunca deben llevar el prefijo `VITE_` ni subirse al repositorio.
