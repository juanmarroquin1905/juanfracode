// Tipos y opciones de la VidScript. Sin "server-only": también los usa el navegador.

export type GanchoEstilo = "mix" | "resultado" | "error" | "pregunta" | "historia" | "mito";
export type CtaEstilo = "pregunta" | "palabra" | "seguir" | "guardar" | "bio" | "ninguno";
export type Duracion = "30-40" | "45-60" | "60-90";
export type Tono = "cercano" | "energico" | "serio" | "divertido";
export type Audiencia = "" | "principiantes" | "estudiantes" | "emprendedores" | "usuarios-ia";
export type Objetivo = "" | "comentar" | "guardar" | "seguir" | "link";
export type Grabacion = "" | "camara" | "camara-pantalla" | "pantalla";

export type Opciones = {
  gancho: GanchoEstilo;
  cta: CtaEstilo;
  duracion: Duracion;
  tono: Tono;
  /** Preguntas rápidas antes de generar (todas opcionales). */
  audiencia: Audiencia;
  objetivo: Objetivo;
  grabacion: Grabacion;
  /** Idea del video que se quiere usar; vacío = la que decida Claude. */
  idea: string;
  /** Lo que NO debe decir o hacer. */
  evitar: string;
  /** Ángulo extra que pide Juan (opcional). */
  angulo: string;
  /** Quién es el creador y para quién habla (opcional, se recuerda entre videos). */
  perfil: string;
};

export const OPCIONES_POR_DEFECTO: Opciones = {
  gancho: "mix",
  cta: "pregunta",
  duracion: "45-60",
  tono: "cercano",
  audiencia: "",
  objetivo: "",
  grabacion: "",
  idea: "",
  evitar: "",
  angulo: "",
  perfil: "",
};

export const GANCHOS: { id: GanchoEstilo; label: string; ayuda: string }[] = [
  { id: "mix", label: "Los 3 estilos", ayuda: "Un gancho de cada tipo para probar cuál retiene más" },
  { id: "resultado", label: "Resultado o número", ayuda: "Abre con la cifra o el resultado más fuerte" },
  { id: "error", label: "Error común", ayuda: "Lo que la gente hace mal o se está perdiendo" },
  { id: "pregunta", label: "Pregunta", ayuda: "Una pregunta que obliga a quedarse a ver la respuesta" },
  { id: "historia", label: "Caso real", ayuda: "Arranca con el caso o ejemplo concreto del video" },
  { id: "mito", label: "Mito vs realidad", ayuda: "Rompe una creencia común" },
];

export const CTAS: { id: CtaEstilo; label: string }[] = [
  { id: "pregunta", label: "Pregunta para comentar" },
  { id: "palabra", label: "Comenta una palabra" },
  { id: "seguir", label: "Sígueme (parte 2)" },
  { id: "guardar", label: "Guarda este video" },
  { id: "bio", label: "Link en mi perfil" },
  { id: "ninguno", label: "Sin llamado" },
];

export const DURACIONES: { id: Duracion; label: string; segundos: number }[] = [
  { id: "30-40", label: "30 a 40 s", segundos: 40 },
  { id: "45-60", label: "45 a 60 s", segundos: 60 },
  { id: "60-90", label: "60 a 90 s", segundos: 85 },
];

export const TONOS: { id: Tono; label: string }[] = [
  { id: "cercano", label: "Cercano" },
  { id: "energico", label: "Enérgico" },
  { id: "serio", label: "Serio" },
  { id: "divertido", label: "Divertido" },
];

export const AUDIENCIAS: { id: Audiencia; label: string }[] = [
  { id: "", label: "Cualquiera" },
  { id: "principiantes", label: "Principiantes sin experiencia" },
  { id: "estudiantes", label: "Estudiantes" },
  { id: "emprendedores", label: "Emprendedores y negocios" },
  { id: "usuarios-ia", label: "Gente que ya usa IA" },
];

export const OBJETIVOS: { id: Objetivo; label: string }[] = [
  { id: "", label: "El que mejor encaje" },
  { id: "comentar", label: "Que comenten" },
  { id: "guardar", label: "Que guarden el video" },
  { id: "seguir", label: "Que me sigan" },
  { id: "link", label: "Que entren al link" },
];

export const GRABACIONES: { id: Grabacion; label: string }[] = [
  { id: "", label: "Como convenga" },
  { id: "camara", label: "Solo a cámara" },
  { id: "camara-pantalla", label: "Cámara y pantalla" },
  { id: "pantalla", label: "Solo pantalla (voz en off)" },
];

export type Mensaje = { role: "user" | "assistant"; content: string };

export type Video = {
  id: string;
  url: string;
  video_id: string | null;
  title: string;
  channel: string;
  transcript: string;
  opciones: Opciones;
  mensajes: Mensaje[];
  created_at: string;
  updated_at: string;
};

/** Mezcla lo guardado con los valores por defecto (por si faltan campos). */
export function normalizarOpciones(o: Partial<Opciones> | null | undefined): Opciones {
  return { ...OPCIONES_POR_DEFECTO, ...(o ?? {}) };
}

export function segundosObjetivo(d: Duracion): number {
  return DURACIONES.find((x) => x.id === d)?.segundos ?? 60;
}

/** Devuelve solo lo que Juan dice en voz alta: el gancho A y el resto del guion. */
export function textoHablado(md: string, letra: "A" | "B" | "C" = "A"): string {
  const out: string[] = [];
  let enGanchos = false;
  let gancho = "";
  for (const linea of md.split("\n")) {
    const h2 = linea.match(/^##\s+(.*)/);
    if (h2) {
      enGanchos = /gancho/i.test(h2[1]);
      gancho = "";
      continue;
    }
    const h3 = linea.match(/^###\s+(.*)/);
    if (enGanchos && h3) {
      gancho = h3[1].trim();
      continue;
    }
    if (!/^>\s?/.test(linea)) continue;
    if (enGanchos && !new RegExp(`gancho ${letra}\\b`, "i").test(gancho)) continue;
    out.push(linea.replace(/^>\s?/, ""));
  }
  return out.join("\n\n");
}

export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter(Boolean).length;
}

/** Segundos que dura hablado (unas 2,6 palabras por segundo). */
export function segundosHablados(md: string): number {
  return Math.round(contarPalabras(textoHablado(md)) / 2.6);
}
