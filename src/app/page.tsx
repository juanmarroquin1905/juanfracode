import { AppDock } from "@/components/app-dock";
import { Catalog } from "@/components/catalog";
import { Faq } from "@/components/faq";
import { HowTo } from "@/components/how-to";
import { Projects } from "@/components/projects";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { BRAND } from "@/config/brand";
import { SKILLS } from "@/config/skills";
import Link from "next/link";
import { getPublishedSaas } from "@/lib/data";

export const revalidate = 60;

const STACK = ["Next.js", "Supabase", "Vercel", "GitHub", "Claude Code"];

export default async function Home() {
  const items = await getPublishedSaas();

  return (
    <>
      <SiteHeader />
      <main id="top" className="scroll-mt-24">
        <AppDock
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
        <p className="mt-4 text-center font-ui text-xs text-mut">
          Hechas con {STACK.join(" · ")}
        </p>

        {items.length > 0 && (
          <section id="saas" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
            <SectionTitle kicker="Catálogo" title="Todas las apps" text="Ábrelas, juega con los datos de ejemplo y descárgalas si te sirven." />
            <Catalog items={items} />
          </section>
        )}

        <section id="proyectos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Mis proyectos" title="Lo que he lanzado" text="Productos reales que construí con este mismo stack." />
          <Projects />
        </section>

        <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle
            kicker="Skills para Claude"
            title="Tareas del día a día, en un clic"
            text="Skills populares de GitHub que le enseñan a Claude a ordenar archivos, elegir ganadores de sorteos, adaptar tu CV y más."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SKILLS.map((s) => (
              <Link key={s.slug} href={`/skills#${s.slug}`} className="card lift press flex items-center gap-3 p-4">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm font-semibold leading-snug text-ink">{s.title}</span>
              </Link>
            ))}
          </div>
          <Link href="/skills" className="btn mt-6">
            Ver todas las skills <span className="arr">→</span>
          </Link>
        </section>

        <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle
            kicker="Cómo funciona"
            title="De la vitrina a tu propia app"
            text="Todas vienen listas para Vercel + Supabase. No necesitas instalar nada en tu computadora."
          />
          <HowTo />
          <TutorialVideo />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="card grid items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="brand-gradient grid size-24 place-items-center rounded-3xl font-mono text-3xl font-bold text-white shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
              {"</>"}
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">Juanfra Code</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">Aprende a crearlas conmigo</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-mut">{BRAND.about}</p>
              <div className="mt-5">
                <SocialButtons />
              </div>
            </div>
          </div>
        </section>

        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Preguntas frecuentes" center />
          <Faq />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="relative overflow-hidden rounded-3xl bg-night px-6 py-16 text-center">
            <div aria-hidden className="absolute -top-24 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-accent-2/30 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
              Tu próxima app está a un clic
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">
              Elige una plantilla, lánzala gratis y cámbiala a tu gusto con Claude Code.
            </p>
            <a href="#top" className="press relative mt-8 inline-flex rounded-full bg-card px-6 py-3 text-sm font-semibold text-ink transition-transform duration-150">
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
      <p className="chip">{kicker}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h2>
      {text && <p className={`mt-2 max-w-2xl text-mut ${center ? "mx-auto" : ""}`}>{text}</p>}
    </div>
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
