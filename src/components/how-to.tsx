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
        <li key={s.title} className="rounded-2xl border border-line bg-card p-5">
          <span className="font-mono text-xs text-accent">paso {String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-1 font-bold text-white">{s.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
