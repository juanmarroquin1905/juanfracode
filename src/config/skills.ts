// Skills para Claude que se muestran en /skills.
// El archivo de cada una vive en skills/<slug>/ (copia sin cambios de su repositorio original).
// Aquí solo va el texto en español que se ve en la web.

export type SkillSource = { repo: string; url: string };

export const SKILL_SOURCES = {
  composio: { repo: "ComposioHQ/awesome-claude-skills", url: "https://github.com/ComposioHQ/awesome-claude-skills" },
  anthropic: { repo: "anthropics/skills", url: "https://github.com/anthropics/skills" },
} satisfies Record<string, SkillSource>;

export type Skill = {
  slug: string; // nombre de la carpeta en skills/
  emoji: string;
  title: string;
  text: string; // qué hace, en una o dos frases
  example: string; // qué escribirle a Claude para usarla
  where: "todas" | "code"; // "code" = necesita ver tus archivos (Claude Code o Cowork)
  source: keyof typeof SKILL_SOURCES;
};

export const SKILLS: Skill[] = [
  {
    slug: "file-organizer",
    emoji: "🗂️",
    title: "Ordena tus archivos",
    text: "Revisa una carpeta desordenada (como Descargas), encuentra duplicados y te propone dónde va cada cosa. Pregunta antes de borrar.",
    example: "Ordena mi carpeta de Descargas",
    where: "code",
    source: "composio",
  },
  {
    slug: "invoice-organizer",
    emoji: "🧾",
    title: "Ordena tus facturas",
    text: "Lee tus facturas y boletas, les pone un nombre claro (fecha, empresa, monto) y las separa en carpetas para tus impuestos.",
    example: "Organiza las facturas de esta carpeta por mes",
    where: "code",
    source: "composio",
  },
  {
    slug: "tailored-resume-generator",
    emoji: "📄",
    title: "CV para cada trabajo",
    text: "Pegas la oferta de trabajo y tu experiencia, y te arma un CV que resalta justo lo que esa empresa busca.",
    example: "Adapta mi CV a esta oferta de trabajo",
    where: "todas",
    source: "composio",
  },
  {
    slug: "raffle-winner-picker",
    emoji: "🎁",
    title: "Elige ganadores de sorteos",
    text: "Le das la lista de participantes (o los comentarios) y elige ganadores al azar de forma justa y transparente.",
    example: "Elige 3 ganadores de esta lista",
    where: "todas",
    source: "composio",
  },
  {
    slug: "meeting-insights-analyzer",
    emoji: "🎙️",
    title: "Aprende de tus reuniones",
    text: "Lee la transcripción de una reunión o llamada y te dice cómo hablaste: si interrumpes, si usas muletillas o si evitas temas.",
    example: "Analiza esta transcripción y dime cómo puedo comunicarme mejor",
    where: "todas",
    source: "composio",
  },
  {
    slug: "content-research-writer",
    emoji: "✍️",
    title: "Escribe con investigación",
    text: "Te acompaña a escribir un post, artículo o guion: investiga el tema, mejora el gancho y te da ideas sección por sección.",
    example: "Ayúdame a escribir un post sobre cómo ahorrar en el súper",
    where: "todas",
    source: "composio",
  },
  {
    slug: "domain-name-brainstormer",
    emoji: "🌐",
    title: "Ideas de nombre y dominio",
    text: "Te da nombres creativos para tu proyecto o negocio y revisa si el dominio (.com, .io, .ai…) parece libre.",
    example: "Dame nombres para una app de recetas",
    where: "todas",
    source: "composio",
  },
  {
    slug: "skill-creator",
    emoji: "🧩",
    title: "Crea tus propias skills",
    text: "La skill oficial de Anthropic para crear skills nuevas: le cuentas qué tarea repites y te arma la skill paso a paso.",
    example: "Quiero crear una skill para responder correos de clientes",
    where: "todas",
    source: "anthropic",
  },
];
