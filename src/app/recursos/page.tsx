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
  description: "Herramientas y prompts gratis para editar tus videos con Claude Code, ffmpeg y Remotion, por efecto: cortes, ganchos, subtítulos animados, zooms, música y más.",
};

const HERRAMIENTAS_PASOS = [
  { title: "Descomprime el zip", text: "Donde quieras. Te queda la carpeta EDITOR-VIDEO." },
  { title: "Ábrela en Claude", text: "En la app de Claude (claude.ai/download), pestaña Code, abre la carpeta EDITOR-VIDEO." },
  { title: "Escribe: instala el editor", text: "Claude instala lo que falte y te avisa cuando todo está listo." },
];

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
          text="Sin editores de video: solo Claude Code, ffmpeg y Remotion. Un prompt por efecto. Cópialo, pégalo en Claude Code y listo."
        />

        <section id="herramientas" aria-labelledby="herramientas-titulo" className="mx-auto max-w-4xl scroll-mt-24 px-4 pt-10">
          <div className="card relative overflow-hidden rounded-3xl p-6 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-accent-2/20 blur-3xl" />
            <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-6">
              <span className="brand-gradient grid size-16 place-items-center rounded-2xl text-3xl shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
                🧰
              </span>
              <div>
                <p className="chip">Herramientas gratis · Windows y Mac</p>
                <h2 id="herramientas-titulo" className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                  Instala todo para editar con Claude
                </h2>
                <p className="mt-2 max-w-2xl leading-relaxed text-mut">
                  Una carpeta lista para abrir en Claude. Le escribes <b className="text-ink">instala el editor</b> y Claude revisa tu
                  computadora, te pide permiso e instala lo que falte: Node.js, ffmpeg y Remotion. Es una sola vez.
                </p>
              </div>
            </div>
            <ol className="relative mt-6 grid gap-3 sm:grid-cols-3">
              {HERRAMIENTAS_PASOS.map((paso, i) => (
                <li key={paso.title} className="rounded-2xl border border-line bg-soft/50 p-4">
                  <span className="brand-gradient grid size-7 place-items-center rounded-full text-xs font-semibold text-white">{i + 1}</span>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{paso.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mut">{paso.text}</p>
                </li>
              ))}
            </ol>
            <div className="relative mt-6 flex flex-wrap items-center gap-3">
              <a href="/herramientas/editor-video.zip" download="EDITOR-VIDEO.zip" className="btn">
                Descargar herramientas <span className="arr">↓</span>
              </a>
              <span className="text-sm text-mut">Zip gratis · trae las reglas de edición y scripts de ayuda</span>
            </div>
          </div>
        </section>

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
