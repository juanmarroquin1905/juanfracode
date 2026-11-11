"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AsistenteApp } from "@/apps/asistente/asistente-app";
import { createLocalStore } from "@/apps/asistente/local-store";

export function AsistenteDemo() {
  const store = useMemo(() => createLocalStore("juanfracode-asistente-demo"), []);
  const [key, setKey] = useState(0);

  const reset = async () => {
    if (!confirm("¿Borrar tus cambios y volver a los datos de ejemplo?")) return;
    await store.reset?.();
    setKey((k) => k + 1);
  };

  return (
    <AsistenteApp
      key={key}
      store={store}
      topBar={
        <div className="relative z-20 border-b border-(--h-line) bg-[rgb(3_8_20/0.85)]">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs sm:px-6">
            <span className="rounded-sm bg-(--h-cyan) px-2 py-0.5 font-bold text-(--h-bg)">DEMO</span>
            <span className="text-(--h-mut)">Datos de ejemplo y respuestas simuladas, gratis y sin claves. Lo que cambies se guarda solo en tu navegador.</span>
            <button type="button" onClick={reset} className="text-(--h-mut) underline-offset-2 hover:text-(--h-ink) hover:underline">
              Reiniciar
            </button>
            <Link href="/saas/asistente?descargar=zip" target="_top" className="ml-auto font-bold text-(--h-cyan)">
              Descargar el código gratis →
            </Link>
          </div>
        </div>
      }
    />
  );
}
