import type { Metadata } from "next";
import { PillarHero, ResourceCard, Steps } from "@/components/pillar-parts";
import { Projects } from "@/components/projects";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Webs con Claude",
  description: "Cómo crear tu página web con Claude y publicarla gratis con GitHub y Vercel, aunque nunca hayas programado.",
};

const STEPS = [
  {
    title: "Cuéntale tu idea a Claude",
    text: "Para qué es la web, qué secciones lleva (inicio, servicios, contacto) y qué estilo te gusta. Mientras más detalle, mejor.",
  },
  {
    title: "Mírala al instante",
    text: "En claude.ai Claude te la muestra como artefacto y la cambias conversando. Con Claude Code la arma como proyecto en tu compu.",
  },
  {
    title: "Súbela a GitHub",
    text: "Ahí queda guardado el código de tu web. Es gratis y desde ahí la publicas.",
  },
  {
    title: "Publícala en Vercel",
    text: "Conectas tu repositorio y en un minuto tienes tu enlace. Cada cambio que subas a GitHub se publica solo.",
  },
];

export default function WebsPage() {
  return (
    <>
      <SiteHeader />
      <main className="pb-4">
        <PillarHero
          kicker="Pilar 2 · Webs con Claude"
          title="Crea tu página web"
          highlight="con Claude"
          text="Para tu negocio, tu portafolio o tu proyecto. Le describes lo que quieres, Claude escribe el código y tú la publicas gratis con GitHub y Vercel."
        />

        <section id="como" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16">
          <SectionTitle kicker="Cómo se hace" title="De la idea a tu web publicada" text="El mismo camino que uso para mis proyectos." />
          <Steps steps={STEPS} />
        </section>

        <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
          <SectionTitle kicker="Recursos" title="Para empezar hoy" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              emoji="🚀"
              title="Skill “Crea tu primera app”"
              text="Te hace preguntas paso a paso y arma el proyecto con Next.js, listo para publicar en Vercel. Sirve también para una web."
              href="/skills#crea-tu-primera-app"
              cta="Ver la skill"
            />
            <ResourceCard emoji="📘" title="Guía paso a paso" text="Tu primera web con Claude, de cero a publicada, con capturas de cada paso." />
            <ResourceCard emoji="🎨" title="Plantillas de webs" text="Webs base para distintos tipos de negocio, listas para cambiar con Claude." />
          </div>
        </section>

        <section id="ejemplos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
          <SectionTitle kicker="Ejemplos" title="Webs que hice con Claude" text="Productos reales construidos con Next.js, Supabase, Vercel y Claude Code." />
          <Projects />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
