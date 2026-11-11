# Construcción B: proyecto Next.js + Supabase

Un proyecto pequeño, ordenado y fácil de entender para alguien que empieza. Todo el
código lleva comentarios cortos en el idioma de la persona explicando qué hace cada
archivo.

## Stack (no lo cambies sin motivo)

- **Next.js** (App Router, versión estable más reciente) + **TypeScript**
- **Tailwind CSS** v4
- **@supabase/supabase-js** (login con correo y contraseña + base de datos)
- Sin otras librerías salvo que la app las necesite de verdad (por ejemplo `recharts`
  para gráficos).

Decisión clave para principiantes: la app es **del lado del cliente** (componentes con
`"use client"`) y habla con Supabase directo desde el navegador. La seguridad la pone
**Row Level Security** en la base de datos (ver `supabase.md`). Así no hay rutas de
servidor, ni middleware, ni cookies que configurar.

## Estructura de carpetas

```
mi-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← fuentes, título y fondo
│   │   ├── globals.css      ← Tailwind + colores del estilo
│   │   └── page.tsx         ← decide: login, app con Supabase o modo local
│   ├── components/
│   │   ├── login.tsx        ← entrar / crear cuenta
│   │   └── app.tsx          ← la app (pantallas, formulario, lista…)
│   └── lib/
│       ├── supabase.ts      ← conexión (o null si no hay claves)
│       ├── types.ts         ← cómo es cada "cosa" que guarda la app
│       └── store.ts         ← guardar/leer: en Supabase o en el navegador
├── supabase/
│   └── schema.sql           ← tablas + seguridad (se pega en Supabase)
├── .env.example             ← qué claves hacen falta
├── .gitignore
├── LICENSE                  ← MIT con el nombre de la persona
├── README.md                ← cómo probarla y publicarla
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

Si la app es más grande, divide `app.tsx` en varios componentes dentro de
`src/components/` (ej: `gasto-form.tsx`, `resumen.tsx`), pero mantén pocos archivos.

## Cómo crear el proyecto

**En Claude Code:**

```bash
npx create-next-app@latest mi-app --ts --tailwind --app --src-dir --eslint --use-npm --import-alias "@/*" --yes
cd mi-app
npm install @supabase/supabase-js
```

Luego reemplaza y agrega los archivos de abajo. Después: `npm run build` (debe pasar
sin errores) y `npm run dev` para verla en http://localhost:3000.

**Sin terminal (claude.ai):** entrega todos los archivos de abajo, incluidos
`package.json`, `tsconfig.json`, `next.config.ts` y `postcss.config.mjs`, para que el
proyecto funcione con solo subirlo a GitHub. Vercel instala todo solo.

## Archivos base

### `package.json`

```json
{
  "name": "mi-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "next": "^16",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

(Si usas `create-next-app`, deja las versiones que instaló.)

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

### `postcss.config.mjs`

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

(Next.js puede ajustar `jsx` y otras opciones solo en el primer build; es normal.)

### `.gitignore`

```
node_modules
.next
out
.env*.local
.env
.vercel
*.tsbuildinfo
next-env.d.ts
```

### `.env.example`

```bash
# Copia este archivo como .env.local y pega tus claves de Supabase
# (Supabase → botón Connect, o Project Settings → API Keys).
# Si lo dejas vacío, la app funciona en "modo local" (guarda en tu navegador).
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### `src/lib/supabase.ts`

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Las claves vienen de las variables de entorno (.env.local o Vercel).
// La "publishable key" (o la antigua "anon key") es pública: la seguridad la pone
// Row Level Security en la base de datos.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sin claves → null → la app usa el "modo local".
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
```

### `src/lib/types.ts` (ejemplo: app de gastos)

```ts
// Cómo es cada gasto. Debe coincidir con la tabla de supabase/schema.sql.
export type Gasto = {
  id: string;
  monto: number;
  fecha: string; // AAAA-MM-DD
  categoria: string;
  nota: string;
  created_at?: string;
};

export type NuevoGasto = Omit<Gasto, "id" | "created_at">;
```

### `src/lib/store.ts`

Una sola "puerta" para guardar y leer. La app no sabe si guarda en Supabase o en el
navegador: así funciona igual en los dos modos.

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Gasto, NuevoGasto } from "./types";

export interface Store {
  listar(): Promise<Gasto[]>;
  agregar(g: NuevoGasto): Promise<Gasto>;
  editar(id: string, cambios: Partial<NuevoGasto>): Promise<void>;
  borrar(id: string): Promise<void>;
}

