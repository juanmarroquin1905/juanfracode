# Skills para Claude

Skills que se muestran en la sección **Skills** de la web (`/skills`).
## Propias (Juanfra Code, licencia MIT)

| Skill | Qué hace |
| --- | --- |
| crea-tu-primera-app | Guía con preguntas paso a paso para crear tu primera micro app o SaaS, como artefacto de Claude o como proyecto Next.js + Supabase para Vercel |

## De terceros (Apache 2.0)

Copias sin cambios de dos de los repositorios de skills más populares de GitHub.

| Skill | Origen |
| --- | --- |
| file-organizer, invoice-organizer, tailored-resume-generator, raffle-winner-picker, meeting-insights-analyzer, content-research-writer, domain-name-brainstormer | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (commit `be2a406`) |
| skill-creator | [anthropics/skills](https://github.com/anthropics/skills) (commit `2c5958e`) |

Cada carpeta lleva su `LICENSE.txt` (MIT en las propias, Apache 2.0 en las de terceros). Los derechos de las de terceros son de sus autores.

## Cómo agregar otra skill

1. Copia o crea la carpeta de la skill aquí (`skills/<nombre>/SKILL.md` + su licencia).
2. Agrégala a la lista de `src/config/skills.ts` con su texto en español.
3. `npm run plantillas` arma el zip en `public/descargas/skills/<nombre>.zip`
   (también se arma solo en cada build).
