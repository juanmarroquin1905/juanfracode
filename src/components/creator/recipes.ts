// Recetas del creador: cada una es una app lista que se elige escribiendo la idea
// ("las citas de mi barbería") o tocando un ejemplo. Para sumar una, agrégala a RECIPES.

import type { TypeId } from "./options";

export type FieldType = "text" | "longtext" | "number" | "money" | "date" | "time" | "phone" | "stars" | "check" | "options";

export type Field = { key: string; label: string; type: FieldType; on: boolean; options?: string[]; custom?: boolean };

export const FIELD_TYPES: { id: FieldType; label: string; hint: string }[] = [
  { id: "text", label: "Texto corto", hint: "Un nombre, una palabra" },
  { id: "longtext", label: "Texto largo", hint: "Notas, descripciones" },
  { id: "number", label: "Número", hint: "Cantidades" },
  { id: "money", label: "Precio", hint: "Montos de dinero" },
  { id: "date", label: "Fecha", hint: "Día del calendario" },
  { id: "time", label: "Hora", hint: "Ej: 3:30 pm" },
  { id: "phone", label: "Teléfono", hint: "Se puede llamar con un toque" },
  { id: "stars", label: "Estrellas", hint: "Calificar del 1 al 5" },
  { id: "check", label: "Sí / No", hint: "Una casilla para marcar" },
  { id: "options", label: "Opciones", hint: "Elegir de una lista" },
];

export type Recipe = {
  id: string;
  emoji: string;
  title: string; // en los ejemplos
  name: string; // nombre de la app
  description: string;
  keywords: string[];
  type: TypeId | "coleccion";
  itemName?: string; // en singular: "cita", "cliente"
  fields?: Field[];
  samples?: Record<string, string | number | boolean>[]; // en fechas, un número = días desde hoy
  categories: string[];
  sortByDate?: boolean;
};

const f = (key: string, label: string, type: FieldType, on = true, options?: string[]): Field => ({ key, label, type, on, options });

