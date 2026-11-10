-- Agrega "Mis viajes" a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'viajes',
  'Mis viajes',
  'Planifica tu viaje: destino, hotel, presupuesto, gastos e itinerario día por día.',
  'Planificador de viajes con estilo de pasaporte: crea tus viajes, guarda tu hotel con fechas y código de reserva, arma el itinerario día por día, anota los gastos y mira cuánto te queda del presupuesto, y marca la lista de qué llevar. La descarga trae el código y la base de datos lista para tu propio Supabase.',
  'Viajes',
  'en_vivo',
  '✈️',
  '#c4472f',
  'https://juanfracode.vercel.app/portadas/viajes.webp',
  'https://juanfracode.vercel.app/apps/viajes',
  null,
  'https://juanfracode.vercel.app/descargas/viajes.zip',
  array['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
  array['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  array[
    'Itinerario día por día',
    'Presupuesto vs. gastado por categoría',
    'Hoteles con fechas, precio y código de reserva',
    'Lista de qué llevar con lista sugerida',
    'Cada persona ve solo sus viajes'
  ],
  true,
  3
)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  category = excluded.category, status = excluded.status, emoji = excluded.emoji, color = excluded.color,
  cover_url = excluded.cover_url, demo_url = excluded.demo_url, zip_url = excluded.zip_url,
  stack = excluded.stack, env_vars = excluded.env_vars, features = excluded.features,
  published = excluded.published, sort_order = excluded.sort_order;
