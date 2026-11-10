-- Agrega "Mis finanzas" a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'finanzas',
  'Mis finanzas',
  'Tus ingresos y egresos en un solo lugar, con gráficos por día, semana y mes.',
  'Dashboard de finanzas personales: anota ingresos y egresos, ordénalos con tus propias categorías, ponle presupuesto a cada una y mira a dónde se va tu dinero con gráficos por día, semana y mes. La descarga trae el código y la base de datos lista para tu propio Supabase.',
  'Finanzas',
  'en_vivo',
  '💸',
  '#1baf7a',
  'https://juanfracode.vercel.app/portadas/finanzas.webp',
  'https://juanfracode.vercel.app/apps/finanzas',
  null,
  'https://juanfracode.vercel.app/descargas/finanzas.zip',
  array['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
  array['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  array[
    'Ingresos y egresos con categorías editables',
    'Gráficos por día, semana y mes',
    'Presupuesto mensual por categoría',
    'Buscador, filtros y exportar a Excel',
    'Cada persona ve solo sus datos'
  ],
  true,
  1
)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  category = excluded.category, status = excluded.status, emoji = excluded.emoji, color = excluded.color,
  cover_url = excluded.cover_url, demo_url = excluded.demo_url, zip_url = excluded.zip_url,
  stack = excluded.stack, env_vars = excluded.env_vars, features = excluded.features,
  published = excluded.published, sort_order = excluded.sort_order;
