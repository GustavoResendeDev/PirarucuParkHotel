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
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opTexto = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const escurecer = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  useEffect(() => {
    setReduzido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const linhas = ["Onde o lago", "encontra o descanso"];

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-oliva-900 text-creme">
      {/* fundo de segurança enquanto o 3D carrega */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#2a3527_0%,#c48d5e_52%,#1c2a25_53%,#0f1a17_100%)]" />
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.3 }}>
        <CenaLago progresso={progresso} pausado={!visivel || reduzido} />
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0 bg-oliva-950" style={{ opacity: escurecer }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,transparent,rgba(21,27,20,.55))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-oliva-950/70 via-oliva-950/25 to-transparent md:from-oliva-950/40" />

      <motion.div style={{ y: yTexto, opacity: opTexto }} className="relative mx-auto flex h-full max-w-7xl flex-col justify-start px-5 pt-32 md:justify-center md:px-8 md:pt-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: EASE }}
          className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[.3em] text-champanhe uppercase"
        >
          <span className="h-px w-10 bg-champanhe" /> {HOTEL.cidade} · {HOTEL.uf}<span className="hidden sm:inline"> — {HOTEL.distancia}</span>
        </motion.p>
        <h1 className="font-display max-w-4xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.02em]" aria-label={linhas.join(" ")}>
          {linhas.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
              <motion.span
                className={`block ${i === 1 ? "italic text-creme/90" : ""}`}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 1 + i * 0.12, duration: 1.3, ease: EASE }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 1, ease: EASE }}
          className="mt-6 max-w-md text-base leading-relaxed text-creme/85 md:mt-8 md:text-lg [text-shadow:0_1px_12px_rgba(0,0,0,.35)]"
        >
          {HOTEL.slogan}. Hospede-se ao lado do Recanto do Pirarucu e viva o dia inteiro à beira d’água.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1.1, ease: EASE }}
        className="absolute inset-x-0 bottom-6 z-10 mx-auto max-w-7xl px-5 md:bottom-10 md:px-8"
      >
        <BuscaRapida />
      </motion.div>
    </section>
  );
}
