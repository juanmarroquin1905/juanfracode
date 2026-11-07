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

-- ============================================================
-- 6) Contactos: quienes dejan sus datos para descargar una plantilla
--    (si ya ejecutaste lo anterior, puedes ejecutar solo desde aquí)
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null default '',
  social text not null default '',
  consent boolean not null default false,
  apps text[] not null default '{}', -- slugs de las apps que descargó
  created_at timestamptz not null default now(),
  last_download_at timestamptz not null default now()
);
alter table public.leads enable row level security;

drop policy if exists "Solo el admin ve los contactos" on public.leads;
create policy "Solo el admin ve los contactos" on public.leads
  for select using (public.is_admin());
drop policy if exists "Solo el admin borra contactos" on public.leads;
create policy "Solo el admin borra contactos" on public.leads
  for delete using (public.is_admin());

-- Los visitantes solo pueden registrarse a través de esta función (no pueden leer la tabla).
create or replace function public.register_lead(
  p_name text, p_email text, p_phone text, p_social text, p_consent boolean, p_slug text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_name), '') = '' or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Datos inválidos';
  end if;
  insert into public.leads (name, email, phone, social, consent, apps)
  values (left(trim(p_name), 120), lower(trim(p_email)), left(trim(coalesce(p_phone, '')), 40),
          left(trim(coalesce(p_social, '')), 120), coalesce(p_consent, false),
          case when p_slug is null or p_slug = '' then '{}' else array[p_slug] end)
  on conflict (email) do update set
    name = excluded.name,
    phone = case when excluded.phone <> '' then excluded.phone else leads.phone end,
    social = case when excluded.social <> '' then excluded.social else leads.social end,
    consent = leads.consent or excluded.consent,
    apps = case when p_slug = any(leads.apps) or coalesce(p_slug, '') = '' then leads.apps
                else array_append(leads.apps, p_slug) end,
    last_download_at = now();
end;
$$;
grant execute on function public.register_lead(text, text, text, text, boolean, text) to anon, authenticated;
