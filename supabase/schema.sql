-- Vitrina de SaaS de Juanfra Code
-- Pega TODO este archivo en Supabase > SQL Editor > New query y pulsa Run.

-- 1) Quién puede entrar al panel /admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) Los SaaS que se muestran en la web
create table if not exists public.saas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  category text not null default 'Otro',
  status text not null default 'en_construccion' check (status in ('en_vivo', 'en_construccion', 'pausado')),
  emoji text not null default '🚀',
  color text not null default '#7c3aed',
  cover_url text,
  demo_url text,
  repo_url text,
  zip_url text,
  video_url text,
  stack text[] not null default '{}',
  env_vars text[] not null default '{NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY}',
  features text[] not null default '{}',
  published boolean not null default false,
  sort_order int not null default 0,
  views int not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.saas enable row level security;

drop policy if exists "Todos ven los SaaS publicados" on public.saas;
create policy "Todos ven los SaaS publicados" on public.saas
  for select using (published or public.is_admin());

drop policy if exists "Solo el admin crea, edita y borra" on public.saas;
create policy "Solo el admin crea, edita y borra" on public.saas
  for all using (public.is_admin()) with check (public.is_admin());

-- 3) Contador de visitas y descargas (los visitantes solo pueden sumar 1)
create or replace function public.track_saas(p_slug text, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_kind = 'view' then
    update public.saas set views = views + 1 where slug = p_slug and published;
  elsif p_kind = 'download' then
    update public.saas set downloads = downloads + 1 where slug = p_slug and published;
  end if;
end;
$$;
grant execute on function public.track_saas(text, text) to anon, authenticated;

-- 4) Fotos de portada (bucket público)
insert into storage.buckets (id, name, public)
values ('portadas', 'portadas', true)
on conflict (id) do nothing;

drop policy if exists "Admin sube portadas" on storage.objects;
create policy "Admin sube portadas" on storage.objects
  for insert to authenticated with check (bucket_id = 'portadas' and public.is_admin());
drop policy if exists "Admin borra portadas" on storage.objects;
create policy "Admin borra portadas" on storage.objects
  for delete to authenticated using (bucket_id = 'portadas' and public.is_admin());

-- 5) HAZTE ADMIN: primero crea tu usuario en Supabase > Authentication > Users > Add user
--    y luego cambia el correo de abajo y ejecuta SOLO esta línea:
-- insert into public.admins (user_id) select id from auth.users where email = 'tu-correo@ejemplo.com';
