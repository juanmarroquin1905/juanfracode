import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Letra de la app: Nunito, redondeada y amigable.
const font = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-crm" });

export const metadata: Metadata = {
  title: "Mi CRM",
  description: "Tus clientes, en qué etapa va cada uno y el próximo paso.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f1ff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
