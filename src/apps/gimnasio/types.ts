// Tipos de la app de gimnasio. Todo el código de esta carpeta se comparte entre
// la demo de la web (guarda en el navegador) y la plantilla descargable (guarda en Supabase).

export type Muscle = "Pecho" | "Espalda" | "Piernas" | "Hombros" | "Brazos" | "Core";

export type Exercise = {
  id: string;
  name: string;
  muscle: Muscle;
};

// Un ejercicio dentro de una rutina, con la meta de series y repeticiones.
export type RoutineItem = { exercise_id: string; sets: number; reps: number };

export type Routine = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: RoutineItem[];
};

// Una serie hecha: peso (0 = peso corporal) y repeticiones.
export type WorkSet = { exercise_id: string; weight: number; reps: number };

export type Workout = {
  id: string;
  date: string; // AAAA-MM-DD
  name: string; // ej: "Pecho y hombros"
  routine_id: string | null;
  duration: number | null; // minutos
  note: string;
  sets: WorkSet[];
};
