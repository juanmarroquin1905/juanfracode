import type { Activity, Expense, PackGroup, PackItem, Stay, Trip, TripData } from "./types";
import { addDays, today, uid } from "./utils";

// Lista sugerida de "qué llevar" para un viaje nuevo.
export const SUGGESTED_PACKING: [PackGroup, string][] = [
  ["documentos", "Pasaporte o DNI"],
  ["documentos", "Pasajes y reservas (impresos o en el celular)"],
  ["documentos", "Seguro de viaje"],
  ["documentos", "Tarjetas y algo de efectivo"],
  ["ropa", "Ropa para cada día"],
  ["ropa", "Casaca o abrigo"],
  ["ropa", "Zapatillas cómodas"],
  ["ropa", "Pijama"],
  ["aseo", "Cepillo y pasta de dientes"],
  ["aseo", "Bloqueador solar"],
  ["aseo", "Desodorante"],
  ["tecnologia", "Cargador del celular"],
  ["tecnologia", "Batería portátil"],
  ["tecnologia", "Adaptador de enchufe"],
  ["botiquin", "Medicinas personales"],
  ["botiquin", "Pastillas para el mareo o el dolor"],
  ["otros", "Botella de agua"],
  ["otros", "Lentes de sol"],
];

export const suggestedPacking = (trip_id: string): PackItem[] =>
  SUGGESTED_PACKING.map(([group, name]) => ({ id: uid(), trip_id, name, group, checked: false }));

export const emptyTrip = (): Trip => {
  const start = addDays(today(), 30);
  return {
    id: "",
    name: "",
    destination: "",
    flag: "✈️",
    start_date: start,
    end_date: addDays(start, 4),
    budget: null,
    currency: "USD",
    travelers: 1,
    color: "#2f5d8a",
    notes: "",
  };
};

