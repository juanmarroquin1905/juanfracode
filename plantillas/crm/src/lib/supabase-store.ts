import type { SupabaseClient } from "@supabase/supabase-js";
import type { CrmStore } from "@/crm/store";
import type { Client } from "@/crm/types";

// Guarda tus clientes en la tabla crm_clients de Supabase (supabase/schema.sql).
const COLS = "id,name,company,phone,email,service,value,stage,next_step,next_date,notes,color,created_at";

export function createSupabaseStore(db: SupabaseClient): CrmStore {
  const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    async list() {
      const rows = (check(await db.from("crm_clients").select(COLS).order("created_at").limit(5000)) ?? []) as Client[];
      return rows.map((c) => ({ ...c, value: Number(c.value) }));
    },
    async save(c) {
      check(await db.from("crm_clients").upsert(c));
    },
    async remove(id) {
      check(await db.from("crm_clients").delete().eq("id", id));
    },
  };
}
