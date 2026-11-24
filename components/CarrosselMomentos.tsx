"use client";
import { useEffect, useRef, useState } from "react";
import { Foto } from "./Foto";
import { IconeSeta } from "./Icones";

export type Momento = { src: string; alt: string; titulo: string; texto: string };

/** Carrossel com scroll-snap: arrasta no celular, setas e pontos no computador. */
export function CarrosselMomentos({ itens }: { itens: Momento[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [paginas, setPaginas] = useState(itens.length);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const medir = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const passo = card.offsetWidth + 20;
      const porTela = Math.max(1, Math.round(el.clientWidth / passo));
      setPaginas(Math.max(1, itens.length - porTela + 1));
      setAtual(Math.round(el.scrollLeft / passo));
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [itens.length]);

  const ir = (i: number) => {
    const el = trilho.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const alvo = Math.max(0, Math.min(paginas - 1, i));
    el.scrollTo({ left: alvo * (card.offsetWidth + 20), behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trilho}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        aria-label="Momentos no hotel"
        role="region"
        tabIndex={0}
      >
        {itens.map((m) => (
          <figure key={m.src} className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-xl bg-marfim shadow-[0_10px_40px_-18px_rgba(27,34,29,.35)] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
            <div className="overflow-hidden">
              <Foto src={m.src} alt={m.alt} className="aspect-[4/3] transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.04]" />
            </div>
            <figcaption className="p-6">
              <p className="font-display text-xl text-verde">{m.titulo}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-verde/70">{m.texto}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-6">
        <button type="button" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Anterior" className="pressionavel grid size-10 cursor-pointer place-items-center rounded-full border border-verde/25 text-verde hover:bg-verde hover:text-marfim disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-verde">
          <IconeSeta className="size-4 rotate-180" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: paginas }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ir para o grupo ${i + 1}`}
              aria-current={i === atual}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${i === atual ? "w-7 bg-verde" : "w-3.5 bg-verde/20 hover:bg-verde/40"}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => ir(atual + 1)} disabled={atual >= paginas - 1} aria-label="Próximo" className="pressionavel grid size-10 cursor-pointer place-items-center rounded-full border border-verde/25 text-verde hover:bg-verde hover:text-marfim disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-verde">
          <IconeSeta className="size-4" />
        </button>
      </div>
    </div>
  );
}
