"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/data";
import { borrarVideoDb, crearVideoDb, guardarChat, obtenerVideo } from "@/lib/guiones/data";
import { obtenerTranscripcion, datosYoutube, SupadataError } from "@/lib/guiones/supadata";
import { normalizarOpciones, type Opciones } from "@/lib/guiones/types";
import { esLinkValido, youtubeId } from "@/lib/guiones/youtube";

export type FormState = { error: string } | null;

async function exigirAdmin() {
  const user = await getAdminUser();
  if (!user?.isAdmin) redirect("/login");
}

const MIN_PALABRAS = 40;

export async function crearVideo(_: FormState, fd: FormData): Promise<FormState> {
  await exigirAdmin();
  const url = String(fd.get("url") ?? "").trim();
  const pegada = String(fd.get("transcripcion") ?? "").trim();
  let titulo = String(fd.get("titulo") ?? "").trim();
  let canal = "";
  let opciones: Opciones;
  try {
    opciones = normalizarOpciones(JSON.parse(String(fd.get("opciones") ?? "{}")));
  } catch {
    opciones = normalizarOpciones(null);
  }

  if (!url && !pegada) return { error: "Pega el link del video o la transcripción." };
  if (url && !esLinkValido(url)) return { error: "Ese link no parece válido. Debe empezar con https://" };

  const esYoutube = Boolean(url && youtubeId(url));
  if (esYoutube && !titulo) {
    const datos = await datosYoutube(url);
    if (datos) {
      titulo = datos.title;
      canal = datos.channel;
    }
  }

  let transcript = pegada;
  if (!transcript) {
    try {
      transcript = (await obtenerTranscripcion(url)).texto;
    } catch (e) {
      if (e instanceof SupadataError) {
        if (e.codigo === "no-disponible" || e.codigo === "no-encontrado")
          return { error: "Este video no tiene transcripción disponible. Pégala tú mismo en la otra pestaña." };
        return { error: e.message };
      }
      return { error: "No pude sacar la transcripción. Intenta de nuevo o pégala tú mismo." };
    }
  }
  if (transcript.split(/\s+/).filter(Boolean).length < MIN_PALABRAS)
    return { error: "La transcripción es muy corta para armar un guion." };

  let id: string;
  try {
    id = await crearVideoDb({
      url,
      video_id: esYoutube ? youtubeId(url) : null,
      title: titulo || "Video sin título",
      channel: canal,
      transcript,
      opciones,
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (/guiones_videos/.test(m)) return { error: "Falta crear la tabla: ejecuta supabase/guiones.sql en Supabase." };
    return { error: "No pude guardar el video. Intenta de nuevo." };
  }
  revalidatePath("/guiones/app");
  redirect(`/guiones/app/${id}`);
}

export async function borrarVideo(fd: FormData) {
  await exigirAdmin();
  await borrarVideoDb(String(fd.get("id") ?? ""));
  revalidatePath("/guiones/app");
  redirect("/guiones/app");
}

export async function nuevoChat(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") ?? "");
  const v = await obtenerVideo(id);
  if (v) await guardarChat(id, [], v.opciones);
  redirect(`/guiones/app/${id}`);
}
