import { STATUS_LABEL, type SaasStatus } from "@/lib/types";

const STYLE: Record<SaasStatus, string> = {
  en_vivo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  en_construccion: "border-amber-200 bg-amber-50 text-amber-700",
  pausado: "border-line bg-soft text-mut",
};

export function StatusBadge({ status }: { status: SaasStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLE[status]}`}>
      <span className={`size-1.5 rounded-full bg-current ${status === "en_vivo" ? "animate-pulse" : ""}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
