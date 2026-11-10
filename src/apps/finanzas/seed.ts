import type { Category, Transaction } from "./types";
import { addDays, fromISO, toISO, today, uid } from "./utils";

// Colores en orden fijo (probados para que se distingan, también con daltonismo).
export const PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948", "#64748b"];

// Categorías con las que empieza cualquier cuenta nueva. Se pueden editar y borrar.
export function defaultCategories(): Category[] {
  const c = (name: string, kind: Category["kind"], emoji: string, color: string, budget: number | null = null) => ({
    id: uid(),
    name,
    kind,
    emoji,
    color,
    budget,
  });
  return [
    c("Sueldo", "ingreso", "💼", PALETTE[0]),
    c("Trabajos extra", "ingreso", "🧾", PALETTE[2]),
    c("Otros ingresos", "ingreso", "🎁", PALETTE[6]),
    c("Comida", "egreso", "🛒", PALETTE[1], 450),
    c("Casa", "egreso", "🏠", PALETTE[0], 700),
    c("Transporte", "egreso", "🚌", PALETTE[2], 120),
    c("Salidas", "egreso", "🍿", PALETTE[4], 150),
    c("Servicios", "egreso", "💡", PALETTE[3], 160),
    c("Salud", "egreso", "💊", PALETTE[5], null),
    c("Suscripciones", "egreso", "📺", PALETTE[6], 40),
  ];
}

// Movimientos de ejemplo de los últimos 4 meses, para que la demo se vea viva.
// Usa un azar "con semilla": siempre salen los mismos números.
export function sampleTransactions(cats: Category[]): Transaction[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (min: number, max: number) => Math.round((min + rnd() * (max - min)) * 100) / 100;
  const by = (name: string) => cats.find((c) => c.name === name)?.id ?? null;
  const txs: Transaction[] = [];
  const add = (date: string, name: string, amount: number, note: string) => {
    const cat = cats.find((c) => c.name === name);
    txs.push({ id: uid(), kind: cat?.kind ?? "egreso", amount, category_id: by(name), note, date });
  };

  const end = fromISO(today());
  const start = new Date(end.getFullYear(), end.getMonth() - 3, 1);
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const iso = toISO(d);
    const day = d.getDate();
    const wd = d.getDay();
    if (day === 1) {
      add(iso, "Sueldo", 2400, "Sueldo del mes");
      add(iso, "Casa", 650, "Alquiler");
    }
    if (day === 15 && rnd() > 0.3) add(iso, "Trabajos extra", pick(180, 520), "Proyecto freelance");
    if (day === 5) add(iso, "Servicios", pick(60, 90), "Luz y agua");
    if (day === 8) add(iso, "Servicios", 45, "Internet");
    if (day === 10) add(iso, "Suscripciones", 12.99, "Música");
    if (day === 18) add(iso, "Suscripciones", 9.99, "Películas");
    if (day === 22 && rnd() > 0.6) add(iso, "Otros ingresos", pick(40, 150), "Venta de algo usado");
    if (wd === 6) add(iso, "Comida", pick(55, 110), "Mercado de la semana");
    if (rnd() > 0.55) add(iso, "Comida", pick(4, 18), rnd() > 0.5 ? "Almuerzo" : "Café");
    if (wd >= 1 && wd <= 5 && rnd() > 0.5) add(iso, "Transporte", pick(2, 9), "Pasajes");
    if ((wd === 5 || wd === 6) && rnd() > 0.45) add(iso, "Salidas", pick(15, 60), rnd() > 0.5 ? "Cena con amigos" : "Cine");
    if (rnd() > 0.96) add(iso, "Salud", pick(15, 80), "Farmacia");
  }
  return txs.sort((a, b) => (a.date < b.date ? 1 : -1));
}
