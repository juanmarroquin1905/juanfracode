import type { Client, Stage } from "./types";
import { addDays, COLORS, today, uid } from "./utils";

// Clientes de ejemplo de la demo: una persona freelance que hace páginas web y
// redes sociales. Las fechas se calculan desde hoy para que siempre se vea "al día".

export function sampleClients(): Client[] {
  const t = today();
  const list: Client[] = [];
  const add = (name: string, company: string, service: string, value: number, stage: Stage, next: [string, number] | null, extra: Partial<Client> = {}) =>
    list.push({
      id: uid(),
      name,
      company,
      phone: "",
      email: "",
      service,
      value,
      stage,
      next_step: next?.[0] ?? "",
      next_date: next ? addDays(t, next[1]) : null,
      notes: "",
      color: COLORS[list.length % COLORS.length],
      created_at: `${addDays(t, -40 + list.length * 3)}T10:00:00.000Z`,
      ...extra,
    });

  add("Diego Ramírez", "TecnoFix", "Landing para nuevo servicio", 450, "nuevo", ["Llamarlo para entender qué necesita", 1], { phone: "+51 987 654 321" });
  add("Valentina Ruiz", "", "Web para vender su curso", 900, "nuevo", ["Mandarle ejemplos de webs de cursos", 3], {
    phone: "+54 9 11 4444 5555",
    notes: "Coach de vida. La conocí por Instagram.",
  });
  add("Jorge Paz", "Ferretería El Tornillo", "Catálogo online con WhatsApp", 600, "hablando", ["Mandarle el precio del catálogo", 0], { phone: "+502 5555 1234" });
  add("Camila Ortiz", "Clínica Sonríe", "Rediseño de la web + blog", 2400, "hablando", ["Reunión con su equipo", 4], {
    email: "camila@sonrie.com",
    notes: "Llegó recomendada por Luis. Quiere algo más moderno.",
  });
  add("Sofía Castro", "Dulce Hogar Pastelería", "Manejo de Instagram (3 meses)", 750, "propuesta", ["Preguntar si revisó la propuesta", -2], {
    phone: "+52 33 2222 1100",
    notes: "Lo iba a hablar con su socia.",
  });
  add("Pablo Méndez", "Inmobiliaria Altos", "Portal de propiedades", 3800, "propuesta", ["Llamar para cerrar el descuento", 0], {
    phone: "+56 9 8765 4321",
    notes: "Pide 10% de descuento si paga todo por adelantado.",
  });
  add("Ana Torres", "Café Origen", "Menú digital con QR", 350, "cliente", ["Pedirle una reseña", 6], {
    phone: "+52 55 1234 5678",
    notes: "Prefiere WhatsApp por la tarde. Ya le hice el logo antes.",
  });
  add("Luis Herrera", "Estudio Norte", "Web del estudio", 1800, "cliente", null, { email: "luis@estudionorte.co" });
  add("Marta Gómez", "Yoga Prana", "Web con reservas de clases", 1200, "perdido", null, { notes: "Eligió una plantilla barata. Volver a escribirle en unos meses." });
  return list;
}

export const emptyClient = (): Client => ({
  id: "",
  name: "",
  company: "",
  phone: "",
  email: "",
  service: "",
  value: 0,
  stage: "nuevo",
  next_step: "",
  next_date: null,
  notes: "",
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  created_at: "",
});
