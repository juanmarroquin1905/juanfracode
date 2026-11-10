import { sampleClients } from "./seed";
import type { CrmStore } from "./store";
import type { Client } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
export function createLocalStore(key = "crm-demo", withSamples = true): CrmStore {
  let mem: Client[] | null = null;

  const fresh = () => (withSamples ? sampleClients() : []);
  const read = (): Client[] => {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return (mem = parsed as Client[]);
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
    async list() {
      return [...read()];
    },
    async save(c) {
      const list = read();
      const i = list.findIndex((x) => x.id === c.id);
      if (i === -1) list.push(c);
      else list[i] = c;
      write();
    },
    async remove(id) {
      mem = read().filter((x) => x.id !== id);
      write();
    },
    async reset() {
      mem = fresh();
      write();
    },
  };
}
