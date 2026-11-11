// El núcleo de luz de NOVA: anillos que giran y una esfera que late.
// Cambia según el estado: esperando, escuchando, pensando o hablando.

export type CoreState = "idle" | "listening" | "thinking" | "speaking";

const BARS = Array.from({ length: 40 }, (_, i) => i);

export function Core({ state }: { state: CoreState }) {
  return (
    <div className="hud-core" data-state={state} aria-hidden>
      <svg viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 0 4px rgb(79 227 255 / 0.7))" }}>
        <circle cx="100" cy="100" r="98" fill="none" stroke="rgb(79 227 255 / 0.25)" strokeWidth="0.6" />
        <g className="hud-ring hud-spin-a">
          <circle cx="100" cy="100" r="92" fill="none" stroke="#4fe3ff" strokeWidth="3" strokeDasharray="0.8 4" opacity="0.7" />
        </g>
        <g className="hud-ring hud-spin-b">
          <circle cx="100" cy="100" r="81" fill="none" stroke="#2f8dff" strokeWidth="2" strokeDasharray="70 14 12 14 40 22" />
        </g>
        <g className="hud-ring hud-spin-c">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#4fe3ff" strokeWidth="3.5" strokeDasharray="90 350" strokeLinecap="round" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#4fe3ff" strokeWidth="1.2" strokeDasharray="30 410" strokeDashoffset="-200" />
        </g>
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgb(79 227 255 / 0.35)" strokeWidth="0.6" />
        {/* Marcas fijas arriba, abajo y a los lados */}
        {[0, 90, 180, 270].map((a) => (
          <rect key={a} x="99" y="0" width="2" height="8" fill="#4fe3ff" transform={`rotate(${a} 100 100)`} />
        ))}
      </svg>
      <div className="hud-bars">
        {BARS.map((i) => (
          <i
            key={i}
            style={{
              transform: `rotate(${i * 9}deg) translateY(calc(min(340px, 74vw) * 0.24))`,
              animationDelay: `${(i * 137) % 500}ms`,
            }}
          />
        ))}
      </div>
      <div className="hud-orb" />
    </div>
  );
}
