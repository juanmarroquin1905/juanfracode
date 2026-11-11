# Banco de preguntas por etapa

Usa estas preguntas como guía, no como guion. Haz **una por mensaje**, adapta las
palabras a la persona y salta las que ya respondió. En cada etapa hay una
**pregunta principal** (siempre) y **preguntas extra** (solo si hace falta aclarar).

Al cerrar cada etapa, resume en una línea lo que decidieron, por ejemplo:
"✅ Anotado: es para ti, la usarás desde el celular todos los días".

---

## Paso 1 de 7 · La idea

**Principal:** "¿Qué problema quieres resolver o qué quieres que haga tu app? Cuéntamelo
como se lo contarías a un amigo."

Extra (elige la que haga falta):
- "¿Cómo lo resuelves hoy? (cuaderno, notas del celular, Excel, WhatsApp, de memoria…)"
  → Esto te dice qué datos guarda y qué le molesta del método actual.
- "¿Qué es lo que más te molesta de hacerlo así?"
  → Esa molestia es la función número 1.
- "Si la app hiciera **una sola cosa** perfecta, ¿cuál sería?"

Cierra la etapa con:
- La idea en una frase: "Una app para **[quién]** que **[hace qué]** para **[lograr qué]**."
- Un nombre provisional (propónlo tú: corto, en el idioma de la persona, ej: "Mis
  gastos", "Turnos Fácil", "Mi Huerta").

Ejemplo de frase: "Una app para mí que anota mis gastos del día para saber en qué se me
va la plata cada mes."

---

## Paso 2 de 7 · Para quién

**Principal:** "¿Quién va a usar la app?"
1. Solo yo (recomendada para la primera app)
2. Yo y mi familia, pareja o equipo
3. Mis clientes o cualquier persona

Extra:
- "¿Desde dónde la usarás más?" 1. Celular · 2. Computadora · 3. Las dos
- "¿Cada cuánto la vas a abrir?" 1. Varias veces al día · 2. Una vez al día ·
  3. Una vez por semana · 4. De vez en cuando
- Si son clientes: "¿Tus clientes necesitan crear una cuenta, o solo ven algo (como un
  catálogo o una página de reservas)?"

Qué significa para la construcción:
- **Solo yo** → simple. Artefacto perfecto; en la versión publicada, login de una sola
  persona y se puede cerrar el registro.
- **Familia/equipo** → necesita versión publicada para compartir datos entre personas.
  Para la primera versión, sugiere que cada uno tenga su cuenta y sus propios datos, o
  una cuenta compartida. (Compartir datos entre cuentas es "para después" salvo que sea
  la esencia de la app.)
- **Clientes** → avisa con cariño que es más compleja. Propón empezar con una parte
  que use solo la persona (ej: ella gestiona los turnos; los clientes vienen en v2).
- **Celular** → diseño pensado para el pulgar: botones grandes, botón principal abajo.

---

## Paso 3 de 7 · Funciones

**Principal:** "¿Qué cosas tiene que poder hacer tu app? Dime todas las que se te
ocurran, sin filtro. Después elegimos juntos."

Luego tú:
1. Ordena la lista de más a menos importante.
2. Propón las **3 funciones principales** para la versión 1.
3. Pon el resto en **"Para después"**.
4. Pregunta: "¿Estás de acuerdo con estas 3 para empezar?"

Si la persona solo da una o dos funciones, propón las que faltan. Funciones típicas
que casi toda app pequeña necesita (ofrécelas si encajan):
- **Agregar / editar / borrar** algo (el corazón de casi toda app).
- **Ver una lista** con buscador o filtros.
- **Un resumen** con números o un gráfico simple (total del mes, racha, progreso).
- **Marcar como hecho** (tareas, hábitos, pedidos).
- **Recordatorio visual** (lo que vence hoy, lo atrasado en rojo).
- **Exportar** a Excel/CSV.

Funciones que casi siempre van a "Para después" en la primera app: notificaciones
push, pagos, chat entre usuarios, inteligencia artificial, mapas, integración con
WhatsApp u otras apps, roles y permisos complejos, varios idiomas.

