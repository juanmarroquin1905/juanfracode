# Mi CRM

CRM **simple** para freelancers: anota a cada cliente, en qué etapa va
(**Nuevo → Hablando → Propuesta → Cliente**) y cuál es el **próximo paso**. Así no se te olvida nadie.
Hecho con Next.js, Supabase y Tailwind, con un estilo **neobrutalista** (bordes negros y colores pastel).
Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- Todo en **una sola pantalla**.
- Tres números: cuántas personas están en proceso, cuánto dinero hay en juego y cuánto ganaste.
- **Para hoy**: los clientes a los que tienes que escribir hoy (o ya se te pasó). Con botón de WhatsApp y "✓ Hecho".
- **Tablero** con 4 etapas. Arrastra una tarjeta para moverla (en el celular, usa las flechas ← →).
- Cada cliente: nombre, negocio, WhatsApp, correo, qué te quiere comprar, cuánto vale, próximo paso y notas.
- Los que dijeron que no quedan guardados en **Perdidos** por si quieres volver a escribirles.
- Tu cuenta con correo y contraseña: cada persona ve solo sus clientes.

## Pruébala en tu computadora (2 minutos)

Necesitas [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin Supabase funciona en **modo local** (guarda en tu navegador).

## Ponla en internet con tu propio Supabase y Vercel

1. **Supabase**: crea un proyecto en [supabase.com](https://supabase.com) (gratis).
2. En tu proyecto: **SQL Editor → New query**, pega todo `supabase/schema.sql` y pulsa **Run**.
3. **GitHub**: crea un repositorio nuevo y sube esta carpeta (en GitHub: *Add file → Upload files*, arrastra todo menos `node_modules`).
4. **Vercel**: en [vercel.com](https://vercel.com) → **Add New → Project** → elige tu repositorio.
5. Antes de pulsar Deploy, abre **Environment Variables** y agrega (las sacas de Supabase → botón **Connect**, o *Project Settings → API*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (también sirve la *publishable key*)
6. Pulsa **Deploy**. Entra a tu web, toca **Crea tu cuenta** y listo.

### Consejos

- Supabase pide **confirmar el correo** al crear la cuenta. Si es solo para ti y no quieres
  esperar el correo, apágalo en *Authentication → Sign In / Providers → Email → Confirm email*.
- Cuando ya tengas tu cuenta, puedes impedir que otros se registren en
  *Authentication → Sign In / Providers → Allow new users to sign up* (apagado).
  Igual, cada cuenta ve solo sus propios datos.
- En el plan gratis, Supabase pausa el proyecto si pasa 1 semana sin uso. Se reactiva desde su panel.
- ¿Quieres otras etapas o tu moneda? Cámbialas en `src/crm/utils.ts` (lista `STAGES` y función `money`).
  Si cambias las etapas, cámbialas también en el `check` de `stage` en `supabase/schema.sql`.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/crm/crm-app.tsx` | La pantalla: números, "Para hoy" y el tablero |
| `src/crm/client-dialog.tsx` | La ventana para agregar o editar un cliente |
| `src/crm/crm.css` | El estilo: colores, bordes y sombras |
| `src/crm/utils.ts` | Etapas, dinero y fechas |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/crm/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | La tabla y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
