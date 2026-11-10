# Mis viajes

Planificador de viajes con estilo de **pasaporte y postal**: pon el **destino**, tu **hotel**,
el **presupuesto**, anota los **gastos**, arma el **itinerario día por día con mapa** y marca
la **lista de qué llevar**. Hecho con Next.js, Supabase y Tailwind.
Plantilla gratis de **Juanfra Code** · Licencia MIT.

## Qué trae

- Tus viajes como postales: los que vienen (con cuenta regresiva) y los que ya hiciste (con sello de “Visitado”).
- Boleto de cada viaje con fechas, días, viajeros y **barra de gastado vs. presupuesto** por categoría.
- **Itinerario** por día con hora, lugar y notas. Marca lo que ya hiciste.
- **Mapa** con los lugares numerados por día y la ruta de cada día (OpenStreetMap, gratis y sin clave).
  Escribe el lugar y toca **Buscar en el mapa** para ubicarlo.
- **Alojamiento**: hotel, dirección, entrada y salida, noches, precio, si ya pagaste y código de reserva.
- **Gastos** por categoría (transporte, comida, actividades, compras, otros), por persona y por día.
- **Qué llevar**: lista por grupos con porcentaje de avance y una lista sugerida para empezar.
- Moneda a elegir por viaje. Funciona en el celular.
- Tu cuenta con correo y contraseña: cada persona ve solo sus viajes.

## Pruébala en tu computadora (2 minutos)

Necesitas [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin Supabase funciona en **modo local** (guarda en tu navegador).

## Ponla en internet con tu propio Supabase y Vercel

1. **Supabase**: crea un proyecto en [supabase.com](https://supabase.com) (gratis).
2. En tu proyecto: **SQL Editor → New query**, pega todo `supabase/schema.sql` y pulsa **Run**.
3. **GitHub**: crea un repositorio nuevo y sube esta carpeta (en GitHub: *Add file → Upload files*, arrastra todo menos `node_modules`).
4. **Vercel**: en [vercel.com](https://vercel.com) → **Add New → Project** → elige tu repositorio.
5. Antes de pulsar Deploy, abre **Environment Variables** y agrega (las sacas de Supabase → botón **Connect**, o *Project Settings → API*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (también sirve la *publishable key*)
6. Pulsa **Deploy**. Entra a tu web, toca **Crea tu cuenta** y listo.

### Consejos

- Supabase pide **confirmar el correo** al crear la cuenta. Si es solo para ti y no quieres
  esperar el correo, apágalo en *Authentication → Sign In / Providers → Email → Confirm email*.
- Cuando ya tengas tu cuenta, puedes impedir que otros se registren en
  *Authentication → Sign In / Providers → Allow new users to sign up* (apagado).
  Igual, cada cuenta ve solo sus propios datos.
- En el plan gratis, Supabase pausa el proyecto si pasa 1 semana sin uso. Se reactiva desde su panel.
- El mapa usa OpenStreetMap y CARTO, y el buscador de lugares usa Nominatim. Son gratis para uso
  personal; si tu app crece mucho, revisa sus reglas de uso.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `src/viajes/travel-app.tsx` | Portada con tus viajes y la ventana para crear o editar un viaje |
| `src/viajes/trip-view.tsx` | Un viaje: boleto, resumen, itinerario, gastos, alojamiento y qué llevar |
| `src/viajes/trip-map.tsx` | El mapa (sin librerías) |
| `src/viajes/viajes.css` | El estilo pasaporte: colores, sellos, boletos y postales |
| `src/viajes/seed.ts` | La lista sugerida de qué llevar |
| `src/lib/supabase-store.ts` | Cómo se guarda en Supabase |
| `src/viajes/local-store.ts` | Cómo se guarda en el navegador (modo local) |
| `supabase/schema.sql` | Las tablas y la seguridad de la base de datos |

¿Te sirvió? Busca **Juanfra Code** en TikTok, Instagram y YouTube.
