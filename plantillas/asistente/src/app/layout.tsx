import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Orbitron } from "next/font/google";
import "./globals.css";

// Letras de la app: Orbitron (títulos futuristas) y Chakra Petch (para leer).
const display = Orbitron({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-hud-display" });
const body = Chakra_Petch({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-hud-body" });

export const metadata: Metadata = {
  title: "NOVA · Mi asistente",
  description: "Tu asistente personal: tareas, agenda, gastos, gimnasio y notas en una pantalla futurista.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#030814" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
