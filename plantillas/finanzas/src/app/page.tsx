"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Login } from "@/components/login";
import { FinanceApp } from "@/finanzas/finance-app";
import { createLocalStore } from "@/finanzas/local-store";
import { supabase } from "@/lib/supabase";
import { createSupabaseStore } from "@/lib/supabase-store";

export default function Home() {
  if (!supabase) return <LocalMode />;
  return <CloudMode />;
}

// Sin claves de Supabase: guarda en este navegador.
function LocalMode() {
  const store = useMemo(() => createLocalStore("mis-finanzas", false), []);
  return (
    <FinanceApp
      store={store}
      topBar={
        <div className="border-b border-line bg-white/70 px-4 py-2 text-center font-ui text-xs text-mut">
          Modo local: tus datos se guardan solo en este navegador. Conecta Supabase para guardarlos en la nube (mira el README).
        </div>
      }
    />
  );
}

// Con Supabase: pide entrar y guarda en tu base de datos.
function CloudMode() {
  const db = supabase!;
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const store = useMemo(() => createSupabaseStore(db), [db]);

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [db]);

  if (session === undefined) return null;
  if (!session) return <Login db={db} />;
  return (
    <FinanceApp
      key={session.user.id}
      store={store}
      topBar={
        <div className="border-b border-line bg-white/70 font-ui text-xs text-mut">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
            <span className="truncate">{session.user.email}</span>
            <button type="button" onClick={() => db.auth.signOut()} className="ml-auto font-medium text-accent">
              Salir
            </button>
          </div>
        </div>
      }
    />
  );
}
