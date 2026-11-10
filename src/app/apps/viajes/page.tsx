import type { Metadata, Viewport } from "next";
import { ViajesDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mis viajes (demo)",
  description: "Planificador de viajes: destino, hotel, presupuesto, gastos, itinerario por día y lista de qué llevar.",
};

export const viewport: Viewport = { themeColor: "#f6f0e3" };

// Demo del planificador de viajes. No usa base de datos: guarda en el navegador.
export default function Page() {
  return <ViajesDemo />;
}
