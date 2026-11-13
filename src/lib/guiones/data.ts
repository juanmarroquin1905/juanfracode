import "server-only";
import { isDemo } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { normalizarOpciones, type Mensaje, type Opciones, type Video } from "./types";

// Guardado de videos y chats. Con Supabase usa la tabla guiones_videos (ver supabase/guiones.sql).
// En modo demo (sin Supabase) guarda en memoria del servidor, solo para probar la pantalla.

const memoria: Map<string, Video> = ((globalThis as { __guionesDemo?: Map<string, Video> }).__guionesDemo ??= new Map());

type Fila = Omit<Video, "opciones" | "mensajes"> & { opciones: Partial<Opciones> | null; mensajes: Mensaje[] | null };
const aVideo = (f: Fila): Video => ({ ...f, opciones: normalizarOpciones(f.opciones), mensajes: f.mensajes ?? [] });

export async function listarVideos(): Promise<Omit<Video, "transcript" | "mensajes">[]> {
  if (isDemo) {
    return [...memoria.values()]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((v) => ({ id: v.id, url: v.url, video_id: v.video_id, title: v.title, channel: v.channel, opciones: v.opciones, created_at: v.created_at, updated_at: v.updated_at }));
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guiones_videos")
    .select("id,url,video_id,title,channel,opciones,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => ({ ...f, opciones: normalizarOpciones(f.opciones) })) as Omit<Video, "transcript" | "mensajes">[];
}

export async function obtenerVideo(id: string): Promise<Video | null> {
  if (isDemo) return memoria.get(id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("guiones_videos").select("*").eq("id", id).maybeSingle();
  return data ? aVideo(data as Fila) : null;
}

export async function crearVideoDb(v: {
  url: string;
  video_id: string | null;
  title: string;
  channel: string;
  transcript: string;
  opciones: Opciones;
}): Promise<string> {
  if (isDemo) {
    const id = crypto.randomUUID();
    const ahora = new Date().toISOString();
    memoria.set(id, { id, ...v, mensajes: [], created_at: ahora, updated_at: ahora });
    return id;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("guiones_videos").insert(v).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function guardarChat(id: string, mensajes: Mensaje[], opciones: Opciones): Promise<void> {
  const ahora = new Date().toISOString();
  if (isDemo) {
    const v = memoria.get(id);
    if (v) memoria.set(id, { ...v, mensajes, opciones, updated_at: ahora });
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("guiones_videos").update({ mensajes, opciones, updated_at: ahora }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function borrarVideoDb(id: string): Promise<void> {
  if (isDemo) {
    memoria.delete(id);
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("guiones_videos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
