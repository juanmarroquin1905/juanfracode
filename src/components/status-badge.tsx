import { STATUS_LABEL, type SaasStatus } from "@/lib/types";

const STYLE: Record<SaasStatus, string> = {
  en_vivo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  en_construccion: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  pausado: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

export function StatusBadge({ status }: { status: SaasStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLE[status]}`}>
      <span className={`size-1.5 rounded-full bg-current ${status === "en_vivo" ? "animate-pulse" : ""}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
