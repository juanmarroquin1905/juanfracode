"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GymApp } from "@/apps/gimnasio/gym-app";
import { createLocalStore } from "@/apps/gimnasio/local-store";

export function GimnasioDemo() {
  const store = useMemo(() => createLocalStore("juanfracode-gimnasio-demo"), []);
  const [key, setKey] = useState(0);

  const reset = async () => {
    if (!confirm("¿Borrar tus cambios y volver a los datos de ejemplo?")) return;
    await store.reset?.();
    setKey((k) => k + 1);
  };

  return (
    <GymApp
      key={key}
      store={store}
      topBar={
        <div className="border-b border-[#242932] bg-[#0d0f12]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-[#8a93a3] sm:px-6">
            <span className="rounded-md bg-[#c6f24e] px-2 py-0.5 font-bold text-[#10140a]">DEMO</span>
            <span>Datos de ejemplo. Lo que cambies se guarda solo en este navegador.</span>
            <button type="button" onClick={reset} className="underline-offset-2 hover:text-white hover:underline">
              Reiniciar
            </button>
            <Link href="/saas/gimnasio?descargar=zip" target="_top" className="ml-auto font-semibold text-[#c6f24e]">
              Descargar el código gratis →
            </Link>
          </div>
        </div>
      }
    />
  );
}
