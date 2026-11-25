"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ALVO, GRUPOS, MESA, ROLO, SEQUENCIA, type FotoGaleria, type Grupo } from "@/lib/galeria";
import { HOTEL } from "@/lib/data";
import { Ornamento } from "./Secao";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = (src: string) => BASE + src;

// Roteiro da rolagem, em telas (múltiplos da altura do palco).
const DIVE_DE = 0.12;
const DIVE_ATE = 1.5;
const FOTO_ATE = 1.9;
const QUADRO = 0.9;
const N = SEQUENCIA.length;
const TELAS = FOTO_ATE + N * QUADRO + 1;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const suave = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
// escala geométrica e adiantada: a foto já ocupa a altura no meio do mergulho
const escalaMergulho = (e: number, cheia: number) => Math.exp(Math.log(cheia) * (1 - Math.pow(1 - e, 1.6)));

type Lenis = { scrollTo: (alvo: number, o?: { duration?: number }) => void };
const rolarPara = (top: number) => {
  const l = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (l) l.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: "smooth" });
};

function Revelada({ foto, eager }: { foto: FotoGaleria; eager?: boolean }) {
  return (
    <div className="rolo-print">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url(foto.src)} alt="" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" />
    </div>
  );
}

/**
 * Galeria em rolo de filme: uma mesa com fotos reveladas espalhadas, a rolagem mergulha
 * numa delas até a tela cheia e passa pelos ambientes; no fim, o rolo completo com todas as fotos.
 * Inspirado no modelo "Shutter Roll" (MIT), adaptado à identidade do hotel.
 */
