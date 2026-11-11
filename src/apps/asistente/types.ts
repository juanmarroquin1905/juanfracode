// Todo lo que recuerda NOVA, tu asistente. Se guarda como un solo paquete de datos.
// Las fechas son textos "AAAA-MM-DD" y las horas "HH:MM".

export type Task = { id: string; text: string; done: boolean };
export type Event = { id: string; date: string; time: string; title: string };
export type Expense = { id: string; date: string; amount: number; category: string; note: string };
export type Workout = { id: string; date: string; name: string; minutes: number };
export type Note = { id: string; text: string; created_at: string };

export type Data = {
  tasks: Task[];
  events: Event[];
  expenses: Expense[];
  workouts: Workout[];
  notes: Note[];
  /** Cuánto quieres gastar como máximo en el mes. */
  budget: number;
  /** Cuántos días quieres entrenar por semana. */
  gymGoal: number;
};

export const emptyData = (): Data => ({ tasks: [], events: [], expenses: [], workouts: [], notes: [], budget: 800, gymGoal: 4 });
