"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ACOMODACOES } from "@/lib/data";
import { aPartirDe, brl } from "@/lib/reserva";
import { Foto } from "./Foto";
import { TituloMarca } from "./TituloMarca";

/** Seção fixada: a rolagem vertical move os cartões na horizontal (desktop). */
export function AcomodacoesHorizontal() {
  const alvo = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const [distancia, setDistancia] = useState(0);
  const { scrollYProgress } = useScroll({ target: alvo, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distancia]);
  const barra = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const medir = () => {
      if (!trilho.current) return;
      setDistancia(Math.max(0, trilho.current.scrollWidth - window.innerWidth + 64));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  return (
    <section ref={alvo} className="relative bg-areia-clara lg:h-[260vh]" aria-labelledby="titulo-acomodacoes">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-5 pt-28 md:px-8 lg:pt-0">
          <TituloMarca as="h2" texto="ACOMODAÇÕES" letra={6} className="text-[clamp(2.4rem,5.5vw,4.4rem)] text-salvia" />
          <p className="max-w-sm text-verde/80">Três formas de ficar, todas com café da manhã e acesso às piscinas aquecidas.</p>
        </div>
        <motion.div ref={trilho} style={{ x }} className="flex flex-col gap-6 px-5 md:px-8 lg:flex-row lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {ACOMODACOES.map((ac) => (
            <Link
              key={ac.slug}
              href={`/acomodacoes/${ac.slug}`}
              className="group relative block shrink-0 overflow-hidden rounded-[28px] lg:w-[min(40vw,540px)]"
            >
              <Foto src={ac.fotos[0]} alt={`${ac.nome}: ${ac.subtitulo.toLowerCase()}`} paleta={ac.paleta} rotulo={ac.nome} className="aspect-[4/5] transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-105 sm:aspect-[4/3] lg:aspect-[4/5]" />
              <div className="absolute inset-0 bg-gradient-to-t from-verde-noite/90 via-verde-noite/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-marfim md:p-9">
                <p className="text-sm text-dourado-claro">{ac.subtitulo}</p>
                <h3 className="font-display mt-2 text-4xl md:text-5xl">{ac.nome}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {ac.destaques.slice(0, 3).map((d) => (
                    <li key={d} className="rounded-full border border-marfim/25 px-3 py-1 text-[13px] text-marfim/85">{d}</li>
                  ))}
                </ul>
                <div className="mt-6 flex items-end justify-between">
                  <p>
                    <span className="text-sm text-marfim/65">diária a partir de</span>
                    <br />
                    <span className="font-display text-3xl text-dourado-claro">{brl(aPartirDe(ac))}</span>
                  </p>
                  <span aria-hidden className="grid size-14 place-items-center rounded-full border border-marfim/30 transition-colors duration-300 group-hover:bg-dourado group-hover:text-verde-noite">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <div className="flex shrink-0 items-center py-6 lg:w-[24vw] lg:py-0">
            <Link href="/acomodacoes" className="font-display text-3xl text-verde underline decoration-dourado decoration-1 underline-offset-8 hover:decoration-2">
              Comparar as acomodações
            </Link>
          </div>
        </motion.div>
        <div className="mx-auto mt-10 hidden h-px w-full max-w-7xl bg-verde/10 lg:block">
          <motion.div style={{ width: barra }} className="h-px bg-salvia" />
        </div>
      </div>
    </section>
  );
}
