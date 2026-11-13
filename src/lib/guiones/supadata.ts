import "server-only";

// Saca la transcripción de un video con Supadata (https://supadata.ai).
// Funciona con YouTube, TikTok, Instagram, X y Facebook. Si el video no tiene subtítulos,
// Supadata puede transcribir el audio con IA (cuesta 2 créditos por minuto de video).

const BASE = "https://api.supadata.ai/v1";

export type Transcripcion = { texto: string; idioma: string };

export class SupadataError extends Error {
  constructor(
    message: string,
    public codigo: "sin-clave" | "no-disponible" | "limite" | "clave-invalida" | "no-encontrado" | "otro",
  ) {
    super(message);
  }
}

type Respuesta = { content?: string | { text: string }[]; lang?: string; jobId?: string; status?: string; error?: unknown };

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function aTexto(content: Respuesta["content"]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => c.text).join(" ");
  return "";
}

function limpiar(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

async function pedir(path: string, key: string): Promise<{ status: number; body: Respuesta }> {
  const res = await fetch(`${BASE}${path}`, { headers: { "x-api-key": key }, cache: "no-store" });
  let body: Respuesta = {};
  try {
    body = (await res.json()) as Respuesta;
  } catch {}
  return { status: res.status, body };
}

function errorHttp(status: number): SupadataError {
  if (status === 401 || status === 403)
    return new SupadataError("Supadata no aceptó la clave o el video está restringido.", status === 401 ? "clave-invalida" : "no-disponible");
  if (status === 404) return new SupadataError("No encontré ese video (¿es privado o el link está mal?).", "no-encontrado");
  if (status === 429) return new SupadataError("Se acabaron los créditos de Supadata de este mes.", "limite");
  return new SupadataError("Supadata no pudo sacar la transcripción. Prueba otra vez o pégala a mano.", "otro");
}

export async function obtenerTranscripcion(url: string, idioma = "es"): Promise<Transcripcion> {
  const key = process.env.SUPADATA_API_KEY;
  if (!key) throw new SupadataError("Falta la clave SUPADATA_API_KEY en Vercel. Mientras tanto, pega la transcripción a mano.", "sin-clave");

  const q = new URLSearchParams({ url, text: "true", lang: idioma, mode: "auto" });
  const primera = await pedir(`/transcript?${q}`, key);

  if (primera.status === 200) {
    const texto = limpiar(aTexto(primera.body.content));
    if (!texto) throw new SupadataError("El video no tiene voz que transcribir.", "no-disponible");
    return { texto, idioma: primera.body.lang ?? idioma };
  }
  if (primera.status === 206) throw new SupadataError("Ese video no tiene transcripción disponible.", "no-disponible");

  if (primera.status === 202 && primera.body.jobId) {
    // Video largo o sin subtítulos: Supadata lo procesa aparte. Esperamos hasta ~50 s.
    for (let i = 0; i < 50; i++) {
      await dormir(1000);
      const job = await pedir(`/transcript/${primera.body.jobId}`, key);
      if (job.status !== 200) throw errorHttp(job.status);
      if (job.body.status === "completed") {
        const texto = limpiar(aTexto(job.body.content));
        if (!texto) throw new SupadataError("El video no tiene voz que transcribir.", "no-disponible");
        return { texto, idioma: job.body.lang ?? idioma };
      }
      if (job.body.status === "failed") throw new SupadataError("Supadata no pudo transcribir ese video.", "no-disponible");
    }
    throw new SupadataError("El video es muy largo y tardó demasiado. Prueba otra vez en un momento.", "otro");
  }

  throw errorHttp(primera.status);
}

/** Título y canal del video por oEmbed (YouTube, sin clave). Si falla, devuelve null. */
export async function datosYoutube(url: string): Promise<{ title: string; channel: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { title?: string; author_name?: string };
    return { title: j.title ?? "", channel: j.author_name ?? "" };
  } catch {
    return null;
  }
}
