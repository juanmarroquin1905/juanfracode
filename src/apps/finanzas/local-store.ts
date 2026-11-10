import { defaultCategories, sampleTransactions } from "./seed";
import type { FinanceStore } from "./store";
import type { Category, Transaction } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
type Data = { categories: Category[]; transactions: Transaction[] };

export function createLocalStore(key = "finanzas-demo", withSamples = true): FinanceStore {
  let mem: Data | null = null;

  const fresh = (): Data => {
    const categories = defaultCategories();
    return { categories, transactions: withSamples ? sampleTransactions(categories) : [] };
  };
  const read = (): Data => {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return (mem = JSON.parse(raw) as Data);
    } catch {}
    mem = fresh();
    write();
    return mem;
  };
  const write = () => {
    try {
      localStorage.setItem(key, JSON.stringify(mem));
    } catch {}
  };
  const upsert = <T extends { id: string }>(list: T[], item: T) => {
    const i = list.findIndex((x) => x.id === item.id);
    if (i === -1) list.unshift(item);
    else list[i] = item;
  };

  return {
    async listCategories() {
      return [...read().categories];
    },
    async listTransactions() {
      return [...read().transactions];
    },
    async saveCategory(c) {
      upsert(read().categories, c);
      write();
    },
    async deleteCategory(id) {
      const d = read();
      d.categories = d.categories.filter((c) => c.id !== id);
      d.transactions = d.transactions.map((t) => (t.category_id === id ? { ...t, category_id: null } : t));
      write();
    },
    async saveTransaction(t) {
      upsert(read().transactions, t);
      write();
    },
    async deleteTransaction(id) {
      const d = read();
      d.transactions = d.transactions.filter((t) => t.id !== id);
      write();
    },
    async reset() {
      mem = fresh();
      write();
    },
  };
}
