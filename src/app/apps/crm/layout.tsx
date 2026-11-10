import { DM_Sans, Space_Grotesk } from "next/font/google";

// Letras propias de esta app (estilo neobrutalista): Space Grotesk para títulos y números, DM Sans para el texto.
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-crm-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-crm-body" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${body.variable}`}>{children}</div>;
}
