"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// La escena 3D se descarga solo en computadoras (mouse fino, sin "reducir movimiento")
// y después de que la página ya cargó. En celular se muestra una imagen fija.
const Scene = dynamic(() => import("./three/app-icons-scene"), { ssr: false });

export function Hero3D() {
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || calm) return;
    const start = () => setUse3D(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div aria-hidden className="relative aspect-square w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-3d.webp"
        alt=""
        className={`absolute inset-0 size-full object-contain transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"} animate-[float_6s_ease-in-out_infinite]`}
      />
      {use3D && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Scene onReady={() => setTimeout(() => setReady(true), 150)} />
        </div>
      )}
    </div>
  );
}
