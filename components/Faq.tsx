"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FAQ } from "@/lib/data";

export function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);
  return (
    <div className="divide-y divide-verde/10 border-y border-verde/10">
      {FAQ.map((f, i) => {
        const a = aberto === i;
        return (
          <div key={f.p}>
            <button
              type="button"
              aria-expanded={a}
              onClick={() => setAberto(a ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-xl text-verde md:text-2xl">{f.p}</span>
              <motion.span aria-hidden animate={{ rotate: a ? 45 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="grid size-11 shrink-0 place-items-center rounded-full border border-verde/20 text-xl text-verde">
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {a && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 leading-relaxed text-verde/75">{f.r}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