export function GaleriaRolo() {
  const raiz = useRef<HTMLElement>(null);
  const rolo = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const longe = useRef<HTMLDivElement>(null);
  const vaga = useRef<HTMLDivElement>(null);
  const alvo = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLDivElement>(null);
  const legendas = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(false);
  const [quadro, setQuadro] = useState(-1);

  // as fotos caem na mesa quando o palco aparece
  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setAberto(true), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // coreografia guiada pela rolagem e pelo ponteiro
  useEffect(() => {
    const el = raiz.current, rl = rolo.current, st = palco.current;
    if (!el || !rl || !st) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fino = window.matchMedia("(pointer: fine)").matches;
    const camadas = Array.from(el.querySelectorAll<HTMLElement>("[data-prof]"));
    let raf = 0, mx = 0, my = 0, cmx = 0, cmy = 0, ultimo = -2;

    const passo = () => {
      raf = 0;
      const W = st.clientWidth, H = st.clientHeight;
      const u = Math.max(W, H * 1.2) / 100;
      el.style.setProperty("--u", u.toFixed(3) + "px");
      const s = -rl.getBoundingClientRect().top / H;
      const dive = suave((s - DIVE_DE) / (DIVE_ATE - DIVE_DE));

      // parallax do ponteiro na mesa
      cmx += (mx - cmx) * 0.08;
      cmy += (my - cmy) * 0.08;
      if (!reduzir && fino)
        for (const c of camadas) {
          const k = Number(c.dataset.prof) * (1 - dive);
          c.style.translate = (cmx * k * 18).toFixed(2) + "px " + (cmy * k * 12).toFixed(2) + "px";
        }

      // o mergulho: a mesa cresce em volta da foto-alvo enquanto ela fica reta
      const cx = (ALVO.x / 100) * W, cy = (ALVO.y / 100) * H;
      const fotoH = ALVO.w * u * 0.88;
      const S = escalaMergulho(dive, Math.max(1.2, (H * 1.25) / fotoH));
      const px = cx + (W / 2 - cx) * dive, py = cy + (H / 2 - cy) * dive;
      const giro = (reduzir ? 0 : 11) * Math.sin(Math.PI * Math.min(1, dive * 1.15));
      if (longe.current) {
        longe.current.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${giro.toFixed(2)}deg) scale(${S.toFixed(4)}) translate(${(-cx).toFixed(1)}px,${(-cy).toFixed(1)}px)`;
        longe.current.style.filter = !reduzir && dive > 0.02 ? `blur(${(Math.min(1, dive * 1.6) * 3.2).toFixed(2)}px)` : "none";
      }
      // a foto-alvo é desenhada no tamanho da tela (nunca ampliada), para não perder nitidez
      if (vaga.current) {
        vaga.current.style.left = px.toFixed(1) + "px";
        vaga.current.style.top = py.toFixed(1) + "px";
        vaga.current.style.width = (ALVO.w * u * S).toFixed(1) + "px";
      }
      if (alvo.current) alvo.current.style.transform = `rotate(${giro.toFixed(2)}deg) rotateX(${(24 * Math.pow(1 - dive, 0.6)).toFixed(2)}deg) rotate(${(ALVO.r * (1 - dive)).toFixed(2)}deg)`;
      if (texto.current) {
        const w = clamp01(dive * 2.4);
        texto.current.style.transform = `translate(${(-w * 18).toFixed(2)}vw,${(w * 22).toFixed(2)}vh) scale(${(1 + w * 0.5).toFixed(3)})`;
        texto.current.style.opacity = String(1 - clamp01(dive * 2.8));
        texto.current.style.filter = !reduzir && w > 0.01 ? `blur(${(w * 10).toFixed(1)}px)` : "none";
        texto.current.style.visibility = dive > 0.4 ? "hidden" : "visible";
      }
      if (flash.current) flash.current.style.opacity = String(Math.max(0, 1 - Math.abs(s - DIVE_ATE) / 0.25) * 0.18);

      // tela cheia: começa exatamente sobre a foto revelada e cresce até o palco inteiro
      const t = tela.current;
      if (t) {
        t.style.visibility = dive > 0.82 ? "visible" : "hidden";
        t.style.opacity = String(clamp01((dive - 0.82) / 0.1));
        const larg = ALVO.w * u * S, ang = giro + ALVO.r * (1 - dive);
        const desl = larg * 0.065, rad = (ang * Math.PI) / 180;
        const ax = px + Math.sin(rad) * desl, ay = py - Math.cos(rad) * desl, aw = larg * 0.88;
        const g = suave((s - DIVE_ATE) / (FOTO_ATE - DIVE_ATE));
        const w2 = aw + (W - aw) * g, h2 = aw + (H - aw) * g;
        const x2 = ax + (W / 2 - ax) * g, y2 = ay + (H / 2 - ay) * g;
        t.style.left = (x2 - w2 / 2).toFixed(1) + "px";
        t.style.top = (y2 - h2 / 2).toFixed(1) + "px";
        t.style.width = w2.toFixed(1) + "px";
        t.style.height = h2.toFixed(1) + "px";
        t.style.transform = `rotate(${(ang * (1 - g)).toFixed(2)}deg)`;
      }
      if (legendas.current) legendas.current.style.opacity = String(suave((s - FOTO_ATE + 0.25) / 0.3));

      const q = s < FOTO_ATE - 0.1 ? -1 : Math.min(N - 1, Math.max(0, Math.floor((s - FOTO_ATE) / QUADRO)));
      if (q !== ultimo) {
        ultimo = q;
        setQuadro(q);
      }
      if (Math.abs(mx - cmx) > 0.002 || Math.abs(my - cmy) > 0.002) raf = requestAnimationFrame(passo);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(passo);
    };
    const mover = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      pedir();
    };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    if (fino && !reduzir) window.addEventListener("pointermove", mover, { passive: true });
    const ro = new ResizeObserver(pedir);
    ro.observe(st);
    pedir();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      window.removeEventListener("pointermove", mover);
      ro.disconnect();
    };
  }, []);

  const irPara = (i: number) => {
    const rl = rolo.current, st = palco.current;
    if (!rl || !st) return;
    const alvoQ = Math.max(0, Math.min(N - 1, i));
    rolarPara(window.scrollY + rl.getBoundingClientRect().top + (FOTO_ATE + alvoQ * QUADRO + 0.35) * st.clientHeight);
  };
  const atual = Math.max(0, quadro);

  return (
    <section ref={raiz} id="galeria" aria-label="Galeria de fotos do hotel" className="rolo scroll-mt-0 bg-verde-noite" data-aberto={aberto ? "1" : "0"}>
      <div ref={rolo} className="relative" style={{ height: `calc(100svh * ${TELAS})` }}>
        <div ref={palco} className="sticky top-0 h-svh w-full overflow-hidden">
          {/* a mesa */}
          <div className="rolo-feltro" aria-hidden="true" />
          <div className="rolo-mesa" aria-hidden="true">
            <div ref={longe} className="rolo-camada">
              {MESA.map((p, i) => (
                <div
                  key={p.foto.src}
                  className={`rolo-queda${p.alto ? " rolo-alto" : ""}`}
                  data-prof={p.d}
                  style={{ left: p.x + "%", top: p.y + "%", width: `calc(var(--u) * ${p.w})`, "--r": p.r + "deg", "--i": i } as CSSProperties}
                >
                  <Revelada foto={p.foto} />
                </div>
              ))}
            </div>
            <div className="rolo-camada">
              <div ref={vaga} className="rolo-queda rolo-vaga" style={{ left: ALVO.x + "%", top: ALVO.y + "%", width: `calc(var(--u) * ${ALVO.w})`, "--i": 5 } as CSSProperties}>
                <div ref={alvo} className="origin-center">
                  <Revelada foto={SEQUENCIA[0].foto} eager />
                </div>
              </div>
            </div>
          </div>

          {/* título sobre a mesa */}
          <div ref={texto} className="rolo-texto pointer-events-none absolute inset-x-0 bottom-0 z-[3] origin-bottom-left px-5 pb-10 md:px-8 md:pb-14">
            <div className="mx-auto max-w-7xl">
              <p className="text-[12px] font-medium tracking-[0.26em] text-dourado uppercase">Por dentro do hotel</p>
              <h2 className="font-display mt-3 max-w-xl text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[1.04] text-marfim text-balance">Ambientes que ficam na memória</h2>
              <Ornamento className="mt-5 text-dourado" />
              <p className="mt-4 max-w-md text-marfim/75">Role para entrar nas fotos. No fim, o rolo completo com {ROLO.length} fotos do hotel.</p>
              <a href="#rolo-completo" className="pressionavel pointer-events-auto mt-7 inline-flex h-11 items-center rounded-md border border-marfim/35 px-6 text-[12px] font-medium tracking-[0.16em] text-marfim uppercase hover:border-dourado hover:bg-dourado hover:text-verde-noite">
                Ver todas as fotos
              </a>
            </div>
          </div>

          <div ref={flash} className="rolo-flash" aria-hidden="true" />

          {/* tela cheia */}
          <div ref={tela} className="rolo-tela">
            {SEQUENCIA.map((q, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={q.foto.src} src={url(q.foto.src)} alt={i === atual ? q.foto.alt : ""} draggable={false} loading={i === 0 ? "eager" : "lazy"} decoding="async" className={i === atual ? "rolo-ativa" : i < atual ? "rolo-passou" : ""} />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,34,29,.45)_0%,transparent_26%,transparent_45%,rgba(27,34,29,.6)_70%,rgba(27,34,29,.94)_100%)]" />
          </div>

          {/* legendas, contador e setas */}
          <div ref={legendas} className="pointer-events-none absolute inset-0 z-[9] opacity-0" aria-live="polite">
            <div className="absolute top-24 right-5 flex items-center gap-3 text-marfim [text-shadow:0_1px_14px_rgba(0,0,0,.5)] md:right-8">
              <span className="font-display text-3xl tabular-nums">{String(atual + 1).padStart(2, "0")}</span>
              <span className="h-px w-8 bg-dourado/70" />
              <span className="text-[13px] tracking-[0.2em] text-marfim/70 tabular-nums">{String(N).padStart(2, "0")}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-8 md:pb-14">
              <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
                <div className="relative min-h-[9.5rem] flex-1 md:min-h-[11rem]">
                  {SEQUENCIA.map((q, i) => (
                    <div key={q.titulo} className={`rolo-legenda ${i === quadro ? "rolo-ativa" : i < quadro ? "rolo-passou" : ""}`} aria-hidden={i !== quadro}>
                      <p className="text-[12px] font-medium tracking-[0.26em] text-dourado uppercase">{q.foto.grupo}</p>
                      <h3 className="font-display mt-2 text-[clamp(2.2rem,6vw,5rem)] leading-[1.02] text-marfim">{q.titulo}</h3>
                      <p className="mt-3 max-w-md text-marfim/80">{q.texto}</p>
                    </div>
                  ))}
                </div>
                <div className="pointer-events-auto hidden items-center gap-3 md:flex">
                  <button type="button" onClick={() => irPara(atual - 1)} disabled={atual === 0} aria-label="Foto anterior" className="pressionavel grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/35 text-marfim hover:bg-marfim hover:text-verde-noite disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-marfim">
                    <svg viewBox="0 0 24 24" className="size-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                  <button type="button" onClick={() => irPara(atual + 1)} disabled={atual === N - 1} aria-label="Próxima foto" className="pressionavel grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/35 text-marfim hover:bg-marfim hover:text-verde-noite disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-marfim">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
              <div className="mx-auto mt-6 flex max-w-7xl gap-1.5" aria-hidden="true">
                {SEQUENCIA.map((q, i) => (
                  <span key={q.titulo} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= atual ? "bg-dourado" : "bg-marfim/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoloCompleto />
    </section>
  );
}

/** Folha de contato com todas as fotos, filtro por ambiente e ampliação. */
function RoloCompleto() {
  const [grupo, setGrupo] = useState<Grupo | "Tudo">("Tudo");
  const [aberta, setAberta] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const lista = useMemo(() => (grupo === "Tudo" ? ROLO : ROLO.filter((r) => r.grupo === grupo)), [grupo]);

  const abrir = (i: number) => {
    setAberta(i);
    dialogo.current?.showModal();
  };
  const fechar = () => dialogo.current?.close();
  const andar = (d: number) => setAberta((a) => (a === null ? a : (a + d + lista.length) % lista.length));

  useEffect(() => {
    const dl = dialogo.current;
    if (!dl) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") andar(1);
      if (e.key === "ArrowLeft") andar(-1);
    };
    dl.addEventListener("keydown", tecla);
    return () => dl.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.length]);

  const foto = aberta !== null ? lista[aberta] : null;
  const num = (src: string) => String(ROLO.findIndex((r) => r.src === src) + 1).padStart(2, "0");

  return (
    <div id="rolo-completo" className="relative scroll-mt-16 bg-verde-noite pt-24 pb-28 text-marfim md:pt-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[12px] font-medium tracking-[0.26em] text-dourado uppercase">Rolo completo</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.1]">Todas as fotos do hotel</h2>
            <p className="mt-3 text-marfim/70">
              Mais no{" "}
              <a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="text-marfim underline decoration-dourado underline-offset-4 hover:decoration-2">@pirarucuparkhotel</a>
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fotos por ambiente">
            {(["Tudo", ...GRUPOS] as const).map((g) => {
              const total = g === "Tudo" ? ROLO.length : ROLO.filter((r) => r.grupo === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrupo(g)}
                  aria-pressed={grupo === g}
                  className={`pressionavel h-10 cursor-pointer rounded-md border px-4 text-[13px] transition-colors ${grupo === g ? "border-dourado bg-dourado text-verde-noite" : "border-marfim/25 text-marfim/80 hover:border-marfim/60 hover:text-marfim"}`}
                >
                  {g} <span className="tabular-nums opacity-60">{total}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* folha de contato: tira de filme com perfurações */}
        <ul className="rolo-folha mt-12 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {lista.map((r, i) => (
            <li key={r.src}>
              <button type="button" onClick={() => abrir(i)} className="group block w-full cursor-pointer text-left" aria-label={`Ampliar: ${r.alt}`}>
                <span className="rolo-quadro">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url(r.src)} alt="" loading="lazy" decoding="async" className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.05]" />
                </span>
                <span className="mt-2 flex items-center justify-between font-mono text-[11px] tracking-[0.12em] text-dourado/70 uppercase">
                  <span>{num(r.src)}A</span>
                  <span className="truncate pl-3 text-marfim/45">{r.grupo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogo}
        onClose={() => setAberta(null)}
        onClick={(e) => e.target === dialogo.current && fechar()}
        aria-label="Foto ampliada"
        className="m-auto h-[100svh] max-h-none w-screen max-w-none bg-transparent p-0 text-marfim backdrop:bg-verde-noite/95 backdrop:backdrop-blur-sm"
      >
        {foto && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-16" onClick={(e) => e.target === e.currentTarget && fechar()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={foto.src} src={url(foto.src)} alt={foto.alt} className="rolo-ampliada max-h-[78svh] w-auto max-w-full rounded-md object-contain shadow-2xl" />
            <p className="max-w-2xl text-center text-[15px] text-marfim/80">
              <span className="mr-3 font-mono text-[12px] text-dourado tabular-nums">{String((aberta ?? 0) + 1).padStart(2, "0")} / {String(lista.length).padStart(2, "0")}</span>
              {foto.alt}
            </p>
          </div>
        )}
        <button type="button" onClick={fechar} aria-label="Fechar" className="pressionavel absolute top-4 right-4 grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/30 hover:bg-marfim hover:text-verde-noite">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <button type="button" onClick={() => andar(-1)} aria-label="Foto anterior" className="pressionavel absolute top-1/2 left-3 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-md border border-marfim/30 bg-verde-noite/40 hover:bg-marfim hover:text-verde-noite md:left-6">
          <svg viewBox="0 0 24 24" className="size-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <button type="button" onClick={() => andar(1)} aria-label="Próxima foto" className="pressionavel absolute top-1/2 right-3 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-md border border-marfim/30 bg-verde-noite/40 hover:bg-marfim hover:text-verde-noite md:right-6">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </dialog>
    </div>
  );
}
