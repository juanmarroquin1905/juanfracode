"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { addDays, fromISO, monthShort, startOfWeek, toISO, today } from "./utils";

export const ACCENT = "#c6f24e"; // verde lima, el color de la app

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// Tope del eje: 4 rayas con números redondos (ej: 0, 25, 50, 75, 100).
function niceRange(min: number, max: number, fromZero: boolean) {
  const lo = fromZero ? 0 : min;
  const span = Math.max(max - lo, max * 0.1, max === 0 ? 100 : 1);
  const raw = span / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  const start = fromZero ? 0 : Math.max(0, Math.floor(min / step) * step - step);
  const end = Math.max(start + step * 4, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let t = start; t <= end + 1e-9; t += step) ticks.push(t);
  return { start, end, ticks };
}

function Tooltip({ left, children }: { left: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-max min-w-40 rounded-xl border border-[#2a2f39] bg-[#171a20] px-3 py-2.5 font-ui text-xs text-[#e8ebf0] shadow-2xl"
      style={{ left }}
    >
      {children}
    </div>
  );
}

export type BarDatum = { key: string; label: string; value: number; tip: ReactNode };

// Barras verticales (ej: volumen por semana). Pasa el dedo o el mouse para ver el detalle.
export function BarChart({ data, color = ACCENT, fmt, label }: { data: BarDatum[]; color?: string; fmt: (n: number) => string; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 250;
  const pad = { t: 10, r: 4, b: 24, l: 48 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = H - pad.t - pad.b;
  const { end, ticks } = niceRange(0, Math.max(...data.map((d) => d.value), 0), true);
  const y = (v: number) => pad.t + innerH - (v / end) * innerH;
  const step = innerW / data.length;
  const barW = Math.max(3, Math.min(26, step - 8));
  const labelEvery = Math.ceil(data.length / Math.max(1, Math.floor(innerW / 50)));
  const bottom = pad.t + innerH;

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label={label} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#363c47" : "#22262e"} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[#7d8696] font-ui text-[10.5px] tabular-nums">
                {fmt(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.l + step * i + (step - barW) / 2;
            const hh = d.value > 0 ? Math.max(2, bottom - y(d.value)) : 0;
            const r = Math.min(5, barW / 2, hh);
            const last = i === data.length - 1;
            return (
              <g key={d.key}>
                {hover === i && <rect x={pad.l + step * i} y={pad.t} width={step} height={innerH} fill="#1a1e25" rx={6} />}
                {hh > 0 && (
                  <path
                    d={`M${x},${bottom} V${bottom - hh + r} Q${x},${bottom - hh} ${x + r},${bottom - hh} H${x + barW - r} Q${x + barW},${bottom - hh} ${x + barW},${bottom - hh + r} V${bottom} Z`}
                    fill={color}
                    opacity={last ? 1 : 0.78}
                  />
                )}
                {i % labelEvery === (data.length - 1) % labelEvery && (
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="fill-[#7d8696] font-ui text-[10.5px]">
                    {d.label}
                  </text>
                )}
                <rect x={pad.l + step * i} y={0} width={step} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tooltip left={Math.min(Math.max(pad.l + step * hover + step / 2 - 80, 0), Math.max(0, width - 170))}>{data[hover].tip}</Tooltip>
      )}
    </div>
  );
}

export type LinePoint = { key: string; date: string; value: number; record?: boolean; tip: ReactNode };

// Línea de progreso de un ejercicio. Los puntos grandes son récords personales.
export function LineChart({ data, color = ACCENT, fmt, label }: { data: LinePoint[]; color?: string; fmt: (n: number) => string; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 240;
  const pad = { t: 14, r: 14, b: 24, l: 48 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = H - pad.t - pad.b;
  const values = data.map((d) => d.value);
  const { start, end, ticks } = niceRange(values.length ? Math.min(...values) : 0, Math.max(...values, 0), false);
  const y = (v: number) => pad.t + innerH - ((v - start) / (end - start || 1)) * innerH;
  // Eje X por fecha real, así los huecos sin entrenar se notan.
  const t0 = data.length ? fromISO(data[0].date).getTime() : 0;
  const t1 = data.length ? fromISO(data[data.length - 1].date).getTime() : 1;
  const x = (date: string) => (data.length < 2 ? pad.l + innerW / 2 : pad.l + ((fromISO(date).getTime() - t0) / (t1 - t0 || 1)) * innerW);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(d.date).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = data.length > 1 ? `${path} L${x(data[data.length - 1].date)},${pad.t + innerH} L${x(data[0].date)},${pad.t + innerH} Z` : "";

  // Etiquetas de mes en el eje X.
  const months: { x: number; label: string }[] = [];
  if (data.length > 1) {
    const d = fromISO(data[0].date);
    for (let m = new Date(d.getFullYear(), d.getMonth() + 1, 1); m.getTime() <= t1; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
      months.push({ x: x(toISO(m)), label: monthShort(m.getMonth()) });
    }
  }

  const nearest = (px: number) => {
    let best = 0;
    data.forEach((d, i) => {
      if (Math.abs(x(d.date) - px) < Math.abs(x(data[best].date) - px)) best = i;
    });
    return best;
  };
  const h = hover !== null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && data.length > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={label}
          className="block touch-pan-y"
          onMouseMove={(e) => setHover(nearest(e.clientX - e.currentTarget.getBoundingClientRect().left))}
          onClick={(e) => setHover(nearest(e.clientX - e.currentTarget.getBoundingClientRect().left))}
        >
          <defs>
            <linearGradient id="gym-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.18" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#22262e" />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[#7d8696] font-ui text-[10.5px] tabular-nums">
                {fmt(t)}
              </text>
            </g>
          ))}
          {months.map((m) => (
            <text key={m.label + m.x} x={m.x} y={H - 6} textAnchor="middle" className="fill-[#7d8696] font-ui text-[10.5px]">
              {m.label}
            </text>
          ))}
          {area && <path d={area} fill="url(#gym-area)" />}
          <path d={path} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
          {h && <line x1={x(h.date)} x2={x(h.date)} y1={pad.t} y2={pad.t + innerH} stroke="#3a404b" strokeDasharray="3 3" />}
          {data.map((d, i) =>
            d.record || hover === i ? (
              <circle key={d.key} cx={x(d.date)} cy={y(d.value)} r={hover === i ? 5.5 : 4} fill={d.record ? "#0d0f12" : color} stroke={color} strokeWidth={2} />
            ) : null,
          )}
        </svg>
      )}
      {h && hover !== null && <Tooltip left={Math.min(Math.max(x(h.date) - 80, 0), Math.max(0, width - 180))}>{h.tip}</Tooltip>}
    </div>
  );
}

