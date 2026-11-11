import type { Saas } from "@/lib/types";

type Props = { saas: Pick<Saas, "name" | "emoji" | "color" | "cover_url" | "slug"> & { demo_url?: string | null }; className?: string; bare?: boolean };

// Ventana de navegador con la captura de la app. Si aún no hay captura,
// dibuja una interfaz de ejemplo con el color y el emoji de la app.
export function AppPreview({ saas, className = "", bare = false }: Props) {
  return (
    <div
      className={`overflow-hidden bg-card ${bare ? "" : "rounded-xl border border-line shadow-[0_24px_48px_-20px_rgba(30,64,175,0.25)]"} ${className}`}
    >
      <div className={`flex items-center gap-1.5 border-b border-line ${bare ? "bg-card/70 px-4 py-2.5" : "bg-card px-3 py-2"}`}>
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="ml-2 truncate rounded-md bg-soft px-2 py-0.5 font-ui text-[10px] text-mut">
          {addressOf(saas)}
        </span>
      </div>
      <div className={`relative aspect-[16/10] ${bare ? "lg:aspect-[16/9]" : ""}`}>
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

// Lo que se ve en la barra de direcciones: la demo real si existe.
export function addressOf(saas: { slug: string; demo_url?: string | null }) {
  if (saas.demo_url) {
    try {
      const u = new URL(saas.demo_url, process.env.NEXT_PUBLIC_SITE_URL || "https://juanfracode.vercel.app");
      return `${u.host}${u.pathname === "/" ? "" : u.pathname}`;
    } catch {}
  }
  return `${saas.slug}.vercel.app`;
}

function MockUI({ saas }: { saas: Props["saas"] }) {
  const c = saas.color;
  const bars = [62, 38, 80, 54, 92, 46, 70];
  return (
    <div className="absolute inset-0 flex bg-white">
      <div className="hidden w-[22%] flex-col gap-2 border-r border-slate-100 bg-slate-50/60 p-[4%] sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="text-[min(2.4vw,14px)] leading-none">{saas.emoji}</span>
          <span className="h-1.5 w-2/3 rounded-full bg-slate-300" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 rounded-full" style={{ width: `${70 - i * 10}%`, background: i === 0 ? c : "#e2e8f0" }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[5%] p-[4%]">
        <div className="flex items-center justify-between">
          <span className="h-2 w-1/3 rounded-full bg-slate-800/80" />
          <span className="h-3 w-[18%] rounded-full" style={{ background: c }} />
        </div>
        <div className="grid grid-cols-3 gap-[4%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-slate-100 bg-white p-[8%] shadow-sm">
              <span className="block h-1 w-1/2 rounded-full bg-slate-200" />
              <span className="mt-1.5 block h-2 w-3/4 rounded-full" style={{ background: i === 0 ? c : "#cbd5e1" }} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-[3%] rounded-md border border-slate-100 p-[4%]">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 4 ? c : `${c}40` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
