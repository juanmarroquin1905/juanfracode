// Menú principal de la web. Los 3 pilares (micro apps, webs y videos) + skills.
export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/micro-apps", label: "Micro apps" },
  { href: "/webs", label: "Webs" },
  { href: "/videos", label: "Videos" },
  { href: "/skills", label: "Skills" },
] as const;

// Qué sección del menú se marca en cada ruta (las rutas viejas siguen funcionando).
export function activeNav(path: string) {
  if (path === "/") return "/";
  if (path.startsWith("/micro-apps") || path.startsWith("/crear") || path.startsWith("/apps") || path.startsWith("/saas"))
    return "/micro-apps";
  if (path.startsWith("/webs")) return "/webs";
  if (path.startsWith("/videos") || path.startsWith("/guiones")) return "/videos";
  if (path.startsWith("/skills")) return "/skills";
  return "";
}
