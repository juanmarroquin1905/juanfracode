import Link from "next/link";
import { BRAND } from "@/config/brand";
import { MORE_LINKS } from "@/config/nav";
import { socialLinks } from "./socials";

export function SiteFooter() {
  const socials = socialLinks();
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-8 text-sm text-mut">
        <span className="font-semibold text-ink">Más de {BRAND.name}:</span>
        {MORE_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-ink">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-4 pb-8 text-sm text-mut sm:flex-row sm:items-center sm:justify-between">
        <p>
          Hecho con Next.js, Supabase, Vercel y Claude Code por <span className="text-ink">{BRAND.name}</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {socials.map((s) => (
            <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="hover:text-ink">
              {s.label}
            </a>
          ))}
          <Link href="/admin" className="hover:text-ink">
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
