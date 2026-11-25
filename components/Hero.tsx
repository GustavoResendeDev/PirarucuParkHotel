"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HOTEL, PESCA } from "@/lib/data";
import { brl } from "@/lib/reserva";
import { BuscaRapida } from "./BuscaRapida";
import { ShaderFoto } from "./ShaderFoto";
import { IconePesca } from "./Icones";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const opTexto = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const yFoto = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-verde-noite text-marfim lg:min-h-[max(100svh,760px)]">
      <motion.div style={{ y: yFoto }} className="absolute inset-0 -z-10">
        <ShaderFoto
          src="/fotos/lago-noite.webp"
          alt="O Pirarucu Park Hotel iluminado à noite, visto do outro lado do lago"
          foco={[0.6, 0.52]}
          linhaAgua={0.72}
          parallax={0.6}
          prioridade
          className="size-full"
        />
        {/* legibilidade: verde da marca vindo da esquerda e do topo */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,34,29,.88)_0%,rgba(27,34,29,.62)_38%,rgba(27,34,29,.1)_70%,transparent_100%)] max-lg:bg-[linear-gradient(180deg,rgba(27,34,29,.75)_0%,rgba(27,34,29,.55)_45%,rgba(27,34,29,.85)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-verde-noite/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-verde-noite/80 to-transparent" />
      </motion.div>

      <motion.div style={{ y: yTexto, opacity: opTexto }} className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-32 pb-10 md:px-8 lg:pt-36 lg:pb-48">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
            className="flex items-center gap-3 text-[12px] font-medium tracking-[0.28em] text-dourado uppercase"
          >
            <span className="h-px w-8 bg-dourado/70" />
            Descanse · Pesque · Recarregue
          </motion.p>
          <h1 className="font-display mt-6 text-[clamp(2.5rem,6.4vw,5.4rem)] leading-[1.04] text-balance">
            {["Seu refúgio", "à beira do lago"].map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.6 + i * 0.12, duration: 1.1, ease: EASE }}>
                  {l}
                </motion.span>
              </span>
            ))}
            <span className="-mb-[0.2em] block overflow-hidden pb-[0.32em]">
              <motion.span
                className="texto-dourado block text-[0.62em] tracking-wide"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.84, duration: 1.1, ease: EASE }}
              >
                em {HOTEL.cidade}, Goiás
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
            className="mt-6 max-w-md text-base leading-relaxed text-marfim/85 md:text-lg"
          >
            Café da manhã e piscinas aquecidas inclusos, pesca esportiva 24 horas para hóspedes e o lago a poucos passos do quarto.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link href="/acomodacoes" className="pressionavel inline-flex h-12 items-center rounded-md bg-dourado px-7 text-[13px] font-medium tracking-[0.14em] text-verde-noite uppercase hover:bg-dourado-claro">
              Conhecer o hotel
            </Link>
            <Link href="/pesca" className="pressionavel group inline-flex h-12 items-center gap-3 rounded-md border border-marfim/40 pr-6 pl-2 text-[13px] tracking-[0.14em] uppercase backdrop-blur-sm hover:border-dourado hover:bg-marfim/10">
              <span className="grid size-8 place-items-center rounded-full bg-marfim/15 transition-colors group-hover:bg-dourado group-hover:text-verde-noite">
                <IconePesca className="size-5" />
              </span>
              Pesca 24h · {brl(PESCA.preco)}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.9, ease: EASE }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 md:px-8 lg:absolute lg:inset-x-0 lg:bottom-10 lg:pb-0"
      >
        <BuscaRapida />
      </motion.div>
    </section>
  );
}
