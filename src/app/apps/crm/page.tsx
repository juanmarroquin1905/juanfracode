import type { Metadata, Viewport } from "next";
import { CrmDemo } from "./demo";

export const metadata: Metadata = {
  title: "Mi CRM (demo)",
  description: "CRM simple para freelancers: tus clientes por etapa y el próximo paso con cada uno.",
};

export const viewport: Viewport = { themeColor: "#efeaff" };

// Demo del CRM. No usa base de datos: guarda en el navegador.
export default function Page() {
  return <CrmDemo />;
}
