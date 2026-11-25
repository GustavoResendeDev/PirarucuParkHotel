"use client";
import { useInView } from "motion/react";
import { useRef, type CSSProperties } from "react";

/**
 * Texto que emerge como de dentro d'água: cada letra sobe alguns pixels enquanto
 * o desfoque se dissolve, em uma onda contínua (CSS em globals.css, .fluido).
 * Leitores de tela recebem a frase inteira, sem as letras separadas.
 * `ativo` controla o início; sem ele, começa quando entra na tela.
 */
export function TextoFluido({ texto, atraso = 0, passo = 24, ativo, inteiro = false, className = "" }: {
  texto: string;
  atraso?: number; // ms
  passo?: number; // ms entre letras
  ativo?: boolean;
  /** revela a linha toda com uma varredura (necessário em textos com gradiente) */
  inteiro?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const on = ativo ?? emVista;

  if (inteiro)
    return (
      <span ref={ref} data-on={on || undefined} className={`fluido-linha ${className}`} style={{ "--d": `${atraso}ms` } as CSSProperties}>
        {texto}
      </span>
    );

  const palavras = texto.split(" ");
  return (
    <span ref={ref} data-on={on || undefined} className={`fluido ${className}`}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {palavras.map((p, i) => {
          const inicio = palavras.slice(0, i).reduce((n, x) => n + x.length + 1, 0);
          return (
            <span key={i}>
              <span className="inline-block whitespace-nowrap">
                {[...p].map((l, k) => (
                  <span key={k} className="fluido-letra" style={{ "--d": `${atraso + (inicio + k) * passo}ms` } as CSSProperties}>
                    {l}
                  </span>
                ))}
              </span>
              {i < palavras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </span>
  );
}
