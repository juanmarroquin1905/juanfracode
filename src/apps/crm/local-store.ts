import { sampleData } from "./seed";
import type { CrmStore } from "./store";
import type { CrmData, ListName } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
const empty = (): CrmData => ({ contacts: [], deals: [], tasks: [], notes: [] });

export function createLocalStore(key = "crm-demo", withSamples = true): CrmStore {
  let mem: CrmData | null = null;

  const fresh = () => (withSamples ? sampleData() : empty());
  const read = (): CrmData => {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return (mem = { ...empty(), ...(JSON.parse(raw) as CrmData) });
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

  return {
    async load() {
      const d = read();
      return { contacts: [...d.contacts], deals: [...d.deals], tasks: [...d.tasks], notes: [...d.notes] };
    },
    async save(list, row) {
      const rows = read()[list] as { id: string }[];
      const i = rows.findIndex((x) => x.id === row.id);
      if (i === -1) rows.push(row);
      else rows[i] = row;
      write();
    },
    async remove(list: ListName, id) {
      const d = read();
      if (list === "contacts") {
        // Igual que en Supabase: se va todo lo del contacto.
        d.contacts = d.contacts.filter((x) => x.id !== id);
        d.deals = d.deals.filter((x) => x.contact_id !== id);
        d.tasks = d.tasks.filter((x) => x.contact_id !== id);
        d.notes = d.notes.filter((x) => x.contact_id !== id);
      } else if (list === "deals") {
        d.deals = d.deals.filter((x) => x.id !== id);
        // Los seguimientos y notas se quedan en el contacto, sin trato.
        d.tasks = d.tasks.map((x) => (x.deal_id === id ? { ...x, deal_id: null } : x));
        d.notes = d.notes.map((x) => (x.deal_id === id ? { ...x, deal_id: null } : x));
      } else if (list === "tasks") {
        d.tasks = d.tasks.filter((x) => x.id !== id);
      } else {
        d.notes = d.notes.filter((x) => x.id !== id);
      }
      write();
    },
    async reset() {
      mem = fresh();
      write();
    },
  };
}
