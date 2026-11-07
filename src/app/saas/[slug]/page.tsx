import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { AppPreview } from "@/components/app-preview";
import { DownloadButtons } from "@/components/download-buttons";
import { HowTo } from "@/components/how-to";
import { SaasLogo } from "@/components/saas-logo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/config/brand";
import { getSaasBySlug, track } from "@/lib/data";
import { vercelDeployUrl } from "@/lib/deploy";
import { LEAD_COOKIE } from "@/lib/lead";

export async function generateMetadata({ params }: PageProps<"/saas/[slug]">): Promise<Metadata> {
  const saas = await getSaasBySlug((await params).slug);
  if (!saas) return {};
  return { title: saas.name, description: saas.tagline, openGraph: saas.cover_url ? { images: [saas.cover_url] } : undefined };
}

export default async function SaasPage({ params, searchParams }: PageProps<"/saas/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const saas = await getSaasBySlug(slug);
  if (!saas) notFound();

  after(() => track(slug, "view"));

  const deployUrl = vercelDeployUrl(saas);
  const hasTemplate = Boolean(saas.repo_url || saas.zip_url);
  const hasLead = (await cookies()).has(LEAD_COOKIE);
  const actions = [deployUrl && "vercel", saas.repo_url && "repo", saas.zip_url && "zip"].filter(Boolean) as (
    | "vercel"
    | "repo"
    | "zip"
  )[];
  const stats = [
    { label: "Visitas", value: saas.views },
    { label: "Descargas", value: saas.downloads },
  ].filter((st) => st.value >= BRAND.minStatToShow);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-8">
        <Link href="/#saas" className="text-sm text-slate-500 hover:text-ink">
          ← Todas las apps
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <SaasLogo saas={saas} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{saas.name}</h1>
                      </div>
                <p className="mt-1 text-sm text-slate-500">{saas.category}</p>
              </div>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{saas.tagline}</p>
            {saas.demo_url && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a href={saas.demo_url} target="_blank" rel="noreferrer" className="btn px-6 py-3 text-base">
                  ▶ Probar la app
                </a>
                <span className="text-sm text-slate-500">Entra y úsala por dentro, con datos de ejemplo.</span>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-line p-3 sm:p-6" style={{ background: `linear-gradient(160deg, ${saas.color}26, transparent 70%)` }}>
              {saas.demo_url ? (
                <a href={saas.demo_url} target="_blank" rel="noreferrer" className="group relative block" aria-label={`Probar ${saas.name}`}>
                  <AppPreview saas={saas} />
                  <span className="absolute inset-0 grid place-items-center rounded-xl bg-ink/0 transition group-hover:bg-ink/30">
                    <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink opacity-0 shadow-lg transition group-hover:opacity-100">
                      ▶ Probar la app
                    </span>
                  </span>
                </a>
              ) : (
                <AppPreview saas={saas} />
              )}
            </div>

            {saas.description && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-ink">Qué hace</h2>
                <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-500">{saas.description}</p>
              </section>
            )}

            {saas.features.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-ink">Qué incluye la plantilla</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {saas.features.map((f) => (
                    <li key={f} className="card flex gap-2.5 rounded-xl px-4 py-3 text-sm text-slate-700">
                      <span className="text-accent">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-lg font-bold text-ink">Cómo lanzarla</h2>
              <div className="mt-3">
                <HowTo compact />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <div className="flex flex-col gap-2.5">
                {saas.demo_url && (
                  <a href={saas.demo_url} target="_blank" rel="noreferrer" className="btn-ghost w-full">
                    ▶ Probar la app ↗
                  </a>
                )}
                <DownloadButtons
                  slug={saas.slug}
                  name={saas.name}
                  hasLead={hasLead}
                  actions={actions}
                  autoOpen={actions.find((a) => a === sp.descargar) ?? null}
                />
                {!hasTemplate && (
                  <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-sm text-slate-500">
                    La plantilla de este SaaS estará disponible pronto.
                  </p>
                )}
                {saas.video_url && (
                  <a href={saas.video_url} target="_blank" rel="noreferrer" className="text-center text-sm text-slate-500 hover:text-ink">
                    ▶ Mira cómo lo construí
                  </a>
                )}
              </div>
              {saas.demo_url && (
                <p className="hint text-center">La demo usa datos de ejemplo y no guarda nada.</p>
              )}
              {hasTemplate && (
                <p className="hint text-center">
                  Para usarla de verdad, lánzala gratis con tu propio GitHub, Vercel y Supabase.
                </p>
              )}

              {stats.length > 0 && (
                <dl
                  className={`mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line text-center ${stats.length === 2 ? "grid-cols-2" : ""}`}
                >
                  {stats.map((st) => (
                    <div key={st.label} className="bg-canvas px-3 py-3">
                      <dt className="text-[11px] text-slate-500">{st.label}</dt>
                      <dd className="text-xl font-semibold text-ink">{st.value.toLocaleString("es")}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {saas.stack.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Stack</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {saas.stack.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
