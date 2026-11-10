import { defaultExercises, defaultRoutines, sampleWorkouts } from "./seed";
import type { GymStore } from "./store";
import type { Exercise, Routine, Workout } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
type Data = { exercises: Exercise[]; routines: Routine[]; workouts: Workout[] };

export function createLocalStore(key = "gimnasio-demo", withSamples = true): GymStore {
  let mem: Data | null = null;

  const fresh = (): Data => {
    const exercises = defaultExercises();
    const routines = defaultRoutines(exercises);
    return { exercises, routines, workouts: withSamples ? sampleWorkouts(exercises, routines) : [] };
  };
  const read = (): Data => {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return (mem = JSON.parse(raw) as Data);
    } catch {}
    mem = fresh();
    write();
    return mem;
  };
  const write = () => {
    try {
      localStorage.setItem(key, JSON.stringify(mem));
    } catch {}
  };
  const upsert = <T extends { id: string }>(list: T[], item: T) => {
    const i = list.findIndex((x) => x.id === item.id);
    if (i === -1) list.unshift(item);
    else list[i] = item;
  };

  return {
    async listExercises() {
      return [...read().exercises];
    },
    async listRoutines() {
      return [...read().routines];
    },
    async listWorkouts() {
      return [...read().workouts];
    },
    async saveExercise(e) {
      upsert(read().exercises, e);
      write();
    },
    async deleteExercise(id) {
      const d = read();
      d.exercises = d.exercises.filter((e) => e.id !== id);
      write();
    },
    async saveRoutine(r) {
      upsert(read().routines, r);
      write();
    },
    async deleteRoutine(id) {
      const d = read();
      d.routines = d.routines.filter((r) => r.id !== id);
      d.workouts = d.workouts.map((w) => (w.routine_id === id ? { ...w, routine_id: null } : w));
      write();
    },
    async saveWorkout(w) {
      upsert(read().workouts, w);
      write();
    },
    async deleteWorkout(id) {
      const d = read();
      d.workouts = d.workouts.filter((w) => w.id !== id);
      write();
    },
    async reset() {
      mem = fresh();
      write();
    },
  };
}
