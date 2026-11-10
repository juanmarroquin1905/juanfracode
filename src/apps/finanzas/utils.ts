// Fechas, dinero y agrupación por día / semana / mes. Las fechas son textos
// "AAAA-MM-DD" para que no cambien con la zona horaria.

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
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const monthKey = (s: string) => s.slice(0, 7); // "AAAA-MM"
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)); // lunes
export const shiftMonth = (key: string, n: number) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
export const daysInMonth = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
};
export const shortDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const dayTitle = (s: string) => {
  const t = today();
  if (s === t) return "Hoy";
  if (s === toISO(addDays(fromISO(t), -1))) return "Ayer";
  const d = fromISO(s);
  const wd = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][d.getDay()];
  return `${wd[0].toUpperCase()}${wd.slice(1)} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()].toLowerCase()}`;
};

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
  { code: "VES", label: "Bolívar" },
];

const fmtCache = new Map<string, Intl.NumberFormat>();
export function money(n: number, currency: string, compact = false) {
  const key = `${currency}-${compact}`;
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("es-419", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: compact ? 1 : 2,
      minimumFractionDigits: compact ? 0 : 2,
      notation: compact ? "compact" : "standard",
    });
    fmtCache.set(key, f);
  }
  return f.format(n);
}

export type Grain = "dia" | "semana" | "mes";
export type Bucket = { key: string; label: string; from: string; to: string; ingreso: number; egreso: number };

// Arma las barras del gráfico. Día = cada día del mes elegido; Semana = 12
// semanas que terminan en el mes elegido; Mes = 12 meses hasta el mes elegido.
export function buckets(
  txs: { kind: "ingreso" | "egreso"; amount: number; date: string }[],
  grain: Grain,
  month: string,
): Bucket[] {
  const out: Bucket[] = [];
  if (grain === "dia") {
    const n = daysInMonth(month);
    for (let i = 1; i <= n; i++) {
      const d = `${month}-${pad(i)}`;
      out.push({ key: d, label: String(i), from: d, to: d, ingreso: 0, egreso: 0 });
    }
  } else if (grain === "semana") {
    const end = fromISO(`${month}-${pad(daysInMonth(month))}`);
    let start = startOfWeek(end);
    for (let i = 0; i < 12; i++) {
      out.unshift({
        key: toISO(start),
        label: shortDate(toISO(start)),
        from: toISO(start),
        to: toISO(addDays(start, 6)),
        ingreso: 0,
        egreso: 0,
      });
      start = addDays(start, -7);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const k = shiftMonth(month, -i);
      const m = Number(k.split("-")[1]);
      out.push({
        key: k,
        label: MONTHS[m - 1],
        from: `${k}-01`,
        to: `${k}-${pad(daysInMonth(k))}`,
        ingreso: 0,
        egreso: 0,
      });
    }
  }
  const first = out[0].from;
  const last = out[out.length - 1].to;
  for (const t of txs) {
    if (t.date < first || t.date > last) continue;
    const b = out.find((x) => t.date >= x.from && t.date <= x.to);
    if (b) b[t.kind] += t.amount;
  }
  return out;
}

export function bucketTitle(b: Bucket, grain: Grain) {
  if (grain === "dia") return dayTitle(b.from);
  if (grain === "semana") return `Semana del ${shortDate(b.from)} al ${shortDate(b.to)}`;
  return monthLabel(b.key);
}

// Descarga los movimientos como CSV (se abre en Excel o Google Sheets).
export function downloadCSV(
  rows: { date: string; kind: string; category: string; note: string; amount: number }[],
  filename: string,
) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    ["Fecha", "Tipo", "Categoría", "Nota", "Monto"].join(","),
    ...rows.map((r) => [r.date, r.kind, r.category, r.note, r.amount.toFixed(2)].map(esc).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
