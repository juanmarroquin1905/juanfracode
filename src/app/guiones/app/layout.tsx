import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";
import { ThemeToggle } from "@/components/theme";
import { getAdminUser, isDemo } from "@/lib/data";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: "VidScript", robots: { index: false } };

export default async function GuionesAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/login?next=/guiones/app");
  if (!user.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold text-ink">Esta cuenta no tiene acceso</h1>
          <p className="mt-2 text-sm text-mut">Entraste como {user.email}. VidScript es de uso privado por ahora.</p>
          <form action={logout} className="mt-6">
            <button className="btn-ghost">Salir</button>
          </form>
        </div>
      </main>
    );
  }
  return (
    <div className="flex min-h-screen flex-col lg:h-screen">
      {isDemo && <DemoBanner />}
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/guiones/app" className="flex items-center gap-2 font-bold text-ink">
            <span className="grid h-6 place-items-center rounded-lg bg-night px-1.5 font-mono text-[11px] text-white">{"</>"}</span>
            VidScript
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/guiones/app" className="rounded-full px-3 py-1.5 text-mut hover:text-ink">
              Mis videos
            </Link>
            <Link href="/" className="hidden rounded-full px-3 py-1.5 text-mut hover:text-ink sm:block">
              Web ↗
            </Link>
            <ThemeToggle />
            {!isDemo && (
              <form action={logout}>
                <button className="rounded-full px-3 py-1.5 text-mut hover:text-ink">Salir</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-5">{children}</main>
    </div>
  );
}
