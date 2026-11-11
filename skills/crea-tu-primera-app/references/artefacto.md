# Construcción A: la app como artefacto de Claude

Un artefacto es una app que se abre al lado del chat y se puede usar al instante,
sin instalar nada. Es la forma más rápida de tener la app funcionando.

## Formato

- **Un solo archivo React** (`.jsx`) con un componente exportado por defecto. Usa
  React con hooks (`useState`, `useEffect`, `useMemo`).
- Estilos con **clases de Tailwind** (ya disponibles en los artefactos de Claude).
  Para colores exactos del estilo elegido usa valores arbitrarios
  (`bg-[#f4f1ff]`) o un bloque `<style>` dentro del componente con variables CSS.
- Íconos: `lucide-react` está disponible; si no, usa emojis.
- Gráficos: `recharts` está disponible para barras, líneas y donas simples.
- Fuentes de Google: agrégalas con un `<style>` que haga
  `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');`.
- Nada de llamadas a APIs externas ni claves. Todo funciona dentro del artefacto.
- Si el entorno no admite React, haz un único archivo HTML con JavaScript simple y
  el mismo diseño.

## Guardar datos sin perderlos

Los artefactos no siempre permiten `localStorage`. Usa este ayudante, que prueba
primero el almacenamiento propio del artefacto (`window.storage`, cuando existe),
después `localStorage`, y si nada está disponible guarda en memoria. Cópialo tal cual:

```jsx
const STORAGE_KEY = "mi-app-datos-v1"; // cambia "mi-app" por el nombre de la app

async function cargarDatos(porDefecto) {
  try {
    if (window.storage?.get) {
      const r = await window.storage.get(STORAGE_KEY);
      if (r?.value) return JSON.parse(r.value);
    }
  } catch {}
  try {
    const v = window.localStorage?.getItem(STORAGE_KEY);
    if (v) return JSON.parse(v);
  } catch {}
  return porDefecto;
}

async function guardarDatos(datos) {
  const texto = JSON.stringify(datos);
  try {
    if (window.storage?.set) {
      await window.storage.set(STORAGE_KEY, texto);
      return true;
    }
  } catch {}
  try {
    window.localStorage?.setItem(STORAGE_KEY, texto);
    return true;
  } catch {}
  return false; // solo en memoria: muestra el aviso de "exporta tus datos"
}
```

Uso dentro del componente:

```jsx
const [datos, setDatos] = useState(null);
const [persiste, setPersiste] = useState(true);

useEffect(() => { cargarDatos(DATOS_EJEMPLO).then(setDatos); }, []);
useEffect(() => { if (datos) guardarDatos(datos).then(setPersiste); }, [datos]);

if (!datos) return <PantallaCargando />;
```

Si `persiste` es `false`, muestra un aviso pequeño y amable: "Tus datos se guardan
mientras esta ventana esté abierta. Usa **Exportar** para guardar una copia." Y
agrega botones **Exportar** (descarga un `.json`) e **Importar** (lee ese `.json`).

Todo el estado de la app vive en **un solo objeto** (ej:
`{ gastos: [...], categorias: [...], ajustes: {...} }`), así guardar y exportar es
una sola línea. Cada elemento lleva `id` (usa `crypto.randomUUID()`), y fechas en
formato `AAAA-MM-DD`.

## Datos de ejemplo

Empieza con 5–10 elementos realistas en el idioma y país de la persona (nombres,
montos y monedas locales; fechas de los últimos días calculadas con `new Date()`,
nunca fechas fijas). Agrega un botón discreto **"Empezar de cero"** que pida
confirmación y deje la app vacía, y un estado vacío amable con botón para agregar
el primero.

## Estructura recomendada del archivo

```
1. Imports
2. Constantes: STORAGE_KEY, colores del estilo, opciones de listas (categorías…)
3. DATOS_EJEMPLO (función que genera fechas relativas a hoy)
4. Ayudantes: cargarDatos, guardarDatos, formatearMoneda, formatearFecha
5. Componentes pequeños: Tarjeta, Boton, Modal, EstadoVacio, Formulario…
6. Componente principal (export default): estado, efectos, pantallas
```

## Calidad mínima

- Diseño "mobile first": se ve perfecto a 375 px y crece a 2–3 columnas en compu.
- Formulario en un modal o panel con: título claro, campos con etiqueta, botón
  principal con verbo ("Guardar gasto") y botón "Cancelar".
- Confirmación antes de borrar. Validación con mensajes claros.
- Moneda y fechas con `Intl.NumberFormat` e `Intl.DateTimeFormat` en el idioma/país
  de la persona.
- Pequeñas animaciones (transiciones de 150–250 ms) y estados `hover`/`active`.
- Accesible: botones reales (`<button>`), `aria-label` en botones de solo ícono,
  foco visible.

## Al entregarlo

Escribe 3 líneas:
1. Qué puede hacer ya ("Agrega un gasto con el botón + de arriba").
2. Dónde se guardan sus datos (en el artefacto / exportando).
3. 2–3 mejoras concretas para la siguiente vuelta, y la pregunta "¿La publicamos en
   internet con tu propio link?" si eligió "las dos".

Para iterar: cuando pida cambios, edita el mismo artefacto (no crees uno nuevo) y
conserva la misma `STORAGE_KEY` para que no pierda sus datos. Si cambias la forma de
los datos, sube la versión (`-v2`) y migra los datos viejos al cargar.
