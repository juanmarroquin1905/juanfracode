import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mis finanzas",
  description: "Mis ingresos, egresos, categorías y presupuestos en un solo lugar.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f3f7ff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sora.variable} ${inter.variable}`}>
      <body className="glows min-h-screen font-sans">{children}</body>
    </html>
  );
}
