import Link from "next/link";
import { Faq } from "@/components/faq";
import { OldAnchors } from "@/components/old-anchors";
import { ResourceCard } from "@/components/pillar-parts";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { StudioWindow } from "@/components/studio-window";
import { WaitlistForm } from "@/components/waitlist-form";
import { BRAND } from "@/config/brand";

const STUDIO = BRAND.studioName;

// Cómo funciona: solo lo que el Studio ya promete (instalar, arrastrar, plantillas).
const STEPS = [
  { n: "01", title: "Instálalo en tu Claude", text: `Agregas ${STUDIO} a tu propio Claude una sola vez.` },
  { n: "02", title: "Arrastra tu video", text: "Sueltas tu video tal como lo grabaste con tu celular." },
  { n: "03", title: "Elige una plantilla", text: "Escoges el estilo y Claude hace la parte lenta de editar." },
  { n: "04", title: "Publica", text: "Lo subes a TikTok, Reels o Shorts y vuelves a crear." },
];

const FAQ = [
  {
    q: `¿Qué es ${STUDIO}?`,
    a: "Un studio que instalas en tu Claude: arrastras tus videos y los editas con plantillas, sin pasar horas en el editor.",
  },
  {
    q: "¿Cuándo sale?",
    a: "Lo estoy terminando. Quienes estén en la lista de espera se enteran primero, por correo.",
  },
  {
    q: "¿Necesito saber editar?",
    a: "No. La idea es que eliges una plantilla y Claude hace la parte técnica por ti.",
  },
  {
    q: "¿Cuánto va a costar?",
    a: "Lo anuncio primero a la lista de espera. Mientras tanto, los recursos de esta página son gratis.",
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
        {/* 1. Promesa + lista de espera */}
        <header className="mx-auto max-w-3xl px-4 pt-8 pb-10 text-center sm:pt-14">
          <p className="enter chip">Próximamente · Lista de espera abierta</p>
          <h1 className="enter enter-1 mt-4 text-[clamp(32px,4.8vw,58px)] leading-[1.04] font-bold tracking-[-0.04em] text-balance text-ink">
            Tu editor de video
            <span className="text-gradient block pb-[0.12em]">dentro de Claude</span>
          </h1>
          <p className="enter enter-2 mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-mut">
            Arrastras tu video, eliges una plantilla y Claude hace la parte lenta. Edita en minutos, no en horas.
          </p>
          <div className="enter enter-3 mt-7">
            <WaitlistForm id="lista" />
          </div>
          <p className="mt-4 text-sm text-mut">
            Hecho por un creador de contenido, para creadores ·{" "}
            <a href="#como-funciona" className="font-semibold text-accent">
              Ver cómo funciona
            </a>
          </p>
        </header>

        <StudioWindow />

        {/* 2. Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Cómo funciona" title="Un video entra. Sale listo para publicar." />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-5">
                <span className="font-ui text-sm font-semibold text-accent">{s.n}</span>
                <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Recursos gratis */}
        <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle
            kicker="Gratis"
            title="Recursos para editar con Claude, desde hoy"
            text={`No tienes que esperar a ${STUDIO} para ahorrar tiempo. Úsalos gratis.`}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard emoji="💬" title="Prompts por efecto" text="Cortes, ganchos, subtítulos animados, zooms y música con Claude Code, ffmpeg y Remotion." href="/recursos" cta="Ver los prompts" />
            <ResourceCard emoji="🧠" title="Skills por efecto" text="Skills para Claude que aplican un efecto completo con una sola orden." />
            <ResourceCard emoji="✍️" title="VidScript" text="Convierte un video que ya funcionó en tu próximo guion, con ganchos para probar." href="/guiones" cta="Conocer VidScript" />
          </div>
          <p className="mt-4 text-sm text-mut">
            Únete a la lista y marca la casilla de recursos para recibir los nuevos en tu correo.
          </p>
        </section>

        {/* 4. Quién lo hace */}
        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="card grid items-center gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 md:grid-cols-[auto_1fr]">
            <span className="brand-gradient grid size-24 place-items-center rounded-3xl text-4xl text-white shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
              🎬
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">Quién lo hace</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">Hecho por un creador, para creadores</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-mut">{BRAND.about}</p>
              <div className="mt-5">
                <SocialButtons />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Preguntas */}
        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Antes de empezar" center />
          <Faq items={FAQ} />
        </section>

        {/* 6. Cierre con lista de espera */}
        <section className="mx-auto max-w-6xl px-4 pt-24">
          <div className="relative overflow-hidden rounded-3xl bg-night px-6 py-16 text-center">
            <div aria-hidden className="absolute -top-24 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-accent-2/30 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
              Tu próximo video, editado en minutos
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-300">Tu video. Tu estilo. Claude hace el resto.</p>
            <div className="relative mt-8">
              <WaitlistForm id="lista-final" dark />
            </div>
            <p className="relative mt-6 text-sm text-slate-400">
              ¿Quieres guiones mientras tanto?{" "}
              <Link href="/guiones" className="font-semibold text-white">
                Mira VidScript
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
