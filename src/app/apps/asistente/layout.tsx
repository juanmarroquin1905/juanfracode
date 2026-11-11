import { Chakra_Petch, Orbitron } from "next/font/google";

// Letras propias de esta app: Orbitron (títulos futuristas) y Chakra Petch (para leer).
const display = Orbitron({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-hud-display" });
const body = Chakra_Petch({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-hud-body" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${body.variable}`}>{children}</div>;
}
