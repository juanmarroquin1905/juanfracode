-- Mi CRM · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Una sola tabla: tus clientes. Cada persona solo ve los suyos (Row Level Security).

create table if not exists public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  company text not null default '' check (char_length(company) <= 80),
  phone text not null default '' check (char_length(phone) <= 30),
  email text not null default '' check (char_length(email) <= 120),
  service text not null default '' check (char_length(service) <= 80),
  value numeric(14, 2) not null default 0 check (value >= 0),
  stage text not null default 'nuevo' check (stage in ('nuevo', 'hablando', 'propuesta', 'cliente', 'perdido')),
  next_step text not null default '' check (char_length(next_step) <= 100),
  next_date date,
  notes text not null default '' check (char_length(notes) <= 600),
  color text not null default '#cdeafe',
  created_at timestamptz not null default now()
);

create index if not exists crm_clients_user on public.crm_clients (user_id, stage);

-- Seguridad: nadie ve los clientes de otra persona.
alter table public.crm_clients enable row level security;
drop policy if exists "Cada quien lo suyo" on public.crm_clients;
create policy "Cada quien lo suyo" on public.crm_clients for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
