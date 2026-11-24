"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EXPERIENCIAS } from "@/lib/data";
import { Foto } from "./Foto";

const PALETAS: [string, string][] = [
  ["#3f5a5c", "#14203a"],
  ["#6f8fa0", "#24414f"],
  ["#a0623d", "#3b2416"],
];
const FOTOS = ["/fotos/pesca.jpg", "/fotos/piscina.jpg", "/fotos/gastronomia.jpg"];

/** Cartões que se empilham com a rolagem (efeito "stack"). */
export function Experiencias() {
  return (
    <section id="experiencias" className="relative bg-oliva-900 py-28 text-creme md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="mb-4 text-xs font-bold tracking-[.3em] text-champanhe uppercase">Experiências</p>
        <h2 className="font-display mb-16 max-w-3xl text-5xl leading-[0.95] font-medium md:text-7xl">
          Um dia inteiro <em className="text-champanhe">à beira d’água</em>
        </h2>
        <div className="relative">
          {EXPERIENCIAS.map((e, i) => (
            <Cartao key={e.titulo} i={i} total={EXPERIENCIAS.length} titulo={e.titulo} texto={e.texto} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Cartao({ i, total, titulo, texto }: { i: number; total: number; titulo: string; texto: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const escala = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.04]);
  const brilho = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const filtro = useTransform(brilho, (b) => `brightness(${b})`);
  return (
    <div ref={ref} className="sticky top-24 h-[78vh] min-h-[520px] md:top-28" style={{ paddingTop: i * 28 }}>
      <motion.article
        style={{ scale: escala, filter: filtro }}
        className="grid h-full origin-top overflow-hidden rounded-[32px] border border-creme/10 bg-oliva-800 md:grid-cols-2"
      >
        <div className="flex flex-col justify-between p-8 md:p-14">
          <span className="font-display text-7xl text-champanhe/40 md:text-9xl">0{i + 1}</span>
          <div>
            <h3 className="font-display text-4xl font-medium md:text-6xl">{titulo}</h3>
            <p className="mt-5 max-w-md leading-relaxed text-creme/75">{texto}</p>
          </div>
        </div>
        <Foto src={FOTOS[i]} alt={titulo} paleta={PALETAS[i]} rotulo={titulo} className="min-h-[220px]" />
      </motion.article>
    </div>
  );
}
