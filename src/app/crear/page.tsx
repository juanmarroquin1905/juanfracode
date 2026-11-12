import type { Metadata } from "next";
import { Creator } from "@/components/creator/creator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Crea tu micro app web",
  description: "Elige tipo, diseño y funciones, y descarga tu micro app web lista para publicar gratis en Netlify o Vercel. Sin programar.",
};

const PUBLISH = [
  { title: "Créala aquí", text: "Elige tipo, nombre, diseño y funciones. Mira cómo queda en la vista previa." },
  { title: "Descarga el .zip", text: "Trae tu app completa y un archivo LEEME con los pasos. No necesita base de datos." },
  { title: "Publícala gratis", text: "Arrastra la carpeta a Netlify Drop o súbela a GitHub y conéctala con Vercel." },
  { title: "Úsala y compártela", text: "Ábrela desde tu celular o compu y comparte el enlace con quien quieras." },
];

export default function CrearPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-14">
        <div className="enter text-center">
          <p className="chip">Gratis · Sin programar · No necesitas Claude</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance text-ink sm:text-5xl">
            Crea tu <span className="text-gradient">micro app web</span> en 6 pasos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-mut">
            Para ti, tu familia o tu negocio. Elige qué hace, cómo se ve y qué funciones tiene, y al final la descargas lista para
            publicar gratis en Netlify o Vercel.
          </p>
        </div>

        <div className="enter enter-1 mt-10">
          <Creator />
        </div>

        <section className="pt-24">
          <p className="chip">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">De la idea a tu enlace</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PUBLISH.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="brand-gradient grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mut">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
