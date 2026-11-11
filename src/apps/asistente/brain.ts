import type { Data } from "./types";
import { addDays, greeting, longDate, money, nowTime, sameMonth, today, uid, weekStart } from "./utils";

// El "cerebro" de NOVA. En esta versión NO usa inteligencia artificial ni APIs:
// entiende frases simples con reglas. Así funciona gratis y sin claves.
// (Si quieres que entienda cualquier frase, mira "Conectar Claude" en el README).

export type Reply = { text: string; data?: Data };

/** Frases de ejemplo que se muestran como botones. */
export const SUGGESTIONS = [
  "¿Qué tengo hoy?",
  "Agrega tarea llamar al banco",
  "Gasté 20 en comida",
  "Agenda a las 16:00 reunión con Sofía",
  "Entrené 45 minutos de piernas",
  "Nota: comprar regalo para mamá",
  "¿Cuánto gasté este mes?",
];

// Quita tildes y mayúsculas para comparar más fácil.
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s: string) => cap(s.trim().replace(/^(que|de|el|la|a)\s+/i, "").replace(/[.!?¡¿]+$/g, "").trim());

const CATEGORIES: [string, RegExp][] = [
  ["Comida", /comida|almuerzo|cena|desayuno|cafe|restaurante|pizza|hamburguesa/],
  ["Supermercado", /super|mercado|compras/],
  ["Transporte", /taxi|uber|bus|gasolina|transporte|pasaje/],
  ["Suscripciones", /netflix|spotify|suscrip|musica|nube/],
  ["Salidas", /cine|salida|fiesta|bar|concierto/],
  ["Salud", /farmacia|doctor|medic|gym|gimnasio|proteina/],
  ["Casa", /luz|agua|internet|alquiler|renta|casa/],
];

/** Lo que pasa hoy, en una frase. */
export function summary(d: Data) {
  const t = today();
  const now = nowTime();
  const events = d.events.filter((e) => e.date === t && e.time >= now).sort((a, b) => a.time.localeCompare(b.time));
  const pending = d.tasks.filter((x) => !x.done);
  const spent = monthSpent(d);
  const parts = [`Hoy es ${longDate(t)}.`];
  parts.push(
    events.length
      ? `Te quedan ${events.length} ${events.length === 1 ? "evento" : "eventos"}; el próximo es "${events[0].title}" a las ${events[0].time}.`
      : "No te quedan eventos en la agenda de hoy.",
  );
  parts.push(pending.length ? `Tienes ${pending.length} ${pending.length === 1 ? "tarea pendiente" : "tareas pendientes"}.` : "No tienes tareas pendientes. ¡Bien!");
  parts.push(`Este mes llevas ${money(spent)} de ${money(d.budget)}.`);
  return parts.join(" ");
}

export const monthSpent = (d: Data) => d.expenses.filter((e) => sameMonth(e.date, today())).reduce((s, e) => s + e.amount, 0);
export const weekWorkouts = (d: Data) => {
  const ws = weekStart(today());
  return d.workouts.filter((w) => w.date >= ws && w.date <= today());
};

