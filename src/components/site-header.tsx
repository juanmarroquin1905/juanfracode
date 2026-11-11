import Link from "next/link";
import { BRAND } from "@/config/brand";
import { ThemeToggle } from "@/components/theme";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-20 mx-auto mt-3 max-w-6xl px-4">
      <div className="glass flex h-14 !bg-card/85 items-center justify-between gap-2 rounded-full pr-2 pl-4 sm:pl-5">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight whitespace-nowrap sm:gap-2.5 text-ink">
          <span className="grid h-6 place-items-center rounded-lg bg-night px-1.5 font-mono text-[11px] text-white">{"</>"}</span>
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
          <Link href="/#top" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink sm:block">
            Apps
          </Link>
          <Link href="/#proyectos" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink sm:block">
            Mis proyectos
          </Link>
          <Link href="/skills" className="rounded-full px-2 py-1.5 text-mut transition-colors hover:text-ink sm:px-3">
            Skills
          </Link>
          <Link href="/#como-usar" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink md:block">
            Cómo se publica
          </Link>
          <Link href="/#preguntas" className="hidden rounded-full px-3 py-1.5 text-mut transition-colors hover:text-ink lg:block">
            Preguntas
          </Link>
          <ThemeToggle />
          {BRAND.socials.tiktok && (
            <a
              href={BRAND.socials.tiktok}
              target="_blank"
              rel="noreferrer"
              className="press rounded-full bg-night px-3.5 py-2 sm:ml-1 sm:px-4 font-semibold text-white transition-transform duration-150"
            >
              Sígueme
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
