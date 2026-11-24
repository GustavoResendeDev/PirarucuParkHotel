"use client";
import { motion } from "motion/react";

/**
 * Título no estilo do manual da marca: sans fino em caixa alta com dois traços
 * finos cruzados sobre uma letra (como em "CONCEITO" e "SINALIZAÇÕES").
 * Os traços se desenham quando o título entra na tela.
 */
export function TituloMarca({
  texto,
  letra,
  as: Tag = "h2",
  className = "",
  corTraco = "#c8b28a",
}: {
  texto: string;
  letra?: number; // índice da letra que recebe o "X"; padrão: meio da palavra
  as?: "h1" | "h2" | "h3";
  className?: string;
  corTraco?: string;
}) {
  const i = letra ?? Math.floor(texto.length / 2);
  const antes = texto.slice(0, i);
  const alvo = texto.slice(i, i + 1);
  const depois = texto.slice(i + 1);
  return (
    <Tag className={`titulo-marca ${className}`}>
      {antes}
      <span className="relative inline-block">
        {alvo}
        <svg aria-hidden="true" viewBox="0 0 40 100" preserveAspectRatio="none" className="pointer-events-none absolute top-[-32%] left-1/2 h-[164%] w-[0.9em] -translate-x-1/2 overflow-visible">
          {[
            "M14 0 L30 100",
            "M26 0 L10 100",
          ].map((d, k) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke={corTraco}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, delay: 0.15 + k * 0.18, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </svg>
      </span>
      {depois}
    </Tag>
  );
}
