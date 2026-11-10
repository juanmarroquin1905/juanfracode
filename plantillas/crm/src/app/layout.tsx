import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Letras de la app: Space Grotesk para títulos y números, DM Sans para el texto.
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-crm-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-crm-body" });

export const metadata: Metadata = {
  title: "Mi CRM",
  description: "Tus clientes, tus tratos por etapa y tus seguimientos en un solo lugar.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#efeaff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
