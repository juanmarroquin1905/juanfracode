"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Login } from "@/components/login";
import { AsistenteApp } from "@/asistente/asistente-app";
import { createLocalStore } from "@/asistente/local-store";
import { supabase } from "@/lib/supabase";
import { createSupabaseStore } from "@/lib/supabase-store";

export default function Home() {
  if (!supabase) return <LocalMode />;
  return <CloudMode />;
}

// Sin claves de Supabase: guarda en este navegador.
function LocalMode() {
  const store = useMemo(() => createLocalStore("mi-asistente", false), []);
  return (
    <AsistenteApp
      store={store}
      topBar={
        <div className="relative z-20 bg-(--h-warn) px-4 py-2 text-center text-sm font-semibold text-(--h-bg)">
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
    <AsistenteApp
      key={session.user.id}
      store={store}
      topBar={
        <div className="relative z-20 border-b border-(--h-line) text-sm">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2 sm:px-6">
            <span className="truncate text-(--h-mut)">{session.user.email}</span>
            <button type="button" onClick={() => db.auth.signOut()} className="ml-auto font-bold text-(--h-cyan)">
              Salir
            </button>
          </div>
        </div>
      }
    />
  );
}
