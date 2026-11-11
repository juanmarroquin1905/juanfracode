import Link from "next/link";
import { BRAND } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-20 mx-auto mt-3 max-w-6xl px-4">
      <div className="glass flex h-14 !bg-white/85 items-center justify-between rounded-full pr-2 pl-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-ink">
          <span className="grid h-6 place-items-center rounded-lg bg-ink px-1.5 font-mono text-[11px] text-white">{"</>"}</span>
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/#top" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink sm:block">
            Apps
          </Link>
          <Link href="/#proyectos" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink sm:block">
            Mis proyectos
          </Link>
          <Link href="/#como-usar" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink md:block">
            Cómo se publica
          </Link>
          <Link href="/#preguntas" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink lg:block">
            Preguntas
          </Link>
          {BRAND.socials.tiktok && (
            <a
              href={BRAND.socials.tiktok}
              target="_blank"
              rel="noreferrer"
              className="press ml-1 rounded-full bg-ink px-4 py-2 font-semibold text-white transition-transform duration-150"
            >
              Sígueme
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
