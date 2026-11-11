# Mi asistente (NOVA)

Tu **asistente personal** con pantalla futurista: un núcleo de luz que late cuando te habla
y paneles con tu día. Le escribes (o le hablas) y anota tareas, gastos, notas, entrenamientos
y eventos de tu agenda.
Hecho con Next.js, Supabase y Tailwind. Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- **Chat con NOVA** al centro: "agrega tarea llamar al banco", "gasté 20 en comida",
  "agenda a las 5 dentista", "entrené 45 minutos", "nota: idea de video", "¿qué tengo hoy?".
- **Voz gratis** del navegador: NOVA puede leer sus respuestas en voz alta y escucharte por el micrófono
  (Chrome, Edge y Safari). No usa servicios pagados.
- Paneles: **agenda de hoy**, **tareas** (marca y borra), **gastos del mes** con presupuesto,
  **gimnasio** (días de la semana) y **notas**.
- Tu cuenta con correo y contraseña: cada persona ve solo sus datos.

> NOVA entiende frases **simples** con reglas (archivo `src/asistente/brain.ts`). No usa inteligencia
> artificial, por eso funciona gratis y sin claves. Mira abajo cómo conectarle Claude.

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

- Supabase pide **confirmar el correo** al crear la cuenta. Si es solo para ti, apágalo en
  *Authentication → Sign In / Providers → Email → Confirm email*.
- Cuando ya tengas tu cuenta, apaga *Allow new users to sign up* para que nadie más se registre.
- En el plan gratis, Supabase pausa el proyecto si pasa 1 semana sin uso. Se reactiva desde su panel.
- ¿Tu presupuesto o tu meta de gimnasio? Cambia `budget` y `gymGoal` en `src/asistente/types.ts` (función `emptyData`).

## Conectar Claude (opcional, con costo)

Si quieres que NOVA entienda **cualquier frase** y te ayude de verdad, puedes cambiar el "cerebro"
de reglas por la **API de Claude** (se paga por uso, necesitas una clave de [console.anthropic.com](https://console.anthropic.com)):

1. Crea una ruta en el servidor (por ejemplo `src/app/api/nova/route.ts`) que reciba el mensaje y llame a Claude.
   La clave va como variable de entorno `ANTHROPIC_API_KEY` (nunca en el navegador).
2. Dale a Claude "herramientas" (tools): agregar tarea, anotar gasto, agendar, etc. Claude decide cuál usar
   y tu código la ejecuta sobre los mismos datos.
3. En `asistente-app.tsx`, en vez de `think(...)`, llama a tu ruta.

Pídele a Claude Code: *"Conecta NOVA a la API de Claude con tools para tareas, gastos, agenda, gimnasio y notas"*.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/asistente/asistente-app.tsx` | La pantalla: núcleo, chat y paneles |
| `src/asistente/brain.ts` | El "cerebro": qué frases entiende y qué responde |
| `src/asistente/core.tsx` | El núcleo de luz animado |
| `src/asistente/voice.ts` | Voz del navegador (hablar y escuchar) |
| `src/asistente/hud.css` | El estilo: colores neón, paneles y animaciones |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/asistente/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | La tabla y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
