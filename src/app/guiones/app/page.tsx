import Link from "next/link";
import { NuevoVideoForm } from "@/components/guiones/nuevo-video-form";
import { listarVideos } from "@/lib/guiones/data";
import { borrarVideo } from "./actions";

export default async function GuionesHome({ searchParams }: PageProps<"/guiones/app">) {
  const sp = await searchParams;
  const url = typeof sp.url === "string" ? sp.url : "";
  let videos: Awaited<ReturnType<typeof listarVideos>> = [];
  let aviso = "";
  try {
    videos = await listarVideos();
  } catch {
    aviso = "No pude leer tus videos. ¿Ya ejecutaste supabase/guiones.sql en Supabase?";
  }
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Nuevo guion</h1>
        <p className="mb-4 text-sm text-mut">Pega el link de un video validado y elige cómo lo quieres.</p>
        <NuevoVideoForm urlInicial={url} modoInicial={sp.modo === "texto" ? "texto" : "link"} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-ink">Mis videos</h2>
        {aviso && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{aviso}</p>}
        {!aviso && videos.length === 0 && <p className="mt-3 text-sm text-mut">Aquí aparecerán los videos que conviertas.</p>}
        <ul className="mt-3 space-y-2">
          {videos.map((v) => (
            <li key={v.id} className="card flex items-center gap-2 p-3">
              <Link href={`/guiones/app/${v.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{v.title}</p>
                <p className="text-xs text-mut">
                  {v.channel && <>{v.channel} · </>}
                  {new Date(v.updated_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                </p>
              </Link>
              <form action={borrarVideo}>
                <input type="hidden" name="id" value={v.id} />
                <button className="rounded-full px-2 py-1 text-xs text-mut hover:text-red-600" aria-label="Borrar">
                  Borrar
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
