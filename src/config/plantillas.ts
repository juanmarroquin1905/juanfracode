// Plantillas de Juanfra Studio que se muestran en el inicio.
// Miniatura animada en public/plantillas-studio/<slug>.mp4 y su portada <slug>.jpg (9:16).
export type Plantilla = { slug: string; title: string; text: string; tags: string[] };

export const PLANTILLAS: Plantilla[] = [
  { slug: "reel-personal", title: "Reel personal", text: "Cortes rápidos, gancho en caja blanca, subtítulos de una palabra y notificaciones en pantalla.", tags: ["Pantalla completa"] },
  { slug: "motion-explicativo", title: "Motion explicativo", text: "Pantalla completa que pasa a moldura, con títulos y la palabra clave en naranja.", tags: ["Completa", "Moldura"] },
  { slug: "panel-explicador", title: "Panel explicador", text: "Tú abajo; arriba la idea se explica sola: título con palabra clave y diagramas.", tags: ["Dividida", "Diagramas"] },
  { slug: "panel-claro", title: "Panel claro", text: "Editorial en papel claro: lo que dices aparece escrito grande y tu cámara va en una tarjeta.", tags: ["Tarjeta", "Texto cinético"] },
  { slug: "texto-tiktok", title: "Texto TikTok", text: "Gancho de dos líneas en caja blanca, subtítulos chicos e imágenes que entran arriba.", tags: ["Pantalla completa"] },
  { slug: "top-5", title: "Top 5", text: "Un tablero del 1 al 5 que se llena cuando nombras cada cosa, en el orden que la dices.", tags: ["Lista"] },
  { slug: "muestra-la-prueba", title: "Muestra la prueba", text: "Tu app, tus resultados o tu pantalla arriba de tu cabeza mientras hablas.", tags: ["Pantalla completa", "Capturas"] },
  { slug: "gameplay", title: "Gameplay", text: "Tú arriba y un gameplay abajo para retener; los subtítulos en la unión.", tags: ["Dividida"] },
  { slug: "editado-en-vivo", title: "Editado en vivo", text: "Le pides cada efecto a Claude y aparece justo cuando lo dices: marco, textos y más.", tags: ["Moldura", "Bonus"] },
];
