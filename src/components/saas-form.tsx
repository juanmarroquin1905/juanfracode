"use client";

import { useActionState } from "react";
import { saveSaas, type FormState } from "@/app/admin/actions";
import { STATUS_LABEL, type Saas } from "@/lib/types";

const DEFAULT_ENV = "NEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY";

export function SaasForm({ saas, demo }: { saas?: Saas; demo: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSaas, null);
  return (
    <form action={action} className="space-y-8">
      {saas && <input type="hidden" name="id" value={saas.id} />}
      <input type="hidden" name="cover_url" value={saas?.cover_url ?? ""} />

      <Section title="Lo básico">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label="Nombre" name="name" defaultValue={saas?.name} required />
          <Field label="Dirección (slug)" name="slug" defaultValue={saas?.slug} hint="Ej: mi-saas. Si lo dejas vacío, se arma con el nombre." />
        </div>
        <Field label="Frase corta" name="tagline" defaultValue={saas?.tagline} hint="Qué hace, en una línea." />
        <div>
          <label className="label" htmlFor="description">Descripción</label>
          <textarea id="description" name="description" rows={5} defaultValue={saas?.description} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Categoría" name="category" defaultValue={saas?.category} hint="Ej: E-commerce" />
          <div>
            <label className="label" htmlFor="status">Estado</label>
            <select id="status" name="status" defaultValue={saas?.status ?? "en_construccion"} className="input">
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <Field label="Emoji" name="emoji" defaultValue={saas?.emoji ?? "🚀"} />
          <div>
            <label className="label" htmlFor="color">Color</label>
            <input id="color" name="color" type="color" defaultValue={saas?.color ?? "#7c3aed"} className="input h-[46px] p-1" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cover">Captura o portada</label>
          <input id="cover" name="cover" type="file" accept="image/*" className="input file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-white" />
          {saas?.cover_url && <p className="hint">Ya tiene una imagen. Sube otra solo si quieres cambiarla.</p>}
        </div>
      </Section>

      <Section title="Enlaces y plantilla">
        <Field label="Demo en vivo" name="demo_url" type="url" defaultValue={saas?.demo_url} hint="Ej: https://mi-saas.vercel.app" />
        <Field
          label="Repo plantilla en GitHub"
          name="repo_url"
          type="url"
          defaultValue={saas?.repo_url}
          hint="Debe ser público. Con esto aparece el botón “Deploy en Vercel” (y, si el stack incluye Supabase, Vercel ofrece conectarlo solo)."
        />
        <Field label="Descarga .zip (opcional)" name="zip_url" type="url" defaultValue={saas?.zip_url} hint="Ej: el .zip de un Release de GitHub." />
        <Field label="Video donde lo explicas (opcional)" name="video_url" type="url" defaultValue={saas?.video_url} />
      </Section>

      <Section title="Detalles">
        <Field label="Stack" name="stack" defaultValue={saas?.stack.join(", ")} hint="Separado por comas. Ej: Next.js, Supabase, Tailwind, Vercel" />
        <div>
          <label className="label" htmlFor="features">Qué incluye (una por línea)</label>
          <textarea id="features" name="features" rows={5} defaultValue={saas?.features.join("\n")} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="env_vars">Variables de entorno de la plantilla (una por línea)</label>
          <textarea id="env_vars" name="env_vars" rows={3} defaultValue={saas ? saas.env_vars.join("\n") : DEFAULT_ENV} className="input font-mono text-sm" />
          <p className="hint">Las de Supabase se rellenan solas con la integración; Vercel pedirá las demás al desplegar.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Orden" name="sort_order" type="number" defaultValue={String(saas?.sort_order ?? 0)} hint="Los números menores salen primero." />
          <label className="flex items-center gap-3 self-center rounded-lg border border-line px-4 py-3">
            <input type="checkbox" name="published" defaultChecked={saas?.published ?? true} className="size-4 accent-emerald-400" />
            <span className="text-sm text-slate-200">Visible en la web</span>
          </label>
        </div>
      </Section>

      {state?.error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <div className="flex gap-3">
        <button className="btn" disabled={pending || demo}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {demo && <p className="self-center text-sm text-amber-300">En modo demo no se guarda nada.</p>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-line bg-card p-5">
      <legend className="px-1 text-sm font-bold text-white">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  hint,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="input" />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
