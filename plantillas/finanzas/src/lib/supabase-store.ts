import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinanceStore } from "@/finanzas/store";
import type { Category, Transaction } from "@/finanzas/types";

// Guarda en tus tablas de Supabase (supabase/schema.sql).
export function createSupabaseStore(db: SupabaseClient): FinanceStore {
  const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  return {
    async listCategories() {
      const rows = check(await db.from("categories").select("id,name,kind,emoji,color,budget").order("created_at"));
      return (rows ?? []).map((c) => ({ ...c, budget: c.budget == null ? null : Number(c.budget) })) as Category[];
    },
    async listTransactions() {
      const rows = check(
        await db.from("transactions").select("id,kind,amount,category_id,note,date").order("date", { ascending: false }).limit(10000),
      );
      return (rows ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Transaction[];
    },
    async saveCategory(c) {
      check(await db.from("categories").upsert(c));
    },
    async deleteCategory(id) {
      check(await db.from("categories").delete().eq("id", id));
    },
    async saveTransaction(t) {
      check(await db.from("transactions").upsert(t));
    },
    async deleteTransaction(id) {
      check(await db.from("transactions").delete().eq("id", id));
    },
  };
}
