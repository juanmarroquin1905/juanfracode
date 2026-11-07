import Link from "next/link";
import { BRAND } from "@/config/brand";

const LABELS: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };

export function SiteFooter() {
  const socials = Object.entries(BRAND.socials).filter(([, url]) => url);
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Hecho con Next.js, Supabase, Vercel y Claude Code por <span className="text-slate-300">{BRAND.name}</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {socials.map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noreferrer" className="hover:text-white">
              {LABELS[key] ?? key}
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
