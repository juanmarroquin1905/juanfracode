import type { SupabaseClient } from "@supabase/supabase-js";
import type { CrmStore } from "@/crm/store";
import type { Contact, Deal, ListName, Note, Task } from "@/crm/types";

// Guarda en tus tablas de Supabase (supabase/schema.sql).
const TABLES: Record<ListName, string> = {
  contacts: "crm_contacts",
  deals: "crm_deals",
  tasks: "crm_tasks",
  notes: "crm_notes",
};

export function createSupabaseStore(db: SupabaseClient): CrmStore {
  const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  const all = async <T,>(list: ListName, cols: string, order: string) =>
    (check(await db.from(TABLES[list]).select(cols).order(order).limit(5000)) ?? []) as T[];

  return {
    async load() {
      const [contacts, deals, tasks, notes] = await Promise.all([
        all<Contact>("contacts", "id,name,company,email,phone,source,tags,notes,color,created_at", "created_at"),
        all<Deal>("deals", "id,contact_id,title,value,stage,close_date,closed_at,notes,position,created_at", "position"),
        all<Task>("tasks", "id,contact_id,deal_id,title,kind,due_date,done,created_at", "due_date"),
        all<Note>("notes", "id,contact_id,deal_id,text,date,created_at", "created_at"),
      ]);
      return {
        contacts: contacts.map((c) => ({ ...c, tags: c.tags ?? [] })),
        deals: deals.map((d) => ({ ...d, value: Number(d.value) })),
        tasks,
        notes,
      };
    },
    async save(list, row) {
      check(await db.from(TABLES[list]).upsert(row));
    },
    async remove(list, id) {
      // Al borrar un contacto, sus tratos, seguimientos y notas se borran solos (on delete cascade).
      check(await db.from(TABLES[list]).delete().eq("id", id));
    },
  };
}
