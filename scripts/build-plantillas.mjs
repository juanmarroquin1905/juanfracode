// Arma los .zip descargables de cada app (public/descargas/<app>.zip).
// Cada zip = la carpeta plantillas/<app> (proyecto Next.js listo, con su SQL)
// + el código de la app que vive en src/apps/<app> (el mismo de la demo),
// que en el zip queda en src/<app>.
// Se ejecuta solo antes de cada build (npm run build).
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import zlib from "node:zlib";

const ROOT = new URL("..", import.meta.url).pathname;
const APPS = [
  { slug: "finanzas", folder: "mis-finanzas" },
  { slug: "gimnasio", folder: "mi-gimnasio" },
  { slug: "viajes", folder: "mis-viajes" },
  { slug: "crm", folder: "mi-crm" },
  { slug: "asistente", folder: "mi-asistente" },
];
const SKIP = new Set(["node_modules", ".next", ".env.local", ".vercel", "next-env.d.ts", "__pycache__"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 =
  zlib.crc32 ??
  ((buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  });

// Zip mínimo (deflate) sin dependencias.
function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  // Fecha fija para que el zip no cambie si el código no cambia.
  const time = 0, date = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // nombres en UTF-8
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, comp);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

mkdirSync(join(ROOT, "public/descargas"), { recursive: true });
for (const { slug, folder } of APPS) {
  const tpl = join(ROOT, "plantillas", slug);
  const shared = join(ROOT, "src/apps", slug);
  const entries = [
    ...walk(tpl).map((p) => ({ name: `${folder}/${relative(tpl, p)}`, data: readFileSync(p) })),
    ...walk(shared).map((p) => ({ name: `${folder}/src/${slug}/${relative(shared, p)}`, data: readFileSync(p) })),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const out = join(ROOT, "public/descargas", `${slug}.zip`);
  writeFileSync(out, zip(entries));
  console.log(`✓ ${relative(ROOT, out)} (${entries.length} archivos)`);
}

// Skills para Claude: cada carpeta de skills/<nombre> se vuelve
// public/descargas/skills/<nombre>.zip con la carpeta adentro (formato que pide Claude al subirla).
const SKILLS = join(ROOT, "skills");
mkdirSync(join(ROOT, "public/descargas/skills"), { recursive: true });
for (const name of readdirSync(SKILLS)) {
  const dir = join(SKILLS, name);
  if (!statSync(dir).isDirectory()) continue;
  const entries = walk(dir)
    .filter((p) => !p.endsWith(".pyc"))
    .map((p) => ({ name: `${name}/${relative(dir, p)}`, data: readFileSync(p) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const out = join(ROOT, "public/descargas/skills", `${name}.zip`);
  writeFileSync(out, zip(entries));
  console.log(`✓ ${relative(ROOT, out)} (${entries.length} archivos)`);
}
