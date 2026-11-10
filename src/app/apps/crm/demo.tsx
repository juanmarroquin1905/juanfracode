"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CrmApp } from "@/apps/crm/crm-app";
import { createLocalStore } from "@/apps/crm/local-store";

export function CrmDemo() {
  const store = useMemo(() => createLocalStore("juanfracode-crm-demo"), []);
  const [key, setKey] = useState(0);

  const reset = async () => {
    if (!confirm("¿Borrar tus cambios y volver a los clientes de ejemplo?")) return;
    await store.reset?.();
    setKey((k) => k + 1);
  };

  return (
    <CrmApp
      key={key}
      store={store}
      topBar={
        <div className="bg-(--c-ink) text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs sm:px-6">
            <span className="rounded-full bg-(--c-yellow) px-2.5 py-0.5 font-bold text-(--c-ink)">Demo</span>
            <span className="text-white/80">Son clientes de ejemplo. Juega con confianza: lo que cambies se guarda solo en tu navegador.</span>
            <button type="button" onClick={reset} className="text-white/80 underline-offset-2 hover:text-white hover:underline">
              Reiniciar
            </button>
            <Link href="/saas/crm?descargar=zip" target="_top" className="ml-auto font-bold text-(--c-yellow)">
              Descargar el código gratis →
            </Link>
          </div>
        </div>
      }
    />
  );
}
