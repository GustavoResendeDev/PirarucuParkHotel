"use client";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HOTEL } from "@/lib/data";
import { BuscaRapida } from "./BuscaRapida";

const CenaLago = dynamic(() => import("./three/CenaLago"), { ssr: false });
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progresso = useRef(0);
  const [visivel, setVisivel] = useState(true);
  const [reduzido, setReduzido] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progresso.current = v;
  });
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opTexto = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    setReduzido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden bg-verde-noite text-marfim">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1b221d_0%,#364339_50%,#1b221d_100%)]" />
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.2 }}>
        <CenaLago progresso={progresso} pausado={!visivel || reduzido} />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-verde-noite/70 to-transparent" />

      <motion.div style={{ y: yTexto, opacity: opTexto }} className="relative mx-auto flex h-full max-w-5xl flex-col items-center px-5 pt-32 text-center md:pt-40">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-[15px] tracking-[0.18em] text-dourado"
        >
          {HOTEL.cidade}, Goiás
        </motion.p>
        <h1 className="font-display mt-5 text-[clamp(2.6rem,7vw,6.2rem)] leading-[1.02] text-balance">
          {["Descanso à beira do lago,", "pesca a qualquer hora."].map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.7 + i * 0.12, duration: 1.1, ease: EASE }}>
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8, ease: EASE }}
          className="mt-6 max-w-xl text-base text-marfim/80 md:text-lg"
        >
          Café da manhã e piscinas aquecidas inclusos. Pesca esportiva 24 horas, exclusiva para hóspedes.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.9, ease: EASE }}
        className="absolute inset-x-0 bottom-6 z-10 mx-auto max-w-5xl px-5 md:bottom-10"
      >
        <BuscaRapida />
      </motion.div>
    </section>
  );
}
