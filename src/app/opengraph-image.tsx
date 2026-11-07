import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const alt = `${BRAND.name} · ${BRAND.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen que aparece al compartir la web en WhatsApp, X, LinkedIn, etc.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 85% 10%, #134e3a 0%, #0a0b10 55%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#34d399",
              color: "#0a0b10",
              fontSize: 28,
            }}
          >
            {"</>"}
          </div>
          {BRAND.name}
        </div>
        <div style={{ marginTop: 40, fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{BRAND.title}</div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#94a3b8" }}>Pruébalas gratis y lanza tu propia versión en minutos.</div>
      </div>
    ),
    size,
  );
}
