"use client";

import { useEffect, useState } from "react";

/** Motion / capability flags. Resolve after mount, so SSR and first paint use the light fallback. */
export function useCapabilities() {
  const [state, setState] = useState({ can3D: false, reduceMotion: false, ready: false });
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const check = () => {
      let webgl = false;
      try {
        const c = document.createElement("canvas");
        webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {}
      setState({
        can3D: !motion.matches && wide.matches && webgl && !nav.connection?.saveData,
        reduceMotion: motion.matches,
        ready: true,
      });
    };
    check();
    motion.addEventListener("change", check);
    wide.addEventListener("change", check);
    return () => {
      motion.removeEventListener("change", check);
      wide.removeEventListener("change", check);
    };
  }, []);
  return state;
}
