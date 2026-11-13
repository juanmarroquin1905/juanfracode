"use client";

import { AUDIENCIAS, CTAS, DURACIONES, GANCHOS, GRABACIONES, OBJETIVOS, TONOS, type Opciones } from "@/lib/guiones/types";

const sel = "input !py-2 !text-sm";

// Los campos para elegir cómo quieres el guion. Los usa el formulario de video nuevo y el chat.
export function OpcionesCampos({
  value,
  onChange,
  compacto = false,
}: {
  value: Opciones;
  onChange: (o: Opciones) => void;
  compacto?: boolean;
}) {
  const set = <K extends keyof Opciones>(k: K, v: Opciones[K]) => onChange({ ...value, [k]: v });
  const ayuda = GANCHOS.find((g) => g.id === value.gancho)?.ayuda;
  return (
    <div className={`grid gap-3 ${compacto ? "grid-cols-2" : "sm:grid-cols-2"}`}>
      <div>
        <label className="label">Estilo del gancho</label>
        <select className={sel} value={value.gancho} onChange={(e) => set("gancho", e.target.value as Opciones["gancho"])}>
          {GANCHOS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        {!compacto && ayuda && <p className="hint">{ayuda}</p>}
      </div>
      <div>
        <label className="label">Cierre (CTA)</label>
        <select className={sel} value={value.cta} onChange={(e) => set("cta", e.target.value as Opciones["cta"])}>
          {CTAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Duración</label>
        <select className={sel} value={value.duracion} onChange={(e) => set("duracion", e.target.value as Opciones["duracion"])}>
          {DURACIONES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Tono</label>
        <select className={sel} value={value.tono} onChange={(e) => set("tono", e.target.value as Opciones["tono"])}>
          {TONOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">¿Para quién es?</label>
        <select className={sel} value={value.audiencia} onChange={(e) => set("audiencia", e.target.value as Opciones["audiencia"])}>
          {AUDIENCIAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">¿Qué debe hacer la persona al terminar?</label>
        <select className={sel} value={value.objetivo} onChange={(e) => set("objetivo", e.target.value as Opciones["objetivo"])}>
          {OBJETIVOS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">¿Cómo lo vas a grabar?</label>
        <select className={sel} value={value.grabacion} onChange={(e) => set("grabacion", e.target.value as Opciones["grabacion"])}>
          {GRABACIONES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Idea del video a usar</label>
        <input
          className={sel}
          value={value.idea}
          maxLength={300}
          placeholder="Vacío = la que decida Claude"
          onChange={(e) => set("idea", e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <label className="label">¿Qué NO debe decir o hacer? (opcional)</label>
        <input
          className={sel}
          value={value.evitar}
          maxLength={300}
          placeholder="Ej: no menciones precios, sin groserías"
          onChange={(e) => set("evitar", e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <label className="label">Ángulo (opcional)</label>
        <input
          className={sel}
          value={value.angulo}
          maxLength={300}
          placeholder="Ej: enfócalo en estudiantes, o en el paso 3"
          onChange={(e) => set("angulo", e.target.value)}
        />
      </div>
      {!compacto && (
        <div className="col-span-full">
          <label className="label">Sobre ti y tu audiencia (opcional)</label>
          <textarea
            className={`${sel} min-h-16`}
            value={value.perfil}
            maxLength={600}
            placeholder="Ej: Soy Juan, enseño a crear micro apps web con Claude. Hablo a gente sin experiencia en programación."
            onChange={(e) => set("perfil", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
