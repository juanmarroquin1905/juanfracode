import Link from "next/link";
import { BRAND } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
          <span className="grid size-7 place-items-center brand-gradient rounded-lg font-mono text-[11px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-2px_rgba(109,74,255,0.6)]">{"</>"}</span>
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/#saas" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink">
            Apps
          </Link>
          <Link href="/#como-usar" className="hidden rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink sm:block">
            Cómo usarlas
          </Link>
          <Link href="/#preguntas" className="hidden rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink sm:block">
            Preguntas
          </Link>
          {BRAND.socials.tiktok && (
            <a href={BRAND.socials.tiktok} target="_blank" rel="noreferrer" className="ml-1 rounded-full bg-ink px-4 py-1.5 font-semibold text-white hover:bg-slate-800">
              Sígueme
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
