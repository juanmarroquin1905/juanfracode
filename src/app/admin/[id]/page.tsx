import Link from "next/link";
import { notFound } from "next/navigation";
import { SaasForm } from "@/components/saas-form";
import { getSaasById, isDemo } from "@/lib/data";
import { deleteSaas } from "../actions";

export default async function EditSaas({ params }: PageProps<"/admin/[id]">) {
  const saas = await getSaasById((await params).id);
  if (!saas) notFound();
  return (
    <>
      <Link href="/admin" className="text-sm text-slate-500 hover:text-white">← Volver</Link>
      <div className="mt-3 mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{saas.name}</h1>
        <Link href={`/saas/${saas.slug}`} target="_blank" className="text-sm text-slate-400 hover:text-white">
          Ver ficha ↗
        </Link>
      </div>
      <SaasForm saas={saas} demo={isDemo} />
      {!isDemo && (
        <form action={deleteSaas} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={saas.id} />
          <button className="text-sm text-red-400 hover:text-red-300">Borrar este SaaS</button>
        </form>
      )}
    </>
  );
}
