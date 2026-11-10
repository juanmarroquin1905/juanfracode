import type { Client } from "./types";

// Dónde se guardan los clientes. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface CrmStore {
  list(): Promise<Client[]>;
  save(c: Client): Promise<void>; // crea o actualiza
  remove(id: string): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
