"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./crm.css";
import { Board } from "./board";
import { ContactsView } from "./contacts";
import { Dashboard } from "./dashboard";
import { ContactDialog, DealDialog, TaskDialog } from "./dialogs";
import { FollowUps } from "./followups";
import type { CrmStore } from "./store";
import type { Contact, CrmData, Deal, ListName, Rows, Task } from "./types";
import { CrmContext, type Crm } from "./ui";
import { CURRENCIES, loadCurrency, saveCurrency, today } from "./utils";

type Props = {
  store: CrmStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

type Tab = "resumen" | "tratos" | "contactos" | "seguimientos";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "resumen", label: "Resumen", icon: "✦" },
  { id: "tratos", label: "Tratos", icon: "▦" },
  { id: "contactos", label: "Contactos", icon: "☺" },
  { id: "seguimientos", label: "Seguimientos", icon: "✓" },
];

const EMPTY: CrmData = { contacts: [], deals: [], tasks: [], notes: [] };

/** Aplica un cambio a los datos en pantalla (igual que lo hace la base de datos). */
function applySave<L extends ListName>(d: CrmData, list: L, row: Rows[L]): CrmData {
  const rows = d[list] as Rows[L][];
  const i = rows.findIndex((x) => x.id === row.id);
  return { ...d, [list]: i === -1 ? [...rows, row] : rows.map((x) => (x.id === row.id ? row : x)) };
}
function applyRemove(d: CrmData, list: ListName, id: string): CrmData {
  if (list === "contacts")
    return {
      contacts: d.contacts.filter((x) => x.id !== id),
      deals: d.deals.filter((x) => x.contact_id !== id),
      tasks: d.tasks.filter((x) => x.contact_id !== id),
      notes: d.notes.filter((x) => x.contact_id !== id),
    };
  if (list === "deals")
    return {
      ...d,
      deals: d.deals.filter((x) => x.id !== id),
      tasks: d.tasks.map((x) => (x.deal_id === id ? { ...x, deal_id: null } : x)),
      notes: d.notes.map((x) => (x.deal_id === id ? { ...x, deal_id: null } : x)),
    };
  return { ...d, [list]: (d[list] as { id: string }[]).filter((x) => x.id !== id) };
}