// --- Modo Supabase: cada persona ve solo lo suyo (lo garantiza RLS) ---
export function supabaseStore(db: SupabaseClient): Store {
  return {
    async listar() {
      const { data, error } = await db.from("gastos").select("*").order("fecha", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((g) => ({ ...g, monto: Number(g.monto) }));
    },
    async agregar(g) {
      const { data, error } = await db.from("gastos").insert(g).select().single();
      if (error) throw error;
      return { ...data, monto: Number(data.monto) };
    },
    async editar(id, cambios) {
      const { error } = await db.from("gastos").update(cambios).eq("id", id);
      if (error) throw error;
    },
    async borrar(id) {
      const { error } = await db.from("gastos").delete().eq("id", id);
      if (error) throw error;
    },
  };
}

// --- Modo local: guarda en el navegador (para probar sin Supabase) ---
const KEY = "mi-app-gastos";
const leer = (): Gasto[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};
const escribir = (g: Gasto[]) => localStorage.setItem(KEY, JSON.stringify(g));

export function localStore(): Store {
  return {
    async listar() {
      return leer().sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    async agregar(g) {
      const nuevo = { ...g, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      escribir([nuevo, ...leer()]);
      return nuevo;
    },
    async editar(id, cambios) {
      escribir(leer().map((g) => (g.id === id ? { ...g, ...cambios } : g)));
    },
    async borrar(id) {
      escribir(leer().filter((g) => g.id !== id));
    },
  };
}
```

Si la app tiene varias "cosas" (tablas), repite el patrón por cada una o crea un
`store` genérico que reciba el nombre de la tabla. En modo Supabase **no** envíes
`user_id`: la tabla lo pone sola con `default auth.uid()`.

### `src/app/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { localStore, supabaseStore } from "@/lib/store";
import { Login } from "@/components/login";
import { App } from "@/components/app";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Sin Supabase: modo local, sin login.
  if (!supabase) return <App store={localStore()} modoLocal />;
  if (cargando) return <main className="grid min-h-screen place-items-center">Cargando…</main>;
  if (!session) return <Login db={supabase} />;
  return <App store={supabaseStore(supabase)} onSalir={() => supabase!.auth.signOut()} email={session.user.email} />;
}
```

### `src/components/login.tsx`

```tsx
"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

// Entrar o crear cuenta con correo y contraseña.
export function Login({ db }: { db: SupabaseClient }) {
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok?: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setMsg(null);
    if (modo === "entrar") {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) setMsg({ texto: "Correo o contraseña incorrectos." });
    } else {
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) setMsg({ texto: error.message });
      else if (!data.session) setMsg({ ok: true, texto: "¡Listo! Revisa tu correo y confirma tu cuenta para entrar." });
    }
    setOcupado(false);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold">💸 Mis gastos</h1>
        <p className="text-sm text-gray-500">{modo === "entrar" ? "Entra a tu cuenta" : "Crea tu cuenta"}</p>
        <label className="block text-sm font-medium">
          Correo
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={modo === "entrar" ? "current-password" : "new-password"} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.texto}</p>}
        <button disabled={ocupado} className="w-full rounded-lg bg-black py-2.5 font-semibold text-white disabled:opacity-60">
          {ocupado ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setModo(modo === "entrar" ? "crear" : "entrar")} className="w-full text-sm text-gray-600 underline">
          {modo === "entrar" ? "¿Primera vez? Crea tu cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
```

(Aplica el estilo elegido: colores, radios, sombras y fuente de `estilos.md`.)

### `src/components/app.tsx`

Aquí va la app de verdad, construida a partir de la ficha. Recibe:

```tsx
type Props = { store: Store; modoLocal?: boolean; email?: string; onSalir?: () => void };
```

- Carga los datos con `store.listar()` en un `useEffect`, con estado de carga y de error.
- Agrega/edita/borra con el `store` y actualiza el estado local al momento (la app
  se siente rápida).
- Si `modoLocal`, muestra una franja discreta: "Modo local: tus datos se guardan en
  este navegador. Conecta Supabase para usarla desde cualquier lugar."
- Arriba a la derecha: el correo de la persona y un botón "Salir" (si hay sesión).
- Muestra errores de forma amable ("No se pudo guardar. Revisa tu internet e
  inténtalo de nuevo.") y nunca un error técnico en crudo.

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google"; // la fuente del estilo elegido
import "./globals.css";

const fuente = Nunito({ subsets: ["latin"], variable: "--font-app" });

export const metadata: Metadata = {
  title: "Mis gastos",
  description: "Anota tus gastos y mira en qué se te va la plata.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fuente.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### `src/app/globals.css`

```css
@import "tailwindcss";

/* Colores del estilo elegido: cámbialos aquí y cambia toda la app. */
@theme {
  --color-fondo: #f4f1ff;
  --color-tarjeta: #ffffff;
  --color-acento: #7c3aed;
  --color-texto: #2e1065;
  --color-suave: #6b5b95;
  --font-sans: var(--font-app), system-ui, sans-serif;
}

body {
  background: var(--color-fondo);
  color: var(--color-texto);
}
```

Con `@theme`, Tailwind crea clases como `bg-acento`, `text-suave` o `bg-tarjeta`.

### `README.md`

En el idioma de la persona. Secciones:
1. Qué es la app (una frase) y qué hace (las 3 funciones).
2. **Pruébala en tu compu**: `npm install` → `npm run dev` → abrir
   http://localhost:3000 (funciona en modo local sin claves).
3. **Ponla en internet**: resumen de `deploy-vercel.md` (Supabase → SQL → GitHub →
   Vercel → variables → Deploy).
4. **Dónde está cada cosa**: tabla con los archivos principales.
5. Licencia MIT.

### `LICENSE`

Licencia MIT con el año actual y el nombre de la persona (pregúntalo o usa el nombre
de la app si no quiere darlo).

## Reglas de código

- Componentes pequeños y con nombres claros en el idioma de la persona o en inglés
  (consistente en todo el proyecto).
- Comentarios cortos que expliquen el **porqué**, pensados para alguien que aprende.
- Nada de `any`. Tipos simples en `types.ts`.
- Montos con `numeric` en la base de datos y `Number(...)` al leerlos (Supabase
  devuelve `numeric` como texto en algunos casos).
- Fechas como `AAAA-MM-DD` (tipo `date` en Supabase). Formatea al mostrar con `Intl`.
- Antes de entregar: `npm run build` sin errores (en Claude Code).
