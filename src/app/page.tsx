import Link from "next/link";
import { Faq } from "@/components/faq";
import { OldAnchors } from "@/components/old-anchors";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { StudioWindow } from "@/components/studio-window";
import { BRAND } from "@/config/brand";

// Las 3 herramientas para editar videos con Claude. Sin href = todavía no está.
const TOOLS = [
  {
    href: "/studio",
    emoji: "🎞️",
    color: "#1d4ed8",
    kicker: "Para editar",
    title: BRAND.studioName,
    text: "Lo instalas en tu Claude, arrastras tus videos y los editas con plantillas.",
    status: "En construcción",
    cta: "Conocer el Studio",
  },
  {
    href: "/guiones",
    emoji: "✍️",
    color: "#7c3aed",
    kicker: "Para el guion",
    title: "VidScript",
    text: "Convierte un video que ya funcionó en tu próximo guion, con ganchos para probar.",
    status: "Uso privado por ahora",
    cta: "Conocer VidScript",
  },
  {
    href: "/videos",
    emoji: "🧭",
    color: "#0891b2",
    kicker: "Para aprender",
    title: "Guías",
    text: "Mi flujo paso a paso para editar con Claude junto a CapCut, DaVinci o Premiere.",
    status: "Próximamente",
    cta: "Ver guías",
  },
];

// El flujo completo, de la idea al video publicado.
const FLOW = [
  { n: "1", title: "Guion", text: "VidScript te arma el guion y los ganchos a partir de un video que ya funcionó." },
  { n: "2", title: "Grabas", text: "Grabas con tu celular, sin preocuparte por los cortes." },
  { n: "3", title: "Editas", text: `Arrastras tu video a ${BRAND.studioName}, dentro de Claude, y eliges una plantilla.` },
  { n: "4", title: "Publicas", text: "Subes a TikTok, Reels o Shorts y vuelves a crear." },
];

const HOME_FAQ = [
  {
    q: "¿Necesito saber editar?",
    a: "No. La idea es que Claude haga la parte lenta por ti. En mis videos te muestro cada paso, desde el guion hasta el video listo.",
  },
  {
    q: `¿Qué es ${BRAND.studioName}?`,
    a: "Un studio que instalas en tu Claude: arrastras tus videos y los editas con plantillas. Lo estoy terminando. Sígueme en redes para enterarte cuando salga.",
  },
  {
    q: "¿Qué es Claude?",
    a: "Es la inteligencia artificial de Anthropic. Le escribes en español lo que quieres y te ayuda con tus guiones y tus videos.",
  },
  {
    q: "¿Para qué redes sirve?",
    a: "Para videos cortos verticales de TikTok, Instagram Reels y YouTube Shorts.",
  },
];

export default function Home() {
  return (
    <>
      <OldAnchors />
      <SiteHeader />
      <main id="top" className="scroll-mt-24">
        <header className="mx-auto max-w-3xl px-4 pt-8 pb-8 text-center sm:pt-14 sm:pb-10">
          <p className="enter chip">Para creadores de contenido · En español</p>
          <h1 className="enter enter-1 mt-4 text-[clamp(32px,4.8vw,58px)] leading-[1.04] font-bold tracking-[-0.04em] text-balance text-ink">
            Edita tus videos en minutos,
            <span className="text-gradient block pb-[0.12em]">no en horas</span>
          </h1>
          <p className="enter enter-2 mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-mut">
            Deja que Claude haga la parte lenta de editar. Tú grabas, eliges una plantilla y publicas.
          </p>
          <div className="enter enter-3 mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href="/studio" className="btn">
              Conocer {BRAND.studioName} <span className="arr">→</span>
            </Link>
            <Link href="/guiones" className="btn-ghost">
              Probar VidScript
            </Link>
          </div>
        </header>

        <StudioWindow />

        <section aria-labelledby="herramientas" className="mx-auto max-w-6xl px-4 pt-20">
          <SectionTitle kicker="Herramientas" title="Todo para editar con Claude" text="Del guion al video listo, con las herramientas que uso en mis propios videos." />
          <div className="grid gap-4 md:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="glass lift press group flex flex-col overflow-hidden rounded-[22px] p-6">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-12 place-items-center rounded-2xl text-2xl transition-transform duration-200 ease-(--ease-out) group-hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${t.color}40, ${t.color}14)` }}
                  >
                    {t.emoji}
                  </span>
                  <span className="chip">{t.status}</span>
                </div>
                <p className="mt-4 font-ui text-[11px] text-mut">{t.kicker}</p>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mut">{t.text}</p>
                <p className="mt-auto pt-6 text-sm font-semibold text-accent">
                  {t.cta} <span className="arr">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="flujo" className="mx-auto max-w-6xl px-4 pt-24">
          <SectionTitle kicker="Mi flujo" title="De la idea al video publicado" text="Así ahorro horas en cada video. Cada paso tiene su herramienta." />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((s) => (
              <li key={s.n} className="card p-5">
                <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{s.n}</span>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="card grid items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="brand-gradient grid size-24 place-items-center rounded-3xl text-4xl text-white shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
              🎬
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">Juanfra Code</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">Edita conmigo</h2>
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
              Menos horas editando, más videos publicados
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">{BRAND.studioName} está en camino. Sígueme para enterarte primero.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-2.5">
              {BRAND.socials.tiktok && (
                <a
                  href={BRAND.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="press inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-semibold text-ink transition-transform duration-150"
                >
                  Seguirme en TikTok
                </a>
              )}
              <Link
                href="/studio"
                className="press inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-transform duration-150"
              >
                Conocer {BRAND.studioName}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
