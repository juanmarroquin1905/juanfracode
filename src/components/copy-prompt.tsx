"use client";

import { useState } from "react";

// Botón para copiar un prompt al portapapeles.
export function CopyPrompt({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          setDone(false);
        }
      }}
      className={done ? "btn-ghost !py-2 text-xs" : "btn !py-2 text-xs"}
    >
      {done ? "¡Copiado!" : "Copiar prompt"}
    </button>
  );
}
