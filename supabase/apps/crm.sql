-- Agrega "Mi CRM" a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'crm',
  'Mi CRM',
  'Tus clientes, en qué etapa va cada uno y el próximo paso. Simple.',
  'CRM simple para freelancers: anota a cada cliente, muévelo por etapas (Nuevo, Hablando, Propuesta, Cliente) y ponle un próximo paso con fecha para no olvidar a nadie. Todo en una sola pantalla. La descarga trae el código y la base de datos lista para tu propio Supabase.',
  'Negocios',
  'en_vivo',
  '🤝',
  '#7048e8',
  'https://juanfracode.vercel.app/portadas/crm.webp',
  'https://juanfracode.vercel.app/apps/crm',
  null,
  'https://juanfracode.vercel.app/descargas/crm.zip',
  array['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
  array['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  array[
    'Todo en una sola pantalla',
    'Tablero con 4 etapas',
    'Próximo paso con fecha y lista de hoy',
    'Botón directo a WhatsApp',
    'Cada persona ve solo sus clientes'
  ],
  true,
  4
)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  category = excluded.category, status = excluded.status, emoji = excluded.emoji, color = excluded.color,
  cover_url = excluded.cover_url, demo_url = excluded.demo_url, zip_url = excluded.zip_url,
  stack = excluded.stack, env_vars = excluded.env_vars, features = excluded.features,
  published = excluded.published, sort_order = excluded.sort_order;
