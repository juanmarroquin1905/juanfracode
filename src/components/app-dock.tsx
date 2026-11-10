"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Saas } from "@/lib/types";
import { AppPreview, addressOf } from "./app-preview";

type DockApp = Pick<
  Saas,
  | "id"
  | "slug"
  | "name"
  | "tagline"
  | "category"
  | "emoji"
  | "color"
  | "cover_url"
  | "demo_url"
  | "features"
  | "repo_url"
  | "zip_url"
>;

// Palabra del titular según la categoría: "Apps simples para tu dinero".
const WORDS: Record<string, string> = {
  finanzas: "tu dinero",
  dinero: "tu dinero",
  hábitos: "tus hábitos",
  habitos: "tus hábitos",
  productividad: "tus hábitos",
  salud: "tu salud",
  cocina: "tu cocina",
  recetas: "tu cocina",
  organización: "organizarte",
  organizacion: "organizarte",
  estudio: "tus estudios",
  estudios: "tus estudios",
  viajes: "tus viajes",
  hogar: "tu casa",
  negocios: "tu negocio",
  negocio: "tu negocio",
  trabajo: "tu trabajo",
  clientes: "tus clientes",
};
const DEFAULT_WORD = "tu día a día";
const wordFor = (category?: string) =>
  WORDS[category?.trim().toLowerCase() ?? ""] ?? DEFAULT_WORD;

export function AppDock({ apps }: { apps: DockApp[] }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0); // lo que se ve mientras termina la transición
  const [out, setOut] = useState(false);
  const [live, setLive] = useState<string | null>(null); // app cuya demo se abrió dentro de la ventana
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const app = apps[shown];
  const word = app ? wordFor(app.category) : DEFAULT_WORD;

  function pick(i: number) {
    if (i === idx) return;
    setIdx(i);
    setOut(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(i);
      setOut(false);
    }, 180);
  }

  return (
    <>
      <header className="mx-auto max-w-3xl px-4 pt-10 pb-8 text-center sm:pt-14">
        <h1 className="enter text-[clamp(36px,5vw,60px)] leading-[1.04] font-bold tracking-[-0.04em] text-ink">
          Apps simples para{" "}
          <span className="swap text-gradient block pb-[0.12em]" data-out={out}>
            {word}
          </span>
        </h1>
        <p className="enter enter-1 mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-mut">
          {apps.length > 0
            ? "Elige una app en la barra de abajo y pruébala aquí mismo. Si te sirve, te llevas el código gratis."
            : "Pequeñas apps de uso personal con el código listo para lanzar en Vercel con tu propio Supabase. Muy pronto las primeras."}
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)] lg:items-center lg:gap-8">
          {/* Ventana con la app */}
          <div
            className={`glass enter enter-2 overflow-hidden rounded-[20px] ${app ? "" : "mx-auto w-full max-w-3xl lg:col-span-2"}`}
          >
            {app ? (
              <div className="swap" data-out={out}>
                {live === app.id && app.demo_url ? (
                  <LiveDemo app={app} onClose={() => setLive(null)} />
                ) : (
                  <div className="relative">
                    <AppPreview saas={app} bare />
                    {app.demo_url && (
                      <button
                        type="button"
                        onClick={() => setLive(app.id)}
                        className="btn absolute right-4 bottom-4 hidden sm:inline-flex"
                      >
                        ▶ Probar aquí
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <EmptyWindow />
            )}
          </div>

          {/* Dock de apps */}
          {apps.length > 0 && (
            <div className="enter enter-2 order-2 mt-6 flex justify-center lg:order-3 lg:col-span-2">
              <div
                role="group"
                aria-label="Apps"
                className="glass relative flex max-w-full gap-1.5 overflow-x-auto rounded-3xl p-2"
              >
                {apps.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={i === idx}
                    onClick={() => pick(i)}
                    className={`group press flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-[18px] pt-2.5 pb-2 font-ui text-[11.5px] transition-[background-color,color,transform,box-shadow] duration-200 sm:w-[84px] ${
                      i === idx
                        ? "bg-white font-medium text-ink shadow-[0_4px_14px_-6px_rgba(30,64,175,0.3)]"
                        : "text-mut"
                    }`}
                  >
                    <span
                      className="grid size-10 place-items-center rounded-xl text-xl transition-transform duration-200 ease-(--ease-out) group-hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${a.color}40, ${a.color}18)`,
                      }}
                    >
                      {a.emoji}
                    </span>
                    <span className="max-w-full truncate px-1">{a.name}</span>
                  </button>
                ))}
                <span className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-[18px] pt-2.5 pb-2 font-ui text-[11.5px] text-mut sm:w-[84px]">
                  <span className="grid size-10 place-items-center rounded-xl bg-soft text-xl text-slate-400">
                    +
                  </span>
                  Pronto
                </span>
              </div>
            </div>
          )}

          {/* Ficha de la app elegida */}
          {app && (
            <div
              className="swap enter enter-3 order-3 mt-7 text-center lg:order-2 lg:mt-0 lg:text-left"
              data-out={out}
            >
              <span className="chip">{app.category}</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">
                {app.name}
              </h2>
              <p className="mx-auto mt-2 max-w-md leading-relaxed text-mut lg:mx-0">
                {app.tagline}
              </p>
              {app.features.length > 0 && (
                <ul className="mt-4 flex flex-col items-center gap-2 font-ui text-sm text-ink lg:items-start">
                  {app.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent-2" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                {app.repo_url || app.zip_url ? (
                  <Link
                    href={`/saas/${app.slug}?descargar=${app.repo_url ? "repo" : "zip"}`}
                    className="btn"
                  >
                    Descargar gratis <span className="arr">→</span>
                  </Link>
                ) : (
                  <span className="btn-ghost pointer-events-none opacity-70">
                    Código muy pronto
                  </span>
                )}
                <Link href={`/saas/${app.slug}`} className="btn-ghost">
                  Ver ficha
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LiveDemo({ app, onClose }: { app: DockApp; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-line bg-white/70 px-4 py-2.5 font-ui text-xs text-mut">
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
        <span className="ml-2 truncate rounded-md bg-soft px-2.5 py-1">
          {addressOf(app)}
        </span>
        <a
          href={app.demo_url!}
          target="_blank"
          rel="noreferrer"
          className="ml-auto shrink-0 hover:text-ink"
        >
          Abrir aparte ↗
        </a>
        <button
          type="button"
          onClick={onClose}
          className="press shrink-0 rounded-md px-2 py-1 hover:text-ink"
        >
          Cerrar
        </button>
      </div>
      <iframe
        src={app.demo_url!}
        title={`Demo de ${app.name}`}
        className="block aspect-[16/10] w-full bg-white lg:aspect-[16/9]"
        loading="lazy"
      />
    </div>
  );
}

function EmptyWindow() {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
        <span className="size-2.5 rounded-full bg-[#dbe3f3]" />
      </div>
      <div className="grid aspect-[16/10] place-items-center lg:aspect-[16/9] bg-white/60 p-8 text-center">
        <div>
          <span className="brand-gradient mx-auto grid size-14 place-items-center rounded-2xl font-mono text-lg font-bold text-white">
            {"</>"}
          </span>
          <p className="mt-4 text-lg font-semibold text-ink">
            La primera app está en camino
          </p>
          <p className="mt-1 text-sm text-mut">
            Aquí podrás probarla antes de descargarla.
          </p>
        </div>
      </div>
    </div>
  );
}
