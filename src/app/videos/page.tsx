import type { Metadata } from "next";
import Link from "next/link";
import { PillarHero, ResourceCard } from "@/components/pillar-parts";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: "Guías para editar con Claude",
  description: "Guías paso a paso para editar tus videos de TikTok, Reels y Shorts con Claude, junto a CapCut, DaVinci Resolve o Premiere.",
};

const VIDSCRIPT = [
  "Pega el link de un video que ya funcionó (o su transcripción).",
  "Recibe un guion corto y natural, con ganchos para probar.",
  "Divide un video largo en una serie de videos cortos.",
  "Ajusta el guion conversando en el chat.",
];

export default function VideosPage() {
  return (
    <>
      <SiteHeader />
      <main className="pb-4">
        <PillarHero
          kicker="Guías"
          title="Edita tus videos"
          highlight="con Claude"
          text="Para TikTok, Reels y Shorts. Mi flujo paso a paso, desde el guion hasta el video listo, con el editor que ya usas."
        />

        {/* Herramienta estrella */}
        <section className="mx-auto max-w-5xl px-4 pt-14">
          <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-night p-6 text-white sm:p-10 md:grid-cols-[1.1fr_1fr]">
            <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full bg-accent-2/30 blur-3xl" />
            <div className="relative">
              <p className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 font-ui text-[11px] text-slate-300">Herramienta estrella · Guiones</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">VidScript</h2>
              <p className="mt-2 max-w-md leading-relaxed text-slate-300">Convierte un video que ya funcionó en tu próximo guion, listo para grabar.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/guiones" className="press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-night">
                  Conocer VidScript <span className="arr">→</span>
                </Link>
              </div>
              <p className="mt-3 text-xs text-slate-400">Por ahora es de uso privado.</p>
            </div>
            <ul className="relative space-y-2.5">
              {VIDSCRIPT.map((t) => (
                <li key={t} className="flex items-start gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-slate-200">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-2" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="guias" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
          <SectionTitle kicker="Guías" title="Claude + tu editor favorito" text="Estoy preparando estas guías. Sígueme en redes para enterarte cuando salgan." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard emoji="📱" title="Claude + CapCut" text="Cómo usar Claude para editar más rápido en CapCut." />
            <ResourceCard emoji="🎚️" title="Claude + DaVinci Resolve" text="Cómo usar Claude para editar más rápido en DaVinci Resolve." />
            <ResourceCard emoji="🎞️" title="Claude + Premiere" text="Cómo usar Claude para editar más rápido en Premiere Pro." />
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
          <SectionTitle kicker="Recursos" title="Herramientas para tus videos" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard emoji="🎬" title={BRAND.studioName} text="Instálalo en tu Claude, arrastra tus videos y edita con plantillas." href="/studio" cta="Conocer el Studio" />
            <ResourceCard emoji="✍️" title="Guiones con VidScript" text="Ganchos, CTA y duración a tu elección, a partir de un video de referencia." href="/guiones" cta="Abrir VidScript" />
            <ResourceCard emoji="🧠" title="Skills para videos" text="Skills para Claude pensadas para creadores de contenido." />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
