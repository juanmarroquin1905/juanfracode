import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { BRAND } from "@/config/brand";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${BRAND.name} · ${BRAND.title}`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a0b10" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={`${sans.className} ${mono.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
