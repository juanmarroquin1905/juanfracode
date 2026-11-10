"use client";

import { TaskRow } from "./followups";
import { Avatar, Empty, SectionTitle, useCrm } from "./ui";
import { addDays, daysBetween, fromISO, isOpen, money, monthName, pendingTasks, relDay, STAGES, today } from "./utils";

type Tab = "resumen" | "tratos" | "contactos" | "seguimientos";

// Pantalla de inicio: cuánto tienes en juego, lo que toca hoy, el embudo y lo ganado por mes.
export function Dashboard({ onGo }: { onGo: (t: Tab) => void }) {
  const crm = useCrm();
  const { deals, tasks, contacts } = crm.data;
  const t = today();
  const cur = crm.currency;

  const open = deals.filter(isOpen);
  const openValue = open.reduce((s, d) => s + d.value, 0);
  const forecast = open.reduce((s, d) => s + d.value * (STAGES.find((x) => x.id === d.stage)?.chance ?? 0), 0);
  const monthKey = t.slice(0, 7);
  const wonMonth = deals.filter((d) => d.stage === "ganado" && d.closed_at?.startsWith(monthKey));
  const wonMonthValue = wonMonth.reduce((s, d) => s + d.value, 0);
  const closed90 = deals.filter((d) => !isOpen(d) && d.closed_at && daysBetween(d.closed_at, t) <= 90);
  const winRate = closed90.length ? Math.round((closed90.filter((d) => d.stage === "ganado").length / closed90.length) * 100) : null;
  const todo = pendingTasks(tasks).filter((x) => x.due_date <= t);
  const lateCount = todo.filter((x) => x.due_date < t).length;

  // Ganado por mes (últimos 6 meses)
  const now = fromISO(t);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = deals.filter((x) => x.stage === "ganado" && x.closed_at?.startsWith(key)).reduce((s, x) => s + x.value, 0);
    return { key, label: monthName(d.getMonth()), value };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.value));

  // Tratos que cierran pronto
  const soon = open
    .filter((d) => d.close_date && d.close_date <= addDays(t, 14))
    .sort((a, b) => ((a.close_date ?? "") < (b.close_date ?? "") ? -1 : 1))
    .slice(0, 5);

  const maxStage = Math.max(1, ...STAGES.filter((s) => s.id !== "perdido").map((s) => open.filter((d) => d.stage === s.id).reduce((a, d) => a + d.value, 0)));

  if (!contacts.length)
    return (
      <div className="crm-fade mx-auto max-w-lg pt-10">
        <Empty icon="🤝" title="Tu CRM está vacío">
          Agrega tu primer cliente con el botón <b>+ Nuevo</b>. Después crea sus tratos y agenda los seguimientos para no olvidar a nadie.
        </Empty>
        <div className="mt-5 text-center">
          <button type="button" onClick={() => crm.editContact(null)} className="crm-btn">
            + Agregar contacto
          </button>
        </div>
      </div>
    );

  return (
    <div className="crm-fade space-y-7">
      <div>
        <p className="text-sm font-semibold text-(--c-mut)">{greeting()} 👋</p>
        <h1 className="crm-display mt-0.5 text-3xl leading-tight font-bold sm:text-4xl">
          {todo.length ? (
            <>
              Hoy tienes{" "}
              <span className="relative inline-block">
                <span className="absolute inset-x-[-4px] bottom-0.5 -z-0 h-3 -rotate-1 rounded bg-(--c-yellow)" />
                <span className="relative">
                  {todo.length} seguimiento{todo.length === 1 ? "" : "s"}
                </span>
              </span>
            </>
          ) : (
            "Todo al día. ¡Bien!"
          )}
        </h1>
      </div>

      {/* Números grandes */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi color="var(--c-yellow)" label="En juego" value={money(openValue, cur, true)} hint={`${open.length} trato${open.length === 1 ? "" : "s"} abierto${open.length === 1 ? "" : "s"}`} />
        <Kpi color="#c9b5ff" label="Pronóstico" value={money(forecast, cur, true)} hint="Según la etapa de cada trato" />
        <Kpi color="var(--c-mint)" label="Ganado este mes" value={money(wonMonthValue, cur, true)} hint={`${wonMonth.length} trato${wonMonth.length === 1 ? "" : "s"} cerrado${wonMonth.length === 1 ? "" : "s"}`} />
        <Kpi color="var(--c-pink)" label="Tasa de cierre" value={winRate == null ? "—" : `${winRate}%`} hint="Ganados de los cerrados (90 días)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Para hoy */}
        <section className="min-w-0">
          <SectionTitle
            count={todo.length}
            right={
              <button type="button" onClick={() => onGo("seguimientos")} className="text-sm font-bold text-(--c-violet) underline-offset-2 hover:underline">
                Ver todos →
              </button>
            }
          >
            Para hoy {lateCount > 0 && <span className="text-sm font-semibold text-(--c-red)">· {lateCount} atrasado{lateCount === 1 ? "" : "s"}</span>}
          </SectionTitle>
          {todo.length ? (
            <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
              {todo.slice(0, 6).map((x) => (
                <TaskRow key={x.id} task={x} />
              ))}
            </div>
          ) : (
            <Empty icon="☕" title="Nada pendiente para hoy">
              Agenda el próximo paso con cada cliente para que nada se enfríe.
            </Empty>
          )}
        </section>

        {/* Embudo */}
        <section className="min-w-0">
          <SectionTitle
            right={
              <button type="button" onClick={() => onGo("tratos")} className="text-sm font-bold text-(--c-violet) underline-offset-2 hover:underline">
                Ver tablero →
              </button>
            }
          >
            Tu embudo
          </SectionTitle>
          <div className="crm-card space-y-3 p-4">
            {STAGES.filter((s) => s.id !== "perdido" && s.id !== "ganado").map((s) => {
              const list = open.filter((d) => d.stage === s.id);
              const value = list.reduce((a, d) => a + d.value, 0);
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-baseline gap-2 text-sm">
                    <span className="font-bold">{s.label}</span>
                    <span className="text-(--c-mut)">{list.length}</span>
                    <span className="crm-num ml-auto font-bold">{money(value, cur, true)}</span>
                  </div>
                  <div className="h-5 rounded-md bg-(--c-bg)">
                    <div className="crm-bar h-full" style={{ width: `${Math.max(value ? 6 : 0, (value / maxStage) * 100)}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Ganado por mes */}
        <section className="min-w-0">
          <SectionTitle>Ganado por mes</SectionTitle>
          <div className="crm-card p-4">
            <div className="flex h-44 items-end gap-2 sm:gap-3">
              {months.map((m) => (
                <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="crm-num text-[11px] font-bold text-(--c-mut)">{m.value ? money(m.value, cur, true) : ""}</span>
                  <div
                    className="crm-bar w-full max-w-12"
                    title={money(m.value, cur)}
                    style={{ height: `${m.value ? Math.max(6, (m.value / maxMonth) * 100) : 2}%`, background: m.key === monthKey ? "var(--c-violet)" : "var(--c-mint)" }}
                  />
                  <span className={`text-xs font-bold ${m.key === monthKey ? "" : "text-(--c-mut)"}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cierran pronto */}
        <section className="min-w-0">
          <SectionTitle count={soon.length}>Cierran pronto</SectionTitle>
          {soon.length ? (
            <div className="crm-card divide-y-2 divide-(--c-ink)/10 overflow-hidden">
              {soon.map((d) => {
                const c = crm.contactById(d.contact_id);
                const late = (d.close_date ?? "") < t;
                return (
                  <button key={d.id} type="button" onClick={() => crm.editDeal(d)} className="crm-row flex w-full items-center gap-3 px-4 py-3 text-left">
                    <Avatar contact={c} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{d.title}</span>
                      <span className="block truncate text-xs text-(--c-mut)">{c?.name}</span>
                    </span>
                    <span className="text-right">
                      <span className="crm-num block font-bold">{money(d.value, cur)}</span>
                      <span className={`block text-xs font-semibold ${late ? "text-(--c-red)" : "text-(--c-mut)"}`}>{late ? `Vencido · ${relDay(d.close_date!)}` : relDay(d.close_date!)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Empty icon="📅" title="Nada cierra en las próximas 2 semanas" />
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <div className="crm-card relative overflow-hidden p-4">
      <span className="absolute top-0 right-0 h-full w-2.5 border-l-2 border-(--c-ink)" style={{ background: color }} />
      <p className="text-xs font-bold tracking-wider text-(--c-mut) uppercase">{label}</p>
      <p className="crm-num mt-1.5 truncate pr-3 text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 truncate pr-3 text-xs text-(--c-mut)">{hint}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}
