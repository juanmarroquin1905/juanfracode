"use server";

import { cookies } from "next/headers";
import { isDemo } from "@/lib/data";
import { LEAD_COOKIE, LEAD_COOKIE_MAX_AGE } from "@/lib/lead";
import { createPublicClient } from "@/lib/supabase/public";

export type LeadState = { error?: string; ok?: boolean } | null;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function registerLead(_: LeadState, formData: FormData): Promise<LeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const social = String(formData.get("social") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const slug = String(formData.get("slug") ?? "");

  if (!name) return { error: "Escribe tu nombre." };
  if (!EMAIL.test(email)) return { error: "Revisa tu correo." };
  if (phone.replace(/\D/g, "").length < 7) return { error: "Escribe tu WhatsApp con código de país." };

  if (!isDemo) {
    const { error } = await createPublicClient().rpc("register_lead", {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_social: social,
      p_consent: consent,
      p_slug: slug,
    });
    if (error) return { error: "No pudimos guardar tus datos. Inténtalo otra vez." };
  }

  (await cookies()).set(LEAD_COOKIE, "1", {
    maxAge: LEAD_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return { ok: true };
}
