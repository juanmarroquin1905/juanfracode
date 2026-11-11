"use client";

import { useState } from "react";
import type { Skill } from "@/config/skills";

type Item = Skill & { content: string; sourceRepo: string; sourceUrl: string };

export function SkillList({ skills }: { skills: Item[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {skills.map((s) => (
        <SkillCard key={s.slug} skill={s} />
      ))}
    </div>
  );
}

function SkillCard({ skill }: { skill: Item }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(skill.content);
    } catch {
      // Navegadores sin permiso de portapapeles: copia con un textarea oculto
      const t = document.createElement("textarea");
      t.value = skill.content;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article id={skill.slug} className="card flex scroll-mt-24 flex-col p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-soft text-2xl">{skill.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-ink">{skill.title}</h3>
            {skill.where === "code" && <span className="chip !bg-amber-50 !text-amber-800">Mejor en Claude Code</span>}
          </div>
          <p className="mt-0.5 font-mono text-xs text-mut">{skill.slug}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-mut">{skill.text}</p>
      <p className="mt-3 rounded-xl bg-soft/70 px-3.5 py-2.5 text-sm text-ink">
        <span className="text-mut">Pídele: </span>“{skill.example}”
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a href={`/descargas/skills/${skill.slug}.zip`} download className="btn">
          <DownloadIcon />
          Descargar
        </a>
        <button type="button" onClick={copy} className="btn-ghost" aria-live="polite">
          {copied ? "¡Copiado!" : "Copiar SKILL.md"}
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn-ghost" aria-expanded={open}>
          {open ? "Ocultar" : "Ver archivo"}
        </button>
      </div>

      {open && (
        <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-line bg-white p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
          {skill.content}
        </pre>
      )}

      <p className="mt-auto pt-5 text-xs text-mut">
        De{" "}
        <a href={skill.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
          {skill.sourceRepo}
        </a>{" "}
        · Apache 2.0
      </p>
    </article>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
