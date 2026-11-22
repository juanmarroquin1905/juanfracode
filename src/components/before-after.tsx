"use client";

import { useEffect, useRef, useState } from "react";

// Antes / después tipo persiana: los dos videos corren a la vez y la persona
// arrastra la línea para ver el video crudo (izquierda) o el editado (derecha).
export function BeforeAfter() {
  const box = useRef<HTMLDivElement>(null);
  const before = useRef<HTMLVideoElement>(null);
  const after = useRef<HTMLVideoElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);
  const [playing, setPlaying] = useState(true);

  // Mantiene el video "antes" al mismo segundo que el "después".
  useEffect(() => {
    const a = after.current;
    const b = before.current;
    if (!a || !b) return;
    const sync = () => {
      if (Math.abs(b.currentTime - a.currentTime) > 0.12) b.currentTime = a.currentTime;
    };
    const onPlay = () => b.play().catch(() => {});
    const onPause = () => b.pause();
    a.addEventListener("timeupdate", sync);
    a.addEventListener("seeked", sync);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onPause);
    a.addEventListener("playing", onPlay);
    return () => {
      a.removeEventListener("timeupdate", sync);
      a.removeEventListener("seeked", sync);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onPause);
      a.removeEventListener("playing", onPlay);
    };
  }, []);

  function moveTo(clientX: number) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  function toggle() {
    const a = after.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div
        ref={box}
        className="relative aspect-[9/16] cursor-ew-resize touch-pan-y overflow-hidden rounded-[22px] bg-[#060c1c] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.6)] select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <video
          ref={after}
          src="/vsl/despues.mp4"
          poster="/vsl/despues.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Video editado con Juanfra Studio"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <video
          ref={before}
          src="/vsl/antes.mp4"
          poster="/vsl/antes.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Video crudo, sin editar"
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />

        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 font-ui text-[11px] font-semibold text-white backdrop-blur">
          Antes
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 font-ui text-[11px] font-semibold text-white">
          Después
        </span>

        {/* Línea y agarradera */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Desliza para comparar antes y después"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-bold text-night shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          style={{ left: `${pos}%` }}
        >
          ‹ ›
        </div>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Reproducir"}
          className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-black/60 text-sm text-white backdrop-blur"
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>
      <p className="mt-3 text-center font-ui text-xs text-mut">Arrastra la línea de izquierda a derecha para ver el cambio</p>
    </div>
  );
}
