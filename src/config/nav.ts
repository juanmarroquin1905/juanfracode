// Menú principal de la web: todo gira en torno a editar videos con Claude.
export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#plantillas", label: "Plantillas" },
  { href: "/recursos", label: "Recursos gratis" },
  { href: "/guiones", label: "VidScript" },
] as const;

// Otras secciones de Juanfra Code. Ya no van en el menú, pero siguen abiertas (enlaces en el pie de página).
export const MORE_LINKS = [
  { href: "/micro-apps", label: "Micro apps" },
  { href: "/crear", label: "Creador de micro apps" },
  { href: "/webs", label: "Webs" },
  { href: "/skills", label: "Skills" },
] as const;

// Qué sección del menú se marca en cada ruta (las rutas viejas siguen funcionando).
export function activeNav(path: string) {
  if (path === "/") return "/";
  if (path.startsWith("/recursos")) return "/recursos";
  if (path.startsWith("/guiones")) return "/guiones";
  return "";
}
