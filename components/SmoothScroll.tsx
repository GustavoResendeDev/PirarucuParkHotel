"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/** Scroll suave com inércia. Desliga sozinho para quem prefere menos movimento. */
export function SmoothScroll() {
  // link com âncora (#day-use) para conteúdo montado depois do carregamento: o navegador
  // não acha o alvo a tempo, então rolamos até ele quando aparecer
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    let tentativas = 0;
    const t = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tentativas > 20) window.clearInterval(t);
      if (el && Math.abs(el.getBoundingClientRect().top) > 160) el.scrollIntoView({ block: "start" });
    }, 150);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);
  return null;
}
