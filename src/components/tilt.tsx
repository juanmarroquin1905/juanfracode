"use client";

import { useRef } from "react";

// Inclina su contenido en 3D siguiendo el mouse, con un brillo que se mueve.
// En celular (o con "reducir movimiento") no hace nada.
export function Tilt({ children, className = "", max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.dataset.active = "true";
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.dataset.active = "false";
  };

  return (
    <div className="[perspective:1000px]">
      <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>
        {children}
        <span aria-hidden className="tilt-glare" />
      </div>
    </div>
  );
}
