"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Voz gratis del navegador (Web Speech API). No usa servicios pagados.
// - Hablar: speechSynthesis (funciona en casi todos los navegadores).
// - Escuchar: SpeechRecognition (Chrome, Edge y Safari). Si no hay, se oculta el micrófono.

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoice() {
  const [canListen, setCanListen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    // Se revisa después de dibujar para que el servidor y el navegador coincidan.
    const t = setTimeout(() => {
      setCanListen(!!getRecognition());
      setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    }, 0);
    return () => {
      clearTimeout(t);
      rec.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  /** Lee el texto en voz alta. Llama a onEnd cuando termina. */
  const speak = useCallback((text: string, onEnd: () => void) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,:;!?¡¿$%"'()-]/gu, ""));
    u.lang = "es-ES";
    const voices = synth.getVoices();
    const es = voices.find((v) => v.lang.startsWith("es") && /female|mujer|paulina|monica|helena|sabina|google/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith("es"));
    if (es) u.voice = es;
    u.rate = 1.05;
    u.pitch = 1;
    u.onend = onEnd;
    u.onerror = onEnd;
    synth.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  /** Escucha una frase y la devuelve en onText. */
  const listen = useCallback((onText: (t: string) => void) => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    if (rec.current) {
      rec.current.stop();
      return;
    }
    const r = new Ctor();
    r.lang = "es-ES";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) onText(text);
    };
    r.onend = r.onerror = () => {
      rec.current = null;
      setListening(false);
    };
    rec.current = r;
    setListening(true);
    r.start();
  }, []);

  return { canListen, canSpeak, listening, speak, stopSpeaking, listen };
}
