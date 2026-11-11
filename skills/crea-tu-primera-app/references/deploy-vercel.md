# Publicar en internet: GitHub + Vercel

Guía a la persona **un paso por mensaje**. Al final de cada paso, pide que responda
"listo" (o que te cuente qué ve si algo no cuadra). Celebra cuando termine: tiene su
app en internet con su propio link.

Antes de empezar, explica el camino en 3 líneas:

> 1. **Supabase** guarda los datos (ya lo configuramos o lo hacemos ahora).
> 2. **GitHub** guarda el código de tu app (como un Google Drive para código).
> 3. **Vercel** toma ese código y lo publica con un link (tuapp.vercel.app).

## Paso 1 · Supabase listo

Si todavía no lo hizo, sigue "Configurar Supabase" de `supabase.md`. Al final debe
tener a mano la **Project URL** y la **publishable key**.

## Paso 2 · Subir el código a GitHub

**Opción A, en Claude Code (recomendada):** ofrécete a hacerlo tú. Pide permiso
antes de crear el repositorio o subir nada. Con permiso:

```bash
git init
git add .
git commit -m "Primera versión de mi app"
```

Luego, si tiene `gh` (GitHub CLI) con sesión iniciada:

```bash
gh repo create mi-app --private --source=. --push
```

Si no tiene `gh`: que cree el repositorio vacío en github.com/new (sin README) y tú
corres los comandos que GitHub muestra (`git remote add origin ...` y
`git push -u origin main`).

Comprueba antes de subir que `.env.local` **no** se sube (está en `.gitignore`).

**Opción B, desde el navegador (sin terminal):**

1. Entra a [github.com](https://github.com) y crea cuenta si no tiene.
2. Botón **+** arriba a la derecha → **New repository** → nombre de la app → elige
   **Private** si no quiere que se vea el código → **Create repository**.
3. En la página del repositorio: **uploading an existing file** (o *Add file →
   Upload files*), arrastra **todo el contenido de la carpeta del proyecto** (menos
   `node_modules` y `.next`, si existen) y pulsa **Commit changes**.
   - Si descargó un `.zip`, primero lo descomprime y arrastra lo que hay dentro,
     no la carpeta contenedora (el `package.json` debe quedar en la raíz).

## Paso 3 · Importar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Sign up** → **Continue with GitHub**
   (así se conectan solos).
2. **Add New… → Project** → busca el repositorio → **Import**.
   - Si no aparece: **Adjust GitHub App Permissions** y dale acceso a ese repositorio.
3. Deja todo como está (Vercel detecta Next.js solo).

## Paso 4 · Variables de entorno (las claves)

En la misma pantalla, antes de Deploy, abre **Environment Variables** y agrega:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | la Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la publishable key (o anon key) |

Explícalo así: "Son como la dirección y la llave de tu base de datos. Van aquí y no
en el código para que no queden a la vista en GitHub."

Alternativa: en Vercel → pestaña **Integrations / Marketplace → Supabase** se pueden
conectar solas, pero para la primera vez es más claro copiarlas a mano. (Si usa la
integración, el código ya acepta `NEXT_PUBLIC_SUPABASE_ANON_KEY` también.)

## Paso 5 · Deploy

Pulsa **Deploy** y espera 1–2 minutos. Cuando salga el confeti 🎉, pulsa
**Continue to Dashboard → Visit**. Ese es su link.

## Paso 6 · Avisarle a Supabase cuál es su link

En Supabase → **Authentication → URL Configuration**:
- **Site URL**: el link de Vercel (ej: `https://mi-app.vercel.app`).
- **Redirect URLs**: agrega `https://mi-app.vercel.app/**`.

Así los correos de confirmación llevan a su app y no a `localhost`.

## Paso 7 · Probar

1. Abrir el link → **Crear cuenta** → entrar.
2. Agregar algo, recargar la página: debe seguir ahí.
3. Abrirla desde el celular. Tip: en el celular, menú del navegador → **Agregar a
   pantalla de inicio**, y queda como una app más.

## Cómo hacer cambios después

Cada vez que el código cambia en GitHub, Vercel la vuelve a publicar sola en 1–2
minutos.
- En Claude Code: haces el cambio, `npm run build` para revisar, y `git add . &&
  git commit -m "..." && git push` (con permiso de la persona).
- Sin terminal: en GitHub abre el archivo → ícono del lápiz → pega la versión nueva →
  **Commit changes**.

## Dominio propio (opcional, para después)

Vercel → proyecto → **Settings → Domains** → agregar el dominio comprado (Namecheap,
GoDaddy, Cloudflare…) y seguir las instrucciones de DNS que muestra Vercel. Después
actualiza el Site URL en Supabase.

## Bueno saber

- El plan gratis de Vercel (Hobby) es para proyectos personales y no comerciales. Si
  la app empieza a cobrar, toca pasar a Pro.
- En Vercel → **Deployments** se ve cada publicación y si alguna falló (con el log
  del error). Si algo falla, revisa `problemas-comunes.md`.
