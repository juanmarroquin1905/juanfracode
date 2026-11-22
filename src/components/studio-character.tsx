// Video de muestra animado (9:16) para la vista previa del Studio.
// Personaje sin rostro, título, tarjetas Antes/Después y subtítulos palabra por palabra.
// Todo es CSS: sin video real ni archivos pesados. Las animaciones están en globals.css (.sc-*).

const CAPTION = ["Lo", "editó", "en", "dos", "minutos."];

export function StudioCharacter() {
  return (
    <div className="sc-scene" aria-hidden>
      <p className="sc-tag">TU VIDEO</p>
      <div className="sc-title">
        <span>Le pedí a Claude</span>
        <span>que editara mi video</span>
        <small>(sin abrir un editor)</small>
      </div>

      {/* Personaje */}
      <div className="sc-person">
        <div className="sc-head" />
        <div className="sc-neck" />
        <div className="sc-body" />
      </div>

      {/* Tarjetas */}
      <div className="sc-card sc-before">Antes</div>
      <div className="sc-card sc-after">Después</div>

      {/* Subtítulos palabra por palabra */}
      <p className="sc-caption">
        {CAPTION.map((w, i) => (
          <span key={w} style={{ animationDelay: `${1.2 + i * 0.35}s` }}>
            {w}
          </span>
        ))}
      </p>

      <div className="sc-progress" />
    </div>
  );
}
