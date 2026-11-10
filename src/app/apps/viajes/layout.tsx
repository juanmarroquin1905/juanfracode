import { Fraunces, Karla, Space_Mono } from "next/font/google";

// Letras propias de esta app (estilo pasaporte): serifa, máquina de escribir y una sans amable.
const serif = Fraunces({ subsets: ["latin"], variable: "--font-vj-serif" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-vj-mono" });
const sans = Karla({ subsets: ["latin"], variable: "--font-vj-sans" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${mono.variable} ${sans.variable}`}>{children}</div>;
}
