# Juanfra Code · Vitrina de SaaS

Web donde muestro los SaaS que voy creando. Antes de descargar, el visitante deja nombre, correo y WhatsApp (una sola vez).
Cada SaaS tiene su ficha con demo en
vivo, botón **Deploy en Vercel** (con Supabase conectado) y descarga de la
plantilla desde GitHub o en `.zip`. Gratis y sin cuenta para quien visita.

> Nombre, textos y redes sociales están en un solo lugar: `src/config/brand.ts`.

## Qué tiene

| Página | Ruta | Qué hace |
| --- | --- | --- |
| Inicio | `/` | Titular, números (SaaS, en vivo, plantillas, descargas), catálogo con filtro por categoría y buscador, y guía de 4 pasos |
| Ficha | `/saas/nombre` | Descripción, qué incluye, stack, demo, Deploy en Vercel, GitHub, .zip, video, visitas y descargas |
| Descarga | `/descargar/nombre?a=repo\|zip\|vercel` | Cuenta la descarga y lleva al repo, al .zip o a Vercel |
| Panel | `/admin` | Solo tú: crear, editar, ocultar y borrar SaaS, subir portada |
| Contactos | `/admin/contactos` | Quienes dejaron nombre, correo y WhatsApp para descargar; se exporta a CSV/Excel |

## Modo demo (sin Supabase)

Si la web se publica **sin** las claves de Supabase, funciona en modo demo con
los SaaS de ejemplo de `src/lib/demo.ts`. El panel se puede ver pero no guarda.
Cuando pongas las claves, se apaga solo.

## Conectar Supabase (cuando tengas la cuenta)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: pega todo `supabase/schema.sql` y pulsa **Run**.
3. **Authentication → Users → Add user**: crea tu usuario con correo y contraseña.
4. En el SQL Editor ejecuta (con tu correo):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'tu-correo@ejemplo.com';
   ```
5. En Vercel → tu proyecto → **Settings → Environment Variables**, agrega
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase → botón Connect o Project
   Settings → API) y `NEXT_PUBLIC_SITE_URL`. Vuelve a publicar.
6. Entra a `/admin` y sube tus SaaS.

## Cómo preparar una plantilla para que otros la lancen rápido

Para que el botón **Deploy en Vercel** funcione, el repo de la plantilla debe:

- Ser **público** en GitHub.
- Funcionar con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (la integración de Supabase en Vercel las rellena sola).
- Traer `supabase/schema.sql` y un README con los pasos.
- Si necesita más variables (ej. Mercado Pago), escríbelas en el campo
  "Variables de entorno" del panel: Vercel las pedirá al desplegar.

Consejo: en GitHub, marca el repo como **Template repository** (Settings) para que
la gente pueda pulsar "Use this template".

## Publicar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** → elige este repo.
2. Pulsa **Deploy**. Sin claves, sale en modo demo.

## Trabajar en tu computadora

```bash
npm install
npm run dev
```

## Apps dentro de esta web (demo + descarga)

Cada app vive en este mismo repo y se publica en el mismo Vercel:

| Carpeta | Qué es |
| --- | --- |
| `src/apps/<app>/` | El código de la app (pantallas, gráficos, datos de ejemplo) |
| `src/app/apps/<app>/` | La demo en `/apps/<app>`: sin base de datos, guarda en el navegador |
| `plantillas/<app>/` | El resto del proyecto descargable: Next.js, Supabase, `schema.sql`, README, licencia MIT |
| `supabase/apps/<app>.sql` | Lo que se pega en Supabase para que la app salga en la vitrina |

En cada `npm run build` se arma solo `public/descargas/<app>.zip` (plantilla + código
de la app) con `scripts/build-plantillas.mjs`. Para una app nueva, agrégala a la lista `APPS` de ese archivo.
