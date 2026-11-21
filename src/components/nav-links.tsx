"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, activeNav } from "@/config/nav";

// Enlaces del menú con la sección actual marcada.
// "bar" = dentro de la barra (escritorio); "row" = fila debajo de la barra (celular).
export function NavLinks({ variant }: { variant: "bar" | "row" }) {
  const current = activeNav(usePathname() ?? "/");
  return NAV.map((item) => {
    const on = current === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={on ? "page" : undefined}
        className={
          variant === "bar"
            ? `rounded-full px-3 py-1.5 transition-colors ${on ? "bg-soft font-semibold text-ink" : "text-mut hover:text-ink"}`
            : `shrink-0 rounded-full px-3 py-1.5 font-ui text-[13px] transition-colors ${
                on ? "bg-night font-semibold text-white" : "glass !bg-card/85 text-mut"
              }`
        }
      >
        {item.label}
      </Link>
    );
  });
}
