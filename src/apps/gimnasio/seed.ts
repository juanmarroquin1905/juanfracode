import type { Exercise, Muscle, Routine, Workout, WorkSet } from "./types";
import { addDays, fromISO, PALETTE, toISO, today, uid } from "./utils";

// Ejercicios con los que empieza cualquier cuenta nueva. Se pueden editar y borrar.
const BASE: [string, Muscle][] = [
  ["Press de banca", "Pecho"],
  ["Press inclinado con mancuernas", "Pecho"],
  ["Aperturas en polea", "Pecho"],
  ["Dominadas", "Espalda"],
  ["Remo con barra", "Espalda"],
  ["Jalón al pecho", "Espalda"],
  ["Sentadilla", "Piernas"],
  ["Peso muerto rumano", "Piernas"],
  ["Prensa de piernas", "Piernas"],
  ["Curl femoral", "Piernas"],
  ["Press militar", "Hombros"],
  ["Elevaciones laterales", "Hombros"],
  ["Curl de bíceps", "Brazos"],
  ["Extensión de tríceps en polea", "Brazos"],
  ["Plancha con peso", "Core"],
  ["Elevación de piernas colgado", "Core"],
];

export function defaultExercises(): Exercise[] {
  return BASE.map(([name, muscle]) => ({ id: uid(), name, muscle }));
}

// Tres rutinas clásicas para empezar: empuje, tirón y piernas.
export function defaultRoutines(ex: Exercise[]): Routine[] {
  const id = (name: string) => ex.find((e) => e.name === name)?.id;
  const r = (name: string, emoji: string, color: string, items: [string, number, number][]): Routine => ({
    id: uid(),
    name,
    emoji,
    color,
    items: items.flatMap(([n, sets, reps]) => {
      const exercise_id = id(n);
      return exercise_id ? [{ exercise_id, sets, reps }] : [];
    }),
  });
  if (ex.length === 0) return [];
  return [
    r("Empuje", "🏋️", PALETTE[0], [
      ["Press de banca", 4, 8],
      ["Press inclinado con mancuernas", 3, 10],
      ["Press militar", 3, 8],
      ["Elevaciones laterales", 3, 15],
      ["Extensión de tríceps en polea", 3, 12],
    ]),
    r("Tirón", "🧗", PALETTE[1], [
      ["Dominadas", 4, 8],
      ["Remo con barra", 4, 8],
      ["Jalón al pecho", 3, 10],
      ["Curl de bíceps", 3, 12],
      ["Elevación de piernas colgado", 3, 12],
    ]),
    r("Piernas", "🦵", PALETTE[2], [
      ["Sentadilla", 4, 6],
      ["Peso muerto rumano", 3, 8],
      ["Prensa de piernas", 3, 12],
      ["Curl femoral", 3, 12],
      ["Plancha con peso", 3, 10],
    ]),
  ];
}

// Peso con el que empieza la persona de ejemplo (en kg) y cuánto sube por semana.
const START: Record<string, [number, number]> = {
  "Press de banca": [60, 1.35],
  "Press inclinado con mancuernas": [20, 0.52],
  "Aperturas en polea": [12.5, 0.3],
  Dominadas: [0, 0],
  "Remo con barra": [50, 1.35],
  "Jalón al pecho": [45, 1.2],
  Sentadilla: [80, 2.4],
  "Peso muerto rumano": [70, 2.1],
  "Prensa de piernas": [120, 3.75],
  "Curl femoral": [30, 0.75],
  "Press militar": [35, 0.75],
  "Elevaciones laterales": [8, 0.18],
  "Curl de bíceps": [12, 0.3],
  "Extensión de tríceps en polea": [20, 0.52],
  "Plancha con peso": [10, 0.6],
  "Elevación de piernas colgado": [0, 0],
};

// Entrenamientos de ejemplo de las últimas 12 semanas, para que la demo se vea viva.
// Usa un azar "con semilla": siempre salen los mismos números.
export function sampleWorkouts(ex: Exercise[], routines: Routine[]): Workout[] {
  if (routines.length === 0) return [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const round = (n: number, step: number) => Math.round(n / step) * step;
  const nameOf = (id: string) => ex.find((e) => e.id === id)?.name ?? "";

  const out: Workout[] = [];
  const end = addDays(fromISO(today()), -1);
  const start = addDays(end, -7 * 12 + 1);
  let turn = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const wd = d.getDay();
    // Lunes, miércoles y viernes; a veces también sábado; a veces falta un día.
    const planned = wd === 1 || wd === 3 || wd === 5 || (wd === 6 && rnd() > 0.65);
    if (!planned || rnd() < 0.12) continue;
    const week = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
    const r = routines[turn++ % routines.length];
    const sets: WorkSet[] = [];
    for (const it of r.items) {
      const [base, perWeek] = START[nameOf(it.exercise_id)] ?? [20, 0.45];
      const step = base >= 40 ? 2.5 : 1;
      // Cada 4 semanas una semana más liviana (descarga), como en la vida real.
      const deload = week % 4 === 2 ? 0.92 : 1;
      const w = base > 0 ? round((base + perWeek * week) * deload, step) : 0;
      for (let i = 0; i < it.sets; i++) {
        const tired = i >= it.sets - 1 && rnd() > 0.5 ? 1 : 0;
        const reps =
          base > 0
            ? Math.max(1, it.reps + Math.round(rnd() * 2) - tired)
            : Math.max(3, Math.round(it.reps - 2 + week * 0.25 + rnd() * 2) - i);
        sets.push({ exercise_id: it.exercise_id, weight: w, reps });
      }
    }
    out.push({
      id: uid(),
      date: toISO(d),
      name: r.name,
      routine_id: r.id,
      duration: Math.round(48 + rnd() * 30),
      note: rnd() > 0.85 ? (rnd() > 0.5 ? "Me sentí con mucha energía" : "Dormí poco, bajé un poco el ritmo") : "",
      sets,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}
