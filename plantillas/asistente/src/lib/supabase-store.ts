import type { SupabaseClient } from "@supabase/supabase-js";
import type { AsistenteStore } from "@/asistente/store";
import { emptyData, type Data } from "@/asistente/types";

// Guarda todo lo de NOVA en la tabla asistente_data de Supabase (supabase/schema.sql).
// Una fila por persona con todos sus datos juntos. Simple y suficiente para uso personal.
export function createSupabaseStore(db: SupabaseClient): AsistenteStore {
  return {
    async load() {
      const { data, error } = await db.from("asistente_data").select("data").maybeSingle();
      if (error) throw new Error(error.message);
      return { ...emptyData(), ...((data?.data as Partial<Data>) ?? {}) };
    },
    async save(d) {
      const { error } = await db.from("asistente_data").upsert({ data: d, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    },
  };
}
