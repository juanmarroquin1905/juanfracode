"use client";

import { useEffect, useRef, useState } from "react";
import { bucketTitle, money, type Bucket, type Grain } from "./utils";

export const INCOME = "#1baf7a";
export const EXPENSE = "#eb6834";

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

// Tope del eje: 4 rayas con números redondos (ej: 0, 500, 1000, 1500, 2000).
function niceMax(v: number) {
  if (v <= 0) return 100;
  const raw = v / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p * 4;
}

// Barras de ingresos y egresos lado a lado, una pareja por día / semana / mes.
export function FlowChart({ data, grain, currency }: { data: Bucket[]; grain: Grain; currency: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 220;
  const pad = { t: 10, r: 4, b: 24, l: 52 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = H - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.ingreso, d.egreso)), 0));
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const step = innerW / data.length;
  const barW = Math.max(2, Math.min(18, (step - 6) / 2));
  const labelEvery = Math.ceil(data.length / Math.max(1, Math.floor(innerW / 44)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const h = hover !== null ? data[hover] : null;

  const bar = (x: number, v: number, color: string) => {
    if (v <= 0) return null;
    const top = y(v);
    const hh = Math.max(2, pad.t + innerH - top);
    const r = Math.min(4, barW / 2, hh);
    const bottom = pad.t + innerH;
    // Solo las esquinas de arriba redondeadas; la base queda pegada al eje.
    const d = `M${x},${bottom} V${bottom - hh + r} Q${x},${bottom - hh} ${x + r},${bottom - hh} H${x + barW - r} Q${x + barW},${bottom - hh} ${x + barW},${bottom - hh + r} V${bottom} Z`;
    return <path d={d} fill={color} />;
  };

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label="Gráfico de ingresos y egresos" className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#c9d5ec" : "#e9eef8"} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-mut font-ui text-[10.5px] tabular-nums">
                {money(t, currency, true)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + step * i + step / 2;
            return (
              <g key={d.key}>
                {hover === i && <rect x={pad.l + step * i} y={pad.t} width={step} height={innerH} fill="#eef4ff" rx={6} />}
                {bar(cx - barW - 1, d.ingreso, INCOME)}
                {bar(cx + 1, d.egreso, EXPENSE)}
                {i % labelEvery === 0 && (
                  <text x={cx} y={H - 6} textAnchor="middle" className="fill-mut font-ui text-[10.5px]">
                    {d.label}
                  </text>
                )}
                <rect
                  x={pad.l + step * i}
                  y={0}
                  width={step}
                  height={H}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setHover(i)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-max min-w-44 rounded-xl border border-line bg-white px-3 py-2.5 font-ui text-xs shadow-lg"
          style={{
            left: Math.min(Math.max(pad.l + step * hover + step / 2 - 88, 0), Math.max(0, width - 180)),
          }}
        >
          <p className="mb-1.5 font-semibold text-ink">{bucketTitle(h, grain)}</p>
          <Row color={INCOME} label="Ingresos" value={money(h.ingreso, currency)} />
          <Row color={EXPENSE} label="Egresos" value={money(h.egreso, currency)} />
          <div className="mt-1.5 flex justify-between gap-4 border-t border-line pt-1.5 text-ink">
            <span>Balance</span>
            <span className="font-semibold tabular-nums">{money(h.ingreso - h.egreso, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-mut">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}

export type Slice = { id: string; label: string; emoji: string; color: string; value: number };

// Dona: cuánto se fue a cada categoría. Al pasar el mouse resalta una.
export function Donut({ slices, currency, total, caption }: { slices: Slice[]; currency: string; total: number; caption: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const size = 168;
  const r = 66;
  const sw = 22;
  const C = 2 * Math.PI * r;
  const active = slices.find((s) => s.id === hover);
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={caption} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef4ff" strokeWidth={sw} />
          {total > 0 &&
            slices.map((s) => {
              const len = (s.value / total) * C;
              const gap = slices.length > 1 ? Math.min(2, len / 2) : 0;
              const el = (
                <circle
                  key={s.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.id ? sw + 4 : sw}
                  strokeDasharray={`${Math.max(0, len - gap)} ${C}`}
                  strokeDashoffset={-acc}
                  opacity={hover && hover !== s.id ? 0.35 : 1}
                  className="cursor-pointer transition-[opacity,stroke-width] duration-150"
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                />
              );
              acc += len;
              return el;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-ui text-[11px] text-mut">{active ? `${active.emoji} ${active.label}` : caption}</p>
            <p className="text-lg font-semibold tracking-tight text-ink tabular-nums">
              {money(active ? active.value : total, currency, true)}
            </p>
            {active && total > 0 && (
              <p className="font-ui text-[11px] text-mut">{Math.round((active.value / total) * 100)}%</p>
            )}
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-1 font-ui text-[13px]">
        {slices.length === 0 && <li className="text-mut">Aún no hay movimientos este mes.</li>}
        {slices.map((s) => (
          <li
            key={s.id}
            onMouseEnter={() => setHover(s.id)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${hover === s.id ? "bg-soft" : ""}`}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-ink">
              {s.emoji} {s.label}
            </span>
            <span className="ml-auto shrink-0 text-mut tabular-nums">{total > 0 ? Math.round((s.value / total) * 100) : 0}%</span>
            <span className="w-24 shrink-0 text-right text-ink tabular-nums">{money(s.value, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
