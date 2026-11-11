# Supabase: base de datos y seguridad

Supabase es la base de datos en la nube (gratis para empezar). Le guardas las cosas
de la app y te da el sistema de cuentas (correo y contraseña).

## El archivo `supabase/schema.sql`

Un solo archivo que la persona pega completo en **SQL Editor → New query → Run**.
Debe poder correrse dos veces sin romperse (usa `if not exists` y
`drop policy if exists`). Empieza con un comentario en el idioma de la persona que
explique cómo usarlo.

### Plantilla (ejemplo: app de gastos)

```sql
-- Mis gastos · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Cada persona solo ve y cambia sus propios datos (Row Level Security).

-- 1) Gastos
create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0),
  fecha date not null default current_date,
  categoria text not null default 'otros'
    check (categoria in ('comida', 'transporte', 'casa', 'salud', 'ocio', 'otros')),
  nota text not null default '' check (char_length(nota) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists gastos_user_fecha on public.gastos (user_id, fecha desc);

-- 2) Seguridad: nadie ve los datos de otra persona
alter table public.gastos enable row level security;

drop policy if exists "Cada quien sus gastos" on public.gastos;
create policy "Cada quien sus gastos" on public.gastos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
```

### Reglas

- **Siempre** `enable row level security` + una política por tabla. Sin RLS, cualquiera
  con la clave pública podría leer todo. No es opcional.
- `user_id ... default auth.uid()`: la tabla pone sola el dueño. La app nunca manda
  `user_id`.
- Usa `(select auth.uid())` en las políticas (más rápido que `auth.uid()` a secas).
- Validaciones con `check`: montos positivos, textos con largo máximo, listas de
  opciones. Así la base de datos protege los datos aunque la app tenga un error.
- Un índice por `user_id` (y por la columna con la que más ordenas, como la fecha).
- Relaciones entre tablas: `references public.otra_tabla (id) on delete cascade` (si
  al borrar el padre se borran los hijos) o `on delete set null`.
- Tipos: `text`, `numeric(12,2)` para dinero, `integer`, `boolean`, `date`,
  `timestamptz`, `jsonb` solo si de verdad hace falta.

### Variantes comunes

**Datos compartidos por un equipo o familia** (para después, salvo que sea la
esencia): una tabla `grupos` + `miembros (grupo_id, user_id)` y políticas que
permitan ver filas cuyo `grupo_id` esté entre los grupos del usuario. Explícalo y
constrúyelo solo si la persona lo necesita en la versión 1.

**Algo público para todos (ej: catálogo)**: política de solo lectura para `anon`:

```sql
create policy "Todos pueden ver" on public.productos
  for select to anon, authenticated using (true);
```

Y escritura solo para el dueño (otra política `for insert/update/delete` con
`user_id = (select auth.uid())`).

## Configurar Supabase (pasos para la persona)

Dáselos uno por mensaje cuando llegue el momento:

1. Entra a [supabase.com](https://supabase.com) → **Start your project** → crea
   cuenta (puede ser con GitHub).
2. **New project**: ponle el nombre de la app, crea una contraseña de base de datos
   (guárdala) y elige la región más cercana (ej: São Paulo para Sudamérica). Espera
   1–2 minutos.
3. Menú izquierdo → **SQL Editor** → **New query** → pega todo `supabase/schema.sql` →
   **Run**. Debe decir "Success. No rows returned".
4. Botón **Connect** (arriba) o **Project Settings → API Keys**: copia la **Project
   URL** y la **publishable key** (o la *anon key* en proyectos antiguos). Nunca
   uses la *secret / service_role key* en la app.
5. (Opcional, si la app es solo para ti) **Authentication → Sign In / Providers →
   Email**: apaga **Confirm email** para no esperar el correo de confirmación. Cuando
   ya tengas tu cuenta, puedes apagar **Allow new users to sign up**.

## Bueno saber

- Plan gratis: 2 proyectos activos. Un proyecto se **pausa tras 1 semana sin uso**; se
  reactiva desde el panel con un botón.
- Para ver o editar datos a mano: **Table Editor**.
- Si cambias la estructura después, crea un archivo nuevo (ej:
  `supabase/cambio-2-agregar-presupuesto.sql`) con `alter table ...` en vez de editar
  el `schema.sql` original, y explícale a la persona que lo corra igual que el primero.
