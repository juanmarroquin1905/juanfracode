# Ficha de la app

Muéstrala completa antes de construir. Rellena todo con lo que decidieron; si algo
no se habló, pon tu propuesta y márcala con *(propuesta)*. Mantén el lenguaje
humano: nada de nombres de tablas ni términos técnicos en esta ficha.

```markdown
# [emoji] [Nombre de la app]

> [La idea en una frase: Una app para [quién] que [hace qué] para [lograr qué].]

## 👤 Para quién
- Quién la usa: [solo yo / familia o equipo / clientes]
- Desde dónde: [celular / computadora / los dos]
- Cada cuánto: [frecuencia]

## ⭐ Lo que hace (versión 1)
1. [Función 1]
2. [Función 2]
3. [Función 3]

## 📦 Lo que guarda
- **[Cosa 1]**: [campo], [campo], [campo]
- **[Cosa 2]**: [campo], [campo]

## 📱 Pantallas
1. **[Pantalla principal]**: [qué se ve]
2. **[Ventana de agregar/editar]**: [campos del formulario]
3. **[Otra, si hay]**: [qué se ve]

## 🎨 Diseño
- Estilo: [nombre del estilo] — [una línea de cómo se siente]
- Colores: [principal] + [secundario] · Modo [claro/oscuro]
- Letra: [fuente]

## 🚀 Cómo la vas a usar
- [Artefacto en Claude / Publicada en Vercel con Supabase / Las dos: primero artefacto]

## 🗒️ Para después (versión 2)
- [Idea que quedó fuera]
- [Idea que quedó fuera]
```

Cierra con: "¿Construyo esto? Si quieres cambiar algo, dime qué y lo ajusto."

## Traducción interna (solo para ti, no la muestres)

Antes de construir, convierte la ficha en un plan técnico mental:

- Cada "cosa que guarda" → una tabla (`snake_case`, plural en inglés o en el idioma
  de la persona, pero consistente) con `id uuid`, `user_id uuid`, `created_at` y sus
  campos tipados (`text`, `numeric`, `integer`, `date`, `boolean`, `text` con
  `check (... in (...))` para listas de opciones).
- Cada función → qué consultas necesita (listar, insertar, actualizar, borrar, sumar).
- Cada pantalla → componentes principales.
- El estilo → variables de color y fuentes de `estilos.md`.
