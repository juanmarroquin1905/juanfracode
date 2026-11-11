-- Mi asistente (NOVA) · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Una sola tabla: una fila por persona con sus tareas, agenda, gastos, gimnasio y notas.
-- Cada persona solo ve lo suyo (Row Level Security).

create table if not exists public.asistente_data (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 2000000),
  updated_at timestamptz not null default now()
);

-- Seguridad: nadie ve los datos de otra persona.
alter table public.asistente_data enable row level security;
drop policy if exists "Cada quien lo suyo" on public.asistente_data;
create policy "Cada quien lo suyo" on public.asistente_data for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
