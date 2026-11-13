"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { nuevoChat } from "@/app/guiones/app/actions";
import {
  contarPalabras,
  DURACIONES,
  segundosHablados,
  textoHablado,
  type Mensaje,
  type Opciones,
  type Video,
} from "@/lib/guiones/types";
import { Markdown } from "./markdown";
import { OpcionesCampos } from "./opciones-campos";

const ERROR_MARCA = "\n\n[[error]]";

const ATAJOS = [
  { label: "Otros 3 ganchos", texto: "Dame 3 ganchos nuevos y distintos a los anteriores, solo los ganchos." },
  { label: "Más corto", texto: "Acórtalo un 25 % sin perder lo esencial. Devuélveme el guion completo." },
  { label: "Más enérgico", texto: "Hazlo más enérgico y con más ritmo, sin cambiar la idea. Devuélveme el guion completo." },
  { label: "Otra idea del video", texto: "Hazlo con otra idea fuerte del video, distinta a la anterior. Devuélveme el guion completo." },
  { label: "Otro cierre", texto: "Cambia solo el cierre (CTA) por otro distinto y dime cuál usar." },
];

function Copiar({ texto, label }: { texto: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost !px-3 !py-1.5 !text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {}
      }}
    >
      {ok ? "¡Copiado!" : label}
    </button>
  );
}

function esGuion(md: string) {
  return /^##\s+.*guion/im.test(md) || /^##\s+.*gancho/im.test(md);
}

