import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/data";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  if (isDemo) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-6">
        <h1 className="text-xl font-bold text-white">Panel de SaaS</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">Solo para el administrador de la web.</p>
        <LoginForm />
        <Link href="/" className="mt-6 block text-center text-sm text-slate-500 hover:text-white">
          ← Volver a la web
        </Link>
      </div>
    </main>
  );
}
