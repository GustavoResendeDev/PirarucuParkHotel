"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PeixeTraco } from "./Logo";

/** Abertura com o peixe do logo sendo desenhado. Aparece uma vez por sessão. */
export function Preloader() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    let visto = false;
    try {
      visto = sessionStorage.getItem("pph-intro") === "1";
      sessionStorage.setItem("pph-intro", "1");
    } catch {}
    if (visto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVis(true);
    const t = setTimeout(() => setVis(false), 2100);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {vis && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-oliva-900 text-creme"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 100 40" className="w-40">
              <motion.g initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
                <PeixeTraco />
              </motion.g>
              <motion.path
                d="M4 24 C 18 10, 52 6, 76 14 L 92 6 L 88 20 L 96 32 L 78 27 C 52 36, 20 36, 4 24 Z"
                fill="none"
                stroke="#c8b38a"
                strokeWidth={1.4}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            </svg>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-3xl font-semibold"
            >
              PIRARUCU
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
