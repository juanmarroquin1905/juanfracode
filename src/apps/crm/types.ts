// El CRM guarda una sola cosa: tus clientes. Cada cliente tiene en qué etapa va,
// cuánto vale y cuál es el próximo paso. Las fechas son textos "AAAA-MM-DD".

export type Stage = "nuevo" | "hablando" | "propuesta" | "cliente" | "perdido";

export type Client = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  /** Qué te quiere comprar: "Página web", "Logo"… */
  service: string;
  value: number;
  stage: Stage;
  /** Lo próximo que tienes que hacer con esta persona y para cuándo. */
  next_step: string;
  next_date: string | null;
  notes: string;
  color: string;
  created_at: string;
};
