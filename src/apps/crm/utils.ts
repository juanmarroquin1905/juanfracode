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
export const STAGES: { id: Stage; label: string; emoji: string; color: string; hint: string }[] = [
  { id: "nuevo", label: "Nuevo", emoji: "🌱", color: "#cdeafe", hint: "Te escribió o lo encontraste. ¡Salúdalo!" },
  { id: "hablando", label: "Hablando", emoji: "💬", color: "#fff1b8", hint: "Ya están conversando sobre lo que necesita." },
  { id: "propuesta", label: "Propuesta", emoji: "📝", color: "#ffdcc2", hint: "Le mandaste tu precio. Falta que diga que sí." },
  { id: "cliente", label: "Cliente", emoji: "🎉", color: "#c9f2dd", hint: "¡Dijo que sí! Aquí van tus clientes." },
  { id: "perdido", label: "Perdido", emoji: "💤", color: "#e7e3ef", hint: "No se dio esta vez." },
];
export const BOARD = STAGES.filter((s) => s.id !== "perdido");
export const stageOf = (id: Stage) => STAGES.find((s) => s.id === id) ?? STAGES[0];
export const isActive = (c: Pick<Client, "stage">) => c.stage === "nuevo" || c.stage === "hablando" || c.stage === "propuesta";

export const COLORS = ["#cdeafe", "#fff1b8", "#ffdcc2", "#ffd3e2", "#c9f2dd", "#e2d9ff"];
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
/** Enlace a WhatsApp con el número limpio (solo dígitos). */
export const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
