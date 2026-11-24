"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Abre a imagem com uma "cortina" quando entra na tela. */
export function RevelarImagem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(18% 12% 18% 12% round 40px)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
