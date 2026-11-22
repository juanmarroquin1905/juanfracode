// Pack gratis de prompts para editar video SOLO con Claude Code, ffmpeg y Remotion.
// Para agregar uno nuevo, súmalo a la lista del grupo que corresponda.

export type PromptItem = { slug: string; emoji: string; title: string; text: string; prompt: string };
export type PromptGroup = { id: string; title: string; text: string; items: PromptItem[] };

// Frase que va al final de los prompts que tocan archivos, para no perder el original.
const SAFE = "No modifiques el archivo original.";

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    id: "preparar",
    title: "Prepara tu video",
    text: "Abre Claude Code en la carpeta de tu video y pega el prompt. Claude instala lo que falte y trabaja en tu computadora.",
    items: [
      {
        slug: "transcribir",
        emoji: "📝",
        title: "Transcribir con tiempos",
        text: "Saca el texto de tu video, palabra por palabra, gratis y en tu compu.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Transcríbelo en español con Whisper (corre en mi computadora, gratis). Si no está instalado, instálalo y dime qué hiciste.

Guarda:
- "transcripcion.srt" con los subtítulos.
- "palabras.json" con el tiempo de inicio y fin de cada palabra.
- "transcripcion.txt" con el texto y los tiempos de cada frase.

Los vamos a usar en los siguientes pasos. ${SAFE}`,
      },
      {
        slug: "vertical",
        emoji: "📱",
        title: "Pasar a vertical 9:16",
        text: "Convierte un video horizontal al formato de TikTok y Reels.",
        prompt: `En esta carpeta está mi video horizontal [NOMBRE_DEL_VIDEO.mp4]. Con ffmpeg, conviértelo a vertical 9:16 (1080x1920) recortando al centro, sin deformar la imagen, y guárdalo como "vertical.mp4".

Mantén el audio igual. Si mi cara no está al centro, toma un fotograma, revísalo y ajusta el recorte para que quede centrada. ${SAFE}`,
      },
    ],
  },
  {
    id: "ffmpeg",
    title: "Cortes y efectos con ffmpeg",
    text: "ffmpeg es una herramienta gratis que edita video desde la terminal. Tú no escribes ningún comando: Claude Code lo hace por ti.",
    items: [
      {
        slug: "silencios",
        emoji: "🤫",
        title: "Cortar silencios",
        text: "Quita las pausas de tu video de forma automática.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Usa ffmpeg para quitar los silencios de más de 0,4 segundos (detéctalos con silencedetect) y une las partes con voz en "sin-silencios.mp4".

Deja 0,1 segundos de margen antes y después de cada parte para que no suene cortado. Si ffmpeg no está instalado, instálalo primero. ${SAFE}`,
      },
      {
        slug: "muletillas",
        emoji: "✂️",
        title: "Quitar muletillas y repeticiones",
        text: "Corta los \"eh\", \"este\" y las frases que repetiste.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4] y "palabras.json" con el tiempo de cada palabra (si no existe, transcríbelo primero con Whisper).

1. Busca muletillas ("eh", "em", "este", "o sea", "bueno" al inicio de frase), arranques en falso y frases que repetí (quédate con la última toma, que suele ser la buena).
2. Muéstrame la lista de cortes con sus tiempos y espera mi OK.
3. Con ffmpeg, corta esas partes y une el resto en "limpio.mp4", con un fundido de audio muy corto en cada unión para que no se note.

${SAFE}`,
      },
      {
        slug: "gancho",
        emoji: "🪝",
        title: "Gancho en los primeros 3 segundos",
        text: "Busca tu mejor frase y la pone al inicio del video.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4] y su transcripción con tiempos (si no existe, transcríbelo primero con Whisper).

Busca la frase más fuerte, sorprendente o polémica que digo en el video y que funcione como gancho. Dame 3 opciones con sus tiempos y espera a que elija una.

Luego, con ffmpeg, copia ese fragmento al inicio del video (sin quitarlo de su lugar original) y guarda el resultado como "con-gancho.mp4". ${SAFE}`,
      },
      {
        slug: "zoom",
        emoji: "🔍",
        title: "Zooms en frases fuertes",
        text: "Acercamientos rápidos para que el video no se sienta estático.",
        prompt: `En esta carpeta están mi video vertical [NOMBRE_DEL_VIDEO.mp4] y su transcripción con tiempos (si no existe, transcríbelo primero con Whisper).

1. Elige los momentos para un zoom: remates, datos y frases fuertes, más o menos uno cada 4 a 6 segundos. Muéstrame la lista.
2. Con ffmpeg, en cada momento haz un acercamiento rápido al 115% centrado en mi cara durante esa frase, y vuelve al plano normal después. Sin deformar la imagen y manteniendo 1080x1920.
3. Guarda el resultado como "con-zooms.mp4".

${SAFE}`,
      },
      {
        slug: "subtitulos-ffmpeg",
        emoji: "💬",
        title: "Subtítulos dentro del video",
        text: "Subtítulos grandes y legibles, quemados en el video.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4] y sus subtítulos "transcripcion.srt" (si no existe, transcríbelo primero con Whisper).

1. Reescribe el .srt en frases cortas de 2 a 4 palabras, respetando los tiempos y corrigiendo la ortografía sin cambiar lo que digo.
2. Con ffmpeg, pon esos subtítulos dentro del video: letra grande y en negrita, blanca con borde negro, centrada en el tercio inferior sin tapar mi cara.
3. Guarda el resultado como "con-subtitulos.mp4".

${SAFE}`,
      },
      {
        slug: "musica",
        emoji: "🎵",
        title: "Música de fondo que baja cuando hablas",
        text: "La música se escucha, pero nunca tapa tu voz.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4] y una canción [MUSICA.mp3]. Con ffmpeg, agrega la canción de fondo:

- Que baje sola cuando hablo y suba un poco en las pausas (usa sidechaincompress).
- Con fundido de entrada al inicio y de salida al final.
- Que dure lo mismo que el video (recórtala o repítela si hace falta).

Guarda el resultado como "con-musica.mp4". ${SAFE}`,
      },
      {
        slug: "sonidos",
        emoji: "🔊",
        title: "Efectos de sonido",
        text: "Whoosh, pop e impactos en el momento justo.",
        prompt: `En esta carpeta están mi video [NOMBRE_DEL_VIDEO.mp4], su transcripción con tiempos y una carpeta "sonidos" con mis efectos (por ejemplo whoosh.mp3, pop.mp3, impacto.mp3).

1. Elige dónde poner cada efecto: whoosh en cambios de tema, pop cuando digo un número o un dato, impacto en un remate. Pocos: solo donde suman. Muéstrame la lista y espera mi OK.
2. Con ffmpeg, mezcla los efectos en esos tiempos a un volumen más bajo que mi voz.
3. Guarda el resultado como "con-sonidos.mp4".

${SAFE}`,
      },
      {
        slug: "audio",
        emoji: "🎚️",
        title: "Mejorar el audio",
        text: "Volumen parejo y menos ruido de fondo.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Con ffmpeg, mejora el audio: reduce el ruido de fondo de forma suave y normaliza el volumen para redes sociales (alrededor de -14 LUFS). No toques la imagen.

Guarda el resultado como "audio-mejorado.mp4". ${SAFE}`,
      },
    ],
  },
  {
    id: "remotion",
    title: "Animaciones con Remotion",
    text: "Remotion crea videos con código. Claude Code arma el proyecto, pone tu video de fondo y le suma animaciones encima.",
    items: [
      {
        slug: "subtitulos-animados",
        emoji: "✨",
        title: "Subtítulos animados palabra por palabra",
        text: "El estilo de TikTok: cada palabra aparece y se resalta al decirla.",
        prompt: `En esta carpeta están mi video vertical [NOMBRE_DEL_VIDEO.mp4] y "palabras.json" con el tiempo de cada palabra (si no existe, transcríbelo primero con Whisper).

Crea un proyecto de Remotion en la carpeta "edicion" y una composición de 1080x1920 que:
- Use mi video de fondo, con su audio.
- Muestre subtítulos de 2 a 4 palabras en el tercio inferior.
- Resalte la palabra que estoy diciendo (más grande y de color amarillo) con una animación corta de rebote.
- Use una letra gruesa y legible, blanca con sombra.

Renderiza el resultado como "subtitulos-animados.mp4" y dime cómo abrir la vista previa de Remotion para cambiar el estilo. ${SAFE}`,
      },
      {
        slug: "textos",
        emoji: "🔤",
        title: "Títulos y textos animados",
        text: "Frases cortas que entran y salen para reforzar lo que dices.",
        prompt: `En esta carpeta están mi video vertical [NOMBRE_DEL_VIDEO.mp4] y su transcripción con tiempos (si no existe, transcríbelo primero con Whisper).

1. Propón los textos en pantalla: un título para los primeros 3 segundos y frases de máximo 5 palabras para listas, números y datos. Muéstrame la lista con tiempos y espera mi OK.
2. En un proyecto de Remotion (carpeta "edicion"), haz una composición de 1080x1920 con mi video de fondo y esos textos encima, en la parte superior, con una animación de entrada y salida suave.
3. Renderiza el resultado como "con-textos.mp4".

${SAFE}`,
      },
      {
        slug: "progreso",
        emoji: "⏳",
        title: "Barra de progreso",
        text: "Una barra que avanza y hace que la gente se quede hasta el final.",
        prompt: `En esta carpeta está mi video vertical [NOMBRE_DEL_VIDEO.mp4]. En un proyecto de Remotion (carpeta "edicion"), haz una composición de 1080x1920 con mi video de fondo y una barra de progreso delgada en la parte de arriba que avance de 0 a 100% durante el video.

Color de la barra: [COLOR, por ejemplo azul #1d4ed8]. Renderiza el resultado como "con-progreso.mp4". ${SAFE}`,
      },
      {
        slug: "plantilla",
        emoji: "🧩",
        title: "Tu propia plantilla de edición",
        text: "Junta todo en una plantilla y úsala en cada video nuevo.",
        prompt: `Quiero una plantilla de edición reutilizable en Remotion (carpeta "plantilla") para mis videos verticales de 1080x1920. Que reciba como datos: el archivo de video, "palabras.json" y una lista de textos en pantalla, y que aplique siempre:
- Subtítulos animados palabra por palabra.
- Títulos animados en la parte superior.
- Barra de progreso.
- Mis colores: [TUS COLORES] y mi letra: [TU LETRA o "una gruesa y legible"].

Luego crea un script para que, con un solo comando, pueda transcribir un video nuevo con Whisper y renderizarlo con esta plantilla. Explícame en 3 pasos cómo usarla la próxima vez.`,
      },
    ],
  },
  {
    id: "publicar",
    title: "Para publicar",
    text: "Cuando el video ya está listo.",
    items: [
      {
        slug: "descripcion",
        emoji: "📣",
        title: "Descripción y hashtags",
        text: "El texto para publicar en TikTok, Reels y Shorts.",
        prompt: `Lee "transcripcion.txt" de mi video y escribe:
1. Tres opciones de descripción corta (máximo 150 caracteres) que inviten a comentar.
2. De 3 a 5 hashtags relevantes, sin hashtags genéricos como #fyp.
3. Un título para YouTube Shorts de máximo 60 caracteres.

Escribe en español neutro, como habla un creador, no como una marca. Guárdalo en "publicar.txt".`,
      },
      {
        slug: "portada",
        emoji: "🖼️",
        title: "Portada del video",
        text: "Saca el mejor fotograma y le pone un título grande.",
        prompt: `En esta carpeta está mi video [NOMBRE_DEL_VIDEO.mp4]. Con ffmpeg, saca 6 fotogramas donde se me vea bien la cara y muéstramelos para que elija uno.

Con el que elija, crea "portada.jpg" de 1080x1920 con este título grande en la parte de arriba: [TÍTULO DE LA PORTADA], en letra gruesa, blanca con borde negro y bien legible en celular. ${SAFE}`,
      },
    ],
  },
];
