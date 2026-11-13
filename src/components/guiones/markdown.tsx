import type { ReactNode } from "react";

// Muestra el Markdown simple que devuelve Claude: títulos, citas (lo que se dice), listas y negrita.

function inline(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((t, i) =>
    t.startsWith("**") && t.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {t.slice(2, -2)}
      </strong>
    ) : (
      t
    ),
  );
}

export function Markdown({ texto }: { texto: string }) {
  const bloques: ReactNode[] = [];
  let cita: string[] = [];
  let lista: string[] = [];
  const cerrar = () => {
    if (cita.length) {
      bloques.push(
        <blockquote key={bloques.length} className="my-2 rounded-r-lg border-l-4 border-accent bg-accent/8 px-3 py-2 text-[15px] leading-relaxed text-ink">
          {cita.map((l, i) => (
            <p key={i} className={i ? "mt-2" : ""}>
              {inline(l)}
            </p>
          ))}
        </blockquote>,
      );
      cita = [];
    }
    if (lista.length) {
      bloques.push(
        <ul key={bloques.length} className="my-2 list-disc space-y-1 pl-5 text-sm text-mut">
          {lista.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
      lista = [];
    }
  };
  for (const linea of texto.split("\n")) {
    const l = linea.trimEnd();
    if (/^>\s?/.test(l)) {
      if (lista.length) cerrar();
      cita.push(l.replace(/^>\s?/, ""));
      continue;
    }
    if (/^[-*]\s+/.test(l)) {
      if (cita.length) cerrar();
      lista.push(l.replace(/^[-*]\s+/, ""));
      continue;
    }
    cerrar();
    if (!l.trim()) continue;
    const h = l.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      bloques.push(
        h[1].length === 3 ? (
          <h4 key={bloques.length} className="mt-3 text-sm font-bold text-ink">
            {inline(h[2])}
          </h4>
        ) : (
          <h3 key={bloques.length} className="mt-4 border-b border-line pb-1 text-xs font-bold tracking-wider text-accent uppercase">
            {inline(h[2])}
          </h3>
        ),
      );
    } else {
      bloques.push(
        <p key={bloques.length} className="my-1.5 text-sm leading-relaxed text-mut">
          {inline(l)}
        </p>,
      );
    }
  }
  cerrar();
  return <div>{bloques}</div>;
}
