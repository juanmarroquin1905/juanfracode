import type { Muscle, WorkSet, Workout } from "./types";

// Fechas, números y cálculos de progreso. Las fechas son textos "AAAA-MM-DD"
// para que no cambien con la zona horaria.

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)); // lunes
export const weekKey = (s: string) => toISO(startOfWeek(fromISO(s)));
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const monthShort = (m: number) => MONTHS[m];
export const shortDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const dayTitle = (s: string) => {
  const t = today();
  if (s === t) return "Hoy";
  if (s === toISO(addDays(fromISO(t), -1))) return "Ayer";
  const d = fromISO(s);
  const wd = WEEKDAYS[d.getDay()];
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
};
export const ago = (s: string) => {
  const n = daysBetween(s, today());
  if (n <= 0) return "hoy";
  if (n === 1) return "ayer";
  if (n < 7) return `hace ${n} días`;
  if (n < 14) return "hace 1 semana";
  if (n < 60) return `hace ${Math.floor(n / 7)} semanas`;
  return `hace ${Math.floor(n / 30)} meses`;
};

// Grupos musculares con su color (en orden fijo, se distinguen también con daltonismo).
export const MUSCLES: { name: Muscle; color: string }[] = [
  { name: "Pecho", color: "#5aa9ff" },
  { name: "Espalda", color: "#34d399" },
  { name: "Piernas", color: "#ff8a4c" },
  { name: "Hombros", color: "#a78bfa" },
  { name: "Brazos", color: "#fbbf24" },
  { name: "Core", color: "#f472b6" },
];
export const muscleColor = (m: Muscle | undefined) => MUSCLES.find((x) => x.name === m)?.color ?? "#7d8696";

export const PALETTE = ["#c6f24e", "#5aa9ff", "#ff8a4c", "#34d399", "#a78bfa", "#fbbf24", "#f472b6", "#94a3b8"];

export type Unit = "kg" | "lb";

const nf = new Intl.NumberFormat("es-419", { maximumFractionDigits: 1 });
const nfCompact = new Intl.NumberFormat("es-419", { notation: "compact", maximumFractionDigits: 1 });
export const num = (n: number, compact = false) => (compact ? nfCompact : nf).format(n);
export const weight = (n: number, unit: Unit) => (n > 0 ? `${num(n)} ${unit}` : "Peso corporal");

// Fuerza estimada: cuánto podrías levantar 1 sola vez (fórmula de Epley).
export const oneRM = (s: Pick<WorkSet, "weight" | "reps">) =>
  s.weight <= 0 || s.reps <= 0 ? 0 : s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30);

// Volumen = peso × repeticiones de todas las series (lo que "moviste" en total).
export const volume = (sets: WorkSet[]) => sets.reduce((s, x) => s + x.weight * x.reps, 0);

// La mejor serie de un ejercicio en un entrenamiento (la de más fuerza estimada).
export function bestSet(sets: WorkSet[]) {
  let best: WorkSet | null = null;
  for (const s of sets) {
    if (!best || oneRM(s) > oneRM(best) || (oneRM(s) === oneRM(best) && s.reps > best.reps)) best = s;
  }
  return best;
}

export type Point = { date: string; workoutId: string; best: WorkSet; e1rm: number; maxWeight: number; maxReps: number; volume: number };

// Historial de un ejercicio: un punto por cada entrenamiento donde aparece (del más viejo al más nuevo).
export function exerciseHistory(workouts: Workout[], exerciseId: string): Point[] {
  return workouts
    .map((w) => {
      const sets = w.sets.filter((s) => s.exercise_id === exerciseId);
      if (sets.length === 0) return null;
      const best = bestSet(sets)!;
      return {
        date: w.date,
        workoutId: w.id,
        best,
        e1rm: oneRM(best),
        maxWeight: Math.max(...sets.map((s) => s.weight)),
        maxReps: Math.max(...sets.map((s) => s.reps)),
        volume: volume(sets),
      };
    })
    .filter((p): p is Point => p !== null)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// Récords personales: cada vez que un ejercicio superó su mejor marca anterior.
export type Record = { exercise_id: string; date: string; set: WorkSet; previous: number };
export function personalRecords(workouts: Workout[]): Record[] {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? -1 : 1));
  const best = new Map<string, number>();
  const out: Record[] = [];
  for (const w of sorted) {
    const byEx = new Map<string, WorkSet[]>();
    for (const s of w.sets) byEx.set(s.exercise_id, [...(byEx.get(s.exercise_id) ?? []), s]);
    for (const [id, sets] of byEx) {
      const b = bestSet(sets)!;
      // Con peso corporal se compara por repeticiones.
      const score = b.weight > 0 ? oneRM(b) : b.reps / 1000;
      const prev = best.get(id);
      if (prev !== undefined && score > prev + 1e-9) out.push({ exercise_id: id, date: w.date, set: b, previous: prev });
      if (prev === undefined || score > prev) best.set(id, score);
    }
  }
  return out.reverse();
}

// Semanas seguidas (hasta esta) con al menos un entrenamiento.
export function weekStreak(workouts: Workout[]) {
  const weeks = new Set(workouts.map((w) => weekKey(w.date)));
  let d = startOfWeek(fromISO(today()));
  // Si esta semana aún no entrenaste, la racha cuenta desde la semana pasada.
  if (!weeks.has(toISO(d))) d = addDays(d, -7);
  let n = 0;
  while (weeks.has(toISO(d))) {
    n++;
    d = addDays(d, -7);
  }
  return n;
}

export type WeekBucket = { key: string; label: string; from: string; to: string; volume: number; count: number };

// Últimas N semanas (de lunes a domingo), con volumen y cantidad de entrenamientos.
export function weekBuckets(workouts: Workout[], n = 12): WeekBucket[] {
  const out: WeekBucket[] = [];
  let start = startOfWeek(fromISO(today()));
  for (let i = 0; i < n; i++) {
    out.unshift({ key: toISO(start), label: shortDate(toISO(start)), from: toISO(start), to: toISO(addDays(start, 6)), volume: 0, count: 0 });
    start = addDays(start, -7);
  }
  const byKey = new Map(out.map((b) => [b.key, b]));
  for (const w of workouts) {
    const b = byKey.get(weekKey(w.date));
    if (b) {
      b.volume += volume(w.sets);
      b.count += 1;
    }
  }
  return out;
}

// Descarga el historial como CSV (se abre en Excel o Google Sheets).
export function downloadCSV(header: string[], rows: (string | number)[][], filename: string) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(","), ...rows.map((r) => r.map(esc).join(","))];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
