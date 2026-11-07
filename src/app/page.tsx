import { Catalog } from "@/components/catalog";
import { Faq } from "@/components/faq";
import { Hero3D } from "@/components/hero-3d";
import { HowTo } from "@/components/how-to";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { BRAND } from "@/config/brand";
import { getPublishedSaas } from "@/lib/data";

export const revalidate = 60;

const STACK = ["Next.js", "Supabase", "Vercel", "GitHub", "Claude Code"];

export default async function Home() {
  const items = await getPublishedSaas();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0" />
          <div aria-hidden className="floor-grid" />
          <div aria-hidden className="absolute -top-48 right-[-10%] size-[560px] rounded-full bg-accent/15 blur-3xl" />
          <div aria-hidden className="absolute top-20 right-[25%] size-[360px] rounded-full bg-accent-2/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <span className="brand-gradient size-1.5 rounded-full" />
                Plantillas gratis · listas para Vercel + Supabase
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-[-0.045em] text-balance text-ink sm:text-7xl">
                <HighlightTitle />
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">{BRAND.tagline}</p>
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
                  <span key={s} className="font-medium text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto -mt-4 w-full max-w-[260px] sm:max-w-[340px] lg:mt-0 lg:max-w-none">
              <Hero3D />
            </div>
          </div>

        </section>

        <section id="saas" className="reveal mx-auto max-w-6xl scroll-mt-20 px-4 pt-14">
          <SectionTitle kicker="Catálogo" title="Todas las apps" text="Pruébalas en vivo. Si te sirve una, lánzala como tuya." />
          <Catalog items={items} />
        </section>

        <section id="como-usar" className="reveal mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
          <SectionTitle
            kicker="Cómo funciona"
            title="De plantilla a tu propia app en 4 pasos"
            text="Todas vienen listas para Vercel + Supabase. No necesitas instalar nada en tu computadora."
          />
          <HowTo />
          <TutorialVideo />
        </section>

        <section className="reveal mx-auto max-w-6xl px-4 pt-24">
          <div className="card grid items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="brand-gradient grid size-24 place-items-center rounded-3xl font-mono text-3xl font-bold text-white shadow-[0_16px_32px_-12px_rgba(109,74,255,0.6)]">
              {"</>"}
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">Juanfra Code</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">Aprende a crearlas conmigo</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">{BRAND.about}</p>
              <div className="mt-5">
                <SocialButtons />
              </div>
            </div>
          </div>
        </section>

        <section id="preguntas" className="reveal mx-auto max-w-3xl scroll-mt-20 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Preguntas frecuentes" center />
          <Faq />
        </section>

        <section className="reveal mx-auto max-w-6xl px-4 pt-24">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center">
            <div aria-hidden className="absolute -top-24 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
              Tu próxima app está a un clic
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">
              Elige una plantilla, lánzala gratis y cámbiala a tu gusto con Claude Code.
            </p>
            <a href="#saas" className="relative mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100">
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
      <p className="text-sm font-semibold text-accent">{kicker}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h2>
      {text && <p className={`mt-2 max-w-2xl text-slate-500 ${center ? "mx-auto" : ""}`}>{text}</p>}
    </div>
  );
}

function HighlightTitle() {
  const { title, titleHighlight } = BRAND;
  const i = titleHighlight ? title.indexOf(titleHighlight) : -1;
  if (i < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <span className="accent-serif text-gradient">{titleHighlight}</span>
      {title.slice(i + titleHighlight.length)}
    </>
  );
}

// Convierte un enlace de YouTube (watch, youtu.be o shorts) en uno para incrustar.
function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

function TutorialVideo() {
  const src = BRAND.tutorialUrl ? youtubeEmbed(BRAND.tutorialUrl) : null;
  if (!src) return null;
  return (
    <div className="card mt-6 overflow-hidden p-2">
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <iframe
          src={src}
          title="Tutorial: cómo lanzar una plantilla"
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
