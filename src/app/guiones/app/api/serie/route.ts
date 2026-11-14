import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser } from "@/lib/data";
import { guardarSerie, obtenerVideo } from "@/lib/guiones/data";
import { leerPlanSerie, promptSerie } from "@/lib/guiones/prompt";
import { normalizarOpciones } from "@/lib/guiones/types";

// Propone cómo dividir un video largo en varios videos cortos y guarda el plan.
export const maxDuration = 60;

const MODELO = process.env.GUIONES_MODEL || "claude-sonnet-5-5";

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user?.isAdmin) return json(401, "Entra con tu cuenta de administrador.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, "Falta ANTHROPIC_API_KEY en las variables de entorno (Vercel > Settings > Environment Variables).");

  let body: { id?: string; n?: number; opciones?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, "Solicitud inválida.");
  }
  if (!body.id) return json(400, "Falta el video.");
  const video = await obtenerVideo(body.id);
  if (!video) return json(404, "No encontré ese video.");
  const n = Math.max(0, Math.min(12, Math.round(Number(body.n) || 0)));
  const opciones = normalizarOpciones(body.opciones as never);

  const client = new Anthropic({ apiKey });
  const usarFallback = process.env.GUIONES_FALLBACKS !== "off";
  try {
    const final = await client.beta.messages
      .stream({
        model: MODELO,
        max_tokens: 4000,
        output_config: { effort: "low" },
        messages: [{ role: "user", content: promptSerie(video, opciones, n) }],
        ...(usarFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      })
      .finalMessage();
    const texto = final.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const serie = leerPlanSerie(texto);
    if (serie.length === 0) return json(502, "No pude armar el plan. Prueba otra vez.");
    await guardarSerie(video.id, serie);
    return Response.json({ serie });
  } catch (e) {
    return json(500, e instanceof Error ? e.message : "No pude armar el plan. Prueba otra vez.");
  }
}
