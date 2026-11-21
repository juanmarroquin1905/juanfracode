"use client";

import { useEffect } from "react";

// Enlaces viejos del inicio (/#saas, /#como-usar) ahora viven en /micro-apps.
const MOVED: Record<string, string> = { "#saas": "/micro-apps#ejemplos", "#como-usar": "/micro-apps#como-usar" };

export function OldAnchors() {
  useEffect(() => {
    const to = MOVED[window.location.hash];
    if (to) window.location.replace(to);
  }, []);
  return null;
}
