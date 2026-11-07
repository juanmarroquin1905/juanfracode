import { NextResponse } from "next/server";
import { getAdminUser, getLeads } from "@/lib/data";

// Descarga los contactos como CSV (se abre en Excel o Google Sheets).
export async function GET() {
  const user = await getAdminUser();
  if (!user?.isAdmin) return new NextResponse("No autorizado", { status: 401 });

  const leads = await getLeads();
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Nombre", "Correo", "WhatsApp", "Red social", "Apps", "Acepta novedades", "Fecha"],
    ...leads.map((l) => [l.name, l.email, l.phone, l.social, l.apps.join(" "), l.consent ? "Sí" : "No", l.created_at.slice(0, 10)]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contactos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
