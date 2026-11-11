-- Agrega "Mi asistente" (NOVA) a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'asistente',
  'Mi asistente',
  'NOVA, tu asistente personal con pantalla futurista: le hablas y organiza tu día.',
  'Asistente personal con estilo de película: un núcleo de luz que late cuando te habla y paneles con tu agenda, tareas, gastos del mes, gimnasio y notas. Le escribes o le hablas ("gasté 20 en comida", "agenda a las 5 dentista") y lo anota solo. Voz gratis del navegador. La descarga trae el código, la base de datos lista para tu propio Supabase y la guía para conectarle Claude.',
  'Organización',
  'en_vivo',
  '🤖',
  '#2f8dff',
  'https://juanfracode.vercel.app/portadas/asistente.webp',
  'https://juanfracode.vercel.app/apps/asistente',
  null,
  'https://juanfracode.vercel.app/descargas/asistente.zip',
  array['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
  array['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  array[
    'Chat con NOVA para anotar todo en una frase',
    'Voz gratis: te lee y te escucha',
    'Agenda, tareas, gastos, gimnasio y notas en una pantalla',
    'Núcleo de luz animado que late al hablar',
    'Cada persona ve solo sus datos'
  ],
  true,
  5
)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  category = excluded.category, status = excluded.status, emoji = excluded.emoji, color = excluded.color,
  cover_url = excluded.cover_url, demo_url = excluded.demo_url, zip_url = excluded.zip_url,
  stack = excluded.stack, env_vars = excluded.env_vars, features = excluded.features,
  published = excluded.published, sort_order = excluded.sort_order;
