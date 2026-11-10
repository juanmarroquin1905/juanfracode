import type { Metadata } from "next";
import { FinanzasDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mis finanzas (demo)",
  description: "Dashboard de finanzas personales: ingresos, egresos, categorías, presupuestos y gráficos por día, semana y mes.",
};

// Demo de la app de finanzas. No usa base de datos: guarda en el navegador.
export default function Page() {
  return <FinanzasDemo />;
}
