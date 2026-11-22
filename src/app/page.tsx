import Link from "next/link";
import { Faq } from "@/components/faq";
import { OldAnchors } from "@/components/old-anchors";
import { ResourceCard } from "@/components/pillar-parts";
import { SectionTitle } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialButtons } from "@/components/socials";
import { StudioShowcase } from "@/components/studio-showcase";
import { WaitlistForm } from "@/components/waitlist-form";
import { BRAND } from "@/config/brand";
import { PLANTILLAS } from "@/config/plantillas";

const STUDIO = BRAND.studioName;

// Cómo funciona: solo lo que el Studio ya promete (instalar, arrastrar, plantillas).
const STEPS = [
  { n: "01", title: "Instálalo en tu Claude", text: `Agregas ${STUDIO} a tu propio Claude una sola vez.` },
  { n: "02", title: "Arrastra tu video", text: "Sueltas tu video tal como lo grabaste con tu celular." },
  { n: "03", title: "Elige una plantilla", text: "Escoges el estilo y Claude hace la parte lenta de editar." },
  { n: "04", title: "Publica", text: "Lo subes a TikTok, Reels o Shorts y vuelves a crear." },
];

// Las etapas que se ven en el Studio (barra de pasos del prototipo).
const STAGES = [
  { n: "1", title: "Estilo", text: "Eliges la plantilla que va con tu video." },
  { n: "2", title: "Corte", text: "Se arman las tomas y se quita lo que sobra." },
  { n: "3", title: "Gancho", text: "Los primeros segundos, pensados para que no deslicen." },
  { n: "4", title: "Look", text: "El diseño: pantalla completa, tarjeta o pantalla dividida." },
  { n: "5", title: "Visuales", text: "Subtítulos, gráficos, zooms, efectos y sonido." },
  { n: "6", title: "Revisión y exportar", text: "Lo revisas, dejas notas y exportas en 1080p." },
];

// Lo que se ve en el prototipo del Studio.
const FEATURES = [
  { emoji: "📝", title: "Notas de Claude", text: "Mira el video y presiona N donde quieras un cambio. Claude lo arregla antes de exportar." },
  { emoji: "🎨", title: "Mi marca", text: "Tu estilo guardado en un solo lugar, para que todos tus videos se vean tuyos." },
  { emoji: "🔁", title: "Editado vs. original", text: "Cambia entre tu video editado y el original para ver la diferencia." },
  { emoji: "⬇️", title: "Exporta en 1080p", text: "Tu video listo para subir a TikTok, Reels o Shorts." },
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

        <StudioShowcase />

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


        {/* 3. Cada paso, antes de exportar */}
        <section className="mx-auto max-w-6xl px-4 pt-24">
          <SectionTitle kicker={STUDIO} title="Ves cada paso antes de exportar" text="El Studio avanza por etapas y tú decides en cada una. Nada se exporta sin que lo revises." />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <li key={s.n} className="card flex items-start gap-4 p-5">
                <span className="brand-gradient grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">{s.n}</span>
                <div>
                  <h3 className="font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mut">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Plantillas */}
        <section id="plantillas" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Plantillas" title={`${PLANTILLAS.length} plantillas para Shorts`} text="Elige una y tu video sale con ese estilo. Tú pones la cara, la plantilla pone el resto." />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {PLANTILLAS.map((t) => (
              <article key={t.slug} className="card lift group flex flex-col overflow-hidden !rounded-[18px]">
                <div className="relative aspect-[9/16] overflow-hidden bg-[#0b1020]">
                  <video
                    src={`/plantillas-studio/${t.slug}.mp4`}
                    poster={`/plantillas-studio/${t.slug}.jpg`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`Vista animada de la plantilla ${t.title}`}
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <h3 className="font-semibold text-ink">{t.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-mut">{t.text}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {t.tags.map((tag) => (
                      <span key={tag} className="rounded-md border border-line px-2 py-0.5 font-ui text-[11px] text-mut">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
            <div className="card flex flex-col items-center justify-center gap-2 border-dashed !rounded-[18px] p-5 text-center">
              <span className="text-3xl">✨</span>
              <p className="font-semibold text-ink">Vienen más</p>
              <p className="text-[13px] text-mut">Los de la lista de espera las ven primero.</p>
            </div>
          </div>
        </section>

        {/* 5. Qué hace por ti */}
        <section className="mx-auto max-w-6xl px-4 pt-24">
          <SectionTitle kicker="No solo plantillas" title="Un editor completo dentro de Claude" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-soft text-xl">{f.emoji}</span>
                <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mut">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Recursos gratis */}
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

        {/* 7. Quién lo hace */}
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


        {/* 8. Abre pronto */}
        <section className="mx-auto max-w-4xl px-4 pt-24">
          <div className="glass rounded-3xl p-6 text-center sm:p-10">
            <p className="chip">Abre pronto</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-balance text-ink sm:text-4xl">Tu propio editor de video con IA</h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-mut">
              {STUDIO} todavía no está a la venta. Únete a la lista de espera para entrar primero y enterarte antes que nadie del lanzamiento.
            </p>
            <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left text-sm text-ink sm:grid-cols-2">
              {[`${PLANTILLAS.length} plantillas para Shorts`, "Edición por etapas, paso a paso", "Notas de Claude antes de exportar", "Exporta en 1080p"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-accent/15 text-[11px] text-accent">✓</span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <WaitlistForm id="lista-lanzamiento" />
            </div>
          </div>
        </section>

        {/* 9. Preguntas */}
        <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-24">
          <SectionTitle kicker="Preguntas" title="Antes de empezar" center />
          <Faq items={FAQ} />
        </section>

        {/* 10. Cierre con lista de espera */}
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
