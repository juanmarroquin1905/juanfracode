"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { suggestedPacking } from "./seed";
import type { TripStore } from "./store";
import { TripMap, type MapPoint } from "./trip-map";
import type { Activity, Expense, ExpenseCategory, ListName, PackGroup, PackItem, Rows, Stay, Trip, TripData } from "./types";
import { DialogFooter, Field, Modal, PlacePicker } from "./ui";
import {
  daysBetween,
  EXPENSE_CATS,
  EXPENSE_KEYS,
  longDay,
  mapsLink,
  money,
  PACK_GROUPS,
  PACK_KEYS,
  rangeLabel,
  shortDate,
  today,
  tripDays,
  tripStatus,
  uid,
  weekDay,
} from "./utils";

type Tab = "resumen" | "itinerario" | "gastos" | "alojamiento" | "equipaje";
const TABS: [Tab, string][] = [
  ["resumen", "Resumen"],
  ["itinerario", "Itinerario"],
  ["gastos", "Gastos"],
  ["alojamiento", "Alojamiento"],
  ["equipaje", "Qué llevar"],
];
const DAY_COLORS = ["#c4472f", "#2f5d8a", "#2e7d6b", "#d0832b", "#8a5a9e", "#b5527a", "#1d2b4f"];
const STAY_COLOR = "#1d2b4f";

type Props = {
  trip: Trip;
  store: TripStore;
  say: (m: string) => void;
  onBack: () => void;
  onEditTrip: () => void;
};

