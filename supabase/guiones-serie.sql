-- VidScript: modo "Dividir en serie". Agrega dónde se guarda el plan de partes y el chat de cada parte.
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run. Se puede correr más de una vez.
alter table public.guiones_videos add column if not exists serie jsonb not null default '[]'::jsonb;
