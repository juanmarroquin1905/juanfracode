# Skills para Claude

Skills que se muestran en la sección **Skills** de la web (`/skills`).
No son nuestras: son copias sin cambios de dos de los repositorios de skills
más populares de GitHub, ambos con licencia Apache 2.0.

| Skill | Origen |
| --- | --- |
| file-organizer, invoice-organizer, tailored-resume-generator, raffle-winner-picker, meeting-insights-analyzer, content-research-writer, domain-name-brainstormer | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (commit `be2a406`) |
| skill-creator | [anthropics/skills](https://github.com/anthropics/skills) (commit `2c5958e`) |

Cada carpeta lleva su `LICENSE.txt` (Apache 2.0). Los derechos son de sus autores.

## Cómo agregar otra skill

1. Copia la carpeta de la skill aquí (`skills/<nombre>/SKILL.md` + su licencia).
2. Agrégala a la lista de `src/config/skills.ts` con su texto en español.
3. `npm run plantillas` arma el zip en `public/descargas/skills/<nombre>.zip`
   (también se arma solo en cada build).
