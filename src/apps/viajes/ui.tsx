"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { searchPlace, type Place } from "./utils";

// Piezas pequeñas que usan varias pantallas: ventana, campo y buscador de lugares.

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} className="vj vj-dialog" style={{ minHeight: 0 }}>
      <div className="flex items-center border-b border-dashed border-(--vj-line) px-5 py-3.5">
        <h2 className="vj-serif text-xl font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="vj-press ml-auto grid size-8 place-items-center rounded-full text-(--vj-mut) hover:bg-(--vj-paper-2)">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="vj-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

/** Pie de las ventanas: borrar (si existe), cancelar y guardar. */
export function DialogFooter({ onDelete, onClose, saveLabel = "Guardar" }: { onDelete?: () => void; onClose: () => void; saveLabel?: string }) {
  const [sure, setSure] = useState(false);
  return (
    <div className="flex items-center gap-2 border-t border-dashed border-(--vj-line) px-5 py-3.5">
      {onDelete &&
        (sure ? (
          <button type="button" onClick={onDelete} className="vj-press rounded-lg px-2 py-1.5 text-sm font-semibold text-(--vj-red)">
            ¿Seguro? Sí, borrar
          </button>
        ) : (
          <button type="button" onClick={() => setSure(true)} className="vj-press rounded-lg px-2 py-1.5 text-sm text-(--vj-red)">
            Borrar
          </button>
        ))}
      <button type="button" onClick={onClose} className="vj-btn-ghost ml-auto">
        Cancelar
      </button>
      <button type="submit" className="vj-btn">
        {saveLabel}
      </button>
    </div>
  );
}

/** Ubicar un lugar en el mapa buscándolo por nombre (OpenStreetMap). */
export function PlacePicker({
  query,
  near,
  lat,
  lng,
  onPick,
  onClear,
}: {
  query: string;
  near: string;
  lat: number | null;
  lng: number | null;
  onPick: (p: Place) => void;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Place[] | null>(null);
  const [err, setErr] = useState("");

  async function find() {
    if (!query.trim()) {
      setErr("Primero escribe el nombre del lugar.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const r = await searchPlace(query.trim(), near);
      setResults(r);
      if (!r.length) setErr("No lo encontré. Prueba con otro nombre o agrega la ciudad.");
    } catch {
      setErr("No se pudo buscar ahora. Revisa tu internet.");
    } finally {
      setBusy(false);
    }
  }

  if (lat != null && lng != null)
    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-(--vj-teal)">📍 Ubicado en el mapa</span>
        <button type="button" onClick={onClear} className="text-(--vj-mut) underline underline-offset-2">
          Quitar
        </button>
      </div>
    );

  return (
    <div className="mt-2">
      <button type="button" onClick={find} disabled={busy} className="vj-chip vj-press">
        {busy ? "Buscando…" : "📍 Buscar en el mapa"}
      </button>
      {err && <p className="mt-1.5 text-xs text-(--vj-red)">{err}</p>}
      {results && results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-lg border border-(--vj-line) bg-[#fffdf8]">
          {results.map((p, i) => (
            <li key={i} className="border-t border-(--vj-line) first:border-t-0">
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setResults(null);
                }}
                className="vj-row w-full px-3 py-2 text-left"
              >
                <span className="block text-sm font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-(--vj-mut)">{p.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
