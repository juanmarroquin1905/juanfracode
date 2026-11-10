"use client";

import { useState } from "react";
import type { Task } from "./types";
import { Avatar, Empty, SectionTitle, useCrm } from "./ui";
import { addDays, daysBetween, kindOf, relDay, today } from "./utils";

// Seguimientos: lo que tienes que hacer con cada cliente, agrupado por fecha.

export function FollowUps() {
  const crm = useCrm();
  const t = today();
  const [showDone, setShowDone] = useState(false);
  const pending = crm.data.tasks.filter((x) => !x.done).sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0));
  const done = crm.data.tasks.filter((x) => x.done).sort((a, b) => (a.due_date < b.due_date ? 1 : -1));

  const groups = [
    { title: "Atrasados", color: "var(--c-red)", list: pending.filter((x) => x.due_date < t) },
    { title: "Hoy", color: "var(--c-violet)", list: pending.filter((x) => x.due_date === t) },
    { title: "Mañana", color: "var(--c-ink)", list: pending.filter((x) => x.due_date === addDays(t, 1)) },
    { title: "Esta semana", color: "var(--c-ink)", list: pending.filter((x) => daysBetween(t, x.due_date) >= 2 && daysBetween(t, x.due_date) <= 7) },
    { title: "Más adelante", color: "var(--c-ink)", list: pending.filter((x) => daysBetween(t, x.due_date) > 7) },
  ].filter((g) => g.list.length);

  return (
    <div className="crm-fade mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="crm-display text-3xl font-bold">Seguimientos</h1>
          <p className="text-sm text-(--c-mut)">El próximo paso con cada cliente. Márcalo cuando lo hagas.</p>
        </div>
        <button type="button" onClick={() => crm.editTask({})} className="crm-btn crm-btn-yellow ml-auto">
          + Agendar
        </button>
      </div>

      {groups.length ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.title}>
              <SectionTitle count={g.list.length}>
                <span style={{ color: g.color }}>{g.title}</span>
              </SectionTitle>
              <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
                {g.list.map((x) => (
                  <TaskRow key={x.id} task={x} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty icon="🎉" title="No tienes seguimientos pendientes">
          Agenda una llamada, un WhatsApp o una reunión para no dejar enfriar a tus clientes.
        </Empty>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <button type="button" onClick={() => setShowDone((s) => !s)} className="crm-chip" aria-pressed={showDone}>
            {showDone ? "Ocultar" : "Ver"} hechos ({done.length})
          </button>
          {showDone && (
            <div className="crm-card-flat crm-fade mt-3 divide-y-2 divide-(--c-ink)/10 overflow-hidden">
              {done.slice(0, 30).map((x) => (
                <TaskRow key={x.id} task={x} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Una fila de seguimiento: casilla, qué hacer, con quién y cuándo. */
export function TaskRow({ task, showContact = true }: { task: Task; showContact?: boolean }) {
  const crm = useCrm();
  const t = today();
  const c = crm.contactById(task.contact_id);
  const deal = task.deal_id ? crm.data.deals.find((d) => d.id === task.deal_id) : undefined;
  const k = kindOf(task.kind);
  const late = !task.done && task.due_date < t;

  const postpone = () => crm.save("tasks", { ...task, due_date: addDays(task.due_date < t ? t : task.due_date, 1) }, "Pasado para mañana");

  return (
    <div className={`crm-row flex items-center gap-3 px-3 py-2.5 sm:px-4 ${task.done ? "opacity-55" : ""}`}>
      <button type="button" role="checkbox" aria-checked={task.done} aria-label={task.done ? "Marcar como pendiente" : "Marcar como hecho"} onClick={() => crm.toggleTask(task)} className="crm-check">
        {task.done ? "✓" : ""}
      </button>
      {showContact && (
        <button type="button" onClick={() => c && crm.openContact(c.id)} aria-label={c ? `Ver ${c.name}` : undefined} className="crm-press hidden sm:block">
          <Avatar contact={c} size={32} />
        </button>
      )}
      <button type="button" onClick={() => crm.editTask(task)} className="min-w-0 flex-1 text-left">
        <span className={`block truncate font-semibold ${task.done ? "line-through" : ""}`}>
          <span aria-hidden className="mr-1">
            {k.icon}
          </span>
          {task.title}
        </span>
        <span className="block truncate text-xs text-(--c-mut)">
          {showContact && c ? c.name : k.label}
          {deal ? ` · ${deal.title}` : ""}
        </span>
      </button>
      <span className={`shrink-0 text-xs font-bold ${late ? "text-(--c-red)" : "text-(--c-mut)"}`}>{relDay(task.due_date)}</span>
      {!task.done && task.kind === "whatsapp" && c?.phone && (
        <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp" className="crm-press hidden size-8 shrink-0 place-items-center rounded-lg border-2 border-(--c-ink) bg-(--c-mint) text-sm sm:grid">
          💬
        </a>
      )}
      {!task.done && (
        <button type="button" onClick={postpone} title="Pasar para mañana" aria-label="Pasar para mañana" className="crm-press grid size-8 shrink-0 place-items-center rounded-lg border-2 border-(--c-ink) bg-white text-xs font-bold">
          +1
        </button>
      )}
    </div>
  );
}
