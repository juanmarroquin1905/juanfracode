import "server-only";
import { isDemo } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { normalizarOpciones, type Mensaje, type Opciones, type ParteSerie, type Video } from "./types";

// Guardado de videos y chats. Con Supabase usa la tabla guiones_videos (ver supabase/guiones.sql).
// En modo demo (sin Supabase) guarda en memoria del servidor, solo para probar la pantalla.

const memoria: Map<string, Video> = ((globalThis as { __guionesDemo?: Map<string, Video> }).__guionesDemo ??= new Map());

type Fila = Omit<Video, "opciones" | "mensajes" | "serie"> & { opciones: Partial<Opciones> | null; mensajes: Mensaje[] | null; serie?: ParteSerie[] | null };
const aVideo = (f: Fila): Video => ({ ...f, opciones: normalizarOpciones(f.opciones), mensajes: f.mensajes ?? [], serie: f.serie ?? [] });

/** Error claro si falta la columna "serie" (supabase/guiones-serie.sql). */
function errorSerie(m: string): Error {
  return new Error(/serie/.test(m) ? "Falta un paso en Supabase: ejecuta supabase/guiones-serie.sql en el SQL Editor." : m);
}

export async function listarVideos(): Promise<Omit<Video, "transcript" | "mensajes" | "serie">[]> {
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
  return (data ?? []).map((f) => ({ ...f, opciones: normalizarOpciones(f.opciones) })) as Omit<Video, "transcript" | "mensajes" | "serie">[];
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
    memoria.set(id, { id, ...v, mensajes: [], serie: [], created_at: ahora, updated_at: ahora });
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

/** Guarda el plan de la serie (reemplaza el anterior). */
export async function guardarSerie(id: string, serie: ParteSerie[]): Promise<void> {
  const ahora = new Date().toISOString();
  if (isDemo) {
    const v = memoria.get(id);
    if (v) memoria.set(id, { ...v, serie, updated_at: ahora });
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("guiones_videos").update({ serie, updated_at: ahora }).eq("id", id);
  if (error) throw errorSerie(error.message);
}

/** Guarda el chat de una parte de la serie. */
export async function guardarParte(id: string, parte: number, mensajes: Mensaje[], opciones: Opciones): Promise<void> {
  const v = await obtenerVideo(id);
  if (!v || !v.serie[parte]) throw new Error("No encontré esa parte de la serie.");
  const serie = v.serie.map((p, i) => (i === parte ? { ...p, mensajes } : p));
  const ahora = new Date().toISOString();
  if (isDemo) {
    memoria.set(id, { ...v, serie, opciones, updated_at: ahora });
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("guiones_videos").update({ serie, opciones, updated_at: ahora }).eq("id", id);
  if (error) throw errorSerie(error.message);
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
