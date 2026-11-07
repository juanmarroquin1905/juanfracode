import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { BRAND } from "@/config/brand";
import "./globals.css";

const sans = Geist({ subsets: ["latin"] });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
// Títulos con carácter + cursiva elegante para resaltar palabras.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", weight: ["500", "600", "700", "800"] });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${BRAND.name} · ${BRAND.title}`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fafafc" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={`${sans.className} ${mono.variable} ${display.variable} ${serif.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
