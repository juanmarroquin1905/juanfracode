import Link from "next/link";
import { SaasLogo } from "@/components/saas-logo";
import { StatusBadge } from "@/components/status-badge";
import { getAllSaas } from "@/lib/data";

export default async function AdminHome() {
  const items = await getAllSaas();
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tus apps</h1>
          <p className="text-sm text-slate-500">{items.length} en total</p>
        </div>
        <Link href="/admin/nuevo" className="btn">
          + Nueva app
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-line overflow-hidden card">
        {items.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <SaasLogo saas={s} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{s.name}</span>
                  <StatusBadge status={s.status} />
                  {!s.published && <span className="chip">Oculto</span>}
                </div>
                <p className="truncate text-sm text-slate-500">{s.tagline}</p>
              </div>
              <div className="hidden text-right font-mono text-xs text-slate-500 sm:block">
                <div>{s.views} visitas</div>
                <div>{s.downloads} descargas</div>
              </div>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="p-8 text-center text-slate-500">Aún no has subido ninguna app. Pulsa “+ Nueva app” para agregar la primera.</li>}
      </ul>
    </>
  );
}
