import Link from "next/link";
import { BRAND } from "@/config/brand";

// Ventana de escritorio que presenta el Studio. Es solo una presentación:
// no muestra funciones concretas hasta que el Studio esté listo.
export function StudioWindow({ showLink = false }: { showLink?: boolean }) {
  return (
    <section aria-label={BRAND.studioName} className="enter enter-3 mx-auto max-w-5xl px-4">
      <div className="glass overflow-hidden rounded-[22px]">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 font-ui text-[11px] text-mut">{BRAND.studioName} · dentro de tu Claude</span>
          <span className="chip ml-auto">Próximamente</span>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[1.3fr_1fr]">
          <div className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-line bg-soft/50 p-6 text-center">
            <div>
              <span className="brand-gradient mx-auto grid size-14 place-items-center rounded-2xl text-2xl text-white">⬆</span>
              <p className="mt-4 text-lg font-semibold text-ink">Arrastra tus videos aquí</p>
              <p className="mt-1 text-sm text-mut">Y edítalos con plantillas, sin salir de Claude.</p>
            </div>
          </div>
          <div>
            <p className="font-ui text-[11px] font-semibold tracking-wider text-accent uppercase">Plantillas</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/2] rounded-xl border border-line bg-soft/70" />
              ))}
            </div>
            {showLink && (
              <Link href="/studio" className="mt-4 inline-flex text-sm font-semibold text-accent">
                Conocer {BRAND.studioName} <span className="arr ml-1">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
