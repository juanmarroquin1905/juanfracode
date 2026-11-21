import Link from "next/link";
import { Faq } from "@/components/faq";
import { OldAnchors } from "@/components/old-anchors";
import { Projects } from "@/components/projects";
import { CreatorBanner, SectionTitle, SkillBanner, VidScriptBanner } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { BRAND } from "@/config/brand";
import { SKILLS } from "@/config/skills";

// Los 3 pilares de Juanfra Code. Cada uno lleva a su página.
const PILLARS = [
  {
    href: "/micro-apps",
    emoji: "🧩",
    color: "#1d4ed8",
    kicker: "Pilar 1",
    title: "Micro apps web",
    text: "Apps pequeñas para organizar tu día o tu negocio, creadas sin programar o con Claude.",
    items: ["Creador de micro apps, sin programar", "Skill “Crea tu primera app”", "Ejemplos para probar y descargar"],
    cta: "Crear una micro app",
  },
  {
    href: "/webs",
    emoji: "🌐",
    color: "#0891b2",
    kicker: "Pilar 2",
    title: "Webs con Claude",
    text: "Tu página web hecha con Claude y publicada gratis con GitHub y Vercel.",
    items: ["De la idea a tu web publicada", "Ejemplos de webs reales", "Guías y plantillas (pronto)"],
    cta: "Crear mi web",
  },
  {
    href: "/videos",
    emoji: "🎬",
    color: "#7c3aed",
    kicker: "Pilar 3",
    title: "Videos con Claude",
    text: "Guiones que enganchan y, muy pronto, edición de tus videos con Claude.",
    items: ["VidScript: guiones desde un video", "Series de videos cortos", "Edición con Claude (pronto)"],
    cta: "Ver herramientas",
  },
];

const HOME_FAQ = [
  {
    q: "¿Necesito saber programar?",
    a: "No. Puedes empezar con el creador de micro apps, que es sin programar, o pedirle a Claude que escriba el código por ti. En mis videos te muestro cada paso.",
  },
  {
    q: "¿Qué es una micro app web?",
    a: "Una app pequeña que se abre en el navegador, del celular o la compu, para una tarea concreta: tus gastos, tu rutina, tus clientes. No se instala desde una tienda de apps.",
  },
  {
    q: "¿Qué es Claude?",
    a: "Es la inteligencia artificial de Anthropic. Le escribes en español lo que quieres y te ayuda a crear el código, los textos o los guiones de tus videos.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "El creador, los ejemplos y las skills de esta web son gratis. Para publicar, GitHub, Vercel y Supabase tienen planes gratis que alcanzan para empezar.",
  },
];

export default function Home() {
  return (
    <>
      <OldAnchors />
      <SiteHeader />
      <main id="top" className="scroll-mt-24">
        <header className="mx-auto max-w-3xl px-4 pt-8 pb-8 text-center sm:pt-14 sm:pb-10">
          <p className="enter chip">Crea con Claude · Gratis · En español</p>
          <h1 className="enter enter-1 mt-4 text-[clamp(32px,4.8vw,58px)] leading-[1.04] font-bold tracking-[-0.04em] text-balance text-ink">
            Crea apps, webs y videos
            <span className="text-gradient block pb-[0.12em]">con Claude</span>
          </h1>
          <p className="enter enter-2 mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-mut">
            Aunque nunca hayas programado. Te enseño paso a paso a crear micro apps web, páginas web y videos. Elige por dónde empezar.
          </p>
        </header>

        {/* Los 3 pilares, como ventanas de escritorio */}
        <section aria-label="Qué puedes crear" className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={`glass lift press group enter enter-${i + 1} flex flex-col overflow-hidden rounded-[22px]`}
            >
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-line" />
                <span className="size-2.5 rounded-full bg-line" />
                <span className="size-2.5 rounded-full bg-line" />
                <span className="ml-auto font-ui text-[11px] text-mut">juanfracode{p.href}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-12 place-items-center rounded-2xl text-2xl transition-transform duration-200 ease-(--ease-out) group-hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${p.color}40, ${p.color}14)` }}
                  >
                    {p.emoji}
                  </span>
                  <div>
                    <p className="font-ui text-[11px] text-mut">{p.kicker}</p>
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">{p.title}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-mut">{p.text}</p>
                <ul className="mt-4 space-y-2 font-ui text-sm text-ink">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
                      {it}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-6 text-sm font-semibold text-accent">
                  {p.cta} <span className="arr">→</span>
                </p>
              </div>
            </Link>
          ))}
        </section>
        <p className="mt-5 text-center font-ui text-xs text-mut">Hecho con Claude · Next.js · Supabase · Vercel · GitHub</p>

        <section aria-labelledby="empieza" className="pt-20">
          <div className="mx-auto max-w-4xl px-4">
            <SectionTitle kicker="Empieza por aquí" title="Herramientas gratis para crear hoy" />
          </div>
          <CreatorBanner className="pt-0" />
          <VidScriptBanner />
          <SkillBanner className="pt-6" />
        </section>

        <section id="proyectos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Mis proyectos" title="Lo que he lanzado con Claude" text="Productos reales que construí con este mismo stack." />
          <Projects />
        </section>

        <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle
            kicker="Skills para Claude"
            title="Tareas del día a día, en un clic"
            text="Mi skill para crear tu primera app web y skills populares de GitHub que le enseñan a Claude a ordenar archivos, adaptar tu CV y más."
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

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="card grid items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="brand-gradient grid size-24 place-items-center rounded-3xl font-mono text-3xl font-bold text-white shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
              {"</>"}
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">Juanfra Code</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">Aprende a crear conmigo</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-mut">{BRAND.about}</p>
              <div className="mt-5">
                <SocialButtons />
              </div>
            </div>
          </div>
        </section>

        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Preguntas frecuentes" center />
          <Faq items={HOME_FAQ} />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="relative overflow-hidden rounded-3xl bg-night px-6 py-16 text-center">
            <div aria-hidden className="absolute -top-24 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-accent-2/30 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
              ¿Qué quieres crear hoy?
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">Elige un camino y empieza gratis.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-2.5">
              {PILLARS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="press inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-semibold text-ink transition-transform duration-150"
                >
                  {p.emoji} {p.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
