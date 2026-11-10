-- Agrega "Mi CRM" a la vitrina (o la actualiza si ya existe).
-- Pégalo en Supabase > SQL Editor > New query del proyecto juanfracode y pulsa Run.
insert into public.saas (
  slug, name, tagline, description, category, status, emoji, color,
  cover_url, demo_url, repo_url, zip_url, stack, env_vars, features, published, sort_order
) values (
  'crm',
  'Mi CRM',
  'Tus clientes, tus tratos por etapa y tus seguimientos en un solo lugar.',
  'CRM personal para freelancers: guarda a tus clientes, mueve cada trato por etapas en un tablero (de Nuevo a Ganado), agenda seguimientos por WhatsApp, llamada o correo para no olvidar a nadie, y mira cuánto tienes en juego y cuánto ganaste cada mes. La descarga trae el código y la base de datos lista para tu propio Supabase.',
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
    'Tablero de tratos con arrastrar y soltar',
    'Seguimientos con atrasados y para hoy',
    'Ficha del cliente con WhatsApp e historial',
    'Resumen con embudo y ganado por mes',
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
