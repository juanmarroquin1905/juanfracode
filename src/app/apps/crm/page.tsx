import type { Metadata, Viewport } from "next";
import { CrmDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mi CRM (demo)",
  description: "CRM personal para freelancers: tus clientes, tratos por etapa en un tablero y seguimientos para no olvidar a nadie.",
};

export const viewport: Viewport = { themeColor: "#efeaff" };

// Demo del CRM. No usa base de datos: guarda en el navegador.
export default function Page() {
  return <CrmDemo />;
}