export function TripView({ trip, store, say, onBack, onEditTrip }: Props) {
  const [data, setData] = useState<TripData | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [editAct, setEditAct] = useState<Activity | null>(null);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const [editStay, setEditStay] = useState<Stay | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await store.loadTrip(trip.id));
    } catch (e) {
      say(`No se pudo cargar el viaje: ${(e as Error).message}`);
      setData({ stays: [], expenses: [], activities: [], packing: [] });
    }
  }, [store, trip.id, say]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  // Guardar y borrar: la pantalla cambia al instante y luego se guarda.
  function save<L extends ListName>(list: L, row: Rows[L], ok?: string) {
    const r = { ...row, id: row.id || uid(), trip_id: trip.id } as Rows[L];
    setData((d) => {
      if (!d) return d;
      const rows = d[list] as Rows[L][];
      const exists = rows.some((x) => x.id === r.id);
      return { ...d, [list]: exists ? rows.map((x) => (x.id === r.id ? r : x)) : [...rows, r] };
    });
    store.save(list, r).then(
      () => ok && say(ok),
      (e: Error) => {
        say(`No se pudo guardar: ${e.message}`);
        load();
      },
    );
  }
  function remove(list: ListName, id: string, ok?: string) {
    setData((d) => (d ? { ...d, [list]: (d[list] as { id: string }[]).filter((x) => x.id !== id) } : d));
    store.remove(list, id).then(
      () => ok && say(ok),
      (e: Error) => {
        say(`No se pudo borrar: ${e.message}`);
        load();
      },
    );
  }

  const days = useMemo(() => tripDays(trip), [trip]);
  const defaultDate = () => {
    const t = today();
    return t >= trip.start_date && t <= trip.end_date ? t : trip.start_date;
  };
  const newAct = (date = defaultDate()): Activity => ({ id: "", trip_id: trip.id, date, time: "", title: "", place: "", notes: "", lat: null, lng: null, done: false });
  const newExp = (): Expense => ({ id: "", trip_id: trip.id, amount: 0, category: "comida", note: "", date: defaultDate() });
  const newStay = (): Stay => {
    const last = data?.stays.reduce((m, s) => (s.check_out > m ? s.check_out : m), trip.start_date) ?? trip.start_date;
    const ci = last < trip.end_date ? last : trip.start_date;
    return { id: "", trip_id: trip.id, name: "", address: "", check_in: ci, check_out: trip.end_date, price: 0, paid: false, confirmation: "", url: "", lat: null, lng: null };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 pb-28 sm:px-6 sm:pt-7">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="vj-btn-ghost vj-press px-3 py-1.5 text-sm">
          ← Mis viajes
        </button>
        <button type="button" onClick={onEditTrip} className="vj-btn-ghost vj-press ml-auto px-3 py-1.5 text-sm">
          ✎ Editar viaje
        </button>
      </div>

      <Ticket trip={trip} data={data} onEditTrip={onEditTrip} />

      <nav role="tablist" aria-label="Secciones del viaje" className="vj-scroll-x -mx-4 mt-6 flex overflow-x-auto border-b border-(--vj-line) px-2 sm:mx-0 sm:px-0">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="vj-tab">
            {label}
          </button>
        ))}
      </nav>

      {!data ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-(--vj-paper-2)" />
          <div className="h-64 animate-pulse rounded-xl bg-(--vj-paper-2)" />
        </div>
      ) : (
        <div key={tab} className="vj-fade mt-6">
          {tab === "resumen" && <Summary trip={trip} data={data} days={days} onTab={setTab} onEditAct={setEditAct} onEditTrip={onEditTrip} />}
          {tab === "itinerario" && (
            <Itinerary
              trip={trip}
              data={data}
              days={days}
              onNew={(d) => setEditAct(newAct(d))}
              onEdit={setEditAct}
              onToggle={(a) => save("activities", { ...a, done: !a.done })}
            />
          )}
          {tab === "gastos" && <Expenses trip={trip} data={data} days={days} onNew={() => setEditExp(newExp())} onEdit={setEditExp} />}
          {tab === "alojamiento" && <Stays trip={trip} data={data} onNew={() => setEditStay(newStay())} onEdit={setEditStay} />}
          {tab === "equipaje" && (
            <Packing
              items={data.packing}
              onAdd={(name, group) => save("packing", { id: "", trip_id: trip.id, name, group, checked: false })}
              onToggle={(p) => save("packing", { ...p, checked: !p.checked })}
              onRemove={(id) => remove("packing", id)}
              onSuggest={() => {
                const have = new Set(data.packing.map((p) => p.name.toLowerCase()));
                const add = suggestedPacking(trip.id).filter((p) => !have.has(p.name.toLowerCase()));
                for (const p of add) save("packing", p);
                say(add.length ? `Agregué ${add.length} cosas sugeridas` : "Ya tienes todo lo sugerido");
              }}
              onUncheckAll={() => {
                for (const p of data.packing) if (p.checked) save("packing", { ...p, checked: false });
              }}
            />
          )}
        </div>
      )}

      {/* Botón flotante en el celular */}
      {data && (tab === "itinerario" || tab === "gastos" || tab === "alojamiento") && (
        <div className="fixed right-5 bottom-5 z-20 sm:hidden">
          <button
            type="button"
            onClick={() => (tab === "itinerario" ? setEditAct(newAct()) : tab === "gastos" ? setEditExp(newExp()) : setEditStay(newStay()))}
            aria-label="Agregar"
            className="vj-btn vj-btn-red size-14 rounded-full p-0 text-2xl"
          >
            +
          </button>
        </div>
      )}

      {editAct && (
        <ActivityDialog
          act={editAct}
          trip={trip}
          days={days}
          onClose={() => setEditAct(null)}
          onSave={(a) => {
            save("activities", a, a.id ? "Actividad guardada" : "Agregada al itinerario");
            setEditAct(null);
          }}
          onDelete={(id) => {
            remove("activities", id, "Actividad eliminada");
            setEditAct(null);
          }}
        />
      )}
      {editExp && (
        <ExpenseDialog
          exp={editExp}
          trip={trip}
          onClose={() => setEditExp(null)}
          onSave={(x) => {
            save("expenses", x, "Gasto guardado");
            setEditExp(null);
          }}
          onDelete={(id) => {
            remove("expenses", id, "Gasto eliminado");
            setEditExp(null);
          }}
        />
      )}
      {editStay && (
        <StayDialog
          stay={editStay}
          trip={trip}
          onClose={() => setEditStay(null)}
          onSave={(s) => {
            save("stays", s, "Alojamiento guardado");
            setEditStay(null);
          }}
          onDelete={(id) => {
            remove("stays", id, "Alojamiento eliminado");
            setEditStay(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Cuentas del viaje ---------------- */

type CatKey = ExpenseCategory | "alojamiento";
function totals(data: TripData) {
  const by = new Map<CatKey, number>();
  for (const e of data.expenses) by.set(e.category, (by.get(e.category) ?? 0) + e.amount);
  const stays = data.stays.reduce((s, x) => s + x.price, 0);
  if (stays) by.set("alojamiento", stays);
  const spent = [...by.values()].reduce((a, b) => a + b, 0);
  const cats = (["transporte", "alojamiento", "comida", "actividades", "compras", "otros"] as CatKey[])
    .map((k) => ({ key: k, value: by.get(k) ?? 0, ...EXPENSE_CATS[k] }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  return { spent, cats };
}

/* ---------------- Boleto (encabezado del viaje) ---------------- */

function Ticket({ trip, data, onEditTrip }: { trip: Trip; data: TripData | null; onEditTrip: () => void }) {
  const st = tripStatus(trip);
  const nDays = daysBetween(trip.start_date, trip.end_date) + 1;
  const { spent, cats } = data ? totals(data) : { spent: 0, cats: [] };
  const budget = trip.budget ?? 0;
  const left = budget - spent;
  const over = budget > 0 && left < 0;
  const scale = Math.max(budget, spent) || 1;

  return (
    <div className="vj-ticket mt-4 overflow-hidden">
      <div className="h-2" style={{ background: `repeating-linear-gradient(-45deg, ${trip.color} 0 10px, #fffdf7 10px 16px, var(--vj-ink) 16px 26px, #fffdf7 26px 32px)` }} />
      <div className="grid gap-5 px-5 pt-5 pb-6 sm:grid-cols-[1fr_auto] sm:px-7">
        <div className="min-w-0">
          <p className="vj-mono text-[11px] font-bold tracking-[0.25em] text-(--vj-mut) uppercase">
            {trip.flag} Destino · {trip.destination}
          </p>
          <h1 className="vj-serif mt-1.5 text-3xl leading-[1.05] font-semibold sm:text-[44px]">{trip.name || trip.destination}</h1>
          <dl className="mt-5 grid grid-cols-[1.5fr_1fr_1fr] gap-4 sm:max-w-lg">
            <Info k="Fechas" v={rangeLabel(trip.start_date, trip.end_date)} />
            <Info k="Duración" v={`${nDays} ${nDays === 1 ? "día" : "días"}`} />
            <Info k="Viajeros" v={String(trip.travelers)} />
          </dl>
        </div>
        <div className="flex items-start sm:justify-end">
          <span
            className="vj-stamp vj-stamp-in px-4 py-2 text-[13px]"
            style={{ color: st.kind === "visitado" ? "var(--vj-red)" : st.kind === "viajando" ? "var(--vj-teal)" : "var(--vj-ink)", ["--r" as string]: "6deg" }}
          >
            {st.label}
          </span>
        </div>
      </div>

      <div className="vj-perf px-5 pt-5 pb-5 sm:px-7">
        {budget > 0 ? (
          <>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="vj-label mb-0.5">Gastado</p>
                <p className="vj-serif text-3xl font-semibold">{money(spent, trip.currency)}</p>
              </div>
              <p className="pb-1 text-sm text-(--vj-mut)">de {money(budget, trip.currency)} de presupuesto</p>
              <div className="ml-auto text-right">
                <p className="vj-label mb-0.5">{over ? "Te pasaste" : "Te queda"}</p>
                <p className={`vj-mono text-xl font-bold ${over ? "text-(--vj-red)" : "text-(--vj-teal)"}`}>{money(Math.abs(left), trip.currency)}</p>
              </div>
            </div>
            <div className="relative mt-3">
              <div className="vj-bar">
                {cats.map((c) => (
                  <span key={c.key} title={`${c.label}: ${money(c.value, trip.currency)}`} style={{ width: `${(c.value / scale) * 100}%`, background: c.color }} />
                ))}
              </div>
              {over && <div className="absolute -top-1 -bottom-1 w-0.5 bg-(--vj-ink)" style={{ left: `${(budget / scale) * 100}%` }} title="Presupuesto" />}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--vj-mut)">
              {cats.map((c) => (
                <span key={c.key} className="inline-flex items-center gap-1.5">
                  <i className="size-2.5 rounded-full" style={{ background: c.color }} />
                  {c.label} {Math.round((c.value / (spent || 1)) * 100)}%
                </span>
              ))}
              <span className="ml-auto">
                {Math.round((spent / budget) * 100)}% usado · {money(budget / trip.travelers, trip.currency)} por persona
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">
              Llevas <b>{money(spent, trip.currency)}</b> gastado.
            </p>
            <button type="button" onClick={onEditTrip} className="vj-chip vj-press ml-auto">
              + Ponle un presupuesto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="vj-label mb-0.5 text-[10px]">{k}</dt>
      <dd className="vj-mono text-sm font-bold">{v}</dd>
    </div>
  );
}

/* ---------------- Resumen ---------------- */

function actPoints(acts: Activity[], days: string[]): MapPoint[] {
  const out: MapPoint[] = [];
  const byDay = new Map<string, Activity[]>();
  for (const a of [...acts].sort(byTime)) byDay.set(a.date, [...(byDay.get(a.date) ?? []), a]);
  for (const [date, list] of byDay) {
    const di = days.indexOf(date);
    list.forEach((a, i) => {
      if (a.lat == null || a.lng == null) return;
      out.push({ id: a.id, lat: a.lat, lng: a.lng, label: String(i + 1), title: `${di >= 0 ? `Día ${di + 1} · ` : ""}${a.time ? `${a.time} · ` : ""}${a.title}`, color: DAY_COLORS[Math.max(0, di) % DAY_COLORS.length] });
    });
  }
  return out;
}
const byTime = (a: Activity, b: Activity) => (a.date + (a.time || "99") < b.date + (b.time || "99") ? -1 : 1);

function Summary({
  trip,
  data,
  days,
  onTab,
  onEditAct,
  onEditTrip,
}: {
  trip: Trip;
  data: TripData;
  days: string[];
  onTab: (t: Tab) => void;
  onEditAct: (a: Activity) => void;
  onEditTrip: () => void;
}) {
  const points = useMemo(() => {
    const p = actPoints(data.activities, days);
    for (const s of data.stays) if (s.lat != null && s.lng != null) p.push({ id: s.id, lat: s.lat, lng: s.lng, label: "🛏", title: `Alojamiento · ${s.name}`, color: STAY_COLOR });
    return p;
  }, [data, days]);
  const now = today();
  const sorted = [...data.activities].sort(byTime);
  const upcoming = (now > trip.end_date ? sorted : sorted.filter((a) => a.date >= now && !a.done)).slice(0, 4);
  const packed = data.packing.filter((p) => p.checked).length;
  const { spent } = totals(data);
  const staysTotal = data.stays.reduce((s, x) => s + x.price, 0);
  const unpaid = data.stays.filter((s) => !s.paid).reduce((s, x) => s + x.price, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="vj-card p-3">
        <div className="flex items-center px-2 pt-1 pb-3">
          <h3 className="vj-serif text-lg font-semibold">Mapa del viaje</h3>
          <button type="button" onClick={() => onTab("itinerario")} className="ml-auto text-sm font-semibold text-(--vj-red)">
            Ver por día →
          </button>
        </div>
        <TripMap points={points} height={340} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 pt-3 text-xs text-(--vj-mut)">
          {days.map((d, i) => (
            <span key={d} className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-full" style={{ background: DAY_COLORS[i % DAY_COLORS.length] }} /> Día {i + 1}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <i className="size-2.5 rounded-full" style={{ background: STAY_COLOR }} /> Alojamiento
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="vj-card p-5">
          <div className="flex items-center">
            <h3 className="vj-serif text-lg font-semibold">{now > trip.end_date ? "Lo que hiciste" : "Lo que viene"}</h3>
            <button type="button" onClick={() => onTab("itinerario")} className="ml-auto text-sm font-semibold text-(--vj-red)">
              Itinerario →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-(--vj-mut)">Aún no hay actividades. Arma tu itinerario día por día.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => onEditAct(a)} className="vj-row flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left">
                    <span className="vj-mono w-14 shrink-0 text-center text-[11px] leading-tight text-(--vj-mut)">
                      <b className="block text-sm text-(--vj-ink)">{shortDate(a.date)}</b>
                      {a.time || weekDay(a.date)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{a.title}</span>
                      {a.place && <span className="block truncate text-xs text-(--vj-mut)">📍 {a.place}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => onTab("alojamiento")} className="vj-card vj-press p-4 text-left">
            <p className="vj-label">Alojamiento</p>
            <p className="vj-serif text-2xl font-semibold">{data.stays.length}</p>
            <p className="text-xs text-(--vj-mut)">
              {data.stays.length === 0 ? "Agrega tu hotel" : unpaid > 0 ? `Por pagar ${money(unpaid, trip.currency)}` : `Todo pagado · ${money(staysTotal, trip.currency)}`}
            </p>
          </button>
          <button type="button" onClick={() => onTab("equipaje")} className="vj-card vj-press p-4 text-left">
            <p className="vj-label">Qué llevar</p>
            <p className="vj-serif text-2xl font-semibold">
              {packed}
              <span className="text-base text-(--vj-mut)">/{data.packing.length}</span>
            </p>
            <div className="vj-bar mt-1.5 h-2">
              <span style={{ width: `${data.packing.length ? (packed / data.packing.length) * 100 : 0}%`, background: "var(--vj-teal)" }} />
            </div>
          </button>
          <button type="button" onClick={() => onTab("gastos")} className="vj-card vj-press col-span-2 flex items-center gap-4 p-4 text-left">
            <div>
              <p className="vj-label">Por persona</p>
              <p className="vj-serif text-2xl font-semibold">{money(spent / trip.travelers, trip.currency)}</p>
            </div>
            <div>
              <p className="vj-label">Por día</p>
              <p className="vj-serif text-2xl font-semibold">{money(spent / Math.max(1, days.length), trip.currency)}</p>
            </div>
            <span className="ml-auto text-sm font-semibold text-(--vj-red)">Gastos →</span>
          </button>
        </div>

        {trip.notes ? (
          <button type="button" onClick={onEditTrip} className="vj-card block w-full -rotate-[0.4deg] bg-[#fff6d6] p-4 text-left">
            <p className="vj-label">Notas</p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{trip.notes}</p>
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Itinerario ---------------- */

function Itinerary({
  trip,
  data,
  days,
  onNew,
  onEdit,
  onToggle,
}: {
  trip: Trip;
  data: TripData;
  days: string[];
  onNew: (date: string) => void;
  onEdit: (a: Activity) => void;
  onToggle: (a: Activity) => void;
}) {
  const [day, setDay] = useState<string | null>(() => {
    const t = today();
    return days.includes(t) ? t : null;
  });
  const acts = useMemo(() => [...data.activities].sort(byTime), [data.activities]);
  const points = useMemo(() => actPoints(day ? acts.filter((a) => a.date === day) : acts, days), [acts, day, days]);
  const outside = acts.filter((a) => !days.includes(a.date));
  const shown = day ? [day] : days;

  return (
    <div>
      <div className="vj-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        <button type="button" onClick={() => setDay(null)} aria-pressed={day === null} className="vj-chip vj-press">
          Todo el viaje
        </button>
        {days.map((d, i) => (
          <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={day === d} className="vj-chip vj-press">
            <i className="size-2 rounded-full" style={{ background: DAY_COLORS[i % DAY_COLORS.length] }} />
            Día {i + 1} · {weekDay(d)} {shortDate(d)}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="vj-card p-3 lg:sticky lg:top-4">
          <TripMap key={day ?? "todo"} points={points} route={day !== null} height={360} />
          <p className="px-2 pt-2.5 text-xs text-(--vj-mut)">
            {day ? "La línea punteada sigue el orden del día." : "Cada color es un día. Toca un número para ver qué es."}
          </p>
        </div>

        <div className="space-y-5">
          {shown.map((d) => {
            const i = days.indexOf(d);
            const list = acts.filter((a) => a.date === d);
            return (
              <section key={d} className="vj-card overflow-hidden">
                <header className="flex items-center gap-3 border-b border-dashed border-(--vj-line) px-4 py-3">
                  <span className="vj-stamp px-2.5 py-0.5 text-[10px]" style={{ color: DAY_COLORS[i % DAY_COLORS.length], boxShadow: "none", ["--r" as string]: "0deg" }}>
                    Día {i + 1}
                  </span>
                  <h3 className="vj-serif text-lg font-semibold">{longDay(d)}</h3>
                  <button type="button" onClick={() => onNew(d)} className="vj-press ml-auto hidden text-sm font-semibold text-(--vj-red) sm:block">
                    + Agregar
                  </button>
                </header>
                {list.length === 0 ? (
                  <button type="button" onClick={() => onNew(d)} className="vj-row block w-full px-4 py-5 text-left text-sm text-(--vj-mut)">
                    Día libre. Toca para agregar algo.
                  </button>
                ) : (
                  <ol>
                    {list.map((a, n) => (
                      <ActRow key={a.id} a={a} n={n + 1} color={DAY_COLORS[i % DAY_COLORS.length]} onEdit={() => onEdit(a)} onToggle={() => onToggle(a)} />
                    ))}
                  </ol>
                )}
                <button type="button" onClick={() => onNew(d)} className="vj-row w-full border-t border-dashed border-(--vj-line) px-4 py-2.5 text-left text-sm font-semibold text-(--vj-red) sm:hidden">
                  + Agregar a este día
                </button>
              </section>
            );
          })}
          {!day && outside.length > 0 && (
            <section className="vj-card overflow-hidden">
              <header className="border-b border-dashed border-(--vj-line) px-4 py-3">
                <h3 className="vj-serif text-lg font-semibold">Fuera de las fechas del viaje</h3>
              </header>
              <ol>
                {outside.map((a, n) => (
                  <ActRow key={a.id} a={a} n={n + 1} color="#8c7f6a" onEdit={() => onEdit(a)} onToggle={() => onToggle(a)} showDate />
                ))}
              </ol>
            </section>
          )}
          {data.activities.length === 0 && (
            <p className="text-center text-sm text-(--vj-mut)">Tip: escribe el lugar y toca “Buscar en el mapa” para verlo en el mapa de {trip.destination}.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActRow({ a, n, color, onEdit, onToggle, showDate }: { a: Activity; n: number; color: string; onEdit: () => void; onToggle: () => void; showDate?: boolean }) {
  return (
    <li className="vj-row flex items-start gap-3 border-t border-(--vj-line) px-4 py-3 first:border-t-0">
      <span className="vj-mono mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[#fffdf7]" style={{ background: a.lat != null ? color : "#b8ab90" }}>
        {n}
      </span>
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className={`block font-semibold ${a.done ? "text-(--vj-mut) line-through decoration-(--vj-red)/60" : ""}`}>
          {a.time && <span className="vj-mono mr-2 text-sm text-(--vj-mut)">{a.time}</span>}
          {a.title}
        </span>
        {(a.place || showDate) && (
          <span className="mt-0.5 block truncate text-xs text-(--vj-mut)">
            {showDate && `${shortDate(a.date)} · `}
            {a.place && `📍 ${a.place}`}
          </span>
        )}
        {a.notes && <span className="mt-1 block text-xs text-(--vj-ink)/75 italic">{a.notes}</span>}
      </button>
      {a.place && (
        <a href={mapsLink({ lat: a.lat, lng: a.lng, text: a.place })} target="_blank" rel="noreferrer" className="vj-press mt-0.5 shrink-0 text-xs font-semibold text-(--vj-mut) underline underline-offset-2" title="Abrir en Google Maps">
          Maps
        </a>
      )}
      <button type="button" role="checkbox" aria-checked={a.done} aria-label="Hecho" onClick={onToggle} className="vj-check mt-0.5">
        {a.done ? "✓" : ""}
      </button>
    </li>
  );
}

/* ---------------- Gastos ---------------- */

function Expenses({ trip, data, days, onNew, onEdit }: { trip: Trip; data: TripData; days: string[]; onNew: () => void; onEdit: (e: Expense) => void }) {
  const [filter, setFilter] = useState<ExpenseCategory | null>(null);
  const { spent, cats } = totals(data);
  const list = [...data.expenses].filter((e) => !filter || e.category === filter).sort((a, b) => (a.date < b.date ? 1 : -1));
  const groups = new Map<string, Expense[]>();
  for (const e of list) groups.set(e.date, [...(groups.get(e.date) ?? []), e]);
  const before = data.expenses.filter((e) => e.date < trip.start_date).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-start">
      <div className="space-y-4">
        <div className="vj-card p-5">
          <p className="vj-label">Total del viaje</p>
          <p className="vj-serif text-4xl font-semibold">{money(spent, trip.currency)}</p>
          <p className="mt-1 text-xs text-(--vj-mut)">
            {money(spent / trip.travelers, trip.currency)} por persona · {money(spent / Math.max(1, days.length), trip.currency)} por día
          </p>
          <ul className="mt-4 space-y-2.5">
            {cats.map((c) => (
              <li key={c.key}>
                <div className="flex items-center gap-2 text-sm">
                  <span>{c.emoji}</span>
                  <span className="font-semibold">{c.label}</span>
                  <span className="vj-mono ml-auto">{money(c.value, trip.currency)}</span>
                </div>
                <div className="vj-bar mt-1 h-2">
                  <span style={{ width: `${(c.value / (cats[0]?.value || 1)) * 100}%`, background: c.color }} />
                </div>
              </li>
            ))}
            {cats.length === 0 && <li className="text-sm text-(--vj-mut)">Aún no hay gastos.</li>}
          </ul>
          {data.stays.length > 0 && <p className="mt-4 text-xs text-(--vj-mut)">🏨 El alojamiento se suma solo desde la pestaña Alojamiento.</p>}
          {before > 0 && <p className="mt-1 text-xs text-(--vj-mut)">✈️ {money(before, trip.currency)} los pagaste antes de salir (vuelos, entradas…).</p>}
        </div>
        <button type="button" onClick={onNew} className="vj-btn vj-btn-red hidden w-full sm:flex">
          + Anotar gasto
        </button>
      </div>

      <div>
        <div className="vj-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          <button type="button" onClick={() => setFilter(null)} aria-pressed={filter === null} className="vj-chip vj-press">
            Todos
          </button>
          {EXPENSE_KEYS.map((k) => (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={filter === k} className="vj-chip vj-press">
              {EXPENSE_CATS[k].emoji} {EXPENSE_CATS[k].label}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="vj-card px-5 py-10 text-center">
            <p className="vj-serif text-xl">Sin gastos {filter ? "en esta categoría" : "todavía"}</p>
            <button type="button" onClick={onNew} className="vj-btn mt-4">
              + Anotar gasto
            </button>
          </div>
        ) : (
          <div className="vj-card overflow-hidden">
            {[...groups].map(([date, rows]) => (
              <div key={date}>
                <div className="vj-mono flex items-center bg-(--vj-paper-2)/60 px-4 py-1.5 text-[11px] font-bold tracking-wider text-(--vj-mut) uppercase">
                  {date < trip.start_date ? `Antes del viaje · ${shortDate(date)}` : longDay(date)}
                  <span className="ml-auto">{money(rows.reduce((s, e) => s + e.amount, 0), trip.currency)}</span>
                </div>
                {rows.map((e) => (
                  <button key={e.id} type="button" onClick={() => onEdit(e)} className="vj-row flex w-full items-center gap-3 border-t border-(--vj-line) px-4 py-3 text-left first:border-t-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full text-base" style={{ background: `${EXPENSE_CATS[e.category].color}22` }}>
                      {EXPENSE_CATS[e.category].emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{e.note || EXPENSE_CATS[e.category].label}</span>
                      <span className="block text-xs text-(--vj-mut)">{EXPENSE_CATS[e.category].label}</span>
                    </span>
                    <span className="vj-mono font-bold">{money(e.amount, trip.currency, e.amount % 1 !== 0)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Alojamiento ---------------- */

function Stays({ trip, data, onNew, onEdit }: { trip: Trip; data: TripData; onNew: () => void; onEdit: (s: Stay) => void }) {
  const stays = [...data.stays].sort((a, b) => (a.check_in < b.check_in ? -1 : 1));
  const points: MapPoint[] = stays.flatMap((s, i) => (s.lat != null && s.lng != null ? [{ id: s.id, lat: s.lat, lng: s.lng, label: String(i + 1), title: s.name, color: STAY_COLOR }] : []));
  const total = stays.reduce((s, x) => s + x.price, 0);
  const nights = stays.reduce((s, x) => s + Math.max(0, daysBetween(x.check_in, x.check_out)), 0);
  const tripNights = Math.max(0, daysBetween(trip.start_date, trip.end_date));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-(--vj-mut)">
          <b className="text-(--vj-ink)">{nights}</b> de {tripNights} noches reservadas · total <b className="text-(--vj-ink)">{money(total, trip.currency)}</b>
        </p>
        <button type="button" onClick={onNew} className="vj-btn vj-btn-red ml-auto hidden sm:inline-flex">
          + Alojamiento
        </button>
      </div>
      {nights < tripNights && stays.length > 0 && (
        <p className="rounded-lg border border-dashed border-(--vj-gold) bg-[#fff6d6] px-4 py-2.5 text-sm">⚠️ Te faltan {tripNights - nights} noches por reservar.</p>
      )}

      {stays.length === 0 ? (
        <div className="vj-card px-5 py-10 text-center">
          <p className="vj-serif text-xl">¿Dónde vas a dormir?</p>
          <p className="mt-1 text-sm text-(--vj-mut)">Agrega tu hotel, hostal o Airbnb con fechas, precio y código de reserva.</p>
          <button type="button" onClick={onNew} className="vj-btn mt-4">
            + Agregar alojamiento
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="space-y-4">
            {stays.map((s, i) => {
              const n = Math.max(0, daysBetween(s.check_in, s.check_out));
              return (
                <article key={s.id} className="vj-ticket flex overflow-hidden">
                  <div className="vj-mono flex w-14 shrink-0 flex-col items-center justify-center gap-1 border-r-2 border-dashed border-(--vj-line) bg-(--vj-paper-2)/50 text-center">
                    <span className="text-[10px] text-(--vj-mut)">N°</span>
                    <span className="text-xl font-bold">{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1 p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="vj-serif text-xl leading-tight font-semibold">{s.name}</h3>
                        {s.address && <p className="mt-0.5 truncate text-xs text-(--vj-mut)">📍 {s.address}</p>}
                      </div>
                      <span className="vj-stamp ml-auto shrink-0 px-2 py-0.5 text-[10px]" style={{ color: s.paid ? "var(--vj-teal)" : "var(--vj-red)", ["--r" as string]: "-6deg", transform: "rotate(-6deg)" }}>
                        {s.paid ? "Pagado" : "Por pagar"}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-3">
                      <Info k="Entrada" v={`${weekDay(s.check_in)} ${shortDate(s.check_in)}`} />
                      <Info k="Salida" v={`${weekDay(s.check_out)} ${shortDate(s.check_out)}`} />
                      <Info k={`${n} ${n === 1 ? "noche" : "noches"}`} v={money(s.price, trip.currency)} />
                    </dl>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {s.confirmation && (
                        <span className="vj-mono rounded-md bg-(--vj-paper-2) px-2 py-1 text-xs">
                          Código: <b>{s.confirmation}</b>
                        </span>
                      )}
                      <a href={mapsLink({ lat: s.lat, lng: s.lng, text: `${s.name} ${s.address}` })} target="_blank" rel="noreferrer" className="vj-chip vj-press">
                        Cómo llegar
                      </a>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noreferrer" className="vj-chip vj-press">
                          Ver reserva ↗
                        </a>
                      )}
                      <button type="button" onClick={() => onEdit(s)} className="vj-chip vj-press ml-auto">
                        ✎ Editar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {points.length > 0 && (
            <div className="vj-card p-3 lg:sticky lg:top-4">
              <TripMap points={points} height={320} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Qué llevar ---------------- */

function Packing({
  items,
  onAdd,
  onToggle,
  onRemove,
  onSuggest,
  onUncheckAll,
}: {
  items: PackItem[];
  onAdd: (name: string, group: PackGroup) => void;
  onToggle: (p: PackItem) => void;
  onRemove: (id: string) => void;
  onSuggest: () => void;
  onUncheckAll: () => void;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<PackGroup>("ropa");
  const done = items.filter((p) => p.checked).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_2fr] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="vj-card p-5 text-center">
          <div
            className="mx-auto grid size-32 place-items-center rounded-full"
            style={{ background: `conic-gradient(var(--vj-teal) ${pct * 3.6}deg, var(--vj-paper-2) 0)` }}
          >
            <div className="grid size-24 place-items-center rounded-full bg-(--vj-card)">
              <span className="vj-serif text-3xl font-semibold">{pct}%</span>
            </div>
          </div>
          <p className="mt-3 text-sm">
            {items.length === 0 ? "Tu lista está vacía" : done === items.length ? "¡Maleta lista! 🧳" : `Llevas ${done} de ${items.length} listos`}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAdd(name.trim(), group);
            setName("");
          }}
          className="vj-card space-y-3 p-4"
        >
          <Field label="Agregar a la lista" htmlFor="p-name">
            <input id="p-name" className="vj-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Traje de baño" maxLength={80} />
          </Field>
          <div className="flex gap-2">
            <select aria-label="Grupo" className="vj-input" value={group} onChange={(e) => setGroup(e.target.value as PackGroup)}>
              {PACK_KEYS.map((k) => (
                <option key={k} value={k}>
                  {PACK_GROUPS[k].emoji} {PACK_GROUPS[k].label}
                </option>
              ))}
            </select>
            <button type="submit" className="vj-btn shrink-0">
              Agregar
            </button>
          </div>
        </form>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSuggest} className="vj-chip vj-press">
            ✨ Agregar lista sugerida
          </button>
          {done > 0 && (
            <button type="button" onClick={onUncheckAll} className="vj-chip vj-press">
              Desmarcar todo
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PACK_KEYS.map((g) => {
          const list = items.filter((p) => p.group === g);
          if (!list.length) return null;
          const ok = list.filter((p) => p.checked).length;
          return (
            <section key={g} className="vj-card overflow-hidden">
              <header className="flex items-center gap-2 border-b border-dashed border-(--vj-line) px-4 py-2.5">
                <span>{PACK_GROUPS[g].emoji}</span>
                <h3 className="vj-serif font-semibold">{PACK_GROUPS[g].label}</h3>
                <span className="vj-mono ml-auto text-xs text-(--vj-mut)">
                  {ok}/{list.length}
                </span>
              </header>
              <ul>
                {list.map((p) => (
                  <li key={p.id} className="vj-row group flex items-center gap-3 px-4 py-2">
                    <button type="button" role="checkbox" aria-checked={p.checked} onClick={() => onToggle(p)} className="vj-check" aria-label={p.name}>
                      {p.checked ? "✓" : ""}
                    </button>
                    <button type="button" onClick={() => onToggle(p)} className={`min-w-0 flex-1 text-left text-sm ${p.checked ? "text-(--vj-mut) line-through" : ""}`}>
                      {p.name}
                    </button>
                    <button type="button" onClick={() => onRemove(p.id)} aria-label={`Quitar ${p.name}`} className="vj-press px-1 text-(--vj-mut) hover:text-(--vj-red)">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Ventanas ---------------- */

function ActivityDialog({
  act,
  trip,
  days,
  onClose,
  onSave,
  onDelete,
}: {
  act: Activity;
  trip: Trip;
  days: string[];
  onClose: () => void;
  onSave: (a: Activity) => void;
  onDelete: (id: string) => void;
}) {
  const [f, setF] = useState(act);
  const [err, setErr] = useState("");
  const set = <K extends keyof Activity>(k: K, v: Activity[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <Modal title={act.id ? "Editar actividad" : "Nueva actividad"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.title.trim()) return setErr("Ponle un nombre a la actividad.");
          onSave({ ...f, title: f.title.trim(), place: f.place.trim() });
        }}
      >
        <div className="max-h-[68dvh] space-y-4 overflow-y-auto px-5 py-4">
          <Field label="¿Qué vas a hacer?" htmlFor="a-title">
            <input id="a-title" className="vj-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej: Tour por el centro histórico" maxLength={80} autoFocus={!act.id} />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Día" htmlFor="a-date">
              <select id="a-date" className="vj-input" value={days.includes(f.date) ? f.date : ""} onChange={(e) => set("date", e.target.value)}>
                {!days.includes(f.date) && <option value="">{shortDate(f.date)}</option>}
                {days.map((d, i) => (
                  <option key={d} value={d}>
                    Día {i + 1} · {weekDay(d)} {shortDate(d)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hora" htmlFor="a-time">
              <input id="a-time" type="time" className="vj-input" value={f.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>
          <Field label="Lugar" htmlFor="a-place">
            <input
              id="a-place"
              className="vj-input"
              value={f.place}
              onChange={(e) => setF((x) => ({ ...x, place: e.target.value }))}
              placeholder="Ej: Plaza de Armas"
              maxLength={120}
            />
            <PlacePicker
              query={f.place || f.title}
              near={trip.destination}
              lat={f.lat}
              lng={f.lng}
              onPick={(p) => setF((x) => ({ ...x, lat: p.lat, lng: p.lng, place: x.place || p.name }))}
              onClear={() => setF((x) => ({ ...x, lat: null, lng: null }))}
            />
          </Field>
          <Field label="Notas" htmlFor="a-notes">
            <textarea id="a-notes" className="vj-input min-h-16" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Ej: comprar entradas antes, llevar efectivo" maxLength={300} />
          </Field>
          {err && <p className="text-sm font-semibold text-(--vj-red)">{err}</p>}
        </div>
        <DialogFooter onClose={onClose} onDelete={act.id ? () => onDelete(act.id) : undefined} />
      </form>
    </Modal>
  );
}

function ExpenseDialog({ exp, trip, onClose, onSave, onDelete }: { exp: Expense; trip: Trip; onClose: () => void; onSave: (e: Expense) => void; onDelete: (id: string) => void }) {
  const [f, setF] = useState(exp);
  const [amount, setAmount] = useState(exp.amount ? String(exp.amount) : "");
  const [err, setErr] = useState("");

  return (
    <Modal title={exp.id ? "Editar gasto" : "Nuevo gasto"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(amount.replace(",", "."));
          if (!(n > 0)) return setErr("Escribe cuánto gastaste.");
          onSave({ ...f, amount: Math.round(n * 100) / 100, note: f.note.trim() });
        }}
      >
        <div className="max-h-[68dvh] space-y-4 overflow-y-auto px-5 py-4">
          <Field label={`Monto (${trip.currency})`} htmlFor="e-amount">
            <input
              id="e-amount"
              inputMode="decimal"
              className="vj-input vj-serif text-3xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="0"
              autoFocus={!exp.id}
            />
          </Field>
          <Field label="Categoría">
            <div className="flex flex-wrap gap-2">
              {EXPENSE_KEYS.map((k) => (
                <button key={k} type="button" onClick={() => setF((x) => ({ ...x, category: k }))} aria-pressed={f.category === k} className="vj-chip vj-press">
                  {EXPENSE_CATS[k].emoji} {EXPENSE_CATS[k].label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Detalle" htmlFor="e-note">
            <input id="e-note" className="vj-input" value={f.note} onChange={(e) => setF((x) => ({ ...x, note: e.target.value }))} placeholder="Ej: Taxi al hotel" maxLength={80} />
          </Field>
          <Field label="Fecha" htmlFor="e-date">
            <input id="e-date" type="date" className="vj-input" value={f.date} onChange={(e) => e.target.value && setF((x) => ({ ...x, date: e.target.value }))} />
          </Field>
          {err && <p className="text-sm font-semibold text-(--vj-red)">{err}</p>}
        </div>
        <DialogFooter onClose={onClose} onDelete={exp.id ? () => onDelete(exp.id) : undefined} />
      </form>
    </Modal>
  );
}

function StayDialog({ stay, trip, onClose, onSave, onDelete }: { stay: Stay; trip: Trip; onClose: () => void; onSave: (s: Stay) => void; onDelete: (id: string) => void }) {
  const [f, setF] = useState(stay);
  const [price, setPrice] = useState(stay.price ? String(stay.price) : "");
  const [err, setErr] = useState("");
  const set = <K extends keyof Stay>(k: K, v: Stay[K]) => setF((x) => ({ ...x, [k]: v }));
  const nights = Math.max(0, daysBetween(f.check_in, f.check_out));

  return (
    <Modal title={stay.id ? "Editar alojamiento" : "Nuevo alojamiento"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.name.trim()) return setErr("Escribe el nombre del hotel o alojamiento.");
          if (f.check_out < f.check_in) return setErr("La salida no puede ser antes de la entrada.");
          const n = Number(price.replace(",", ".")) || 0;
          const url = f.url.trim() && !/^https?:\/\//.test(f.url.trim()) ? `https://${f.url.trim()}` : f.url.trim();
          onSave({ ...f, name: f.name.trim(), address: f.address.trim(), price: Math.max(0, n), url, confirmation: f.confirmation.trim() });
        }}
      >
        <div className="max-h-[68dvh] space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Nombre" htmlFor="s-name">
            <input id="s-name" className="vj-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Hotel Plaza" maxLength={80} autoFocus={!stay.id} />
          </Field>
          <Field label="Dirección" htmlFor="s-addr">
            <input id="s-addr" className="vj-input" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, barrio o zona" maxLength={140} />
            <PlacePicker
              query={f.address || f.name}
              near={trip.destination}
              lat={f.lat}
              lng={f.lng}
              onPick={(p) => setF((x) => ({ ...x, lat: p.lat, lng: p.lng, address: x.address || `${p.name}, ${p.detail}` }))}
              onClear={() => setF((x) => ({ ...x, lat: null, lng: null }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada" htmlFor="s-in">
              <input id="s-in" type="date" className="vj-input" value={f.check_in} onChange={(e) => e.target.value && set("check_in", e.target.value)} />
            </Field>
            <Field label="Salida" htmlFor="s-out">
              <input id="s-out" type="date" className="vj-input" value={f.check_out} min={f.check_in} onChange={(e) => e.target.value && set("check_out", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <Field label={`Precio total (${nights} ${nights === 1 ? "noche" : "noches"})`} htmlFor="s-price">
              <input id="s-price" inputMode="decimal" className="vj-input" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" />
            </Field>
            <button type="button" role="switch" aria-checked={f.paid} onClick={() => set("paid", !f.paid)} className="vj-chip vj-press h-[46px] px-4" style={f.paid ? { background: "var(--vj-teal)", borderColor: "var(--vj-teal)", color: "#fffdf7" } : undefined}>
              {f.paid ? "✓ Pagado" : "Por pagar"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código de reserva" htmlFor="s-code">
              <input id="s-code" className="vj-input vj-mono" value={f.confirmation} onChange={(e) => set("confirmation", e.target.value)} placeholder="Opcional" maxLength={40} />
            </Field>
            <Field label="Enlace de la reserva" htmlFor="s-url">
              <input id="s-url" className="vj-input" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="Opcional" maxLength={300} />
            </Field>
          </div>
          {err && <p className="text-sm font-semibold text-(--vj-red)">{err}</p>}
        </div>
        <DialogFooter onClose={onClose} onDelete={stay.id ? () => onDelete(stay.id) : undefined} />
      </form>
    </Modal>
  );
}
