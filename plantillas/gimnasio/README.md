# Mi gimnasio

App para el gimnasio: arma tus **rutinas**, anota cada **serie con su peso y repeticiones**
y mira tu **progreso en gráficos**, tus **récords** y tu **constancia**.
Hecho con Next.js, Supabase y Tailwind. Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- **Hoy toca**: te dice qué rutina sigue y la empiezas con un toque, con el peso de la última vez ya puesto.
- Registro de series (peso y repeticiones) con aviso 🏆 cuando superas tu marca anterior.
- Temporizador de descanso entre series (vibra el celular al terminar).
- Rutinas editables (empieza con Empuje, Tirón y Piernas) y ejercicios por grupo muscular.
- Progreso por ejercicio: fuerza estimada (1RM), peso máximo o volumen, con tus récords marcados.
- Volumen por semana, músculos trabajados, racha de semanas y calendario de constancia.
- Historial por mes y exportación a Excel (CSV).
- Kilos o libras. Funciona en el celular.
- Tu cuenta con correo y contraseña: cada persona ve solo sus datos.

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
- En el celular, ábrela en el navegador y elige **Agregar a pantalla de inicio**: queda como una app.
- En el plan gratis, Supabase pausa el proyecto si pasa 1 semana sin uso. Se reactiva desde su panel.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/gimnasio/gym-app.tsx` | Toda la pantalla: inicio, historial, progreso, rutinas y ventanas |
| `src/gimnasio/gym.css` | Los colores y el estilo (oscuro con verde lima) |
| `src/gimnasio/charts.tsx` | Los gráficos (barras, línea de progreso y calendario) |
| `src/gimnasio/seed.ts` | Los ejercicios y rutinas con los que empieza una cuenta nueva |
| `src/gimnasio/utils.ts` | Cálculos: récords, fuerza estimada, rachas y volumen |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/gimnasio/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | Las tablas y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
