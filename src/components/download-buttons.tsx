"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { registerLead, type LeadState } from "@/app/descargar/actions";
import { BRAND } from "@/config/brand";

type Action = "vercel" | "repo" | "zip";
type Props = { slug: string; name: string; hasLead: boolean; actions: Action[]; autoOpen?: Action | null };

const LABELS: Record<Action, string> = {
  vercel: "▲ Deploy en Vercel",
  repo: "Plantilla en GitHub",
  zip: "↓ Descargar .zip",
};

// Botones de descarga. La primera vez piden nombre, correo y WhatsApp.
export function DownloadButtons({ slug, name, hasLead, actions, autoOpen = null }: Props) {
  const [pending, setPending] = useState<Action | null>(hasLead ? null : autoOpen);
  const [state, formAction, saving] = useActionState<LeadState, FormData>(registerLead, null);
  const dialog = useRef<HTMLDialogElement>(null);

  const go = (a: Action) => {
    window.location.assign(new URL(`/descargar/${slug}?a=${a}`, window.location.origin).toString());
  };

  useEffect(() => {
    if (pending && !state?.ok) dialog.current?.showModal();
  }, [pending, state?.ok]);

  useEffect(() => {
    if (state?.ok && pending) {
      dialog.current?.close();
      go(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  const click = (a: Action) => (hasLead || state?.ok ? go(a) : setPending(a));

  return (
    <>
      {actions.map((a) => (
        <button key={a} type="button" onClick={() => click(a)} className={`${a === "vercel" ? "btn" : "btn-ghost"} w-full`}>
          {LABELS[a]}
        </button>
      ))}

      <dialog
        ref={dialog}
        onClose={() => !state?.ok && setPending(null)}
        className="m-auto w-[min(440px,calc(100%-32px))] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <p className="text-sm font-semibold text-accent">Plantilla gratis</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Descarga {name}</h2>
            <p className="mt-1 text-sm text-slate-500">Déjame tus datos y te llevo a la plantilla. Solo te los pido una vez.</p>
          </div>
          <div>
            <label className="label" htmlFor="lead-name">Nombre</label>
            <input id="lead-name" name="name" required autoComplete="name" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="lead-email">Correo</label>
            <input id="lead-email" name="email" type="email" required autoComplete="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="lead-phone">WhatsApp</label>
            <input id="lead-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+51 999 999 999" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="lead-social">
              Tu TikTok o Instagram <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input id="lead-social" name="social" placeholder="@tuusuario" className="input" />
          </div>
          <label className="flex items-start gap-2.5 text-sm text-slate-600">
            <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-[#6d4aff]" />
            Acepto recibir novedades y nuevas apps de {BRAND.name} por correo o WhatsApp.
          </label>
          {state?.error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => dialog.current?.close()} className="btn-ghost flex-1">
              Cancelar
            </button>
            <button className="btn flex-[2]" disabled={saving}>
              {saving ? "Un momento…" : "Ir a la plantilla"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
