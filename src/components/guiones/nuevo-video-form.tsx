"use client";

import { useActionState, useEffect, useState } from "react";
import { crearVideo } from "@/app/guiones/app/actions";
import { OPCIONES_POR_DEFECTO, normalizarOpciones, type Opciones } from "@/lib/guiones/types";
import { OpcionesCampos } from "./opciones-campos";

const LS = "guionera-opciones";

export function NuevoVideoForm({ urlInicial = "", modoInicial = "link" }: { urlInicial?: string; modoInicial?: "link" | "texto" }) {
  const [error, action, pending] = useActionState(crearVideo, null);
  const [modo, setModo] = useState<"link" | "texto">(modoInicial);
  const [opciones, setOpciones] = useState<Opciones>(OPCIONES_POR_DEFECTO);
  const [url, setUrl] = useState(urlInicial);

  // Recuerda tu último estilo y tu perfil entre videos.
  useEffect(() => {
    try {
      const g = localStorage.getItem(LS);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (g) setOpciones(normalizarOpciones(JSON.parse(g)));
    } catch {}
  }, []);
  const cambiar = (o: Opciones) => {
    setOpciones(o);
    try {
      localStorage.setItem(LS, JSON.stringify(o));
    } catch {}
  };

  return (
    <form action={action} className="card space-y-5 p-5 sm:p-6">
      <input type="hidden" name="opciones" value={JSON.stringify(opciones)} />
      <div className="inline-flex rounded-full bg-soft p-1 text-sm font-semibold">
        {(
          [
            ["link", "Pegar link"],
            ["texto", "Pegar transcripción"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setModo(id)}
            className={`rounded-full px-4 py-1.5 transition-colors ${modo === id ? "bg-card text-ink shadow-sm" : "text-mut"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {modo === "link" ? (
        <div>
          <label className="label" htmlFor="url">Link del video</label>
          <input
            id="url"
            name="url"
            className="input"
            placeholder="https://www.youtube.com/watch?v=…  (también TikTok o Instagram)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus={!urlInicial}
          />
          <p className="hint">Saco la transcripción sola. Si el video no tiene subtítulos, la transcribo con IA (gasta más créditos de Supadata).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="titulo">Título del video</label>
            <input id="titulo" name="titulo" className="input" placeholder="Ayuda a entender de qué va el video" />
          </div>
          <div>
            <label className="label" htmlFor="transcripcion">Transcripción</label>
            <textarea id="transcripcion" name="transcripcion" className="input min-h-44" placeholder="Pega aquí la transcripción completa del video…" />
          </div>
          <div>
            <label className="label" htmlFor="url2">Link del video (opcional)</label>
            <input id="url2" name="url" className="input" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
      )}

      <details open className="rounded-xl border border-line bg-soft/50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Cómo quieres el guion</summary>
        <div className="mt-4">
          <OpcionesCampos value={opciones} onChange={cambiar} />
        </div>
      </details>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error.error}</p>}
      <button className="btn w-full sm:w-auto" disabled={pending}>
        {pending ? "Sacando la transcripción…" : "Crear guion"} <span className="arr">→</span>
      </button>
    </form>
  );
}