// Calendario tipo GitHub: un cuadrito por día, más oscuro si entrenaste más.
export function Heatmap({ days, weeks = 20, color = ACCENT }: { days: Map<string, { count: number; tip: string }>; weeks?: number; color?: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const end = startOfWeek(fromISO(today()));
  const first = addDays(end, -7 * (weeks - 1));
  const t = today();
  const cols = Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, d) => toISO(addDays(first, w * 7 + d))));
  const cell = 14;
  const gap = 3;
  const info = hover ? days.get(hover) : null;
  return (
    <div>
      <div className="pb-1">
        <svg
          viewBox={`0 0 ${28 + weeks * (cell + gap)} ${18 + 7 * (cell + gap)}`}
          role="img"
          aria-label="Calendario de entrenamientos"
          className="block h-auto w-full max-w-[620px]"
        >
          {["L", "", "M", "", "V", "", "D"].map((l, i) => (
            <text key={i} x={0} y={18 + i * (cell + gap) + cell / 2} dy="0.32em" className="fill-[#7d8696] font-ui text-[10px]">
              {l}
            </text>
          ))}
          {cols.map((col, w) => (
            <g key={w}>
              {fromISO(col[0]).getDate() <= 7 && (
                <text x={28 + w * (cell + gap)} y={10} className="fill-[#7d8696] font-ui text-[10px]">
                  {monthShort(fromISO(col[0]).getMonth())}
                </text>
              )}
              {col.map((d, i) => {
                const n = days.get(d)?.count ?? 0;
                const future = d > t;
                return (
                  <rect
                    key={d}
                    x={28 + w * (cell + gap)}
                    y={18 + i * (cell + gap)}
                    width={cell}
                    height={cell}
                    rx={3.5}
                    fill={future ? "transparent" : n === 0 ? "#1b1f26" : color}
                    opacity={n === 0 ? 1 : Math.min(1, 0.45 + n * 0.3)}
                    stroke={d === t ? "#f4f6f8" : hover === d ? color : "none"}
                    strokeWidth={1.5}
                    onMouseEnter={() => setHover(d)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover(d)}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-1 min-h-4 font-ui text-xs text-[#7d8696]">{hover ? (info ? info.tip : `${hover === t ? "Hoy" : "Ese día"}: descanso`) : "Pasa el dedo o el mouse por un día"}</p>
    </div>
  );
}
