"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/lista-espera/actions";

// Formulario corto de la lista de espera: nombre + correo. "dark" = sobre fondo oscuro.
export function WaitlistForm({ dark = false, id }: { dark?: boolean; id?: string }) {
  const [state, action, saving] = useActionState<WaitlistState, FormData>(joinWaitlist, null);

  if (state?.ok) {
    return (
      <div
        id={id}
        role="status"
        className={`mx-auto max-w-xl rounded-2xl px-5 py-4 text-center ${dark ? "bg-white/10 text-white" : "card text-ink"}`}
      >
        <p className="font-semibold">¡Listo, ya estás en la lista! 🎬</p>
        <p className={`mt-1 text-sm ${dark ? "text-slate-300" : "text-mut"}`}>Te aviso por correo apenas salga.</p>
      </div>
    );
  }

  const field = dark
    ? "w-full rounded-full border border-white/15 bg-white/10 px-4 py-3 text-base text-white outline-none placeholder:text-slate-400 focus:border-white/40"
    : "input !rounded-full !py-3";

  return (
    <form id={id} action={action} className="mx-auto w-full max-w-xl scroll-mt-28">
      <div className="grid gap-2 sm:grid-cols-[1fr_1.3fr_auto]">
        <label className="sr-only" htmlFor={`${id}-name`}>Nombre</label>
        <input id={`${id}-name`} name="name" required autoComplete="given-name" placeholder="Tu nombre" className={field} />
        <label className="sr-only" htmlFor={`${id}-email`}>Correo</label>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" placeholder="Tu correo" className={field} />
        <button disabled={saving} className={dark ? "press rounded-full bg-white px-5 py-3 text-sm font-semibold text-night disabled:opacity-60" : "btn !py-3"}>
          {saving ? "Guardando…" : "Unirme a la lista"}
        </button>
      </div>
      <label className={`mt-3 flex items-center justify-center gap-2 text-xs ${dark ? "text-slate-400" : "text-mut"}`}>
        <input type="checkbox" name="consent" className="size-3.5 accent-[#1d4ed8]" />
        Quiero recibir también recursos gratis y novedades por correo
      </label>
      {state?.error && <p className={`mt-2 text-center text-sm ${dark ? "text-red-300" : "text-red-600"}`}>{state.error}</p>}
    </form>
  );
}
