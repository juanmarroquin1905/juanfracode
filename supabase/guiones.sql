-- Guionera: guarda tus videos, la transcripción y el chat con cada guion.
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
-- Solo el administrador (tu usuario en la tabla admins) puede ver y usar estos datos.
create table if not exists public.guiones_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url text not null default '',
  video_id text,                       -- id de YouTube, si el link es de YouTube
  title text not null default 'Video sin título',
  channel text not null default '',
  transcript text not null,
  opciones jsonb not null default '{}'::jsonb,   -- estilo de gancho, CTA, duración, tono...
  mensajes jsonb not null default '[]'::jsonb,   -- el chat: [{role, content}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guiones_videos_user_idx on public.guiones_videos (user_id, updated_at desc);

alter table public.guiones_videos enable row level security;

drop policy if exists "El admin ve sus videos" on public.guiones_videos;
create policy "El admin ve sus videos" on public.guiones_videos
  for select using (public.is_admin() and user_id = auth.uid());

drop policy if exists "El admin crea sus videos" on public.guiones_videos;
create policy "El admin crea sus videos" on public.guiones_videos
  for insert with check (public.is_admin() and user_id = auth.uid());

drop policy if exists "El admin edita sus videos" on public.guiones_videos;
create policy "El admin edita sus videos" on public.guiones_videos
  for update using (public.is_admin() and user_id = auth.uid())
  with check (public.is_admin() and user_id = auth.uid());

drop policy if exists "El admin borra sus videos" on public.guiones_videos;
create policy "El admin borra sus videos" on public.guiones_videos
  for delete using (public.is_admin() and user_id = auth.uid());
