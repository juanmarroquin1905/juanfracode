"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
