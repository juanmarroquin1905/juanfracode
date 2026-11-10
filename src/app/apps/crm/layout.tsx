import { Nunito } from "next/font/google";

// Letra propia de esta app: Nunito, redondeada y amigable.
const font = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-crm" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={font.variable}>{children}</div>;
}
