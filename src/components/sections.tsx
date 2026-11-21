import Link from "next/link";
import { BRAND } from "@/config/brand";

// Bloques que se repiten en el inicio y en las páginas de cada pilar.

// Acceso al creador de micro apps (/crear), para quien no usa Claude.
export function CreatorBanner({ className = "pt-14" }: { className?: string }) {
  return (
    <section aria-labelledby="creator-banner" className={`mx-auto max-w-4xl px-4 ${className}`}>
      <Link
        href="/crear"
        className="lift press relative grid items-center gap-5 overflow-hidden rounded-3xl bg-night p-6 text-white sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-accent-2/30 blur-3xl" />
        <span className="relative grid size-16 place-items-center rounded-2xl bg-white/10 text-3xl">🛠️</span>
        <div className="relative">
          <p className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 font-ui text-[11px] text-slate-300">Nuevo · Gratis · Sin programar</p>
          <h2 id="creator-banner" className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Crea tu propia micro app web
          </h2>
          <p className="mt-2 max-w-xl leading-relaxed text-slate-300">
            Para organizar tu día o tu negocio. Elige qué hace y cómo se ve, y descárgala lista para publicar gratis. No necesitas Claude.
          </p>
        </div>
        <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-night">
          Crear mi app <span className="arr">→</span>
        </span>
      </Link>
    </section>
  );
}

// Acceso destacado a la skill propia "Crea tu primera app", justo debajo del dock.
export function SkillBanner({ className = "pt-14" }: { className?: string }) {
  return (
    <section aria-labelledby="skill-banner" className={`mx-auto max-w-4xl px-4 ${className}`}>
      <div className="card relative grid items-center gap-5 overflow-hidden rounded-3xl p-6 sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-accent-2/20 blur-3xl" />
        <span className="brand-gradient relative grid size-16 place-items-center rounded-2xl text-3xl shadow-[0_16px_32px_-12px_rgba(29,78,216,0.5)]">
          🚀
        </span>
        <div className="relative">
          <p className="chip">Skill gratis para Claude · Hecha por Juanfra Code</p>
          <h2 id="skill-banner" className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
            Crea tu primera app web con Claude
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-mut">
            Instálala en tu Claude y te hace preguntas paso a paso: tu idea, qué hace, cómo se ve. Luego la construye contigo para
            usarla ya o publicarla en Vercel.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="/descargas/skills/crea-tu-primera-app.zip" download className="btn">
              Descargar skill <span className="arr">↓</span>
            </a>
            <Link href="/skills#instalar" className="btn-ghost">
              Cómo instalarla
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionTitle({ kicker, title, text, center }: { kicker: string; title: string; text?: string; center?: boolean }) {
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

export function TutorialVideo() {
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

// Acceso a VidScript (/guiones): guiones para TikTok y Reels desde un video.
export function VidScriptBanner({ className = "pt-6" }: { className?: string }) {
  return (
    <section aria-labelledby="vidscript-banner" className={`mx-auto max-w-4xl px-4 ${className}`}>
      <Link
        href="/guiones"
        className="lift press card grid items-center gap-5 p-6 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:p-8"
      >
        <span className="brand-gradient grid size-16 place-items-center rounded-2xl text-3xl text-white">🎬</span>
        <div>
          <p className="chip">Nuevo · Para creadores</p>
          <h2 id="vidscript-banner" className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
            Convierte un video en tu próximo guion
          </h2>
          <p className="mt-2 max-w-xl leading-relaxed text-mut">
            Pega el link de un video que ya funcionó y recibe un guion listo para grabar en TikTok o Reels, con ganchos para probar.
          </p>
        </div>
        <span className="btn w-fit">
          Probar VidScript <span className="arr">→</span>
        </span>
      </Link>
    </section>
  );
}
