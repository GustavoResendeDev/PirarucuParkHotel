import type { ReactNode } from "react";
import { TextoFluido } from "./TextoFluido";

/** Cabeçalho de seção centralizado: título e o ornamento com o peixe da marca. */
export function CabecalhoSecao({ titulo, texto, claro = false }: { titulo: string; texto?: ReactNode; claro?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className={`font-display text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.1] text-balance ${claro ? "text-marfim" : "text-verde"}`}><TextoFluido texto={titulo} /></h2>
      <Ornamento className={`mx-auto mt-5 ${claro ? "text-dourado" : "text-dourado-escuro"}`} />
      {texto && <p className={`mx-auto mt-5 max-w-xl ${claro ? "text-marfim/75" : "text-verde/75"}`}>{texto}</p>}
    </div>
  );
}

export function Ornamento({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 14" className={`h-3.5 w-28 ${className}`} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M0 7h44M76 7h44" opacity=".6" />
      <path d="M48 7c4-4.5 10-5.5 16-3.4 3 1 6 2.4 8 3.4-2 1-5 2.4-8 3.4C58 12.5 52 11.5 48 7z" />
      <path d="M72 7l3-3v6z" />
      <circle cx="53" cy="6.3" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}
