import type { CrmData, ListName, Rows } from "./types";

// Dónde se guardan los datos. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface CrmStore {
  load(): Promise<CrmData>;
  save<L extends ListName>(list: L, row: Rows[L]): Promise<void>; // crea o actualiza
  /** Borrar un contacto borra también sus tratos, seguimientos y notas. */
  remove(list: ListName, id: string): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
