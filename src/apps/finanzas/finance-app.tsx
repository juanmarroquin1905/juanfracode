"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Donut, EXPENSE, FlowChart, INCOME, type Slice } from "./charts";
import { defaultCategories, PALETTE } from "./seed";
import type { FinanceStore } from "./store";
import type { Category, Kind, Transaction } from "./types";
import {
  buckets,
  CURRENCIES,
  dayTitle,
  downloadCSV,
  monthKey,
  monthLabel,
  money,
  shiftMonth,
  today,
  uid,
  type Grain,
} from "./utils";

type Tab = "resumen" | "movimientos" | "categorias";
const CURRENCY_KEY = "finanzas-moneda";
const EMOJIS = ["🛒", "🏠", "🚌", "🍿", "💡", "💊", "📺", "🎓", "👕", "🐶", "✈️", "🎮", "🍔", "⛽", "💼", "🧾", "🎁", "💰", "📈", "🏦"];

type Props = {
  store: FinanceStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

export function FinanceApp({ store, topBar }: Props) {
  const [cats, setCats] = useState<Category[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [month, setMonth] = useState(() => monthKey(today()));
  const [currency, setCurrency] = useState("USD");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const load = useCallback(async () => {
    try {
      let c = await store.listCategories();
      if (c.length === 0) {
        c = defaultCategories();
        for (const cat of c) await store.saveCategory(cat);
      }
      setCats(c);
      setTxs(await store.listTransactions());
    } catch (e) {
      say(`No se pudieron cargar los datos: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [store, say]);

  useEffect(() => {
    // Se espera un instante para no actualizar la pantalla mientras se dibuja.
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(CURRENCY_KEY);
        if (saved) setCurrency(saved);
      } catch {}
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const changeCurrency = (c: string) => {
    setCurrency(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {}
  };

  // Guardar y borrar: la pantalla cambia al instante y luego se guarda.
  async function run(task: () => Promise<void>, ok: string) {
    try {
      await task();
      say(ok);
    } catch (e) {
      say(`No se pudo guardar: ${(e as Error).message}`);
      load();
    }
  }
  const saveTx = (t: Transaction) => {
    setTxs((list) => [t, ...list.filter((x) => x.id !== t.id)]);
    setEditTx(null);
    run(() => store.saveTransaction(t), "Movimiento guardado");
  };
  const deleteTx = (id: string) => {
    setTxs((list) => list.filter((x) => x.id !== id));
    setEditTx(null);
    run(() => store.deleteTransaction(id), "Movimiento eliminado");
  };
  const saveCat = (c: Category) => {
    setCats((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]));
    setEditCat(null);
    run(() => store.saveCategory(c), "Categoría guardada");
  };
  const deleteCat = (id: string) => {
    setCats((list) => list.filter((x) => x.id !== id));
    setTxs((list) => list.map((t) => (t.category_id === id ? { ...t, category_id: null } : t)));
    setEditCat(null);
    run(() => store.deleteCategory(id), "Categoría eliminada");
  };

  const newTx = (kind: Kind = "egreso") =>
    setEditTx({ id: "", kind, amount: 0, category_id: null, note: "", date: month === monthKey(today()) ? today() : `${month}-01` });

  const catById = useMemo(() => new Map(cats.map((c) => [c.id, c])), [cats]);
  const monthTxs = useMemo(() => txs.filter((t) => monthKey(t.date) === month), [txs, month]);

  return (
    <div className="min-h-screen font-ui text-ink">
      {topBar}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 sm:pt-7">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-[#1d4ed8] to-[#06b6d4] text-lg text-white shadow-[0_6px_18px_-8px_rgba(29,78,216,0.7)]">
              $
            </span>
            <div>
              <h1 className="font-sans text-xl leading-tight font-semibold tracking-[-0.02em]">Mis finanzas</h1>
              <p className="text-xs text-mut">Ingresos y egresos en un solo lugar</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              aria-label="Moneda"
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="h-9 rounded-full border border-line bg-white/80 px-3 text-sm text-ink outline-none focus:border-accent"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.label}
                </option>
              ))}
            </select>
            <span className="hidden sm:inline">
              <button type="button" onClick={() => newTx()} className="btn h-9 py-0">
                + Movimiento
              </button>
            </span>
          </div>
        </div>

        {/* Mes y pestañas */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="glass flex items-center rounded-full p-1">
            <button type="button" aria-label="Mes anterior" onClick={() => setMonth((m) => shiftMonth(m, -1))} className="press grid size-8 place-items-center rounded-full text-mut hover:bg-soft hover:text-ink">
              ‹
            </button>
            <span className="min-w-36 text-center text-sm font-semibold">{monthLabel(month)}</span>
            <button type="button" aria-label="Mes siguiente" onClick={() => setMonth((m) => shiftMonth(m, 1))} className="press grid size-8 place-items-center rounded-full text-mut hover:bg-soft hover:text-ink">
              ›
            </button>
          </div>
          {month !== monthKey(today()) && (
            <button type="button" onClick={() => setMonth(monthKey(today()))} className="text-sm font-medium text-accent">
              Volver a este mes
            </button>
          )}
          <nav className="glass flex rounded-full p-1 sm:ml-auto" aria-label="Secciones">
            {(
              [
                ["resumen", "Resumen"],
                ["movimientos", "Movimientos"],
                ["categorias", "Categorías"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-pressed={tab === k}
                className={`press rounded-full px-3.5 py-1.5 text-sm transition-colors ${tab === k ? "bg-white font-semibold text-ink shadow-[0_2px_10px_-4px_rgba(30,64,175,0.35)]" : "text-mut hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card h-28 animate-pulse" />
            ))}
          </div>
        ) : tab === "resumen" ? (
          <Summary
            txs={txs}
            monthTxs={monthTxs}
            month={month}
            cats={cats}
            catById={catById}
            currency={currency}
            onEdit={setEditTx}
            onSeeAll={() => setTab("movimientos")}
          />
        ) : tab === "movimientos" ? (
          <Movements monthTxs={monthTxs} month={month} cats={cats} catById={catById} currency={currency} onEdit={setEditTx} onNew={newTx} />
        ) : (
          <Categories
            cats={cats}
            monthTxs={monthTxs}
            currency={currency}
            onEdit={setEditCat}
            onNew={(kind) => setEditCat({ id: "", name: "", kind, emoji: kind === "ingreso" ? "💰" : "🛒", color: PALETTE[cats.length % PALETTE.length], budget: null })}
          />
        )}
      </div>

      {/* Botón flotante en el celular */}
      <div className="fixed right-5 bottom-5 z-20 sm:hidden">
        <button type="button" onClick={() => newTx()} aria-label="Nuevo movimiento" className="btn size-14 rounded-full p-0">
          <span className="text-2xl leading-none">+</span>
        </button>
      </div>

      {editTx && (
        <TxDialog
          tx={editTx}
          cats={cats}
          currency={currency}
          onClose={() => setEditTx(null)}
          onSave={saveTx}
          onDelete={deleteTx}
          onNewCategory={(kind) => {
            setEditTx(null);
            setTab("categorias");
            setEditCat({ id: "", name: "", kind, emoji: "🛒", color: PALETTE[cats.length % PALETTE.length], budget: null });
          }}
        />
      )}
      {editCat && (
        <CatDialog
          cat={editCat}
          used={txs.filter((t) => t.category_id === editCat.id).length}
          onClose={() => setEditCat(null)}
          onSave={saveCat}
          onDelete={deleteCat}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg sm:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- Resumen ---------------- */

function sum(list: Transaction[], kind: Kind) {
  return list.reduce((s, t) => (t.kind === kind ? s + t.amount : s), 0);
}

function Summary({
  txs,
  monthTxs,
  month,
  cats,
  catById,
  currency,
  onEdit,
  onSeeAll,
}: {
  txs: Transaction[];
  monthTxs: Transaction[];
  month: string;
  cats: Category[];
  catById: Map<string, Category>;
  currency: string;
  onEdit: (t: Transaction) => void;
  onSeeAll: () => void;
}) {
  const [grain, setGrain] = useState<Grain>("dia");
  const [donutKind, setDonutKind] = useState<Kind>("egreso");

  const prevTxs = useMemo(() => txs.filter((t) => monthKey(t.date) === shiftMonth(month, -1)), [txs, month]);
  const inc = sum(monthTxs, "ingreso");
  const exp = sum(monthTxs, "egreso");
  const pInc = sum(prevTxs, "ingreso");
  const pExp = sum(prevTxs, "egreso");
  const saving = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : null;

  const flow = useMemo(() => buckets(txs, grain, month), [txs, grain, month]);

  const slices: Slice[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of monthTxs) if (t.kind === donutKind) totals.set(t.category_id ?? "-", (totals.get(t.category_id ?? "-") ?? 0) + t.amount);
    return [...totals.entries()]
      .map(([id, value]) => {
        const c = catById.get(id);
        return { id, value, label: c?.name ?? "Sin categoría", emoji: c?.emoji ?? "•", color: c?.color ?? "#94a3b8" };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthTxs, donutKind, catById]);

  const budgets = cats
    .filter((c) => c.kind === "egreso" && c.budget && c.budget > 0)
    .map((c) => ({ c, spent: monthTxs.reduce((s, t) => (t.category_id === c.id && t.kind === "egreso" ? s + t.amount : s), 0) }))
    .sort((a, b) => b.spent / b.c.budget! - a.spent / a.c.budget!);

  const recent = [...monthTxs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Ingresos" value={money(inc, currency)} dot={INCOME} delta={change(inc, pInc)} goodWhenUp />
        <Stat label="Egresos" value={money(exp, currency)} dot={EXPENSE} delta={change(exp, pExp)} goodWhenUp={false} />
        <Stat label="Balance" value={money(inc - exp, currency)} tone={inc - exp < 0 ? "bad" : "good"} sub={inc - exp < 0 ? "Gastaste más de lo que entró" : "Lo que te queda este mes"} />
        <Stat
          label="Ahorro"
          value={saving === null ? "—" : `${saving}%`}
          tone={saving !== null && saving < 0 ? "bad" : undefined}
          sub={saving === null ? "Sin ingresos este mes" : "De cada 100 que entran"}
        />
      </div>

      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-sans text-base font-semibold tracking-tight">Ingresos y egresos</h2>
          <div className="flex items-center gap-3 text-xs text-mut">
            <Legend color={INCOME} label="Ingresos" />
            <Legend color={EXPENSE} label="Egresos" />
          </div>
          <Segmented
            className="ml-auto"
            value={grain}
            onChange={setGrain}
            options={[
              ["dia", "Día"],
              ["semana", "Semana"],
              ["mes", "Mes"],
            ]}
          />
        </div>
        <p className="mt-1 text-xs text-mut">
          {grain === "dia" ? `Cada día de ${monthLabel(month).toLowerCase()}` : grain === "semana" ? "Últimas 12 semanas" : "Últimos 12 meses"} · pasa el dedo o el mouse por las barras
        </p>
        <div className="mt-3">
          <FlowChart data={flow} grain={grain} currency={currency} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <section className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-sans text-base font-semibold tracking-tight">Por categoría</h2>
            <Segmented
              className="ml-auto"
              value={donutKind}
              onChange={setDonutKind}
              options={[
                ["egreso", "Egresos"],
                ["ingreso", "Ingresos"],
              ]}
            />
          </div>
          <Donut
            slices={slices}
            currency={currency}
            total={donutKind === "egreso" ? exp : inc}
            caption={donutKind === "egreso" ? "Gastado" : "Ingresado"}
          />
        </section>

        <section className="card p-4 sm:p-5">
          <h2 className="font-sans text-base font-semibold tracking-tight">Presupuestos del mes</h2>
          <p className="mt-0.5 text-xs text-mut">Ponle un tope a cada categoría en la pestaña Categorías.</p>
          <ul className="mt-4 space-y-3.5">
            {budgets.length === 0 && <li className="text-sm text-mut">Aún no tienes presupuestos.</li>}
            {budgets.map(({ c, spent }) => {
              const pct = spent / c.budget!;
              const over = pct > 1;
              return (
                <li key={c.id}>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="truncate">
                      {c.emoji} {c.name}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-mut tabular-nums">
                      <span className={over ? "font-semibold text-[#c2410c]" : "text-ink"}>{money(spent, currency)}</span> de {money(c.budget!, currency)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft">
                    <div
                      className="h-full rounded-full transition-[width] duration-500 ease-(--ease-out)"
                      style={{ width: `${Math.min(100, pct * 100)}%`, background: over ? "#e34948" : pct > 0.85 ? "#eda100" : c.color }}
                    />
                  </div>
                  {over && <p className="mt-1 text-xs text-[#c2410c]">⚠ Te pasaste por {money(spent - c.budget!, currency)}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="flex items-center">
          <h2 className="font-sans text-base font-semibold tracking-tight">Últimos movimientos</h2>
          <button type="button" onClick={onSeeAll} className="ml-auto text-sm font-medium text-accent">
            Ver todos →
          </button>
        </div>
        <ul className="mt-2 divide-y divide-line">
          {recent.length === 0 && <li className="py-3 text-sm text-mut">Nada por aquí todavía. Toca “+ Movimiento”.</li>}
          {recent.map((t) => (
            <TxRow key={t.id} t={t} cat={t.category_id ? catById.get(t.category_id) : undefined} currency={currency} onClick={() => onEdit(t)} showDate />
          ))}
        </ul>
      </section>
    </div>
  );
}

function change(now: number, before: number) {
  if (before <= 0) return null;
  return Math.round(((now - before) / before) * 100);
}

function Stat({
  label,
  value,
  dot,
  delta,
  goodWhenUp,
  tone,
  sub,
}: {
  label: string;
  value: string;
  dot?: string;
  delta?: number | null;
  goodWhenUp?: boolean;
  tone?: "good" | "bad";
  sub?: string;
}) {
  const good = delta != null && (goodWhenUp ? delta >= 0 : delta <= 0);
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs text-mut">
        {dot && <span className="size-2 rounded-full" style={{ background: dot }} />}
        {label}
      </p>
      <p className={`mt-1.5 truncate font-sans text-[22px] leading-tight font-semibold tracking-[-0.03em] tabular-nums sm:text-2xl ${tone === "bad" ? "text-[#c2410c]" : "text-ink"}`}>
        {value}
      </p>
      {delta != null ? (
        <p className="mt-1 text-xs text-mut">
          <span className={good ? "text-[#047857]" : "text-[#c2410c]"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>{" "}
          vs. mes anterior
        </p>
      ) : (
        <p className="mt-1 truncate text-xs text-mut">{sub ?? "Sin datos del mes anterior"}</p>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
  className?: string;
}) {
  return (
    <div className={`flex rounded-full bg-soft p-0.5 ${className}`}>
      {options.map(([k, label]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={`press rounded-full px-3 py-1 text-xs transition-colors ${value === k ? "bg-white font-semibold text-ink shadow-sm" : "text-mut hover:text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function TxRow({ t, cat, currency, onClick, showDate }: { t: Transaction; cat?: Category; currency: string; onClick: () => void; showDate?: boolean }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="press flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left hover:bg-soft/70">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl text-base" style={{ background: `${cat?.color ?? "#94a3b8"}22` }}>
          {cat?.emoji ?? "•"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm text-ink">{t.note || cat?.name || "Sin categoría"}</span>
          <span className="block truncate text-xs text-mut">
            {cat?.name ?? "Sin categoría"}
            {showDate && ` · ${dayTitle(t.date)}`}
          </span>
        </span>
        <span className={`ml-auto shrink-0 text-sm font-semibold tabular-nums ${t.kind === "ingreso" ? "text-[#047857]" : "text-ink"}`}>
          {t.kind === "ingreso" ? "+" : "−"}
          {money(t.amount, currency)}
        </span>
      </button>
    </li>
  );
}

/* ---------------- Movimientos ---------------- */

function Movements({
  monthTxs,
  month,
  cats,
  catById,
  currency,
  onEdit,
  onNew,
}: {
  monthTxs: Transaction[];
  month: string;
  cats: Category[];
  catById: Map<string, Category>;
  currency: string;
  onEdit: (t: Transaction) => void;
  onNew: (k?: Kind) => void;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"todos" | Kind>("todos");
  const [cat, setCat] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return monthTxs
      .filter((t) => (kind === "todos" ? true : t.kind === kind))
      .filter((t) => (cat ? (cat === "-" ? !t.category_id : t.category_id === cat) : true))
      .filter((t) => !s || t.note.toLowerCase().includes(s) || (catById.get(t.category_id ?? "")?.name.toLowerCase().includes(s) ?? false))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [monthTxs, q, kind, cat, catById]);

  const days = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of list) m.set(t.date, [...(m.get(t.date) ?? []), t]);
    return [...m.entries()];
  }, [list]);

  const inc = sum(list, "ingreso");
  const exp = sum(list, "egreso");

  const exportCSV = () =>
    downloadCSV(
      list.map((t) => ({
        date: t.date,
        kind: t.kind === "ingreso" ? "Ingreso" : "Egreso",
        category: catById.get(t.category_id ?? "")?.name ?? "Sin categoría",
        note: t.note,
        amount: t.kind === "ingreso" ? t.amount : -t.amount,
      })),
      `movimientos-${month}.csv`,
    );

  return (
    <div className="mt-6 space-y-4">
      <div className="card flex flex-wrap items-center gap-2.5 p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" aria-label="Buscar" className="input h-9 min-w-40 flex-1 py-0 text-sm" />
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            ["todos", "Todos"],
            ["ingreso", "Ingresos"],
            ["egreso", "Egresos"],
          ]}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoría" className="h-9 max-w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent">
          <option value="">Todas las categorías</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
          <option value="-">Sin categoría</option>
        </select>
        <button type="button" onClick={exportCSV} className="btn-ghost h-9 py-0" disabled={list.length === 0}>
          ↓ Excel (CSV)
        </button>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 px-1 text-sm text-mut">
        <span>
          {list.length} movimiento{list.length === 1 ? "" : "s"}
        </span>
        <span>
          Entró <b className="font-semibold text-[#047857] tabular-nums">{money(inc, currency)}</b>
        </span>
        <span>
          Salió <b className="font-semibold text-ink tabular-nums">{money(exp, currency)}</b>
        </span>
      </div>

      {days.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-semibold">No hay movimientos{q || kind !== "todos" || cat ? " con ese filtro" : ` en ${monthLabel(month).toLowerCase()}`}.</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" className="btn" onClick={() => onNew("egreso")}>
              + Egreso
            </button>
            <button type="button" className="btn-ghost" onClick={() => onNew("ingreso")}>
              + Ingreso
            </button>
          </div>
        </div>
      ) : (
        days.map(([date, items]) => {
          const net = sum(items, "ingreso") - sum(items, "egreso");
          return (
            <section key={date} className="card px-3 py-2 sm:px-4">
              <div className="flex items-center px-1 pt-1.5 pb-1 text-xs text-mut">
                <span className="font-semibold text-ink">{dayTitle(date)}</span>
                <span className="ml-auto tabular-nums">
                  {net >= 0 ? "+" : "−"}
                  {money(Math.abs(net), currency)}
                </span>
              </div>
              <ul className="divide-y divide-line">
                {items.map((t) => (
                  <TxRow key={t.id} t={t} cat={t.category_id ? catById.get(t.category_id) : undefined} currency={currency} onClick={() => onEdit(t)} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

/* ---------------- Categorías ---------------- */

function Categories({
  cats,
  monthTxs,
  currency,
  onEdit,
  onNew,
}: {
  cats: Category[];
  monthTxs: Transaction[];
  currency: string;
  onEdit: (c: Category) => void;
  onNew: (k: Kind) => void;
}) {
  const totals = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of monthTxs) if (t.category_id) m.set(t.category_id, (m.get(t.category_id) ?? 0) + t.amount);
    return m;
  }, [monthTxs]);

  const col = (kind: Kind, title: string) => (
    <section className="card p-4 sm:p-5">
      <div className="flex items-center">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold tracking-tight">
          <span className="size-2.5 rounded-full" style={{ background: kind === "ingreso" ? INCOME : EXPENSE }} />
          {title}
        </h2>
        <button type="button" onClick={() => onNew(kind)} className="ml-auto text-sm font-medium text-accent">
          + Nueva
        </button>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {cats
          .filter((c) => c.kind === kind)
          .map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onEdit(c)} className="press flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left hover:bg-soft/70">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl text-base" style={{ background: `${c.color}22` }}>
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{c.name}</span>
                  <span className="block text-xs text-mut">{c.budget ? `Presupuesto: ${money(c.budget, currency)} al mes` : "Sin presupuesto"}</span>
                </span>
                <span className="ml-auto shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums">{money(totals.get(c.id) ?? 0, currency)}</span>
                  <span className="block text-[11px] text-mut">este mes</span>
                </span>
                <span className="text-mut">✎</span>
              </button>
            </li>
          ))}
      </ul>
    </section>
  );

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {col("egreso", "Egresos")}
      {col("ingreso", "Ingresos")}
    </div>
  );
}

/* ---------------- Ventanas (crear / editar) ---------------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(460px,calc(100%-24px))] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0c1a3b]/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center border-b border-line px-5 py-3.5">
        <h2 className="font-sans text-lg font-semibold tracking-tight">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="press ml-auto grid size-8 place-items-center rounded-full text-mut hover:bg-soft">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}

function TxDialog({
  tx,
  cats,
  currency,
  onClose,
  onSave,
  onDelete,
  onNewCategory,
}: {
  tx: Transaction;
  cats: Category[];
  currency: string;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onNewCategory: (k: Kind) => void;
}) {
  const [kind, setKind] = useState<Kind>(tx.kind);
  const [amount, setAmount] = useState(tx.amount ? String(tx.amount) : "");
  const [catId, setCatId] = useState<string | null>(tx.category_id);
  const [date, setDate] = useState(tx.date);
  const [note, setNote] = useState(tx.note);
  const [error, setError] = useState("");
  const options = cats.filter((c) => c.kind === kind);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount.replace(",", "."));
    if (!n || n <= 0) return setError("Escribe un monto mayor a cero.");
    if (!date) return setError("Elige la fecha.");
    onSave({ id: tx.id || uid(), kind, amount: Math.round(n * 100) / 100, category_id: catId, date, note: note.trim() });
  };

  return (
    <Modal title={tx.id ? "Editar movimiento" : "Nuevo movimiento"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-soft p-1">
          {(["egreso", "ingreso"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k);
                if (catId && cats.find((c) => c.id === catId)?.kind !== k) setCatId(null);
              }}
              className={`press rounded-full py-2 text-sm transition-colors ${kind === k ? "bg-white font-semibold shadow-sm" : "text-mut"}`}
            >
              <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: k === "ingreso" ? INCOME : EXPENSE }} />
              {k === "egreso" ? "Egreso (salió)" : "Ingreso (entró)"}
            </button>
          ))}
        </div>

        <div>
          <label className="label" htmlFor="fx-amount">
            Monto ({currency})
          </label>
          <input
            id="fx-amount"
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0.00"
            className="input font-sans text-2xl font-semibold tabular-nums"
          />
        </div>

        <div>
          <p className="label">Categoría</p>
          <div className="flex flex-wrap gap-1.5">
            {options.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatId(c.id === catId ? null : c.id)}
                aria-pressed={c.id === catId}
                className={`press rounded-full border px-3 py-1.5 text-sm transition-colors ${c.id === catId ? "border-transparent text-ink" : "border-line text-mut hover:text-ink"}`}
                style={c.id === catId ? { background: `${c.color}26`, boxShadow: `inset 0 0 0 1.5px ${c.color}` } : undefined}
              >
                {c.emoji} {c.name}
              </button>
            ))}
            <button type="button" onClick={() => onNewCategory(kind)} className="press rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-accent">
              + Nueva
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <div>
            <label className="label" htmlFor="fx-date">
              Fecha
            </label>
            <input id="fx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="fx-note">
              Nota <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input id="fx-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: almuerzo" maxLength={120} className="input" />
          </div>
        </div>

        {error && <p className="text-sm text-[#c2410c]">{error}</p>}

        <div className="flex gap-2 pt-1">
          {tx.id && (
            <button
              type="button"
              onClick={() => confirm("¿Eliminar este movimiento?") && onDelete(tx.id)}
              className="btn-ghost text-[#c2410c]"
            >
              Eliminar
            </button>
          )}
          <button type="submit" className="btn ml-auto">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CatDialog({
  cat,
  used,
  onClose,
  onSave,
  onDelete,
}: {
  cat: Category;
  used: number;
  onClose: () => void;
  onSave: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(cat.name);
  const [kind, setKind] = useState<Kind>(cat.kind);
  const [emoji, setEmoji] = useState(cat.emoji);
  const [color, setColor] = useState(cat.color);
  const [budget, setBudget] = useState(cat.budget ? String(cat.budget) : "");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre.");
    const b = Number(budget.replace(",", "."));
    onSave({
      id: cat.id || uid(),
      name: name.trim(),
      kind,
      emoji: emoji.trim() || "•",
      color,
      budget: kind === "egreso" && b > 0 ? Math.round(b * 100) / 100 : null,
    });
  };

  return (
    <Modal title={cat.id ? "Editar categoría" : "Nueva categoría"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-soft p-1">
          {(["egreso", "ingreso"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={`press rounded-full py-2 text-sm ${kind === k ? "bg-white font-semibold shadow-sm" : "text-mut"}`}>
              {k === "egreso" ? "De egresos" : "De ingresos"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[64px_1fr] gap-3">
          <div>
            <label className="label" htmlFor="fc-emoji">
              Ícono
            </label>
            <input id="fc-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="input text-center text-xl" />
          </div>
          <div>
            <label className="label" htmlFor="fc-name">
              Nombre
            </label>
            <input id="fc-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Ej: Mascotas" className="input" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => setEmoji(e)} className={`press grid size-9 place-items-center rounded-lg text-lg ${emoji === e ? "bg-soft ring-2 ring-accent/40" : "hover:bg-soft"}`}>
              {e}
            </button>
          ))}
        </div>

        <div>
          <p className="label">Color</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="press size-8 rounded-full transition-shadow"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>

        {kind === "egreso" && (
          <div>
            <label className="label" htmlFor="fc-budget">
              Presupuesto al mes <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input id="fc-budget" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ej: 300" className="input" />
            <p className="hint">Te avisamos en el resumen cuando te acerques o te pases.</p>
          </div>
        )}

        {error && <p className="text-sm text-[#c2410c]">{error}</p>}

        <div className="flex gap-2 pt-1">
          {cat.id && (
            <button
              type="button"
              onClick={() =>
                confirm(used > 0 ? `Esta categoría tiene ${used} movimiento(s). Quedarán como “Sin categoría”. ¿Eliminarla?` : "¿Eliminar esta categoría?") &&
                onDelete(cat.id)
              }
              className="btn-ghost text-[#c2410c]"
            >
              Eliminar
            </button>
          )}
          <button type="submit" className="btn ml-auto">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
