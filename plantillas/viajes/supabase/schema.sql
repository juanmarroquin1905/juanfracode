-- Mis viajes · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Cada persona solo ve y cambia sus propios viajes (Row Level Security).

-- 1) Viajes
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  destination text not null check (char_length(destination) between 1 and 120),
  flag text not null default '✈️',
  start_date date not null,
  end_date date not null,
  budget numeric(14, 2) check (budget is null or budget > 0),
  currency text not null default 'USD',
  travelers int not null default 1 check (travelers between 1 and 30),
  color text not null default '#2f5d8a',
  notes text not null default '' check (char_length(notes) <= 600),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- 2) Alojamiento (hoteles, hostales, Airbnb)
create table if not exists public.trip_stays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  address text not null default '',
  check_in date not null,
  check_out date not null,
  price numeric(14, 2) not null default 0 check (price >= 0),
  paid boolean not null default false,
  confirmation text not null default '',
  url text not null default '',
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

-- 3) Gastos
create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null check (category in ('transporte', 'comida', 'actividades', 'compras', 'otros')),
  note text not null default '' check (char_length(note) <= 80),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 4) Itinerario: cada actividad de cada día
create table if not exists public.trip_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  date date not null,
  time text not null default '',
  title text not null check (char_length(title) between 1 and 80),
  place text not null default '',
  notes text not null default '' check (char_length(notes) <= 300),
  lat double precision,
  lng double precision,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5) Qué llevar
create table if not exists public.trip_packing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  "group" text not null default 'otros' check ("group" in ('documentos', 'ropa', 'aseo', 'tecnologia', 'botiquin', 'otros')),
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trips_user on public.trips (user_id, start_date);
create index if not exists trip_stays_trip on public.trip_stays (trip_id);
create index if not exists trip_expenses_trip on public.trip_expenses (trip_id);
create index if not exists trip_activities_trip on public.trip_activities (trip_id);
create index if not exists trip_packing_trip on public.trip_packing (trip_id);

-- 6) Seguridad: nadie ve los datos de otra persona.
do $$
declare t text;
begin
  foreach t in array array['trips', 'trip_stays', 'trip_expenses', 'trip_activities', 'trip_packing'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Cada quien lo suyo" on public.%I', t);
    execute format(
      'create policy "Cada quien lo suyo" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end $$;
