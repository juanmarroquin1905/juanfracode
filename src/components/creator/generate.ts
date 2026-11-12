import { STYLES, TYPE_FILES, plural, slugify, type AppConfig, type StyleId, type TypeId } from "./options";

// Archivos de public/crear que se combinan para armar cada micro app.
export type Assets = {
  base: string;
  css: string;
  types: Record<TypeId, string>;
  styles: Record<StyleId, string>;
};

export async function loadAssets(): Promise<Assets> {
  const get = (p: string) => fetch(`/crear/${p}`).then((r) => r.text());
  const [base, css, ...rest] = await Promise.all([
    get("base.js"),
    get("base.css"),
    ...TYPE_FILES.map((t) => get(`tipos/${t}.js`)),
    ...STYLES.map((s) => get(`estilos/${s.id}.css`)),
  ]);
  const types = Object.fromEntries(TYPE_FILES.map((t, i) => [t, rest[i]])) as Record<TypeId, string>;
  const styles = Object.fromEntries(STYLES.map((s, i) => [s.id, rest[TYPE_FILES.length + i]])) as Record<StyleId, string>;
  return { base, css, types, styles };
}

function runtimeConfig(cfg: AppConfig) {
  const pay = cfg.pay.url.trim() ? { url: cfg.pay.url.trim(), label: cfg.pay.label.trim() || "Comprar", text: cfg.pay.text.trim() } : null;
  return {
    slug: slugify(cfg.name),
    name: cfg.name.trim() || "Mi app",
    emoji: cfg.emoji,
    description: cfg.description.trim(),
    color: cfg.color,
    features: cfg.features,
    categories: cfg.categories.map((c) => c.trim()).filter(Boolean),
    currency: cfg.currency,
    view: cfg.view,
    ...(cfg.type === "coleccion"
      ? {
          itemName: cfg.itemName,
          itemPlural: plural(cfg.itemName),
          sortByDate: cfg.sortByDate,
          fields: cfg.fields
            .filter((f) => f.on && f.label.trim())
            .map((f) => ({ key: f.key, label: f.label.trim(), type: f.type, ...(f.type === "options" ? { options: (f.options ?? []).filter(Boolean) } : {}) })),
          samples: cfg.samples,
        }
      : {}),
    pay,
    credit: cfg.credit,
  };
}

// Escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
const safeJson = (v: unknown) => JSON.stringify(v, null, 2).replace(/</g, "\\u003c");
const escHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function head(cfg: AppConfig) {
  const style = STYLES.find((s) => s.id === cfg.style)!;
  const icon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${cfg.emoji}</text></svg>`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(cfg.name.trim() || "Mi app")}</title>
<meta name="description" content="${escHtml(cfg.description)}">
<link rel="icon" href="${escHtml(icon)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${style.fonts}&display=swap">`;
}

const accent = (cfg: AppConfig) => `:root { --accent: ${cfg.color}; }`;

// Los archivos que van dentro del .zip.
export function buildFiles(cfg: AppConfig, a: Assets): Record<string, string> {
  const rc = runtimeConfig(cfg);
  const dir = rc.slug;
  return {
    [`${dir}/index.html`]: `<!doctype html>
<html lang="es">
<head>
${head(cfg)}
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div id="app"></div>
<script src="config.js"></script>
<script src="app.js"></script>
</body>
</html>
`,
    [`${dir}/config.js`]: `/* Configuración de tu micro app. Puedes cambiar nombre, textos, categorías o tu link de pago aquí. */
window.APP_CONFIG = ${safeJson(rc)};
`,
    [`${dir}/styles.css`]: `${accent(cfg)}\n\n${a.css}\n${a.styles[cfg.style]}`,
    [`${dir}/app.js`]: `${a.base}\n${a.types[cfg.type]}`,
    [`${dir}/LEEME.md`]: readme(cfg, rc.slug),
  };
}

// Versión en un solo HTML para la vista previa (iframe).
export function buildPreview(cfg: AppConfig, a: Assets) {
  const rc = runtimeConfig(cfg);
  const js = `window.APP_CONFIG = ${safeJson(rc)};\n${a.base}\n${a.types[cfg.type]}`.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html lang="es"><head>${head(cfg)}<style>${accent(cfg)}\n${a.css}\n${a.styles[cfg.style]}</style></head><body><div id="app"></div><script>${js}</script></body></html>`;
}

function readme(cfg: AppConfig, slug: string) {
  const name = cfg.name.trim() || "Mi app";
  return `# ${cfg.emoji} ${name}

Tu micro app web, creada con el creador gratis de **Juanfra Code** (https://juanfracode.vercel.app/crear).

No necesita base de datos ni instalar nada: es HTML, CSS y JavaScript. Los datos se guardan en el navegador de cada persona que la usa.

## Pruébala en tu computadora

Haz doble clic en \`index.html\`. Se abre en tu navegador y ya funciona.

## Publícala gratis en internet

### Opción 1: Netlify (la más fácil, 1 minuto)

1. Entra a https://app.netlify.com/drop (crea tu cuenta gratis si te la pide).
2. Arrastra **esta carpeta** (\`${slug}\`) a la página.
3. Listo: Netlify te da un enlace para compartir. En "Site configuration" puedes cambiarle el nombre.

### Opción 2: Vercel (con GitHub)

1. En https://github.com/new crea un repositorio nuevo (por ejemplo \`${slug}\`).
2. Pulsa "uploading an existing file", arrastra los archivos de esta carpeta y pulsa "Commit changes".
3. En https://vercel.com/new importa ese repositorio y pulsa **Deploy** (no hay que configurar nada).
4. Cada vez que cambies un archivo en GitHub, Vercel publica la nueva versión sola.

## Cambia lo que quieras

- **config.js**: nombre, descripción, categorías, moneda, link de pago y funciones activas.
- **styles.css**: colores, letras y esquinas. El color principal está en la primera línea (\`--accent\`).
- **app.js**: cómo funciona la app.

## Cobra por tu app

En \`config.js\`, dentro de \`pay\`, pega tu link de pago (Lemon Squeezy, Mercado Pago, PayPal, Stripe o Gumroad).
La app muestra un botón que lleva a ese link y el dinero llega directo a tu cuenta.

## Aprende más

Tutoriales para crear y vender micro apps web: TikTok, Instagram y YouTube como **@juanfracode**.
`;
}
