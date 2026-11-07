"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { SaasStatus } from "@/lib/types";

export type FormState = { error: string } | null;

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
const featureLines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
const url = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function saveSaas(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemo) return { error: "Modo demo: conecta Supabase para poder guardar." };
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  if (!name || !slug) return { error: "Ponle un nombre al SaaS." };

  let cover_url = url(formData.get("cover_url"));
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) return { error: "La imagen pesa más de 5 MB." };
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portadas").upload(path, file, { contentType: file.type });
    if (error) return { error: `No se pudo subir la imagen: ${error.message}` };
    cover_url = supabase.storage.from("portadas").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    slug,
    name,
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim() || "Otro",
    status: String(formData.get("status") ?? "en_construccion") as SaasStatus,
    emoji: String(formData.get("emoji") ?? "").trim() || "🚀",
    color: String(formData.get("color") ?? "#7c3aed"),
    cover_url,
    demo_url: url(formData.get("demo_url")),
    repo_url: url(formData.get("repo_url")),
    zip_url: url(formData.get("zip_url")),
    video_url: url(formData.get("video_url")),
    stack: lines(formData.get("stack")),
    env_vars: lines(formData.get("env_vars")),
    features: featureLines(formData.get("features")),
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from("saas").update(row).eq("id", id)
    : await supabase.from("saas").insert(row);
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un SaaS con esa dirección (slug). Usa otra." };
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/saas/${slug}`);
  redirect("/admin");
}

export async function deleteSaas(formData: FormData) {
  if (isDemo) return;
  const supabase = await createClient();
  await supabase.from("saas").delete().eq("id", String(formData.get("id")));
  revalidatePath("/");
  redirect("/admin");
}
