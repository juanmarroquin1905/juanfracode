"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import "@/asistente/hud.css";

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
    <main className="hud grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="hud-panel relative z-10 w-full max-w-sm space-y-4 p-7">
        <div>
          <h1 className="hud-display hud-glow text-2xl font-bold">Nova</h1>
          <p className="mt-1 text-sm text-(--h-mut)">{mode === "entrar" ? "Identifícate para continuar" : "Crea tu cuenta gratis"}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-(--h-mut)" htmlFor="email">Correo</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="hud-input" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-(--h-mut)" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hud-input"
          />
        </div>
        {msg && <p className={`text-sm font-semibold ${msg.ok ? "text-(--h-ok)" : "text-(--h-red)"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="hud-btn w-full">
          {busy ? "Un momento…" : mode === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "entrar" ? "crear" : "entrar")} className="w-full text-center text-sm font-semibold text-(--h-cyan)">
          {mode === "entrar" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
