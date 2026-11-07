import Link from "next/link";
import { BRAND } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-white">
          <span className="grid size-7 place-items-center rounded-md bg-accent font-mono text-xs text-ink">{"</>"}</span>
          {BRAND.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/#saas" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/5 hover:text-white">
            SaaS
          </Link>
          <Link href="/#como-usar" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/5 hover:text-white">
            Cómo usarlas
          </Link>
        </nav>
      </div>
    </header>
  );
}
