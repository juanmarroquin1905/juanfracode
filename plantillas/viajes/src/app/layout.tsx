import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, Space_Mono } from "next/font/google";
import "./globals.css";

// Letras de la app (estilo pasaporte): serifa, máquina de escribir y una sans amable.
const serif = Fraunces({ subsets: ["latin"], variable: "--font-vj-serif" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-vj-mono" });
const sans = Karla({ subsets: ["latin"], variable: "--font-vj-sans" });

export const metadata: Metadata = {
  title: "Mis viajes",
  description: "Planifica tus viajes: destino, hotel, presupuesto, gastos, itinerario con mapa y qué llevar.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f0e3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
