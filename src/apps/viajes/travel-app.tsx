"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import "./viajes.css";
import { emptyTrip } from "./seed";
import type { TripStore } from "./store";
import { TripView } from "./trip-view";
import type { Trip } from "./types";
import { DialogFooter, Field, Modal } from "./ui";
import { addDays, CURRENCIES, daysBetween, FLAGS, money, rangeLabel, today, TRIP_COLORS, tripStatus, uid } from "./utils";

type Props = {
  store: TripStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

export function TravelApp({ store, topBar }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const load = useCallback(async () => {
    try {
      setTrips(await store.listTrips());
    } catch (e) {
      say(`No se pudieron cargar tus viajes: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [store, say]);

  useEffect(() => {
    // Se espera un instante para no actualizar la pantalla mientras se dibuja.
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function run(task: () => Promise<void>, ok: string) {
    try {
      await task();
      say(ok);
    } catch (e) {
      say(`No se pudo guardar: ${(e as Error).message}`);
      load();
    }
  }

  const saveTrip = (t: Trip) => {
    const isNew = !t.id;
    const trip = isNew ? { ...t, id: uid() } : t;
    setTrips((list) => (isNew ? [...list, trip] : list.map((x) => (x.id === trip.id ? trip : x))));
    setEditTrip(null);
    if (isNew) setOpenId(trip.id);
    run(() => store.saveTrip(trip), isNew ? "¡Viaje creado! Buen viaje ✈️" : "Viaje guardado");
  };
  const deleteTrip = (id: string) => {
    setTrips((list) => list.filter((x) => x.id !== id));
    setEditTrip(null);
    setOpenId(null);
    run(() => store.deleteTrip(id), "Viaje eliminado");
  };

  const open = trips.find((t) => t.id === openId);

  return (
    <div className="vj">
      {topBar}
      {open ? (
        <TripView key={open.id} trip={open} store={store} say={say} onBack={() => setOpenId(null)} onEditTrip={() => setEditTrip(open)} />
      ) : (
        <TripList trips={trips} loading={loading} onOpen={setOpenId} onNew={() => setEditTrip(emptyTrip())} />
      )}

      {editTrip && <TripDialog trip={editTrip} onClose={() => setEditTrip(null)} onSave={saveTrip} onDelete={deleteTrip} />}

      {toast && (
        <div role="status" className="vj-fade fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-(--vj-ink) px-4 py-2 text-sm font-semibold text-[#fffdf7] shadow-lg sm:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- Portada: mis viajes ---------------- */

function TripList({ trips, loading, onOpen, onNew }: { trips: Trip[]; loading: boolean; onOpen: (id: string) => void; onNew: () => void }) {
  const t = today();
  const upcoming = trips.filter((x) => x.end_date >= t).sort((a, b) => (a.start_date < b.start_date ? -1 : 1));
  const past = trips.filter((x) => x.end_date < t).sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  const next = upcoming[0];
  const countries = new Set(past.map((x) => x.flag)).size;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
      {/* Tapa del pasaporte */}
      <header className="relative overflow-hidden rounded-2xl bg-(--vj-ink) px-6 py-7 text-[#f3e6c4] shadow-[0_20px_50px_-24px_rgba(29,43,79,0.8)] sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full border-[18px] border-[#f3e6c4]/8" />
        <div className="pointer-events-none absolute -right-2 -bottom-24 size-56 rounded-full border-[10px] border-[#f3e6c4]/6" />
        <p className="vj-mono text-[11px] tracking-[0.3em] uppercase opacity-80">Pasaporte de viajes</p>
        <h1 className="vj-serif mt-2 text-4xl leading-[1.05] font-semibold sm:text-5xl">
          Mis viajes<span className="text-(--vj-gold)">.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#f3e6c4]/80">
          Destino, hotel, presupuesto, gastos, itinerario día por día y la lista de qué llevar. Todo en un solo lugar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="button" onClick={onNew} className="vj-btn vj-btn-red">
            + Nuevo viaje
          </button>
          {!loading && (
            <div className="vj-mono flex gap-5 text-xs text-[#f3e6c4]/85">
              <span>
                <b className="text-lg text-[#f3e6c4]">{upcoming.length}</b> por venir
              </span>
              <span>
                <b className="text-lg text-[#f3e6c4]">{past.length}</b> {past.length === 1 ? "sello" : "sellos"}
              </span>
              {countries > 0 && (
                <span>
                  <b className="text-lg text-[#f3e6c4]">{countries}</b> {countries === 1 ? "destino" : "destinos"}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-(--vj-paper-2)" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-(--vj-line) px-6 py-14 text-center">
          <p className="vj-serif text-2xl">Tu pasaporte está en blanco</p>
          <p className="mt-2 text-sm text-(--vj-mut)">Crea tu primer viaje y empieza a planificar.</p>
          <button type="button" onClick={onNew} className="vj-btn mt-5">
            + Crear mi primer viaje
          </button>
        </div>
      ) : (
        <>
          {next && (
            <Section title="Próximos viajes">
              {upcoming.map((x, i) => (
                <Postcard key={x.id} trip={x} tilt={i % 2 ? 0.6 : -0.6} onOpen={() => onOpen(x.id)} />
              ))}
              <button
                type="button"
                onClick={onNew}
                className="vj-press grid min-h-40 place-items-center rounded-xl border-2 border-dashed border-(--vj-line) p-6 text-center text-(--vj-mut) transition-colors hover:border-(--vj-mut) hover:text-(--vj-ink)"
              >
                <span>
                  <span className="vj-serif block text-4xl leading-none">+</span>
                  <span className="mt-2 block text-sm font-semibold">Planear otro viaje</span>
                </span>
              </button>
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Sellos de viajes pasados">
              {past.map((x, i) => (
                <Postcard key={x.id} trip={x} tilt={i % 2 ? -0.5 : 0.5} onOpen={() => onOpen(x.id)} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="vj-mono mb-4 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-(--vj-mut) uppercase">
        {title}
        <span className="h-px flex-1 border-t border-dashed border-(--vj-line)" />
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Postcard({ trip, tilt, onOpen }: { trip: Trip; tilt: number; onOpen: () => void }) {
  const st = tripStatus(trip);
  const days = daysBetween(trip.start_date, trip.end_date) + 1;
  return (
    <button type="button" onClick={onOpen} className="vj-postcard vj-fade block w-full text-left" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className="vj-postcard-face flex h-44 flex-col justify-between p-5 sm:h-48" style={{ backgroundColor: trip.color }}>
        <div className="flex items-start justify-between gap-3">
          <p className="vj-mono text-[11px] tracking-[0.2em] uppercase opacity-90">Saludos desde</p>
          <span className="text-3xl leading-none drop-shadow">{trip.flag}</span>
        </div>
        <div>
          <p className="vj-serif text-[28px] leading-[1.05] font-semibold sm:text-3xl">{trip.name || trip.destination}</p>
          <p className="mt-1 text-sm opacity-90">{trip.destination}</p>
        </div>
        {/* Estampilla */}
        <div className="absolute right-4 bottom-4 hidden rotate-3 border-2 border-dashed border-white/70 px-2 py-1.5 text-center sm:block">
          <p className="vj-mono text-[9px] leading-tight tracking-widest uppercase opacity-90">Correo</p>
          <p className="vj-serif text-lg leading-none font-bold">{days}d</p>
        </div>
      </div>
      <div className="flex items-center gap-3 px-2 pt-3 pb-1.5">
        <div className="min-w-0">
          <p className="vj-mono text-xs font-bold text-(--vj-ink)">{rangeLabel(trip.start_date, trip.end_date)}</p>
          <p className="text-xs text-(--vj-mut)">
            {days} {days === 1 ? "día" : "días"} · {trip.travelers} {trip.travelers === 1 ? "viajero" : "viajeros"}
            {trip.budget ? ` · ${money(trip.budget, trip.currency)}` : ""}
          </p>
        </div>
        <span
          className="vj-stamp vj-stamp-in ml-auto shrink-0"
          style={{ color: st.kind === "visitado" ? "var(--vj-red)" : st.kind === "viajando" ? "var(--vj-teal)" : "var(--vj-ink)", ["--r" as string]: "-7deg" }}
        >
          {st.label}
        </span>
      </div>
    </button>
  );
}

/* ---------------- Crear / editar viaje ---------------- */

function TripDialog({ trip, onClose, onSave, onDelete }: { trip: Trip; onClose: () => void; onSave: (t: Trip) => void; onDelete: (id: string) => void }) {
  const [f, setF] = useState(trip);
  const [budget, setBudget] = useState(trip.budget ? String(trip.budget) : "");
  const [err, setErr] = useState("");
  const set = <K extends keyof Trip>(k: K, v: Trip[K]) => setF((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.destination.trim()) return setErr("¿A dónde vas? Escribe el destino.");
    if (f.end_date < f.start_date) return setErr("La vuelta no puede ser antes de la ida.");
    if (daysBetween(f.start_date, f.end_date) > 59) return setErr("El viaje puede durar hasta 60 días.");
    const b = Number(budget.replace(",", "."));
    onSave({ ...f, destination: f.destination.trim(), name: f.name.trim(), budget: budget && b > 0 ? b : null, travelers: Math.max(1, f.travelers) });
  }

  return (
    <Modal title={trip.id ? "Editar viaje" : "Nuevo viaje"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="max-h-[68dvh] space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Destino" htmlFor="t-dest">
            <input id="t-dest" className="vj-input" value={f.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Ej: Cusco, Perú" autoFocus={!trip.id} />
          </Field>
          <Field label="Nombre del viaje (opcional)" htmlFor="t-name">
            <input id="t-name" className="vj-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Luna de miel, Viaje con amigos" maxLength={60} />
          </Field>
          <Field label="Bandera o ícono">
            <div className="flex flex-wrap gap-1.5">
              {FLAGS.map((fl) => (
                <button key={fl} type="button" onClick={() => set("flag", fl)} aria-pressed={f.flag === fl} className="vj-chip vj-press px-2 text-lg">
                  {fl}
                </button>
              ))}
              <input aria-label="Otro emoji" className="vj-input w-16 px-2 py-1 text-center" value={FLAGS.includes(f.flag) ? "" : f.flag} onChange={(e) => set("flag", e.target.value || "✈️")} placeholder="otro" />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ida" htmlFor="t-start">
              <input
                id="t-start"
                type="date"
                className="vj-input"
                value={f.start_date}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const len = daysBetween(f.start_date, f.end_date);
                  setF((x) => ({ ...x, start_date: v, end_date: x.end_date < v ? v : x.end_date === trip.end_date && !trip.id ? addDays(v, Math.max(0, len)) : x.end_date }));
                }}
              />
            </Field>
            <Field label="Vuelta" htmlFor="t-end">
              <input id="t-end" type="date" className="vj-input" value={f.end_date} min={f.start_date} onChange={(e) => e.target.value && set("end_date", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Presupuesto total" htmlFor="t-budget">
              <input id="t-budget" inputMode="decimal" className="vj-input" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ej: 1500" />
            </Field>
            <Field label="Moneda" htmlFor="t-cur">
              <select id="t-cur" className="vj-input" value={f.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="¿Cuántos viajan?">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => set("travelers", Math.max(1, f.travelers - 1))} className="vj-btn-ghost size-10 p-0" aria-label="Menos">
                −
              </button>
              <span className="vj-mono w-10 text-center text-lg font-bold">{f.travelers}</span>
              <button type="button" onClick={() => set("travelers", Math.min(30, f.travelers + 1))} className="vj-btn-ghost size-10 p-0" aria-label="Más">
                +
              </button>
            </div>
          </Field>
          <Field label="Color de la postal">
            <div className="flex gap-2">
              {TRIP_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={f.color === c}
                  className="vj-press size-9 rounded-full border-[3px] transition-[border-color]"
                  style={{ background: c, borderColor: f.color === c ? "var(--vj-ink)" : "#fffdf7" }}
                />
              ))}
            </div>
          </Field>
          <Field label="Notas" htmlFor="t-notes">
            <textarea id="t-notes" className="vj-input min-h-20" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Ej: llevar efectivo, vacunas, contactos…" maxLength={600} />
          </Field>
          {err && <p className="text-sm font-semibold text-(--vj-red)">{err}</p>}
        </div>
        <DialogFooter onClose={onClose} onDelete={trip.id ? () => onDelete(trip.id) : undefined} saveLabel={trip.id ? "Guardar" : "Crear viaje"} />
      </form>
    </Modal>
  );
}

