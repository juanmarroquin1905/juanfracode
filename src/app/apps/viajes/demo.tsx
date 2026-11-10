"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createLocalStore } from "@/apps/viajes/local-store";
import { TravelApp } from "@/apps/viajes/travel-app";

export function ViajesDemo() {
  const store = useMemo(() => createLocalStore("juanfracode-viajes-demo"), []);
  const [key, setKey] = useState(0);

  const reset = async () => {
    if (!confirm("¿Borrar tus cambios y volver a los viajes de ejemplo?")) return;
    await store.reset?.();
    setKey((k) => k + 1);
  };

  return (
    <TravelApp
      key={key}
      store={store}
      topBar={
        <div className="border-b border-dashed border-(--vj-line) bg-(--vj-card)/80">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-(--vj-mut) sm:px-6">
            <span className="vj-mono rounded-md bg-(--vj-ink) px-2 py-0.5 font-bold tracking-wider text-[#fffdf7] uppercase">Demo</span>
            <span>Viajes de ejemplo. Lo que cambies se guarda solo en este navegador.</span>
            <button type="button" onClick={reset} className="underline-offset-2 hover:text-(--vj-ink) hover:underline">
              Reiniciar
            </button>
            <Link href="/saas/viajes?descargar=zip" target="_top" className="ml-auto font-bold text-(--vj-red)">
              Descargar el código gratis →
            </Link>
          </div>
        </div>
      }
    />
  );
}
