"use client";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Motion";
import { Ornamento } from "./Secao";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LOOP = `${BASE}/video/drone-loop.mp4`;
const COMPLETO = `${BASE}/video/tour-completo.mp4`;
const CAPA = `${BASE}/video/drone-capa.webp`;

/**
 * Seção com as imagens de drone em loop (sem som) e botão para assistir ao vídeo completo.
 * O loop só toca quando está na tela; com "reduzir movimento" ou economia de dados fica só a capa.
 */
export function VideoDrone() {
  const secao = useRef<HTMLElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const completo = useRef<HTMLVideoElement>(null);
  const [animar, setAnimar] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const economia = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduzir || economia) return;
    setAnimar(true);
  }, []);

  useEffect(() => {
    const el = secao.current;
    const v = loop.current;
    if (!animar || !el || !v) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animar]);

  const abrir = () => {
    setAberto(true);
    loop.current?.pause();
    dialogo.current?.showModal();
    completo.current?.play().catch(() => {});
  };
  const fechar = () => {
    completo.current?.pause();
    dialogo.current?.close();
  };

  return (
    <section ref={secao} aria-labelledby="titulo-drone" className="relative isolate overflow-hidden bg-verde-noite text-marfim">
      <div className="absolute inset-0 -z-10">
        {animar ? (
          <video
            ref={loop}
            src={LOOP}
            poster={CAPA}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="size-full scale-[1.02] object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={CAPA} alt="" loading="lazy" className="size-full object-cover" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,rgba(27,34,29,.35)_0%,rgba(27,34,29,.78)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-verde-noite/80 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[78svh] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center md:min-h-[86svh] md:px-8">
        <Reveal y={24} className="flex flex-col items-center">
          <p className="text-[12px] font-medium tracking-[0.26em] text-dourado uppercase">Visto do alto</p>
          <h2 id="titulo-drone" className="font-display mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.06] text-balance">
            Entre lagos, verde e céu aberto
          </h2>
          <Ornamento className="mt-5 text-dourado" />
          <p className="mt-5 max-w-xl text-marfim/80">
            O hotel fica às margens dos lagos de pesca, cercado de natureza, com piscinas e o pôr do sol de Itapuranga.
          </p>
          <button
            type="button"
            onClick={abrir}
            className="pressionavel group mt-10 inline-flex items-center gap-4 rounded-md border border-marfim/40 bg-verde-noite/30 py-2 pr-7 pl-2 text-[12px] font-medium tracking-[0.16em] uppercase backdrop-blur-sm hover:border-dourado hover:bg-verde-noite/60"
          >
            <span className="grid size-12 place-items-center rounded-full bg-dourado text-verde-noite transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
            </span>
            Assistir ao vídeo
          </button>
        </Reveal>
      </div>

      <dialog
        ref={dialogo}
        onClose={() => completo.current?.pause()}
        onClick={(e) => e.target === dialogo.current && fechar()}
        aria-label="Vídeo do Pirarucu Park Hotel"
        className="m-auto w-[min(92vw,1100px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-verde-noite/90 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar vídeo"
            className="pressionavel absolute -top-14 right-0 grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/30 text-marfim hover:bg-marfim hover:text-verde-noite"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {aberto && (
            <video
              ref={completo}
              src={COMPLETO}
              poster={CAPA}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-xl bg-black shadow-2xl"
            />
          )}
        </div>
      </dialog>
    </section>
  );
}
