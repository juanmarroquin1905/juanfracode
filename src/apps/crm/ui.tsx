"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Contact, CrmData, Deal, ListName, Rows, Stage, Task } from "./types";
import { initials, stageOf } from "./utils";

// Piezas pequeñas que usan varias pantallas y el "control remoto" del CRM
// (CrmContext) para guardar y abrir ventanas desde cualquier parte.

export type Crm = {
  data: CrmData;
  currency: string;
  save: <L extends ListName>(list: L, row: Rows[L], ok?: string) => void;
  remove: (list: ListName, id: string, ok?: string) => void;
  openContact: (id: string) => void;
  editContact: (c: Contact | null) => void;
  editDeal: (d: Partial<Deal> & { contact_id?: string }) => void;
  editTask: (t: Partial<Task> & { contact_id?: string }) => void;
  toggleTask: (t: Task) => void;
  contactById: (id: string) => Contact | undefined;
};
export const CrmContext = createContext<Crm | null>(null);
export const useCrm = () => {
  const c = useContext(CrmContext);
  if (!c) throw new Error("useCrm fuera de CrmApp");
  return c;
};

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

/** Pie de las ventanas: borrar (si existe), cancelar y guardar. */
export function DialogFooter({ onDelete, onClose, saveLabel = "Guardar", deleteLabel = "Borrar" }: { onDelete?: () => void; onClose: () => void; saveLabel?: string; deleteLabel?: string }) {
  const [sure, setSure] = useState(false);
  return (
    <div className="flex items-center gap-2 border-t-2 border-(--c-ink) px-5 py-3.5">
      {onDelete &&
        (sure ? (
          <button type="button" onClick={onDelete} className="crm-press rounded-lg px-2 py-1.5 text-sm font-bold text-(--c-red)">
            ¿Seguro? Sí, borrar
          </button>
        ) : (
          <button type="button" onClick={() => setSure(true)} className="crm-press rounded-lg px-2 py-1.5 text-sm font-semibold text-(--c-red)">
            {deleteLabel}
          </button>
        ))}
      <button type="button" onClick={onClose} className="crm-btn crm-btn-white ml-auto">
        Cancelar
      </button>
      <button type="submit" className="crm-btn">
        {saveLabel}
      </button>
    </div>
  );
}

export function Avatar({ contact, size = 40 }: { contact?: Pick<Contact, "name" | "color">; size?: number }) {
  return (
    <span className="crm-avatar" style={{ width: size, height: size, background: contact?.color ?? "#fff", fontSize: size * 0.36 }}>
      {initials(contact?.name ?? "?")}
    </span>
  );
}

export function StageTag({ stage }: { stage: Stage }) {
  const s = stageOf(stage);
  return (
    <span className="crm-tag" style={{ background: s.color }}>
      {s.label}
    </span>
  );
}

/** Título de una sección con un contador opcional. */
export function SectionTitle({ children, count, right }: { children: ReactNode; count?: number; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="crm-display text-lg font-bold">{children}</h2>
      {count != null && <span className="crm-tag bg-(--c-ink)! text-white">{count}</span>}
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="crm-card-flat border-dashed! bg-white/60! px-5 py-8 text-center">
      <div className="text-3xl">{icon}</div>
      <p className="crm-display mt-2 font-bold">{title}</p>
      {children && <div className="mt-1 text-sm text-(--c-mut)">{children}</div>}
    </div>
  );
}
