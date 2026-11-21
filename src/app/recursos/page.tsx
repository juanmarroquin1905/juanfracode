import type { Metadata } from "next";
import Link from "next/link";
import { CopyPrompt } from "@/components/copy-prompt";
import { PillarHero, ResourceCard } from "@/components/pillar-parts";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/config/brand";
import { PROMPT_GROUPS } from "@/config/prompts";

export const metadata: Metadata = {
  title: "Recursos gratis para editar con Claude",
  description: "Prompts gratis para editar tus videos con Claude, por efecto: cortes, ganchos, subtítulos, zooms, B-roll, sonidos y más.",
};

export default function RecursosPage() {
  const total = PROMPT_GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <SiteHeader />
      <main className="pb-4">
        <PillarHero
          kicker={`Gratis · ${total} prompts`}
          title="Edita tus videos"
          highlight="con estos prompts"
          text="Un prompt por efecto. Cópialo, pégalo en Claude y ahorra tiempo en tu próximo video."
        />
        <nav aria-label="Grupos" className="mt-6 flex flex-wrap justify-center gap-2 px-4">
          {PROMPT_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="chip">
              {g.title}
            </a>
          ))}
        </nav>

        {PROMPT_GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16">
            <SectionTitle kicker={`${g.items.length} prompts`} title={g.title} text={g.text} />
            <div className="grid items-start gap-3 md:grid-cols-2">
              {g.items.map((p) => (
                <details key={p.slug} id={p.slug} className="card group scroll-mt-24 p-5">
                  <summary className="flex cursor-pointer list-none items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-soft text-xl">{p.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-ink">{p.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-mut">{p.text}</span>
                    </span>
                    <span className="mt-1 font-ui text-xs font-semibold whitespace-nowrap text-accent group-open:hidden">Ver prompt</span>
                  </summary>
                  <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-line bg-soft/60 p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink">
                    {p.prompt}
                  </pre>
                  <div className="mt-3 flex justify-end">
                    <CopyPrompt text={p.prompt} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className="mx-auto max-w-6xl px-4 pt-20">
          <SectionTitle kicker="Lo que viene" title="Más recursos en camino" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard emoji="🧠" title="Skills por efecto" text="Skills para Claude que aplican un efecto completo con una sola orden." />
            <ResourceCard emoji="📱" title="Guía: Claude + CapCut" text="Mi flujo para editar más rápido en CapCut con ayuda de Claude." />
            <ResourceCard emoji="🎚️" title="Guía: Claude + DaVinci o Premiere" text="El mismo flujo, en DaVinci Resolve o Premiere Pro." />
          </div>
          <p className="mt-6 text-sm text-mut">
            ¿Quieres editar todo esto con plantillas, sin copiar prompts?{" "}
            <Link href="/#lista" className="font-semibold text-accent">
              Únete a la lista de {BRAND.studioName}
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
