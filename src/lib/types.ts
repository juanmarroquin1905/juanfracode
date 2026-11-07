export type SaasStatus = "en_vivo" | "en_construccion" | "pausado";

export type Saas = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: SaasStatus;
  emoji: string;
  color: string; // color de la tarjeta, ej: #7c3aed
  cover_url: string | null;
  demo_url: string | null;
  repo_url: string | null; // plantilla en GitHub
  zip_url: string | null; // descarga directa (.zip)
  video_url: string | null; // video donde lo explicas (TikTok / YouTube)
  stack: string[];
  env_vars: string[]; // variables que pide el botón "Deploy en Vercel"
  features: string[];
  published: boolean;
  sort_order: number;
  views: number;
  downloads: number;
  created_at: string;
};

export const STATUS_LABEL: Record<SaasStatus, string> = {
  en_vivo: "En vivo",
  en_construccion: "En construcción",
  pausado: "Pausado",
};
