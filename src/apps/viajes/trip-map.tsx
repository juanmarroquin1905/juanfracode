"use client";

import { useEffect, useRef, useState } from "react";

// Mapa liviano sin librerías: arma el mapa con "baldosas" de OpenStreetMap
// (estilo Voyager de CARTO) y dibuja encima los lugares numerados y la ruta.
// Se puede arrastrar y hacer zoom con los botones.

export type MapPoint = { id: string; lat: number; lng: number; label: string; title: string; color: string };

const TILE = 256;
const tileUrl = (z: number, x: number, y: number) =>
  `https://${"abcd"[(x + y) % 4]}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png`;

const worldX = (lng: number, z: number) => ((lng + 180) / 360) * TILE * 2 ** z;
const worldY = (lat: number, z: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z;
};

/** El zoom más cercano en el que entran todos los puntos. */
function fitZoom(points: MapPoint[], w: number, h: number) {
  if (points.length <= 1) return 13;
  for (let z = 16; z > 2; z--) {
    const xs = points.map((p) => worldX(p.lng, z));
    const ys = points.map((p) => worldY(p.lat, z));
    if (Math.max(...xs) - Math.min(...xs) <= w - 70 && Math.max(...ys) - Math.min(...ys) <= h - 70) return z;
  }
  return 2;
}

export function TripMap({ points, route = false, height = 300 }: { points: MapPoint[]; route?: boolean; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [zoomDelta, setZoomDelta] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const h = height;
  const baseZoom = w ? fitZoom(points, w, h) : 13;
  const z = Math.max(2, Math.min(18, baseZoom + zoomDelta));
  const scale = 2 ** (z - baseZoom);

  // Centro: el medio de todos los puntos, más lo que hayas arrastrado.
  let cx = 0;
  let cy = 0;
  if (points.length) {
    const xs = points.map((p) => worldX(p.lng, z));
    const ys = points.map((p) => worldY(p.lat, z));
    cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  }
  cx -= pan.x * scale;
  cy -= pan.y * scale;
  const left = cx - w / 2;
  const top = cy - h / 2;

  const tiles: { key: string; src: string; x: number; y: number }[] = [];
  if (w && points.length) {
    const n = 2 ** z;
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + w) / TILE); tx++) {
      for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + h) / TILE); ty++) {
        if (ty < 0 || ty >= n) continue;
        const wx = ((tx % n) + n) % n;
        tiles.push({ key: `${z}-${tx}-${ty}`, src: tileUrl(z, wx, ty), x: tx * TILE - left, y: ty * TILE - top });
      }
    }
  }
  const pos = points.map((p) => ({ ...p, x: worldX(p.lng, z) - left, y: worldY(p.lat, z) - top }));

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setPan({ x: d.px + dx / scale, y: d.py + dy / scale });
  };
  const onUp = () => {
    if (drag.current && !drag.current.moved) setOpen(null);
    drag.current = null;
  };

  const zoomBy = (n: number) => setZoomDelta((v) => Math.max(2 - baseZoom, Math.min(18 - baseZoom, v + n)));
  const moved = zoomDelta !== 0 || pan.x !== 0 || pan.y !== 0;

  return (
    <div
      ref={box}
      className="vj-map relative touch-none overflow-hidden select-none"
      style={{ height }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {tiles.map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={t.key} src={t.src} alt="" draggable={false} onError={(e) => (e.currentTarget.style.visibility = "hidden")} className="vj-tile absolute" style={{ left: t.x, top: t.y, width: TILE, height: TILE }} />
      ))}

      {points.length === 0 && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-(--vj-mut)">
          Agrega lugares al itinerario y búscalos en el mapa para verlos aquí.
        </div>
      )}

      {route && pos.length > 1 && (
        <svg className="pointer-events-none absolute inset-0" width={w} height={h}>
          <polyline
            points={pos.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#1d2b4f"
            strokeWidth={2.5}
            strokeDasharray="2 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {pos.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setOpen(open === p.id ? null : p.id)}
          className="vj-pin absolute"
          style={{ left: p.x, top: p.y, background: p.color, zIndex: open === p.id ? 3 : 2 }}
          aria-label={p.title}
        >
          {p.label}
        </button>
      ))}
      {pos
        .filter((p) => p.id === open)
        .map((p) => (
          <div key="tip" className="vj-tip absolute" style={{ left: p.x, top: p.y }}>
            {p.title}
          </div>
        ))}

      <div className={`absolute top-2.5 right-2.5 z-10 flex-col ${points.length ? "flex" : "hidden"} overflow-hidden rounded-lg border border-(--vj-line) bg-(--vj-paper) shadow-sm`}>
        <button type="button" onClick={() => zoomBy(1)} aria-label="Acercar" className="vj-press grid size-8 place-items-center text-lg leading-none">
          +
        </button>
        <button type="button" onClick={() => zoomBy(-1)} aria-label="Alejar" className="vj-press grid size-8 place-items-center border-t border-(--vj-line) text-lg leading-none">
          −
        </button>
      </div>
      {moved && (
        <button
          type="button"
          onClick={() => {
            setZoomDelta(0);
            setPan({ x: 0, y: 0 });
          }}
          className="vj-press absolute top-2.5 left-2.5 z-10 rounded-full border border-(--vj-line) bg-(--vj-paper) px-3 py-1 text-xs font-semibold shadow-sm"
        >
          Centrar
        </button>
      )}
      <div className="absolute right-1 bottom-0.5 z-10 rounded bg-white/70 px-1 text-[10px] text-[#555]">
        ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{" "}
        ·{" "}
        <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">
          CARTO
        </a>
      </div>
    </div>
  );
}
