"use client";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Faz as animações do Motion respeitarem "reduzir movimento": tira deslocamentos, mantém opacidade. */
export function Movimento({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
