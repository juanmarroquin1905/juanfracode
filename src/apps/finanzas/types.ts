// Tipos de la app de finanzas. Todo el código de esta carpeta se comparte entre
// la demo de la web (guarda en el navegador) y la plantilla descargable (guarda en Supabase).

export type Kind = "ingreso" | "egreso";

export type Category = {
  id: string;
  name: string;
  kind: Kind;
  emoji: string;
  color: string;
  budget: number | null; // presupuesto mensual (solo egresos)
};

export type Transaction = {
  id: string;
  kind: Kind;
  amount: number;
  category_id: string | null;
  note: string;
  date: string; // AAAA-MM-DD
};

export type Settings = {
  currency: string; // código ISO, ej: USD, PEN, MXN
};
