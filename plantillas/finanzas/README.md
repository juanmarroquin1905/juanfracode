# Mis finanzas

Dashboard de finanzas personales: anota tus **ingresos y egresos**, ordénalos por
**categorías** (las creas y editas tú), ponle **presupuesto** a cada una y mira
**gráficos por día, semana y mes**. Hecho con Next.js, Supabase y Tailwind.
Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- Resumen del mes: ingresos, egresos, balance y % de ahorro (comparado con el mes anterior).
- Gráfico de ingresos vs. egresos por **día**, **semana** o **mes**.
- Dona de gastos (o ingresos) por categoría.
- Presupuestos mensuales por categoría con aviso cuando te pasas.
- Movimientos agrupados por día, con buscador, filtros y exportación a Excel (CSV).
- Categorías con nombre, ícono, color y presupuesto: crear, editar y borrar.
- Moneda a elegir (dólar, euro, soles, pesos, quetzales y más).
- Funciona en el celular.
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
- En el plan gratis, Supabase pausa el proyecto si pasa 1 semana sin uso. Se reactiva desde su panel.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/finanzas/finance-app.tsx` | Toda la pantalla: resumen, movimientos, categorías y ventanas |
| `src/finanzas/charts.tsx` | Los gráficos (barras y dona) |
| `src/finanzas/seed.ts` | Las categorías con las que empieza una cuenta nueva |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/finanzas/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | Las tablas y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
