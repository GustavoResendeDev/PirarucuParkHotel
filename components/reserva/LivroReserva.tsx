"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ACOMODACOES, FERIADOS, HOTEL, PESCA } from "@/lib/data";
import { enviarAoHotel } from "@/lib/envio";
import {
  addDias,
  brl,
  calcular,
  contarNoites,
  criancaGratis,
  diaria,
  feriadosNaEstadia,
  gerarCodigo,
  hospedesTexto,
  pagantes,
  parseISO,
  proximaSexta,
  quartosDoGrupo,
  toISO,
  totalHospedes,
  waLink,
  type Pedido,
} from "@/lib/reserva";
import { baixar, desenharTicket, ticketPDF, ticketPNG } from "@/lib/ticket";
import { Foto } from "../Foto";
import { Logo } from "../Logo";
import { Padrao } from "../Padrao";
import { IconeWhatsApp } from "../WhatsAppFlutuante";

/**
 * Reserva em forma de livro: capa verde com o logo, e cada página é um passo do
 * hóspede. Nada rola dentro das páginas: no celular, os passos maiores viram
 * mais de uma página. Inspirado no modelo de livro com páginas viradas (MIT).
 *
 * Folhas: a folha j tem na frente a página j-1 da direita e no verso a página
 * j da esquerda (a folha 0 é a capa). Com `t` folhas viradas, o livro mostra a
 * página (ou página dupla) t-1.
 */

const DURACAO = 750; // igual ao transition de .livro-folha em globals.css
const ATRASO = 140;

type PagId = "sumario" | "datas" | "hospedes" | "quarto" | "pesca" | "dados" | "recibo" | "envio";
type Capitulo = { n: string; nome: string; titulo: string; paginas: PagId[] };
const CAPS: Capitulo[] = [
  { n: "I", nome: "Datas", titulo: "Quando você chega?", paginas: ["datas"] },
  { n: "II", nome: "Hóspedes", titulo: "Quem vem com você?", paginas: ["hospedes"] },
  { n: "III", nome: "Quarto", titulo: "Escolha seu quarto", paginas: ["quarto"] },
  { n: "IV", nome: "Pesca", titulo: "Vai pescar?", paginas: ["pesca"] },
  { n: "V", nome: "Seus dados", titulo: "Como falamos com você?", paginas: ["dados"] },
  { n: "VI", nome: "Orçamento", titulo: "Seu orçamento", paginas: ["recibo", "envio"] },
];
const capDe = (id: PagId) => CAPS.find((c) => c.paginas.includes(id));

/** Ordem canônica (celular: uma página por item). No computador, recibo e envio dividem a página dupla. */
const UNICO: PagId[] = ["sumario", "datas", "hospedes", "quarto", "pesca", "dados", "recibo", "envio"];
const DUPLO: PagId[] = ["sumario", "datas", "hospedes", "quarto", "pesca", "dados", "envio"];

type Setter = <K extends keyof Pedido>(k: K, v: Pedido[K]) => void;
type Estado = "editando" | "enviando" | "enviado" | "falhou";

function pedidoInicial(): Pedido {
  const s = proximaSexta();
  return { entrada: toISO(s), saida: toISO(addDias(s, 2)), adultos: 2, idades: [], acomodacao: undefined, pescadores: 0, diasPesca: 2, nome: "", telefone: "", obs: "", codigo: "" };
}

const ehCampo = (el: EventTarget | null) => {
  const tag = (el as HTMLElement | null)?.tagName ?? "";
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!(el as HTMLElement | null)?.isContentEditable;
};