export function CrmApp({ store, topBar }: Props) {
  const [data, setData] = useState<CrmData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("resumen");
  const [contactId, setContactId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [toast, setToast] = useState<string | null>(null);
  const [editContact, setEditContact] = useState<Contact | null | undefined>(undefined);
  const [editDeal, setEditDeal] = useState<Partial<Deal> | null>(null);
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null);
  const [menu, setMenu] = useState(false);
  // Los cambios se guardan en fila, uno detrás de otro (ej: primero el contacto y luego su trato).
  const queue = useRef<Promise<void>>(Promise.resolve());

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const load = useCallback(async () => {
    try {
      setData(await store.load());
    } catch (e) {
      say(`No se pudieron cargar tus datos: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [store, say]);

  useEffect(() => {
    // Se espera un instante para no actualizar la pantalla mientras se dibuja.
    const t = setTimeout(() => {
      setCurrency(loadCurrency());
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const run = useCallback(
    (task: () => Promise<void>, ok?: string) => {
      queue.current = queue.current.then(async () => {
        try {
          await task();
          if (ok) say(ok);
        } catch (e) {
          say(`No se pudo guardar: ${(e as Error).message}`);
          load();
        }
      });
    },
    [say, load],
  );

  const crm: Crm = useMemo(() => {
    const byId = new Map(data.contacts.map((c) => [c.id, c]));
    return {
      data,
      currency,
      save: (list, row, ok) => {
        setData((d) => applySave(d, list, row));
        run(() => store.save(list, row), ok);
      },
      remove: (list, id, ok) => {
        setData((d) => applyRemove(d, list, id));
        if (list === "contacts") setContactId((c) => (c === id ? null : c));
        run(() => store.remove(list, id), ok);
      },
      openContact: (id) => {
        setContactId(id);
        setTab("contactos");
        window.scrollTo({ top: 0 });
      },
      editContact: (c) => setEditContact(c),
      editDeal: (d) => setEditDeal(d),
      editTask: (t) => setEditTask(t),
      toggleTask: (t) => {
        const row = { ...t, done: !t.done };
        setData((d) => applySave(d, "tasks", row));
        run(() => store.save("tasks", row), row.done ? "¡Hecho! ✓" : undefined);
      },
      contactById: (id) => byId.get(id),
    };
  }, [data, currency, run, store]);

  const late = data.tasks.filter((t) => !t.done && t.due_date <= today()).length;
  const go = (t: Tab) => {
    setTab(t);
    setContactId(null);
  };

  return (
    <CrmContext.Provider value={crm}>
      <div className="crm">
        {topBar}
        <header className="sticky top-0 z-30 border-b-2 border-(--c-ink) bg-(--c-bg)/92 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
            <button type="button" onClick={() => go("resumen")} className="crm-press flex items-center gap-2">
              <span className="grid size-9 -rotate-6 place-items-center rounded-lg border-2 border-(--c-ink) bg-(--c-pink) text-lg shadow-[2px_2px_0_var(--c-ink)]">🤝</span>
              <span className="crm-display text-xl font-bold">Mi CRM</span>
            </button>
            <nav className="crm-scroll-x ml-2 hidden gap-1 overflow-x-auto md:flex" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => go(t.id)} className="crm-tab">
                  {t.label}
                  {t.id === "seguimientos" && late > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-(--c-red) px-1 text-[11px] text-white">{late}</span>}
                </button>
              ))}
            </nav>
            <div className="relative ml-auto">
              <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className="crm-btn">
                <span className="text-lg leading-none">+</span> Nuevo
              </button>
              {menu && (
                <>
                  <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenu(false)} />
                  <div className="crm-card crm-fade absolute right-0 z-50 mt-2 w-52 overflow-hidden p-1.5">
                    {[
                      { label: "Contacto", icon: "☺", fn: () => setEditContact(null) },
                      { label: "Trato", icon: "▦", fn: () => setEditDeal({}) },
                      { label: "Seguimiento", icon: "✓", fn: () => setEditTask(contactId ? { contact_id: contactId } : {}) },
                    ].map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => {
                          setMenu(false);
                          o.fn();
                        }}
                        className="crm-row flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-semibold"
                      >
                        <span className="grid size-7 place-items-center rounded-md border-2 border-(--c-ink) bg-(--c-yellow) text-sm">{o.icon}</span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 sm:pt-7 md:pb-16">
          {loading ? (
            <p className="py-20 text-center font-semibold text-(--c-mut)">Cargando…</p>
          ) : tab === "resumen" ? (
            <Dashboard onGo={go} />
          ) : tab === "tratos" ? (
            <Board />
          ) : tab === "contactos" ? (
            <ContactsView openId={contactId} onBack={() => setContactId(null)} />
          ) : (
            <FollowUps />
          )}

          {!loading && tab === "resumen" && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-(--c-mut)">
              <label htmlFor="crm-cur">Moneda:</label>
              <select
                id="crm-cur"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  saveCurrency(e.target.value);
                }}
                className="crm-input h-8! w-auto! px-2! text-sm!"
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </main>

        {/* Pestañas abajo en el celular */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-(--c-ink) bg-white pb-[env(safe-area-inset-bottom)] md:hidden" role="tablist">
          <div className="grid grid-cols-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => go(t.id)}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${tab === t.id ? "text-(--c-ink)" : "text-(--c-mut)"}`}
              >
                <span className={`grid h-7 w-11 place-items-center rounded-full text-base ${tab === t.id ? "border-2 border-(--c-ink) bg-(--c-yellow)" : ""}`}>{t.icon}</span>
                {t.label}
                {t.id === "seguimientos" && late > 0 && (
                  <span className="absolute top-1 right-[calc(50%-24px)] grid h-4 min-w-4 place-items-center rounded-full bg-(--c-red) px-1 text-[10px] text-white">{late}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {editContact !== undefined && <ContactDialog contact={editContact} onClose={() => setEditContact(undefined)} />}
        {editDeal && <DealDialog deal={editDeal} onClose={() => setEditDeal(null)} />}
        {editTask && <TaskDialog task={editTask} onClose={() => setEditTask(null)} />}

        {toast && (
          <div role="status" className="crm-pop fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl border-2 border-(--c-ink) bg-(--c-yellow) px-4 py-2 text-sm font-bold shadow-[3px_3px_0_var(--c-ink)] md:bottom-6">
            {toast}
          </div>
        )}
      </div>
    </CrmContext.Provider>
  );
}
