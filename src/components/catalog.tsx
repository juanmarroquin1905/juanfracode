"use client";

import { useMemo, useState } from "react";
import type { Saas } from "@/lib/types";
import { SaasCard } from "./saas-card";

export function Catalog({ items }: { items: Saas[] }) {
  const [category, setCategory] = useState("Todas");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(items.map((s) => s.category)))], [items]);
  const shown = items.filter((s) => {
    if (category !== "Todas" && s.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [s.name, s.tagline, s.category, ...s.stack].some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                c === category ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o tecnología…"
          className="input sm:max-w-xs"
          aria-label="Buscar apps"
        />
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {items.length === 0 ? "Muy pronto las primeras apps. ¡Sígueme para enterarte cuando salgan!" : "No hay apps que coincidan con tu búsqueda."}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => (
            <SaasCard key={s.id} saas={s} />
          ))}
        </div>
      )}
    </div>
  );
}
