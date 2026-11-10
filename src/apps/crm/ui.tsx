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
      <div className="flex items-center border-b-2 border-(--c-ink) bg-(--c-yellow) px-5 py-3">
        <h2 className="crm-display text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="crm-press ml-auto grid size-8 place-items-center rounded-full text-lg font-bold hover:bg-black/10">
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
