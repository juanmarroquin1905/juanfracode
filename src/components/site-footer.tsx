import Link from "next/link";
import { BRAND } from "@/config/brand";
import { socialLinks } from "./socials";

export function SiteFooter() {
  const socials = socialLinks();
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Hecho con Next.js, Supabase, Vercel y Claude Code por <span className="text-slate-300">{BRAND.name}</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {socials.map((s) => (
            <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white">
              {s.label}
            </a>
          ))}
          <Link href="/admin" className="hover:text-white">
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
