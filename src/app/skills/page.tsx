import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkillList } from "@/components/skill-list";
import { SKILL_SOURCES, SKILLS } from "@/config/skills";

export const metadata: Metadata = {
  title: "Skills para Claude",
  description: "Skills populares de GitHub para tareas del día a día. Cópialas o descárgalas e instálalas en tu Claude.",
};

const INSTALL = [
  {
    title: "Descarga el .zip",
    text: "Pulsa “Descargar” en la skill que quieras. No lo descomprimas.",
  },
  {
    title: "Súbela a Claude",
    text: "En claude.ai o la app de Claude, abre Configuración → Personalización → Skills, agrega una skill nueva y elige el .zip.",
  },
  {
    title: "Pídele la tarea",
    text: "No tienes que nombrarla. Escribe lo que necesitas (por ejemplo “ordena mis facturas”) y Claude la usa sola.",
  },
];

export default function SkillsPage() {
  const skills = SKILLS.map((s) => ({
    ...s,
    content: readFileSync(join(process.cwd(), "skills", s.slug, "SKILL.md"), "utf8"),
    sourceRepo: SKILL_SOURCES[s.source].repo,
    sourceUrl: `${SKILL_SOURCES[s.source].url}/tree/main/${SKILL_SOURCES[s.source].path}${s.slug}`,
    license: SKILL_SOURCES[s.source].license,
    own: "own" in SKILL_SOURCES[s.source],
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-16">
        <div className="enter max-w-2xl">
          <p className="chip">Skills para Claude</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-balance text-ink sm:text-5xl">
            Enséñale a Claude a hacer tareas del día a día
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mut">
            Una skill es un archivo con instrucciones que Claude aprende una vez y usa cuando la necesitas. Aquí está la mía
            para crear tu primera app y algunas de las más populares de GitHub. Descárgalas gratis y súbelas a tu Claude.
          </p>
        </div>

        <ol id="instalar" className="mt-10 grid scroll-mt-28 gap-3 sm:grid-cols-3">
          {INSTALL.map((s, i) => (
            <li key={s.title} className="card p-5">
              <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{i + 1}</span>
              <h2 className="mt-4 font-semibold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-mut">
          ¿Usas Claude Code? Descomprime el .zip dentro de la carpeta <code className="rounded bg-soft px-1.5 py-0.5 font-mono text-xs text-ink">~/.claude/skills/</code> y listo.
        </p>

        <div className="mt-12">
          <SkillList skills={skills} />
        </div>

        <p className="mt-10 text-sm leading-relaxed text-mut">
          Las skills marcadas “Hecha por Juanfra Code” son mías, con licencia MIT. Las demás no son mías: son copias sin cambios de{" "}
          {Object.values(SKILL_SOURCES).filter((src) => !("own" in src)).map((src, i) => (
            <span key={src.repo}>
              {i > 0 && " y "}
              <a href={src.url} target="_blank" rel="noreferrer" className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                {src.repo}
              </a>
            </span>
          ))}
          , con licencia Apache 2.0. Todo el crédito es de sus autores.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
