import { RECIPES, cloneFields, type Field, type Recipe } from "./recipes";

// Opciones del creador de micro apps (/crear). Para sumar un tipo o un estilo nuevo:
// 1) agrega su archivo en public/crear/tipos o public/crear/estilos, 2) agrégalo aquí.

// Archivos de public/crear/tipos. "coleccion" arma la app con los campos que elige la persona.
export const TYPE_FILES = ["tareas", "habitos", "gastos", "notas", "coleccion"] as const;

export const STYLES = [
  { id: "suave", title: "Suave", text: "Pastel y amigable", preview: { bg: "#f6f4fb", card: "#ffffff", ink: "#2b2540", radius: 14 }, fonts: "family=Nunito:wght@400;600;700;800" },
  { id: "notion", title: "Notion", text: "Limpio y ordenado", preview: { bg: "#ffffff", card: "#ffffff", ink: "#37352f", radius: 4 }, fonts: "family=Inter:wght@400;500;600;700" },
  { id: "ios", title: "iPhone", text: "Como una app nativa", preview: { bg: "#f2f2f7", card: "#ffffff", ink: "#000000", radius: 10 }, fonts: "family=Inter:wght@400;600;700;800" },
  { id: "panel", title: "Panel", text: "Dashboard oscuro", preview: { bg: "#0b1120", card: "#111a2e", ink: "#e2e8f0", radius: 8 }, fonts: "family=Manrope:wght@400;600;700;800" },
  { id: "cristal", title: "Cristal", text: "Vidrio y degradados", preview: { bg: "#e4e3ff", card: "#ffffffaa", ink: "#1e1b3a", radius: 14 }, fonts: "family=Plus+Jakarta+Sans:wght@400;600;700;800" },
  { id: "minimal", title: "Minimal", text: "Blanco y negro", preview: { bg: "#ffffff", card: "#ffffff", ink: "#111111", radius: 3 }, fonts: "family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700" },
  { id: "neon", title: "Neón", text: "Oscuro con brillo", preview: { bg: "#07070d", card: "#11111b", ink: "#f4f4ff", radius: 10 }, fonts: "family=Outfit:wght@400;600;700" },
  { id: "papel", title: "Papel", text: "Tipo libreta", preview: { bg: "#f5efe2", card: "#fffdf7", ink: "#2d2418", radius: 6 }, fonts: "family=Lora:ital,wght@0,400;0,700;1,700" },
] as const;

export const COLORS = [
  { id: "#2563eb", name: "Azul" },
  { id: "#7c3aed", name: "Violeta" },
  { id: "#db2777", name: "Rosa" },
  { id: "#16a34a", name: "Verde" },
  { id: "#ea580c", name: "Naranja" },
  { id: "#0891b2", name: "Turquesa" },
  { id: "#d97706", name: "Ámbar" },
  { id: "#111827", name: "Grafito" },
] as const;

export const VIEWS = [
  { id: "lista", title: "Lista", emoji: "☰" },
  { id: "tarjetas", title: "Tarjetas", emoji: "▦" },
  { id: "tabla", title: "Tabla", emoji: "▤" },
  { id: "tablero", title: "Tablero", emoji: "▥" },
  { id: "calendario", title: "Calendario", emoji: "📅" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

// Vistas posibles según los datos (igual que en public/crear/tipos/coleccion.js)
export function availableViews(cfg: { type: string; fields: Field[] }): ViewId[] {
  if (cfg.type === "notas") return ["tarjetas", "lista"];
  if (cfg.type !== "coleccion") return [];
  const on = cfg.fields.filter((f) => f.on).slice(1);
  const v: ViewId[] = ["lista", "tarjetas", "tabla"];
  if (on.some((f) => f.type === "options" || f.type === "check")) v.push("tablero");
  if (on.some((f) => f.type === "date")) v.push("calendario");
  return v;
}

export const FEATURES = [
  { id: "buscar", title: "Buscador", text: "Una barra para encontrar cualquier cosa." },
  { id: "categorias", title: "Categorías", text: "Agrupa y filtra por etiquetas." },
  { id: "oscuro", title: "Modo oscuro", text: "Un botón para cambiar a tema oscuro." },
  { id: "exportar", title: "Exportar a Excel", text: "Descarga los datos en un archivo .csv." },
] as const;

export const EMOJIS = ["✅", "🔥", "💸", "📝", "🎯", "📚", "💪", "🍎", "🏠", "✈️", "🎵", "💡", "🌱", "⭐", "🧠", "☕"];

export const CURRENCIES = ["S/", "$", "€", "MX$", "COP", "ARS", "Bs"];

export type TypeId = (typeof TYPE_FILES)[number];
export type StyleId = (typeof STYLES)[number]["id"];
export type FeatureId = (typeof FEATURES)[number]["id"];

export type AppConfig = {
  idea: string;
  recipe: string;
  type: TypeId;
  name: string;
  emoji: string;
  description: string;
  itemName: string;
  fields: Field[];
  samples: Recipe["samples"];
  sortByDate: boolean;
  view: ViewId;
  style: StyleId;
  color: string;
  features: FeatureId[];
  categories: string[];
  currency: string;
  pay: { url: string; label: string; text: string };
  credit: boolean;
};

// Aplica una receta sin perder lo que la persona ya eligió de diseño, funciones y cobro.
export function applyRecipe(cfg: AppConfig, r: Recipe, name?: string): AppConfig {
  return {
    ...cfg,
    recipe: r.id,
    type: r.type,
    name: name || r.name,
    emoji: r.emoji,
    description: r.description,
    itemName: r.itemName ?? "elemento",
    fields: cloneFields(r.fields),
    samples: r.samples,
    sortByDate: !!r.sortByDate,
    view: r.view ?? (r.type === "notas" ? "tarjetas" : "lista"),
    categories: [...r.categories],
    features: r.categories.length
      ? cfg.features
      : cfg.features.filter((x) => x !== "categorias"),
  };
}

export function defaultConfig(): AppConfig {
  const base: AppConfig = {
    idea: "",
    recipe: "",
    type: "tareas",
    name: "",
    emoji: "",
    description: "",
    itemName: "",
    fields: [],
    samples: [],
    sortByDate: false,
    view: "lista",
    style: "suave",
    color: COLORS[0].id,
    features: ["buscar"],
    categories: [],
    currency: "S/",
    pay: { url: "", label: "Comprar", text: "" },
    credit: true,
  };
  return applyRecipe(base, RECIPES.find((r) => r.id === "citas")!);
}

export function plural(word: string) {
  if (!word) return "elementos";
  if (/[aeiouáéíóú]$/i.test(word)) return word + "s";
  if (/z$/i.test(word)) return word.slice(0, -1) + "ces";
  if (/s$/i.test(word)) return word;
  return word + "es";
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
