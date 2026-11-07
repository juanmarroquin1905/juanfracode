import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND } from "@/config/brand";
import "./globals.css";

const sans = Geist({ subsets: ["latin"] });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${BRAND.name} · ${BRAND.title}`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fafafc" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={`${sans.className} ${mono.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