---

## Paso 4 de 7 · Datos

**Principal:** "¿Qué cosas tiene que recordar tu app?" (ej: gastos, clientes, tareas,
recetas, entrenamientos).

Para cada cosa: "De cada **[cosa]**, ¿qué quieres anotar?" y ofrece una propuesta
para que solo diga sí o cambie algo, por ejemplo:

> De cada gasto anotaría: **monto**, **fecha**, **categoría** (comida, transporte…) y
> una **nota** opcional. ¿Le agrego o quito algo?

Reglas internas (no las digas así a la persona):
- Máximo **3 cosas** (tablas) en la versión 1. Si la persona quiere categorías
  fijas, pueden ser una lista fija en el código en vez de otra tabla.
- Cada cosa tiene `id`, `user_id` (si hay login), `created_at` y sus campos.
- Tipos simples: texto, número, fecha, sí/no, opción de una lista.
- Relaciones solo si son obvias (un cliente tiene muchas visitas).
- Anota cuáles campos son **obligatorios**.

Cierra mostrando los datos así (lenguaje humano, no SQL):

```
📦 Gasto: monto (obligatorio), fecha, categoría (comida / transporte / casa / otros), nota
📦 Presupuesto: categoría, límite por mes
```

---

## Paso 5 de 7 · Pantallas

**Principal:** propón tú las pantallas y pregunta si le sirven. Máximo 3:

- **Pantalla principal**: lo que ve al abrir (resumen + lista o lo más usado).
- **Agregar/editar**: normalmente un formulario en ventana (modal) o panel, no una
  pantalla aparte.
- **Una segunda vista** solo si hace falta (estadísticas, calendario, detalle).

Muestra un boceto en texto de la pantalla principal (como el de SKILL.md) y pregunta:
"¿Así te la imaginas o cambiarías algo?".

Extra:
- "¿Qué es lo primero que quieres ver al abrir la app?"
- "¿Prefieres ver tus cosas como **lista**, **tarjetas**, **tabla** o **calendario**?"
- Si es para celular: "¿Te gusta un menú abajo (como Instagram) o todo en una sola
  pantalla?" (recomienda una sola pantalla si hay 1–2 vistas).

---

## Paso 6 de 7 · Diseño

**Principal:** "¿Cómo quieres que se vea tu app?" y ofrece **4 estilos** de
`estilos.md` que encajen con la idea, con su descripción de una línea.

Extra (una por mensaje, solo las necesarias):
- "¿Modo claro u oscuro?" 1. Claro · 2. Oscuro · 3. Que siga al celular/compu
- "¿Tienes un color favorito o de tu marca?" (si dice uno, adapta la paleta)
- "¿Hay alguna app o web cuyo estilo te encante?" (inspírate en la sensación, nunca
  copies logos, nombres ni marcas)
- "¿Le dejamos el nombre **[nombre provisional]** o prefieres otro?" Ofrece 3
  alternativas cortas con su emoji.

Cierra con: estilo, color principal, modo, letra, nombre y emoji.

---

## Paso 7 de 7 · Cómo la quieres usar

Usa el texto de la etapa 7 en SKILL.md (artefacto / publicar / las dos).

Si elige publicar, pregunta en mensajes separados:
1. "¿Estás usando Claude Code en tu compu, o Claude en la web/app?"
2. "¿Ya tienes cuenta en GitHub, Vercel y Supabase? (si no, las creamos en el
   camino, son gratis)"
3. "¿Tienes Node.js instalado?" (solo en Claude Code; si no sabe, que corra
   `node -v` o lo revisas tú)

---

## Preguntas trampa que debes evitar

- ❌ "¿Qué stack quieres usar?" → el stack ya está decidido (Next.js + Supabase).
- ❌ "¿Qué base de datos prefieres?" → Supabase.
- ❌ "¿Quieres autenticación con OAuth, magic link o contraseña?" → correo y
  contraseña, explicado como "entrar con tu correo".
- ❌ "¿Qué arquitectura…?", "¿Qué componentes…?" → eso lo decides tú.
- ❌ Preguntar el mismo dato dos veces.
