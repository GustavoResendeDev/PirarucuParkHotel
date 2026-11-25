"use client";
import { useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MP4 = `${BASE}/video/abertura.mp4`;
const WEBM = `${BASE}/video/abertura.webm`;
const INICIO = `${BASE}/video/abertura-inicio.webp`; // 1º quadro do vídeo (peixe), evita piscar antes de tocar
const LOGO = `${BASE}/video/abertura-logo.webp`; // último quadro (logo), usado quando o vídeo não toca

const SAIDA_MS = 700; // duração do fade de saída
const ESTATICO_MIN_MS = 900; // tempo mínimo do logo parado (reduzir movimento, economia de dados, falha)
const SEM_PLAY_MS = 2500; // se o vídeo não começar nesse tempo, mostra o logo parado
const TETO_MS = 9000; // nunca segura o visitante mais que isso

/**
 * Roda antes do React (vem no HTML estático): decide se a abertura aparece e já dá play no vídeo,
 * para que ele comece junto com a página e não só depois da hidratação.
 */
const SCRIPT_INICIAL = `(function(){
var d=document.documentElement,el=document.getElementById("pph-pre");if(!el)return;
var visto=false;try{visto=sessionStorage.getItem("pph-intro")==="1"}catch(e){}
if(visto){d.setAttribute("data-intro-visto","1");return}
d.setAttribute("data-intro","1");
var reduz=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var c=navigator.connection,economia=c&&(c.saveData||/2g/.test(c.effectiveType||""));
if(reduz||economia){el.setAttribute("data-modo","estatico");return}
var v=el.querySelector("video");if(!v)return;
v.muted=true;v.defaultMuted=true;
v.src=v.canPlayType('video/webm; codecs="vp9"')?${JSON.stringify(WEBM)}:${JSON.stringify(MP4)};
el.setAttribute("data-modo","video");
var p=v.play();if(p&&p.catch)p.catch(function(){el.setAttribute("data-modo","estatico")});
})();`;

/**
 * Abertura: o pirarucu nada pela tela e se transforma no logo do hotel (vídeo de 5 s, sem som).
 * Fica até o vídeo terminar e a página estar carregada, com botão "Pular". Uma vez por sessão.
 * Com "reduzir movimento", economia de dados ou autoplay bloqueado, mostra o logo parado.
 */
export function Preloader() {
  const raiz = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [montado, setMontado] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const el = raiz.current;
    const v = video.current;
    if (!el || html.dataset.introVisto || !html.dataset.intro) {
      setMontado(false);
      return;
    }

    let encerrado = false;
    let videoPronto = false;
    let paginaPronta = document.readyState === "complete";
    const timers: ReturnType<typeof setTimeout>[] = [];

    const encerrar = () => {
      if (encerrado) return;
      encerrado = true;
      try {
        sessionStorage.setItem("pph-intro", "1");
      } catch {}
      delete html.dataset.intro;
      window.dispatchEvent(new Event("pph-intro-fim"));
      setSaindo(true);
      timers.push(
        setTimeout(() => setMontado(false), SAIDA_MS + 50),
      );
    };
    const talvezEncerrar = () => {
      if (videoPronto && paginaPronta) encerrar();
    };
    const irParaEstatico = () => {
      if (encerrado || videoPronto) return;
      el.dataset.modo = "estatico";
      v?.pause();
      timers.push(
        setTimeout(() => {
          videoPronto = true;
          talvezEncerrar();
        }, ESTATICO_MIN_MS),
      );
    };

    const aoCarregar = () => {
      paginaPronta = true;
      talvezEncerrar();
    };
    const aoTerminar = () => {
      videoPronto = true;
      talvezEncerrar();
    };
    window.addEventListener("load", aoCarregar);

    if (el.dataset.modo === "video" && v) {
      v.addEventListener("ended", aoTerminar);
      v.addEventListener("error", irParaEstatico);
      if (v.ended) aoTerminar();
      // vídeo travado (rede lenta, iOS em modo de pouca energia): cai para o logo parado
      timers.push(
        setTimeout(() => {
          if (v.paused && v.currentTime === 0) irParaEstatico();
        }, SEM_PLAY_MS),
      );
    } else {
      el.dataset.modo = "estatico";
      timers.push(
        setTimeout(() => {
          videoPronto = true;
          talvezEncerrar();
        }, ESTATICO_MIN_MS),
      );
    }
    timers.push(setTimeout(encerrar, TETO_MS));

    const pular = () => encerrar();
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") encerrar();
    };
    el.querySelector("[data-pular]")?.addEventListener("click", pular);
    window.addEventListener("keydown", teclado);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", aoCarregar);
      window.removeEventListener("keydown", teclado);
      v?.removeEventListener("ended", aoTerminar);
      v?.removeEventListener("error", irParaEstatico);
      el.querySelector("[data-pular]")?.removeEventListener("click", pular);
      if (!encerrado) delete html.dataset.intro;
    };
  }, []);

  if (!montado) return null;
  return (
    <>
      <div
        ref={raiz}
        id="pph-pre"
        data-preloader
        data-saindo={saindo || undefined}
        role="status"
        aria-label="Carregando o Pirarucu Park Hotel"
        suppressHydrationWarning
      >
        <video
          ref={video}
          className="pph-pre-video"
          poster={INICIO}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
          suppressHydrationWarning
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pph-pre-logo" src={LOGO} alt="" aria-hidden width={848} height={480} decoding="async" />
        <button type="button" data-pular className="pph-pre-pular">
          Pular
        </button>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_INICIAL }} />
      <noscript>
        <style>{`[data-preloader]{display:none!important}`}</style>
      </noscript>
    </>
  );
}