export function LivroReserva() {
  const params = useSearchParams();
  const [p, setP] = useState<Pedido>(pedidoInicial);
  const [duplo, setDuplo] = useState(true);
  const [t, setT] = useState(0);
  const [giro, setGiro] = useState<{ a: number; b: number; dir: 1 | -1 } | null>(null);
  /** Índice em UNICO da página mais adiantada liberada. */
  const [alcance, setAlcance] = useState(1);
  const [erro, setErro] = useState("");
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<Estado>("editando");
  const [ticket, setTicket] = useState<{ previa: string; pdf: Blob; png: Blob } | null>(null);
  const [hoje, setHoje] = useState("");
  const [foco, setFoco] = useState<string | null>(null);
  const [galeria, setGaleria] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const tRef = useRef(0);
  const palco = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const toque = useRef<{ x: number; y: number; campo: boolean } | null>(null);

  const ordem = duplo ? DUPLO : UNICO;
  const orc = useMemo(() => calcular(p), [p]);
  const set: Setter = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const idEm = (tt: number, lista = ordem): PagId | null => (tt >= 1 ? lista[tt - 1] : null);
  /** Posição (t) de uma página no modo atual. */
  const tDe = (id: PagId, lista = ordem) => {
    const i = lista.indexOf(id);
    return (i >= 0 ? i : lista.indexOf("envio")) + 1;
  };
  const alcanceT = tDe(UNICO[alcance]);

  // livro de duas páginas em telas largas, de uma página no celular; mantém a página aberta ao trocar
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1000px)");
    const on = () => {
      setDuplo((antes) => {
        if (antes === mq.matches) return antes;
        const de = antes ? DUPLO : UNICO;
        const para = mq.matches ? DUPLO : UNICO;
        const id = tRef.current >= 1 ? de[tRef.current - 1] : null;
        const novo = id ? (para.indexOf(id) >= 0 ? para.indexOf(id) : para.indexOf("envio")) + 1 : 0;
        tRef.current = novo;
        setT(novo);
        setGiro(null);
        return mq.matches;
      });
    };
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  function irPara(novo: number, focar = true) {
    const atual = tRef.current;
    novo = Math.max(0, Math.min(ordem.length, novo));
    if (novo === atual) return;
    tRef.current = novo;
    const a = Math.min(atual, novo);
    const b = Math.max(atual, novo);
    setGiro({ a, b, dir: novo > atual ? 1 : -1 });
    setT(novo);
    setErro("");
    const id = idEm(novo);
    const cap = id && capDe(id);
    setAviso(!id ? "Livro fechado" : cap ? `Capítulo ${cap.n}: ${cap.nome}` : "Sumário");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setGiro(null);
        if (focar) palco.current?.querySelector<HTMLElement>('[data-ativa="1"] [data-titulo]')?.focus({ preventScroll: true });
      },
      DURACAO + ATRASO * (b - a - 1) + 40,
    );
    const r = palco.current?.getBoundingClientRect();
    if (r && (r.top < -40 || r.bottom > window.innerHeight + 40)) window.scrollTo({ top: window.scrollY + r.top - 110, behavior: "smooth" });
  }

  // parâmetros da busca rápida ou de uma acomodação; abre o livro depois da abertura do site
  useEffect(() => {
    setHoje(toISO(new Date()));
    setP((atual) => {
      const n = { ...atual };
      const e = params.get("entrada");
      const s = params.get("saida");
      const a = Number(params.get("adultos"));
      const ac = params.get("acomodacao");
      if (e && s && s > e) {
        n.entrada = e;
        n.saida = s;
        n.diasPesca = Math.max(1, contarNoites(e, s));
      }
      if (a > 0 && a <= 12) n.adultos = a;
      if (ac && ACOMODACOES.some((x) => x.slug === ac)) n.acomodacao = ac;
      return n;
    });
    const veio = !!(params.get("entrada") || params.get("acomodacao"));
    // link para outra seção da página (ex.: /reservar#day-use): não abre o livro, que rolaria a tela de volta
    if (window.location.hash && !veio) return;
    let id = 0;
    const tentar = () => {
      id = document.querySelector("[data-preloader]") ? window.setTimeout(tentar, 200) : window.setTimeout(() => irPara(veio ? 2 : 1, false), 900);
    };
    id = window.setTimeout(tentar, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function validar(id: PagId): string {
    if (id === "datas") {
      if (!p.entrada || !p.saida || p.saida <= p.entrada) return "Escolha uma saída depois da entrada.";
      if (hoje && p.entrada < hoje) return "A entrada não pode ser uma data que já passou.";
      if (feriadosNaEstadia(p.entrada, p.saida).length && orc.noites < HOTEL.minimoDiariasFeriado) return `Essas datas incluem feriado: escolha pelo menos ${HOTEL.minimoDiariasFeriado} diárias.`;
    }
    if (id === "hospedes" && p.idades.some((i) => i < 0)) return "Informe a idade de cada criança.";
    if (id === "quarto" && !p.acomodacao) return "Escolha um quarto para continuar.";
    if (id === "dados") {
      if (p.nome.trim().length < 3) return "Informe seu nome.";
      if (p.telefone.replace(/\D/g, "").length < 10) return "Informe um WhatsApp com DDD.";
    }
    return "";
  }

  function avancar() {
    const atual = tRef.current;
    if (atual >= ordem.length) return;
    const id = idEm(atual);
    if (id) {
      const e = validar(id);
      if (e) return setErro(e);
      setP((x) => ({
        ...x,
        pescadores: Math.min(x.pescadores, totalHospedes(x)),
        diasPesca: Math.min(Math.max(1, x.diasPesca), Math.max(1, contarNoites(x.entrada, x.saida))),
      }));
    }
    const prox = idEm(atual + 1);
    if (prox) setAlcance((a) => Math.max(a, UNICO.indexOf(prox)));
    irPara(atual + 1);
  }
  const voltar = () => irPara(tRef.current - 1);

  async function enviar() {
    for (const id of ["datas", "hospedes", "quarto", "dados"] as PagId[]) {
      const e = validar(id);
      if (e) {
        irPara(tDe(id));
        setTimeout(() => setErro(e), 30);
        return;
      }
    }
    if (!aceite) return setErro("Para enviar, marque que leu as condições.");
    setErro("");
    setEstado("enviando");
    const final = { ...p, codigo: p.codigo || gerarCodigo() };
    setP(final);
    try {
      const cv = await desenharTicket(final);
      const [pdf, png] = await Promise.all([ticketPDF(cv), ticketPNG(cv)]);
      setTicket({ previa: cv.toDataURL("image/jpeg", 0.8), pdf, png });
      const r = await enviarAoHotel(final, pdf);
      setEstado(r.ok ? "enviado" : "falhou");
    } catch {
      setEstado("falhou");
    }
  }

  function novo() {
    setP(pedidoInicial());
    setAceite(false);
    setEstado("editando");
    setTicket(null);
    setAlcance(1);
    irPara(1);
  }

  // teclado: setas e Page Up/Down folheiam, fora dos campos
  const acoes = useRef({ avancar, voltar });
  acoes.current = { avancar, voltar };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ehCampo(e.target) || e.altKey || e.ctrlKey || e.metaKey || document.querySelector("[data-galeria-quarto]")) return;
      const r = palco.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        acoes.current.avancar();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        acoes.current.voltar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ctx: Ctx = { p, set, orc, hoje, erro, aceite, setAceite, estado, ticket, enviar, novo, avancar, voltar, irPara, tDe, alcanceT, foco, setFoco, setGaleria, duplo };

  /* ---------- páginas ---------- */
  const conteudo = (id: PagId, lado: "esq" | "dir" | "unica"): ReactNode => {
    if (id === "sumario") return <Sumario c={ctx} />;
    return <Pagina id={id} lado={lado} c={ctx} />;
  };
  const folio = (i: number, lado: "esq" | "dir" | "unica") => (lado === "unica" ? `${i} / ${UNICO.length - 1}` : String(i * 2 + (lado === "dir" ? 1 : 0)));

  const folhas = Array.from({ length: ordem.length + 1 }, (_, j) => {
    let frente: ReactNode;
    let verso: ReactNode;
    if (j === 0) frente = <Capa onAbrir={() => irPara(1)} />;
    else {
      const id = ordem[j - 1];
      const lado = duplo ? "dir" : "unica";
      frente = (
        <Papel lado={lado} folio={id === "sumario" ? undefined : folio(j - 1, lado)} cabeca={duplo && capDe(id) ? `Capítulo ${capDe(id)!.n} · ${capDe(id)!.nome}` : undefined}>
          {conteudo(id, lado)}
        </Papel>
      );
    }
    if (!duplo) verso = <div className="livro-papel livro-unica" />;
    else if (j === 0) verso = <Guarda texto />;
    else if (j < ordem.length) {
      const id = ordem[j];
      verso = (
        <Papel lado="esq" folio={folio(j, "esq")} cabeca={HOTEL.nome}>
          {conteudo(id === "envio" ? "recibo" : id, "esq")}
        </Papel>
      );
    } else verso = <Guarda />;

    const virada = j < t;
    const girando = !!giro && j >= giro.a && j < giro.b;
    const visivel = girando || (duplo ? j >= t - 2 && j <= t + 1 : j === t || j === t + 1);
    const z = girando ? 900 + (giro!.dir > 0 ? j : 100 - j) : virada ? 100 + j : 600 - j;
    const atraso = girando ? (giro!.dir > 0 ? j - giro!.a : giro!.b - 1 - j) * ATRASO : 0;
    const frenteAtiva = !giro && j === t;
    const versoAtivo = !giro && duplo && j === t - 1;
    return (
      <div key={`${duplo ? "d" : "u"}${j}`} className="livro-folha" data-virada={virada ? "1" : "0"} data-girando={girando ? "1" : "0"} style={{ zIndex: z, visibility: visivel ? "visible" : "hidden", transitionDelay: `${atraso}ms` }}>
        <div className="livro-face" data-ativa={frenteAtiva ? "1" : "0"} inert={!frenteAtiva} style={{ visibility: !virada || girando ? undefined : "hidden" }}>
          {frente}
        </div>
        <div className="livro-face livro-verso" data-ativa={versoAtivo ? "1" : "0"} inert={!versoAtivo} style={{ visibility: virada || girando ? undefined : "hidden" }}>
          {verso}
        </div>
      </div>
    );
  });

  const idAtual = idEm(t);
  const capAtual = idAtual ? capDe(idAtual) : undefined;
  const rotuloPosicao = t === 0 ? "Livro fechado" : capAtual ? `Capítulo ${capAtual.n} de ${CAPS[CAPS.length - 1].n}` : "Sumário";

  return (
    <section className="livro-mesa relative overflow-hidden pt-[88px] pb-4 lg:pt-24 lg:pb-6" aria-labelledby="livro-titulo">
      <h1 id="livro-titulo" className="sr-only">
        Livro de reservas do {HOTEL.nome}
      </h1>
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>

      {/* marcadores dos capítulos */}
      <nav aria-label="Capítulos do livro" className="mx-auto mb-3 hidden max-w-5xl justify-center gap-1 px-4 lg:flex">
        {[{ n: "", nome: "Sumário", paginas: ["sumario"] as PagId[] }, ...CAPS].map((c) => {
          const alvo = tDe(c.paginas[0]);
          const atual = idAtual !== null && c.paginas.includes(idAtual);
          return (
            <button
              key={c.nome}
              type="button"
              disabled={alvo > alcanceT}
              aria-current={atual ? "page" : undefined}
              onClick={() => irPara(alvo)}
              className={`flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${atual ? "bg-verde text-marfim" : "text-verde hover:bg-verde/8"}`}
            >
              {c.n && <span className={`font-display text-[12px] ${atual ? "text-dourado" : "text-dourado-escuro"}`}>{c.n}</span>}
              {c.nome}
            </button>
          );
        })}
      </nav>

      <div
        ref={palco}
        className="livro-palco"
        data-modo={duplo ? "duplo" : "unico"}
        role="region"
        aria-roledescription="livro"
        aria-label="Livro de reservas"
        onTouchStart={(e) => {
          const p0 = e.touches[0];
          toque.current = { x: p0.clientX, y: p0.clientY, campo: ehCampo(e.target) };
        }}
        onTouchEnd={(e) => {
          const ini = toque.current;
          toque.current = null;
          if (!ini || ini.campo || duplo) return;
          const p1 = e.changedTouches[0];
          const dx = p1.clientX - ini.x;
          if (Math.abs(dx) > 70 && Math.abs(p1.clientY - ini.y) < 45) (dx < 0 ? avancar : voltar)();
        }}
      >
        <div className="livro" data-fechado={t === 0 ? "1" : "0"}>
          <div className="livro-capas" />
          <div className="livro-sob livro-sob-esq" />
          <div className="livro-sob livro-sob-dir" />
          {folhas}
        </div>
        {/* no computador, as setas ficam nas laterais do livro */}
        {duplo && (
          <>
            <div className="absolute top-1/2 -left-[68px] -translate-y-1/2">
              <BotaoSeta dir={-1} rotulo="Página anterior" disabled={t === 0} onClick={voltar} />
            </div>
            <div className="absolute top-1/2 -right-[68px] -translate-y-1/2">
              <BotaoSeta dir={1} rotulo={t === 0 ? "Abrir o livro" : "Próxima página"} disabled={t >= ordem.length} onClick={avancar} />
            </div>
          </>
        )}
      </div>

      {duplo ? null : (
        <div className="mx-auto mt-3 flex max-w-md items-center justify-between gap-4 px-4">
          <BotaoSeta dir={-1} rotulo="Página anterior" disabled={t === 0} onClick={voltar} />
          <p className="text-center text-[13px] text-verde/80">
            {rotuloPosicao}
            <span className="block text-[12px] text-verde/80">deslize para folhear</span>
          </p>
          <BotaoSeta dir={1} rotulo={t === 0 ? "Abrir o livro" : "Próxima página"} disabled={t >= ordem.length} onClick={avancar} />
        </div>
      )}

      {galeria && <GaleriaModal slug={galeria} onFechar={() => setGaleria(null)} />}
    </section>
  );
}

/* ============================================================================= */

type Ctx = {
  p: Pedido;
  set: Setter;
  orc: ReturnType<typeof calcular>;
  hoje: string;
  erro: string;
  aceite: boolean;
  setAceite: (v: boolean) => void;
  estado: Estado;
  ticket: { previa: string; pdf: Blob; png: Blob } | null;
  enviar: () => void;
  novo: () => void;
  avancar: () => void;
  voltar: () => void;
  irPara: (t: number) => void;
  tDe: (id: PagId) => number;
  alcanceT: number;
  foco: string | null;
  setFoco: (s: string | null) => void;
  setGaleria: (s: string | null) => void;
  duplo: boolean;
};

function BotaoSeta({ dir, rotulo, disabled, onClick }: { dir: 1 | -1; rotulo: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      disabled={disabled}
      onClick={onClick}
      className="pressionavel grid size-11 shrink-0 cursor-pointer place-items-center rounded-md border border-verde/25 text-verde hover:border-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
        <path d={dir > 0 ? "M5 12h14M13 6l6 6-6 6" : "M19 12H5M11 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}

function Papel({ lado, folio, cabeca, children }: { lado: "esq" | "dir" | "unica"; folio?: string; cabeca?: string; children: ReactNode }) {
  return (
    <div className={`livro-papel livro-${lado}`}>
      {cabeca && <span className="livro-cabeca">{cabeca}</span>}
      <div className="livro-miolo">{children}</div>
      {folio && <span className="livro-folio">{folio}</span>}
    </div>
  );
}

function Capa({ onAbrir }: { onAbrir: () => void }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const mascara = `url(${base}/marca/logo-dourado.webp)`;
  return (
    <div className="livro-capa">
      <div className="livro-capa-moldura" />
      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <p className="text-[11px] tracking-[0.42em] text-dourado/90 uppercase">Livro de reservas</p>
        <span aria-hidden className="mt-5 h-px w-16 bg-dourado/50" />
        <div className="relative mt-10 w-[min(68%,340px)]">
          <Logo cor="dourado" className="w-full" />
          <span aria-hidden className="livro-brilho" style={{ WebkitMaskImage: mascara, maskImage: mascara }} />
        </div>
        <p className="font-display mt-10 text-lg text-dourado-claro/85">{HOTEL.cidade} · Goiás</p>
        <button type="button" onClick={onAbrir} className="pressionavel mt-10 inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-dourado/60 px-7 text-[13px] tracking-[0.16em] text-dourado-claro uppercase hover:bg-dourado/10">
          Abrir o livro
        </button>
      </div>
    </div>
  );
}

function Guarda({ texto = false }: { texto?: boolean }) {
  return (
    <div className="livro-guarda">
      <Padrao className="absolute inset-0" opacidade={0.22} />
      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <Logo cor="dourado" somentePeixe className="w-40 opacity-90" />
        {texto && (
          <>
            <p className="font-display mt-8 text-2xl text-dourado-claro">Ex libris</p>
            <p className="mt-3 max-w-xs text-[15px] text-dourado/80">Este livro guarda a sua próxima estadia à beira do lago.</p>
          </>
        )}
      </div>
    </div>
  );
}

const botaoPrincipal = "pressionavel inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-verde px-5 text-[15px] text-marfim hover:bg-verde-claro";

function Sumario({ c }: { c: Ctx }) {
  return (
    <div className="flex h-full flex-col">
      <Logo cor="verde" className="w-16 shrink-0 lg:w-20 [@media(max-height:780px)]:w-14" />
      <h2 data-titulo tabIndex={-1} className="titulo-marca mt-4 text-[clamp(1.6rem,3vw,2.4rem)] text-salvia outline-none lg:mt-6">
        Livro de reservas
      </h2>
      <p className="mt-3 text-[14px] text-verde/75 [@media(max-height:820px)]:hidden lg:text-[15px]">Um passo em cada página, sem cadastro. No final, o hotel recebe seu orçamento e você baixa o comprovante.</p>
      <p className="mt-4 text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase lg:mt-6">Sumário</p>
      <ol className="mt-1">
        {CAPS.map((cap, i) => {
          const alvo = c.tDe(cap.paginas[0]);
          const livre = alvo <= c.alcanceT;
          return (
            <li key={cap.n}>
              <button type="button" disabled={!livre} onClick={() => c.irPara(alvo)} className="group flex w-full cursor-pointer items-baseline gap-3 py-[5px] text-left disabled:cursor-default lg:py-1.5">
                <span className="font-display w-7 shrink-0 text-dourado-escuro">{cap.n}</span>
                <span className={`text-[15px] ${livre ? "text-verde group-hover:underline group-hover:decoration-dourado group-hover:underline-offset-4" : "text-verde/80"}`}>{cap.nome}</span>
                <span className="livro-leader" aria-hidden />
                <span className="font-display text-[14px] text-verde/80">{(i + 1) * 2}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto pt-4">
        <button type="button" onClick={c.avancar} className={botaoPrincipal}>
          Começar pelas datas <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- páginas dos capítulos ---------- */

function Cabeca({ cap, titulo, foco }: { cap: Capitulo; titulo?: string; foco: boolean }) {
  return (
    <header className="shrink-0">
      <p className="text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase">Capítulo {cap.n}</p>
      <h2 data-titulo={foco ? "" : undefined} tabIndex={-1} className="font-display mt-1 text-[clamp(1.5rem,2.6vw,2.3rem)] leading-[1.08] text-verde outline-none [@media(max-height:800px)]:text-[1.6rem]">
        {titulo ?? cap.titulo}
      </h2>
    </header>
  );
}

function Pagina({ id, lado, c }: { id: PagId; lado: "esq" | "dir" | "unica"; c: Ctx }) {
  const cap = capDe(id)!;
  const partes = PARTES[id as Exclude<PagId, "sumario">](c);
  const rodape = id === "envio" ? null : id === "recibo" && lado === "esq" ? null : <Rodape c={c} />;
  if (lado === "esq")
    return (
      <div className="flex h-full flex-col gap-4">
        <Cabeca cap={cap} titulo={partes.tituloEsq} foco />
        {partes.esq}
      </div>
    );
  if (lado === "dir")
    return (
      <div className="flex h-full flex-col">
        <div data-titulo tabIndex={-1} className="flex min-h-0 flex-1 flex-col gap-4 outline-none">
          {partes.dir}
        </div>
        {rodape}
      </div>
    );
  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-2.5">
        <Cabeca cap={cap} titulo={partes.tituloUnica} foco />
        {partes.unica ?? partes.dir}
      </div>
      {rodape}
    </div>
  );
}

type Partes = { esq?: ReactNode; dir?: ReactNode; unica?: ReactNode; tituloEsq?: string; tituloUnica?: string };

const PARTES: Record<Exclude<PagId, "sumario">, (c: Ctx) => Partes> = {
  datas: (c) => {
    const { p, orc } = c;
    const feriados = orc.noites > 0 ? feriadosNaEstadia(p.entrada, p.saida) : [];
    const aviso = feriados.length > 0 && <p className="rounded-md bg-dourado/15 px-3 py-2 text-[13px] text-verde/85">Inclui {feriados.join(", ")}: mínimo de {HOTEL.minimoDiariasFeriado} diárias.</p>;
    const cal = <Calendario entrada={p.entrada} saida={p.saida} hoje={c.hoje} onChange={(e, s) => (c.set("entrada", e), c.set("saida", s))} />;
    return {
      esq: (
        <>
          <p className="shrink-0 text-[15px] text-verde/75">Marque no calendário o dia da chegada e o da saída. Entrar mais cedo ou sair mais tarde não tem custo, se houver vaga.</p>
          <Prancha src="/fotos/fachada-lago.webp" alt="Fachada do hotel vista do lago" legenda="Todos os quartos têm vista para o lago." />
          <dl className="shrink-0 space-y-1.5 text-[15px]">
            <Ficha k="Entrada" v={`${dataLonga(p.entrada)}, a partir das ${HOTEL.checkin}`} />
            <Ficha k="Saída" v={`${dataLonga(p.saida)}, até as ${HOTEL.checkout}`} />
            <Ficha k="Diárias" v={orc.noites > 0 ? String(orc.noites) : "-"} />
          </dl>
        </>
      ),
      dir: (
        <>
          <Subtitulo>Marque no calendário</Subtitulo>
          {cal}
          {aviso}
        </>
      ),
      unica: (
        <>
          {cal}
          <p className="shrink-0 text-[14px] text-verde">
            {dataLonga(p.entrada)} → {dataLonga(p.saida)} · <strong className="font-medium">{orc.noites} diária{orc.noites > 1 ? "s" : ""}</strong>
          </p>
          {aviso}
        </>
      ),
    };
  },

  hospedes: (c) => {
    const { p, set } = c;
    const h = totalHospedes(p);
    const pag = pagantes(p);
    const controles = (
      <>
        <Contador rotulo="Adultos" valor={p.adultos} min={1} max={12} onChange={(v) => set("adultos", v)} />
        <Contador rotulo="Crianças" sub={`Até ${HOTEL.idadeCriancaGratis} anos não pagam`} valor={p.idades.length} min={0} max={6} onChange={(v) => set("idades", v > p.idades.length ? [...p.idades, -1] : p.idades.slice(0, v))} />
        {p.idades.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {p.idades.map((idade, i) => (
              <label key={i} className="block">
                <span className="text-[12px] text-salvia-escura">Criança {i + 1}</span>
                <select value={idade} onChange={(e) => set("idades", p.idades.map((x, k) => (k === i ? Number(e.target.value) : x)))} className={`${campoBase} mt-0.5 h-10 cursor-pointer px-2 py-0 text-[14px]`}>
                  <option value={-1} disabled>
                    Idade
                  </option>
                  {Array.from({ length: 18 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "< 1 ano" : `${n} ano${n > 1 ? "s" : ""}`}
                      {criancaGratis(n) ? " · grátis" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        <p className="text-[14px] text-verde/80">
          {h} pessoa{h > 1 ? "s" : ""} no total{h !== pag ? `, ${pag} pagante${pag > 1 ? "s" : ""}` : ""}.
        </p>
      </>
    );
    return {
      esq: (
        <>
          <ul className="shrink-0 space-y-2.5 text-[15px] text-verde/80">
            <Item>Crianças até {HOTEL.idadeCriancaGratis} anos não pagam.</Item>
            <Item>Cada quarto recebe até 4 pessoas. No Executivo, a 4ª pessoa dorme em cama extra, por {brl(100)} a diária.</Item>
            <Item>Grupos maiores ficam em mais de um quarto, e o orçamento já faz a divisão.</Item>
            <Item>Não aceitamos animais de estimação.</Item>
          </ul>
          <Prancha src="/fotos/cafe-000.webp" alt="Mesa do café da manhã do hotel" legenda={`Café da manhã incluso, das ${HOTEL.cafe}.`} />
        </>
      ),
      dir: (
        <>
          <Subtitulo>Hóspedes</Subtitulo>
          {controles}
        </>
      ),
      unica: controles,
    };
  },

  quarto: (c) => ({ esq: <GaleriaQuarto c={c} />, dir: <EscolhaQuarto c={c} />, tituloUnica: "Escolha o quarto" }),

  pesca: (c) => {
    const { p, set, orc } = c;
    const h = totalHospedes(p);
    const dias = Math.min(p.diasPesca, Math.max(1, orc.noites));
    const controles = (
      <>
        <p className="text-[14px] text-verde/80">
          Opcional: {brl(PESCA.preco)} por pessoa, por diária, pesque e solte, 24 horas. Se ninguém vai pescar, é só virar a página.
        </p>
        <Contador rotulo="Pessoas que vão pescar" valor={p.pescadores} min={0} max={h} onChange={(v) => set("pescadores", v)} />
        {p.pescadores > 0 && (
          <>
            <Contador rotulo="Diárias de pesca" sub={`Sua estadia tem ${orc.noites} diária${orc.noites > 1 ? "s" : ""}`} valor={dias} min={1} max={Math.max(1, orc.noites)} onChange={(v) => set("diasPesca", v)} />
            <p className="text-[15px] text-verde">
              Pesca: {p.pescadores} × {dias} × {brl(PESCA.preco)} = <strong className="font-medium">{brl(p.pescadores * dias * PESCA.preco)}</strong>
            </p>
          </>
        )}
      </>
    );
    return {
      esq: (
        <>
          <ul className="shrink-0 space-y-2.5 text-[15px] text-verde/80">
            <Item>Pesque e solte: todo peixe volta para o lago. Exclusiva para hóspedes.</Item>
            <Item>O hotel não aluga equipamento. Traga o seu.</Item>
          </ul>
          <Prancha src="/fotos/peixe-janela.webp" alt="Escultura do pirarucu em metal dourado na parede de pedra" legenda="O pirarucu, símbolo do hotel e estrela do lago." />
          <Link href="/pesca" className="shrink-0 text-[14px] text-salvia-escura underline decoration-dourado underline-offset-4 hover:text-verde">
            Ver iscas permitidas e regras da pesca
          </Link>
        </>
      ),
      dir: (
        <>
          <Subtitulo>Pesca esportiva</Subtitulo>
          {controles}
        </>
      ),
      unica: controles,
    };
  },

  dados: (c) => {
    const { p, set } = c;
    const campos = (
      <>
        <label className="block">
          <span className={rotuloCampo}>Nome completo</span>
          <input autoComplete="name" value={p.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como devemos te chamar?" className={campoBase} />
        </label>
        <label className="block">
          <span className={rotuloCampo}>WhatsApp</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={p.telefone}
            placeholder="(00) 00000-0000"
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 11);
              set("telefone", d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d);
            }}
            className={campoBase}
          />
        </label>
        <label className="block">
          <span className={rotuloCampo}>Observações (opcional)</span>
          <textarea rows={2} value={p.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Horário de chegada, ocasião especial…" className={`${campoBase} resize-none`} />
        </label>
      </>
    );
    return {
      esq: (
        <>
          <ul className="shrink-0 space-y-2.5 text-[15px] text-verde/80">
            <Item>O hotel recebe seu orçamento na hora e fala com você pelo WhatsApp para confirmar a disponibilidade.</Item>
            <Item>A reserva fica garantida com o sinal de {HOTEL.sinalPercentual}%, por PIX, transferência ou cartão. O restante é pago no hotel.</Item>
            <Item>Mudança de data sem custo. Se cancelar, o valor pago vira crédito por 3 meses, exceto em feriados.</Item>
          </ul>
          <Prancha src="/fotos/recepcao.webp" alt="Recepção do hotel" legenda="Recepção aberta 24 horas." />
        </>
      ),
      dir: (
        <>
          <Subtitulo>Seus dados</Subtitulo>
          {campos}
        </>
      ),
      unica: campos,
    };
  },

  recibo: (c) => ({ esq: <Recibo c={c} />, unica: <Recibo c={c} />, tituloEsq: "Seu orçamento", tituloUnica: "Confira o orçamento" }),
  envio: (c) => ({ dir: <Envio c={c} />, unica: <Envio c={c} />, tituloUnica: c.ticket ? (c.estado === "enviado" ? "Orçamento enviado" : "Comprovante pronto") : "Enviar ao hotel" }),
};

/* ---------- peças ---------- */

const rotuloCampo = "text-[13px] text-salvia-escura";
const campoBase = "mt-1 w-full rounded-md border border-verde/15 bg-[#fbfaf4] px-3.5 py-2.5 text-verde outline-none transition-colors duration-200 focus:border-salvia focus-visible:ring-2 focus-visible:ring-dourado";

const hospedesCurto = (p: Pedido) => `${p.adultos} adulto${p.adultos > 1 ? "s" : ""}${p.idades.length ? ` e ${p.idades.length} criança${p.idades.length > 1 ? "s" : ""}` : ""}`;
const dataCurta = (s: string) => parseISO(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const dataLonga = (s: string) => parseISO(s).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="shrink-0 text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase">{children}</h3>;
}

function Item({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-dourado-escuro" />
      <span>{children}</span>
    </li>
  );
}

function Ficha({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-verde/80">{k}</dt>
      <span className="livro-leader" aria-hidden />
      <dd className="text-right text-verde">{v}</dd>
    </div>
  );
}

/** Foto colada na página; ocupa o espaço que sobrar. */
function Prancha({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  return (
    <figure className="livro-prancha flex min-h-0 flex-1 flex-col">
      <Foto src={src} alt={alt} className="min-h-[90px] w-full flex-1" />
      <figcaption className="font-display shrink-0 px-1 pt-1.5 text-[13px] text-verde/80 italic">{legenda}</figcaption>
    </figure>
  );
}

function Contador({ rotulo, sub, valor, min, max, onChange }: { rotulo: string; sub?: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  const botao = "pressionavel grid size-10 cursor-pointer place-items-center rounded-md border border-verde/20 text-lg text-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 rounded-md border border-verde/10 bg-[#fbfaf4] px-4 py-2.5">
      <div>
        <p className="text-verde">{rotulo}</p>
        {sub && <p className="text-[12px] text-verde/80">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Diminuir ${rotulo.toLowerCase()}`} disabled={valor <= min} onClick={() => onChange(valor - 1)} className={botao}>
          −
        </button>
        <span aria-live="polite" className="w-7 text-center text-lg text-verde tabular-nums">
          {valor}
        </span>
        <button type="button" aria-label={`Aumentar ${rotulo.toLowerCase()}`} disabled={valor >= max} onClick={() => onChange(valor + 1)} className={botao}>
          +
        </button>
      </div>
    </div>
  );
}

function Erro({ c }: { c: Ctx }) {
  if (!c.erro) return null;
  return (
    <p role="alert" className="mb-3 rounded-md border border-dourado-escuro/30 bg-dourado/15 px-3 py-2 text-[14px] text-verde">
      {c.erro}
    </p>
  );
}

function Rodape({ c }: { c: Ctx }) {
  return (
    <div className="shrink-0 pt-3">
      <Erro c={c} />
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={c.voltar} className="pressionavel inline-flex h-11 cursor-pointer items-center rounded-md px-3 text-[14px] text-verde/80 hover:bg-verde/5">
          ← Voltar
        </button>
        <button type="button" onClick={c.avancar} className={botaoPrincipal}>
          Virar a página <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- calendário de chegada e saída ---------- */

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function Calendario({ entrada, saida, hoje, onChange }: { entrada: string; saida: string; hoje: string; onChange: (entrada: string, saida: string) => void }) {
  const [mes, setMes] = useState(() => {
    const d = parseISO(entrada);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [fase, setFase] = useState<"entrada" | "saida">("entrada");
  useEffect(() => {
    const d = parseISO(entrada);
    setMes((m) => (m.getFullYear() === d.getFullYear() && m.getMonth() === d.getMonth() ? m : new Date(d.getFullYear(), d.getMonth(), 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrada.slice(0, 7)]);

  const inicio = mes.getDay();
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celulas: (string | null)[] = [...Array(inicio).fill(null), ...Array.from({ length: total }, (_, i) => toISO(new Date(mes.getFullYear(), mes.getMonth(), i + 1)))];
  const podeVoltar = !hoje || toISO(mes).slice(0, 7) > hoje.slice(0, 7);
  const nomeMes = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  function escolher(d: string) {
    if (fase === "saida" && d > entrada) {
      onChange(entrada, d);
      setFase("entrada");
    } else {
      onChange(d, toISO(addDias(parseISO(d), 1)));
      setFase("saida");
    }
  }

  const seta = "pressionavel grid size-9 cursor-pointer place-items-center rounded-md text-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-25";
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Mês anterior" disabled={!podeVoltar} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className={seta}>
          ‹
        </button>
        <p className="font-display text-lg text-verde first-letter:uppercase" aria-live="polite">
          {nomeMes}
        </p>
        <button type="button" aria-label="Próximo mês" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className={seta}>
          ›
        </button>
      </div>
      <div className="mt-1 grid grid-cols-7 text-center text-[11px] tracking-[0.18em] text-verde/80" aria-hidden>
        {SEMANA.map((d, i) => (
          <span key={i} className="py-0.5">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5" role="grid" aria-label={`Dias de ${nomeMes}`}>
        {celulas.map((d, i) => {
          if (!d) return <span key={`v${i}`} />;
          const passado = !!hoje && d < hoje;
          const ponta = d === entrada || d === saida;
          const meio = d > entrada && d < saida;
          const feriado = FERIADOS[d];
          return (
            <div key={d} className={`relative flex justify-center ${meio ? "bg-salvia/15" : ""} ${d === entrada && saida > entrada ? "bg-gradient-to-r from-transparent from-50% to-salvia/15 to-50%" : ""} ${d === saida ? "bg-gradient-to-r from-salvia/15 from-50% to-transparent to-50%" : ""}`}>
              <button
                type="button"
                disabled={passado}
                onClick={() => escolher(d)}
                aria-pressed={ponta || meio}
                aria-label={`${parseISO(d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${feriado ? `, ${feriado}` : ""}${d === entrada ? ", entrada" : d === saida ? ", saída" : ""}`}
                title={feriado}
                className={`livro-dia relative grid w-full max-w-12 cursor-pointer place-items-center rounded-md text-[15px] tabular-nums transition-colors duration-150 disabled:cursor-not-allowed disabled:text-verde/25 ${ponta ? "bg-verde text-marfim" : "text-verde hover:bg-verde/10"}`}
              >
                {Number(d.slice(8))}
                {feriado && <span aria-hidden className={`absolute bottom-1 size-1 rounded-full ${ponta ? "bg-dourado-claro" : "bg-dourado-escuro"}`} />}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px] text-verde/80">
        <span>{fase === "saida" ? "Agora toque no dia da saída." : "Toque no dia da chegada."}</span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-dourado-escuro" /> feriado
        </span>
      </p>
    </div>
  );
}

/* ---------- quartos ---------- */

function quartoEmFoco(c: Ctx) {
  const slug = c.foco ?? c.p.acomodacao ?? ACOMODACOES[0].slug;
  return ACOMODACOES.find((a) => a.slug === slug) ?? ACOMODACOES[0];
}

function GaleriaQuarto({ c }: { c: Ctx }) {
  const ac = quartoEmFoco(c);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [ac.slug]);
  const fotos = ac.fotos.slice(0, 6);
  return (
    <>
      <figure className="livro-prancha flex min-h-0 flex-1 flex-col">
        <Foto key={fotos[i]} src={fotos[i]} alt={`${ac.nome}, foto ${i + 1}`} paleta={ac.paleta} className="min-h-[120px] w-full flex-1" />
        <div className="mt-1.5 flex shrink-0 gap-1.5">
          {fotos.map((f, k) => (
            <button key={f} type="button" aria-label={`Ver foto ${k + 1} de ${ac.nome}`} aria-pressed={k === i} onClick={() => setI(k)} className={`w-12 shrink-0 cursor-pointer overflow-hidden rounded-sm transition-opacity duration-200 ${k === i ? "opacity-100 ring-2 ring-dourado" : "opacity-60 hover:opacity-100"}`}>
              <Foto src={f} alt="" paleta={ac.paleta} className="aspect-square w-full" />
            </button>
          ))}
        </div>
      </figure>
      <div className="shrink-0">
        <p className="font-display text-xl text-verde">{ac.nome}</p>
        <p className="text-[13px] text-verde/80">
          {ac.subtitulo} · {ac.unidades} {ac.unidades > 1 ? "quartos" : "quarto"} como este · {ac.comodidades.slice(0, 4).join(", ")}
        </p>
      </div>
    </>
  );
}

function EscolhaQuarto({ c }: { c: Ctx }) {
  const { p, orc } = c;
  const h = totalHospedes(p);
  const pag = pagantes(p);
  return (
    <>
      <Subtitulo>
        {hospedesCurto(p)}, {orc.noites} diária{orc.noites > 1 ? "s" : ""}
      </Subtitulo>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Quartos" onMouseLeave={() => c.setFoco(null)}>
        {ACOMODACOES.map((ac) => {
          const quartos = quartosDoGrupo(ac, h, pag);
          const total = quartos.reduce((s, q) => s + diaria(ac, q.pessoas, q.pagantes), 0) * orc.noites;
          const sel = p.acomodacao === ac.slug;
          const nota = quartos.length > 1 ? `${quartos.length} quartos (${quartos.map((q) => q.pessoas).join("+")} pessoas)` : quartos.some((q) => q.pessoas > 3) && ac.tarifa.tipo === "por-ocupacao" ? "Com cama extra para a 4ª pessoa" : "";
          return (
            <div key={ac.slug} className="relative">
              <button
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => (c.set("acomodacao", ac.slug), c.setFoco(null))}
                onMouseEnter={() => c.setFoco(ac.slug)}
                onFocus={() => c.setFoco(ac.slug)}
                onBlur={() => c.setFoco(null)}
                className={`flex w-full cursor-pointer items-stretch gap-3 rounded-md border-2 bg-[#fbfaf4] p-1.5 text-left lg:p-2 transition-[border-color,box-shadow] duration-200 ${sel ? "border-salvia shadow-[0_12px_30px_-16px_rgba(54,67,57,.5)]" : "border-transparent hover:border-verde/15"}`}
              >
                <Foto src={ac.fotos[0]} alt="" paleta={ac.paleta} className="h-[60px] w-[76px] shrink-0 self-center rounded-sm lg:h-[72px] lg:w-24" />
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display text-[16px] leading-tight text-verde lg:text-[19px]">{ac.nome}</span>
                    <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm border-2 text-[11px] ${sel ? "border-salvia bg-salvia text-marfim" : "border-verde/20"}`}>
                      {sel ? "✓" : ""}
                    </span>
                  </span>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 text-[12px] leading-tight text-verde/80">
                      {nota || `${ac.unidades} unidades · até ${ac.capacidade} pessoas`}
                    </span>
                    <span className="font-display shrink-0 text-[17px] text-verde lg:text-xl">{brl(total)}</span>
                  </span>
                </span>
              </button>
              {/* no celular, as fotos abrem por cima do livro */}
              <button type="button" onClick={() => c.setGaleria(ac.slug)} aria-label={`Ver fotos do ${ac.nome}`} className="absolute bottom-2.5 left-2.5 min-h-8 rounded-sm bg-verde-noite/75 px-2.5 text-[12px] text-marfim backdrop-blur lg:hidden">
                Fotos
              </button>
            </div>
          );
        })}
      </div>
      <p className="hidden shrink-0 text-[12px] text-verde/80 lg:block">Com café da manhã, piscinas aquecidas e estacionamento.</p>
    </>
  );
}

function GaleriaModal({ slug, onFechar }: { slug: string; onFechar: () => void }) {
  const ac = ACOMODACOES.find((a) => a.slug === slug) ?? ACOMODACOES[0];
  const [i, setI] = useState(0);
  const n = ac.fotos.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, onFechar]);
  const botao = "pressionavel grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/30 text-marfim hover:bg-marfim/10";
  return (
    <div data-galeria-quarto role="dialog" aria-modal="true" aria-label={`Fotos do ${ac.nome}`} className="fixed inset-0 z-[90] flex flex-col bg-verde-noite/95 p-4 text-marfim" onClick={onFechar}>
      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-xl">{ac.nome}</p>
        <button type="button" onClick={onFechar} aria-label="Fechar" className={botao}>
          ✕
        </button>
      </div>
      <div className="relative my-4 min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <Foto key={ac.fotos[i]} src={ac.fotos[i]} alt={`${ac.nome}, foto ${i + 1} de ${n}`} paleta={ac.paleta} className="size-full rounded-sm" />
      </div>
      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setI((i - 1 + n) % n)} aria-label="Foto anterior" className={botao}>
          ←
        </button>
        <span className="text-[13px] text-marfim/70">
          {i + 1} de {n}
        </span>
        <button type="button" onClick={() => setI((i + 1) % n)} aria-label="Próxima foto" className={botao}>
          →
        </button>
      </div>
    </div>
  );
}

/* ---------- orçamento e envio ---------- */

function Recibo({ c }: { c: Ctx }) {
  const { p, orc } = c;
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  return (
    <div className="shrink-0 rounded-sm border border-verde/12 bg-[#fbfaf4] p-3.5 shadow-[0_10px_24px_-16px_rgba(27,34,29,.4)] lg:p-5">
      <dl className="space-y-1 text-[14px]">
        {c.duplo ? (
          <>
            <Ficha k="Entrada" v={dataLonga(p.entrada)} />
            <Ficha k="Saída" v={dataLonga(p.saida)} />
          </>
        ) : (
          <Ficha k="Período" v={`${dataCurta(p.entrada)} a ${dataCurta(p.saida)}`} />
        )}
        <Ficha k="Hóspedes" v={c.duplo ? hospedesTexto(p.adultos, p.idades) : hospedesCurto(p)} />
        <Ficha k="Quarto" v={ac ? ac.nome : "a escolher"} />
      </dl>
      <ul className="mt-3 space-y-0.5 border-t border-dashed border-verde/20 pt-2.5 text-[12.5px] leading-snug text-verde/75">
        {orc.linhas.map((l) => (
          <li key={l.rotulo} className="flex justify-between gap-3">
            <span>{l.rotulo}</span>
            <span className="shrink-0 text-verde">{brl(l.valor)}</span>
          </li>
        ))}
        {orc.linhas.length === 0 && <li>Escolha o quarto para ver o valor.</li>}
      </ul>
      <div className="mt-3 flex items-end justify-between border-t border-verde/20 pt-2.5">
        <span className="text-[14px] text-verde/80">Total estimado</span>
        <span className="font-display text-3xl text-verde">{brl(orc.total)}</span>
      </div>
      {orc.total > 0 && (
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-verde/80">Sinal de {HOTEL.sinalPercentual}% para garantir</span>
          <span className="text-verde">{brl(orc.sinal)}</span>
        </div>
      )}
      {c.duplo && <p className="mt-2 text-[12px] text-verde/80">Restaurante e bebidas são pagos à parte, no local.</p>}
    </div>
  );
}

function Envio({ c }: { c: Ctx }) {
  const { p, estado, ticket } = c;
  if ((estado === "enviado" || estado === "falhou") && ticket) {
    const ok = estado === "enviado";
    return (
      <div className="flex h-full min-h-0 flex-col items-center gap-3 text-center">
        {c.duplo && <p className="font-display text-2xl text-verde lg:text-3xl">{ok ? "Orçamento enviado ao hotel" : "Comprovante pronto"}</p>}
        <p className="max-w-sm text-[14px] text-verde/75">
          {ok ? "A equipe já recebeu seus dados e vai falar com você pelo WhatsApp informado. Guarde o comprovante." : "Não conseguimos entregar ao hotel agora. Baixe o comprovante e mande pelo WhatsApp do hotel."}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ticket.previa} alt={`Comprovante do orçamento ${p.codigo}`} className="min-h-0 flex-1 rounded-sm object-contain shadow-[0_14px_30px_-14px_rgba(27,34,29,.5)]" />
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          <button type="button" onClick={() => baixar(ticket.pdf, `orcamento-${p.codigo}.pdf`)} className={botaoPrincipal}>
            Baixar PDF
          </button>
          <button type="button" onClick={() => baixar(ticket.png, `orcamento-${p.codigo}.png`)} className="pressionavel inline-flex h-11 cursor-pointer items-center rounded-md border border-verde/25 px-4 text-[15px] text-verde hover:bg-verde/5">
            Baixar imagem
          </button>
          {!ok && (
            <a href={waLink(`Olá! Fiz o orçamento ${p.codigo} no site e vou enviar o comprovante.`)} target="_blank" rel="noopener" className="pressionavel inline-flex h-11 items-center gap-2 rounded-md bg-[#1f7a46] px-4 text-[15px] text-white hover:bg-[#1a6b3d]">
              <IconeWhatsApp className="size-5" /> WhatsApp
            </a>
          )}
        </div>
        <button type="button" onClick={c.novo} className="shrink-0 cursor-pointer text-[13px] text-verde/80 underline underline-offset-4 hover:text-verde">
          Fazer outro orçamento
        </button>
      </div>
    );
  }
  const enviando = estado === "enviando";
  return (
    <div className="flex h-full flex-col gap-4">
      {c.duplo && <Subtitulo>Enviar ao hotel</Subtitulo>}
      <p className="text-[15px] text-verde/80">
        O hotel recebe seu orçamento na hora, com um comprovante em PDF, e fala com você pelo WhatsApp {p.telefone || "informado"} para confirmar a disponibilidade e o sinal de {HOTEL.sinalPercentual}%.
      </p>
      <label className="flex cursor-pointer items-start gap-3 text-[14px] text-verde/85">
        <input type="checkbox" checked={c.aceite} onChange={(e) => c.setAceite(e.target.checked)} className="mt-1 size-5 shrink-0 cursor-pointer accent-[#364339]" />
        Li as condições e autorizo o uso dos meus dados apenas para o atendimento desta solicitação, conforme a LGPD.
      </label>
      <Erro c={c} />
      <button type="button" onClick={c.enviar} disabled={enviando} className={`${botaoPrincipal} h-12 w-full disabled:cursor-wait disabled:opacity-70`}>
        {enviando ? "Enviando…" : "Enviar orçamento ao hotel"}
      </button>
      <div className="mt-auto flex items-center justify-between border-t border-verde/10 pt-3">
        <button type="button" onClick={c.voltar} className="pressionavel inline-flex h-11 cursor-pointer items-center rounded-md px-3 text-[14px] text-verde/80 hover:bg-verde/5">
          ← Voltar
        </button>
        <span className="text-[13px] text-verde/80">Dúvidas: {HOTEL.whatsappExibicao}</span>
      </div>
    </div>
  );
}