// Viajes de ejemplo para la demo. Las fechas se calculan desde hoy para que
// siempre haya un viaje que viene pronto y otro que ya pasó.
export function sampleTrips(): { trips: Trip[]; data: Record<string, TripData> } {
  const t = today();

  // 1) Viaje que viene: Cusco y Machu Picchu
  const cusco: Trip = {
    id: uid(),
    name: "Cusco y Machu Picchu",
    destination: "Cusco, Perú",
    flag: "🇵🇪",
    start_date: addDays(t, 18),
    end_date: addDays(t, 23),
    budget: 1800,
    currency: "USD",
    travelers: 2,
    color: "#c4472f",
    notes: "Llevar soles en efectivo para los mercados. Tomar mate de coca el primer día por la altura.",
  };
  const d = (n: number) => addDays(cusco.start_date, n);
  const act = (n: number, time: string, title: string, place: string, lat: number | null, lng: number | null, notes = ""): Activity => ({
    id: uid(),
    trip_id: cusco.id,
    date: d(n),
    time,
    title,
    place,
    notes,
    lat,
    lng,
    done: false,
  });
  const cuscoActs: Activity[] = [
    act(0, "09:40", "Llegada al aeropuerto", "Aeropuerto Alejandro Velasco Astete", -13.5357, -71.9388, "Vuelo LA2021 desde Lima"),
    act(0, "12:00", "Check-in y descanso (altura)", "Casa San Blas", -13.5159, -71.9752),
    act(0, "16:30", "Paseo por la Plaza de Armas", "Plaza de Armas de Cusco", -13.5167, -71.9787),
    act(0, "19:30", "Cena en San Blas", "Barrio de San Blas", -13.5147, -71.9741),
    act(1, "09:00", "Qorikancha", "Qorikancha", -13.5203, -71.9757, "Entrada aprox. 15 soles"),
    act(1, "11:30", "Mercado de San Pedro", "Mercado San Pedro", -13.5215, -71.984, "Probar jugos y chicharrón"),
    act(1, "15:00", "Sacsayhuamán", "Sacsayhuamán", -13.5094, -71.9817, "Usar el boleto turístico"),
    act(2, "07:30", "Tour Valle Sagrado: Pisac", "Pisac", -13.4219, -71.859),
    act(2, "13:00", "Almuerzo en Urubamba", "Urubamba", -13.3047, -72.1158),
    act(2, "16:00", "Ollantaytambo", "Ollantaytambo", -13.2581, -72.2633),
    act(2, "19:00", "Tren a Aguas Calientes", "Estación Ollantaytambo", -13.2633, -72.2667, "PeruRail · llevar pasaporte"),
    act(3, "05:30", "Bus a Machu Picchu", "Aguas Calientes", -13.1547, -72.5254, "Hacer fila temprano"),
    act(3, "06:30", "Machu Picchu (circuito 2)", "Machu Picchu", -13.1631, -72.545, "Entrada con hora fija"),
    act(3, "15:00", "Tren de regreso a Cusco", "Estación Aguas Calientes", -13.1556, -72.5246),
    act(4, "04:00", "Montaña de Colores", "Vinicunca", -13.8697, -71.303, "Llevar abrigo y agua"),
    act(5, "10:00", "Compras de recuerdos", "Centro Artesanal Cusco", -13.5241, -71.9675),
    act(5, "14:20", "Vuelo de regreso", "Aeropuerto Alejandro Velasco Astete", -13.5357, -71.9388),
  ];
  const cuscoStays: Stay[] = [
    {
      id: uid(),
      trip_id: cusco.id,
      name: "Casa San Blas",
      address: "Tocuyeros 566, San Blas, Cusco",
      check_in: d(0),
      check_out: d(2),
      price: 190,
      paid: true,
      confirmation: "CSB-48213",
      url: "",
      lat: -13.5159,
      lng: -71.9752,
    },
    {
      id: uid(),
      trip_id: cusco.id,
      name: "Hostal Rupa Wasi",
      address: "Calle Huanacaure 180, Aguas Calientes",
      check_in: d(2),
      check_out: d(3),
      price: 85,
      paid: false,
      confirmation: "RW-2210",
      url: "",
      lat: -13.1541,
      lng: -72.5243,
    },
    {
      id: uid(),
      trip_id: cusco.id,
      name: "Casa San Blas",
      address: "Tocuyeros 566, San Blas, Cusco",
      check_in: d(3),
      check_out: d(5),
      price: 190,
      paid: false,
      confirmation: "CSB-48219",
      url: "",
      lat: -13.5159,
      lng: -71.9752,
    },
  ];
  const exp = (trip: Trip, n: number, amount: number, category: Expense["category"], note: string): Expense => ({
    id: uid(),
    trip_id: trip.id,
    amount,
    category,
    note,
    date: addDays(trip.start_date, n),
  });
  const cuscoExps: Expense[] = [
    exp(cusco, -40, 412, "transporte", "Vuelos Lima ⇄ Cusco (2 personas)"),
    exp(cusco, -25, 152, "actividades", "Entradas Machu Picchu"),
    exp(cusco, -25, 140, "transporte", "Tren a Aguas Calientes ida y vuelta"),
    exp(cusco, -10, 60, "actividades", "Boleto turístico"),
  ];
  const cuscoPack: PackItem[] = suggestedPacking(cusco.id).map((p, i) => ({ ...p, checked: i % 3 === 0 }));
  cuscoPack.push(
    { id: uid(), trip_id: cusco.id, name: "Poncho para lluvia", group: "ropa", checked: false },
    { id: uid(), trip_id: cusco.id, name: "Pastillas para la altura", group: "botiquin", checked: true },
  );

  // 2) Viaje que ya pasó: Cartagena
  const cart: Trip = {
    id: uid(),
    name: "Cartagena con amigos",
    destination: "Cartagena, Colombia",
    flag: "🇨🇴",
    start_date: addDays(t, -96),
    end_date: addDays(t, -91),
    budget: 1200,
    currency: "USD",
    travelers: 3,
    color: "#2e7d6b",
    notes: "",
  };
  const c = (n: number) => addDays(cart.start_date, n);
  const cAct = (n: number, time: string, title: string, place: string, lat: number, lng: number): Activity => ({
    id: uid(),
    trip_id: cart.id,
    date: c(n),
    time,
    title,
    place,
    notes: "",
    lat,
    lng,
    done: true,
  });
  const cartActs: Activity[] = [
    cAct(0, "15:00", "Caminar la ciudad amurallada", "Ciudad Amurallada", 10.4236, -75.5487),
    cAct(0, "19:00", "Atardecer en Café del Mar", "Baluarte de Santo Domingo", 10.4269, -75.5522),
    cAct(1, "10:00", "Castillo San Felipe", "Castillo San Felipe de Barajas", 10.4229, -75.5394),
    cAct(1, "18:00", "Noche en Getsemaní", "Getsemaní", 10.4203, -75.5459),
    cAct(2, "08:00", "Día de playa en Islas del Rosario", "Islas del Rosario", 10.1736, -75.7577),
    cAct(4, "09:00", "Playa Blanca", "Playa Blanca, Barú", 10.2318, -75.6058),
  ];
  const cartStays: Stay[] = [
    {
      id: uid(),
      trip_id: cart.id,
      name: "Casa Getsemaní",
      address: "Calle del Guerrero, Getsemaní",
      check_in: c(0),
      check_out: c(5),
      price: 420,
      paid: true,
      confirmation: "AB-99812",
      url: "",
      lat: 10.4206,
      lng: -75.5463,
    },
  ];
  const cartExps: Expense[] = [
    exp(cart, -30, 285, "transporte", "Vuelos"),
    exp(cart, 0, 18, "transporte", "Taxi del aeropuerto"),
    exp(cart, 0, 46, "comida", "Cena de bienvenida"),
    exp(cart, 1, 12, "actividades", "Entrada Castillo San Felipe"),
    exp(cart, 1, 38, "comida", "Almuerzo y jugos"),
    exp(cart, 2, 95, "actividades", "Lancha Islas del Rosario"),
    exp(cart, 2, 27, "comida", "Pescado frito en la playa"),
    exp(cart, 3, 64, "compras", "Sombreros y artesanías"),
    exp(cart, 3, 52, "comida", "Cena en Getsemaní"),
    exp(cart, 4, 40, "transporte", "Bote a Playa Blanca"),
    exp(cart, 5, 18, "transporte", "Taxi al aeropuerto"),
  ];
  const cartPack: PackItem[] = suggestedPacking(cart.id).map((p) => ({ ...p, checked: true }));

  return {
    trips: [cusco, cart],
    data: {
      [cusco.id]: { stays: cuscoStays, expenses: cuscoExps, activities: cuscoActs, packing: cuscoPack },
      [cart.id]: { stays: cartStays, expenses: cartExps, activities: cartActs, packing: cartPack },
    },
  };
}
