import { BRAND } from "@/config/brand";

// Video de ventas (VSL) del inicio. Se reproduce cuando la persona le da play, con sonido.
export function Vsl() {
  return (
    <section aria-label={`Video: qué es ${BRAND.studioName}`} className="enter enter-3 mx-auto max-w-5xl px-4">
      <div className="glass overflow-hidden rounded-[22px] p-1.5 sm:p-2">
        <video
          src="/vsl/vsl-juanfra-studio.mp4"
          poster="/vsl/vsl-portada.jpg"
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-[16px] bg-[#060c1c]"
        />
      </div>
    </section>
  );
}
