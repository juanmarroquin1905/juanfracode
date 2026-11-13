// Ayudas para links de video. Sin "server-only": las usa el servidor y el navegador.

/** Devuelve el id de YouTube de un link (watch, youtu.be, shorts, embed, live) o null. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{6,})/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}

export function esLinkValido(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
