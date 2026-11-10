import { sampleTrips } from "./seed";
import type { TripStore } from "./store";
import type { ListName, Trip, TripData } from "./types";

// Guarda todo en el navegador (localStorage). Lo usa la demo de la web y la
// plantilla mientras no tenga Supabase conectado.
type Data = { trips: Trip[]; data: Record<string, TripData> };

const emptyData = (): TripData => ({ stays: [], expenses: [], activities: [], packing: [] });

export function createLocalStore(key = "viajes-demo", withSamples = true): TripStore {
  let mem: Data | null = null;

  const fresh = (): Data => (withSamples ? sampleTrips() : { trips: [], data: {} });
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
    if (i === -1) list.push(item);
    else list[i] = item;
  };
  const tripData = (id: string) => (read().data[id] ??= emptyData());

  return {
    async listTrips() {
      return [...read().trips];
    },
    async saveTrip(t) {
      upsert(read().trips, t);
      write();
    },
    async deleteTrip(id) {
      const d = read();
      d.trips = d.trips.filter((t) => t.id !== id);
      delete d.data[id];
      write();
    },
    async loadTrip(id) {
      const d = tripData(id);
      return { stays: [...d.stays], expenses: [...d.expenses], activities: [...d.activities], packing: [...d.packing] };
    },
    async save(list, row) {
      upsert(tripData(row.trip_id)[list] as { id: string }[], row);
      write();
    },
    async remove(list: ListName, id) {
      for (const d of Object.values(read().data)) {
        const rows = d[list] as { id: string }[];
        const i = rows.findIndex((x) => x.id === id);
        if (i !== -1) rows.splice(i, 1);
      }
      write();
    },
    async reset() {
      mem = fresh();
      write();
    },
  };
}
