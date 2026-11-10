"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Login } from "@/components/login";
import { createLocalStore } from "@/viajes/local-store";
import { TravelApp } from "@/viajes/travel-app";
import { supabase } from "@/lib/supabase";
import { createSupabaseStore } from "@/lib/supabase-store";

export default function Home() {
  if (!supabase) return <LocalMode />;
  return <CloudMode />;
}

// Sin claves de Supabase: guarda en este navegador.
function LocalMode() {
  const store = useMemo(() => createLocalStore("mis-viajes", false), []);
  return (
    <TravelApp
      store={store}
      topBar={
        <div className="border-b border-dashed border-(--vj-line) px-4 py-2 text-center text-xs text-(--vj-mut)">
          Modo local: tus viajes se guardan solo en este navegador. Conecta Supabase para guardarlos en la nube (mira el README).
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
    <TravelApp
      key={session.user.id}
      store={store}
      topBar={
        <div className="border-b border-dashed border-(--vj-line) text-xs text-(--vj-mut)">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 sm:px-6">
            <span className="truncate">{session.user.email}</span>
            <button type="button" onClick={() => db.auth.signOut()} className="ml-auto font-bold text-(--vj-red)">
              Salir
            </button>
          </div>
        </div>
      }
    />
  );
}
