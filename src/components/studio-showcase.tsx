import Image from "next/image";
import { StudioCharacter } from "@/components/studio-character";
import { BRAND } from "@/config/brand";

// Pieza principal del inicio (donde iría el video de ventas): captura del Studio
// con un video de muestra animado en la vista previa.
// La caja de la vista previa está en % de la captura (1706x904).
const PREVIEW = { left: "34.29%", top: "16.59%", width: "12.19%", height: "40.49%" };

export function StudioShowcase() {
  return (
    <section aria-label={`Vista de ${BRAND.studioName}`} className="enter enter-3 mx-auto max-w-6xl px-4">
      <div className="glass overflow-hidden rounded-[22px] p-1.5 sm:p-2">
        {/* En celular se recorta alrededor de la vista previa para que se vea grande */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#060c1c] sm:aspect-[1706/904]">
          <div className="absolute top-0 left-[-87%] aspect-[1706/904] w-[340%] sm:left-0 sm:w-full">
            <Image
              src="/studio/juanfra-studio.webp"
              alt={`${BRAND.studioName}: pasos de edición, vista previa del video y línea de tiempo con subtítulos, zooms y sonido`}
              fill
              priority
              sizes="(min-width: 640px) 1152px, 340vw"
              className="object-cover"
            />
            <div className="absolute" style={PREVIEW}>
              <StudioCharacter />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-ui text-xs text-mut">Así se ve {BRAND.studioName} por dentro · Prototipo</p>
    </section>
  );
}
