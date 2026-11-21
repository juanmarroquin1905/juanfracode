import Link from "next/link";

// Piezas simples para las páginas de cada pilar.

export function PillarHero({ kicker, title, highlight, text }: { kicker: string; title: string; highlight: string; text: string }) {
  return (
    <div className="enter mx-auto max-w-3xl px-4 pt-14 text-center">
      <p className="chip">{kicker}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-5xl">
        {title} <span className="text-gradient">{highlight}</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-mut">{text}</p>
    </div>
  );
}

export function Steps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="card p-5">
          <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{i + 1}</span>
          <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

// Tarjeta de recurso. Sin href = "Próximamente".
export function ResourceCard({ emoji, title, text, href, cta }: { emoji: string; title: string; text: string; href?: string; cta?: string }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-soft text-xl">{emoji}</span>
        {!href && <span className="chip">Próximamente</span>}
      </div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-mut">{text}</p>
      {href && (
        <p className="mt-auto pt-4 text-sm font-semibold text-accent">
          {cta ?? "Abrir"} <span className="arr">→</span>
        </p>
      )}
    </>
  );
  if (!href) return <div className="card flex flex-col border-dashed p-5 opacity-80">{body}</div>;
  return (
    <Link href={href} className="card lift press group flex flex-col p-5">
      {body}
    </Link>
  );
}
