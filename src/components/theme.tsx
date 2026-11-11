"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Modo nocturno de la vitrina.
   - Se guarda la elección en localStorage ("jf-theme": "light" | "dark").
   - Si la persona nunca eligió, se sigue la preferencia del sistema.
   - Las apps demo (/apps/*) tienen su propio estilo y se quedan siempre igual. */

const KEY = "jf-theme";

const isApp = (path: string) => path === "/apps" || path.startsWith("/apps/");

function wantsDark() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved === "dark";
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(path: string) {
  document.documentElement.classList.toggle("dark", !isApp(path) && wantsDark());
}

/* Corre antes de pintar la página (carga directa o recarga) para que no parpadee. */
const SCRIPT = `try{var p=location.pathname,s=localStorage.getItem("${KEY}"),d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d&&!(p==="/apps"||p.indexOf("/apps/")===0))document.documentElement.classList.add("dark")}catch(e){}`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}

/* Mantiene el tema al navegar entre páginas y si cambia la preferencia del sistema. */
export function ThemeSync() {
  const path = usePathname();
  useEffect(() => {
    apply(path);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(path);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [path]);
  return null;
}

/* Botón luna / sol. El ícono se muestra con CSS, así no depende del estado. */
export function ThemeToggle() {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {}
    document.documentElement.classList.toggle("dark", dark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre modo claro y nocturno"
      title="Modo claro / nocturno"
      className="press grid size-9 place-items-center rounded-full text-mut transition-[color,transform] duration-150 hover:text-ink"
    >
      {/* Luna: se ve en modo claro */}
      <svg viewBox="0 0 24 24" className="size-[18px] dark:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
      {/* Sol: se ve en modo nocturno */}
      <svg viewBox="0 0 24 24" className="hidden size-[18px] dark:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
