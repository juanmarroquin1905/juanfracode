# Problemas comunes y cómo arreglarlos

Cuando algo falla: tranquiliza primero ("Es normal, pasa mucho, lo arreglamos"),
pide el mensaje exacto o una captura, y da **un** arreglo a la vez.

## Al probar en la compu

| Qué pasa | Causa probable | Arreglo |
| --- | --- | --- |
| `npm: command not found` / `node no se reconoce` | No tiene Node.js | Instalar la versión LTS desde nodejs.org y abrir una terminal nueva |
| `Module not found: @supabase/supabase-js` | Faltó instalar | `npm install` |
| Puerto 3000 ocupado | Otra app usa ese puerto | Next.js ofrece otro puerto solo (3001); usar ese link |
| Cambié `.env.local` y no pasa nada | Next.js lee las claves al arrancar | Parar (`Ctrl + C`) y volver a correr `npm run dev` |
| La app dice "Modo local" pero puse las claves | Archivo mal nombrado o en otra carpeta | Debe llamarse exactamente `.env.local`, en la raíz (junto a `package.json`) |

## En Vercel

| Qué pasa | Causa probable | Arreglo |
| --- | --- | --- |
| Build falla con "Type error" | Error de TypeScript | Copiar el error del log (Deployments → el que falló → Build Logs) y arreglarlo; en Claude Code, reproducir con `npm run build` |
| Build falla: "Couldn't find any `pages` or `app` directory" | Se subió la carpeta contenedora, no su contenido | En GitHub, `package.json` debe estar en la raíz. Volver a subir bien, o en Vercel → Settings → **Root Directory** elegir la carpeta |
| La web abre pero dice "Modo local" | Faltan las variables o se agregaron después del deploy | Vercel → Settings → Environment Variables → revisar nombres exactos → **Deployments → ⋯ → Redeploy** |
| `404: NOT_FOUND` | Proyecto mal importado o despliegue fallido | Revisar que el último deploy esté en verde (Ready) |

## Con Supabase

| Qué pasa | Causa probable | Arreglo |
| --- | --- | --- |
| "Invalid API key" | Clave copiada incompleta o equivocada | Volver a copiar la publishable key desde Connect; revisar que no tenga espacios |
| Me registro y no me deja entrar | Falta confirmar el correo | Revisar el correo (y spam), o apagar **Confirm email** en Authentication → Sign In / Providers → Email |
| El link del correo lleva a `localhost` | Site URL sin configurar | Authentication → URL Configuration → Site URL = link de Vercel |
| "new row violates row-level security policy" | La política no deja insertar o la app manda un `user_id` distinto | Revisar que la tabla tenga `user_id default auth.uid()`, que la app no envíe `user_id` y que la política tenga `with check` |
| La lista sale vacía aunque hay datos en Table Editor | Esos datos se crearon a mano sin `user_id` del usuario, o con otra cuenta | RLS solo muestra lo de la cuenta actual; crear los datos desde la app |
| `relation "public.gastos" does not exist` | No se corrió el SQL o se corrió en otro proyecto | Correr `schema.sql` en el proyecto correcto |
| "Email rate limit exceeded" | Supabase gratis limita los correos por hora | Esperar una hora o apagar Confirm email mientras prueba |
| Todo dejó de funcionar después de unos días | Proyecto pausado por inactividad (plan gratis) | Entrar a Supabase → el proyecto → **Restore / Resume** |

## Con GitHub

| Qué pasa | Causa probable | Arreglo |
| --- | --- | --- |
| No me deja subir tantos archivos | Está subiendo `node_modules` | No subir `node_modules` ni `.next` (se generan solos) |
| `git push` pide usuario y contraseña | GitHub ya no acepta contraseña | Usar `gh auth login` o un token; en Claude Code, ofrecer hacerlo con `gh` |
| Subí mi `.env.local` por error | No estaba en `.gitignore` | Borrarlo del repo, agregarlo a `.gitignore`. La publishable key es pública, pero si se subió una *secret key*, rotarla en Supabase |

## Si nada de esto aplica

Pide: (1) qué intentaba hacer, (2) el mensaje de error completo, (3) captura de
pantalla. Explica la causa en una frase simple antes de dar el arreglo.
