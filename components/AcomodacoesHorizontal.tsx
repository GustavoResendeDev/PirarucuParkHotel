"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ACOMODACOES } from "@/lib/data";
import { brl } from "@/lib/reserva";
import { Foto } from "./Foto";

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
    <section ref={alvo} className="relative bg-creme-claro lg:h-[320vh]" aria-labelledby="titulo-acomodacoes">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-5 pt-24 md:px-8 lg:pt-0">
          <div>
            <p className="mb-4 text-xs font-bold tracking-[.3em] text-escama uppercase">Acomodações</p>
            <h2 id="titulo-acomodacoes" className="font-display text-5xl leading-[0.95] font-medium text-oliva-900 md:text-7xl">
              Escolha seu <em>refúgio</em>
            </h2>
          </div>
          <p className="max-w-sm text-oliva-600">
            Do quarto prático para quem vem pescar à suíte com vista para o lago. <span className="selo-exemplo text-escama">valores de exemplo</span>
          </p>
        </div>
        <motion.div ref={trilho} style={{ x }} className="flex flex-col gap-6 px-5 md:px-8 lg:flex-row lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {ACOMODACOES.map((ac, i) => (
            <Link
              key={ac.slug}
              href={`/acomodacoes/${ac.slug}`}
              className="group relative block shrink-0 overflow-hidden rounded-[28px] lg:w-[min(42vw,560px)]"
            >
              <Foto src={ac.fotos[0]} alt={`Acomodação ${ac.nome}`} paleta={ac.paleta} rotulo={ac.nome} className="aspect-[4/5] transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-105 sm:aspect-[4/3] lg:aspect-[4/5]" />
              <div className="absolute inset-0 bg-gradient-to-t from-oliva-950/85 via-oliva-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-creme md:p-9">
                <p className="text-xs font-semibold tracking-[.25em] text-champanhe uppercase">
                  0{i + 1} · até {ac.capacidade} pessoas · {ac.area}
                </p>
                <h3 className="font-display mt-3 text-4xl font-medium md:text-5xl">{ac.nome}</h3>
                <p className="mt-2 max-w-xs text-sm text-creme/75">{ac.chamada}</p>
                <div className="mt-6 flex items-end justify-between">
                  <p>
                    <span className="text-xs text-creme/60">a partir de</span>
                    <br />
                    <span className="font-display text-3xl">{brl(ac.diaria)}</span>
                    <span className="text-sm text-creme/60"> /noite</span>
                  </p>
                  <span className="grid size-14 place-items-center rounded-full border border-creme/30 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-creme group-hover:text-oliva-900">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <div className="flex shrink-0 items-center lg:w-[28vw]">
            <Link href="/acomodacoes" className="font-display text-3xl text-oliva-900 underline decoration-champanhe decoration-1 underline-offset-8 hover:decoration-2">
              Comparar todas →
            </Link>
          </div>
        </motion.div>
        <div className="mx-auto mt-10 hidden h-px w-full max-w-7xl bg-oliva-900/10 px-8 lg:block">
          <motion.div style={{ width: barra }} className="h-px bg-oliva-900" />
        </div>
      </div>
    </section>
  );
}
