// Pack gratis de prompts para editar video con Claude, por efecto.
// Para agregar uno nuevo, súmalo a la lista del grupo que corresponda.

export type PromptItem = { slug: string; emoji: string; title: string; text: string; prompt: string };
export type PromptGroup = { id: string; title: string; text: string; items: PromptItem[] };

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    id: "chat",
    title: "En el chat de Claude",
    text: "Pega la transcripción de tu video con tiempos (CapCut la saca con Subtítulos automáticos) y Claude te dice qué hacer en cada momento.",
    items: [
      {
        slug: "cortes",
        emoji: "✂️",
        title: "Cortes limpios",
        text: "Quita muletillas, repeticiones y frases a medias.",
        prompt: `Eres editor de videos cortos para TikTok y Reels. Te paso la transcripción de mi video con sus tiempos.

Marca todo lo que debo cortar: muletillas ("eh", "este", "o sea"), silencios largos, frases repetidas, arranques en falso y partes que no aportan.

Dame una tabla con: inicio, fin, qué se corta y por qué. Al final dime cuánto dura el video después de los cortes.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "gancho",
        emoji: "🪝",
        title: "Gancho de 3 segundos",
        text: "Encuentra la mejor frase para abrir el video.",
        prompt: `Te paso la transcripción de mi video. Busca la frase más fuerte, sorprendente o polémica que ya dije y que sirva como gancho para los primeros 3 segundos.

Dame 3 opciones con su tiempo exacto (inicio y fin) para moverla al principio del video, y un texto en pantalla corto (máximo 6 palabras) para acompañar cada una.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "subtitulos",
        emoji: "💬",
        title: "Subtítulos estilo TikTok",
        text: "Archivo .srt con frases cortas y palabras clave resaltadas.",
        prompt: `Convierte esta transcripción en subtítulos estilo TikTok en formato .srt.

Reglas:
- De 2 a 4 palabras por subtítulo, cortando donde se respira.
- Respeta los tiempos originales.
- Corrige ortografía sin cambiar lo que digo.
- Escribe EN MAYÚSCULAS la palabra más importante de cada frase para resaltarla.

Dame solo el contenido del .srt, listo para copiar.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "zoom",
        emoji: "🔍",
        title: "Zooms y cambios de plano",
        text: "Dónde hacer zoom para que el video no se sienta estático.",
        prompt: `Te paso la transcripción de mi video, grabado a cámara fija. Para que no se sienta estático, dime dónde hacer zoom (acercamiento rápido) o cambio de encuadre.

Pon uno cada 3 a 6 segundos, sobre todo en remates, datos y frases fuertes. Dame una tabla con: tiempo, tipo (zoom rápido, zoom suave o volver al plano normal) y la frase que lo justifica.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "broll",
        emoji: "🎞️",
        title: "Ideas de B-roll",
        text: "Qué imagen o clip poner encima de lo que dices.",
        prompt: `Te paso la transcripción de mi video. Sugiere B-roll (clips o imágenes que van encima de mi cara) para los momentos donde ayuda a entender o a mantener la atención.

Para cada uno dame: tiempo, qué mostrar, y una búsqueda corta en inglés para encontrarlo en un banco de videos gratis (Pexels o Pixabay). Si es una captura de pantalla que debo grabar yo, dímelo.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "sonidos",
        emoji: "🔊",
        title: "Efectos de sonido y música",
        text: "Whoosh, pop y cambios de música en el momento justo.",
        prompt: `Te paso la transcripción de mi video. Marca dónde poner efectos de sonido (whoosh en transiciones, pop cuando aparece un texto, impacto en un remate) y dónde cambiar o bajar la música.

Usa pocos efectos: solo donde suman. Dame una tabla con: tiempo, efecto y por qué. Al final, sugiere el estilo de música de fondo que le queda al video.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "textos",
        emoji: "🔤",
        title: "Textos en pantalla",
        text: "Títulos y frases cortas para reforzar lo que dices.",
        prompt: `Te paso la transcripción de mi video. Escribe los textos en pantalla que refuercen las ideas clave: un título para los primeros segundos y frases de máximo 5 palabras para listas, números y datos.

Dame una tabla con: tiempo de entrada, tiempo de salida y texto. No pongas texto encima de los subtítulos más de lo necesario.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN CON TIEMPOS]`,
      },
      {
        slug: "publicar",
        emoji: "📣",
        title: "Descripción y hashtags",
        text: "El texto para publicar en TikTok, Reels y Shorts.",
        prompt: `Te paso la transcripción de mi video. Escribe:
1. Tres opciones de descripción corta (máximo 150 caracteres) que inviten a comentar.
2. De 3 a 5 hashtags relevantes, sin hashtags genéricos como #fyp.
3. Un título para YouTube Shorts de máximo 60 caracteres.

Escribe en español neutro, como habla un creador, no como una marca.

Transcripción:
[PEGA AQUÍ TU TRANSCRIPCIÓN]`,
      },
    ],
  },
  {
    id: "code",
    title: "Con Claude Code",
    text: "Claude Code trabaja en tu computadora y edita el archivo de video por ti con ffmpeg (una herramienta gratis). Abre Claude Code en la carpeta de tu video y pega el prompt.",
    items: [
      {
        slug: "silencios",
        emoji: "🤫",
        title: "Cortar silencios",
        text: "Quita las pausas de tu video de forma automática.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Usa ffmpeg para quitar los silencios de más de 0,4 segundos (detéctalos con silencedetect) y une las partes con voz en un nuevo archivo "sin-silencios.mp4".

Deja 0,1 segundos de margen antes y después de cada parte para que no suene cortado. Si ffmpeg no está instalado, dime cómo instalarlo en mi sistema antes de seguir. No modifiques el archivo original.`,
      },
      {
        slug: "vertical",
        emoji: "📱",
        title: "Pasar a vertical 9:16",
        text: "Convierte un video horizontal al formato de TikTok y Reels.",
        prompt: `En esta carpeta está mi video horizontal [NOMBRE_DEL_VIDEO.mp4]. Con ffmpeg, conviértelo a vertical 9:16 (1080x1920) recortando al centro, sin deformar la imagen, y guárdalo como "vertical.mp4".

Mantén el audio igual. Si mi cara no está al centro, pregúntame hacia qué lado mover el recorte. No modifiques el archivo original.`,
      },
      {
        slug: "quemar-subtitulos",
        emoji: "🔥",
        title: "Subtítulos dentro del video",
        text: "Pega los subtítulos .srt en el video, con letra grande.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4] y sus subtítulos [SUBTITULOS.srt]. Con ffmpeg, pon los subtítulos dentro del video con este estilo: letra grande y en negrita, blanca con borde negro, centrada en el tercio inferior (sin tapar mi cara).

Guarda el resultado como "con-subtitulos.mp4". No modifiques el archivo original.`,
      },
      {
        slug: "audio",
        emoji: "🎚️",
        title: "Mejorar el audio",
        text: "Volumen parejo y menos ruido de fondo.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Con ffmpeg, mejora el audio: reduce el ruido de fondo de forma suave y normaliza el volumen para redes sociales (alrededor de -14 LUFS). No toques la imagen.

Guarda el resultado como "audio-mejorado.mp4" y no modifiques el archivo original.`,
      },
    ],
  },
];
