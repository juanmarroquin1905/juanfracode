// Todo lo de tu marca en UN solo lugar. Cambia aquí nombre, textos y redes.
// Si dejas una red vacía (""), no se muestra.
export const BRAND = {
  name: "Juanfra Code",
  title: "Edita tus videos con Claude",
  titleHighlight: "con Claude", // parte del título que va con degradado
  tagline:
    "Para creadores de contenido: edita tus videos con Claude en minutos, no en horas. Prompts gratis para Claude Code, ffmpeg y Remotion, y muy pronto el Studio para tu Claude.",
  // Nombre del Studio (lo que la gente instala en su Claude para editar con plantillas).
  // Cámbialo aquí y se actualiza en toda la web.
  studioName: "VidStudio",
  // Tutorial general de cómo lanzar una plantilla (enlace de YouTube).
  // Si lo dejas vacío (""), no se muestra. Ej: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
  tutorialUrl: "",
  // Visitas y descargas de cada app solo se muestran desde este número (para que no se vea vacío).
  minStatToShow: 10,
  // Sección "Quién soy" del inicio.
  about:
    "Soy creador de contenido y uso Claude para dejar de pasar horas editando. Te enseño mi flujo, desde el guion hasta el video listo, y te dejo las herramientas que uso en mis propios videos.",
  socials: {
    tiktok: "https://www.tiktok.com/@juanfracode",
    instagram: "https://www.instagram.com/juanfracode",
    youtube: "https://www.youtube.com/@juanfracode",
  },
} as const;
