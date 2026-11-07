// Todo lo de tu marca en UN solo lugar. Cambia aquí nombre, textos y redes.
// Si dejas una red vacía (""), no se muestra.
export const BRAND = {
  name: "Juanfra Code",
  title: "Apps simples para tu día a día",
  titleHighlight: "tu día a día", // parte del título que va con degradado
  tagline:
    "Pequeños SaaS de uso personal que creo con Next.js, Supabase, Vercel y Claude Code. Pruébalos, descarga la plantilla gratis y lanza tu propia versión en minutos.",
  // Tutorial general de cómo lanzar una plantilla (enlace de YouTube).
  // Si lo dejas vacío (""), no se muestra. Ej: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
  tutorialUrl: "",
  // Visitas y descargas de cada app solo se muestran desde este número (para que no se vea vacío).
  minStatToShow: 10,
  // Sección "Quién soy" del inicio.
  about:
    "Enseño a crear tus propios SaaS desde cero con Next.js, Supabase, Vercel y Claude Code, aunque nunca hayas programado. Cada app de esta página la construyo en mis videos y te dejo el código para que la uses.",
  socials: {
    tiktok: "https://www.tiktok.com/@juanfracode",
    instagram: "https://www.instagram.com/juanfracode",
    youtube: "https://www.youtube.com/@juanfracode",
  },
} as const;
