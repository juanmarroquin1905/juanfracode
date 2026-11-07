import { Catalog } from "@/components/catalog";
import { DemoBanner } from "@/components/demo-banner";
import { HowTo } from "@/components/how-to";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/config/brand";
import { getPublishedSaas, isDemo } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const items = await getPublishedSaas();
  const live = items.filter((s) => s.status === "en_vivo").length;
  const templates = items.filter((s) => s.repo_url || s.zip_url).length;
  const downloads = items.reduce((n, s) => n + s.downloads, 0);

  const stats = [
    { label: "SaaS creados", value: items.length },
    { label: "En vivo", value: live },
    { label: "Plantillas gratis", value: templates },
    { label: "Descargas", value: downloads },
  ];

  return (
    <>
      {isDemo && <DemoBanner />}
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
            <p className="font-mono text-sm text-accent">~/juanfra-code $ ls saas/</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              {BRAND.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">{BRAND.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#saas" className="btn">
                Ver los SaaS
              </a>
              <a href="#como-usar" className="btn-ghost">
                ¿Cómo uso una plantilla?
              </a>
            </div>
            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card px-5 py-4">
                  <dt className="text-xs text-slate-500">{s.label}</dt>
                  <dd className="mt-1 font-mono text-2xl font-medium text-white">{s.value.toLocaleString("es")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="saas" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-8">
          <h2 className="mb-5 text-2xl font-bold text-white">Todos los SaaS</h2>
          <Catalog items={items} />
        </section>

        <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20">
          <h2 className="text-2xl font-bold text-white">De plantilla a SaaS publicado en 4 pasos</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Todas las plantillas vienen listas para Vercel + Supabase. No necesitas instalar nada en tu computadora para
            lanzarla.
          </p>
          <div className="mt-6">
            <HowTo />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
