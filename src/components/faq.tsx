const QUESTIONS = [
  {
    q: "¿Es gratis?",
    a: "Sí. Las plantillas son gratis: solo te pido tu nombre, correo y WhatsApp la primera vez que descargas. Vercel, Supabase y GitHub también tienen planes gratis que alcanzan para uso personal.",
  },
  {
    q: "¿Necesito saber programar?",
    a: "No para lanzarla: con el botón “Deploy en Vercel” la tienes publicada en minutos. Para cambiarla a tu gusto, te ayuda Claude Code (y mis videos).",
  },
  {
    q: "¿La demo guarda mis datos?",
    a: "No. La demo usa datos de ejemplo. Para usarla de verdad, lánzala con tu propio Vercel y Supabase: los datos quedan en tu cuenta, solo tú los ves.",
  },
  {
    q: "¿Qué cuentas necesito?",
    a: "GitHub (para tu copia del código), Vercel (para publicarla) y Supabase (la base de datos). Las tres se crean gratis en un par de minutos.",
  },
  {
    q: "¿Puedo cambiarla o venderla?",
    a: "Sí. Las plantillas van con licencia MIT: puedes usarlas, cambiarlas y hasta convertirlas en tu propio negocio.",
  },
];

export function Faq() {
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {QUESTIONS.map((item) => (
        <details key={item.q} className="group px-5 py-4 open:bg-slate-50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
            {item.q}
            <span className="font-mono text-accent transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
