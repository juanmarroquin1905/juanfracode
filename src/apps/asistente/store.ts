import type { Data } from "./types";

// Dónde se guardan tus datos. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface AsistenteStore {
  load(): Promise<Data>;
  save(d: Data): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
