// Fechas, horas y dinero.

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
export const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const sameMonth = (a: string, b: string) => a.slice(0, 7) === b.slice(0, 7);

/** Lunes de la semana de esa fecha. */
export function weekStart(s: string) {
  const d = fromISO(s);
  const dow = (d.getDay() + 6) % 7; // lunes = 0
  return addDays(s, -dow);
}

const WEEK = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const longDate = (s: string) => {
  const d = fromISO(s);
  return `${WEEK[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};
export const monthName = (s: string) => MONTHS[fromISO(s).getMonth()];
export const shortDay = (s: string) => ["D", "L", "M", "M", "J", "V", "S"][fromISO(s).getDay()];

export function money(n: number) {
  return "$" + n.toLocaleString("es", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
}

/** Saludo según la hora. */
export function greeting(h = new Date().getHours()) {
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
