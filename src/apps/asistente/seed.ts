import type { Data } from "./types";
import { addDays, today, uid } from "./utils";

// Datos de ejemplo de la demo. Las fechas salen de hoy para que siempre se vea "al día".
export function sampleData(): Data {
  const t = today();
  const ago = (n: number) => addDays(t, -n);
  const exp = (n: number, amount: number, category: string, note: string) => ({ id: uid(), date: ago(n), amount, category, note });
  const thisMonth = (n: number) => (ago(n).slice(0, 7) === t.slice(0, 7) ? n : 0);

  return {
    budget: 800,
    gymGoal: 4,
    tasks: [
      { id: uid(), text: "Grabar el video de la nueva app", done: false },
      { id: uid(), text: "Responder correos de clientes", done: false },
      { id: uid(), text: "Pagar el internet", done: false },
      { id: uid(), text: "Comprar proteína", done: true },
    ],
    events: [
      { id: uid(), date: t, time: "09:00", title: "Revisar métricas de la semana" },
      { id: uid(), date: t, time: "13:30", title: "Almuerzo con Andrea" },
      { id: uid(), date: t, time: "18:00", title: "Gimnasio · piernas" },
      { id: uid(), date: addDays(t, 1), time: "10:00", title: "Llamada con un cliente" },
    ],
    expenses: [
      exp(thisMonth(0), 18.5, "Comida", "Almuerzo"),
      exp(thisMonth(1), 42, "Supermercado", "Compras de la semana"),
      exp(thisMonth(2), 12, "Transporte", "Taxi"),
      exp(thisMonth(4), 25, "Suscripciones", "Música y nube"),
      exp(thisMonth(5), 60, "Supermercado", "Mercado del mes"),
      exp(thisMonth(7), 35, "Salidas", "Cine y cena"),
      exp(thisMonth(8), 9.9, "Comida", "Café"),
    ],
    workouts: [
      { id: uid(), date: ago(1), name: "Pecho y brazos", minutes: 55 },
      { id: uid(), date: ago(3), name: "Espalda", minutes: 50 },
      { id: uid(), date: ago(6), name: "Piernas", minutes: 60 },
    ],
    notes: [
      { id: uid(), text: "Idea de video: 3 apps que hice con Claude en un fin de semana", created_at: `${ago(1)}T20:10:00` },
      { id: uid(), text: "Probar el modo oscuro en la app de finanzas", created_at: `${ago(2)}T09:30:00` },
    ],
  };
}
