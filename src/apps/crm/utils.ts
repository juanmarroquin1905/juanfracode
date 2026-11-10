import type { Client, Stage } from "./types";

// Fechas, dinero y etapas. Las fechas son textos "AAAA-MM-DD".

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEK = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
/** "Hoy", "Mañana", "Ayer", "Hace 3 días", "vie 14" o "2 dic". */
export function relDay(s: string, now = today()) {
  const n = daysBetween(now, s);
  const d = fromISO(s);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  if (n === -1) return "Ayer";
  if (n < 0 && n > -7) return `Hace ${-n} días`;
  if (n > 1 && n < 7) return `${WEEK[d.getDay()]} ${d.getDate()}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function money(n: number) {
  try {
    return new Intl.NumberFormat("es-419", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

/** Las etapas, en orden. "Perdido" no sale en el tablero: queda guardado abajo. */
export const STAGES: { id: Stage; label: string; color: string; hint: string }[] = [
  { id: "nuevo", label: "Nuevo", color: "#a8dcff", hint: "Te escribió o lo encontraste" },
  { id: "hablando", label: "Hablando", color: "#ffe066", hint: "Ya están en conversación" },
  { id: "propuesta", label: "Propuesta", color: "#ffb37a", hint: "Le mandaste precio" },
  { id: "cliente", label: "Cliente", color: "#8be3b8", hint: "¡Dijo que sí!" },
  { id: "perdido", label: "Perdido", color: "#d6d1e0", hint: "No se dio" },
];
export const BOARD = STAGES.filter((s) => s.id !== "perdido");
export const stageOf = (id: Stage) => STAGES.find((s) => s.id === id) ?? STAGES[0];
export const isActive = (c: Pick<Client, "stage">) => c.stage === "nuevo" || c.stage === "hablando" || c.stage === "propuesta";

export const COLORS = ["#a8dcff", "#ffe066", "#ffb37a", "#ff9ec0", "#8be3b8", "#c9b5ff"];
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
/** Enlace a WhatsApp con el número limpio (solo dígitos). */
export const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
