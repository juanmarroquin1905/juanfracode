import Link from "next/link";
import { SaasForm } from "@/components/saas-form";
import { isDemo } from "@/lib/data";

export default function NewSaas() {
  return (
    <>
      <Link href="/admin" className="text-sm text-slate-500 hover:text-ink">← Volver</Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-ink">Nueva app</h1>
      <SaasForm demo={isDemo} />
    </>
  );
}
