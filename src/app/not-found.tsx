import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Este SaaS no existe (todavía)</h1>
        <Link href="/" className="btn mt-6">
          Ver todos los SaaS
        </Link>
      </div>
    </main>
  );
}
