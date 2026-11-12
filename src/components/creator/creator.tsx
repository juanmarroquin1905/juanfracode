"use client";

import { useEffect, useMemo, useState } from "react";
import { buildFiles, buildPreview, loadAssets, type Assets } from "./generate";
import {
  COLORS,
  CURRENCIES,
  EMOJIS,
  FEATURES,
  STYLES,
  TYPES,
  defaultConfig,
  slugify,
  type AppConfig,
  type FeatureId,
} from "./options";
import { makeZip } from "./zip";

const STEPS = ["Tipo", "Nombre", "Diseño", "Funciones", "Vender", "Descargar"] as const;

// Creador de micro apps: formulario por pasos, vista previa en vivo y descarga en .zip.
export function Creator() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<AppConfig>(() => defaultConfig());
  const [assets, setAssets] = useState<Assets | null>(null);
  const [failed, setFailed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    loadAssets().then(setAssets, () => setFailed(true));
  }, []);

  const preview = useMemo(() => (assets ? buildPreview(cfg, assets) : ""), [cfg, assets]);
  const set = (patch: Partial<AppConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const payUrl = cfg.pay.url.trim();
  const payError = payUrl && !/^https:\/\/\S+\.\S+/.test(payUrl) ? "El link debe empezar con https://" : "";
  const nameError = cfg.name.trim() ? "" : "Ponle un nombre a tu app.";

  const pickType = (id: AppConfig["type"]) => {
    const d = defaultConfig(id);
    setCfg((c) => ({ ...c, type: id, name: d.name, emoji: d.emoji, description: d.description, categories: d.categories }));
  };

  const toggle = (f: FeatureId) =>
    set({ features: cfg.features.includes(f) ? cfg.features.filter((x) => x !== f) : [...cfg.features, f] });

  const download = () => {
    if (!assets || payError || nameError) return;
    const blob = makeZip(buildFiles(cfg, assets));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(cfg.name)}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setDownloaded(true);
  };

  const last = step === STEPS.length - 1;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Formulario */}
      <div className="card p-5 sm:p-7">
        <ol className="flex flex-wrap gap-1.5" aria-label="Pasos">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={`press rounded-full px-2.5 py-1.5 font-ui text-xs font-semibold transition-colors ${
                  i === step ? "bg-accent text-white" : i < step ? "bg-soft text-ink" : "text-mut hover:text-ink"
                }`}
              >
                {i < step ? "✓ " : `${i + 1}. `}
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div key={step} className="enter mt-6 min-h-[340px]">
          {step === 0 && (
            <Step title="¿Qué tipo de app quieres crear?" text="Elige una base. Después le pones nombre, diseño y funciones.">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {TYPES.map((t) => (
                  <Choice key={t.id} on={cfg.type === t.id} onClick={() => pickType(t.id)}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="mt-2 block font-semibold text-ink">{t.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-mut">{t.text}</span>
                  </Choice>
                ))}
              </div>
              <p className="hint mt-4">Pronto: recetas, citas, inventario, lista de compras y más.</p>
            </Step>
          )}

          {step === 1 && (
            <Step title="Dale nombre y personalidad" text="Así se verá arriba de tu app y en la pestaña del navegador.">
              <label className="label" htmlFor="c-name">Nombre</label>
              <input id="c-name" className="input" maxLength={40} value={cfg.name} onChange={(e) => set({ name: e.target.value })} />
              {nameError && <p className="mt-1.5 text-xs text-red-600">{nameError}</p>}
              <label className="label mt-4" htmlFor="c-desc">Frase corta <span className="font-normal text-mut">(opcional)</span></label>
              <input id="c-desc" className="input" maxLength={80} value={cfg.description} onChange={(e) => set({ description: e.target.value })} />
              <p className="label mt-4">Ícono</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => set({ emoji: e })}
                    aria-pressed={cfg.emoji === e}
                    className={`press grid size-11 place-items-center rounded-xl border text-xl transition-colors ${
                      cfg.emoji === e ? "border-accent bg-soft" : "border-line bg-card hover:border-accent/40"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="Elige el diseño" text="Cada estilo cambia letras, fondos y formas. El color lo eliges abajo.">
              <div className="grid grid-cols-2 gap-2.5">
                {STYLES.map((s) => (
                  <Choice key={s.id} on={cfg.style === s.id} onClick={() => set({ style: s.id })}>
                    <StyleSwatch preview={s.preview} color={cfg.color} />
                    <span className="mt-2.5 block font-semibold text-ink">{s.title}</span>
                    <span className="block text-sm text-mut">{s.text}</span>
                  </Choice>
                ))}
              </div>
              <p className="label mt-5">Color principal</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set({ color: c.id })}
                    aria-label={c.name}
                    aria-pressed={cfg.color === c.id}
                    title={c.name}
                    className={`press size-10 rounded-full ring-offset-2 ring-offset-card transition-shadow ${cfg.color === c.id ? "ring-2 ring-ink" : ""}`}
                    style={{ background: c.id }}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="¿Qué funciones quieres?" text="Actívalas o quítalas y mira el cambio en la vista previa.">
              <div className="grid gap-2">
                {FEATURES.map((f) => (
                  <label key={f.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${cfg.features.includes(f.id) ? "border-accent bg-soft" : "border-line bg-card"}`}>
                    <input type="checkbox" checked={cfg.features.includes(f.id)} onChange={() => toggle(f.id)} className="mt-1 size-4 accent-[#1d4ed8]" />
                    <span>
                      <span className="block font-semibold text-ink">{f.title}</span>
                      <span className="block text-sm text-mut">{f.text}</span>
                    </span>
                  </label>
                ))}
              </div>
              {cfg.features.includes("categorias") && (
                <>
                  <label className="label mt-4" htmlFor="c-cats">Tus categorías</label>
                  <input
                    id="c-cats"
                    className="input"
                    value={cfg.categories.join(", ")}
                    onChange={(e) => set({ categories: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 8) })}
                  />
                  <p className="hint">Sepáralas con comas. Máximo 8.</p>
                </>
              )}
              {cfg.type === "gastos" && (
                <>
                  <p className="label mt-4">Moneda</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set({ currency: c })}
                        aria-pressed={cfg.currency === c}
                        className={`press rounded-full border px-3.5 py-1.5 text-sm font-semibold ${cfg.currency === c ? "border-accent bg-accent text-white" : "border-line bg-card text-ink"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Step>
          )}

          {step === 4 && (
            <Step title="¿Quieres cobrar por tu app?" text="Opcional. Pega tu link de pago y la app mostrará un botón para comprar. El dinero llega directo a tu cuenta.">
              <label className="label" htmlFor="c-pay">Tu link de pago <span className="font-normal text-mut">(opcional)</span></label>
              <input
                id="c-pay"
                className="input"
                type="url"
                inputMode="url"
                placeholder="https://..."
                value={cfg.pay.url}
                onChange={(e) => set({ pay: { ...cfg.pay, url: e.target.value } })}
              />
              {payError ? <p className="mt-1.5 text-xs text-red-600">{payError}</p> : (
                <p className="hint">Sirve de Lemon Squeezy, Mercado Pago, PayPal, Stripe o Gumroad. Créalo en tu cuenta y cópialo aquí.</p>
              )}
              {payUrl && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="c-pay-label">Texto del botón</label>
                    <input id="c-pay-label" className="input" maxLength={24} value={cfg.pay.label} onChange={(e) => set({ pay: { ...cfg.pay, label: e.target.value } })} />
                  </div>
                  <div>
                    <label className="label" htmlFor="c-pay-text">Mensaje <span className="font-normal text-mut">(opcional)</span></label>
                    <input
                      id="c-pay-text"
                      className="input"
                      maxLength={90}
                      placeholder="Versión completa por S/ 15"
                      value={cfg.pay.text}
                      onChange={(e) => set({ pay: { ...cfg.pay, text: e.target.value } })}
                    />
                  </div>
                </div>
              )}
              <div className="mt-5 rounded-xl bg-soft p-4 text-sm leading-relaxed text-mut">
                <strong className="text-ink">Ideas para venderla:</strong> cobra un pago único por la app, pide un “apoyo” voluntario o vende
                una versión personalizada para un negocio (con su logo y sus categorías).
              </div>
            </Step>
          )}

          {step === 5 && (
            <Step title="¡Tu app está lista!" text="Descarga el .zip y publícala gratis en Netlify o Vercel. Adentro va un archivo LEEME con los pasos.">
              <ul className="grid gap-1.5 text-sm text-mut">
                <Summary k="App" v={`${cfg.emoji} ${cfg.name || "Sin nombre"}`} />
                <Summary k="Tipo" v={TYPES.find((t) => t.id === cfg.type)!.title} />
                <Summary k="Diseño" v={`${STYLES.find((s) => s.id === cfg.style)!.title} · ${COLORS.find((c) => c.id === cfg.color)?.name ?? ""}`} />
                <Summary k="Funciones" v={cfg.features.length ? cfg.features.map((f) => FEATURES.find((x) => x.id === f)!.title).join(", ") : "Ninguna extra"} />
                <Summary k="Cobro" v={payUrl ? `Botón “${cfg.pay.label || "Comprar"}”` : "Sin link de pago"} />
              </ul>
              <label className="mt-4 flex items-center gap-2.5 text-sm text-mut">
                <input type="checkbox" checked={cfg.credit} onChange={(e) => set({ credit: e.target.checked })} className="size-4 accent-[#1d4ed8]" />
                Mostrar “Hecho con Juanfra Code” al final (¡gracias si lo dejas!)
              </label>
              <button type="button" onClick={download} disabled={!assets || !!payError || !!nameError} className="btn mt-5 w-full py-3 text-base">
                Descargar mi app (.zip) <span className="arr">↓</span>
              </button>
              {(payError || nameError) && <p className="mt-2 text-xs text-red-600">{nameError || payError} Revisa los pasos anteriores.</p>}
              {downloaded && (
                <div className="enter mt-4 rounded-xl border border-line bg-soft p-4 text-sm leading-relaxed text-mut">
                  <strong className="text-ink">¡Descargada! Ahora publícala:</strong>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                    <li>Descomprime el .zip.</li>
                    <li>
                      Entra a{" "}
                      <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="font-semibold text-accent underline-offset-2 hover:underline">
                        app.netlify.com/drop
                      </a>{" "}
                      y arrastra la carpeta.
                    </li>
                    <li>Comparte el enlace que te da. ¡Listo!</li>
                  </ol>
                </div>
              )}
            </Step>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={`btn-ghost ${step === 0 ? "invisible" : ""}`}>
            ← Atrás
          </button>
          {!last && (
            <button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="btn">
              Siguiente <span className="arr">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista previa */}
      <div className="lg:sticky lg:top-24">
        <div className="card overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <i className="size-2.5 rounded-full bg-[#ff5f57]" />
              <i className="size-2.5 rounded-full bg-[#febc2e]" />
              <i className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="mx-auto truncate rounded-full bg-soft px-3 py-0.5 font-ui text-xs text-mut">
              {slugify(cfg.name)}.netlify.app
            </span>
            <span className="chip">Vista previa</span>
          </div>
          {preview ? (
            <iframe
              title="Vista previa de tu app"
              srcDoc={preview}
              sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-modals"
              className="block h-[560px] w-full bg-white lg:h-[640px]"
            />
          ) : (
            <div className="grid h-[560px] place-items-center text-sm text-mut lg:h-[640px]">
              {failed ? "No se pudo cargar la vista previa. Recarga la página." : "Cargando vista previa…"}
            </div>
          )}
        </div>
        <p className="mt-2 text-center font-ui text-xs text-mut">Pruébala: agrega, marca y borra. Así funcionará tu app publicada.</p>
      </div>
    </div>
  );
}

function Step({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{title}</h2>
      <p className="mt-1.5 mb-5 text-sm leading-relaxed text-mut">{text}</p>
      {children}
    </section>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`press rounded-2xl border p-4 text-left transition-[border-color,background-color] duration-150 ${
        on ? "border-accent bg-soft ring-2 ring-accent/20" : "border-line bg-card hover:border-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

function StyleSwatch({ preview, color }: { preview: { bg: string; card: string; ink: string; radius: number }; color: string }) {
  return (
    <span aria-hidden className="block overflow-hidden rounded-lg border border-line p-2.5" style={{ background: preview.bg }}>
      <span className="block h-2 w-1/2" style={{ background: preview.ink, borderRadius: preview.radius }} />
      <span className="mt-2 flex items-center gap-1.5 p-1.5" style={{ background: preview.card, borderRadius: preview.radius, border: `1px solid ${preview.ink}22` }}>
        <span className="size-3 shrink-0 rounded-full" style={{ background: color }} />
        <span className="block h-1.5 flex-1" style={{ background: `${preview.ink}55`, borderRadius: 4 }} />
      </span>
      <span className="mt-1.5 block h-3 w-1/3" style={{ background: color, borderRadius: preview.radius }} />
    </span>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex justify-between gap-4 border-b border-line pb-1.5">
      <span>{k}</span>
      <span className="text-right font-semibold text-ink">{v}</span>
    </li>
  );
}
