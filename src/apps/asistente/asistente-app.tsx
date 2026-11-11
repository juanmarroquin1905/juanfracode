"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import "./hud.css";
import { monthSpent, SUGGESTIONS, summary, think, weekWorkouts } from "./brain";
import { Core, type CoreState } from "./core";
import type { AsistenteStore } from "./store";
import type { Data } from "./types";
import { addDays, greeting, longDate, money, monthName, nowTime, shortDay, today, uid, weekStart } from "./utils";
import { useVoice } from "./voice";

type Props = {
  store: AsistenteStore;
  /** Barra opcional arriba de todo (ej: aviso de demo o botón de salir). */
  topBar?: ReactNode;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Msg = { id: string; from: "me" | "nova"; text: string };

// Todo el asistente en una pantalla: el núcleo y el chat al centro, y tus datos a los lados.
export function AsistenteApp({ store, topBar }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<{ id: string; n: number } | null>(null);
  const [talkState, setState] = useState<Exclude<CoreState, "listening">>("idle");
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [clock, setClock] = useState<string | null>(null);
  const voice = useVoice();
  const queue = useRef<Promise<void>>(Promise.resolve());
  const chatBox = useRef<HTMLDivElement>(null);
  const talking = useRef({ text: false, voice: false });
  // Copia siempre al día de los datos (para mensajes seguidos).
  const dataRef = useRef<Data | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Reloj
  useEffect(() => {
    const tick = () => setClock(nowTime());
    const t0 = setTimeout(tick, 0);
    const t = setInterval(tick, 10_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  // Cargar datos y saludar
  useEffect(() => {
    let alive = true;
    store
      .load()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setMsgs([{ id: uid(), from: "nova", text: `${greeting()}. Soy NOVA, tu asistente. ${summary(d)}` }]);
      })
      .catch((e) => {
        if (alive) setMsgs([{ id: uid(), from: "nova", text: `No pude cargar tus datos: ${(e as Error).message}` }]);
      });
    return () => {
      alive = false;
    };
  }, [store]);

  // Guarda en fila, un cambio detrás de otro.
  const persist = useCallback(
    (d: Data) => {
      dataRef.current = d;
      setData(d);
      queue.current = queue.current.then(() =>
        store.save(d).catch((e) => {
          setMsgs((m) => [...m, { id: uid(), from: "nova", text: `No pude guardar: ${(e as Error).message}` }]);
        }),
      );
    },
    [store],
  );

  // Efecto de "escribiendo" letra por letra
  useEffect(() => {
    if (!typing) return;
    const msg = msgs.find((m) => m.id === typing.id);
    if (!msg) return;
    if (typing.n >= msg.text.length) {
      const t = setTimeout(() => {
        setTyping(null);
        talking.current.text = false;
        if (!talking.current.voice) setState("idle");
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTyping({ id: typing.id, n: typing.n + 2 }), 16);
    return () => clearTimeout(t);
  }, [typing, msgs]);

  useEffect(() => {
    const box = chatBox.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [msgs, typing?.n]);

  function reply(text: string) {
    const id = uid();
    setMsgs((m) => [...m, { id, from: "nova", text }]);
    setTyping({ id, n: 0 });
    setState("speaking");
    talking.current = { text: true, voice: voiceOn && voice.canSpeak };
    if (voiceOn && voice.canSpeak) {
      voice.speak(text, () => {
        talking.current.voice = false;
        if (!talking.current.text) setState("idle");
      });
    }
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text || !data) return;
    setInput("");
    voice.stopSpeaking();
    setMsgs((m) => [...m, { id: uid(), from: "me", text }]);
    setState("thinking");
    setTimeout(() => {
      const r = think(text, dataRef.current ?? data);
      if (r.data) persist(r.data);
      reply(r.text);
    }, 550);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function mic() {
    if (voice.listening) return voice.listen(() => {});
    voice.stopSpeaking();
    voice.listen((t) => send(t));
  }

  const state: CoreState = voice.listening ? "listening" : talkState;
  const t = today();
  const statusText = { idle: "En línea", listening: "Escuchando…", thinking: "Procesando…", speaking: "Hablando…" }[state];

  return (
    <div className="hud">
      {topBar}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-10 sm:px-6">
        {/* Encabezado */}
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-(--h-line-strong) shadow-[0_0_14px_rgb(79_227_255/0.4)]">
              <span className="size-3 rounded-full bg-(--h-cyan) shadow-[0_0_10px_#4fe3ff]" />
            </span>
            <div>
              <h1 className="hud-display hud-glow text-xl font-bold leading-none">Nova</h1>
              <p className="mt-1 text-xs tracking-wide text-(--h-mut)">Tu asistente personal</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <div className="hud-num hud-glow text-2xl leading-none" suppressHydrationWarning>
                {clock ?? "--:--"}
              </div>
              <div className="mt-1 text-xs text-(--h-mut)">{clock ? cap(longDate(t)) : " "}</div>
            </div>
            {voice.canSpeak && (
              <button
                type="button"
                className="hud-btn"
                aria-pressed={voiceOn}
                onClick={() => {
                  if (voiceOn) voice.stopSpeaking();
                  setVoiceOn(!voiceOn);
                }}
                title="Que NOVA lea sus respuestas en voz alta"
              >
                {voiceOn ? "🔊 Voz activada" : "🔈 Activar voz"}
              </button>
            )}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,300px)]">
          {/* Centro: núcleo y chat */}
          <section className="flex min-w-0 flex-col items-center lg:order-2">
            <Core state={state} />
            <div className="hud-display mt-1 flex items-center gap-2 text-[11px] text-(--h-mut)">
              <span className={`size-1.5 rounded-full ${state === "listening" ? "bg-(--h-ok)" : "bg-(--h-cyan)"} shadow-[0_0_8px_currentColor]`} />
              {statusText}
            </div>

            <div className="hud-panel mt-4 w-full max-w-2xl">
              <div className="hud-title">Conversación</div>
              <div ref={chatBox} className="hud-scroll flex h-56 flex-col sm:h-64 gap-2.5 overflow-y-auto pr-1" aria-live="polite">
                {msgs.map((m) => (
                  <div key={m.id} className="hud-msg" data-from={m.from}>
                    {m.from === "nova" && typing?.id === m.id ? (
                      <>
                        {m.text.slice(0, typing.n)}
                        <span className="hud-caret" />
                      </>
                    ) : (
                      m.text
                    )}
                  </div>
                ))}
                {state === "thinking" && (
                  <div className="hud-msg" data-from="nova">
                    <span className="hud-caret" />
                  </div>
                )}
              </div>
              <form onSubmit={onSubmit} className="mt-3 flex gap-2">
                <input
                  className="hud-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={voice.listening ? "Te escucho…" : "Escríbele a NOVA…"}
                  aria-label="Mensaje para NOVA"
                />
                {voice.canListen && (
                  <button type="button" className="hud-btn shrink-0 px-3" aria-pressed={voice.listening} onClick={mic} title="Hablarle con el micrófono">
                    🎙️
                  </button>
                )}
                <button type="submit" className="hud-btn shrink-0" disabled={!input.trim() || !data}>
                  Enviar
                </button>
              </form>
              <div className="hud-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="hud-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Izquierda */}
          <div className="flex min-w-0 flex-col gap-4 lg:order-1">{data && <><AgendaPanel data={data} onChange={persist} /><TasksPanel data={data} onChange={persist} /></>}</div>

          {/* Derecha */}
          <div className="flex min-w-0 flex-col gap-4 lg:order-3">
            {data && (
              <>
                <MoneyPanel data={data} />
                <GymPanel data={data} />
                <NotesPanel data={data} onChange={persist} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type PanelProps = { data: Data; onChange: (d: Data) => void };

function AgendaPanel({ data, onChange }: PanelProps) {
  const t = today();
  const now = nowTime();
  const list = data.events.filter((e) => e.date === t).sort((a, b) => a.time.localeCompare(b.time));
  const tomorrow = data.events.filter((e) => e.date === addDays(t, 1)).length;
  return (
    <section className="hud-panel">
      <div className="hud-title">Agenda de hoy</div>
      {list.length === 0 && <p className="text-sm text-(--h-mut)">Nada agendado. Dile a NOVA: &quot;agenda a las 5 dentista&quot;.</p>}
      {list.map((e) => (
        <div key={e.id} className={`hud-row ${e.time < now ? "opacity-45" : ""}`}>
          <span className="hud-num w-12 shrink-0 text-sm text-(--h-cyan)">{e.time}</span>
          <span className="min-w-0 truncate">{e.title}</span>
          <button type="button" className="hud-x" aria-label={`Borrar ${e.title}`} onClick={() => onChange({ ...data, events: data.events.filter((x) => x.id !== e.id) })}>
            ✕
          </button>
        </div>
      ))}
      {tomorrow > 0 && <p className="mt-2 text-xs text-(--h-mut)">Mañana: {tomorrow} {tomorrow === 1 ? "evento" : "eventos"}</p>}
    </section>
  );
}

function TasksPanel({ data, onChange }: PanelProps) {
  const [text, setText] = useState("");
  const list = [...data.tasks].sort((a, b) => Number(a.done) - Number(b.done));
  const pending = data.tasks.filter((x) => !x.done).length;
  function add(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onChange({ ...data, tasks: [{ id: uid(), text: text.trim(), done: false }, ...data.tasks] });
    setText("");
  }
  return (
    <section className="hud-panel" style={{ animationDelay: "80ms" }}>
      <div className="hud-title">
        Tareas <span className="hud-num text-(--h-ink)">{pending}</span>
      </div>
      <form onSubmit={add} className="mb-1">
        <input className="hud-input h-9 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="+ Nueva tarea" aria-label="Nueva tarea" />
      </form>
      <div className="hud-scroll max-h-64 overflow-y-auto pr-1">
        {list.map((x) => (
          <div key={x.id} className="hud-row">
            <button
              type="button"
              role="checkbox"
              aria-checked={x.done}
              aria-label={x.text}
              className="hud-check"
              onClick={() => onChange({ ...data, tasks: data.tasks.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)) })}
            >
              {x.done ? "✓" : ""}
            </button>
            <span className={`min-w-0 flex-1 ${x.done ? "text-(--h-mut) line-through" : ""}`}>{x.text}</span>
            <button type="button" className="hud-x" aria-label={`Borrar ${x.text}`} onClick={() => onChange({ ...data, tasks: data.tasks.filter((y) => y.id !== x.id) })}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MoneyPanel({ data }: { data: Data }) {
  const t = today();
  const spent = monthSpent(data);
  const pct = data.budget > 0 ? Math.min(100, (spent / data.budget) * 100) : 0;
  const by = new Map<string, number>();
  data.expenses.filter((e) => e.date.slice(0, 7) === t.slice(0, 7)).forEach((e) => by.set(e.category, (by.get(e.category) ?? 0) + e.amount));
  const cats = [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const max = cats[0]?.[1] ?? 1;
  return (
    <section className="hud-panel">
      <div className="hud-title">Gastos de {monthName(t)}</div>
      <div className="flex items-baseline justify-between">
        <span className="hud-num hud-glow text-2xl">{money(spent)}</span>
        <span className="text-xs text-(--h-mut)">de {money(data.budget)}</span>
      </div>
      <div className="hud-meter mt-2" data-over={spent > data.budget}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 space-y-2">
        {cats.map(([c, v]) => (
          <div key={c} className="text-xs">
            <div className="mb-1 flex justify-between">
              <span className="text-(--h-mut)">{c}</span>
              <span className="hud-num">{money(v)}</span>
            </div>
            <div className="h-1 rounded bg-[rgb(79_227_255/0.08)]">
              <div className="h-1 rounded bg-(--h-blue)" style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {cats.length === 0 && <p className="text-sm text-(--h-mut)">Sin gastos este mes. Dile: &quot;gasté 10 en café&quot;.</p>}
      </div>
    </section>
  );
}

function GymPanel({ data }: { data: Data }) {
  const ws = weekStart(today());
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const done = new Set(weekWorkouts(data).map((w) => w.date));
  const last = [...data.workouts].sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <section className="hud-panel" style={{ animationDelay: "80ms" }}>
      <div className="hud-title">Gimnasio</div>
      <div className="flex items-baseline justify-between">
        <span className="hud-num hud-glow text-2xl">
          {done.size}/{data.gymGoal}
        </span>
        <span className="text-xs text-(--h-mut)">días esta semana</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div key={d} className="text-center">
            <div
              className={`h-7 rounded-sm border ${
                done.has(d) ? "border-(--h-ok) bg-[rgb(82_255_176/0.25)] shadow-[0_0_10px_rgb(82_255_176/0.35)]" : d === today() ? "border-(--h-line-strong)" : "border-(--h-line)"
              }`}
            />
            <span className={`mt-1 block text-[10px] ${d === today() ? "text-(--h-cyan)" : "text-(--h-mut)"}`}>{shortDay(d)}</span>
          </div>
        ))}
      </div>
      {last && (
        <p className="mt-2 text-xs text-(--h-mut)">
          Último: {last.name} · {last.minutes} min
        </p>
      )}
    </section>
  );
}

function NotesPanel({ data, onChange }: PanelProps) {
  return (
    <section className="hud-panel" style={{ animationDelay: "160ms" }}>
      <div className="hud-title">Notas</div>
      {data.notes.length === 0 && <p className="text-sm text-(--h-mut)">Dile: &quot;nota: idea para un video&quot;.</p>}
      <div className="hud-scroll max-h-48 overflow-y-auto pr-1">
        {data.notes.map((n) => (
          <div key={n.id} className="hud-row items-start">
            <span className="mt-0.5 text-(--h-cyan)">›</span>
            <span className="min-w-0 flex-1 text-sm leading-snug">{n.text}</span>
            <button type="button" className="hud-x" aria-label="Borrar nota" onClick={() => onChange({ ...data, notes: data.notes.filter((x) => x.id !== n.id) })}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
