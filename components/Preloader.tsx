"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

/** Abertura: o logo dourado surge com um brilho que atravessa o traço. Uma vez por sessão. */
export function Preloader() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    let visto = false;
    try {
      visto = sessionStorage.getItem("pph-intro") === "1";
    } catch {}
    if (visto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raiz = document.documentElement;
    raiz.dataset.intro = "1"; // o hero espera este sinal para revelar o título
    setVis(true);
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem("pph-intro", "1");
      } catch {}
      delete raiz.dataset.intro;
      window.dispatchEvent(new Event("pph-intro-fim"));
      setVis(false);
    }, 1900);
    return () => {
      clearTimeout(t);
      delete raiz.dataset.intro;
    };
  }, []);
  return (
    <AnimatePresence>
      {vis && (
        <motion.div
          data-preloader
          className="fixed inset-0 z-[100] grid place-items-center bg-verde"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, clipPath: "inset(0 100% 0 0)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-56 md:w-72"
          >
            <Logo className="w-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
