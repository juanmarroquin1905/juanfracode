// Opciones del creador de micro apps (/crear). Para sumar un tipo o un estilo nuevo:
// 1) agrega su archivo en public/crear/tipos o public/crear/estilos, 2) agrégalo aquí.

export const TYPES = [
  {
    id: "tareas",
    emoji: "✅",
    title: "Lista de tareas",
    text: "Anota pendientes y márcalos cuando los termines.",
    name: "Mis pendientes",
    description: "Todo lo que tengo que hacer, en un solo lugar.",
    categories: ["Casa", "Trabajo", "Personal"],
  },
  {
    id: "habitos",
    emoji: "🔥",
    title: "Hábitos",
    text: "Marca cada día lo que cumples y mira tu racha.",
    name: "Mis hábitos",
    description: "Pequeños pasos todos los días.",
    categories: ["Salud", "Mente", "Rutina"],
  },
  {
    id: "gastos",
    emoji: "💸",
    title: "Gastos",
    text: "Registra en qué gastas y cuánto llevas en el mes.",
    name: "Mis gastos",
    description: "Sé en qué se va mi dinero.",
    categories: ["Comida", "Transporte", "Ocio", "Casa"],
  },
  {
    id: "notas",
    emoji: "📝",
    title: "Notas",
    text: "Guarda ideas rápidas y fija las importantes.",
    name: "Mis notas",
    description: "Ideas y apuntes rápidos.",
    categories: ["Ideas", "Personal", "Trabajo"],
  },
] as const;

export const STYLES = [
  {
    id: "suave",
    title: "Suave",
    text: "Pastel, redondito y amigable",
    preview: { bg: "#f6f4fb", card: "#ffffff", ink: "#2b2540", radius: 14 },
    fonts: "family=Nunito:wght@400;700;800",
  },
  {
    id: "minimal",
    title: "Minimal",
    text: "Blanco y negro, limpio",
    preview: { bg: "#ffffff", card: "#ffffff", ink: "#111111", radius: 3 },
    fonts: "family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700",
  },
  {
    id: "neon",
    title: "Neón",
    text: "Oscuro con brillo",
    preview: { bg: "#07070d", card: "#11111b", ink: "#f4f4ff", radius: 10 },
    fonts: "family=Outfit:wght@400;600;700",
  },
  {
    id: "papel",
    title: "Papel",
    text: "Crema y serifa, tipo libreta",
    preview: { bg: "#f5efe2", card: "#fffdf7", ink: "#2d2418", radius: 6 },
    fonts: "family=Lora:ital,wght@0,400;0,700;1,700",
  },
] as const;

export const COLORS = [
  { id: "#2563eb", name: "Azul" },
  { id: "#7c3aed", name: "Violeta" },
  { id: "#db2777", name: "Rosa" },
  { id: "#16a34a", name: "Verde" },
  { id: "#ea580c", name: "Naranja" },
  { id: "#0891b2", name: "Turquesa" },
] as const;

export const FEATURES = [
  { id: "buscar", title: "Buscador", text: "Una barra para encontrar cualquier cosa." },
  { id: "categorias", title: "Categorías", text: "Agrupa y filtra por etiquetas." },
  { id: "oscuro", title: "Modo oscuro", text: "Un botón para cambiar a tema oscuro." },
  { id: "exportar", title: "Exportar a Excel", text: "Descarga los datos en un archivo .csv." },
] as const;

export const EMOJIS = ["✅", "🔥", "💸", "📝", "🎯", "📚", "💪", "🍎", "🏠", "✈️", "🎵", "💡", "🌱", "⭐", "🧠", "☕"];

export const CURRENCIES = ["S/", "$", "€", "MX$", "COP", "ARS", "Bs"];

export type TypeId = (typeof TYPES)[number]["id"];
export type StyleId = (typeof STYLES)[number]["id"];
export type FeatureId = (typeof FEATURES)[number]["id"];

export type AppConfig = {
  type: TypeId;
  name: string;
  emoji: string;
  description: string;
  style: StyleId;
  color: string;
  features: FeatureId[];
  categories: string[];
  currency: string;
  pay: { url: string; label: string; text: string };
  credit: boolean;
};

export function defaultConfig(type: TypeId = "tareas"): AppConfig {
  const t = TYPES.find((x) => x.id === type)!;
  return {
    type,
    name: t.name,
    emoji: t.emoji,
    description: t.description,
    style: "suave",
    color: COLORS[0].id,
    features: ["buscar", "categorias"],
    categories: [...t.categories],
    currency: "S/",
    pay: { url: "", label: "Comprar", text: "" },
    credit: true,
  };
}

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "mi-app"
  );
}
