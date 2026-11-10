"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FinanceApp } from "@/apps/finanzas/finance-app";
import { createLocalStore } from "@/apps/finanzas/local-store";

export function FinanzasDemo() {
  const store = useMemo(() => createLocalStore("juanfracode-finanzas-demo"), []);
  const [key, setKey] = useState(0);

  const reset = async () => {
    if (!confirm("¿Borrar tus cambios y volver a los datos de ejemplo?")) return;
    await store.reset?.();
    setKey((k) => k + 1);
  };

  return (
    <FinanceApp
      key={key}
      store={store}
      topBar={
        <div className="border-b border-line bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-mut sm:px-6">
            <span className="rounded-full bg-soft px-2 py-0.5 font-semibold text-accent">Demo</span>
            <span>Datos de ejemplo. Lo que cambies se guarda solo en este navegador.</span>
            <button type="button" onClick={reset} className="underline-offset-2 hover:text-ink hover:underline">
              Reiniciar
            </button>
            <Link href="/saas/finanzas?descargar=zip" target="_top" className="ml-auto font-semibold text-accent">
              Descargar el código gratis →
            </Link>
          </div>
        </div>
      }
    />
  );
}
