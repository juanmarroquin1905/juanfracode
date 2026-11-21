import { redirect } from "next/navigation";

// Las guías y recursos ahora viven en el inicio.
export default function VideosPage() {
  redirect("/recursos");
}
