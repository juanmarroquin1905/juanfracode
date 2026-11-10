-- Agrega "Mi gimnasio" a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'gimnasio',
  'Mi gimnasio',
  'Tus rutinas, pesos y repeticiones, con tu progreso en gráficos.',
  'App para el gimnasio: arma tus rutinas, anota cada serie con su peso y repeticiones y mira cómo subes de fuerza con gráficos, récords personales, racha de semanas y calendario de constancia. Trae temporizador de descanso. La descarga trae el código y la base de datos lista para tu propio Supabase.',
  'Salud',
  'en_vivo',
  '🏋️',
  '#84cc16',
  'https://juanfracode.vercel.app/portadas/gimnasio.webp',
  'https://juanfracode.vercel.app/apps/gimnasio',
  null,
  'https://juanfracode.vercel.app/descargas/gimnasio.zip',
  array['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
  array['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  array[
    'Rutinas editables y registro de series',
    'Progreso por ejercicio con récords',
    'Calendario de constancia y racha',
    'Temporizador de descanso',
    'Cada persona ve solo sus datos'
  ],
  true,
  2
)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  category = excluded.category, status = excluded.status, emoji = excluded.emoji, color = excluded.color,
  cover_url = excluded.cover_url, demo_url = excluded.demo_url, zip_url = excluded.zip_url,
  stack = excluded.stack, env_vars = excluded.env_vars, features = excluded.features,
  published = excluded.published, sort_order = excluded.sort_order;
