"use client";

import { useState } from "react";
import { emptyClient } from "./seed";
import type { Client } from "./types";
import { Field, Modal } from "./ui";
import { addDays, STAGES, today, uid, waLink } from "./utils";

// La ventana para agregar o editar un cliente. Todo lo del cliente está aquí.

const QUICK_DATES = [
  { label: "Hoy", days: 0 },
  { label: "Mañana", days: 1 },
  { label: "En 3 días", days: 3 },
  { label: "En 1 semana", days: 7 },
];

export function ClientDialog({
  client,
  onClose,
  onSave,
  onDelete,
}: {
  client: Client | null;
  onClose: () => void;
  onSave: (c: Client) => void;
  onDelete: (id: string) => void;
}) {
  const [c, setC] = useState<Client>(client ?? emptyClient());
  const [value, setValue] = useState(c.value ? String(c.value) : "");
  const [sure, setSure] = useState(false);
  const isNew = !c.id;
  const set = (patch: Partial<Client>) => setC((x) => ({ ...x, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next_step = c.next_step.trim();
    onSave({
      ...c,
      id: c.id || uid(),
      created_at: c.created_at || new Date().toISOString(),
      name: c.name.trim(),
      company: c.company.trim(),
      phone: c.phone.trim(),
      email: c.email.trim(),
      service: c.service.trim(),
      value: Math.max(0, Number(value) || 0),
      next_step,
      // Si hay próximo paso sin fecha, queda para hoy.
      next_date: next_step ? c.next_date || today() : null,
    });
  }

  return (
    <Modal title={isNew ? "Nuevo cliente" : c.name || "Cliente"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid max-h-[68dvh] grid-cols-2 gap-3.5 overflow-y-auto px-5 py-4">
          <Field label="Nombre" htmlFor="c-name" className="col-span-2 sm:col-span-1">
            <input id="c-name" required maxLength={80} autoFocus={isNew} value={c.name} onChange={(e) => set({ name: e.target.value })} className="crm-input" placeholder="Ej: Ana Torres" />
          </Field>
          <Field label="Negocio" htmlFor="c-co" className="col-span-2 sm:col-span-1">
            <input id="c-co" maxLength={80} value={c.company} onChange={(e) => set({ company: e.target.value })} className="crm-input" placeholder="Opcional" />
          </Field>
          <Field label="WhatsApp" htmlFor="c-phone" className="col-span-2 sm:col-span-1">
            <div className="flex gap-2">
              <input id="c-phone" type="tel" maxLength={30} value={c.phone} onChange={(e) => set({ phone: e.target.value })} className="crm-input min-w-0" placeholder="+52 55 1234 5678" />
              {c.phone.replace(/\D/g, "").length >= 7 && (
                <a href={waLink(c.phone)} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp" className="crm-btn crm-btn-white shrink-0 px-3! text-lg">
                  💬
                </a>
              )}
            </div>
          </Field>
          <Field label="Correo" htmlFor="c-email" className="col-span-2 sm:col-span-1">
            <input id="c-email" type="email" maxLength={120} value={c.email} onChange={(e) => set({ email: e.target.value })} className="crm-input" placeholder="Opcional" />
          </Field>
          <Field label="¿Qué te quiere comprar?" htmlFor="c-service" className="col-span-2 sm:col-span-1">
            <input id="c-service" maxLength={80} value={c.service} onChange={(e) => set({ service: e.target.value })} className="crm-input" placeholder="Ej: Página web" />
          </Field>
          <Field label="¿Cuánto vale? (US$)" htmlFor="c-value" className="col-span-2 sm:col-span-1">
            <input id="c-value" type="number" inputMode="decimal" min={0} step="any" value={value} onChange={(e) => setValue(e.target.value)} className="crm-input crm-num" placeholder="0" />
          </Field>

          <Field label="¿En qué va?" className="col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={c.stage === s.id}
                  onClick={() => set({ stage: s.id })}
                  className="crm-chip"
                  style={c.stage === s.id ? { background: s.color, color: "var(--c-ink)", boxShadow: "2px 2px 0 var(--c-ink)" } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="col-span-2 rounded-xl border-2 border-dashed border-(--c-ink)/30 bg-(--c-bg) p-3">
            <Field label="Próximo paso" htmlFor="c-next">
              <input id="c-next" maxLength={100} value={c.next_step} onChange={(e) => set({ next_step: e.target.value })} className="crm-input" placeholder="Ej: Escribirle para ver si revisó el precio" />
            </Field>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {QUICK_DATES.map((q) => {
                const v = addDays(today(), q.days);
                return (
                  <button key={q.label} type="button" aria-pressed={c.next_date === v} onClick={() => set({ next_date: v })} className="crm-chip h-8!">
                    {q.label}
                  </button>
                );
              })}
              <input type="date" aria-label="Otra fecha" value={c.next_date ?? ""} onChange={(e) => set({ next_date: e.target.value || null })} className="crm-input h-8! w-auto! px-2! text-sm!" />
            </div>
          </div>

          <Field label="Notas" htmlFor="c-notes" className="col-span-2">
            <textarea id="c-notes" rows={3} maxLength={600} value={c.notes} onChange={(e) => set({ notes: e.target.value })} className="crm-input" placeholder="Lo que hablaron, lo que le importa, cómo prefiere que le escribas…" />
          </Field>
        </div>

        <div className="flex items-center gap-2 border-t-2 border-(--c-ink) px-5 py-3.5">
          {!isNew &&
            (sure ? (
              <button type="button" onClick={() => onDelete(c.id)} className="crm-press rounded-lg px-2 py-1.5 text-sm font-bold text-(--c-red)">
                ¿Seguro? Sí, borrar
              </button>
            ) : (
              <button type="button" onClick={() => setSure(true)} className="crm-press rounded-lg px-2 py-1.5 text-sm font-semibold text-(--c-red)">
                Borrar
              </button>
            ))}
          <button type="button" onClick={onClose} className="crm-btn crm-btn-white ml-auto">
            Cancelar
          </button>
          <button type="submit" className="crm-btn">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
