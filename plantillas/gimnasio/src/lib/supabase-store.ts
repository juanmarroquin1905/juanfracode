import type { SupabaseClient } from "@supabase/supabase-js";
import type { GymStore } from "@/gimnasio/store";
import type { Exercise, Routine, Workout } from "@/gimnasio/types";

// Guarda en tus tablas de Supabase (supabase/schema.sql).
export function createSupabaseStore(db: SupabaseClient): GymStore {
  const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  return {
    async listExercises() {
      return (check(await db.from("exercises").select("id,name,muscle").order("created_at")) ?? []) as Exercise[];
    },
    async listRoutines() {
      return (check(await db.from("routines").select("id,name,emoji,color,items").order("created_at")) ?? []) as Routine[];
    },
    async listWorkouts() {
      const rows = check(
        await db.from("workouts").select("id,date,name,routine_id,duration,note,sets").order("date", { ascending: false }).limit(5000),
      );
      return ((rows ?? []) as Workout[]).map((w) => ({
        ...w,
        sets: (w.sets ?? []).map((s) => ({ ...s, weight: Number(s.weight), reps: Number(s.reps) })),
      }));
    },
    async saveExercise(e) {
      check(await db.from("exercises").upsert(e));
    },
    async deleteExercise(id) {
      check(await db.from("exercises").delete().eq("id", id));
    },
    async saveRoutine(r) {
      check(await db.from("routines").upsert(r));
    },
    async deleteRoutine(id) {
      check(await db.from("routines").delete().eq("id", id));
    },
    async saveWorkout(w) {
      check(await db.from("workouts").upsert(w));
    },
    async deleteWorkout(id) {
      check(await db.from("workouts").delete().eq("id", id));
    },
  };
}
