-- Mis finanzas · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Cada persona solo ve y cambia sus propios datos (Row Level Security).

-- 1) Categorías (ej: Comida, Sueldo). budget = presupuesto mensual (opcional).
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  kind text not null check (kind in ('ingreso', 'egreso')),
  emoji text not null default '•',
  color text not null default '#2a78d6',
  budget numeric(14, 2) check (budget is null or budget > 0),
  created_at timestamptz not null default now()
);

-- 2) Movimientos: cada ingreso o egreso.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('ingreso', 'egreso')),
  amount numeric(14, 2) not null check (amount > 0),
  category_id uuid references public.categories (id) on delete set null,
  note text not null default '' check (char_length(note) <= 120),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date on public.transactions (user_id, date desc);
create index if not exists categories_user on public.categories (user_id);

-- 3) Seguridad: nadie ve los datos de otra persona.
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Cada quien sus categorías" on public.categories;
create policy "Cada quien sus categorías" on public.categories
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada quien sus movimientos" on public.transactions;
create policy "Cada quien sus movimientos" on public.transactions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
