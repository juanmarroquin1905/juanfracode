import type { Metadata, Viewport } from "next";
import { AsistenteDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mi asistente (demo)",
  description: "NOVA, tu asistente personal con pantalla futurista: tareas, agenda, gastos, gimnasio y notas en un solo lugar.",
};

export const viewport: Viewport = { themeColor: "#030814" };

// Demo del asistente. No usa base de datos ni inteligencia artificial: guarda en el navegador.
export default function Page() {
  return <AsistenteDemo />;
}
