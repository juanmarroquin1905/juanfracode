import type { Contact, CrmData, Deal, Note, Stage, Task, TaskKind } from "./types";
import { addDays, CONTACT_COLORS, today, uid } from "./utils";

// Datos de ejemplo de la demo: los clientes de una persona freelance que hace
// páginas web y redes sociales. Las fechas se calculan desde hoy para que la
// demo siempre se vea "al día".

export function sampleData(): CrmData {
  const t = today();
  const d = (n: number) => addDays(t, n);
  const stamp = (n: number) => `${d(n)}T10:00:00.000Z`;

  const contacts: Contact[] = [];
  const deals: Deal[] = [];
  const tasks: Task[] = [];
  const notes: Note[] = [];

  const person = (name: string, company: string, extra: Partial<Contact> = {}) => {
    const c: Contact = {
      id: uid(),
      name,
      company,
      email: "",
      phone: "",
      source: "Referido",
      tags: [],
      notes: "",
      color: CONTACT_COLORS[contacts.length % CONTACT_COLORS.length],
      created_at: stamp(-60 + contacts.length * 5),
      ...extra,
    };
    contacts.push(c);
    return c;
  };
  const deal = (c: Contact, title: string, value: number, stage: Stage, extra: Partial<Deal> = {}) => {
    const x: Deal = {
      id: uid(),
      contact_id: c.id,
      title,
      value,
      stage,
      close_date: null,
      closed_at: null,
      notes: "",
      position: deals.filter((y) => y.stage === stage).length,
      created_at: stamp(-30),
      ...extra,
    };
    deals.push(x);
    return x;
  };
  const task = (c: Contact, title: string, kind: TaskKind, due: number, extra: Partial<Task> = {}) =>
    tasks.push({ id: uid(), contact_id: c.id, deal_id: null, title, kind, due_date: d(due), done: false, created_at: stamp(-3), ...extra });
  const note = (c: Contact, text: string, day: number, dealId: string | null = null) =>
    notes.push({ id: uid(), contact_id: c.id, deal_id: dealId, text, date: d(day), created_at: stamp(day) });

  const ana = person("Ana Torres", "Café Origen", {
    email: "ana@cafeorigen.com",
    phone: "+52 55 1234 5678",
    source: "Instagram",
    tags: ["restaurante", "recurrente"],
    notes: "Prefiere WhatsApp por la tarde. Tiene 2 sucursales.",
  });
  const luis = person("Luis Herrera", "Estudio Norte", { email: "luis@estudionorte.co", phone: "+57 300 555 1020", source: "LinkedIn", tags: ["arquitectura"] });
  const marta = person("Marta Gómez", "Yoga Prana", { email: "hola@yogaprana.com", phone: "+34 612 345 678", source: "Referido", tags: ["bienestar"] });
  const diego = person("Diego Ramírez", "TecnoFix", { email: "diego@tecnofix.pe", phone: "+51 987 654 321", source: "Mi web", tags: ["tecnología"] });
  const sofia = person("Sofía Castro", "Dulce Hogar Pastelería", { email: "sofia@dulcehogar.mx", phone: "+52 33 2222 1100", source: "TikTok", tags: ["restaurante"] });
  const pablo = person("Pablo Méndez", "Inmobiliaria Altos", { email: "pablo@altos.cl", phone: "+56 9 8765 4321", source: "Evento", tags: ["inmobiliaria", "grande"] });
  const vale = person("Valentina Ruiz", "", { email: "vale.ruiz@gmail.com", phone: "+54 9 11 4444 5555", source: "Instagram", tags: ["coach"], notes: "Coach de vida, quiere vender cursos." });
  const jorge = person("Jorge Paz", "Ferretería El Tornillo", { phone: "+502 5555 1234", source: "WhatsApp", tags: ["comercio"] });
  const camila = person("Camila Ortiz", "Clínica Sonríe", { email: "camila@sonrie.com", phone: "+57 310 222 3344", source: "Referido", tags: ["salud", "grande"] });

  // Embudo de hoy
  const d1 = deal(diego, "Landing para nuevo servicio", 450, "nuevo", { close_date: d(20) });
  deal(vale, "Web + página de ventas del curso", 900, "nuevo", { close_date: d(30) });
  const d3 = deal(jorge, "Catálogo online con WhatsApp", 600, "contactado", { close_date: d(14) });
  const d4 = deal(marta, "Web con reservas de clases", 1200, "propuesta", { close_date: d(5), notes: "Mandé 2 opciones: básica y con pagos." });
  const d5 = deal(pablo, "Portal de propiedades", 3800, "negociacion", { close_date: d(3), notes: "Pide descuento si paga todo por adelantado." });
  const d6 = deal(sofia, "Manejo de Instagram (3 meses)", 750, "propuesta", { close_date: d(-2) });
  const d7 = deal(camila, "Rediseño web + blog", 2400, "negociacion", { close_date: d(10) });

  // Ganados y perdidos (para los gráficos)
  const won = (c: Contact, title: string, value: number, daysAgo: number) =>
    deal(c, title, value, "ganado", { closed_at: d(-daysAgo), close_date: d(-daysAgo), created_at: stamp(-daysAgo - 20) });
  const w1 = won(ana, "Menú digital con QR", 350, 4);
  won(ana, "Logo y tarjetas", 280, 70);
  won(luis, "Web del estudio", 1800, 12);
  won(camila, "Mantenimiento web (trimestre)", 540, 40);
  won(sofia, "Fotos de producto", 320, 95);
  won(luis, "Presentación para concurso", 600, 130);
  won(ana, "Web de la segunda sucursal", 900, 155);
  deal(jorge, "Tienda online completa", 1500, "perdido", { closed_at: d(-25), created_at: stamp(-50), notes: "Muy caro por ahora. Volver a intentar en unos meses." });
  deal(diego, "App de citas", 2800, "perdido", { closed_at: d(-80), created_at: stamp(-100) });

  // Seguimientos
  task(sofia, "Preguntar si revisó la propuesta", "whatsapp", -2, { deal_id: d6.id });
  task(pablo, "Llamar para cerrar el descuento", "llamada", 0, { deal_id: d5.id });
  task(marta, "Enviar ejemplos de webs de yoga", "correo", 0, { deal_id: d4.id });
  task(diego, "Primera llamada para entender el servicio", "llamada", 1, { deal_id: d1.id });
  task(camila, "Reunión con el equipo de la clínica", "reunion", 3, { deal_id: d7.id });
  task(jorge, "Mandar precio del catálogo", "whatsapp", 4, { deal_id: d3.id });
  task(ana, "Pedir reseña y recomendación", "whatsapp", 6, { deal_id: w1.id });
  task(luis, "Ofrecer mantenimiento mensual", "correo", 12);
  task(ana, "Entregar menú QR", "otro", -4, { deal_id: w1.id, done: true });
  task(pablo, "Enviar propuesta del portal", "correo", -6, { deal_id: d5.id, done: true });

  // Historial
  note(pablo, "Le encantó la propuesta. Quiere 10% de descuento por pago adelantado.", -1, d5.id);
  note(pablo, "Reunión en su oficina: necesita filtros por ciudad y precio.", -9, d5.id);
  note(marta, "Le mandé la propuesta por correo con 2 opciones.", -3, d4.id);
  note(ana, "Entregado el menú QR. Muy contenta, ya lo están usando.", -4, w1.id);
  note(sofia, "Dijo que lo hablaría con su socia esta semana.", -5, d6.id);
  note(camila, "Me pasó el contacto Luis. Quiere algo más moderno.", -15, d7.id);
  note(jorge, "Le pareció cara la tienda completa. Probamos con algo más simple.", -10, d3.id);

  return { contacts, deals, tasks, notes };
}

export const emptyContact = (): Contact => ({
  id: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "",
  tags: [],
  notes: "",
  color: CONTACT_COLORS[Math.floor(Math.random() * CONTACT_COLORS.length)],
  created_at: "",
});
