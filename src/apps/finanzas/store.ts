import type { Category, Transaction } from "./types";

// Dónde se guardan los datos. La demo usa el navegador (local-store.ts) y la
// plantilla usa Supabase. La pantalla no sabe cuál es: solo llama a estas funciones.
export interface FinanceStore {
  listCategories(): Promise<Category[]>;
  listTransactions(): Promise<Transaction[]>;
  saveCategory(c: Category): Promise<void>; // crea o actualiza
  deleteCategory(id: string): Promise<void>; // sus movimientos quedan "Sin categoría"
  saveTransaction(t: Transaction): Promise<void>; // crea o actualiza
  deleteTransaction(id: string): Promise<void>;
  /** Solo la demo: vuelve a los datos de ejemplo. */
  reset?(): Promise<void>;
}
