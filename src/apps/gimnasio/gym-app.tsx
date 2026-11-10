"use client";

import { Barlow_Condensed, Inter } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ACCENT, BarChart, Heatmap, LineChart } from "./charts";
import "./gym.css";
import { defaultExercises, defaultRoutines } from "./seed";
import type { GymStore } from "./store";
import type { Exercise, Muscle, Routine, RoutineItem, Workout, WorkSet } from "./types";
import {
  ago,
  bestSet,
  dayTitle,
  daysBetween,
  downloadCSV,
  exerciseHistory,
  fromISO,
  MUSCLES,
  muscleColor,
  num,
  oneRM,
  PALETTE,
  personalRecords,
  shortDate,
  today,
  uid,
  volume,
  weekBuckets,
  weekStreak,
  type Unit,
} from "./utils";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--gym-display" });
const body = Inter({ subsets: ["latin"], variable: "--gym-body" });

type Tab = "inicio" | "historial" | "progreso" | "rutinas";
const UNIT_KEY = "gimnasio-unidad";
const EMOJIS = ["🏋️", "🧗", "🦵", "💪", "🔥", "⚡", "🏃", "🤸", "🥊", "🚴", "🧘", "🎯"];

type Props = {
  store: GymStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

export function GymApp({ store, topBar }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inicio");
  const [unit, setUnit] = useState<Unit>("kg");
  const [progressId, setProgressId] = useState<string | null>(null);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const load = useCallback(async () => {
    try {
      let ex = await store.listExercises();
      let rs = await store.listRoutines();
      // Cuenta nueva: empieza con ejercicios y rutinas de ejemplo.
      if (ex.length === 0) {
        ex = defaultExercises();
        for (const e of ex) await store.saveExercise(e);
        if (rs.length === 0) {
          rs = defaultRoutines(ex);
          for (const r of rs) await store.saveRoutine(r);
        }
      }
      setExercises(ex);
      setRoutines(rs);
      setWorkouts(await store.listWorkouts());
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
        const saved = localStorage.getItem(UNIT_KEY);
        if (saved === "kg" || saved === "lb") setUnit(saved);
      } catch {}
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const changeUnit = (u: Unit) => {
    setUnit(u);
    try {
      localStorage.setItem(UNIT_KEY, u);
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
  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

  const saveWorkout = (w: Workout) => {
    const isNew = !workouts.some((x) => x.id === w.id);
    const next = upsert(workouts, w);
    const newPRs = isNew ? personalRecords(next).length - personalRecords(workouts).length : 0;
    setWorkouts(next);
    setEditWorkout(null);
    run(() => store.saveWorkout(w), newPRs > 0 ? `🏆 ¡Guardado con ${newPRs} récord${newPRs === 1 ? "" : "s"} nuevo${newPRs === 1 ? "" : "s"}!` : "Entrenamiento guardado");
  };
  const deleteWorkout = (id: string) => {
    setWorkouts((l) => l.filter((x) => x.id !== id));
    setEditWorkout(null);
    run(() => store.deleteWorkout(id), "Entrenamiento eliminado");
  };
  const saveRoutine = (r: Routine) => {
    setRoutines((l) => (l.some((x) => x.id === r.id) ? l.map((x) => (x.id === r.id ? r : x)) : [...l, r]));
    setEditRoutine(null);
    run(() => store.saveRoutine(r), "Rutina guardada");
  };
  const deleteRoutine = (id: string) => {
    setRoutines((l) => l.filter((x) => x.id !== id));
    setWorkouts((l) => l.map((w) => (w.routine_id === id ? { ...w, routine_id: null } : w)));
    setEditRoutine(null);
    run(() => store.deleteRoutine(id), "Rutina eliminada");
  };
  const saveExercise = (e: Exercise) => {
    setExercises((l) => (l.some((x) => x.id === e.id) ? l.map((x) => (x.id === e.id ? e : x)) : [...l, e]));
    setEditExercise(null);
    run(() => store.saveExercise(e), "Ejercicio guardado");
  };
  const deleteExercise = (id: string) => {
    // También lo saca de las rutinas donde estaba.
    const touched = routines.filter((r) => r.items.some((i) => i.exercise_id === id)).map((r) => ({ ...r, items: r.items.filter((i) => i.exercise_id !== id) }));
    setExercises((l) => l.filter((x) => x.id !== id));
    setRoutines((l) => l.map((r) => touched.find((t) => t.id === r.id) ?? r));
    setEditExercise(null);
    run(async () => {
      for (const r of touched) await store.saveRoutine(r);
      await store.deleteExercise(id);
    }, "Ejercicio eliminado");
  };

  const exById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const sorted = useMemo(() => [...workouts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)), [workouts]);

  // Arma un entrenamiento nuevo. Si viene de una rutina, pone el peso que usaste la última vez.
  const start = (r: Routine | null) => {
    const sets: WorkSet[] = [];
    if (r) {
      for (const it of r.items) {
        const last = sorted.find((w) => w.sets.some((s) => s.exercise_id === it.exercise_id));
        const lastBest = last ? bestSet(last.sets.filter((s) => s.exercise_id === it.exercise_id)) : null;
        for (let i = 0; i < it.sets; i++) sets.push({ exercise_id: it.exercise_id, weight: lastBest?.weight ?? 0, reps: it.reps });
      }
    }
    setEditWorkout({ id: "", date: today(), name: r?.name ?? "Entrenamiento libre", routine_id: r?.id ?? null, duration: null, note: "", sets });
  };

  const openProgress = (id: string) => {
    setProgressId(id);
    setTab("progreso");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`gym ${display.variable} ${body.variable}`}>
      {topBar}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 sm:pt-7">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-(--g-lime) text-(--g-lime-ink) shadow-[0_8px_24px_-10px_rgba(198,242,78,0.7)]">
              <Dumbbell />
            </span>
            <div>
              <h1 className="gym-display text-[28px]">Mi gimnasio</h1>
              <p className="gym-mut text-xs">Rutinas, pesos y progreso</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="gym-seg" role="group" aria-label="Unidad de peso">
              {(["kg", "lb"] as const).map((u) => (
                <button key={u} type="button" aria-pressed={unit === u} onClick={() => changeUnit(u)}>
                  {u}
                </button>
              ))}
            </div>
            <span className="hidden sm:inline">
              <button type="button" onClick={() => start(nextRoutine(routines, sorted))} className="gym-btn">
                <Play /> Entrenar
              </button>
            </span>
          </div>
        </div>

        {/* Pestañas */}
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-(--g-line)" aria-label="Secciones">
          {(
            [
              ["inicio", "Inicio"],
              ["historial", "Historial"],
              ["progreso", "Progreso"],
              ["rutinas", "Rutinas"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`press relative shrink-0 px-3.5 pt-1 pb-3 text-sm transition-colors ${tab === k ? "font-semibold text-(--g-text)" : "gym-mut hover:text-(--g-text)"}`}
            >
              {label}
              {tab === k && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-(--g-lime)" />}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="gym-card h-28 animate-pulse" />
            ))}
          </div>
        ) : tab === "inicio" ? (
          <Home
            workouts={sorted}
            routines={routines}
            exById={exById}
            unit={unit}
            onStart={start}
            onOpen={setEditWorkout}
            onProgress={openProgress}
            onSeeAll={() => setTab("historial")}
          />
        ) : tab === "historial" ? (
          <History workouts={sorted} routines={routines} exById={exById} unit={unit} onOpen={setEditWorkout} onStart={() => start(null)} />
        ) : tab === "progreso" ? (
          <Progress workouts={sorted} exercises={exercises} unit={unit} selected={progressId} onSelect={setProgressId} onOpen={(id) => setEditWorkout(workouts.find((w) => w.id === id) ?? null)} />
        ) : (
          <Routines
            routines={routines}
            exercises={exercises}
            workouts={sorted}
            exById={exById}
            onStart={start}
            onEditRoutine={setEditRoutine}
            onNewRoutine={() => setEditRoutine({ id: "", name: "", emoji: "🔥", color: PALETTE[routines.length % PALETTE.length], items: [] })}
            onEditExercise={setEditExercise}
            onNewExercise={() => setEditExercise({ id: "", name: "", muscle: "Pecho" })}
            onProgress={openProgress}
          />
        )}
      </div>

      {/* Botón flotante en el celular */}
      <div className="fixed right-5 bottom-5 z-20 sm:hidden">
        <button type="button" onClick={() => start(nextRoutine(routines, sorted))} aria-label="Entrenar" className="gym-btn size-14 rounded-2xl p-0">
          <Play size={22} />
        </button>
      </div>

      {editWorkout && (
        <WorkoutDialog
          workout={editWorkout}
          exercises={exercises}
          history={sorted}
          unit={unit}
          onClose={() => setEditWorkout(null)}
          onSave={saveWorkout}
          onDelete={deleteWorkout}
        />
      )}
      {editRoutine && (
        <RoutineDialog
          routine={editRoutine}
          exercises={exercises}
          onClose={() => setEditRoutine(null)}
          onSave={saveRoutine}
          onDelete={deleteRoutine}
        />
      )}
      {editExercise && (
        <ExerciseDialog
          exercise={editExercise}
          used={workouts.filter((w) => w.sets.some((s) => s.exercise_id === editExercise.id)).length}
          onClose={() => setEditExercise(null)}
          onSave={saveExercise}
          onDelete={deleteExercise}
        />
      )}

      {toast && (
        <div
          role="status"
          className="gym-rise fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-(--g-lime) px-4 py-2 text-sm font-semibold text-(--g-lime-ink) shadow-lg sm:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// La rutina que toca hoy: la que sigue a la última que hiciste.
function nextRoutine(routines: Routine[], sorted: Workout[]) {
  if (routines.length === 0) return null;
  const last = sorted.find((w) => w.routine_id && routines.some((r) => r.id === w.routine_id));
  if (!last) return routines[0];
  const i = routines.findIndex((r) => r.id === last.routine_id);
  return routines[(i + 1) % routines.length];
}

const exName = (exById: Map<string, Exercise>, id: string) => exById.get(id)?.name ?? "Ejercicio eliminado";

/* ---------------- Inicio ---------------- */

function Home({
  workouts,
  routines,
  exById,
  unit,
  onStart,
  onOpen,
  onProgress,
  onSeeAll,
}: {
  workouts: Workout[];
  routines: Routine[];
  exById: Map<string, Exercise>;
  unit: Unit;
  onStart: (r: Routine | null) => void;
  onOpen: (w: Workout) => void;
  onProgress: (id: string) => void;
  onSeeAll: () => void;
}) {
  const t = today();
  const next = nextRoutine(routines, workouts);
  const last = workouts[0];
  const trainedToday = last?.date === t;

  const in30 = useMemo(() => workouts.filter((w) => daysBetween(w.date, t) < 30), [workouts, t]);
  const prev30 = workouts.filter((w) => daysBetween(w.date, t) >= 30 && daysBetween(w.date, t) < 60);
  const weeks = useMemo(() => weekBuckets(workouts, 12), [workouts]);
  const thisWeek = weeks[weeks.length - 1];
  const lastWeek = weeks[weeks.length - 2];
  const streak = weekStreak(workouts);
  const records = useMemo(() => personalRecords(workouts), [workouts]);
  const records30 = records.filter((r) => daysBetween(r.date, t) < 30);

  const heat = useMemo(() => {
    const m = new Map<string, { count: number; tip: string }>();
    for (const w of workouts) {
      const cur = m.get(w.date);
      const tip = `${dayTitle(w.date)}: ${w.name} · ${num(volume(w.sets))} ${unit}`;
      m.set(w.date, { count: (cur?.count ?? 0) + 1, tip: cur ? `${cur.tip} + ${w.name}` : tip });
    }
    return m;
  }, [workouts, unit]);

  // Series por grupo muscular en los últimos 30 días.
  const muscles = useMemo(() => {
    const m = new Map<Muscle, number>();
    for (const w of in30) for (const s of w.sets) {
      const mu = exById.get(s.exercise_id)?.muscle;
      if (mu) m.set(mu, (m.get(mu) ?? 0) + 1);
    }
    return MUSCLES.map((x) => ({ ...x, sets: m.get(x.name) ?? 0 }));
  }, [in30, exById]);
  const maxSets = Math.max(1, ...muscles.map((m) => m.sets));

  return (
    <div className="mt-6 space-y-4">
      {/* Lo que toca hoy */}
      <section className="gym-card gym-rise relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full opacity-25 blur-3xl" style={{ background: next?.color ?? ACCENT }} />
        <div className="relative flex flex-wrap items-end gap-5">
          <div className="min-w-0">
            <p className="gym-label">{trainedToday ? "Hoy ya entrenaste 💪" : "Hoy toca"}</p>
            <p className="gym-display text-5xl sm:text-6xl" style={{ color: next?.color ?? ACCENT }}>
              {next ? `${next.emoji} ${next.name}` : "Entrenamiento libre"}
            </p>
            <p className="gym-mut mt-2 text-sm">
              {next ? `${next.items.length} ejercicios · ${next.items.reduce((s, i) => s + i.sets, 0)} series` : "Crea una rutina en la pestaña Rutinas"}
              {last && ` · Último: ${last.name}, ${ago(last.date)}`}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" className="gym-btn px-5 py-3 text-base" onClick={() => onStart(next)}>
              <Play /> Empezar
            </button>
            {routines
              .filter((r) => r.id !== next?.id)
              .map((r) => (
                <button key={r.id} type="button" className="gym-btn-ghost py-3" onClick={() => onStart(r)}>
                  {r.emoji} {r.name}
                </button>
              ))}
            <button type="button" className="gym-btn-ghost py-3" onClick={() => onStart(null)}>
              Libre
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Últimos 30 días" value={String(in30.length)} unit={in30.length === 1 ? "sesión" : "sesiones"} sub={prev30.length ? deltaText(in30.length - prev30.length, "vs. los 30 anteriores") : in30.length ? "Sigue así" : "¡Empieza hoy!"} />
        <Stat label="Racha" value={String(streak)} unit={streak === 1 ? "semana" : "semanas"} sub="seguidas entrenando" lime={streak >= 2} />
        <Stat
          label="Volumen esta semana"
          value={num(thisWeek.volume, true)}
          unit={unit}
          sub={lastWeek.volume ? `Semana pasada: ${num(lastWeek.volume, true)} ${unit}` : "Peso × repeticiones"}
        />
        <Stat label="Récords (30 días)" value={String(records30.length)} unit="🏆" sub={records30.length ? "Nuevas mejores marcas" : "Aún no hay"} lime={records30.length > 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="gym-card p-4 sm:p-5">
          <Title>Volumen por semana</Title>
          <p className="gym-mut mt-1 text-xs">Últimas 12 semanas · cuánto peso moviste en total</p>
          <div className="mt-3">
            <BarChart
              label="Volumen por semana"
              fmt={(n) => num(n, true)}
              data={weeks.map((w) => ({
                key: w.key,
                label: w.label,
                value: w.volume,
                tip: (
                  <>
                    <p className="mb-1 font-semibold">
                      Semana del {shortDate(w.from)} al {shortDate(w.to)}
                    </p>
                    <p className="gym-mut">
                      {w.count} entrenamiento{w.count === 1 ? "" : "s"} · <b className="text-(--g-text)">{num(w.volume)} {unit}</b>
                    </p>
                  </>
                ),
              }))}
            />
          </div>
        </section>

        <section className="gym-card p-4 sm:p-5">
          <Title>Músculos trabajados</Title>
          <p className="gym-mut mt-1 text-xs">Series en los últimos 30 días</p>
          <ul className="mt-4 space-y-3">
            {muscles.map((m) => (
              <li key={m.name}>
                <div className="flex items-baseline text-sm">
                  <span>{m.name}</span>
                  <span className="gym-mut ml-auto text-xs tabular-nums">{m.sets} series</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-(--g-card-2)">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(m.sets / maxSets) * 100}%`, background: m.color }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="gym-card p-4 sm:p-5">
          <Title>Constancia</Title>
          <p className="gym-mut mt-1 mb-3 text-xs">Cada cuadrito es un día · {workouts.filter((w) => daysBetween(w.date, t) < 140).length} entrenamientos en 20 semanas</p>
          <Heatmap days={heat} />
        </section>

        <section className="gym-card p-4 sm:p-5">
          <Title>Récords recientes 🏆</Title>
          <ul className="mt-2 divide-y divide-(--g-line)">
            {records.length === 0 && <li className="gym-mut py-3 text-sm">Cuando superes una marca, aparece aquí.</li>}
            {records.slice(0, 5).map((r) => (
              <li key={r.exercise_id + r.date}>
                <button type="button" onClick={() => onProgress(r.exercise_id)} className="gym-row press flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: muscleColor(exById.get(r.exercise_id)?.muscle) }} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{exName(exById, r.exercise_id)}</span>
                    <span className="gym-mut block text-xs">{ago(r.date)}</span>
                  </span>
                  <span className="gym-display ml-auto shrink-0 text-xl text-(--g-lime) tabular-nums">
                    {r.set.weight > 0 ? `${num(r.set.weight)} ${unit} × ${r.set.reps}` : `${r.set.reps} reps`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="gym-card p-4 sm:p-5">
        <div className="flex items-center">
          <Title>Últimos entrenamientos</Title>
          <button type="button" onClick={onSeeAll} className="ml-auto text-sm font-semibold text-(--g-lime)">
            Ver todos →
          </button>
        </div>
        <ul className="mt-2 divide-y divide-(--g-line)">
          {workouts.length === 0 && <li className="gym-mut py-3 text-sm">Aún no hay entrenamientos. Toca “Empezar”.</li>}
          {workouts.slice(0, 4).map((w) => (
            <WorkoutRow key={w.id} w={w} routines={routines} exById={exById} unit={unit} onClick={() => onOpen(w)} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function deltaText(d: number, rest: string) {
  if (d === 0) return `Igual ${rest}`;
  return `${d > 0 ? "▲" : "▼"} ${Math.abs(d)} ${rest}`;
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="gym-display text-xl">{children}</h2>;
}

function Stat({ label, value, unit, sub, lime }: { label: string; value: string; unit: string; sub: string; lime?: boolean }) {
  return (
    <div className="gym-card p-4">
      <p className="gym-label mb-0">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className={`gym-display text-[40px] tabular-nums ${lime ? "text-(--g-lime)" : ""}`}>{value}</span>
        <span className="gym-mut text-sm">{unit}</span>
      </p>
      <p className="gym-mut mt-1 truncate text-xs">{sub}</p>
    </div>
  );
}

function WorkoutRow({ w, routines, exById, unit, onClick }: { w: Workout; routines: Routine[]; exById: Map<string, Exercise>; unit: Unit; onClick: () => void }) {
  const r = routines.find((x) => x.id === w.routine_id);
  const exIds = [...new Set(w.sets.map((s) => s.exercise_id))];
  return (
    <li>
      <button type="button" onClick={onClick} className="gym-row press flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl text-lg" style={{ background: `${r?.color ?? "#7d8696"}22`, boxShadow: `inset 0 0 0 1px ${r?.color ?? "#7d8696"}44` }}>
          {r?.emoji ?? "⚡"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{w.name}</span>
          <span className="gym-mut block truncate text-xs">
            {dayTitle(w.date)} · {exIds.length} ejercicios · {w.sets.length} series{w.duration ? ` · ${w.duration} min` : ""}
          </span>
          <span className="gym-mut hidden truncate text-xs sm:block">{exIds.map((id) => exName(exById, id)).join(", ")}</span>
        </span>
        <span className="ml-auto shrink-0 text-right">
          <span className="gym-display block text-xl tabular-nums">{num(volume(w.sets), true)}</span>
          <span className="gym-mut block text-[11px]">{unit} movidos</span>
        </span>
      </button>
    </li>
  );
}

/* ---------------- Historial ---------------- */

function History({
  workouts,
  routines,
  exById,
  unit,
  onOpen,
  onStart,
}: {
  workouts: Workout[];
  routines: Routine[];
  exById: Map<string, Exercise>;
  unit: Unit;
  onOpen: (w: Workout) => void;
  onStart: () => void;
}) {
  const [filter, setFilter] = useState("");
  const list = workouts.filter((w) => (filter ? (filter === "-" ? !w.routine_id : w.routine_id === filter) : true));

  // Agrupado por mes.
  const months = useMemo(() => {
    const m = new Map<string, Workout[]>();
    for (const w of list) m.set(w.date.slice(0, 7), [...(m.get(w.date.slice(0, 7)) ?? []), w]);
    return [...m.entries()];
  }, [list]);

  const exportCSV = () =>
    downloadCSV(
      ["Fecha", "Entrenamiento", "Ejercicio", "Grupo", "Serie", `Peso (${unit})`, "Repeticiones"],
      list.flatMap((w) => {
        const count = new Map<string, number>();
        return w.sets.map((s) => {
          const n = (count.get(s.exercise_id) ?? 0) + 1;
          count.set(s.exercise_id, n);
          return [w.date, w.name, exName(exById, s.exercise_id), exById.get(s.exercise_id)?.muscle ?? "", n, s.weight, s.reps];
        });
      }),
      "entrenamientos.csv",
    );

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Rutina" className="gym-input h-10 w-auto py-0 text-sm">
          <option value="">Todas las rutinas</option>
          {routines.map((r) => (
            <option key={r.id} value={r.id}>
              {r.emoji} {r.name}
            </option>
          ))}
          <option value="-">Entrenamientos libres</option>
        </select>
        <span className="gym-mut text-sm">
          {list.length} entrenamiento{list.length === 1 ? "" : "s"}
        </span>
        <button type="button" onClick={exportCSV} className="gym-btn-ghost ml-auto h-10 py-0" disabled={list.length === 0}>
          ↓ Excel (CSV)
        </button>
      </div>

      {months.length === 0 ? (
        <div className="gym-card p-8 text-center">
          <p className="font-semibold">No hay entrenamientos{filter ? " con ese filtro" : ""}.</p>
          <button type="button" className="gym-btn mt-4" onClick={onStart}>
            <Play /> Registrar uno
          </button>
        </div>
      ) : (
        months.map(([key, items]) => {
          const d = fromISO(`${key}-01`);
          const label = d.toLocaleDateString("es-419", { month: "long", year: "numeric" });
          return (
            <section key={key} className="gym-card px-3 py-2 sm:px-4">
              <div className="flex items-baseline px-2 pt-2 pb-1">
                <h3 className="gym-display text-lg">{label}</h3>
                <span className="gym-mut ml-auto text-xs tabular-nums">
                  {items.length} sesiones · {num(items.reduce((s, w) => s + volume(w.sets), 0), true)} {unit}
                </span>
              </div>
              <ul className="divide-y divide-(--g-line)">
                {items.map((w) => (
                  <WorkoutRow key={w.id} w={w} routines={routines} exById={exById} unit={unit} onClick={() => onOpen(w)} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

/* ---------------- Progreso ---------------- */

type Metric = "fuerza" | "peso" | "volumen";

function Progress({
  workouts,
  exercises,
  unit,
  selected,
  onSelect,
  onOpen,
}: {
  workouts: Workout[];
  exercises: Exercise[];
  unit: Unit;
  selected: string | null;
  onSelect: (id: string) => void;
  onOpen: (workoutId: string) => void;
}) {
  // Por defecto, el ejercicio que más has hecho.
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of workouts) for (const id of new Set(w.sets.map((s) => s.exercise_id))) m.set(id, (m.get(id) ?? 0) + 1);
    return m;
  }, [workouts]);
  const fallback = [...exercises].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))[0]?.id ?? null;
  const exId = selected && exercises.some((e) => e.id === selected) ? selected : fallback;
  const ex = exercises.find((e) => e.id === exId);
  const bodyweight = useMemo(() => exerciseHistory(workouts, exId ?? "").every((p) => p.maxWeight <= 0), [workouts, exId]);
  const [metricPick, setMetric] = useState<Metric>("fuerza");
  const metric: Metric = bodyweight ? "peso" : metricPick;

  const hist = useMemo(() => (exId ? exerciseHistory(workouts, exId) : []), [workouts, exId]);
  const value = (p: (typeof hist)[number]) => (bodyweight ? p.maxReps : metric === "fuerza" ? p.e1rm : metric === "peso" ? p.maxWeight : p.volume);
  const fmt = (n: number) => (bodyweight ? `${num(n)} reps` : `${num(n, metric === "volumen")} ${unit}`);

  const records = markRecords(hist.map(value));
  const points = hist.map((p, i) => {
    const v = value(p);
    const record = records[i];
    return {
      key: p.workoutId,
      date: p.date,
      value: v,
      record,
      tip: (
        <>
          <p className="mb-1 font-semibold">
            {dayTitle(p.date)} {record && <span className="text-(--g-lime)">· ¡Récord!</span>}
          </p>
          <p className="gym-mut">
            Mejor serie: <b className="text-(--g-text)">{p.best.weight > 0 ? `${num(p.best.weight)} ${unit} × ${p.best.reps}` : `${p.best.reps} reps`}</b>
          </p>
          {!bodyweight && <p className="gym-mut">Fuerza estimada: {num(p.e1rm)} {unit}</p>}
          <p className="gym-mut">Volumen: {num(p.volume)} {unit}</p>
        </>
      ),
    };
  });

  const first = points[0]?.value ?? 0;
  const lastV = points[points.length - 1]?.value ?? 0;
  const top = points.length ? Math.max(...points.map((p) => p.value)) : 0;
  const change = first > 0 ? Math.round(((lastV - first) / first) * 100) : null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <select value={exId ?? ""} onChange={(e) => onSelect(e.target.value)} aria-label="Ejercicio" className="gym-input h-10 w-auto max-w-full py-0 text-sm">
          {MUSCLES.map((m) => {
            const list = exercises.filter((e) => e.muscle === m.name);
            if (list.length === 0) return null;
            return (
              <optgroup key={m.name} label={m.name}>
                {list.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} {counts.get(e.id) ? `(${counts.get(e.id)})` : ""}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        {!bodyweight && (
          <div className="gym-seg sm:ml-auto" role="group" aria-label="Qué medir">
            {(
              [
                ["fuerza", "Fuerza"],
                ["peso", "Peso máx."],
                ["volumen", "Volumen"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={metric === k} onClick={() => setMetric(k)}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {!ex ? (
        <div className="gym-card gym-mut p-8 text-center">Crea un ejercicio en la pestaña Rutinas.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label={bodyweight ? "Más repeticiones" : metric === "fuerza" ? "Mejor fuerza" : metric === "peso" ? "Peso máximo" : "Mejor volumen"} value={points.length ? num(top, metric === "volumen") : "—"} unit={bodyweight ? "reps" : unit} sub="Tu mejor marca" lime />
            <Stat label="Progreso" value={change === null ? "—" : `${change > 0 ? "+" : ""}${change}%`} unit="" sub={points.length > 1 ? `Desde ${shortDate(points[0].date)}` : "Necesitas 2 sesiones"} />
            <Stat label="Veces" value={String(points.length)} unit={points.length === 1 ? "sesión" : "sesiones"} sub={`${ex.muscle}`} />
            <Stat label="Última vez" value={hist.length ? ago(hist[hist.length - 1].date).replace("hace ", "") : "—"} unit="" sub={hist.length ? `Mejor serie: ${hist[hist.length - 1].best.weight > 0 ? `${num(hist[hist.length - 1].best.weight)} × ${hist[hist.length - 1].best.reps}` : `${hist[hist.length - 1].best.reps} reps`}` : "Aún no lo haces"} />
          </div>

          <section className="gym-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline gap-2">
              <Title>{ex.name}</Title>
              <span className="text-xs font-semibold" style={{ color: muscleColor(ex.muscle) }}>
                {ex.muscle}
              </span>
            </div>
            <p className="gym-mut mt-1 text-xs">
              {bodyweight
                ? "Repeticiones de tu mejor serie en cada sesión."
                : metric === "fuerza"
                  ? "Fuerza estimada: lo que podrías levantar 1 sola vez según tu mejor serie (fórmula de Epley)."
                  : metric === "peso"
                    ? "El peso más alto que usaste en cada sesión."
                    : "Peso × repeticiones de todas las series de cada sesión."}{" "}
              Los círculos huecos son récords.
            </p>
            <div className="mt-3">
              {points.length === 0 ? (
                <p className="gym-mut py-10 text-center text-sm">Todavía no hay series de este ejercicio.</p>
              ) : (
                <LineChart data={points} label={`Progreso de ${ex.name}`} fmt={(n) => (bodyweight ? num(n) : num(n, true))} />
              )}
            </div>
          </section>

          {hist.length > 0 && (
            <section className="gym-card p-4 sm:p-5">
              <Title>Sesiones</Title>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-md text-sm">
                  <thead>
                    <tr className="gym-mut text-left text-xs">
                      <th className="py-2 pr-3 font-medium">Fecha</th>
                      <th className="py-2 pr-3 font-medium">Mejor serie</th>
                      {!bodyweight && <th className="py-2 pr-3 text-right font-medium">Fuerza est.</th>}
                      <th className="py-2 text-right font-medium">Volumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--g-line)">
                    {[...hist]
                      .reverse()
                      .slice(0, 12)
                      .map((p) => (
                        <tr key={p.workoutId} onClick={() => onOpen(p.workoutId)} className="gym-row cursor-pointer">
                          <td className="py-2.5 pr-3">{dayTitle(p.date)}</td>
                          <td className="py-2.5 pr-3 tabular-nums">{p.best.weight > 0 ? `${num(p.best.weight)} ${unit} × ${p.best.reps}` : `${p.best.reps} reps`}</td>
                          {!bodyweight && <td className="py-2.5 pr-3 text-right tabular-nums">{num(p.e1rm)} {unit}</td>}
                          <td className="py-2.5 text-right tabular-nums">{fmt(p.volume).replace(" reps", "")}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// true en cada punto que supera a todos los anteriores (el primero no cuenta).
function markRecords(values: number[]) {
  const out: boolean[] = [];
  let best = -Infinity;
  for (const v of values) {
    out.push(best !== -Infinity && v > best + 1e-9);
    best = Math.max(best, v);
  }
  return out;
}

/* ---------------- Rutinas y ejercicios ---------------- */

function Routines({
  routines,
  exercises,
  workouts,
  exById,
  onStart,
  onEditRoutine,
  onNewRoutine,
  onEditExercise,
  onNewExercise,
  onProgress,
}: {
  routines: Routine[];
  exercises: Exercise[];
  workouts: Workout[];
  exById: Map<string, Exercise>;
  onStart: (r: Routine) => void;
  onEditRoutine: (r: Routine) => void;
  onNewRoutine: () => void;
  onEditExercise: (e: Exercise) => void;
  onNewExercise: () => void;
  onProgress: (id: string) => void;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <div className="mb-3 flex items-center">
          <Title>Tus rutinas</Title>
          <button type="button" onClick={onNewRoutine} className="ml-auto text-sm font-semibold text-(--g-lime)">
            + Nueva rutina
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {routines.length === 0 && <div className="gym-card gym-mut p-6 text-sm">Aún no tienes rutinas.</div>}
          {routines.map((r) => {
            const done = workouts.filter((w) => w.routine_id === r.id);
            return (
              <section key={r.id} className="gym-card flex flex-col overflow-hidden">
                <div className="h-1.5" style={{ background: r.color }} />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="gym-display text-2xl">
                        {r.emoji} {r.name}
                      </p>
                      <p className="gym-mut mt-1 text-xs">
                        {done.length} veces · {done[0] ? `última ${ago(done[0].date)}` : "sin hacer aún"}
                      </p>
                    </div>
                    <button type="button" onClick={() => onEditRoutine(r)} className="gym-mut press ml-auto rounded-lg px-2 py-1 text-sm hover:text-(--g-text)" aria-label={`Editar ${r.name}`}>
                      ✎ Editar
                    </button>
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                    {r.items.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: muscleColor(exById.get(it.exercise_id)?.muscle) }} />
                        <span className="truncate">{exName(exById, it.exercise_id)}</span>
                        <span className="gym-mut ml-auto shrink-0 tabular-nums">
                          {it.sets}×{it.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => onStart(r)} className="gym-btn mt-4 w-full" disabled={r.items.length === 0}>
                    <Play /> Empezar
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center">
          <Title>Ejercicios</Title>
          <button type="button" onClick={onNewExercise} className="ml-auto text-sm font-semibold text-(--g-lime)">
            + Nuevo ejercicio
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MUSCLES.map((m) => {
            const list = exercises.filter((e) => e.muscle === m.name);
            return (
              <section key={m.name} className="gym-card p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                  {m.name}
                  <span className="gym-mut ml-auto text-xs font-normal">{list.length}</span>
                </h3>
                <ul className="mt-2">
                  {list.length === 0 && <li className="gym-mut py-1 text-xs">Sin ejercicios</li>}
                  {list.map((e) => (
                    <li key={e.id} className="gym-row -mx-2 flex items-center gap-1 rounded-lg px-2">
                      <button type="button" onClick={() => onProgress(e.id)} className="min-w-0 flex-1 truncate py-1.5 text-left text-sm" title="Ver progreso">
                        {e.name}
                      </button>
                      <button type="button" onClick={() => onEditExercise(e)} className="gym-mut press shrink-0 rounded px-1.5 py-1 text-xs hover:text-(--g-text)" aria-label={`Editar ${e.name}`}>
                        ✎
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ventanas (crear / editar) ---------------- */

function Modal({ title, onClose, wide, children }: { title: ReactNode; onClose: () => void; wide?: boolean; children: ReactNode }) {
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
      className={`gym-dialog m-auto max-h-[calc(100dvh-24px)] rounded-3xl p-0 shadow-2xl ${wide ? "w-[min(640px,calc(100%-16px))]" : "w-[min(460px,calc(100%-24px))]"}`}
    >
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-(--g-line) bg-(--g-card) px-5 py-3.5">
        <div className="min-w-0 flex-1">{typeof title === "string" ? <h2 className="gym-display text-2xl">{title}</h2> : title}</div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="gym-mut press grid size-9 shrink-0 place-items-center rounded-full hover:bg-(--g-card-2)">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}

// Una serie mientras se edita (los campos son texto hasta guardar).
type Draft = { key: string; weight: string; reps: string };
type Block = { exercise_id: string; sets: Draft[] };

function toBlocks(sets: WorkSet[]): Block[] {
  const out: Block[] = [];
  for (const s of sets) {
    let b = out.find((x) => x.exercise_id === s.exercise_id);
    if (!b) out.push((b = { exercise_id: s.exercise_id, sets: [] }));
    b.sets.push({ key: uid(), weight: s.weight ? String(s.weight) : "", reps: s.reps ? String(s.reps) : "" });
  }
  return out;
}
const parse = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};

function WorkoutDialog({
  workout,
  exercises,
  history,
  unit,
  onClose,
  onSave,
  onDelete,
}: {
  workout: Workout;
  exercises: Exercise[];
  history: Workout[];
  unit: Unit;
  onClose: () => void;
  onSave: (w: Workout) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(workout.name);
  const [date, setDate] = useState(workout.date);
  const [duration, setDuration] = useState(workout.duration ? String(workout.duration) : "");
  const [note, setNote] = useState(workout.note);
  const [blocks, setBlocks] = useState<Block[]>(() => toBlocks(workout.sets));
  const [adding, setAdding] = useState("");
  const [error, setError] = useState("");
  const exById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  // Lo que hiciste la última vez en cada ejercicio (sin contar este entrenamiento).
  const lastTime = (id: string) => {
    const w = history.find((x) => x.id !== workout.id && x.date <= date && x.sets.some((s) => s.exercise_id === id));
    if (!w) return null;
    const b = bestSet(w.sets.filter((s) => s.exercise_id === id))!;
    return { date: w.date, set: b };
  };

  const setBlock = (i: number, fn: (b: Block) => Block) => setBlocks((l) => l.map((b, j) => (j === i ? fn(b) : b)));
  const addSet = (i: number) =>
    setBlock(i, (b) => {
      const last = b.sets[b.sets.length - 1];
      return { ...b, sets: [...b.sets, { key: uid(), weight: last?.weight ?? "", reps: last?.reps ?? "" }] };
    });
  const addExercise = (id: string) => {
    if (!id) return;
    const lt = lastTime(id);
    setBlocks((l) => [...l, { exercise_id: id, sets: [{ key: uid(), weight: lt?.set.weight ? String(lt.set.weight) : "", reps: lt ? String(lt.set.reps) : "" }] }]);
    setAdding("");
  };

  const total = blocks.reduce((s, b) => s + b.sets.reduce((x, d) => x + parse(d.weight) * parse(d.reps), 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sets: WorkSet[] = blocks.flatMap((b) =>
      b.sets.filter((d) => parse(d.reps) > 0).map((d) => ({ exercise_id: b.exercise_id, weight: parse(d.weight), reps: Math.round(parse(d.reps)) })),
    );
    if (!date) return setError("Elige la fecha.");
    if (sets.length === 0) return setError("Agrega al menos una serie con repeticiones.");
    const mins = parse(duration);
    onSave({
      id: workout.id || uid(),
      date,
      name: name.trim() || "Entrenamiento",
      routine_id: workout.routine_id,
      duration: mins ? Math.round(mins) : null,
      note: note.trim(),
      sets,
    });
  };

  return (
    <Modal
      wide
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            aria-label="Nombre del entrenamiento"
            className="gym-display w-full min-w-0 bg-transparent text-2xl outline-none"
          />
          <RestTimer />
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="gym-label" htmlFor="gw-date">
              Fecha
            </label>
            <input id="gw-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gym-input" />
          </div>
          <div>
            <label className="gym-label" htmlFor="gw-min">
              Duración (min)
            </label>
            <input id="gw-min" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value.replace(/[^\d]/g, ""))} placeholder="Ej: 60" className="gym-input" />
          </div>
        </div>

        {blocks.map((b, i) => {
          const ex = exById.get(b.exercise_id);
          const lt = lastTime(b.exercise_id);
          return (
            <section key={b.exercise_id + i} className="rounded-2xl border border-(--g-line) bg-(--g-card-2) p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: muscleColor(ex?.muscle) }} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{ex?.name ?? "Ejercicio eliminado"}</p>
                  <p className="gym-mut text-xs">
                    {lt ? `La última vez (${shortDate(lt.date)}): ${lt.set.weight > 0 ? `${num(lt.set.weight)} ${unit} × ${lt.set.reps}` : `${lt.set.reps} reps`}` : "Primera vez 🎉"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBlocks((l) => l.filter((_, j) => j !== i))}
                  className="gym-mut press ml-auto shrink-0 rounded-lg px-2 py-1 text-xs hover:text-(--g-bad)"
                >
                  Quitar
                </button>
              </div>
              <div className="mt-3 grid grid-cols-[28px_1fr_1fr_32px] items-center gap-2 text-xs">
                <span className="gym-mut text-center">#</span>
                <span className="gym-label mb-0">Peso ({unit})</span>
                <span className="gym-label mb-0">Reps</span>
                <span />
                {b.sets.map((d, k) => {
                  const pr = lt && parse(d.reps) > 0 && oneRM({ weight: parse(d.weight), reps: parse(d.reps) }) > oneRM(lt.set) + 1e-9;
                  return (
                    <SetRow
                      key={d.key}
                      n={k + 1}
                      d={d}
                      pr={!!pr}
                      onChange={(nd) => setBlock(i, (bb) => ({ ...bb, sets: bb.sets.map((x) => (x.key === d.key ? nd : x)) }))}
                      onRemove={() => setBlock(i, (bb) => ({ ...bb, sets: bb.sets.filter((x) => x.key !== d.key) }))}
                    />
                  );
                })}
              </div>
              <button type="button" onClick={() => addSet(i)} className="press mt-2 w-full rounded-xl border border-dashed border-(--g-line) py-2 text-sm font-semibold text-(--g-lime) hover:border-(--g-lime)/50">
                + Serie
              </button>
            </section>
          );
        })}

        <select value={adding} onChange={(e) => addExercise(e.target.value)} aria-label="Agregar ejercicio" className="gym-input text-sm">
          <option value="">+ Agregar ejercicio…</option>
          {MUSCLES.map((m) => {
            const list = exercises.filter((e) => e.muscle === m.name);
            if (list.length === 0) return null;
            return (
              <optgroup key={m.name} label={m.name}>
                {list.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        <div>
          <label className="gym-label" htmlFor="gw-note">
            Nota <span className="normal-case">(opcional)</span>
          </label>
          <input id="gw-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: me sentí con energía" maxLength={200} className="gym-input" />
        </div>

        {error && <p className="text-sm text-(--g-bad)">{error}</p>}

        <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center gap-2 border-t border-(--g-line) bg-(--g-card) px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5">
          {workout.id && (
            <button type="button" onClick={() => confirm("¿Eliminar este entrenamiento?") && onDelete(workout.id)} className="gym-btn-ghost text-(--g-bad)">
              Eliminar
            </button>
          )}
          <span className="gym-mut ml-auto text-xs tabular-nums">
            {num(total, true)} {unit} movidos
          </span>
          <button type="submit" className="gym-btn">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SetRow({ n, d, pr, onChange, onRemove }: { n: number; d: Draft; pr: boolean; onChange: (d: Draft) => void; onRemove: () => void }) {
  return (
    <>
      <span className={`grid h-9 place-items-center rounded-lg text-sm font-semibold ${pr ? "bg-(--g-lime) text-(--g-lime-ink)" : "gym-mut"}`} title={pr ? "¡Mejor que la última vez!" : undefined}>
        {pr ? "🏆" : n}
      </span>
      <input
        inputMode="decimal"
        value={d.weight}
        onChange={(e) => onChange({ ...d, weight: e.target.value.replace(/[^\d.,]/g, "") })}
        placeholder="0"
        aria-label={`Peso serie ${n}`}
        className="gym-input h-9 py-0 text-base font-semibold tabular-nums"
      />
      <input
        inputMode="numeric"
        value={d.reps}
        onChange={(e) => onChange({ ...d, reps: e.target.value.replace(/[^\d]/g, "") })}
        placeholder="0"
        aria-label={`Repeticiones serie ${n}`}
        className="gym-input h-9 py-0 text-base font-semibold tabular-nums"
      />
      <button type="button" onClick={onRemove} aria-label={`Quitar serie ${n}`} className="gym-mut press grid size-8 place-items-center rounded-lg hover:text-(--g-bad)">
        ✕
      </button>
    </>
  );
}

// Temporizador de descanso entre series. Vibra el celular al terminar.
function RestTimer() {
  const [left, setLeft] = useState<number | null>(null);
  const [preset, setPreset] = useState(90);
  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      try {
        navigator.vibrate?.([200, 100, 200]);
      } catch {}
      const t = setTimeout(() => setLeft(null), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
  if (left !== null) {
    return (
      <button type="button" onClick={() => setLeft(null)} className="press shrink-0 rounded-xl bg-(--g-lime) px-3 py-1.5 text-sm font-bold text-(--g-lime-ink) tabular-nums" title="Tocar para parar">
        {left <= 0 ? "¡Listo!" : `⏱ ${mmss(left)}`}
      </button>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => setLeft(preset)} className="gym-btn-ghost px-2.5 py-1.5 text-xs" title="Empezar descanso">
        ⏱ {mmss(preset)}
      </button>
      <button type="button" onClick={() => setPreset((p) => (p >= 180 ? 30 : p + 30))} className="gym-mut press rounded-lg px-1.5 py-1 text-xs hover:text-(--g-text)" aria-label="Cambiar tiempo de descanso">
        ±
      </button>
    </div>
  );
}

function RoutineDialog({
  routine,
  exercises,
  onClose,
  onSave,
  onDelete,
}: {
  routine: Routine;
  exercises: Exercise[];
  onClose: () => void;
  onSave: (r: Routine) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(routine.name);
  const [emoji, setEmoji] = useState(routine.emoji);
  const [color, setColor] = useState(routine.color);
  const [items, setItems] = useState<RoutineItem[]>(routine.items);
  const [error, setError] = useState("");
  const exById = new Map(exercises.map((e) => [e.id, e]));

  const setItem = (i: number, patch: Partial<RoutineItem>) => setItems((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setItems((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const c = [...l];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre.");
    onSave({ id: routine.id || uid(), name: name.trim(), emoji: emoji.trim() || "🔥", color, items });
  };

  return (
    <Modal title={routine.id ? "Editar rutina" : "Nueva rutina"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div className="grid grid-cols-[64px_1fr] gap-3">
          <div>
            <label className="gym-label" htmlFor="gr-emoji">
              Ícono
            </label>
            <input id="gr-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="gym-input text-center text-xl" />
          </div>
          <div>
            <label className="gym-label" htmlFor="gr-name">
              Nombre
            </label>
            <input id="gr-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Ej: Torso" className="gym-input" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => setEmoji(e)} className={`press grid size-9 place-items-center rounded-lg text-lg ${emoji === e ? "bg-(--g-card-2) ring-2 ring-(--g-lime)/60" : "hover:bg-(--g-card-2)"}`}>
              {e}
            </button>
          ))}
        </div>
        <div>
          <p className="gym-label">Color</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="press size-8 rounded-full"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #14171c, 0 0 0 4px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="gym-label">Ejercicios · series × repeticiones</p>
          <ul className="space-y-2">
            {items.length === 0 && <li className="gym-mut text-sm">Agrega el primer ejercicio abajo.</li>}
            {items.map((it, i) => (
              <li key={it.exercise_id + i} className="flex items-center gap-2 rounded-xl border border-(--g-line) bg-(--g-card-2) p-2">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} className="gym-mut press px-1 text-xs leading-none hover:text-(--g-text)" aria-label="Subir">
                    ▲
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="gym-mut press px-1 text-xs leading-none hover:text-(--g-text)" aria-label="Bajar">
                    ▼
                  </button>
                </div>
                <span className="size-2 shrink-0 rounded-full" style={{ background: muscleColor(exById.get(it.exercise_id)?.muscle) }} />
                <span className="min-w-0 flex-1 truncate text-sm">{exById.get(it.exercise_id)?.name ?? "Ejercicio eliminado"}</span>
                <input
                  inputMode="numeric"
                  aria-label="Series"
                  value={it.sets || ""}
                  onChange={(e) => setItem(i, { sets: Math.min(20, Number(e.target.value.replace(/\D/g, "")) || 0) })}
                  className="gym-input h-8 w-11 px-1 py-0 text-center text-sm"
                />
                <span className="gym-mut text-xs">×</span>
                <input
                  inputMode="numeric"
                  aria-label="Repeticiones"
                  value={it.reps || ""}
                  onChange={(e) => setItem(i, { reps: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })}
                  className="gym-input h-8 w-11 px-1 py-0 text-center text-sm"
                />
                <button type="button" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="gym-mut press px-1.5 text-sm hover:text-(--g-bad)" aria-label="Quitar">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <select
            value=""
            onChange={(e) => e.target.value && setItems((l) => [...l, { exercise_id: e.target.value, sets: 3, reps: 10 }])}
            aria-label="Agregar ejercicio"
            className="gym-input mt-2 text-sm"
          >
            <option value="">+ Agregar ejercicio…</option>
            {MUSCLES.map((m) => (
              <optgroup key={m.name} label={m.name}>
                {exercises
                  .filter((e) => e.muscle === m.name)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-(--g-bad)">{error}</p>}
        <div className="flex gap-2 pt-1">
          {routine.id && (
            <button type="button" onClick={() => confirm("¿Eliminar esta rutina? Tus entrenamientos se quedan.") && onDelete(routine.id)} className="gym-btn-ghost text-(--g-bad)">
              Eliminar
            </button>
          )}
          <button type="submit" className="gym-btn ml-auto">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ExerciseDialog({
  exercise,
  used,
  onClose,
  onSave,
  onDelete,
}: {
  exercise: Exercise;
  used: number;
  onClose: () => void;
  onSave: (e: Exercise) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(exercise.name);
  const [muscle, setMuscle] = useState<Muscle>(exercise.muscle);
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre.");
    onSave({ id: exercise.id || uid(), name: name.trim(), muscle });
  };
  return (
    <Modal title={exercise.id ? "Editar ejercicio" : "Nuevo ejercicio"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div>
          <label className="gym-label" htmlFor="ge-name">
            Nombre
          </label>
          <input id="ge-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ej: Hip thrust" className="gym-input" />
        </div>
        <div>
          <p className="gym-label">Grupo muscular</p>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLES.map((m) => (
              <button
                key={m.name}
                type="button"
                aria-pressed={muscle === m.name}
                onClick={() => setMuscle(m.name)}
                className={`press rounded-xl border px-3 py-1.5 text-sm ${muscle === m.name ? "border-transparent" : "gym-mut border-(--g-line) hover:text-(--g-text)"}`}
                style={muscle === m.name ? { background: `${m.color}22`, boxShadow: `inset 0 0 0 1.5px ${m.color}`, color: m.color } : undefined}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-(--g-bad)">{error}</p>}
        <div className="flex gap-2 pt-1">
          {exercise.id && (
            <button
              type="button"
              onClick={() =>
                confirm(
                  used > 0
                    ? `Este ejercicio está en ${used} entrenamiento(s). Esas series quedarán como “Ejercicio eliminado”. ¿Eliminarlo?`
                    : "¿Eliminar este ejercicio?",
                ) && onDelete(exercise.id)
              }
              className="gym-btn-ghost text-(--g-bad)"
            >
              Eliminar
            </button>
          )}
          <button type="submit" className="gym-btn ml-auto">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Íconos ---------------- */

function Dumbbell() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  );
}

function Play({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}
