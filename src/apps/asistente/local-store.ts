import { sampleData } from "./seed";
import type { AsistenteStore } from "./store";
import { emptyData, type Data } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
export function createLocalStore(key = "asistente-demo", withSamples = true): AsistenteStore {
  const fresh = () => (withSamples ? sampleData() : emptyData());
  const write = (d: Data) => {
    try {
      localStorage.setItem(key, JSON.stringify(d));
    } catch {}
  };

  return {
    async load() {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return { ...emptyData(), ...(JSON.parse(raw) as Partial<Data>) };
      } catch {}
      const d = fresh();
      write(d);
      return d;
    },
    async save(d) {
      write(d);
    },
    async reset() {
      write(fresh());
    },
  };
}
