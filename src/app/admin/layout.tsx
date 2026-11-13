import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";
import { getAdminUser, isDemo } from "@/lib/data";
import { logout } from "../login/actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold text-ink">Tu cuenta no es administradora</h1>
          <p className="mt-2 text-sm text-mut">
            Entraste como {user.email}. Para hacerla admin, ejecuta en Supabase la última línea de supabase/schema.sql con
            este correo.
          </p>
          <form action={logout} className="mt-6">
            <button className="btn-ghost">Salir</button>
          </form>
        </div>
      </main>
    );
  }
  return (
    <>
      {isDemo && <DemoBanner />}
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/admin" className="font-bold text-ink">
            Panel
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin" className="rounded-md px-3 py-1.5 text-mut hover:text-ink">
              Apps
            </Link>
            <Link href="/admin/contactos" className="rounded-md px-3 py-1.5 text-mut hover:text-ink">
              Contactos
            </Link>
            <Link href="/guiones/app" className="rounded-md px-3 py-1.5 text-mut hover:text-ink">
              VidScript
            </Link>
            <Link href="/" className="rounded-md px-3 py-1.5 text-mut hover:text-ink">
              Ver web ↗
            </Link>
            {!isDemo && (
              <form action={logout}>
                <button className="rounded-md px-3 py-1.5 text-mut hover:text-ink">Salir</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
