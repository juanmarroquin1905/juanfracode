import type { Saas } from "@/lib/types";

export function SaasLogo({ saas, size = "md" }: { saas: Pick<Saas, "emoji" | "color" | "name">; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "size-16 text-3xl rounded-2xl" : "size-11 text-xl rounded-xl";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border border-black/5 ${cls}`}
      style={{ background: `linear-gradient(135deg, ${saas.color}33, ${saas.color}12)` }}
    >
      {saas.emoji}
    </span>
  );
}
