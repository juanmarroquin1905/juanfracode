import type { ExpenseCategory, PackGroup, Trip } from "./types";

// Fechas, dinero y textos. Las fechas son textos "AAAA-MM-DD" para que no
// cambien con la zona horaria.

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
/** Días de a hasta b (b - a). */
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);
/** Todos los días del viaje, del primero al último. */
export const tripDays = (t: Pick<Trip, "start_date" | "end_date">) => {
  const n = Math.max(0, daysBetween(t.start_date, t.end_date));
  return Array.from({ length: Math.min(n + 1, 60) }, (_, i) => addDays(t.start_date, i));
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEK = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const WEEK_LONG = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const shortDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const weekDay = (s: string) => WEEK[fromISO(s).getDay()];
export const longDay = (s: string) => {
  const d = fromISO(s);
  return `${WEEK_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};
export const rangeLabel = (a: string, b: string) => {
  const da = fromISO(a);
  const db = fromISO(b);
  const y = db.getFullYear();
  if (a === b) return `${shortDate(a)} ${y}`;
  if (da.getMonth() === db.getMonth() && da.getFullYear() === y) return `${da.getDate()} al ${db.getDate()} ${MONTHS[db.getMonth()]} ${y}`;
  return `${shortDate(a)} al ${shortDate(b)} ${y}`;
};

export type TripStatus = { kind: "pronto" | "viajando" | "visitado"; label: string; day?: number };
/** ¿Falta, estás viajando o ya fuiste? */
export function tripStatus(t: Trip, now = today()): TripStatus {
  if (now < t.start_date) {
    const n = daysBetween(now, t.start_date);
    return { kind: "pronto", label: n === 1 ? "Sales mañana" : `Faltan ${n} días` };
  }
  if (now <= t.end_date) {
    const day = daysBetween(t.start_date, now) + 1;
    return { kind: "viajando", label: `En viaje · día ${day}`, day };
  }
  return { kind: "visitado", label: "Visitado" };
}

export const CURRENCIES = [
  { code: "USD", label: "Dólar (US$)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "MXN", label: "Peso mexicano" },
  { code: "COP", label: "Peso colombiano" },
  { code: "ARS", label: "Peso argentino" },
  { code: "CLP", label: "Peso chileno" },
  { code: "PEN", label: "Sol peruano" },
  { code: "GTQ", label: "Quetzal" },
  { code: "BOB", label: "Boliviano" },
  { code: "UYU", label: "Peso uruguayo" },
  { code: "DOP", label: "Peso dominicano" },
  { code: "BRL", label: "Real brasileño" },
  { code: "CRC", label: "Colón costarricense" },
];

const fmtCache = new Map<string, Intl.NumberFormat>();
export function money(n: number, currency: string, decimals = false) {
  const key = `${currency}-${decimals}`;
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("es-419", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: decimals ? 2 : 0,
      minimumFractionDigits: decimals ? 2 : 0,
    });
    fmtCache.set(key, f);
  }
  return f.format(n);
}

/** Categorías de gastos. El alojamiento sale solo de la pestaña Alojamiento. */
export const EXPENSE_CATS: Record<ExpenseCategory | "alojamiento", { label: string; emoji: string; color: string }> = {
  transporte: { label: "Transporte", emoji: "✈️", color: "#2f5d8a" },
  alojamiento: { label: "Alojamiento", emoji: "🏨", color: "#8a5a9e" },
  comida: { label: "Comida", emoji: "🍽️", color: "#d0832b" },
  actividades: { label: "Actividades", emoji: "🎟️", color: "#2e7d6b" },
  compras: { label: "Compras", emoji: "🛍️", color: "#c4472f" },
  otros: { label: "Otros", emoji: "🧾", color: "#8c7f6a" },
};
export const EXPENSE_KEYS: ExpenseCategory[] = ["transporte", "comida", "actividades", "compras", "otros"];

export const PACK_GROUPS: Record<PackGroup, { label: string; emoji: string }> = {
  documentos: { label: "Documentos", emoji: "🛂" },
  ropa: { label: "Ropa", emoji: "👕" },
  aseo: { label: "Aseo", emoji: "🧴" },
  tecnologia: { label: "Tecnología", emoji: "🔌" },
  botiquin: { label: "Botiquín", emoji: "💊" },
  otros: { label: "Otros", emoji: "🎒" },
};
export const PACK_KEYS = Object.keys(PACK_GROUPS) as PackGroup[];

/** Colores de la postal de cada viaje. */
export const TRIP_COLORS = ["#c4472f", "#2f5d8a", "#2e7d6b", "#d0832b", "#8a5a9e", "#1d2b4f"];
export const FLAGS = ["🇵🇪", "🇲🇽", "🇨🇴", "🇦🇷", "🇨🇱", "🇬🇹", "🇧🇷", "🇪🇸", "🇺🇸", "🇯🇵", "🇮🇹", "🇫🇷", "🏝️", "🏔️", "✈️"];

/** Enlace para abrir un lugar en Google Maps. */
export const mapsLink = (q: { lat: number | null; lng: number | null; text: string }) =>
  q.lat != null && q.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${q.lat},${q.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.text)}`;

export type Place = { name: string; detail: string; lat: number; lng: number };
/** Busca un lugar en OpenStreetMap (gratis, sin clave). Primero cerca del destino. */
export async function searchPlace(q: string, near: string): Promise<Place[]> {
  const ask = async (text: string) => {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=es&q=${encodeURIComponent(text)}`,
    );
    if (!r.ok) throw new Error("No se pudo buscar");
    const rows = (await r.json()) as { name?: string; display_name: string; lat: string; lon: string }[];
    return rows.map((x) => {
      const parts = x.display_name.split(", ");
      return {
        name: x.name || parts[0],
        detail: parts.slice(x.name ? 1 : 1, 4).join(", "),
        lat: Number(x.lat),
        lng: Number(x.lon),
      };
    });
  };
  const nearby = near && !q.toLowerCase().includes(near.toLowerCase()) ? await ask(`${q}, ${near}`) : [];
  return nearby.length ? nearby : ask(q);
}
