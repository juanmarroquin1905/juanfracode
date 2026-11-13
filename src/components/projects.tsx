"use client";

import { useState } from "react";

// Mis proyectos: productos reales de Juan (no son plantillas).
// Para cambiar la imagen de un proyecto, pon `image` (una URL o un archivo en /public).
type Project = {
  name: string;
  url: string;
  description: string;
  tag: string;
  image?: string;
  // Vista de respaldo si no hay imagen o no carga
  mock: { headline: string; sub: string; color: string; emoji: string };
};

const PROJECTS: Project[] = [
  {
    name: "Tufierro",
    url: "https://tufierro.com",
    description: "Compra y vende autos en todo el Perú. Publicas gratis y hablas directo con el vendedor por WhatsApp.",
    tag: "Autos · Perú",
    image: "/proyectos/tufierro.webp",
    mock: { headline: "Encuentra tu fierro ideal", sub: "Autos usados y nuevos en todo el Perú", color: "#1d4ed8", emoji: "🚗" },
  },
  {
    name: "Vitrally",
    url: "https://vitrally.com",
    description: "Convierte tu catálogo en una tienda online con tu marca. Tus clientes arman el pedido y te llega por WhatsApp.",
    tag: "Tiendas online",
    image: "/proyectos/vitrally.webp",
    mock: {
      headline: "Tu tienda online lista en 10 minutos",
      sub: "Los pedidos te llegan por WhatsApp",
      color: "#7c3aed",
      emoji: "🛍️",
    },
  },
  {
    name: "Guionera",
    url: "/guiones",
    description: "Pega el link de un video que ya funcionó y recibe un guion listo para grabar en TikTok o Reels, con ganchos para probar.",
    tag: "Guiones · IA",
    mock: { headline: "Convierte un video en tu próximo guion", sub: "Ganchos, CTA y chat para ajustarlo", color: "#0891b2", emoji: "🎬" },
  },
];

const externo = (url: string) => /^https?:\/\//.test(url);

export function Projects() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {PROJECTS.map((p) => (
        <a
          key={p.url}
          href={p.url}
          {...(externo(p.url) ? { target: "_blank", rel: "noreferrer" } : {})}
          className="card lift press group flex flex-col overflow-hidden"
        >
          <div className="border-b border-line p-3" style={{ background: `linear-gradient(180deg, ${p.mock.color}1a, ${p.mock.color}05)` }}>
            <Preview project={p} />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-ink">{p.name}</h3>
              <span className="chip">{p.tag}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-mut">{p.description}</p>
            <p className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-ink">
              <LinkIcon />
              {p.url.replace(/^https?:\/\//, "")}
              <span className="arr ml-auto text-accent">{externo(p.url) ? "↗" : "→"}</span>
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

function Preview({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const showImage = project.image && !failed;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-line bg-soft/70 px-3 py-2">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate rounded-md bg-card px-2 py-0.5 font-ui text-[10px] text-mut">
          {externo(project.url) ? project.url.replace(/^https?:\/\//, "") : `juanfracode.com${project.url}`}
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`Vista de ${project.name}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 size-full object-cover object-top"
          />
        ) : (
          <Mock project={project} />
        )}
      </div>
    </div>
  );
}

function Mock({ project }: { project: Project }) {
  const { headline, sub, color, emoji } = project.mock;
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
      style={{ background: `radial-gradient(120% 90% at 50% 0%, ${color}22, var(--color-card) 70%)` }}
    >
      <span className="text-3xl">{emoji}</span>
      <p className="text-lg font-bold tracking-tight text-balance text-ink sm:text-xl">{headline}</p>
      <p className="text-xs text-mut">{sub}</p>
      <span className="mt-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ background: color }}>
        {project.name}
      </span>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-mut" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
