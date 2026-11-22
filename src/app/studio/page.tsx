import { redirect } from "next/navigation";

// El Studio se presenta en el inicio (lista de espera incluida).
export default function StudioPage() {
  redirect("/#como-funciona");
}
