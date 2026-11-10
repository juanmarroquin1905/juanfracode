"use client";

import { useState } from "react";
import { TaskRow } from "./followups";
import type { Contact } from "./types";
import { Avatar, Empty, SectionTitle, StageTag, useCrm } from "./ui";
import { exportContactsCSV, isOpen, money, pendingTasks, relDay, shortDate, telLink, today, uid, waLink } from "./utils";

// Contactos: la lista con buscador y etiquetas, y la ficha de cada cliente.

export function ContactsView({ openId, onBack }: { openId: string | null; onBack: () => void }) {
  const crm = useCrm();
  const contact = openId ? crm.contactById(openId) : undefined;
  if (contact) return <ContactDetail key={contact.id} contact={contact} onBack={onBack} />;
  return <ContactList />;
}

type Sort = "reciente" | "nombre" | "valor";

function ContactList() {
  const crm = useCrm();
  const { contacts, deals, tasks } = crm.data;
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("reciente");
  const tags = [...new Set(contacts.flatMap((c) => c.tags))].sort();

  const info = (c: Contact) => {
    const mine = deals.filter((d) => d.contact_id === c.id);
    return {
      openValue: mine.filter(isOpen).reduce((s, d) => s + d.value, 0),
      won: mine.filter((d) => d.stage === "ganado").reduce((s, d) => s + d.value, 0),
      next: pendingTasks(tasks.filter((x) => x.contact_id === c.id))[0],
    };
  };

  const text = q.trim().toLowerCase();
  const list = contacts
    .filter((c) => (!tag || c.tags.includes(tag)) && (!text || `${c.name} ${c.company} ${c.email} ${c.phone} ${c.tags.join(" ")}`.toLowerCase().includes(text)))
    .map((c) => ({ c, ...info(c) }))
    .sort((a, b) =>
      sort === "nombre" ? a.c.name.localeCompare(b.c.name) : sort === "valor" ? b.openValue + b.won - (a.openValue + a.won) : a.c.created_at < b.c.created_at ? 1 : -1,
    );

  return (
    <div className="crm-fade">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="crm-display text-3xl font-bold">Contactos</h1>
          <p className="text-sm text-(--c-mut)">
            {contacts.length} cliente{contacts.length === 1 ? "" : "s"} y prospecto{contacts.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {contacts.length > 0 && (
            <button type="button" onClick={() => exportContactsCSV(contacts, deals, crm.currency)} className="crm-btn crm-btn-white">
              ⤓ Excel
            </button>
          )}
          <button type="button" onClick={() => crm.editContact(null)} className="crm-btn crm-btn-yellow">
            + Contacto
          </button>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, empresa, correo…" className="crm-input min-w-0 flex-1" aria-label="Buscar contacto" />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="crm-input w-auto!" aria-label="Ordenar">
              <option value="reciente">Recientes</option>
              <option value="nombre">A-Z</option>
              <option value="valor">Más valor</option>
            </select>
          </div>
          {tags.length > 0 && (
            <div className="crm-scroll-x -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <button type="button" aria-pressed={!tag} onClick={() => setTag(null)} className="crm-chip">
                Todos
              </button>
              {tags.map((t) => (
                <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)} className="crm-chip">
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!contacts.length ? (
        <Empty icon="☺" title="Aún no tienes contactos">
          Agrega a tus clientes y a quienes te preguntan por tus servicios.
        </Empty>
      ) : !list.length ? (
        <Empty icon="🔍" title="No encontré a nadie con eso" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ c, openValue, won, next }) => (
            <button key={c.id} type="button" onClick={() => crm.openContact(c.id)} className="crm-card crm-deal block p-4 text-left">
              <div className="flex items-center gap-3">
                <Avatar contact={c} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="crm-display truncate text-lg leading-tight font-bold">{c.name}</p>
                  <p className="truncate text-sm text-(--c-mut)">{c.company || c.email || c.phone || "Sin datos de contacto"}</p>
                </div>
              </div>
              {c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <span key={t} className="crm-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t-2 border-dashed border-(--c-ink)/15 pt-3 text-xs">
                <div>
                  <p className="text-(--c-mut)">En juego</p>
                  <p className="crm-num text-sm font-bold">{openValue ? money(openValue, crm.currency, true) : "—"}</p>
                </div>
                <div>
                  <p className="text-(--c-mut)">Ganado</p>
                  <p className="crm-num text-sm font-bold">{won ? money(won, crm.currency, true) : "—"}</p>
                </div>
              </div>
              {next && (
                <p className={`mt-2 truncate text-xs ${next.due_date < today() ? "font-bold text-(--c-red)" : "text-(--c-mut)"}`}>
                  → {next.title} · {relDay(next.due_date)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Ficha del contacto ---------------- */

function ContactDetail({ contact: c, onBack }: { contact: Contact; onBack: () => void }) {
  const crm = useCrm();
  const deals = crm.data.deals.filter((d) => d.contact_id === c.id).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const tasks = pendingTasks(crm.data.tasks.filter((x) => x.contact_id === c.id));
  const [note, setNote] = useState("");

  // Historial: notas y seguimientos hechos, del más nuevo al más viejo.
  const history = [
    ...crm.data.notes.filter((n) => n.contact_id === c.id).map((n) => ({ kind: "note" as const, id: n.id, date: n.date, text: n.text, deal: n.deal_id, at: n.created_at })),
    ...crm.data.tasks.filter((x) => x.contact_id === c.id && x.done).map((x) => ({ kind: "task" as const, id: x.id, date: x.due_date, text: x.title, deal: x.deal_id, at: x.created_at })),
    ...deals.filter((d) => d.closed_at).map((d) => ({ kind: d.stage === "ganado" ? ("won" as const) : ("lost" as const), id: `c-${d.id}`, date: d.closed_at!, text: d.title, deal: d.id, at: d.closed_at! })),
  ].sort((a, b) => (a.date === b.date ? (a.at < b.at ? 1 : -1) : a.date < b.date ? 1 : -1));

  const won = deals.filter((d) => d.stage === "ganado").reduce((s, d) => s + d.value, 0);
  const open = deals.filter(isOpen).reduce((s, d) => s + d.value, 0);

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    crm.save("notes", { id: uid(), contact_id: c.id, deal_id: null, text, date: today(), created_at: new Date().toISOString() }, "Nota guardada");
    setNote("");
  }

  const actions = [
    c.phone && { label: "WhatsApp", icon: "💬", href: waLink(c.phone), bg: "var(--c-mint)" },
    c.phone && { label: "Llamar", icon: "📞", href: telLink(c.phone), bg: "var(--c-yellow)" },
    c.email && { label: "Correo", icon: "✉️", href: `mailto:${c.email}`, bg: "#a8dcff" },
  ].filter(Boolean) as { label: string; icon: string; href: string; bg: string }[];

  return (
    <div className="crm-fade">
      <button type="button" onClick={onBack} className="crm-press mb-4 text-sm font-bold text-(--c-violet)">
        ← Contactos
      </button>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Tarjeta del contacto */}
        <aside className="space-y-4">
          <div className="crm-card overflow-hidden">
            <div className="h-16 border-b-2 border-(--c-ink)" style={{ background: c.color }} />
            <div className="-mt-9 px-5 pb-5">
              <Avatar contact={{ name: c.name, color: "#fff" }} size={64} />
              <h1 className="crm-display mt-2 text-2xl leading-tight font-bold">{c.name}</h1>
              {c.company && <p className="text-(--c-mut)">{c.company}</p>}
              {c.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <span key={t} className="crm-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {actions.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {actions.map((a) => (
                    <a key={a.label} href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="crm-btn crm-btn-sm min-w-0 px-1.5! text-(--c-ink)!" style={{ background: a.bg }}>
                      <span aria-hidden>{a.icon}</span> {a.label}
                    </a>
                  ))}
                </div>
              )}
              <dl className="mt-4 space-y-2 text-sm">
                {c.phone && <Row label="Teléfono" value={c.phone} />}
                {c.email && <Row label="Correo" value={c.email} />}
                {c.source && <Row label="Llegó por" value={c.source} />}
                {c.created_at && <Row label="Desde" value={shortDate(c.created_at.slice(0, 10)) + " " + c.created_at.slice(0, 4)} />}
              </dl>
              {c.notes && <p className="mt-4 rounded-lg border-2 border-dashed border-(--c-ink)/25 bg-(--c-bg) p-3 text-sm whitespace-pre-line">{c.notes}</p>}
              <button type="button" onClick={() => crm.editContact(c)} className="crm-btn crm-btn-white mt-4 w-full">
                Editar contacto
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="crm-card p-3">
              <p className="text-xs font-bold text-(--c-mut) uppercase">En juego</p>
              <p className="crm-num text-xl font-bold">{money(open, crm.currency, true)}</p>
            </div>
            <div className="crm-card p-3" style={{ background: won ? "var(--c-mint)" : undefined }}>
              <p className="text-xs font-bold text-(--c-mut) uppercase">Te ha pagado</p>
              <p className="crm-num text-xl font-bold">{money(won, crm.currency, true)}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-7">
          {/* Tratos */}
          <section>
            <SectionTitle
              count={deals.length}
              right={
                <button type="button" onClick={() => crm.editDeal({ contact_id: c.id })} className="crm-btn crm-btn-sm crm-btn-yellow">
                  + Trato
                </button>
              }
            >
              Tratos
            </SectionTitle>
            {deals.length ? (
              <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
                {deals.map((d) => (
                  <button key={d.id} type="button" onClick={() => crm.editDeal(d)} className="crm-row flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{d.title}</span>
                      {d.notes && <span className="block truncate text-xs text-(--c-mut)">{d.notes}</span>}
                    </span>
                    <StageTag stage={d.stage} />
                    <span className="crm-num w-20 text-right font-bold">{money(d.value, crm.currency, true)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <Empty icon="▦" title="Sin tratos todavía">
                Crea uno cuando te pida precio o le ofrezcas algo.
              </Empty>
            )}
          </section>

          {/* Próximos pasos */}
          <section>
            <SectionTitle
              count={tasks.length}
              right={
                <button type="button" onClick={() => crm.editTask({ contact_id: c.id })} className="crm-btn crm-btn-sm crm-btn-yellow">
                  + Seguimiento
                </button>
              }
            >
              Próximos pasos
            </SectionTitle>
            {tasks.length ? (
              <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
                {tasks.map((x) => (
                  <TaskRow key={x.id} task={x} showContact={false} />
                ))}
              </div>
            ) : (
              <Empty icon="⏰" title="No hay nada agendado">
                ¿Cuándo le vuelves a escribir? Agéndalo para no olvidarte.
              </Empty>
            )}
          </section>

          {/* Historial */}
          <section>
            <SectionTitle>Historial</SectionTitle>
            <form onSubmit={addNote} className="mb-4 flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="¿Qué hablaron? Escribe una nota…" className="crm-input min-w-0 flex-1" aria-label="Nueva nota" />
              <button type="submit" className="crm-btn" disabled={!note.trim()}>
                Anotar
              </button>
            </form>
            {history.length ? (
              <ol className="relative space-y-3 border-l-2 border-(--c-ink) pl-5">
                {history.map((h) => {
                  const deal = h.deal ? crm.data.deals.find((d) => d.id === h.deal) : undefined;
                  const dot = h.kind === "won" ? "var(--c-mint)" : h.kind === "lost" ? "#d6d1e0" : h.kind === "task" ? "var(--c-yellow)" : "#fff";
                  return (
                    <li key={h.id} className="relative">
                      <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-(--c-ink)" style={{ background: dot }} />
                      <div className="flex items-baseline gap-2 text-xs text-(--c-mut)">
                        <span className="font-bold">{relDay(h.date)}</span>
                        {h.kind === "won" && <span className="crm-tag bg-(--c-mint)!">Ganado</span>}
                        {h.kind === "lost" && <span className="crm-tag">Perdido</span>}
                        {h.kind === "task" && <span>✓ Hecho</span>}
                        {deal && h.kind !== "won" && h.kind !== "lost" && <span className="truncate">· {deal.title}</span>}
                        {h.kind === "note" && (
                          <button type="button" onClick={() => crm.remove("notes", h.id, "Nota borrada")} className="ml-auto text-(--c-mut) hover:text-(--c-red)" aria-label="Borrar nota">
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm">{h.text}</p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-(--c-mut)">Aquí verás tus notas, lo que ya hiciste y los tratos cerrados.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-(--c-mut)">{label}</dt>
      <dd className="min-w-0 truncate font-semibold">{value}</dd>
    </div>
  );
}
