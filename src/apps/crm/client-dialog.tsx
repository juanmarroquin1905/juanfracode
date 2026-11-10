"use client";

import { useState, type ReactNode } from "react";
import { emptyClient } from "./seed";
import type { Client } from "./types";
import { Field, Modal } from "./ui";
import { addDays, STAGES, today, uid, waLink } from "./utils";

// La ventana para agregar o editar un cliente, en 4 bloques fáciles:
// quién es, qué quiere, en qué va y qué sigue.

const QUICK_DATES = [
  { label: "Hoy", days: 0 },
  { label: "Mañana", days: 1 },
  { label: "En 3 días", days: 3 },
  { label: "En 1 semana", days: 7 },
];

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-(--c-bg) p-4">
      <h3 className="crm-display mb-3 flex items-center gap-2 text-base">
        <span aria-hidden>{icon}</span> {title}
      </h3>
      {children}
    </section>
  );
}

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
    <Modal title={isNew ? "Nuevo cliente 🙌" : c.name || "Cliente"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="max-h-[68dvh] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          <Block icon="👤" title="¿Quién es?">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="c-name">
                <input id="c-name" required maxLength={80} autoFocus={isNew} value={c.name} onChange={(e) => set({ name: e.target.value })} className="crm-input" placeholder="Ej: Ana Torres" />
              </Field>
              <Field label="Negocio (opcional)" htmlFor="c-co">
                <input id="c-co" maxLength={80} value={c.company} onChange={(e) => set({ company: e.target.value })} className="crm-input" placeholder="Ej: Café Origen" />
              </Field>
              <Field label="WhatsApp" htmlFor="c-phone">
                <div className="flex gap-2">
                  <input id="c-phone" type="tel" maxLength={30} value={c.phone} onChange={(e) => set({ phone: e.target.value })} className="crm-input min-w-0" placeholder="+52 55 1234 5678" />
                  {c.phone.replace(/\D/g, "").length >= 7 && (
                    <a href={waLink(c.phone)} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp" title="Abrir WhatsApp" className="crm-btn crm-btn-soft shrink-0 px-3.5!">
                      💬
                    </a>
                  )}
                </div>
              </Field>
              <Field label="Correo (opcional)" htmlFor="c-email">
                <input id="c-email" type="email" maxLength={120} value={c.email} onChange={(e) => set({ email: e.target.value })} className="crm-input" placeholder="ana@correo.com" />
              </Field>
            </div>
          </Block>

          <Block icon="💼" title="¿Qué te quiere comprar?">
            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <Field label="Qué" htmlFor="c-service">
                <input id="c-service" maxLength={80} value={c.service} onChange={(e) => set({ service: e.target.value })} className="crm-input" placeholder="Ej: Una página web" />
              </Field>
              <Field label="Precio (US$)" htmlFor="c-value">
                <input id="c-value" type="number" inputMode="decimal" min={0} step="any" value={value} onChange={(e) => setValue(e.target.value)} className="crm-input crm-num" placeholder="0" />
              </Field>
            </div>
          </Block>

          <Block icon="📍" title="¿En qué va?">
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={c.stage === s.id}
                  onClick={() => set({ stage: s.id })}
                  className="crm-chip"
                  style={c.stage === s.id ? { background: s.color, borderColor: "transparent", color: "var(--c-ink)" } : undefined}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-(--c-mut)">{STAGES.find((s) => s.id === c.stage)?.hint}</p>
          </Block>

          <Block icon="⏰" title="¿Qué sigue?">
            <input
              id="c-next"
              aria-label="Próximo paso"
              maxLength={100}
              value={c.next_step}
              onChange={(e) => set({ next_step: e.target.value })}
              className="crm-input"
              placeholder="Ej: Escribirle para ver si vio el precio"
            />
            <p className="mt-3 mb-2 text-sm font-bold">¿Cuándo?</p>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_DATES.map((q) => {
                const v = addDays(today(), q.days);
                return (
                  <button key={q.label} type="button" aria-pressed={c.next_date === v} onClick={() => set({ next_date: v })} className="crm-chip">
                    {q.label}
                  </button>
                );
              })}
              <input type="date" aria-label="Otra fecha" value={c.next_date ?? ""} onChange={(e) => set({ next_date: e.target.value || null })} className="crm-input h-9! w-auto! px-3! text-sm!" />
            </div>
            <p className="mt-2 text-sm text-(--c-mut)">Ese día te aparece en “Para hoy” para que no se te olvide.</p>
          </Block>

          <Block icon="📝" title="Notas">
            <textarea id="c-notes" aria-label="Notas" rows={3} maxLength={600} value={c.notes} onChange={(e) => set({ notes: e.target.value })} className="crm-input" placeholder="Lo que hablaron, lo que le importa, cómo prefiere que le escribas…" />
          </Block>
        </div>

        <div className="flex items-center gap-2 border-t border-(--c-line) px-5 py-3.5">
          {!isNew &&
            (sure ? (
              <button type="button" onClick={() => onDelete(c.id)} className="crm-press rounded-full px-3 py-1.5 text-sm font-bold text-(--c-red)">
                ¿Seguro? Sí, borrar
              </button>
            ) : (
              <button type="button" onClick={() => setSure(true)} className="crm-press rounded-full px-3 py-1.5 text-sm font-semibold text-(--c-mut) hover:text-(--c-red)">
                Borrar
              </button>
            ))}
          <button type="button" onClick={onClose} className="crm-btn crm-btn-white ml-auto">
            Cancelar
          </button>
          <button type="submit" className="crm-btn">
            {isNew ? "Agregar" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
