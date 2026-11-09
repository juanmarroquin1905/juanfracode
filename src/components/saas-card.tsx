import Link from "next/link";
import type { Saas } from "@/lib/types";
import { AppPreview } from "./app-preview";
import { SaasLogo } from "./saas-logo";

export function SaasCard({ saas }: { saas: Saas }) {
  const hasTemplate = Boolean(saas.repo_url || saas.zip_url);
  return (
    <Link
      href={`/saas/${saas.slug}`}
      className="card lift press group relative flex flex-col overflow-hidden"
    >
      <div className="relative border-b border-line px-5 pt-5" style={{ background: `linear-gradient(180deg, ${saas.color}1f, ${saas.color}05)` }}>
        <AppPreview saas={saas} className="rounded-b-none" />
      </div>
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start gap-3">
        <SaasLogo saas={saas} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight text-ink">{saas.name}</h3>
          </div>
          <p className="text-xs text-mut">{saas.category}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mut">{saas.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {saas.stack.slice(0, 4).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {saas.stack.length > 4 && <span className="chip">+{saas.stack.length - 4}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-xs text-mut">
        <span className="flex gap-3">
          {saas.demo_url && <span className="font-medium text-ink">● Demo en vivo</span>}
          {hasTemplate ? <span className="font-medium text-accent">↓ Plantilla gratis</span> : <span>Plantilla pronto</span>}
        </span>
        <span className="font-semibold text-accent">Ver <span className="arr">→</span></span>
      </div>
      </div>
    </Link>
  );
}
