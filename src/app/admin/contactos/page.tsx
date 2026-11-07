import { getLeads, isDemo } from "@/lib/data";

export default async function Contacts() {
  const leads = await getLeads();
  const fmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Contactos</h1>
          <p className="text-sm text-slate-500">Personas que dejaron sus datos para descargar una plantilla: {leads.length}</p>
        </div>
        {leads.length > 0 && (
          <a href="/admin/contactos/csv" download className="btn-ghost">
            ↓ Descargar CSV (Excel)
          </a>
        )}
      </div>
      {isDemo ? (
        <p className="card mt-6 p-8 text-center text-slate-500">Conecta Supabase para empezar a guardar contactos.</p>
      ) : leads.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-slate-500">Aún no hay contactos. Llegarán cuando alguien descargue una plantilla.</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs text-slate-500">
              <tr>
                {["Nombre", "Correo", "WhatsApp", "Red social", "Apps", "Acepta novedades", "Fecha"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium text-ink">{l.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${l.email}`} className="text-accent hover:underline">
                      {l.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      {l.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{l.social || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{l.apps.join(", ")}</td>
                  <td className="px-4 py-3 text-slate-600">{l.consent ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmt.format(new Date(l.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
