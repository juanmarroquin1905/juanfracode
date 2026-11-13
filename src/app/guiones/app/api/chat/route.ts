import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser } from "@/lib/data";
import { guardarChat, obtenerVideo } from "@/lib/guiones/data";
import { bloqueEstilo, bloqueMaterial, INSTRUCCIONES } from "@/lib/guiones/prompt";
import { normalizarOpciones, type Mensaje } from "@/lib/guiones/types";

// Vercel Hobby corta a los 60 s; con un plan Pro puedes subirlo.
export const maxDuration = 60;

const MODELO = process.env.GUIONES_MODEL || "claude-sonnet-5-5";
const ERROR_MARCA = "\n\n[[error]]";

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user?.isAdmin) return json(401, "Entra con tu cuenta de administrador.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, "Falta ANTHROPIC_API_KEY en las variables de entorno (Vercel > Settings > Environment Variables).");

  let body: { id?: string; mensajes?: Mensaje[]; opciones?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, "Solicitud inválida.");
  }
  const mensajes = (body.mensajes ?? []).filter((m) => (m.role === "user" || m.role === "assistant") && m.content?.trim());
  if (!body.id || mensajes.length === 0 || mensajes[mensajes.length - 1].role !== "user") return json(400, "Falta el mensaje.");

  const video = await obtenerVideo(body.id);
  if (!video) return json(404, "No encontré ese video.");
  const opciones = normalizarOpciones(body.opciones as never);

  const client = new Anthropic({ apiKey });
  const usarFallback = process.env.GUIONES_FALLBACKS !== "off";

  const stream = client.beta.messages.stream({
    model: MODELO,
    max_tokens: 8000,
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: INSTRUCCIONES },
      // La transcripción va en su propio bloque con caché: los siguientes mensajes del chat salen más baratos.
      { type: "text", text: bloqueMaterial(video), cache_control: { type: "ephemeral" } },
      { type: "text", text: bloqueEstilo(opciones) },
    ],
    messages: mensajes.map((m) => ({ role: m.role, content: m.content })),
    ...(usarFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        let texto = "";
        try {
          for await (const ev of stream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              texto += ev.delta.text;
              controller.enqueue(encoder.encode(ev.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal") throw new Error("Claude no quiso generar este contenido. Prueba con otro video.");
          if (!texto.trim()) throw new Error("La respuesta llegó vacía. Intenta de nuevo.");
          await guardarChat(video.id, [...mensajes, { role: "assistant", content: texto }], opciones);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Error desconocido.";
          controller.enqueue(encoder.encode(`${ERROR_MARCA}${msg}`));
        } finally {
          controller.close();
        }
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
