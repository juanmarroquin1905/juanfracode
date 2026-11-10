// Las cuatro cosas que guarda el CRM: contactos, tratos, seguimientos y notas.
// Las fechas son textos "AAAA-MM-DD" para que no cambien con la zona horaria.

export type Stage = "nuevo" | "contactado" | "propuesta" | "negociacion" | "ganado" | "perdido";

export type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  /** De dónde llegó: referido, instagram, web… */
  source: string;
  tags: string[];
  notes: string;
  /** Color de su círculo con iniciales, para reconocerlo rápido. */
  color: string;
  created_at: string;
};

export type Deal = {
  id: string;
  contact_id: string;
  title: string;
  value: number;
  stage: Stage;
  /** Fecha en que esperas cerrarlo. */
  close_date: string | null;
  /** Cuándo pasó a ganado o perdido. */
  closed_at: string | null;
  notes: string;
  /** Orden dentro de su columna. */
  position: number;
  created_at: string;
};

export type TaskKind = "llamada" | "whatsapp" | "correo" | "reunion" | "otro";

/** Un seguimiento: algo que tienes que hacer con un cliente en una fecha. */
export type Task = {
  id: string;
  contact_id: string;
  deal_id: string | null;
  title: string;
  kind: TaskKind;
  due_date: string;
  done: boolean;
  created_at: string;
};

/** Una nota en el historial del contacto: qué hablaron, qué pasó. */
export type Note = {
  id: string;
  contact_id: string;
  deal_id: string | null;
  text: string;
  date: string;
  created_at: string;
};

export type CrmData = { contacts: Contact[]; deals: Deal[]; tasks: Task[]; notes: Note[] };
export type ListName = keyof CrmData;
export type Rows = { contacts: Contact; deals: Deal; tasks: Task; notes: Note };
