import { AppPreview } from "@/components/app-preview";
import { Catalog } from "@/components/catalog";
import { DemoBanner } from "@/components/demo-banner";
import { Faq } from "@/components/faq";
import { HowTo } from "@/components/how-to";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { BRAND } from "@/config/brand";
import { getPublishedSaas, isDemo } from "@/lib/data";

export const revalidate = 60;

const STACK = ["Next.js", "Supabase", "Vercel", "GitHub", "Claude Code"];

export default async function Home() {
  const items = await getPublishedSaas();
  const live = items.filter((s) => s.status === "en_vivo").length;
  const templates = items.filter((s) => s.repo_url || s.zip_url).length;
  const downloads = items.reduce((n, s) => n + s.downloads, 0);
  const showcase = items.slice(0, 3);

  const stats = [
    { label: "Apps creadas", value: items.length },
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
          <div aria-hidden className="absolute -top-40 right-0 size-[520px] rounded-full bg-accent/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="font-mono text-sm text-accent">~/juanfra-code $ ls apps/</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-white sm:text-6xl">
                {BRAND.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">{BRAND.tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#saas" className="btn">
                  Ver las apps
                </a>
                <a href="#como-usar" className="btn-ghost">
                  ¿Cómo uso una plantilla?
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>Hechas con</span>
                {STACK.map((s) => (
                  <span key={s} className="font-mono text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {showcase.length > 0 && (
              <div aria-hidden className="relative hidden h-[380px] lg:block">
                {showcase.map((s, i) => (
                  <AppPreview
                    key={s.id}
                    saas={s}
                    className={`absolute w-[78%] ${
                      ["top-0 right-0 rotate-3", "top-[22%] left-0 -rotate-2", "top-[44%] right-[6%] rotate-1"][i]
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card px-5 py-4">
                  <dt className="text-xs text-slate-500">{s.label}</dt>
                  <dd className="mt-1 font-mono text-2xl font-medium text-white">{s.value.toLocaleString("es")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="saas" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14">
          <SectionTitle kicker="catálogo" title="Todas las apps" text="Pruébalas en vivo. Si te sirve una, lánzala como tuya." />
          <Catalog items={items} />
        </section>

        <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
          <SectionTitle
            kicker="cómo usarlas"
            title="De plantilla a tu propia app en 4 pasos"
            text="Todas vienen listas para Vercel + Supabase. No necesitas instalar nada en tu computadora."
          />
          <HowTo />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-card p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="grid size-24 place-items-center rounded-3xl bg-accent font-mono text-3xl font-bold text-ink">
              {"</>"}
            </span>
            <div>
              <p className="font-mono text-xs text-accent">quién soy</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Aprende a crearlas conmigo</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-400">{BRAND.about}</p>
              <div className="mt-5">
                <SocialButtons />
              </div>
            </div>
          </div>
        </section>

        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-24">
          <SectionTitle kicker="preguntas" title="Preguntas frecuentes" center />
          <Faq />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent/10 px-6 py-12 text-center">
            <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-balance text-white">
              Tu próxima app está a un clic
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">
              Elige una plantilla, lánzala gratis y cámbiala a tu gusto con Claude Code.
            </p>
            <a href="#saas" className="btn relative mt-6">
              Elegir una app
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionTitle({ kicker, title, text, center }: { kicker: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={`mb-6 ${center ? "text-center" : ""}`}>
      <p className="font-mono text-xs text-accent">{kicker}</p>
      <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {text && <p className={`mt-2 max-w-2xl text-slate-400 ${center ? "mx-auto" : ""}`}>{text}</p>}
    </div>
  );
}
