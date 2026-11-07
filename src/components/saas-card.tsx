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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5 hover:border-slate-600"
    >
      <div className="relative border-b border-line px-5 pt-5" style={{ background: `linear-gradient(180deg, ${saas.color}22, transparent)` }}>
        <AppPreview saas={saas} className="translate-y-1 rounded-b-none transition group-hover:translate-y-0" />
      </div>
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start gap-3">
        <SaasLogo saas={saas} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-white">{saas.name}</h3>
            <StatusBadge status={saas.status} />
          </div>
          <p className="text-xs text-slate-500">{saas.category}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-300">{saas.tagline}</p>
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
          {saas.demo_url && <span className="text-slate-300">● Demo</span>}
          {hasTemplate ? <span className="text-accent">↓ Plantilla gratis</span> : <span>Plantilla pronto</span>}
        </span>
        <span className="font-semibold text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-white">Ver →</span>
      </div>
      </div>
    </Link>
  );
}
