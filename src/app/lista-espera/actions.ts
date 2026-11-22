"use server";

import { isDemo } from "@/lib/data";
import { createPublicClient } from "@/lib/supabase/public";

export type WaitlistState = { error?: string; ok?: boolean } | null;

// Etiqueta con la que se guarda en la tabla de contactos (columna "apps" en /admin/contactos).
const TAG = "lista-espera-studio";
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Lista de espera del Studio. Usa la misma función register_lead de los contactos,
// así que no hace falta tocar la base de datos.
export async function joinWaitlist(_: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const consent = formData.get("consent") === "on";

  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL.test(email)) return { error: "Revisa tu correo." };

  if (!isDemo) {
    const { error } = await createPublicClient().rpc("register_lead", {
      p_name: name,
      p_email: email,
      p_phone: "",
      p_social: "",
      p_consent: consent,
      p_slug: TAG,
    });
    if (error) return { error: "No pudimos guardar tus datos. Inténtalo otra vez." };
  }
  return { ok: true };
}
