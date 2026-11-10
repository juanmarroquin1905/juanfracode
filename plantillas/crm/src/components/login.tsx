"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import "@/crm/crm.css";

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
    <main className="crm grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="crm-card w-full max-w-sm space-y-4 p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-(--c-pink) text-2xl">🤝</span>
          <div>
            <h1 className="crm-display text-2xl">Mi CRM</h1>
            <p className="text-sm text-(--c-mut)">{mode === "entrar" ? "¡Hola de nuevo! Entra a tu cuenta" : "Crea tu cuenta gratis"}</p>
          </div>
        </div>
        <div>
          <label className="crm-label" htmlFor="email">Correo</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="crm-input" />
        </div>
        <div>
          <label className="crm-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="crm-input"
          />
        </div>
        {msg && <p className={`text-sm font-semibold ${msg.ok ? "text-green-700" : "text-(--c-red)"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="crm-btn w-full">
          {busy ? "Un momento…" : mode === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "entrar" ? "crear" : "entrar")} className="w-full text-center text-sm font-bold text-(--c-violet)">
          {mode === "entrar" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