export function Workspace({ video, demoSinClave }: { video: Video; demoSinClave?: boolean }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(video.mensajes);
  const [opciones, setOpciones] = useState<Opciones>(video.opciones);
  const [enVivo, setEnVivo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [verTranscripcion, setVerTranscripcion] = useState(true);
  const [verOpciones, setVerOpciones] = useState(false);
  const [texto, setTexto] = useState("");
  const fin = useRef<HTMLDivElement>(null);
  const arrancado = useRef(false);
  const ocupado = enVivo !== null;

  const enviar = useCallback(
    async (contenido: string, previos: Mensaje[], ops: Opciones) => {
      const nuevos: Mensaje[] = [...previos, { role: "user", content: contenido }];
      setMensajes(nuevos);
      setEnVivo("");
      setError("");
      let acumulado = "";
      try {
        const res = await fetch("/guiones/app/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: video.id, mensajes: nuevos, opciones: ops }),
        });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error ?? "No se pudo generar. Intenta de nuevo.");
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acumulado += dec.decode(value, { stream: true });
          const i = acumulado.indexOf(ERROR_MARCA);
          setEnVivo(i >= 0 ? acumulado.slice(0, i) : acumulado);
        }
        const i = acumulado.indexOf(ERROR_MARCA);
        if (i >= 0) {
          const msg = acumulado.slice(i + ERROR_MARCA.length);
          acumulado = acumulado.slice(0, i);
          setError(msg || "Algo falló. Intenta de nuevo.");
        }
        if (acumulado.trim()) setMensajes([...nuevos, { role: "assistant", content: acumulado }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo generar. Intenta de nuevo.");
      } finally {
        setEnVivo(null);
      }
    },
    [video.id],
  );

  // Video recién creado: genera el primer guion solo.
  useEffect(() => {
    if (arrancado.current || video.mensajes.length > 0 || demoSinClave) return;
    arrancado.current = true;
    void enviar("Genera el guion para este video con el estilo elegido.", [], opciones);
  }, [video.mensajes.length, demoSinClave, enviar, opciones]);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, enVivo]);

  const ultimo = [...mensajes].reverse().find((m) => m.role === "assistant" && esGuion(m.content));
  const tope = DURACIONES.find((d) => d.id === opciones.duracion)?.segundos ?? 60;

  const mandar = (t: string) => {
    if (!t.trim() || ocupado) return;
    setTexto("");
    void enviar(t.trim(), mensajes, opciones);
  };

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Izquierda: el video y su transcripción */}
      <section className="card flex min-h-0 flex-col overflow-hidden">
        {video.video_id ? (
          <div className="aspect-video w-full shrink-0 bg-night">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.video_id}`}
              title={video.title}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="brand-gradient grid aspect-video w-full shrink-0 place-items-center text-white">
            <span className="text-sm font-semibold opacity-90">Transcripción pegada</span>
          </div>
        )}
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-base leading-snug font-bold text-ink">{video.title}</h1>
          <p className="mt-0.5 text-xs text-mut">
            {video.channel && <>{video.channel} · </>}
            {contarPalabras(video.transcript).toLocaleString("es")} palabras
            {video.url && (
              <>
                {" · "}
                <a href={video.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  Abrir original ↗
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <button className="text-sm font-semibold text-ink" onClick={() => setVerTranscripcion((v) => !v)}>
            {verTranscripcion ? "▾" : "▸"} Transcripción
          </button>
          <Copiar texto={video.transcript} label="Copiar" />
        </div>
        <div className={`overflow-y-auto px-4 pb-4 text-sm leading-relaxed text-mut ${verTranscripcion ? "max-h-72 lg:max-h-none lg:flex-1" : "hidden"}`}>
          {video.transcript}
        </div>
        {!verTranscripcion && <div className="hidden flex-1 lg:block" />}
      </section>

      {/* Derecha: chat */}
      <section className="card flex min-h-[32rem] min-w-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <span className="text-sm font-bold text-ink">Chat del guion</span>
          <div className="flex gap-2">
            <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => setVerOpciones((v) => !v)}>
              Estilo
            </button>
            <form action={nuevoChat}>
              <input type="hidden" name="id" value={video.id} />
              <button className="btn-ghost !px-3 !py-1.5 !text-xs" disabled={ocupado}>
                Nuevo chat
              </button>
            </form>
            <Link href="/guiones/app" className="btn !px-3 !py-1.5 !text-xs">
              + Nuevo video
            </Link>
          </div>
        </div>
        {verOpciones && (
          <div className="border-b border-line bg-soft/50 p-4">
            <OpcionesCampos value={opciones} onChange={setOpciones} compacto />
            <p className="hint">Los cambios se aplican al siguiente mensaje.</p>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {demoSinClave && mensajes.length === 0 && (
            <p className="rounded-lg bg-soft p-3 text-sm text-mut">
              Modo demo: aquí aparecerá el guion. Para generar de verdad hay que configurar Supabase y ANTHROPIC_API_KEY.
            </p>
          )}
          {mensajes.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-white">
                {i === 0 ? "Genera el guion para este video." : m.content}
              </div>
            ) : (
              <Respuesta key={i} md={m.content} tope={tope} onAcortar={(s) => mandar(`Acórtalo para que dure unos ${s} segundos como máximo, sin perder lo esencial. Devuélveme el guion completo.`)} bloqueado={ocupado} />
            ),
          )}
          {enVivo !== null && (
            <div className="max-w-full">
              {enVivo ? <Markdown texto={enVivo} /> : <p className="animate-pulse text-sm text-mut">Armando tu guion…</p>}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
              {mensajes.length > 0 && mensajes[mensajes.length - 1].role === "user" && (
                <button className="ml-2 font-semibold underline" onClick={() => void enviar(mensajes[mensajes.length - 1].content, mensajes.slice(0, -1), opciones)}>
                  Reintentar
                </button>
              )}
            </div>
          )}
          <div ref={fin} />
        </div>

        <div className="border-t border-line p-3">
          {ultimo && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {ATAJOS.map((a) => (
                <button key={a.label} className="chip !text-xs hover:text-ink disabled:opacity-50" disabled={ocupado} onClick={() => mandar(a.texto)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              mandar(texto);
            }}
          >
            <textarea
              className="input max-h-32 min-h-11 flex-1 resize-none !py-2.5"
              rows={1}
              value={texto}
              placeholder="Pide un cambio: más corto, otro gancho, otra idea…"
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  mandar(texto);
                }
              }}
            />
            <button className="btn !h-11 !w-11 !p-0" disabled={ocupado || !texto.trim()} aria-label="Enviar">
              ↑
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Respuesta({ md, tope, onAcortar, bloqueado }: { md: string; tope: number; onAcortar: (s: number) => void; bloqueado: boolean }) {
  const hablado = textoHablado(md);
  const guion = esGuion(md) && hablado.length > 0;
  const seg = segundosHablados(md);
  const pasado = seg > tope + 5;
  return (
    <div>
      <Markdown texto={md} />
      {guion && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className={`text-xs font-semibold ${pasado ? "text-amber-700" : "text-mut"}`}>
            {contarPalabras(hablado)} palabras · ~{seg} s hablado
          </span>
          <Copiar texto={hablado} label="Copiar lo que digo" />
          <Copiar texto={md} label="Copiar todo" />
          {pasado && (
            <button className="btn !px-3 !py-1.5 !text-xs" disabled={bloqueado} onClick={() => onAcortar(tope)}>
              Acortar a ~{tope} s
            </button>
          )}
        </div>
      )}
    </div>
  );
}
