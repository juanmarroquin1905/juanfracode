import Link from "next/link";
import type { Saas } from "@/lib/types";
import { AppPreview } from "./app-preview";
import { SaasLogo } from "./saas-logo";
import { StatusBadge } from "./status-badge";

export function SaasCard({ saas }: { saas: Saas }) {
  const hasTemplate = Boolean(saas.repo_url || saas.zip_url);
  return (
    <Link
      href={`/saas/${saas.slug}`}
      className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(16,24,40,0.18)]"
    >
      <div className="relative border-b border-line px-5 pt-5" style={{ background: `linear-gradient(180deg, ${saas.color}1f, ${saas.color}05)` }}>
        <AppPreview saas={saas} className="translate-y-1 rounded-b-none transition group-hover:translate-y-0" />
      </div>
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start gap-3">
        <SaasLogo saas={saas} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight text-ink">{saas.name}</h3>
            <StatusBadge status={saas.status} />
          </div>
          <p className="text-xs text-slate-500">{saas.category}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{saas.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {saas.stack.slice(0, 4).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {saas.stack.length > 4 && <span className="chip">+{saas.stack.length - 4}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-xs text-slate-500">
        <span className="flex gap-3">
          {saas.demo_url && <span className="font-medium text-slate-700">● Demo en vivo</span>}
          {hasTemplate ? <span className="font-medium text-accent">↓ Plantilla gratis</span> : <span>Plantilla pronto</span>}
        </span>
        <span className="font-semibold text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-ink">Ver →</span>
      </div>
      </div>
    </Link>
  );
}
