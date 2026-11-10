"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Client } from "./types";
import { initials } from "./utils";

// Piezas pequeñas: la ventana, un campo con su título y el círculo con iniciales.

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} className="crm crm-dialog" style={{ minHeight: 0, backgroundImage: "none" }}>
      <div className="flex items-center border-b border-(--c-line) px-5 py-4">
        <h2 className="crm-display text-xl">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="crm-press ml-auto grid size-9 place-items-center rounded-full bg-(--c-bg) text-(--c-mut) hover:text-(--c-ink)">
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
      <label className="crm-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Avatar({ client, size = 40 }: { client: Pick<Client, "name" | "color">; size?: number }) {
  return (
    <span className="crm-avatar" style={{ width: size, height: size, background: client.color, fontSize: size * 0.36 }}>
      {initials(client.name)}
    </span>
  );
}
