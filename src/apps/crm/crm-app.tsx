"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./crm.css";
import { ClientDialog } from "./client-dialog";
import type { CrmStore } from "./store";
import type { Client, Stage } from "./types";
import { Avatar } from "./ui";
import { BOARD, isActive, money, relDay, stageOf, today, waLink } from "./utils";

type Props = {
  store: CrmStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

// Todo el CRM en una sola pantalla: números, lo que toca hoy y tus clientes por etapa.
export function CrmApp({ store, topBar }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [mobileStage, setMobileStage] = useState<Stage>("nuevo");
  const [showLost, setShowLost] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Los cambios se guardan en fila, uno detrás de otro.
  const queue = useRef<Promise<void>>(Promise.resolve());

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400);
  }, []);

  const load = useCallback(async () => {
    try {
      setClients(await store.list());
    } catch (e) {
      say(`No se pudieron cargar tus clientes: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [store, say]);

  useEffect(() => {
    // Se espera un instante para no actualizar la pantalla mientras se dibuja.
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  function run(task: () => Promise<void>, ok?: string) {
    queue.current = queue.current.then(async () => {
      try {
        await task();
        if (ok) say(ok);
      } catch (e) {
        say(`No se pudo guardar: ${(e as Error).message}`);
        load();
      }
    });
  }

  function save(c: Client, ok?: string) {
    setClients((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]));
    run(() => store.save(c), ok);
  }
  function remove(id: string) {
    setClients((list) => list.filter((x) => x.id !== id));
    setEditing(undefined);
    run(() => store.remove(id), "Cliente borrado");
  }
  function move(c: Client, stage: Stage) {
    if (c.stage === stage) return;
    save({ ...c, stage }, stage === "cliente" ? "¡Nuevo cliente! 🎉" : `Movido a ${stageOf(stage).label}`);
  }
  const done = (c: Client) => save({ ...c, next_step: "", next_date: null }, "¡Hecho! ✓");

  const t = today();
  const active = clients.filter(isActive);
  const won = clients.filter((c) => c.stage === "cliente");
  const lost = clients.filter((c) => c.stage === "perdido");
  const todo = clients
    .filter((c) => c.next_step && c.next_date && c.next_date <= t && c.stage !== "perdido")
    .sort((a, b) => ((a.next_date ?? "") < (b.next_date ?? "") ? -1 : 1));
  const text = q.trim().toLowerCase();
  const match = (c: Client) => !text || `${c.name} ${c.company} ${c.service}`.toLowerCase().includes(text);
  const column = (s: Stage) =>
    clients
      .filter((c) => c.stage === s && match(c))
      // primero los que tienen un próximo paso más cercano
      .sort((a, b) => (a.next_date ?? "9999").localeCompare(b.next_date ?? "9999"));

  return (
    <div className="crm">
      {topBar}
      <header className="sticky top-0 z-30 border-b-2 border-(--c-ink) bg-(--c-bg)/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="grid size-9 -rotate-6 place-items-center rounded-lg border-2 border-(--c-ink) bg-(--c-pink) text-lg shadow-[2px_2px_0_var(--c-ink)]">🤝</span>
          <span className="crm-display text-xl font-bold">Mi CRM</span>
          <button type="button" onClick={() => setEditing(null)} className="crm-btn ml-auto">
            <span className="text-lg leading-none">+</span> Nuevo cliente
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        {loading ? (
          <p className="py-20 text-center font-semibold text-(--c-mut)">Cargando…</p>
        ) : !clients.length ? (
          <div className="crm-fade mx-auto max-w-md pt-10 text-center">
            <div className="text-4xl">🤝</div>
            <h1 className="crm-display mt-3 text-2xl font-bold">Agrega tu primer cliente</h1>
            <p className="mt-2 text-(--c-mut)">Anota a quien te pide precio, en qué va y cuál es el próximo paso. Así no se te olvida nadie.</p>
            <button type="button" onClick={() => setEditing(null)} className="crm-btn mt-5">
              + Nuevo cliente
            </button>
          </div>
        ) : (
          <div className="crm-fade space-y-7">
            {/* Tres números */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <Stat color="#a8dcff" label="En proceso" value={String(active.length)} hint={active.length === 1 ? "persona" : "personas"} />
              <Stat color="var(--c-yellow)" label="En juego" value={money(active.reduce((s, c) => s + c.value, 0))} hint="si todos dicen que sí" />
              <Stat color="var(--c-mint)" label="Ganado" value={money(won.reduce((s, c) => s + c.value, 0))} hint={`${won.length} cliente${won.length === 1 ? "" : "s"}`} />
            </div>

            {/* Para hoy */}
            {todo.length > 0 && (
              <section>
                <h2 className="crm-display mb-3 text-xl font-bold">
                  Para hoy <span className="text-base text-(--c-mut)">({todo.length})</span>
                </h2>
                <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
                  {todo.map((c) => {
                    const late = (c.next_date ?? "") < t;
                    return (
                      <div key={c.id} className="crm-row flex items-center gap-3 px-3 py-2.5 sm:px-4">
                        <button type="button" onClick={() => setEditing(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <Avatar client={c} size={36} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">{c.next_step}</span>
                            <span className="block truncate text-xs text-(--c-mut)">
                              {c.name}
                              {c.company ? ` · ${c.company}` : ""} · <span className={late ? "font-bold text-(--c-red)" : ""}>{relDay(c.next_date!)}</span>
                            </span>
                          </span>
                        </button>
                        {c.phone && (
                          <a href={waLink(c.phone)} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${c.name}`} className="crm-press grid size-9 shrink-0 place-items-center rounded-lg border-2 border-(--c-ink) bg-(--c-mint)">
                            💬
                          </a>
                        )}
                        <button type="button" onClick={() => done(c)} aria-label="Hecho" className="crm-btn crm-btn-sm crm-btn-white shrink-0">
                          ✓<span className="hidden sm:inline"> Hecho</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Clientes por etapa */}
            <section>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="crm-display text-xl font-bold">Mis clientes</h2>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" aria-label="Buscar cliente" className="crm-input ml-auto h-9! w-full sm:w-56" />
              </div>

              {/* En el celular se ve una etapa a la vez */}
              <div className="crm-scroll-x -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 md:hidden">
                {BOARD.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={mobileStage === s.id}
                    onClick={() => setMobileStage(s.id)}
                    className="crm-chip"
                    style={mobileStage === s.id ? { background: s.color, color: "var(--c-ink)", boxShadow: "2px 2px 0 var(--c-ink)" } : undefined}
                  >
                    {s.label} <span className="opacity-60">{column(s.id).length}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {BOARD.map((s, i) => {
                  const list = column(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`crm-col ${mobileStage === s.id ? "" : "hidden md:flex"}`}
                      data-over={overStage === s.id ? "true" : undefined}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (overStage !== s.id) setOverStage(s.id);
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = dragId ?? e.dataTransfer.getData("text/plain");
                        const c = clients.find((x) => x.id === id);
                        if (c) move(c, s.id);
                        setDragId(null);
                        setOverStage(null);
                      }}
                    >
                      <div className="flex items-center gap-2 border-b-2 border-dashed border-(--c-ink)/20 px-3 py-2.5">
                        <span className="size-3 rounded-full border-2 border-(--c-ink)" style={{ background: s.color }} />
                        <h3 className="crm-display font-bold">{s.label}</h3>
                        <span className="text-sm font-semibold text-(--c-mut)">{list.length}</span>
                        <span className="crm-num ml-auto text-sm font-bold">{money(list.reduce((a, c) => a + c.value, 0))}</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-2.5">
                        {list.map((c) => (
                          <ClientCard
                            key={c.id}
                            client={c}
                            dragging={dragId === c.id}
                            onOpen={() => setEditing(c)}
                            onDragStart={() => setDragId(c.id)}
                            onDragEnd={() => {
                              setDragId(null);
                              setOverStage(null);
                            }}
                            onPrev={i > 0 ? () => move(c, BOARD[i - 1].id) : undefined}
                            onNext={i < BOARD.length - 1 ? () => move(c, BOARD[i + 1].id) : undefined}
                          />
                        ))}
                        {!list.length && <p className="px-2 py-6 text-center text-xs text-(--c-mut)">{s.hint}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 hidden text-xs text-(--c-mut) md:block">Arrastra una tarjeta para cambiarla de etapa, o tócala para ver y editar todo.</p>
            </section>

            {lost.length > 0 && (
              <section>
                <button type="button" onClick={() => setShowLost((v) => !v)} aria-pressed={showLost} className="crm-chip">
                  {showLost ? "Ocultar" : "Ver"} perdidos ({lost.length})
                </button>
                {showLost && (
                  <div className="crm-fade mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                    {lost.map((c) => (
                      <ClientCard key={c.id} client={c} onOpen={() => setEditing(c)} onNext={() => move(c, "hablando")} nextLabel="Reabrir" />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {editing !== undefined && (
        <ClientDialog
          client={editing}
          onClose={() => setEditing(undefined)}
          onDelete={remove}
          onSave={(c) => {
            const isNew = !clients.some((x) => x.id === c.id);
            save(c, isNew ? "Cliente agregado" : "Guardado");
            setEditing(undefined);
            if (c.stage !== "perdido") setMobileStage(c.stage);
          }}
        />
      )}

      {toast && (
        <div role="status" className="crm-pop fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border-2 border-(--c-ink) bg-(--c-yellow) px-4 py-2 text-sm font-bold whitespace-nowrap shadow-[3px_3px_0_var(--c-ink)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <div className="crm-card relative overflow-hidden p-3 sm:p-4">
      <span className="absolute inset-x-0 top-0 h-2 border-b-2 border-(--c-ink)" style={{ background: color }} />
      <p className="mt-1 text-[11px] font-bold tracking-wider text-(--c-mut) uppercase sm:text-xs">{label}</p>
      <p className="crm-num mt-1 truncate text-xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-(--c-mut) sm:text-xs">{hint}</p>
    </div>
  );
}

function ClientCard({
  client: c,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
  onPrev,
  onNext,
  nextLabel,
}: {
  client: Client;
  dragging?: boolean;
  onOpen: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
}) {
  const t = today();
  const late = c.next_date && c.next_date < t && c.stage !== "perdido";
  return (
    <article
      draggable={!!onDragStart}
      data-dragging={dragging ? "true" : undefined}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", c.id);
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      className="crm-deal"
    >
      <button type="button" onClick={onOpen} className="block w-full p-3 text-left">
        <div className="flex items-center gap-2.5">
          <Avatar client={c} size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate leading-tight font-bold">{c.name}</p>
            {c.company && <p className="truncate text-xs text-(--c-mut)">{c.company}</p>}
          </div>
        </div>
        {(c.service || c.value > 0) && (
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-sm">{c.service}</span>
            {c.value > 0 && <span className="crm-num shrink-0 font-bold">{money(c.value)}</span>}
          </div>
        )}
        {c.next_step && c.next_date && (
          <p className={`mt-2 truncate border-t-2 border-dashed border-(--c-ink)/15 pt-2 text-xs ${late ? "font-bold text-(--c-red)" : "text-(--c-mut)"}`}>
            → {c.next_step} · {relDay(c.next_date)}
          </p>
        )}
      </button>
      {(onPrev || onNext) && (
        <div className="flex border-t-2 border-(--c-ink)/10 text-xs font-bold text-(--c-mut)">
          <button type="button" disabled={!onPrev} onClick={onPrev} aria-label="Etapa anterior" className="crm-press flex-1 py-1.5 disabled:opacity-25">
            ←
          </button>
          <button type="button" disabled={!onNext} onClick={onNext} aria-label={nextLabel ?? "Etapa siguiente"} className="crm-press flex-1 border-l-2 border-(--c-ink)/10 py-1.5 disabled:opacity-25">
            {nextLabel ?? "→"}
          </button>
        </div>
      )}
    </article>
  );
}

