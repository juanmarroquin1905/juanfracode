import type { Exercise, Routine, Workout } from "./types";

// Dónde se guardan los datos. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface GymStore {
  listExercises(): Promise<Exercise[]>;
  listRoutines(): Promise<Routine[]>;
  listWorkouts(): Promise<Workout[]>;
  saveExercise(e: Exercise): Promise<void>; // crea o actualiza
  deleteExercise(id: string): Promise<void>;
  saveRoutine(r: Routine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;
  saveWorkout(w: Workout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
