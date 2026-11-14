"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { nuevoChat } from "@/app/guiones/app/actions";
import {
  contarPalabras,
  DURACIONES,
  opcionesParte,
  pedidoParte,
  segundosHablados,
  textoHablado,
  type Mensaje,
  type Opciones,
  type ParteSerie,
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

type Chat = "main" | number;

function chatInicial(video: Video): Chat {
  if (video.mensajes.length > 0) return "main";
  const i = video.serie.findIndex((p) => p.mensajes.length > 0);
  return i >= 0 ? i : "main";
}

export function Workspace({ video, demoSinClave, autoSerie }: { video: Video; demoSinClave?: boolean; autoSerie?: boolean }) {
  const [activa, setActiva] = useState<Chat>(() => chatInicial(video));
  const [main, setMain] = useState<Mensaje[]>(video.mensajes);
  const [serie, setSerie] = useState<ParteSerie[]>(video.serie);
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    const c = chatInicial(video);
    return c === "main" ? video.mensajes : video.serie[c].mensajes;
  });
  const [opciones, setOpciones] = useState<Opciones>(video.opciones);
  const [enVivo, setEnVivo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<{ cargando: boolean; error: string; n: number }>({ cargando: false, error: "", n: 0 });
  const [verTranscripcion, setVerTranscripcion] = useState(!(autoSerie || video.serie.length > 0));
  const [verOpciones, setVerOpciones] = useState(false);
  const [texto, setTexto] = useState("");
  const fin = useRef<HTMLDivElement>(null);
  const arrancado = useRef(false);
  const ocupado = enVivo !== null || plan.cargando;

  /** Pone los mensajes del chat que se está viendo y los guarda en su lugar (general o parte). */
  const poner = useCallback((chat: Chat, m: Mensaje[]) => {
    setMensajes(m);
    if (chat === "main") setMain(m);
    else setSerie((s) => s.map((p, k) => (k === chat ? { ...p, mensajes: m } : p)));
  }, []);

  const enviar = useCallback(
    async (contenido: string, previos: Mensaje[], ops: Opciones, recorteAuto = true, chat: Chat = "main"): Promise<void> => {
      const nuevos: Mensaje[] = [...previos, { role: "user", content: contenido }];
      poner(chat, nuevos);
      setEnVivo("");
      setError("");
      let acumulado = "";
      let fallo = false;
      try {
        const res = await fetch("/guiones/app/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: video.id, mensajes: nuevos, opciones: ops, ...(chat === "main" ? {} : { parte: chat }) }),
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
          fallo = true;
          setError(msg || "Algo falló. Intenta de nuevo.");
        }
        if (acumulado.trim()) {
          const todos: Mensaje[] = [...nuevos, { role: "assistant", content: acumulado }];
          poner(chat, todos);
          // Si el guion se pasó del tiempo pedido, lo acorta una vez solo.
          const tope = DURACIONES.find((d) => d.id === ops.duracion)?.segundos ?? 60;
          if (recorteAuto && !fallo && esGuion(acumulado) && segundosHablados(acumulado) > tope + 5) {
            setEnVivo(null);
            return enviar(
              `Se pasó de tiempo: dura unos ${segundosHablados(acumulado)} s y el máximo es ${tope} s. Acórtalo para que dure ${tope} s o menos, sin perder lo esencial. Devuélveme el guion completo.`,
              todos,
              ops,
              false,
              chat,
            );
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo generar. Intenta de nuevo.");
      } finally {
        setEnVivo(null);
      }
    },
    [video.id, poner],
  );

  const proponerSerie = useCallback(
    async (n: number, ops: Opciones) => {
      setPlan({ cargando: true, error: "", n });
      try {
        const res = await fetch("/guiones/app/api/serie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: video.id, n, opciones: ops }),
        });
        const j = await res.json().catch(() => null);
        if (!res.ok || !j?.serie) throw new Error(j?.error ?? "No pude armar el plan. Prueba otra vez.");
        setSerie(j.serie as ParteSerie[]);
        setPlan({ cargando: false, error: "", n });
        setActiva("main");
        setMensajes(main);
      } catch (e) {
        setPlan({ cargando: false, error: e instanceof Error ? e.message : "No pude armar el plan.", n });
      }
    },
    [video.id, main],
  );

  // Video recién creado: arma el plan de la serie o genera el primer guion solo.
  useEffect(() => {
    if (arrancado.current || demoSinClave || video.mensajes.length > 0 || video.serie.length > 0) return;
    arrancado.current = true;
    // Arranque único de un video recién creado (llama a la API y luego actualiza el estado).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoSerie) void proponerSerie(0, opciones);
    else void enviar("Genera el guion para este video con el estilo elegido.", [], opciones);
  }, [video.mensajes.length, video.serie.length, demoSinClave, autoSerie, enviar, proponerSerie, opciones]);

  const elegir = (chat: Chat) => {
    if (ocupado) return;
    setError("");
    setActiva(chat);
    setMensajes(chat === "main" ? main : serie[chat].mensajes);
  };

  const generarParte = (i: number, rehacer = false) => {
    if (ocupado) return;
    setError("");
    setActiva(i);
    if (!rehacer && serie[i].mensajes.length > 0) {
      setMensajes(serie[i].mensajes);
      return;
    }
    const ops = opcionesParte(opciones, serie, i);
    setOpciones(ops);
    void enviar(pedidoParte(serie, i, ops.cta), [], ops, true, i);
  };

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, enVivo]);

  const ultimo = [...mensajes].reverse().find((m) => m.role === "assistant" && esGuion(m.content));
  const tope = DURACIONES.find((d) => d.id === opciones.duracion)?.segundos ?? 60;

  const mandar = (t: string) => {
    if (!t.trim() || ocupado) return;
    setTexto("");
    void enviar(t.trim(), mensajes, opciones, true, activa);
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
        <div className="shrink-0 border-t border-line px-4 py-3 lg:max-h-[55vh] lg:overflow-y-auto">
          <p className="text-sm font-semibold text-ink">Dividir en serie</p>
          <p className="mt-0.5 text-xs text-mut">Para cursos o videos largos: propongo varios videos cortos, cada uno con una sola idea, y generas el guion de cada uno.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select className="input !w-auto !py-1.5 !text-sm" value={plan.n} onChange={(e) => setPlan((p) => ({ ...p, n: Number(e.target.value) }))} disabled={ocupado}>
              <option value={0}>Que decida Claude</option>
              {[3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} videos
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn !px-3 !py-1.5 !text-xs"
              disabled={ocupado || demoSinClave}
              onClick={() => {
                if (serie.some((p) => p.mensajes.length > 0) && !window.confirm("Se reemplaza el plan actual y los guiones de sus partes. ¿Seguir?")) return;
                void proponerSerie(plan.n, opciones);
              }}
            >
              {serie.length ? "Proponer otra serie" : "Proponer serie"}
            </button>
          </div>
          {plan.cargando && <p className="mt-2 animate-pulse text-xs text-mut">Leyendo el video completo y armando el plan… (puede tardar hasta un minuto)</p>}
          {plan.error && <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{plan.error}</p>}
          {serie.length > 0 && (
            <ol className="mt-3 space-y-2">
              {serie.map((p, i) => {
                const hecho = p.mensajes.length > 0;
                const actual = activa === i;
                return (
                  <li key={i}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => generarParte(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") generarParte(i);
                      }}
                      className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${actual ? "border-accent bg-soft" : "border-line hover:bg-soft/60"}`}
                    >
                      <p className="font-semibold text-ink">
                        {i + 1}/{serie.length} · {p.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-mut">{p.idea}</p>
                      {p.gancho && <p className="mt-1 text-xs text-mut italic">Gancho: {p.gancho}</p>}
                      {p.pasaje && <p className="mt-1 text-[11px] text-mut">Sale de: “{p.pasaje}…”</p>}
                      <div className="mt-2 flex gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hecho ? "bg-card text-ink" : "bg-accent text-white"}`}>
                          {hecho ? (actual ? "Viendo a la derecha" : "Ver guion") : "Generar guion"}
                        </span>
                        {hecho && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-mut underline disabled:opacity-50"
                            disabled={ocupado}
                            onClick={(e) => {
                              e.stopPropagation();
                              generarParte(i, true);
                            }}
                          >
                            Rehacer
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        {!verTranscripcion && <div className="hidden flex-1 lg:block" />}
      </section>

      {/* Derecha: chat */}
      <section className="card flex min-h-[32rem] min-w-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <span className="min-w-0 truncate text-sm font-bold text-ink">
            {activa === "main" ? (serie.length ? "Guion general" : "Chat del guion") : `Parte ${activa + 1}/${serie.length} · ${serie[activa]?.titulo ?? ""}`}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => setVerOpciones((v) => !v)}>
              Estilo
            </button>
            {activa === "main" ? (
              <form action={nuevoChat}>
                <input type="hidden" name="id" value={video.id} />
                <button className="btn-ghost !px-3 !py-1.5 !text-xs" disabled={ocupado}>
                  Nuevo chat
                </button>
              </form>
            ) : (
              <button className="btn-ghost !px-3 !py-1.5 !text-xs" disabled={ocupado} onClick={() => generarParte(activa, true)}>
                Rehacer parte
              </button>
            )}
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

        {serie.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-line px-4 py-2">
            {main.length > 0 && (
              <button className={`chip shrink-0 !text-xs ${activa === "main" ? "!bg-accent !text-white" : ""}`} disabled={ocupado} onClick={() => elegir("main")}>
                General
              </button>
            )}
            {serie.map((p, i) => (
              <button
                key={i}
                className={`chip shrink-0 !text-xs ${activa === i ? "!bg-accent !text-white" : ""}`}
                disabled={ocupado}
                title={p.mensajes.length ? "Ver guion" : "Aún sin generar"}
                onClick={() => generarParte(i)}
              >
                Parte {i + 1}
                {p.mensajes.length === 0 && <span className="opacity-60"> ○</span>}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!demoSinClave && mensajes.length === 0 && enVivo === null && serie.length > 0 && (
            <p className="rounded-lg bg-soft p-3 text-sm text-mut">Elige una parte de la serie para generar su guion. Cada parte tiene su propio chat para pedir cambios.</p>
          )}
          {!demoSinClave && mensajes.length === 0 && enVivo === null && plan.cargando && (
            <p className="animate-pulse rounded-lg bg-soft p-3 text-sm text-mut">Armando el plan de la serie…</p>
          )}
          {demoSinClave && mensajes.length === 0 && (
            <p className="rounded-lg bg-soft p-3 text-sm text-mut">
              Modo demo: aquí aparecerá el guion. Para generar de verdad hay que configurar Supabase y ANTHROPIC_API_KEY.
            </p>
          )}
          {mensajes.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-white">
                {i === 0 ? (activa === "main" ? "Genera el guion para este video." : `Genera el guion de la parte ${activa + 1}.`) : m.content}
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
                <button className="ml-2 font-semibold underline" onClick={() => void enviar(mensajes[mensajes.length - 1].content, mensajes.slice(0, -1), opciones, true, activa)}>
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
  const [vista, setVista] = useState<"todo" | "leer">("todo");
  const [letra, setLetra] = useState<"A" | "B" | "C">("A");
  const leer = textoHablado(md, letra);
  return (
    <div>
      {guion && (
        <div className="mb-2 inline-flex rounded-full bg-soft p-0.5 text-xs font-semibold">
          {(
            [
              ["todo", "Guion completo"],
              ["leer", "Solo guion para leer"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setVista(id)} className={`rounded-full px-3 py-1 ${vista === id ? "bg-card text-ink shadow-sm" : "text-mut"}`}>
              {label}
            </button>
          ))}
        </div>
      )}
      {guion && vista === "leer" ? (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-mut">
            Gancho:
            {(["A", "B", "C"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLetra(l)} className={`size-6 rounded-full font-semibold ${letra === l ? "bg-accent text-white" : "bg-soft"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="space-y-3 rounded-xl border border-line bg-card/60 p-4 text-[17px] leading-relaxed text-ink">
            {leer.split("\n\n").map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
      ) : (
        <Markdown texto={md} />
      )}
      {guion && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className={`text-xs font-semibold ${pasado ? "text-amber-700" : "text-mut"}`}>
            {contarPalabras(hablado)} palabras · ~{seg} s hablado
          </span>
          <Copiar texto={leer} label="Copiar lo que digo" />
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