export const RECIPES: Recipe[] = [
  {
    id: "citas",
    emoji: "📅",
    title: "Citas",
    name: "Mis citas",
    description: "Agenda simple de citas y turnos.",
    keywords: ["cita", "turno", "reserva", "agenda", "barberia", "peluqueria", "salon", "consultorio", "manicure", "spa", "estetica", "masaje"],
    type: "coleccion",
    itemName: "cita",
    fields: [
      f("cliente", "Cliente", "text"),
      f("fecha", "Fecha", "date"),
      f("hora", "Hora", "time"),
      f("servicio", "Servicio", "options", true, ["Corte", "Barba", "Tinte"]),
      f("precio", "Precio", "money"),
      f("pagado", "Pagado", "check"),
      f("telefono", "Teléfono", "phone", false),
      f("nota", "Nota", "longtext", false),
    ],
    samples: [
      { cliente: "Carlos Ruiz", fecha: 0, hora: "10:00", servicio: "Corte", precio: 25, pagado: true },
      { cliente: "Ana Torres", fecha: 1, hora: "16:30", servicio: "Tinte", precio: 80, pagado: false },
      { cliente: "Luis Gómez", fecha: 2, hora: "12:00", servicio: "Barba", precio: 15, pagado: false },
    ],
    categories: [],
    sortByDate: true,
  },
  {
    id: "clientes",
    emoji: "👥",
    title: "Clientes",
    name: "Mis clientes",
    description: "Mis clientes y en qué quedamos.",
    keywords: ["cliente", "crm", "prospecto", "contacto", "negocio", "emprendimiento"],
    type: "coleccion",
    itemName: "cliente",
    fields: [
      f("nombre", "Nombre", "text"),
      f("telefono", "Teléfono", "phone"),
      f("estado", "Estado", "options", true, ["Nuevo", "Interesado", "Cliente"]),
      f("nota", "Nota", "longtext"),
      f("negocio", "Empresa", "text", false),
      f("valor", "Valor", "money", false),
    ],
    samples: [
      { nombre: "María López", telefono: "+51 999 111 222", estado: "Interesado", nota: "Quiere cotización para 10 polos." },
      { nombre: "Pedro Sánchez", telefono: "+51 988 333 444", estado: "Cliente", nota: "Compra cada mes." },
      { nombre: "Lucía Fernández", telefono: "+51 977 555 666", estado: "Nuevo", nota: "" },
    ],
    categories: [],
  },
  {
    id: "pedidos",
    emoji: "🧾",
    title: "Pedidos",
    name: "Mis pedidos",
    description: "Pedidos por entregar y cobrar.",
    keywords: ["pedido", "venta", "vender", "delivery", "encargo", "orden", "envio", "emprendimiento"],
    type: "coleccion",
    itemName: "pedido",
    fields: [
      f("cliente", "Cliente", "text"),
      f("producto", "Producto", "text"),
      f("total", "Total", "money"),
      f("entregado", "Entregado", "check"),
      f("pagado", "Pagado", "check"),
      f("fecha", "Fecha de entrega", "date", false),
      f("telefono", "Teléfono", "phone", false),
    ],
    samples: [
      { cliente: "Rosa Díaz", producto: "Torta de chocolate", total: 60, entregado: false, pagado: true },
      { cliente: "Jorge Ramos", producto: "12 cupcakes", total: 36, entregado: true, pagado: true },
      { cliente: "Elena Vargas", producto: "Cheesecake", total: 45, entregado: false, pagado: false },
    ],
    categories: [],
  },
  {
    id: "inventario",
    emoji: "📦",
    title: "Inventario",
    name: "Mi inventario",
    description: "Qué tengo y cuánto queda.",
    keywords: ["inventario", "stock", "producto", "tienda", "almacen", "bodega", "mercaderia", "existencia"],
    type: "coleccion",
    itemName: "producto",
    fields: [
      f("producto", "Producto", "text"),
      f("cantidad", "Cantidad", "number"),
      f("precio", "Precio", "money"),
      f("proveedor", "Proveedor", "text", false),
      f("agotado", "Por reponer", "check", false),
    ],
    samples: [
      { producto: "Polos negros talla M", cantidad: 24, precio: 35 },
      { producto: "Gorras", cantidad: 8, precio: 25 },
      { producto: "Medias deportivas", cantidad: 40, precio: 8 },
    ],
    categories: [],
  },
  {
    id: "deudas",
    emoji: "🤝",
    title: "Deudas y préstamos",
    name: "Cuentas por cobrar",
    description: "Quién me debe y quién ya pagó.",
    keywords: ["deuda", "debe", "debo", "prestamo", "preste", "fiado", "cobrar", "cuenta"],
    type: "coleccion",
    itemName: "deuda",
    fields: [
      f("persona", "Persona", "text"),
      f("monto", "Monto", "money"),
      f("fecha", "Fecha", "date"),
      f("pagado", "Pagado", "check"),
      f("nota", "Nota", "longtext", false),
    ],
    samples: [
      { persona: "Tío Roberto", monto: 200, fecha: -10, pagado: false },
      { persona: "Camila", monto: 50, fecha: -3, pagado: true },
    ],
    categories: [],
  },
  {
    id: "alumnos",
    emoji: "🎓",
    title: "Alumnos",
    name: "Mis alumnos",
    description: "Alumnos, pagos y avances.",
    keywords: ["alumno", "estudiante", "clase", "curso", "colegio", "academia", "profesor", "taller", "tutoria"],
    type: "coleccion",
    itemName: "alumno",
    fields: [
      f("nombre", "Nombre", "text"),
      f("curso", "Curso", "text"),
      f("pago", "Pagó el mes", "check"),
      f("calificacion", "Calificación", "number", false),
      f("telefono", "Teléfono", "phone", false),
    ],
    samples: [
      { nombre: "Sofía Medina", curso: "Guitarra", pago: true },
      { nombre: "Diego Castro", curso: "Piano", pago: false },
      { nombre: "Valeria Rojas", curso: "Guitarra", pago: true },
    ],
    categories: [],
  },
  {
    id: "recetas",
    emoji: "🍳",
    title: "Recetas",
    name: "Mis recetas",
    description: "Mis platos favoritos, a la mano.",
    keywords: ["receta", "cocina", "cocinar", "plato", "comida", "postre", "menu"],
    type: "coleccion",
    itemName: "receta",
    fields: [
      f("nombre", "Plato", "text"),
      f("ingredientes", "Ingredientes", "longtext"),
      f("tiempo", "Minutos", "number"),
      f("dificultad", "Dificultad", "options", true, ["Fácil", "Media", "Difícil"]),
      f("estrellas", "Me gusta", "stars"),
    ],
    samples: [
      { nombre: "Tallarines verdes", ingredientes: "Fideos, albahaca, espinaca, queso fresco, leche.", tiempo: 30, dificultad: "Fácil", estrellas: 5 },
      { nombre: "Ají de gallina", ingredientes: "Pollo, ají amarillo, pan, leche, nueces.", tiempo: 60, dificultad: "Media", estrellas: 4 },
    ],
    categories: [],
  },
  {
    id: "compras",
    emoji: "🛒",
    title: "Lista de compras",
    name: "Lista de compras",
    description: "Lo que falta comprar.",
    keywords: ["compra", "supermercado", "mercado", "despensa", "comprar", "lista de compras"],
    type: "coleccion",
    itemName: "producto",
    fields: [f("producto", "Producto", "text"), f("cantidad", "Cantidad", "number"), f("comprado", "Comprado", "check"), f("precio", "Precio", "money", false)],
    samples: [
      { producto: "Leche", cantidad: 2, comprado: false },
      { producto: "Pan", cantidad: 1, comprado: true },
      { producto: "Huevos", cantidad: 12, comprado: false },
    ],
    categories: [],
  },
  {
    id: "libros",
    emoji: "📚",
    title: "Libros",
    name: "Mis libros",
    description: "Lo que leo y lo que quiero leer.",
    keywords: ["libro", "lectura", "leer", "biblioteca", "novela"],
    type: "coleccion",
    itemName: "libro",
    fields: [
      f("titulo", "Título", "text"),
      f("autor", "Autor", "text"),
      f("estado", "Estado", "options", true, ["Por leer", "Leyendo", "Leído"]),
      f("estrellas", "Calificación", "stars"),
    ],
    samples: [
      { titulo: "Cien años de soledad", autor: "Gabriel García Márquez", estado: "Leído", estrellas: 5 },
      { titulo: "Hábitos atómicos", autor: "James Clear", estado: "Leyendo", estrellas: 4 },
    ],
    categories: [],
  },
  {
    id: "peliculas",
    emoji: "🎬",
    title: "Películas y series",
    name: "Por ver",
    description: "Películas y series que quiero ver.",
    keywords: ["pelicula", "serie", "netflix", "anime", "cine"],
    type: "coleccion",
    itemName: "título",
    fields: [
      f("titulo", "Título", "text"),
      f("tipo", "Tipo", "options", true, ["Película", "Serie", "Anime"]),
      f("vista", "Ya la vi", "check"),
      f("estrellas", "Calificación", "stars"),
    ],
    samples: [
      { titulo: "Interestelar", tipo: "Película", vista: true, estrellas: 5 },
      { titulo: "Dark", tipo: "Serie", vista: false, estrellas: 0 },
    ],
    categories: [],
  },
  {
    id: "mascotas",
    emoji: "🐶",
    title: "Mascotas",
    name: "Cuidado de mis mascotas",
    description: "Vacunas, baños y visitas al veterinario.",
    keywords: ["mascota", "perro", "gato", "veterinario", "vacuna", "perrito", "gatito"],
    type: "coleccion",
    itemName: "cuidado",
    fields: [
      f("mascota", "Mascota", "text"),
      f("cuidado", "Cuidado", "options", true, ["Vacuna", "Baño", "Desparasitación", "Veterinario"]),
      f("fecha", "Fecha", "date"),
      f("hecho", "Hecho", "check"),
    ],
    samples: [
      { mascota: "Firulais", cuidado: "Vacuna", fecha: 5, hecho: false },
      { mascota: "Michi", cuidado: "Baño", fecha: -2, hecho: true },
    ],
    categories: [],
    sortByDate: true,
  },
  {
    id: "entrenos",
    emoji: "🏋️",
    title: "Entrenamientos",
    name: "Mis entrenamientos",
    description: "Ejercicios, series y pesos.",
    keywords: ["gimnasio", "gym", "ejercicio", "entreno", "entrenamiento", "pesas", "correr", "fitness"],
    type: "coleccion",
    itemName: "ejercicio",
    fields: [
      f("ejercicio", "Ejercicio", "text"),
      f("series", "Series", "number"),
      f("repeticiones", "Repeticiones", "number"),
      f("peso", "Peso (kg)", "number"),
      f("fecha", "Fecha", "date", false),
    ],
    samples: [
      { ejercicio: "Sentadillas", series: 4, repeticiones: 12, peso: 40 },
      { ejercicio: "Press de banca", series: 3, repeticiones: 10, peso: 30 },
    ],
    categories: [],
  },
  {
    id: "medicinas",
    emoji: "💊",
    title: "Medicinas",
    name: "Mis medicinas",
    description: "Qué tomar y a qué hora.",
    keywords: ["medicamento", "medicina", "pastilla", "remedio", "tratamiento", "salud", "dosis"],
    type: "coleccion",
    itemName: "medicina",
    fields: [f("medicina", "Medicina", "text"), f("dosis", "Dosis", "text"), f("hora", "Hora", "time"), f("tomada", "Tomada hoy", "check")],
    samples: [
      { medicina: "Vitamina C", dosis: "1 tableta", hora: "08:00", tomada: true },
      { medicina: "Omega 3", dosis: "2 cápsulas", hora: "20:00", tomada: false },
    ],
    categories: [],
  },
  {
    id: "cumples",
    emoji: "🎂",
    title: "Cumpleaños",
    name: "Cumpleaños",
    description: "Para no olvidar ningún cumple.",
    keywords: ["cumpleanos", "cumple", "aniversario", "fechas especiales"],
    type: "coleccion",
    itemName: "cumpleaños",
    fields: [f("nombre", "Nombre", "text"), f("fecha", "Fecha", "date"), f("regalo", "Idea de regalo", "text", false)],
    samples: [
      { nombre: "Mamá", fecha: 12 },
      { nombre: "Andrés", fecha: 40 },
    ],
    categories: [],
    sortByDate: true,
  },
  {
    id: "invitados",
    emoji: "🎉",
    title: "Invitados",
    name: "Lista de invitados",
    description: "Quién viene a la fiesta.",
    keywords: ["invitado", "fiesta", "evento", "boda", "quinceanero", "baby shower", "reunion"],
    type: "coleccion",
    itemName: "invitado",
    fields: [f("nombre", "Nombre", "text"), f("personas", "Personas", "number"), f("confirmo", "Confirmó", "check"), f("telefono", "Teléfono", "phone", false)],
    samples: [
      { nombre: "Familia Pérez", personas: 4, confirmo: true },
      { nombre: "Kevin", personas: 1, confirmo: false },
    ],
    categories: [],
  },
  {
    id: "proyectos",
    emoji: "💼",
    title: "Proyectos",
    name: "Mis proyectos",
    description: "Trabajos, entregas y estado.",
    keywords: ["proyecto", "freelance", "trabajo", "entrega", "diseno", "cliente freelance"],
    type: "coleccion",
    itemName: "proyecto",
    fields: [
      f("proyecto", "Proyecto", "text"),
      f("cliente", "Cliente", "text"),
      f("entrega", "Entrega", "date"),
      f("estado", "Estado", "options", true, ["Por empezar", "En curso", "Terminado"]),
      f("precio", "Precio", "money", false),
    ],
    samples: [
      { proyecto: "Logo para cafetería", cliente: "Café Aroma", entrega: 4, estado: "En curso" },
      { proyecto: "Web de portafolio", cliente: "Daniela", entrega: 12, estado: "Por empezar" },
    ],
    categories: [],
    sortByDate: true,
  },
  {
    id: "suscripciones",
    emoji: "💳",
    title: "Pagos del mes",
    name: "Pagos del mes",
    description: "Servicios y suscripciones que pago.",
    keywords: ["suscripcion", "pago mensual", "pagos", "servicio", "recibo", "factura", "luz", "agua", "internet"],
    type: "coleccion",
    itemName: "pago",
    fields: [f("servicio", "Servicio", "text"), f("monto", "Monto", "money"), f("dia", "Día de pago", "number"), f("pagado", "Pagado", "check")],
    samples: [
      { servicio: "Internet", monto: 89, dia: 5, pagado: true },
      { servicio: "Spotify", monto: 19.9, dia: 15, pagado: false },
      { servicio: "Luz", monto: 120, dia: 20, pagado: false },
    ],
    categories: [],
  },
  {
    id: "plantas",
    emoji: "🌱",
    title: "Plantas",
    name: "Mis plantas",
    description: "Cuándo regar cada planta.",
    keywords: ["planta", "jardin", "regar", "huerto", "macetas"],
    type: "coleccion",
    itemName: "planta",
    fields: [f("planta", "Planta", "text"), f("lugar", "Lugar", "text"), f("riego", "Último riego", "date"), f("regada", "Regada hoy", "check")],
    samples: [
      { planta: "Monstera", lugar: "Sala", riego: -2, regada: false },
      { planta: "Albahaca", lugar: "Cocina", riego: 0, regada: true },
    ],
    categories: [],
  },
  {
    id: "metas",
    emoji: "🎯",
    title: "Metas",
    name: "Mis metas",
    description: "Lo que quiero lograr este año.",
    keywords: ["meta", "objetivo", "proposito", "sueno", "logro"],
    type: "coleccion",
    itemName: "meta",
    fields: [f("meta", "Meta", "text"), f("fecha", "Fecha límite", "date"), f("lograda", "Lograda", "check"), f("nota", "Por qué la quiero", "longtext", false)],
    samples: [
      { meta: "Ahorrar para un viaje", fecha: 120, lograda: false },
      { meta: "Terminar un curso online", fecha: 45, lograda: false },
    ],
    categories: [],
  },
  // Apps con pantalla especial
  { id: "tareas", emoji: "✅", title: "Tareas", name: "Mis pendientes", description: "Todo lo que tengo que hacer, en un solo lugar.", keywords: ["tarea", "pendiente", "to do", "todo", "hacer", "checklist", "quehacer"], type: "tareas", categories: ["Casa", "Trabajo", "Personal"] },
  { id: "habitos", emoji: "🔥", title: "Hábitos", name: "Mis hábitos", description: "Pequeños pasos todos los días.", keywords: ["habito", "rutina", "racha", "diario", "constancia"], type: "habitos", categories: ["Salud", "Mente", "Rutina"] },
  { id: "gastos", emoji: "💸", title: "Gastos", name: "Mis gastos", description: "Sé en qué se va mi dinero.", keywords: ["gasto", "gaste", "dinero", "finanza", "presupuesto", "plata", "ahorro", "ahorrar"], type: "gastos", categories: ["Comida", "Transporte", "Ocio", "Casa"] },
  { id: "notas", emoji: "📝", title: "Notas", name: "Mis notas", description: "Ideas y apuntes rápidos.", keywords: ["nota", "apunte", "idea", "escribir", "pensamiento"], type: "notas", categories: ["Ideas", "Personal", "Trabajo"] },
];

