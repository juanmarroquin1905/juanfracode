-- Mi gimnasio · base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.
-- Cada persona solo ve y cambia sus propios datos (Row Level Security).

-- 1) Ejercicios (ej: Press de banca) con su grupo muscular.
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  muscle text not null check (muscle in ('Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core')),
  created_at timestamptz not null default now()
);

-- 2) Rutinas (ej: Empuje). items = lista de ejercicios con series y repeticiones:
--    [{"exercise_id": "...", "sets": 4, "reps": 8}, ...]
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  emoji text not null default '🔥',
  color text not null default '#c6f24e',
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  created_at timestamptz not null default now()
);

-- 3) Entrenamientos. sets = cada serie hecha, en orden:
--    [{"exercise_id": "...", "weight": 60, "reps": 8}, ...]   (weight 0 = peso corporal)
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  name text not null default 'Entrenamiento' check (char_length(name) <= 40),
  routine_id uuid references public.routines (id) on delete set null,
  duration integer check (duration is null or duration between 1 and 1440),
  note text not null default '' check (char_length(note) <= 200),
  sets jsonb not null default '[]'::jsonb check (jsonb_typeof(sets) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date on public.workouts (user_id, date desc);
create index if not exists exercises_user on public.exercises (user_id);
create index if not exists routines_user on public.routines (user_id);

-- 4) Seguridad: nadie ve los datos de otra persona.
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.workouts enable row level security;

drop policy if exists "Cada quien sus ejercicios" on public.exercises;
create policy "Cada quien sus ejercicios" on public.exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada quien sus rutinas" on public.routines;
create policy "Cada quien sus rutinas" on public.routines
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada quien sus entrenamientos" on public.workouts;
create policy "Cada quien sus entrenamientos" on public.workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
