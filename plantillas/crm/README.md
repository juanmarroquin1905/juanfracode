# Mi CRM

CRM personal para **freelancers**: guarda a tus **clientes**, lleva cada **trato** por etapas en un
**tablero** (de "Nuevo" a "Ganado") y agenda los **seguimientos** para que nadie se te enfríe.
Hecho con Next.js, Supabase y Tailwind, con un estilo **neobrutalista** (bordes negros y colores pastel).
Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- **Resumen**: cuánto tienes en juego, el pronóstico según la etapa, lo ganado este mes,
  tu tasa de cierre, lo que toca hacer hoy, tu embudo y lo ganado mes a mes.
- **Tablero de tratos** con 6 etapas: Nuevo, Contactado, Propuesta, Negociación, Ganado y Perdido.
  Arrastra las tarjetas para moverlas (en el celular, usa las flechas ← →). Cada columna suma su valor.
- **Contactos** con buscador, etiquetas, origen (Instagram, referido…) y exportar a Excel (CSV).
- **Ficha de cada cliente**: botones de WhatsApp, llamar y correo; sus tratos; próximos pasos;
  y un **historial** con tus notas, lo que ya hiciste y los tratos cerrados.
- **Seguimientos** agrupados en atrasados, hoy, mañana, esta semana y más adelante.
  Márcalos como hechos o pásalos para mañana con un toque.
- Moneda a elegir (USD, EUR, MXN, COP, PEN…). Funciona en el celular.
- Tu cuenta con correo y contraseña: cada persona ve solo sus clientes.
- No usa ningún servicio con clave aparte de Supabase.

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
- La moneda elegida se recuerda en cada navegador.
- ¿Quieres otras etapas? Cámbialas en `src/crm/utils.ts` (lista `STAGES`) y en el `check` de
  `crm_deals.stage` en `supabase/schema.sql`.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/crm/crm-app.tsx` | La app: menú, pestañas y ventanas |
| `src/crm/dashboard.tsx` | El resumen con números y gráficos |
| `src/crm/board.tsx` | El tablero de tratos (arrastrar y soltar) |
| `src/crm/contacts.tsx` | La lista de contactos y la ficha de cada uno |
| `src/crm/followups.tsx` | Los seguimientos |
| `src/crm/dialogs.tsx` | Las ventanas para crear o editar |
| `src/crm/crm.css` | El estilo: colores, bordes y sombras |
| `src/crm/utils.ts` | Etapas, tipos de seguimiento, monedas y fechas |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/crm/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | Las tablas y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