// Si la idea no se parece a ninguna receta: una lista simple que la persona ajusta.
export const GENERIC: Recipe = {
  id: "libre",
  emoji: "✨",
  title: "A mi manera",
  name: "Mi app",
  description: "",
  keywords: [],
  type: "coleccion",
  itemName: "elemento",
  fields: [f("nombre", "Nombre", "text"), f("detalle", "Detalle", "longtext"), f("fecha", "Fecha", "date", false), f("listo", "Listo", "check", false)],
  samples: [
    { nombre: "Primer ejemplo", detalle: "Cámbialo o bórralo cuando quieras." },
    { nombre: "Segundo ejemplo", detalle: "" },
  ],
  categories: [],
};

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n");

// Elige la receta que más se parece a lo que escribió la persona.
export function matchRecipe(idea: string): Recipe | null {
  const text = norm(idea);
  const words = text.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  let best: Recipe | null = null;
  let bestScore = 0;
  for (const r of RECIPES) {
    let score = 0;
    for (const k of r.keywords) {
      if (k.includes(" ")) {
        if (text.includes(k)) score += 2;
      } else if (words.some((w) => w.startsWith(k) || (w.length >= 4 && k.startsWith(w)))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

// "Quiero llevar el control de las citas de mi barbería" → "Citas de mi barbería"
export function nameFromIdea(idea: string) {
  const filler =
    /^(quiero|necesito|me gustar[ií]a|una?|app|aplicaci[oó]n|para|poder|llevar|tener|hacer|crear|organizar|anotar|guardar|apuntar|registrar|controlar|ver|el|la|los|las|lo|del?|mis?|tus?|sus?|control|registro|lista|seguimiento|cuenta|todo|todas?|todos|que)\s+/i;
  let s = idea.trim().replace(/[.!?¿¡]+/g, "");
  for (let i = 0; i < 12; i++) {
    const next = s.replace(filler, "");
    if (next === s) break;
    s = next;
  }
  s = s.trim();
  if (s.length < 3 || s.length > 36) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function cloneFields(fields: Field[] = []) {
  return fields.map((x) => ({ ...x, options: x.options ? [...x.options] : undefined }));
}
