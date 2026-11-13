import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "VidScript",
  description: "Pega el link de un video que ya funcionó y recibe un guion listo para grabar en TikTok o Reels, con ganchos para probar.",
};

const PASOS = [
  { n: "1", t: "Pega el link", d: "De YouTube, TikTok o Instagram. O pega la transcripción si ya la tienes." },
  { n: "2", t: "Elige el estilo", d: "Tipo de gancho, cierre (CTA), duración y tono." },
  { n: "3", t: "Graba y ajusta", d: "Recibe el guion, 3 ganchos para probar y pídele cambios en el chat." },
];

function Ventana() {
  return (
    <div className="zoom glass mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl text-left">
      <div className="flex items-center gap-1.5 border-b border-line bg-soft/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="mx-auto rounded-md bg-card px-10 py-0.5 font-ui text-[11px] text-mut">juanfracode.com/guiones</span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[5fr_6fr] sm:p-5">
        <div>
          <div className="brand-gradient grid aspect-video place-items-center rounded-xl text-white">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/25 text-xl backdrop-blur">▶</span>
          </div>
          <p className="mt-3 text-sm font-bold text-ink">6 formas de ganar dinero con Claude</p>
          <p className="text-xs text-mut">12 min · transcripción lista</p>
          <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-mut">
            <p><span className="font-semibold text-accent">0:00</span> Si ya pagas Claude, aquí van seis maneras de que se pague solo…</p>
            <p><span className="font-semibold text-accent">0:42</span> La primera es crear webs para negocios locales…</p>
            <p><span className="font-semibold text-accent">2:10</span> La segunda: editar videos con subtítulos automáticos…</p>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-line bg-card/70 p-4">
          <p className="text-[11px] font-bold tracking-wider text-accent uppercase">Ganchos para probar</p>
          <p className="rounded-r-lg border-l-4 border-accent bg-accent/8 px-3 py-2 text-sm text-ink">“Claude me cuesta 20 dólares al mes. Así hago que se pague solo.”</p>
          <p className="rounded-r-lg border-l-4 border-accent-2 bg-accent-2/10 px-3 py-2 text-sm text-ink">“Si usas Claude solo para preguntas, estás dejando plata en la mesa.”</p>
          <p className="text-[11px] font-bold tracking-wider text-accent uppercase">Guion · ~52 s</p>
          <p className="text-sm leading-relaxed text-mut">Uno: webs para negocios. Le describes el negocio a Claude y en una tarde la tienes publicada…</p>
          <div className="flex gap-1.5 pt-1">
            <span className="chip">Otros 3 ganchos</span>
            <span className="chip">Más corto</span>
            <span className="chip">Más enérgico</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuionesLanding() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center">
        <p className="enter chip">Para creadores · TikTok · Reels · Shorts</p>
        <h1 className="enter enter-1 mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-6xl">
          Convierte cualquier video
          <br />
          <span className="text-gradient">en tu próximo guion</span>
        </h1>
        <p className="enter enter-2 mx-auto mt-5 max-w-xl text-base text-pretty text-mut sm:text-lg">
          Pega el link de un video que ya funcionó y recibe un guion corto, natural y listo para grabar, con ganchos pensados para que la gente se quede.
        </p>

        <form action="/guiones/app" className="enter enter-3 mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-5 shadow-[0_10px_40px_-14px_rgba(30,64,175,0.25)] focus-within:ring-4 focus-within:ring-accent/15">
          <input
            name="url"
            type="url"
            required
            placeholder="Pega aquí el link de YouTube, TikTok o Instagram…"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-slate-400"
          />
          <button className="btn !h-11 !w-11 shrink-0 !p-0" aria-label="Crear guion">
            ↑
          </button>
        </form>
        <p className="mt-3 text-sm text-mut">
          ¿Ya tienes la transcripción?{" "}
          <Link href="/guiones/app?modo=texto" className="font-semibold text-accent hover:underline">
            Pégala directo
          </Link>
        </p>
        <p className="mt-6 font-ui text-xs text-mut">Transcripción automática · Ganchos A/B · CTA a tu elección · Historial de tus videos</p>

        <Ventana />

        <section className="mx-auto mt-20 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="card lift p-5">
              <span className="brand-gradient grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white">{p.n}</span>
              <h3 className="mt-3 font-bold text-ink">{p.t}</h3>
              <p className="mt-1 text-sm text-mut">{p.d}</p>
            </div>
          ))}
        </section>

        <div className="mt-12">
          <Link href="/guiones/app" className="btn">
            Entrar a VidScript <span className="arr">→</span>
          </Link>
          <p className="mt-3 text-xs text-mut">Por ahora es de uso privado.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
