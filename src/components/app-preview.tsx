import type { Saas } from "@/lib/types";

type Props = { saas: Pick<Saas, "name" | "emoji" | "color" | "cover_url" | "slug">; className?: string };

// Ventana de navegador con la captura de la app. Si aún no hay captura,
// dibuja una interfaz de ejemplo con el color y el emoji de la app.
export function AppPreview({ saas, className = "" }: Props) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-[#0d0f16] shadow-2xl shadow-black/40 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.03] px-3 py-2">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-500">
          {saas.slug}.vercel.app
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        {saas.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={saas.cover_url} alt={`Captura de ${saas.name}`} className="absolute inset-0 size-full object-cover object-top" />
        ) : (
          <MockUI saas={saas} />
        )}
      </div>
    </div>
  );
}

function MockUI({ saas }: { saas: Props["saas"] }) {
  const c = saas.color;
  const bars = [62, 38, 80, 54, 92, 46, 70];
  return (
    <div className="absolute inset-0 flex" style={{ background: `radial-gradient(120% 90% at 100% 0%, ${c}30, transparent 60%)` }}>
      <div className="hidden w-[22%] flex-col gap-2 border-r border-white/5 p-[4%] sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="text-[min(2.4vw,14px)] leading-none">{saas.emoji}</span>
          <span className="h-1.5 w-2/3 rounded-full bg-white/30" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 rounded-full" style={{ width: `${70 - i * 10}%`, background: i === 0 ? c : "rgb(255 255 255 / 0.1)" }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[5%] p-[4%]">
        <div className="flex items-center justify-between">
          <span className="h-2 w-1/3 rounded-full bg-white/40" />
          <span className="h-3 w-[18%] rounded-md" style={{ background: c }} />
        </div>
        <div className="grid grid-cols-3 gap-[4%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-white/5 bg-white/[0.04] p-[8%]">
              <span className="block h-1 w-1/2 rounded-full bg-white/15" />
              <span className="mt-1.5 block h-2 w-3/4 rounded-full" style={{ background: i === 0 ? c : "rgb(255 255 255 / 0.35)" }} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-[3%] rounded-md border border-white/5 bg-white/[0.03] p-[4%]">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 4 ? c : `${c}55` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