export function think(input: string, d: Data): Reply {
  const raw = input.trim();
  const q = norm(raw);
  if (!q) return { text: "Te escucho." };

  // Saludo
  if (/^(hola|hey|buenas|buenos dias|buenas tardes|buenas noches|que tal)\b/.test(q)) {
    return { text: `${greeting()}. Soy NOVA, tu asistente. ${summary(d)}` };
  }

  // Ayuda
  if (/ayuda|que puedes hacer|que sabes hacer|comandos/.test(q)) {
    return {
      text: "Puedo anotar tareas, gastos, notas, entrenamientos y eventos de tu agenda, y darte un resumen del día. Prueba: \"agrega tarea…\", \"gasté 15 en café\", \"agenda a las 5 dentista\", \"entrené 40 minutos\" o \"¿qué tengo hoy?\".",
    };
  }

  // Hora y fecha
  if (/^(que hora es|hora)\b/.test(q)) return { text: `Son las ${nowTime()}.` };
  if (/que dia es|fecha de hoy/.test(q)) return { text: `Hoy es ${longDate(today())}.` };

  // Gasto: "gasté 20 en comida", "gasto de 15.5 taxi"
  let m = q.match(/^(?:gaste|gasto|pague|anota (?:un )?gasto(?: de)?)\s*(?:de\s*)?\$?\s*(\d+(?:[.,]\d+)?)\s*(?:soles|pesos|dolares|euros)?\s*(?:en|de|por)?\s*(.*)$/);
  if (m) {
    const amount = Number(m[1].replace(",", "."));
    const what = m[2].trim();
    const category = CATEGORIES.find(([, re]) => re.test(what))?.[0] ?? "Otros";
    const exp = { id: uid(), date: today(), amount, category, note: what ? clean(what) : category };
    const next = { ...d, expenses: [exp, ...d.expenses] };
    const spent = monthSpent(next);
    const left = d.budget - spent;
    return {
      data: next,
      text: `Anotado: ${money(amount)} en ${category}. Llevas ${money(spent)} este mes${left >= 0 ? `, te quedan ${money(left)} del presupuesto.` : `, te pasaste por ${money(-left)}.`}`,
    };
  }

  // Cuánto gasté
  if (/cuanto (gaste|llevo|he gastado)|mis gastos|gastos del mes/.test(q)) {
    const list = d.expenses.filter((e) => sameMonth(e.date, today()));
    if (!list.length) return { text: "Este mes todavía no anotaste gastos." };
    const by = new Map<string, number>();
    list.forEach((e) => by.set(e.category, (by.get(e.category) ?? 0) + e.amount));
    const [topCat, topAmt] = [...by.entries()].sort((a, b) => b[1] - a[1])[0];
    return { text: `Este mes llevas ${money(monthSpent(d))} en ${list.length} gastos. Donde más gastas es ${topCat} (${money(topAmt)}).` };
  }

  // Agenda: "agenda a las 16:00 reunión", "reunión a las 5 con Ana", "mañana a las 9 dentista"
  m = q.match(/(?:a las|a la)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (m && /agenda|cita|reunion|evento|recordatorio|llamada|manana|hoy/.test(q)) {
    let h = Number(m[1]);
    if (m[3] === "pm" && h < 12) h += 12;
    else if (!m[3] && h >= 1 && h <= 7) h += 12; // "a las 5" = 17:00
    const time = `${String(Math.min(h, 23)).padStart(2, "0")}:${m[2] ?? "00"}`;
    const date = /manana/.test(q) ? addDays(today(), 1) : today();
    // El título es lo que queda al quitar la hora y las palabras de comando (del texto original, con tildes).
    const title = clean(
      raw
        .replace(/(a las|a la)\s*\d{1,2}(:\d{2})?\s*(am|pm)?/i, " ")
        .replace(/^(agenda(me)?|agrega|añade|pon)\s*(una|un)?\s*(cita|evento|recordatorio)?\s*(de|para)?/i, "")
        .replace(/\b(hoy|mañana|manana)\b/gi, "")
        .replace(/\s+/g, " "),
    ) || "Evento";
    const ev = { id: uid(), date, time, title };
    return {
      data: { ...d, events: [...d.events, ev] },
      text: `Listo, agendé "${title}" ${date === today() ? "hoy" : "mañana"} a las ${time}.`,
    };
  }

  // Qué tengo hoy / resumen / agenda
  if (/que tengo|resumen|mi dia|como va mi dia|agenda|pendientes|que me toca/.test(q)) {
    return { text: summary(d) };
  }

  // Completar tarea: "completa pagar internet", "ya hice X", "listo X"
  m = q.match(/^(?:completa|complete|termine|marca|ya hice|listo|hecho|tache)\s+(?:la tarea\s+)?(.+)$/);
  if (m) {
    const words = m[1].split(/\s+/).filter((w) => w.length > 2);
    const task = d.tasks.find((x) => !x.done && words.some((w) => norm(x.text).includes(w)));
    if (!task) return { text: `No encontré una tarea pendiente parecida a "${m[1]}".` };
    return {
      data: { ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, done: true } : x)) },
      text: `¡Bien hecho! Marqué "${task.text}" como lista.`,
    };
  }

  // Nueva tarea: "agrega tarea X", "recuérdame X", "tengo que X"
  m = raw.match(/^(?:agrega(?:r)?|añade|anota|crea|nueva)?\s*(?:una\s+)?tarea[:\s]+(.+)$/i) ?? raw.match(/^(?:recu[eé]rdame|tengo que|debo)\s+(.+)$/i);
  if (m) {
    const text = clean(m[1]);
    return {
      data: { ...d, tasks: [{ id: uid(), text, done: false }, ...d.tasks] },
      text: `Agregué la tarea "${text}". Tienes ${d.tasks.filter((x) => !x.done).length + 1} pendientes.`,
    };
  }

  // Entrenamiento: "entrené 45 minutos de piernas", "fui al gym"
  if (/^(entrene|fui al gym|fui al gimnasio|hice ejercicio|corri|sali a correr)/.test(q)) {
    const min = Number(q.match(/(\d+)\s*(minutos|min)/)?.[1] ?? 45);
    const hour = q.match(/(\d+)\s*(horas|hora)/)?.[1];
    const minutes = hour ? Number(hour) * 60 : min;
    const name = clean(
      raw
        .replace(/^(entren[eé]|fui al (gym|gimnasio)|hice ejercicio|corr[ií]|sal[ií] a correr)/i, "")
        .replace(/\d+\s*(minutos|min|horas|hora)/i, "")
        .replace(/^\s*(de|a)\s+/i, ""),
    ) || (/corr/.test(q) ? "Correr" : "Entrenamiento");
    const next = { ...d, workouts: [{ id: uid(), date: today(), name, minutes }, ...d.workouts] };
    const n = new Set(weekWorkouts(next).map((w) => w.date)).size;
    return {
      data: next,
      text: `Registré ${minutes} minutos de ${name.toLowerCase()}. Esta semana llevas ${n} de ${d.gymGoal} días. ${n >= d.gymGoal ? "¡Meta cumplida! 💪" : "¡Sigue así!"}`,
    };
  }

  // Nota: "nota: X", "anota X", "apunta X"
  m = raw.match(/^(?:nota|anota|apunta|guarda)[:\s]+(?:que\s+)?(.+)$/i);
  if (m) {
    const text = clean(m[1]);
    return {
      data: { ...d, notes: [{ id: uid(), text, created_at: new Date().toISOString() }, ...d.notes] },
      text: `Guardé la nota: "${text}".`,
    };
  }

  // Gimnasio
  if (/gym|gimnasio|entreno|entrenamiento/.test(q)) {
    const n = new Set(weekWorkouts(d).map((w) => w.date)).size;
    return { text: `Esta semana entrenaste ${n} de ${d.gymGoal} días. ${n >= d.gymGoal ? "¡Meta cumplida!" : `Te faltan ${d.gymGoal - n}.`}` };
  }

  if (/gracias/.test(q)) return { text: "Para eso estoy. 😉" };

  return {
    text: "En esta demo entiendo frases simples, como \"agrega tarea…\", \"gasté 20 en comida\" o \"¿qué tengo hoy?\". Conectada a Claude, te entendería cualquier cosa.",
  };
}
