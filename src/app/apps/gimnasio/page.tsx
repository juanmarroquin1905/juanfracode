import type { Metadata, Viewport } from "next";
import { GimnasioDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mi gimnasio (demo)",
  description: "Registra rutinas, pesos y repeticiones, y mira tu progreso con gráficos, récords y calendario de constancia.",
};

export const viewport: Viewport = { themeColor: "#0d0f12" };

// Demo de la app de gimnasio. No usa base de datos: guarda en el navegador.
export default function Page() {
  return <GimnasioDemo />;
}
