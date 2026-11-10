// Tipos del planificador de viajes. Todo el código de esta carpeta se comparte
// entre la demo de la web (guarda en el navegador) y la plantilla descargable
// (guarda en Supabase).

export type Trip = {
  id: string;
  name: string; // ej: "Cusco y Machu Picchu"
  destination: string; // ej: "Cusco, Perú" (se usa también para buscar lugares)
  flag: string; // emoji de bandera o ícono
  start_date: string; // AAAA-MM-DD
  end_date: string; // AAAA-MM-DD
  budget: number | null; // presupuesto total del viaje
  currency: string; // código ISO, ej: USD, PEN, MXN
  travelers: number;
  color: string; // color de la postal
  notes: string;
};

/** Hotel, Airbnb, hostal... Su precio se suma solo a "Alojamiento". */
export type Stay = {
  id: string;
  trip_id: string;
  name: string;
  address: string;
  check_in: string; // AAAA-MM-DD
  check_out: string; // AAAA-MM-DD
  price: number; // total de la estadía
  paid: boolean;
  confirmation: string; // código de reserva
  url: string;
  lat: number | null;
  lng: number | null;
};

export type ExpenseCategory = "transporte" | "comida" | "actividades" | "compras" | "otros";

export type Expense = {
  id: string;
  trip_id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  date: string; // AAAA-MM-DD
};

/** Una parada del itinerario. lat/lng son opcionales (para el mapa). */
export type Activity = {
  id: string;
  trip_id: string;
  date: string; // AAAA-MM-DD
  time: string; // "HH:MM" o "" si no tiene hora
  title: string;
  place: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  done: boolean;
};

export type PackGroup = "documentos" | "ropa" | "aseo" | "tecnologia" | "botiquin" | "otros";

export type PackItem = {
  id: string;
  trip_id: string;
  name: string;
  group: PackGroup;
  checked: boolean;
};

export type TripData = {
  stays: Stay[];
  expenses: Expense[];
  activities: Activity[];
  packing: PackItem[];
};

/** Las cuatro listas que cuelgan de un viaje. */
export type Rows = {
  stays: Stay;
  expenses: Expense;
  activities: Activity;
  packing: PackItem;
};
export type ListName = keyof Rows;
