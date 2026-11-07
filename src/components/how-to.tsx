const STEPS = [
  {
    title: "Despliega en Vercel",
    text: "Pulsa “Deploy en Vercel”. Se crea una copia del código en tu GitHub y Vercel la publica con tu propio enlace.",
  },
  {
    title: "Conecta Supabase",
    text: "En el mismo paso Vercel te ofrece crear tu proyecto de Supabase gratis y pone las claves solo. Si lo haces a mano, cópialas de Supabase > Project Settings > API.",
  },
  {
    title: "Crea las tablas",
    text: "Abre Supabase > SQL Editor, pega el archivo supabase/schema.sql de la plantilla y pulsa Run.",
  },
  {
    title: "Hazla tuya y lánzala",
    text: "Cambia nombre, colores y textos (casi siempre en src/config). Cada cambio que subas a GitHub se publica solo.",
  },
];

export function HowTo({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {STEPS.map((s, i) => (
        <li key={s.title} className="card p-5">
          <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{i + 1}</span>
          <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
