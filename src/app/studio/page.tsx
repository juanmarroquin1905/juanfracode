import type { Metadata } from "next";
import Link from "next/link";
import { PillarHero } from "@/components/pillar-parts";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudioWindow } from "@/components/studio-window";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: BRAND.studioName,
  description: `${BRAND.studioName}: un studio que instalas en tu Claude para editar tus videos con plantillas. Próximamente.`,
};

// Lo que Juan ya contó del Studio. Cuando esté listo, se completa con lo real.
const IDEA = [
  { n: "1", title: "Instálalo en tu Claude", text: "Lo agregas a tu propio Claude." },
  { n: "2", title: "Arrastra tus videos", text: "Sueltas tus videos tal como los grabaste." },
  { n: "3", title: "Edita con plantillas", text: "Eliges una plantilla y Claude hace la parte lenta." },
];

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <main className="pb-4">
        <PillarHero
          kicker="Próximamente"
          title={BRAND.studioName}
          highlight="para tu Claude"
          text="Un studio que instalas en tu Claude: arrastras tus videos y los editas con plantillas. Lo estoy terminando."
        />

        <div className="pt-10">
          <StudioWindow showLink={false} />
        </div>

        <section className="mx-auto max-w-5xl px-4 pt-20">
          <SectionTitle kicker="La idea" title="Así va a funcionar" />
          <ol className="grid gap-3 sm:grid-cols-3">
            {IDEA.map((s) => (
              <li key={s.n} className="card p-5">
                <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{s.n}</span>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-4 pt-20">
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-ink">¿Quieres probarlo primero?</h2>
              <p className="mt-1 text-sm leading-relaxed text-mut">Aviso en mis redes cuando salga, con el paso a paso para instalarlo.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BRAND.socials.tiktok && (
                <a href={BRAND.socials.tiktok} target="_blank" rel="noreferrer" className="btn">
                  Seguirme en TikTok
                </a>
              )}
              <Link href="/guiones" className="btn-ghost">
                Mientras tanto, VidScript
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
