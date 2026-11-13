import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/data";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const destino = next === "/guiones/app" ? next : "";
  if (isDemo) redirect(destino || "/admin");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-6">
        <h1 className="text-xl font-bold text-ink">Panel de SaaS</h1>
        <p className="mt-1 mb-6 text-sm text-mut">Solo para el administrador de la web.</p>
        <LoginForm next={destino} />
        <Link href="/" className="mt-6 block text-center text-sm text-mut hover:text-ink">
          ← Volver a la web
        </Link>
      </div>
    </main>
  );
}
