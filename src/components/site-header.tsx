import Link from "next/link";
import { BRAND } from "@/config/brand";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-20 mx-auto mt-3 max-w-6xl px-4">
      <div className="glass flex h-14 !bg-card/85 items-center justify-between gap-2 rounded-full pr-2 pl-4 sm:pl-5">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight whitespace-nowrap sm:gap-2.5 text-ink">
          <span className="grid h-6 place-items-center rounded-lg bg-night px-1.5 font-mono text-[11px] text-white">{"</>"}</span>
          {BRAND.name}
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-0.5 text-sm md:flex">
          <NavLinks variant="bar" />
        </nav>
        <div className="flex items-center gap-0.5 text-sm sm:gap-1">
          <ThemeToggle />
          {BRAND.socials.tiktok && (
            <a
              href={BRAND.socials.tiktok}
              target="_blank"
              rel="noreferrer"
              className="press rounded-full bg-night px-3 py-2 sm:ml-1 sm:px-4 font-semibold text-white transition-transform duration-150"
            >
              Sígueme
            </a>
          )}
        </div>
      </div>
      {/* En celular el menú va en una fila debajo de la barra, siempre a la vista */}
      <nav aria-label="Principal" className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-1 md:hidden">
        <NavLinks variant="row" />
      </nav>
    </header>
  );
}
