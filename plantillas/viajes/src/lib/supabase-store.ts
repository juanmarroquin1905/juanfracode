import type { SupabaseClient } from "@supabase/supabase-js";
import type { TripStore } from "@/viajes/store";
import type { Activity, Expense, ListName, PackItem, Stay, Trip } from "@/viajes/types";

// Guarda en tus tablas de Supabase (supabase/schema.sql).
const TABLES: Record<ListName, string> = {
  stays: "trip_stays",
  expenses: "trip_expenses",
  activities: "trip_activities",
  packing: "trip_packing",
};

const num = (v: unknown) => (v == null ? null : Number(v));

export function createSupabaseStore(db: SupabaseClient): TripStore {
  const check = <T,>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  const rows = async <T,>(table: string, tripId: string, cols: string, order: string) =>
    (check(await db.from(table).select(cols).eq("trip_id", tripId).order(order).limit(5000)) ?? []) as T[];

  return {
    async listTrips() {
      const r = check(
        await db
          .from("trips")
          .select("id,name,destination,flag,start_date,end_date,budget,currency,travelers,color,notes")
          .order("start_date"),
      );
      return (r ?? []).map((t) => ({ ...t, budget: num(t.budget) })) as Trip[];
    },
    async saveTrip(t) {
      check(await db.from("trips").upsert(t));
    },
    async deleteTrip(id) {
      // Las demás tablas se borran solas (on delete cascade).
      check(await db.from("trips").delete().eq("id", id));
    },
    async loadTrip(id) {
      const [stays, expenses, activities, packing] = await Promise.all([
        rows<Stay>(TABLES.stays, id, "id,trip_id,name,address,check_in,check_out,price,paid,confirmation,url,lat,lng", "check_in"),
        rows<Expense>(TABLES.expenses, id, "id,trip_id,amount,category,note,date", "date"),
        rows<Activity>(TABLES.activities, id, "id,trip_id,date,time,title,place,notes,lat,lng,done", "date"),
        rows<PackItem>(TABLES.packing, id, "id,trip_id,name,group,checked", "created_at"),
      ]);
      return {
        stays: stays.map((s) => ({ ...s, price: Number(s.price), lat: num(s.lat), lng: num(s.lng) })),
        expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
        activities: activities.map((a) => ({ ...a, lat: num(a.lat), lng: num(a.lng) })),
        packing,
      };
    },
    async save(list, row) {
      check(await db.from(TABLES[list]).upsert(row));
    },
    async remove(list, id) {
      check(await db.from(TABLES[list]).delete().eq("id", id));
    },
  };
}
