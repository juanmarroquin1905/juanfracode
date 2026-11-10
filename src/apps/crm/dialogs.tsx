"use client";

import { useState } from "react";
import { emptyContact } from "./seed";
import type { Contact, Deal, Stage, Task, TaskKind } from "./types";
import { DialogFooter, Field, Modal, useCrm } from "./ui";
import { addDays, CONTACT_COLORS, isOpen, SOURCES, STAGES, TASK_KINDS, today, uid } from "./utils";

// Las ventanas para crear o editar un contacto, un trato o un seguimiento.

/* ---------------- Contacto ---------------- */

export function ContactDialog({ contact, onClose }: { contact: Contact | null; onClose: () => void }) {
  const crm = useCrm();
  const [c, setC] = useState<Contact>(contact ?? emptyContact());
  const [tagText, setTagText] = useState(c.tags.join(", "));
  const isNew = !c.id;
  const allTags = [...new Set(crm.data.contacts.flatMap((x) => x.tags))].sort();
  const set = (patch: Partial<Contact>) => setC((x) => ({ ...x, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = [...new Set(tagText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
    const row: Contact = { ...c, name: c.name.trim(), company: c.company.trim(), email: c.email.trim(), phone: c.phone.trim(), tags };
    if (isNew) {
      row.id = uid();
      row.created_at = new Date().toISOString();
    }
    crm.save("contacts", row, isNew ? "Contacto agregado" : "Contacto guardado");
    onClose();
    if (isNew) crm.openContact(row.id);
  }

  const addTag = (t: string) => {
    const list = tagText.split(",").map((x) => x.trim()).filter(Boolean);
    if (!list.includes(t)) setTagText([...list, t].join(", "));
  };

  return (
    <Modal title={isNew ? "Nuevo contacto" : "Editar contacto"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid max-h-[65dvh] grid-cols-2 gap-3.5 overflow-y-auto px-5 py-4">
          <Field label="Nombre" htmlFor="c-name" className="col-span-2">
            <input id="c-name" required maxLength={80} autoFocus value={c.name} onChange={(e) => set({ name: e.target.value })} className="crm-input" placeholder="Ej: Ana Torres" />
          </Field>
          <Field label="Empresa o negocio" htmlFor="c-co" className="col-span-2">
            <input id="c-co" maxLength={80} value={c.company} onChange={(e) => set({ company: e.target.value })} className="crm-input" placeholder="Opcional" />
          </Field>
          <Field label="WhatsApp / teléfono" htmlFor="c-phone" className="col-span-2 sm:col-span-1">
            <input id="c-phone" type="tel" maxLength={30} value={c.phone} onChange={(e) => set({ phone: e.target.value })} className="crm-input" placeholder="+52 55 1234 5678" />
          </Field>
          <Field label="Correo" htmlFor="c-email" className="col-span-2 sm:col-span-1">
            <input id="c-email" type="email" maxLength={120} value={c.email} onChange={(e) => set({ email: e.target.value })} className="crm-input" />
          </Field>
          <Field label="¿De dónde llegó?" className="col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((s) => (
                <button key={s} type="button" aria-pressed={c.source === s} onClick={() => set({ source: c.source === s ? "" : s })} className="crm-chip">
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Etiquetas (separadas por coma)" htmlFor="c-tags" className="col-span-2">
            <input id="c-tags" value={tagText} onChange={(e) => setTagText(e.target.value)} className="crm-input" placeholder="restaurante, recurrente" />
            {allTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {allTags.map((t) => (
                  <button key={t} type="button" onClick={() => addTag(t)} className="crm-tag crm-press opacity-70 hover:opacity-100">
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </Field>
          <Field label="Color" className="col-span-2">
            <div className="flex gap-2">
              {CONTACT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  aria-label={`Color ${col}`}
                  onClick={() => set({ color: col })}
                  className="crm-press size-8 rounded-full border-2 border-(--c-ink)"
                  style={{ background: col, boxShadow: c.color === col ? "0 0 0 3px #fff, 0 0 0 5px var(--c-ink)" : undefined }}
                />
              ))}
            </div>
          </Field>
          <Field label="Notas" htmlFor="c-notes" className="col-span-2">
            <textarea id="c-notes" rows={3} maxLength={600} value={c.notes} onChange={(e) => set({ notes: e.target.value })} className="crm-input" placeholder="Cómo prefiere que le hables, cumpleaños, lo que sea útil…" />
          </Field>
        </div>
        <DialogFooter
          onClose={onClose}
          deleteLabel="Borrar contacto"
          onDelete={
            isNew
              ? undefined
              : () => {
                  crm.remove("contacts", c.id, "Contacto eliminado");
                  onClose();
                }
          }
        />
      </form>
    </Modal>
  );
}

/* ---------------- Trato ---------------- */

export function DealDialog({ deal, onClose }: { deal: Partial<Deal>; onClose: () => void }) {
  const crm = useCrm();
  const contacts = [...crm.data.contacts].sort((a, b) => a.name.localeCompare(b.name));
  const [d, setD] = useState({
    id: deal.id ?? "",
    contact_id: deal.contact_id ?? contacts[0]?.id ?? "__nuevo",
    title: deal.title ?? "",
    value: deal.value != null ? String(deal.value) : "",
    stage: deal.stage ?? ("nuevo" as Stage),
    close_date: deal.close_date ?? addDays(today(), 14),
    notes: deal.notes ?? "",
  });
  const [newName, setNewName] = useState("");
  const isNew = !d.id;
  const set = (patch: Partial<typeof d>) => setD((x) => ({ ...x, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let contactId = d.contact_id;
    if (contactId === "__nuevo") {
      if (!newName.trim()) return;
      const c = { ...emptyContact(), id: uid(), name: newName.trim(), created_at: new Date().toISOString() };
      crm.save("contacts", c);
      contactId = c.id;
    }
    if (!contactId) return;
    const before = crm.data.deals.find((x) => x.id === d.id);
    const stageChanged = before?.stage !== d.stage;
    const closed = !isOpen({ stage: d.stage });
    const row: Deal = {
      id: d.id || uid(),
      contact_id: contactId,
      title: d.title.trim(),
      value: Math.max(0, Number(d.value) || 0),
      stage: d.stage,
      close_date: d.close_date || null,
      closed_at: closed ? (stageChanged ? today() : (before?.closed_at ?? today())) : null,
      notes: d.notes,
      position: stageChanged ? crm.data.deals.filter((x) => x.stage === d.stage).length : (before?.position ?? 0),
      created_at: before?.created_at ?? new Date().toISOString(),
    };
    crm.save("deals", row, d.stage === "ganado" && stageChanged ? "¡Trato ganado! 🎉" : isNew ? "Trato creado" : "Trato guardado");
    onClose();
  }

  return (
    <Modal title={isNew ? "Nuevo trato" : "Editar trato"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid max-h-[65dvh] grid-cols-2 gap-3.5 overflow-y-auto px-5 py-4">
          <Field label="¿Qué le vas a vender?" htmlFor="d-title" className="col-span-2">
            <input id="d-title" required maxLength={80} autoFocus={isNew} value={d.title} onChange={(e) => set({ title: e.target.value })} className="crm-input" placeholder="Ej: Página web con reservas" />
          </Field>
          <Field label="Cliente" htmlFor="d-contact" className="col-span-2 sm:col-span-1">
            <select id="d-contact" required value={d.contact_id} onChange={(e) => set({ contact_id: e.target.value })} className="crm-input">
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` · ${c.company}` : ""}
                </option>
              ))}
              <option value="__nuevo">+ Contacto nuevo…</option>
            </select>
          </Field>
          <Field label={`Valor (${crm.currency})`} htmlFor="d-value" className="col-span-2 sm:col-span-1">
            <input id="d-value" type="number" inputMode="decimal" min={0} step="any" value={d.value} onChange={(e) => set({ value: e.target.value })} className="crm-input crm-num" placeholder="0" />
          </Field>
          {d.contact_id === "__nuevo" && (
            <Field label="Nombre del contacto nuevo" htmlFor="d-newname" className="col-span-2">
              <input id="d-newname" required maxLength={80} value={newName} onChange={(e) => setNewName(e.target.value)} className="crm-input" />
            </Field>
          )}
          <Field label="Etapa" className="col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={d.stage === s.id}
                  onClick={() => set({ stage: s.id })}
                  className="crm-chip"
                  style={d.stage === s.id ? { background: s.color, color: "var(--c-ink)", boxShadow: "2px 2px 0 var(--c-ink)" } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cierre esperado" htmlFor="d-close" className="col-span-2 sm:col-span-1">
            <input id="d-close" type="date" value={d.close_date ?? ""} onChange={(e) => set({ close_date: e.target.value })} className="crm-input" />
          </Field>
          <Field label="Notas" htmlFor="d-notes" className="col-span-2">
            <textarea id="d-notes" rows={3} maxLength={600} value={d.notes} onChange={(e) => set({ notes: e.target.value })} className="crm-input" placeholder="Qué incluye, condiciones, lo que acordaron…" />
          </Field>
        </div>
        <DialogFooter
          onClose={onClose}
          onDelete={
            isNew
              ? undefined
              : () => {
                  crm.remove("deals", d.id, "Trato eliminado");
                  onClose();
                }
          }
        />
      </form>
    </Modal>
  );
}

/* ---------------- Seguimiento ---------------- */

const QUICK_DATES = [
  { label: "Hoy", days: 0 },
  { label: "Mañana", days: 1 },
  { label: "En 3 días", days: 3 },
  { label: "En 1 semana", days: 7 },
];

export function TaskDialog({ task, onClose }: { task: Partial<Task>; onClose: () => void }) {
  const crm = useCrm();
  const contacts = [...crm.data.contacts].sort((a, b) => a.name.localeCompare(b.name));
  const [t, setT] = useState({
    id: task.id ?? "",
    contact_id: task.contact_id ?? contacts[0]?.id ?? "",
    deal_id: task.deal_id ?? "",
    title: task.title ?? "",
    kind: task.kind ?? ("whatsapp" as TaskKind),
    due_date: task.due_date ?? addDays(today(), 1),
    done: task.done ?? false,
  });
  const isNew = !t.id;
  const set = (patch: Partial<typeof t>) => setT((x) => ({ ...x, ...patch }));
  const deals = crm.data.deals.filter((x) => x.contact_id === t.contact_id);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!t.contact_id) return;
    const before = crm.data.tasks.find((x) => x.id === t.id);
    const row: Task = {
      id: t.id || uid(),
      contact_id: t.contact_id,
      deal_id: deals.some((x) => x.id === t.deal_id) ? t.deal_id : null,
      title: t.title.trim(),
      kind: t.kind,
      due_date: t.due_date || today(),
      done: t.done,
      created_at: before?.created_at ?? new Date().toISOString(),
    };
    crm.save("tasks", row, isNew ? "Seguimiento agendado" : "Seguimiento guardado");
    onClose();
  }

  if (!contacts.length)
    return (
      <Modal title="Nuevo seguimiento" onClose={onClose}>
        <p className="px-5 py-6 text-sm text-(--c-mut)">Primero agrega un contacto. Los seguimientos siempre son con alguien.</p>
      </Modal>
    );

  return (
    <Modal title={isNew ? "Nuevo seguimiento" : "Editar seguimiento"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid max-h-[65dvh] grid-cols-2 gap-3.5 overflow-y-auto px-5 py-4">
          <Field label="¿Qué tienes que hacer?" htmlFor="t-title" className="col-span-2">
            <input id="t-title" required maxLength={100} autoFocus={isNew} value={t.title} onChange={(e) => set({ title: e.target.value })} className="crm-input" placeholder="Ej: Preguntar si revisó la propuesta" />
          </Field>
          <Field label="Cómo" className="col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {TASK_KINDS.map((k) => (
                <button key={k.id} type="button" aria-pressed={t.kind === k.id} onClick={() => set({ kind: k.id })} className="crm-chip">
                  <span aria-hidden>{k.icon}</span> {k.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Con quién" htmlFor="t-contact" className="col-span-2 sm:col-span-1">
            <select id="t-contact" required value={t.contact_id} onChange={(e) => set({ contact_id: e.target.value, deal_id: "" })} className="crm-input">
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trato (opcional)" htmlFor="t-deal" className="col-span-2 sm:col-span-1">
            <select id="t-deal" value={t.deal_id ?? ""} onChange={(e) => set({ deal_id: e.target.value })} className="crm-input">
              <option value="">Ninguno</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Para cuándo" htmlFor="t-due" className="col-span-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <input id="t-due" type="date" required value={t.due_date} onChange={(e) => set({ due_date: e.target.value })} className="crm-input w-auto! flex-none" />
              {QUICK_DATES.map((q) => {
                const v = addDays(today(), q.days);
                return (
                  <button key={q.label} type="button" aria-pressed={t.due_date === v} onClick={() => set({ due_date: v })} className="crm-chip">
                    {q.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <DialogFooter
          onClose={onClose}
          onDelete={
            isNew
              ? undefined
              : () => {
                  crm.remove("tasks", t.id, "Seguimiento eliminado");
                  onClose();
                }
          }
        />
      </form>
    </Modal>
  );
}
