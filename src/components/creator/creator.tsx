"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildFiles, buildPreview, loadAssets, type Assets } from "./generate";
import {
  COLORS,
  CURRENCIES,
  EMOJIS,
  FEATURES,
  STYLES,
  VIEWS,
  applyRecipe,
  availableViews,
  defaultConfig,
  slugify,
  type AppConfig,
  type FeatureId,
} from "./options";
import { FIELD_TYPES, GENERIC, RECIPES, matchRecipe, nameFromIdea, type Field, type FieldType } from "./recipes";
import { makeZip } from "./zip";

const STEPS = ["Tu idea", "Datos", "Diseño", "Funciones", "Extras", "Descargar"] as const;

const IDEAS = ["las citas de mi barbería", "lo que me deben mis amigos", "los pedidos de mi tienda", "mis recetas favoritas"];

// Creador de micro apps: formulario por pasos, vista previa en vivo y descarga en .zip.
export function Creator() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<AppConfig>(() => defaultConfig());
  const [assets, setAssets] = useState<Assets | null>(null);
  const [failed, setFailed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [full, setFull] = useState(false);

  // Pantalla completa: Esc cierra y la página de atrás no se mueve.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  useEffect(() => {
    loadAssets().then(setAssets, () => setFailed(true));
  }, []);

  const preview = useMemo(() => (assets ? buildPreview(cfg, assets) : ""), [cfg, assets]);
  const set = (patch: Partial<AppConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const payUrl = cfg.pay.url.trim();
  const payError = payUrl && !/^https:\/\/\S+\.\S+/.test(payUrl) ? "El link debe empezar con https://" : "";
  const nameError = cfg.name.trim() ? "" : "Ponle un nombre a tu app.";

  const [matched, setMatched] = useState<string>("");
  const ideaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Escribir la idea arma la app sola (sin IA): busca la receta que más se parece.
  const onIdea = (idea: string) => {
    set({ idea });
    if (ideaTimer.current) clearTimeout(ideaTimer.current);
    ideaTimer.current = setTimeout(() => {
      if (idea.trim().length < 3) return setMatched("");
      const r = matchRecipe(idea) ?? GENERIC;
      setMatched(r.id);
      setCfg((c) => applyRecipe({ ...c, idea }, r, nameFromIdea(idea)));
    }, 350);
  };

  const pickRecipe = (id: string) => {
    const r = RECIPES.find((x) => x.id === id) ?? GENERIC;
    setMatched("");
    setCfg((c) => applyRecipe({ ...c, idea: "" }, r));
  };

  const setField = (i: number, patch: Partial<Field>) =>
    setCfg((c) => ({ ...c, fields: c.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  const removeField = (i: number) => setCfg((c) => ({ ...c, fields: c.fields.filter((_, j) => j !== i) }));
  const [newField, setNewField] = useState<{ label: string; type: FieldType }>({ label: "", type: "text" });
  const addField = () => {
    const label = newField.label.trim();
    if (!label) return;
    const field: Field = { key: `c${Date.now().toString(36)}`, label, type: newField.type, on: true, custom: true };
    if (newField.type === "options") field.options = ["Opción 1", "Opción 2"];
    setCfg((c) => ({ ...c, fields: [...c.fields, field] }));
    setNewField({ label: "", type: "text" });
  };
  const hasMoney = cfg.type === "gastos" || cfg.fields.some((f) => f.on && f.type === "money");
  const recipe = RECIPES.find((r) => r.id === cfg.recipe) ?? GENERIC;

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
            <Step title="¿Qué quieres organizar?" text="Escríbelo como se lo dirías a un amigo. Tu app se arma sola mientras escribes.">
              <textarea
                aria-label="Tu idea"
                rows={2}
                className="input resize-none text-lg"
                placeholder="Ej: las citas de mi barbería"
                value={cfg.idea}
                onChange={(e) => onIdea(e.target.value)}
              />
              {!cfg.idea && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {IDEAS.map((i) => (
                    <button key={i} type="button" onClick={() => onIdea(i)} className="press rounded-full bg-soft px-3 py-1 text-xs text-mut hover:text-ink">
                      “{i}”
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-soft p-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-2xl">{cfg.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-ui text-[11px] text-mut">
                    {matched ? "✨ Tu app se armó como" : "Tu app"}: <strong className="text-ink">{recipe.title}</strong>
                  </p>
                  <input
                    aria-label="Nombre de tu app"
                    className="w-full bg-transparent text-lg font-semibold text-ink outline-none"
                    maxLength={40}
                    value={cfg.name}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </div>
                <span className="hidden font-ui text-[11px] text-mut sm:block">✏️ Toca para cambiar el nombre</span>
              </div>
              {nameError && <p className="mt-1.5 text-xs text-red-600">{nameError}</p>}

              <p className="label mt-6">O elige una idea:</p>
              <div className="flex flex-wrap gap-1.5">
                {[...RECIPES, GENERIC].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => pickRecipe(r.id)}
                    aria-pressed={cfg.recipe === r.id}
                    className={`press rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      cfg.recipe === r.id ? "border-accent bg-accent text-white" : "border-line bg-card text-ink hover:border-accent/40"
                    }`}
                  >
                    {r.emoji} {r.title}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 1 && cfg.type !== "coleccion" && (
            <Step title="Esta app ya viene completa" text="Tiene todo lo necesario para funcionar. Pulsa Siguiente para elegir cómo se ve.">
              <div className="rounded-2xl border border-line bg-soft p-4 text-sm leading-relaxed text-mut">
                {cfg.emoji} <strong className="text-ink">{recipe.title}</strong>: {recipe.description} Si quieres anotar otras cosas, vuelve al paso 1
                y elige <button type="button" className="font-semibold text-accent underline-offset-2 hover:underline" onClick={() => { pickRecipe(GENERIC.id); }}>✨ A mi manera</button>.
              </div>
              <p className="label mt-5">Ícono</p>
              <EmojiPicker value={cfg.emoji} onPick={(emoji) => set({ emoji })} />
            </Step>
          )}

          {step === 1 && cfg.type === "coleccion" && (
            <Step title={`¿Qué quieres anotar de cada ${cfg.itemName}?`} text="Marca lo que te sirve. Puedes cambiar los nombres o agregar lo que falte.">
              <ul className="grid gap-2">
                {cfg.fields.map((f, i) => (
                  <li key={f.key} className={`rounded-xl border p-2.5 transition-colors ${f.on ? "border-accent/50 bg-soft" : "border-line bg-card"}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Usar ${f.label}`}
                        checked={f.on}
                        disabled={i === 0}
                        onChange={(e) => setField(i, { on: e.target.checked })}
                        className="size-5 shrink-0 accent-[#1d4ed8]"
                      />
                      <input
                        aria-label="Nombre del dato"
                        value={f.label}
                        maxLength={24}
                        onChange={(e) => setField(i, { label: e.target.value })}
                        className="min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none"
                      />
                      <span className="shrink-0 rounded-full bg-card px-2 py-0.5 font-ui text-[11px] text-mut">
                        {i === 0 ? "Principal" : FIELD_TYPES.find((t) => t.id === f.type)?.label}
                      </span>
                      {f.custom && (
                        <button type="button" onClick={() => removeField(i)} aria-label="Quitar" className="grid size-7 shrink-0 place-items-center rounded-full text-mut hover:bg-card">
                          ×
                        </button>
                      )}
                    </div>
                    {f.on && f.type === "options" && (
                      <input
                        aria-label="Opciones"
                        className="input mt-2 !py-1.5 text-sm"
                        value={(f.options ?? []).join(", ")}
                        onChange={(e) => setField(i, { options: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 12) })}
                        placeholder="Opciones separadas por comas"
                      />
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl border border-dashed border-line p-3">
                <p className="text-sm font-semibold text-ink">+ Agregar otro dato</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    aria-label="Nombre del nuevo dato"
                    className="input !w-auto min-w-0 flex-1 !py-2"
                    placeholder="Ej: Dirección"
                    maxLength={24}
                    value={newField.label}
                    onChange={(e) => setNewField((n) => ({ ...n, label: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addField())}
                  />
                  <select
                    aria-label="Tipo de dato"
                    className="input !w-auto !py-2"
                    value={newField.type}
                    onChange={(e) => setNewField((n) => ({ ...n, type: e.target.value as FieldType }))}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={addField} disabled={!newField.label.trim()} className="btn !py-2">
                    Agregar
                  </button>
                </div>
                <p className="hint">{FIELD_TYPES.find((t) => t.id === newField.type)?.hint}</p>
              </div>

              <p className="label mt-5">Ícono</p>
              <EmojiPicker value={cfg.emoji} onPick={(emoji) => set({ emoji })} />
            </Step>
          )}

          {step === 2 && (
            <Step title="Elige el diseño" text="Cada estilo cambia letras, fondos y formas. Mira el cambio al instante a la derecha.">
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
              {availableViews(cfg).length > 0 && (
                <>
                  <p className="label mt-5">¿Cómo quieres ver tus datos al abrirla?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {VIEWS.filter((v) => availableViews(cfg).includes(v.id)).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => set({ view: v.id })}
                        aria-pressed={cfg.view === v.id}
                        className={`press rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                          cfg.view === v.id ? "border-accent bg-accent text-white" : "border-line bg-card text-ink hover:border-accent/40"
                        }`}
                      >
                        {v.emoji} {v.title}
                      </button>
                    ))}
                  </div>
                  <p className="hint">Dentro de la app también se puede cambiar de vista.</p>
                </>
              )}
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
              {hasMoney && (
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
            <Step title="Últimos detalles" text="Todo aquí es opcional. Si es para ti, pulsa Siguiente y listo.">
              <label className="label" htmlFor="c-desc">Frase corta debajo del nombre</label>
              <input id="c-desc" className="input" maxLength={80} value={cfg.description} onChange={(e) => set({ description: e.target.value })} />
              <p className="mt-6 mb-3 border-t border-line pt-5 font-semibold text-ink">¿Vas a cobrar por ella?</p>
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
            </Step>
          )}

          {step === 5 && (
            <Step title="¡Tu app está lista!" text="Descarga el .zip y publícala gratis en Netlify o Vercel. Adentro va un archivo LEEME con los pasos.">
              <ul className="grid gap-1.5 text-sm text-mut">
                <Summary k="App" v={`${cfg.emoji} ${cfg.name || "Sin nombre"}`} />
                <Summary k="Tipo" v={`${recipe.emoji} ${recipe.title}`} />
                {cfg.type === "coleccion" && <Summary k="Datos" v={cfg.fields.filter((f) => f.on).map((f) => f.label).join(", ")} />}
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
      <div id="vista-previa" className="scroll-mt-20 lg:sticky lg:top-24">
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
            <button
              type="button"
              onClick={() => setFull(true)}
              disabled={!preview}
              className="press inline-flex shrink-0 items-center gap-1 rounded-full bg-soft px-2.5 py-1 font-ui text-xs font-semibold text-ink hover:bg-line"
            >
              ⤢ <span className="hidden sm:inline">Pantalla completa</span>
            </button>
          </div>
          {preview ? (
            <iframe
              title="Vista previa de tu app"
              srcDoc={preview}
              sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-modals"
              className="block h-[600px] w-full bg-white lg:h-[700px]"
            />
          ) : (
            <div className="grid h-[600px] place-items-center text-sm text-mut lg:h-[700px]">
              {failed ? "No se pudo cargar la vista previa. Recarga la página." : "Cargando vista previa…"}
            </div>
          )}
        </div>
        <p className="mt-2 text-center font-ui text-xs text-mut">Pruébala: agrega, marca y borra. Así funcionará tu app publicada.</p>
      </div>

      {/* En celular la vista previa queda abajo: este botón la abre en pantalla completa */}
      <button
        type="button"
        onClick={() => setFull(true)}
        disabled={!preview}
        className="press fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full bg-night px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(12,26,59,0.6)] lg:hidden"
      >
        {cfg.emoji} Ver mi app
      </button>

      {full &&
        preview &&
        createPortal(
        <div role="dialog" aria-modal="true" aria-label="Tu app en pantalla completa" className="enter fixed inset-0 z-50 flex flex-col bg-night/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 text-white">
            <span className="text-xl">{cfg.emoji}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{cfg.name || "Mi app"}</span>
            <span className="hidden font-ui text-xs text-slate-300 sm:block">Así se verá publicada</span>
            <button type="button" onClick={() => setFull(false)} className="press rounded-full bg-white px-4 py-2 text-sm font-semibold text-night">
              ✕ Cerrar
            </button>
          </div>
          <iframe
            title="Tu app en pantalla completa"
            srcDoc={preview}
            sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-modals"
            className="block w-full flex-1 bg-white"
          />
        </div>,
          document.body,
        )}
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

function EmojiPicker({ value, onPick }: { value: string; onPick: (e: string) => void }) {
  const list = EMOJIS.includes(value) ? EMOJIS : [value, ...EMOJIS];
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          aria-pressed={value === e}
          className={`press grid size-10 place-items-center rounded-xl border text-xl transition-colors ${
            value === e ? "border-accent bg-soft" : "border-line bg-card hover:border-accent/40"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
