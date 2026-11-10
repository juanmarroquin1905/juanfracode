-- Mi CRM · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Cada persona solo ve y cambia sus propios clientes (Row Level Security).

-- 1) Contactos: clientes y prospectos
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  company text not null default '' check (char_length(company) <= 80),
  email text not null default '' check (char_length(email) <= 120),
  phone text not null default '' check (char_length(phone) <= 30),
  source text not null default '' check (char_length(source) <= 40),
  tags text[] not null default '{}',
  notes text not null default '' check (char_length(notes) <= 600),
  color text not null default '#a8dcff',
  created_at timestamptz not null default now()
);

-- 2) Tratos: lo que le vas a vender a cada contacto y en qué etapa va
create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  value numeric(14, 2) not null default 0 check (value >= 0),
  stage text not null default 'nuevo'
    check (stage in ('nuevo', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido')),
  close_date date,
  closed_at date,
  notes text not null default '' check (char_length(notes) <= 600),
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 3) Seguimientos: el próximo paso con cada cliente
create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  deal_id uuid references public.crm_deals (id) on delete set null,
  title text not null check (char_length(title) between 1 and 100),
  kind text not null default 'otro' check (kind in ('llamada', 'whatsapp', 'correo', 'reunion', 'otro')),
  due_date date not null default current_date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4) Notas: el historial de lo que hablaron
create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  deal_id uuid references public.crm_deals (id) on delete set null,
  text text not null check (char_length(text) between 1 and 500),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists crm_contacts_user on public.crm_contacts (user_id);
create index if not exists crm_deals_user on public.crm_deals (user_id, stage, position);
create index if not exists crm_deals_contact on public.crm_deals (contact_id);
create index if not exists crm_tasks_user on public.crm_tasks (user_id, done, due_date);
create index if not exists crm_tasks_contact on public.crm_tasks (contact_id);
create index if not exists crm_tasks_deal on public.crm_tasks (deal_id);
create index if not exists crm_notes_contact on public.crm_notes (contact_id);
create index if not exists crm_notes_deal on public.crm_notes (deal_id);

-- 5) Seguridad: nadie ve los datos de otra persona.
do $$
declare t text;
begin
  foreach t in array array['crm_contacts', 'crm_deals', 'crm_tasks', 'crm_notes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Cada quien lo suyo" on public.%I', t);
    execute format(
      'create policy "Cada quien lo suyo" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end $$;
