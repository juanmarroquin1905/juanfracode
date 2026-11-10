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
    save({ ...c, stage }, stage === "cliente" ? "¡Felicidades, nuevo cliente! 🎉" : `${stageOf(stage).emoji} Ahora en ${stageOf(stage).label}`);
  }
  const done = (c: Client) => save({ ...c, next_step: "", next_date: null }, "¡Bien hecho! ✓");

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
      <header className="sticky top-0 z-30 border-b border-(--c-line) bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
          <span className="grid size-10 place-items-center rounded-2xl bg-(--c-pink) text-xl shadow-sm">🤝</span>
          <span className="crm-display text-xl">Mi CRM</span>
          <button type="button" onClick={() => setEditing(null)} className="crm-btn ml-auto">
            <span className="text-lg leading-none">+</span> <span className="hidden sm:inline">Agregar</span> cliente
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        {loading ? (
          <p className="py-20 text-center font-semibold text-(--c-mut)">Cargando tus clientes…</p>
        ) : !clients.length ? (
          <div className="crm-fade crm-card mx-auto max-w-md px-6 py-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-(--c-violet-soft) text-4xl">👋</div>
            <h1 className="crm-display mt-4 text-2xl">¡Bienvenido a tu CRM!</h1>
            <p className="mt-2 leading-relaxed text-(--c-mut)">Aquí anotas a cada persona que te pide precio, en qué va y qué sigue. Así no se te escapa ningún cliente.</p>
            <button type="button" onClick={() => setEditing(null)} className="crm-btn mt-6">
              + Agregar mi primer cliente
            </button>
          </div>
        ) : (
          <div className="crm-fade space-y-8">
            <div>
              <h1 className="crm-display text-3xl sm:text-4xl">{greeting()} 👋</h1>
              <p className="mt-1 text-(--c-mut)">
                {todo.length
                  ? `Hoy te toca hablar con ${todo.length} ${todo.length === 1 ? "persona" : "personas"}. ¡Tú puedes!`
                  : "Todo al día. Aquí tienes cómo van tus clientes."}
              </p>
            </div>

            <Guide />

            {/* Tres números */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <Stat emoji="👥" bg="#cdeafe" label="Conversando" value={String(active.length)} hint={active.length === 1 ? "persona interesada" : "personas interesadas"} />
              <Stat emoji="💰" bg="#fff1b8" label="Podrías ganar" value={money(active.reduce((s, c) => s + c.value, 0))} hint="si todos dicen que sí" />
              <Stat emoji="🎉" bg="#c9f2dd" label="Ya ganaste" value={money(won.reduce((s, c) => s + c.value, 0))} hint={`con ${won.length} cliente${won.length === 1 ? "" : "s"}`} />
            </div>

            {/* Para hoy */}
            {todo.length > 0 && (
              <section>
                <h2 className="crm-display text-xl">📅 Para hoy</h2>
                <p className="mb-3 text-sm text-(--c-mut)">Escríbeles hoy. Cuando lo hagas, toca “Listo”.</p>
                <div className="crm-card overflow-hidden">
                  {todo.map((c) => {
                    const late = (c.next_date ?? "") < t;
                    return (
                      <div key={c.id} className="crm-row flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-(--c-line) px-4 py-3 first:border-t-0">
                        <button type="button" onClick={() => setEditing(c)} className="flex min-w-0 flex-1 basis-56 items-center gap-3 text-left">
                          <Avatar client={c} size={40} />
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold leading-snug">{c.next_step}</span>
                            <span className="block truncate text-sm text-(--c-mut)">
                              con {c.name} ·{" "}
                              <span className={late ? "font-bold text-(--c-red)" : ""}>{late ? `se pasó (${relDay(c.next_date!).toLowerCase()})` : relDay(c.next_date!).toLowerCase()}</span>
                            </span>
                          </span>
                        </button>
                        <div className="ml-auto flex gap-2">
                          {c.phone && (
                            <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="crm-btn crm-btn-sm crm-btn-soft">
                              💬 WhatsApp
                            </a>
                          )}
                          <button type="button" onClick={() => done(c)} className="crm-btn crm-btn-sm">
                            ✓ Listo
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Clientes por etapa */}
            <section>
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div>
                  <h2 className="crm-display text-xl">🗂️ Mis clientes</h2>
                  <p className="text-sm text-(--c-mut)">Cada columna es un paso. Avanza a cada persona hasta que sea tu cliente.</p>
                </div>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Buscar por nombre…" aria-label="Buscar cliente" className="crm-input ml-auto h-10! w-full sm:w-60" />
              </div>

              {/* En el celular se ve una etapa a la vez */}
              <div className="crm-scroll-x -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 md:hidden">
                {BOARD.map((s) => (
                  <button key={s.id} type="button" aria-pressed={mobileStage === s.id} onClick={() => setMobileStage(s.id)} className="crm-chip">
                    {s.emoji} {s.label} <span className="opacity-60">{column(s.id).length}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {BOARD.map((s, i) => {
                  const list = column(s.id);
                  const next = BOARD[i + 1];
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
                      <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
                        <span className="grid size-8 place-items-center rounded-xl text-base" style={{ background: s.color }}>
                          {s.emoji}
                        </span>
                        <h3 className="crm-display text-[15px]">{s.label}</h3>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-(--c-mut)">{list.length}</span>
                        {list.length > 0 && <span className="crm-num ml-auto text-sm text-(--c-mut)">{money(list.reduce((a, c) => a + c.value, 0))}</span>}
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-2.5 pt-1">
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
                            nextLabel={next ? `Pasar a ${next.label}` : undefined}
                            onNext={next ? () => move(c, next.id) : undefined}
                          />
                        ))}
                        {!list.length && <p className="rounded-2xl border-2 border-dashed border-(--c-line) px-3 py-6 text-center text-sm text-(--c-mut)">{s.hint}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 hidden text-sm text-(--c-mut) md:block">💡 Tip: también puedes arrastrar una tarjeta a otra columna. Toca un cliente para ver o cambiar sus datos.</p>
            </section>

            {lost.length > 0 && (
              <section>
                <button type="button" onClick={() => setShowLost((v) => !v)} aria-pressed={showLost} className="crm-chip">
                  💤 {showLost ? "Ocultar" : "Ver"} los que no se dieron ({lost.length})
                </button>
                {showLost && (
                  <div className="crm-fade mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                    {lost.map((c) => (
                      <ClientCard key={c.id} client={c} onOpen={() => setEditing(c)} onNext={() => move(c, "hablando")} nextLabel="Volver a intentar" />
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
            save(c, isNew ? "¡Cliente agregado! 🙌" : "Guardado ✓");
            setEditing(undefined);
            if (c.stage !== "perdido") setMobileStage(c.stage);
          }}
        />
      )}

      {toast && (
        <div role="status" className="crm-pop fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-(--c-ink) px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "¡Buenos días!" : h < 19 ? "¡Buenas tardes!" : "¡Buenas noches!";
}

/** Guía de 3 pasos. Se puede cerrar y no vuelve a salir en este navegador. */
const GUIDE_KEY = "crm-guia-cerrada";
function Guide() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setOpen(localStorage.getItem(GUIDE_KEY) !== "1");
      } catch {
        setOpen(true);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);
  if (!open) return null;
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {}
  };
  const steps = [
    { n: "1", title: "Anota a la persona", text: "Cuando alguien te pida precio, agrégalo con el botón morado de arriba." },
    { n: "2", title: "Ponle un próximo paso", text: "¿Qué sigue y cuándo? Te lo recordamos en “Para hoy”." },
    { n: "3", title: "Avánzalo de columna", text: "De Nuevo a Cliente, a medida que avanza la conversación." },
  ];
  return (
    <section className="crm-card relative bg-(--c-violet-soft)! p-4 sm:p-5">
      <button type="button" onClick={close} aria-label="Cerrar guía" className="crm-press absolute top-3 right-3 grid size-8 place-items-center rounded-full text-(--c-mut) hover:bg-white">
        ✕
      </button>
      <p className="crm-display pr-8">¿Cómo se usa? Es muy fácil:</p>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-3 rounded-2xl bg-white p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--c-violet) text-sm font-extrabold text-white">{s.n}</span>
            <span>
              <span className="block font-bold">{s.title}</span>
              <span className="block text-sm text-(--c-mut)">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stat({ emoji, bg, label, value, hint }: { emoji: string; bg: string; label: string; value: string; hint: string }) {
  return (
    <div className="crm-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3.5 sm:p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl text-xl sm:size-12 sm:text-2xl" style={{ background: bg }}>
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-(--c-mut) sm:text-sm">{label}</p>
        <p className="crm-num truncate text-xl leading-tight sm:text-[28px]">{value}</p>
        <p className="hidden truncate text-xs text-(--c-mut) sm:block">{hint}</p>
      </div>
    </div>
  );
}

function ClientCard({
  client: c,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
  onNext,
  nextLabel,
}: {
  client: Client;
  dragging?: boolean;
  onOpen: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
      <button type="button" onClick={onOpen} className="block w-full p-3.5 text-left">
        <div className="flex items-center gap-2.5">
          <Avatar client={c} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate leading-tight font-bold">{c.name}</p>
            {c.company && <p className="truncate text-xs text-(--c-mut)">{c.company}</p>}
          </div>
        </div>
        {(c.service || c.value > 0) && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-(--c-bg) px-2.5 py-2">
            <span className="min-w-0 flex-1 truncate text-sm">{c.service || "Sin detalle"}</span>
            {c.value > 0 && <span className="crm-num shrink-0 text-sm">{money(c.value)}</span>}
          </div>
        )}
        {c.next_step && c.next_date && (
          <p className={`mt-2.5 text-xs leading-snug ${late ? "font-bold text-(--c-red)" : "text-(--c-mut)"}`}>
            ⏰ {c.next_step} · {relDay(c.next_date).toLowerCase()}
          </p>
        )}
      </button>
      {onNext && (
        <div className="px-3.5 pb-3">
          <button type="button" onClick={onNext} className="crm-btn crm-btn-sm crm-btn-soft w-full">
            {nextLabel} →
          </button>
        </div>
      )}
    </article>
  );
}
