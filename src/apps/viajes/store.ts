import type { ListName, Rows, Trip, TripData } from "./types";

// Dónde se guardan los datos. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface TripStore {
  listTrips(): Promise<Trip[]>;
  saveTrip(t: Trip): Promise<void>; // crea o actualiza
  deleteTrip(id: string): Promise<void>; // borra también todo lo del viaje
  loadTrip(id: string): Promise<TripData>;
  save<L extends ListName>(list: L, row: Rows[L]): Promise<void>; // crea o actualiza
  remove(list: ListName, id: string): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
