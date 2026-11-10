import type { Contact, Deal, Stage, Task, TaskKind } from "./types";

// Fechas, dinero, etapas y textos. Las fechas son textos "AAAA-MM-DD".

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
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEK = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
export const monthName = (m: number) => MONTHS[m];
export const shortDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
/** "Hoy", "Mañana", "Ayer", "Hace 3 días", "En 5 días" o la fecha. */
export function relDay(s: string, now = today()) {
  const n = daysBetween(now, s);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  if (n === -1) return "Ayer";
  if (n < 0 && n > -7) return `Hace ${-n} días`;
  if (n > 1 && n < 7) return `${WEEK[fromISO(s).getDay()]} ${fromISO(s).getDate()}`;
  return shortDate(s);
}

/* ---------- Dinero ---------- */

export const CURRENCIES = ["USD", "EUR", "MXN", "COP", "PEN", "CLP", "ARS", "GTQ", "DOP", "BOB", "UYU", "CRC"];
export function money(n: number, currency = "USD", compact = false) {
  const whole = Number.isInteger(n) || Math.abs(n) >= 1000 || compact;
  try {
    return new Intl.NumberFormat("es-419", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
      notation: compact && Math.abs(n) >= 100000 ? "compact" : "standard",
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n)}`;
  }
}

/* ---------- Etapas del embudo ---------- */

export const STAGES: { id: Stage; label: string; color: string; hint: string; chance: number }[] = [
  { id: "nuevo", label: "Nuevo", color: "#a8dcff", hint: "Te escribió o lo encontraste", chance: 0.1 },
  { id: "contactado", label: "Contactado", color: "#ffe066", hint: "Ya hablaron", chance: 0.25 },
  { id: "propuesta", label: "Propuesta", color: "#ffb37a", hint: "Le mandaste precio", chance: 0.5 },
  { id: "negociacion", label: "Negociación", color: "#ff9ec0", hint: "Ajustando detalles", chance: 0.75 },
  { id: "ganado", label: "Ganado", color: "#8be3b8", hint: "¡Dijo que sí!", chance: 1 },
  { id: "perdido", label: "Perdido", color: "#d6d1e0", hint: "No se dio", chance: 0 },
];
export const stageOf = (id: Stage) => STAGES.find((s) => s.id === id) ?? STAGES[0];
export const isOpen = (d: Pick<Deal, "stage">) => d.stage !== "ganado" && d.stage !== "perdido";

/* ---------- Seguimientos ---------- */

export const TASK_KINDS: { id: TaskKind; label: string; icon: string }[] = [
  { id: "llamada", label: "Llamada", icon: "📞" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "correo", label: "Correo", icon: "✉️" },
  { id: "reunion", label: "Reunión", icon: "🤝" },
  { id: "otro", label: "Otro", icon: "📌" },
];
export const kindOf = (id: TaskKind) => TASK_KINDS.find((k) => k.id === id) ?? TASK_KINDS[4];

/** Seguimientos pendientes ordenados: primero los atrasados. */
export const pendingTasks = (tasks: Task[]) => tasks.filter((t) => !t.done).sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0));

/* ---------- Contactos ---------- */

export const CONTACT_COLORS = ["#a8dcff", "#ffe066", "#ffb37a", "#ff9ec0", "#8be3b8", "#c9b5ff"];
export const SOURCES = ["Referido", "Instagram", "TikTok", "LinkedIn", "Mi web", "WhatsApp", "Evento", "Otro"];
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
/** Enlace a WhatsApp con el número limpio (solo dígitos). */
export const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Descarga los contactos como CSV (se abre en Excel o Google Sheets). */
export function exportContactsCSV(contacts: Contact[], deals: Deal[], currency: string) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["Nombre", "Empresa", "Correo", "Teléfono", "Origen", "Etiquetas", "Tratos abiertos", `Valor abierto (${currency})`, `Ganado (${currency})`, "Notas"];
  const lines = contacts.map((c) => {
    const mine = deals.filter((d) => d.contact_id === c.id);
    const open = mine.filter(isOpen);
    return [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.source,
      c.tags.join(", "),
      open.length,
      open.reduce((s, d) => s + d.value, 0),
      mine.filter((d) => d.stage === "ganado").reduce((s, d) => s + d.value, 0),
      c.notes,
    ]
      .map(cell)
      .join(",");
  });
  const blob = new Blob(["﻿" + [head.map(cell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `contactos-${today()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Moneda elegida (se recuerda en este navegador) ---------- */

const CUR_KEY = "crm-moneda";
export function loadCurrency() {
  try {
    return localStorage.getItem(CUR_KEY) || "USD";
  } catch {
    return "USD";
  }
}
export function saveCurrency(c: string) {
  try {
    localStorage.setItem(CUR_KEY, c);
  } catch {}
}
