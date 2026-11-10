"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import "@/viajes/viajes.css";

// Entrar o crear tu cuenta con correo y contraseña.
export function Login({ db }: { db: SupabaseClient }) {
  const [mode, setMode] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "entrar") {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) setMsg({ text: "Correo o contraseña incorrectos." });
    } else {
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) setMsg({ text: error.message });
      else if (!data.session) setMsg({ ok: true, text: "Listo. Revisa tu correo y confirma tu cuenta para entrar." });
    }
    setBusy(false);
  }

  return (
    <main className="vj grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="vj-ticket w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-xl bg-(--vj-ink) text-xl">✈️</span>
          <div>
            <h1 className="vj-serif text-2xl font-semibold">Mis viajes</h1>
            <p className="text-xs text-(--vj-mut)">{mode === "entrar" ? "Entra a tu cuenta" : "Crea tu cuenta"}</p>
          </div>
        </div>
        <div>
          <label className="vj-label" htmlFor="email">Correo</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="vj-input" />
        </div>
        <div>
          <label className="vj-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="vj-input"
          />
        </div>
        {msg && <p className={`text-sm ${msg.ok ? "text-(--vj-teal)" : "text-(--vj-red)"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="vj-btn w-full">
          {busy ? "Un momento…" : mode === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "entrar" ? "crear" : "entrar")} className="w-full text-center text-sm font-semibold text-(--vj-red)">
          {mode === "entrar" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
