import type { Metadata } from "next";
import { AppDock } from "@/components/app-dock";
import { Catalog } from "@/components/catalog";
import { Faq } from "@/components/faq";
import { HowTo } from "@/components/how-to";
import { CreatorBanner, SectionTitle, SkillBanner, TutorialVideo } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedSaas } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Micro apps web",
  description:
    "Crea tu propia micro app web sin programar o con Claude, y prueba ejemplos listos para descargar y publicar en Vercel con Supabase.",
};

export default async function MicroAppsPage() {
  const items = await getPublishedSaas();

  return (
    <>
      <SiteHeader />
      <main className="pb-4">
        <div className="enter mx-auto max-w-3xl px-4 pt-14 text-center">
          <p className="chip">Pilar 1 · Micro apps web</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-5xl">
            Crea tu propia <span className="text-gradient">micro app web</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-mut">
            Pequeñas apps para organizar tu día o tu negocio. Hay dos caminos: armarla aquí sin programar, o crearla con Claude
            paso a paso. Abajo tienes ejemplos para probar y descargar.
          </p>
        </div>

        <CreatorBanner className="pt-10" />
        <SkillBanner className="pt-6" />

        {items.length > 0 && (
          <section id="ejemplos" className="scroll-mt-24 pt-20">
            <div className="mx-auto max-w-6xl px-4 text-center">
              <p className="chip">Ejemplos</p>
            </div>
            <AppDock
              heading="h2"
              apps={items.slice(0, 8).map((s) => ({
                id: s.id,
                slug: s.slug,
                name: s.name,
                tagline: s.tagline,
                category: s.category,
                emoji: s.emoji,
                color: s.color,
                cover_url: s.cover_url,
                demo_url: s.demo_url,
                features: s.features,
                repo_url: s.repo_url,
                zip_url: s.zip_url,
              }))}
            />
            <div id="saas" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
              <SectionTitle kicker="Todos los ejemplos" title="Ábrelos y llévate el código" text="Juega con los datos de ejemplo y descárgalos si te sirven. Licencia MIT." />
              <Catalog items={items} />
            </div>
          </section>
        )}

        <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle
            kicker="Cómo se publica"
            title="Del ejemplo a tu propia app"
            text="Todos los ejemplos vienen listos para Vercel + Supabase. No necesitas instalar nada en tu computadora."
          />
          <HowTo />
          <TutorialVideo />
        </section>

        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Preguntas sobre los ejemplos" center />
          <Faq />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
