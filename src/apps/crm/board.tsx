"use client";

import { useState } from "react";
import type { Deal, Stage } from "./types";
import { Avatar, useCrm } from "./ui";
import { isOpen, money, relDay, STAGES, today } from "./utils";

// Tablero de tratos: una columna por etapa. Arrastra las tarjetas para moverlas
// (en el celular, toca la tarjeta y cambia la etapa, o usa las flechas).

export function Board() {
  const crm = useCrm();
  const cur = crm.currency;
  const [q, setQ] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{ stage: Stage; index: number } | null>(null);
  const [showClosed, setShowClosed] = useState(true);

  const text = q.trim().toLowerCase();
  const visible = crm.data.deals.filter((d) => {
    if (!text) return true;
    const c = crm.contactById(d.contact_id);
    return `${d.title} ${c?.name ?? ""} ${c?.company ?? ""}`.toLowerCase().includes(text);
  });
  const column = (s: Stage) => visible.filter((d) => d.stage === s).sort((a, b) => a.position - b.position);
  const stages = STAGES.filter((s) => showClosed || (s.id !== "ganado" && s.id !== "perdido"));

  /** Mueve un trato a otra etapa (y posición) y renumera la columna. */
  function move(deal: Deal, stage: Stage, index: number) {
    const col = crm.data.deals.filter((d) => d.stage === stage && d.id !== deal.id).sort((a, b) => a.position - b.position);
    const changed = deal.stage !== stage;
    const wasOpen = isOpen(deal);
    const moved: Deal = {
      ...deal,
      stage,
      closed_at: isOpen({ stage }) ? null : changed ? today() : deal.closed_at,
    };
    col.splice(Math.max(0, Math.min(index, col.length)), 0, moved);
    col.forEach((d, i) => {
      if (d.id === moved.id || d.position !== i) {
        const ok = d.id === moved.id && changed ? (stage === "ganado" ? "¡Trato ganado! 🎉" : stage === "perdido" && wasOpen ? "Marcado como perdido" : `Movido a ${STAGES.find((s) => s.id === stage)?.label}`) : undefined;
        crm.save("deals", { ...d, position: i }, ok);
      }
    });
  }

  const step = (deal: Deal, dir: 1 | -1) => {
    const i = STAGES.findIndex((s) => s.id === deal.stage);
    const next = STAGES[i + dir];
    if (next) move(deal, next.id, 999);
  };

  return (
    <div className="crm-fade">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="crm-display text-3xl font-bold">Tratos</h1>
          <p className="text-sm text-(--c-mut)">Arrastra cada trato a su etapa. Toca uno para editarlo.</p>
        </div>
        <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar trato o cliente…" className="crm-input h-10! min-w-0 flex-1 sm:w-60" aria-label="Buscar" />
          <button type="button" aria-pressed={!showClosed} onClick={() => setShowClosed((s) => !s)} className="crm-chip h-10!">
            Solo abiertos
          </button>
          <button type="button" onClick={() => crm.editDeal({})} className="crm-btn crm-btn-yellow">
            + Trato
          </button>
        </div>
      </div>

      <div className="crm-board -mx-4 px-4 sm:-mx-6 sm:px-6">
        {stages.map((s) => {
          const list = column(s.id);
          const total = list.reduce((a, d) => a + d.value, 0);
          const isOver = over?.stage === s.id;
          return (
            <section
              key={s.id}
              className="crm-col"
              data-over={isOver && dragId ? "true" : undefined}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                // Si no está sobre una tarjeta, va al final de la columna.
                if ((e.target as HTMLElement).closest("[data-deal]") == null) setOver({ stage: s.id, index: list.length });
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver((o) => (o?.stage === s.id ? null : o));
              }}
              onDrop={(e) => {
                e.preventDefault();
                const deal = crm.data.deals.find((d) => d.id === dragId);
                if (deal && over) {
                  // Si el filtro esconde tarjetas, el índice se cuenta sobre las visibles.
                  const target = list[over.index];
                  const all = crm.data.deals.filter((d) => d.stage === s.id && d.id !== deal.id).sort((a, b) => a.position - b.position);
                  const idx = target ? all.findIndex((d) => d.id === target.id) : all.length;
                  move(deal, s.id, idx === -1 ? all.length : idx);
                }
                setDragId(null);
                setOver(null);
              }}
            >
              <header className="flex items-center gap-2 border-b-2 border-dashed border-(--c-ink)/20 px-3 py-2.5">
                <span className="size-3 rounded-full border-2 border-(--c-ink)" style={{ background: s.color }} />
                <h2 className="crm-display font-bold">{s.label}</h2>
                <span className="text-sm font-semibold text-(--c-mut)">{list.length}</span>
                <span className="crm-num ml-auto text-sm font-bold">{money(total, cur, true)}</span>
              </header>
              <div className="flex flex-1 flex-col gap-2.5 p-2.5">
                {list.map((d, i) => (
                  <div key={d.id}>
                    {isOver && dragId && over.index === i && dragId !== d.id && <div className="crm-drop-line mb-2.5" />}
                    <DealCard
                      deal={d}
                      dragging={dragId === d.id}
                      onDragStart={() => setDragId(d.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOver(null);
                      }}
                      onDragOverCard={(after) => setOver({ stage: s.id, index: after ? i + 1 : i })}
                      onStep={step}
                    />
                  </div>
                ))}
                {isOver && dragId && over.index >= list.length && <div className="crm-drop-line" />}
                {!list.length && !dragId && <p className="px-2 py-6 text-center text-xs text-(--c-mut)">{s.hint}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({
  deal,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onStep,
}: {
  deal: Deal;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverCard: (after: boolean) => void;
  onStep: (d: Deal, dir: 1 | -1) => void;
}) {
  const crm = useCrm();
  const c = crm.contactById(deal.contact_id);
  const t = today();
  const pending = crm.data.tasks.filter((x) => x.deal_id === deal.id && !x.done);
  const next = pending.sort((a, b) => (a.due_date < b.due_date ? -1 : 1))[0];
  const open = isOpen(deal);
  const late = open && deal.close_date && deal.close_date < t;
  const i = STAGES.findIndex((s) => s.id === deal.stage);

  return (
    <article
      data-deal
      draggable
      data-dragging={dragging ? "true" : undefined}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", deal.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onDragOverCard(e.clientY > r.top + r.height / 2);
      }}
      className="crm-deal group"
    >
      <button type="button" onClick={() => crm.editDeal(deal)} className="block w-full p-3 text-left">
        <p className="leading-snug font-bold">{deal.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <Avatar contact={c} size={24} />
          <span className="min-w-0 flex-1 truncate text-xs text-(--c-mut)">
            {c?.name}
            {c?.company ? ` · ${c.company}` : ""}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="crm-num text-lg font-bold">{money(deal.value, crm.currency)}</span>
          {open && deal.close_date && (
            <span className={`crm-tag ml-auto ${late ? "bg-(--c-red)! text-white" : ""}`} title="Cierre esperado">
              {late ? "Vencido" : relDay(deal.close_date)}
            </span>
          )}
          {!open && deal.closed_at && <span className="ml-auto text-xs text-(--c-mut)">{relDay(deal.closed_at)}</span>}
        </div>
        {next && (
          <p className={`mt-2 truncate border-t-2 border-dashed border-(--c-ink)/15 pt-2 text-xs ${next.due_date < t ? "font-bold text-(--c-red)" : "text-(--c-mut)"}`}>
            → {next.title} · {relDay(next.due_date)}
          </p>
        )}
      </button>
      {/* Flechas para mover sin arrastrar (útil en el celular) */}
      <div className="flex border-t-2 border-(--c-ink)/10 text-xs font-bold">
        <button type="button" disabled={i === 0} onClick={() => onStep(deal, -1)} aria-label="Mover a la etapa anterior" className="crm-press flex-1 py-1.5 text-(--c-mut) disabled:opacity-25">
          ←
        </button>
        <button type="button" disabled={i === STAGES.length - 1} onClick={() => onStep(deal, 1)} aria-label="Mover a la etapa siguiente" className="crm-press flex-1 border-l-2 border-(--c-ink)/10 py-1.5 text-(--c-mut) disabled:opacity-25">
          →
        </button>
      </div>
    </article>
  );
}
