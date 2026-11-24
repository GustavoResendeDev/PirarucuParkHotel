"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ACOMODACOES, FERIADOS, HOTEL, PESCA } from "@/lib/data";
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
  mensagemWhatsApp,
  pagantes,
  parseISO,
  proximaSexta,
  quartosDoGrupo,
  toISO,
  totalHospedes,
  waLink,
  type Pedido,
} from "@/lib/reserva";
import { Foto } from "../Foto";
import { Logo } from "../Logo";
import { Padrao } from "../Padrao";
import { IconeWhatsApp } from "../WhatsAppFlutuante";

/**
 * Reserva em forma de livro: capa verde com o logo, e cada página dupla é um
 * passo do hóspede (datas, hóspedes, quarto, pesca, dados, orçamento e envio).
 * Inspirado no modelo de livro com páginas viradas (MIT) enviado pelo Gustavo.
 *
 * Como as folhas funcionam: a folha j tem na frente a página da direita do
 * spread j-1 e no verso a página da esquerda do spread j (a folha 0 é a capa).
 * Com `t` folhas viradas, o livro mostra o spread t-1. No celular cada folha é
 * uma página só, e `t` também é o número de folhas viradas.
 */

const DURACAO = 1050;

const ATRASO = 140;

type Capitulo = { id: "datas" | "hospedes" | "quarto" | "pesca" | "dados" | "envio"; n: string; nome: string; titulo: string; resumo: string };
const CAPS: Capitulo[] = [
  { id: "datas", n: "I", nome: "Datas", titulo: "Quando você chega?", resumo: "Marque a chegada e a saída" },
  { id: "hospedes", n: "II", nome: "Hóspedes", titulo: "Quem vem com você?", resumo: "Adultos e crianças" },
  { id: "quarto", n: "III", nome: "Quarto", titulo: "Escolha seu quarto", resumo: "Fotos e valores de cada um" },
  { id: "pesca", n: "IV", nome: "Pesca", titulo: "Vai pescar?", resumo: "Pesca esportiva, opcional" },
  { id: "dados", n: "V", nome: "Seus dados", titulo: "Como falamos com você?", resumo: "Nome e WhatsApp" },
  { id: "envio", n: "VI", nome: "Orçamento", titulo: "Seu orçamento", resumo: "Confira e envie pelo WhatsApp" },
];
/** Spread 0 é o sumário; depois, um por capítulo. */
const SPREADS = CAPS.length + 1;
/** Capa + uma folha por spread. */
const FOLHAS = SPREADS + 1;

type Setter = <K extends keyof Pedido>(k: K, v: Pedido[K]) => void;

function pedidoInicial(): Pedido {
  const s = proximaSexta();
  return {
    entrada: toISO(s),
    saida: toISO(addDias(s, 2)),
    adultos: 2,
    idades: [],
    acomodacao: undefined,
    pescadores: 0,
    diasPesca: 2,
    nome: "",
    telefone: "",
    obs: "",
    codigo: "",
  };
}

const ehCampo = (el: EventTarget | null) => {
  const tag = (el as HTMLElement | null)?.tagName ?? "";
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!(el as HTMLElement | null)?.isContentEditable;
};

export function LivroReserva() {
  const params = useSearchParams();
  const [p, setP] = useState<Pedido>(pedidoInicial);
  const [t, setT] = useState(0);
  const [giro, setGiro] = useState<{ a: number; b: number; dir: 1 | -1 } | null>(null);
  const [alcance, setAlcance] = useState(2);
  const [erro, setErro] = useState("");
  const [aceite, setAceite] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [hoje, setHoje] = useState("");
  const [duplo, setDuplo] = useState(true);
  const [foco, setFoco] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const tRef = useRef(0);
  const palco = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const toque = useRef<{ x: number; y: number; campo: boolean } | null>(null);

  const orc = useMemo(() => calcular(p), [p]);
  const set: Setter = (k, v) => setP((x) => ({ ...x, [k]: v }));

  // livro de duas páginas em telas largas, de uma página no celular
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1000px)");
    const on = () => setDuplo(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  function irPara(novo: number, focar = true) {
    const atual = tRef.current;
    novo = Math.max(0, Math.min(SPREADS, novo));
    if (novo === atual) return;
    tRef.current = novo;
    const a = Math.min(atual, novo);
    const b = Math.max(atual, novo);
    setGiro({ a, b, dir: novo > atual ? 1 : -1 });
    setT(novo);
    setErro("");
    setAviso(novo === 0 ? "Livro fechado" : novo === 1 ? "Sumário" : `Capítulo ${CAPS[novo - 2].n}: ${CAPS[novo - 2].nome}`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setGiro(null);
      if (focar) palco.current?.querySelector<HTMLElement>('[data-ativa="1"] [data-titulo]')?.focus({ preventScroll: true });
    }, DURACAO + ATRASO * (b - a - 1) + 40);
    const r = palco.current?.getBoundingClientRect();
    if (r && (r.top < -60 || r.top > window.innerHeight * 0.5)) window.scrollTo({ top: window.scrollY + r.top - 140, behavior: "smooth" });
  }

  // lê parâmetros vindos da busca rápida ou de uma página de acomodação e abre o livro
  useEffect(() => {
    setHoje(toISO(new Date()));
    let veio = false;
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
    veio = !!(params.get("entrada") || params.get("acomodacao"));
    // espera a abertura do site (Preloader) sair da frente antes de abrir a capa
    let id = 0;
    const tentar = () => {
      id = document.querySelector("[data-preloader]") ? window.setTimeout(tentar, 200) : window.setTimeout(() => irPara(veio ? 2 : 1, false), 900);
    };
    id = window.setTimeout(tentar, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function validar(id: Capitulo["id"]): string {
    if (id === "datas") {
      if (!p.entrada || !p.saida || p.saida <= p.entrada) return "Escolha uma saída depois da entrada.";
      if (hoje && p.entrada < hoje) return "A entrada não pode ser uma data que já passou.";
      if (feriadosNaEstadia(p.entrada, p.saida).length && orc.noites < HOTEL.minimoDiariasFeriado)
        return `Essas datas incluem feriado: escolha pelo menos ${HOTEL.minimoDiariasFeriado} diárias.`;
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
    if (atual >= SPREADS) return;
    if (atual >= 2) {
      const cap = CAPS[atual - 2];
      const e = validar(cap.id);
      if (e) return setErro(e);
      // limita pescadores e dias de pesca ao que a estadia e o grupo permitem
      setP((x) => ({
        ...x,
        pescadores: Math.min(x.pescadores, totalHospedes(x)),
        diasPesca: Math.min(Math.max(1, x.diasPesca), Math.max(1, contarNoites(x.entrada, x.saida))),
      }));
    }
    setAlcance((a) => Math.max(a, atual + 1));
    irPara(atual + 1);
  }
  const voltar = () => irPara(tRef.current - 1);

  function enviar() {
    for (let i = 0; i < CAPS.length - 1; i++) {
      const e = validar(CAPS[i].id);
      if (e) {
        irPara(i + 2);
        setErro(e);
        return;
      }
    }
    if (!aceite) return setErro("Para enviar, marque que leu as condições.");
    const final = { ...p, codigo: p.codigo || gerarCodigo() };
    setP(final);
    window.open(waLink(mensagemWhatsApp(final)), "_blank", "noopener");
    // TODO backend: POST /api/reservations criando a solicitação PENDING (ver PDF, seção 4.3)
    setEnviado(true);
    setErro("");
  }

  function novo() {
    setP(pedidoInicial());
    setAceite(false);
    setEnviado(false);
    setAlcance(2);
    irPara(1);
  }

  async function copiar() {
    const texto = mensagemWhatsApp({ ...p, codigo: p.codigo || "(gerado ao enviar)", nome: p.nome || "-" });
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  // teclado: setas e Page Up/Down folheiam, fora dos campos
  const acoes = useRef({ avancar, voltar });
  acoes.current = { avancar, voltar };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ehCampo(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
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

  const ctx: Ctx = { p, set, orc, hoje, erro, aceite, setAceite, enviado, copiado, copiar, enviar, novo, avancar, voltar, irPara, alcance, t, foco, setFoco, duplo };

  /* ---------- páginas ---------- */
  const esquerda = (s: number): ReactNode =>
    s === 0 ? <Guarda texto /> : <Pagina lado="esq" folio={String(s * 2)} cabeca={HOTEL.nome}><Conteudo cap={CAPS[s - 1]} parte="esq" c={ctx} /></Pagina>;
  const direita = (s: number): ReactNode =>
    s === 0 ? (
      <Pagina lado="dir"><Sumario c={ctx} /></Pagina>
    ) : (
      <Pagina lado="dir" folio={String(s * 2 + 1)} cabeca={`Capítulo ${CAPS[s - 1].n} · ${CAPS[s - 1].nome}`}>
        <Conteudo cap={CAPS[s - 1]} parte="dir" c={ctx} />
      </Pagina>
    );
  const unica = (s: number): ReactNode =>
    s === 0 ? (
      <Pagina lado="unica"><Sumario c={ctx} /></Pagina>
    ) : (
      <Pagina lado="unica" folio={`${s} / ${CAPS.length}`}>
        <Conteudo cap={CAPS[s - 1]} parte="unica" c={ctx} />
      </Pagina>
    );

  const folhas = Array.from({ length: FOLHAS }, (_, j) => {
    const frente = j === 0 ? <Capa onAbrir={() => irPara(1)} /> : duplo ? direita(j - 1) : unica(j - 1);
    const verso = duplo ? (j < SPREADS ? esquerda(j) : <Guarda />) : <div className="livro-papel livro-unica" />;
    const virada = j < t;
    const girando = !!giro && j >= giro.a && j < giro.b;
    const visivel = girando || (duplo ? j >= t - 2 && j <= t + 1 : j === t || j === t + 1);
    const z = girando ? 900 + (giro!.dir > 0 ? j : FOLHAS - j) : virada ? 100 + j : 600 - j;
    const atraso = girando ? (giro!.dir > 0 ? j - giro!.a : giro!.b - 1 - j) * ATRASO : 0;
    const frenteAtiva = !giro && j === t;
    const versoAtivo = !giro && duplo && j === t - 1;
    return (
      <div
        key={j}
        className="livro-folha"
        data-virada={virada ? "1" : "0"}
        data-girando={girando ? "1" : "0"}
        style={{ zIndex: z, visibility: visivel ? "visible" : "hidden", transitionDelay: `${atraso}ms` }}
      >
        <div className="livro-face" data-ativa={frenteAtiva ? "1" : "0"} inert={!frenteAtiva} style={{ visibility: !virada || girando ? undefined : "hidden" }}>
          {frente}
        </div>
        <div className="livro-face livro-verso" data-ativa={versoAtivo ? "1" : "0"} inert={!versoAtivo} style={{ visibility: virada || girando ? undefined : "hidden" }}>
          {verso}
        </div>
      </div>
    );
  });

  return (
    <section className="livro-mesa relative overflow-hidden pt-24 pb-14 md:pt-28" aria-labelledby="livro-titulo">
      <h1 id="livro-titulo" className="sr-only">Livro de reservas do {HOTEL.nome}</h1>
      <p aria-live="polite" className="sr-only">{aviso}</p>

      {/* marcadores dos capítulos */}
      <nav aria-label="Capítulos do livro" className="mx-auto mb-5 flex max-w-5xl gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:justify-center">
        {[{ n: "", nome: "Sumário" }, ...CAPS].map((c, i) => {
          const alvo = i + 1;
          const atual = t === alvo;
          return (
            <button
              key={c.nome}
              type="button"
              disabled={alvo > alcance}
              aria-current={atual ? "page" : undefined}
              onClick={() => irPara(alvo)}
              className={`group relative flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
                atual ? "bg-verde text-marfim" : "text-verde hover:bg-verde/8"
              }`}
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
      </div>

      {/* folhear */}
      <div className="mx-auto mt-6 flex max-w-xl items-center justify-between gap-4 px-5">
        <BotaoSeta dir={-1} rotulo="Página anterior" disabled={t === 0} onClick={voltar} />
        <p className="text-center text-[13px] text-verde/70">
          {t === 0 ? "Livro fechado" : t === 1 ? "Sumário" : `Capítulo ${CAPS[t - 2].n} de ${CAPS[CAPS.length - 1].n}`}
          <span className="hidden text-verde/45 md:inline"> · folheie com as setas do teclado</span>
          <span className="text-verde/45 md:hidden"> · deslize para folhear</span>
        </p>
        <BotaoSeta dir={1} rotulo={t === 0 ? "Abrir o livro" : "Próxima página"} disabled={t >= SPREADS} onClick={avancar} />
      </div>
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
  enviado: boolean;
  copiado: boolean;
  copiar: () => void;
  enviar: () => void;
  novo: () => void;
  avancar: () => void;
  voltar: () => void;
  irPara: (t: number) => void;
  alcance: number;
  t: number;
  foco: string | null;
  setFoco: (s: string | null) => void;
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
      className="pressionavel grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border border-verde/25 text-verde hover:border-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
        <path d={dir > 0 ? "M5 12h14M13 6l6 6-6 6" : "M19 12H5M11 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}

function Pagina({ lado, folio, cabeca, children }: { lado: "esq" | "dir" | "unica"; folio?: string; cabeca?: string; children: ReactNode }) {
  return (
    <div className={`livro-papel livro-${lado}`}>
      {cabeca && <span className="livro-cabeca">{cabeca}</span>}
      <div className="livro-rolagem">{children}</div>
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
        <p className="font-display mt-10 text-lg text-dourado-claro/85">
          {HOTEL.cidade} · Goiás
        </p>
        <button
          type="button"
          onClick={onAbrir}
          className="pressionavel mt-10 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-dourado/60 px-7 text-[13px] tracking-[0.16em] text-dourado-claro uppercase hover:bg-dourado/10"
        >
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

function Sumario({ c }: { c: Ctx }) {
  return (
    <div className="flex min-h-full flex-col">
      <Logo cor="verde" className="w-20" />
      <h2 data-titulo tabIndex={-1} className="titulo-marca mt-6 text-[clamp(1.9rem,3.2vw,2.6rem)] text-salvia outline-none">
        Livro de reservas
      </h2>
      <p className="mt-4 max-w-sm text-[15px] text-verde/75">
        Seis páginas, sem cadastro. Em cada uma, um passo. No final, sua solicitação vai pronta para o WhatsApp do hotel.
      </p>
      <p className="mt-6 text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase">Sumário</p>
      <ol className="mt-2">
        {CAPS.map((cap, i) => {
          const alvo = i + 2;
          const livre = alvo <= c.alcance;
          return (
            <li key={cap.id}>
              <button
                type="button"
                disabled={!livre}
                onClick={() => c.irPara(alvo)}
                className="group flex w-full cursor-pointer items-baseline gap-3 rounded-lg py-1.5 text-left disabled:cursor-default"
              >
                <span className="font-display w-7 shrink-0 text-dourado-escuro">{cap.n}</span>
                <span className="min-w-0">
                  <span className={`block text-[16px] ${livre ? "text-verde group-hover:underline group-hover:decoration-dourado group-hover:underline-offset-4" : "text-verde/55"}`}>{cap.nome}</span>
                  <span className="block text-[13px] text-verde/55">{cap.resumo}</span>
                </span>
                <span className="livro-leader" aria-hidden />
                <span className="font-display text-[14px] text-verde/60">{(i + 1) * 2}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="livro-rodape mt-auto pt-6">
        <button type="button" onClick={c.avancar} className="pressionavel inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-verde px-7 text-[15px] text-marfim hover:bg-verde-claro">
          Começar pelas datas <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- capítulos ---------- */

function Conteudo({ cap, parte, c }: { cap: Capitulo; parte: "esq" | "dir" | "unica"; c: Ctx }) {
  const cabeca = (
    <header>
      <p className="text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase">Capítulo {cap.n}</p>
      <h2 data-titulo={parte !== "dir" ? "" : undefined} tabIndex={-1} className="font-display mt-2 text-[clamp(1.9rem,3vw,2.5rem)] leading-[1.08] text-verde outline-none">
        {cap.titulo}
      </h2>
    </header>
  );
  const partes = PARTES[cap.id](c);
  const rodape = cap.id === "envio" ? null : <Rodape c={c} />;
  if (parte === "esq")
    return (
      <div className="space-y-6">
        {cabeca}
        {partes.esq}
      </div>
    );
  if (parte === "dir")
    return (
      <div className="flex min-h-full flex-col">
        <div data-titulo tabIndex={-1} className="flex-1 space-y-5 outline-none">{partes.dir}</div>
        {rodape}
      </div>
    );
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-6">
        {cabeca}
        {partes.esqPrimeiro ? partes.esq : partes.dir}
        {partes.esqPrimeiro ? partes.dir : partes.esqCelular ?? partes.esq}
      </div>
      {rodape}
    </div>
  );
}

type Partes = { esq: ReactNode; dir: ReactNode; esqPrimeiro?: boolean; esqCelular?: ReactNode };

const PARTES: Record<Capitulo["id"], (c: Ctx) => Partes> = {
  datas: (c) => {
    const { p, orc } = c;
    const feriados = orc.noites > 0 ? feriadosNaEstadia(p.entrada, p.saida) : [];
    const ficha = (
      <dl className="space-y-2 text-[15px]">
        <Ficha k="Entrada" v={`${dataLonga(p.entrada)}, a partir das ${HOTEL.checkin}`} />
        <Ficha k="Saída" v={`${dataLonga(p.saida)}, até as ${HOTEL.checkout}`} />
        <Ficha k="Diárias" v={orc.noites > 0 ? String(orc.noites) : "-"} />
      </dl>
    );
    const aviso = feriados.length > 0 && (
      <p className="rounded-xl bg-dourado/15 px-4 py-3 text-[14px] text-verde/85">
        Sua estadia inclui {feriados.join(", ")}. Em feriados e alta temporada, o mínimo é de {HOTEL.minimoDiariasFeriado} diárias.
      </p>
    );
    return {
      esq: (
        <>
          <p className="text-[15px] text-verde/75">Marque no calendário o dia da chegada e o da saída. Entrar mais cedo ou sair mais tarde não tem custo, se houver vaga.</p>
          <Prancha src="/fotos/fachada-lago.webp" alt="Fachada do hotel vista do lago" legenda="Todos os quartos têm vista para o lago." />
          {ficha}
          {aviso}
        </>
      ),
      esqCelular: (
        <>
          {ficha}
          {aviso}
        </>
      ),
      dir: (
        <>
          <Subtitulo>Marque no calendário</Subtitulo>
          <Calendario
            entrada={p.entrada}
            saida={p.saida}
            hoje={c.hoje}
            onChange={(e, s) => {
              c.set("entrada", e);
              c.set("saida", s);
            }}
          />
        </>
      ),
    };
  },

  hospedes: (c) => {
    const { p, set } = c;
    const h = totalHospedes(p);
    const pag = pagantes(p);
    return {
      esq: (
        <>
          <ul className="space-y-3 text-[15px] text-verde/80">
            <Item>Crianças até {HOTEL.idadeCriancaGratis} anos não pagam.</Item>
            <Item>Cada quarto recebe até 4 pessoas. No Executivo, a 4ª pessoa dorme em cama extra, por {brl(100)} a diária.</Item>
            <Item>Grupos maiores ficam em mais de um quarto, e o orçamento já faz a divisão.</Item>
            <Item>Não aceitamos animais de estimação.</Item>
          </ul>
          <Prancha src="/fotos/cafe-000.webp" alt="Mesa do café da manhã do hotel" legenda={`Café da manhã incluso, das ${HOTEL.cafe}.`} />
        </>
      ),
      esqCelular: (
        <ul className="space-y-3 text-[15px] text-verde/80">
          <Item>Crianças até {HOTEL.idadeCriancaGratis} anos não pagam.</Item>
          <Item>Até 4 pessoas por quarto. Grupos maiores ficam em mais de um quarto.</Item>
        </ul>
      ),
      dir: (
        <>
          <Subtitulo>Hóspedes</Subtitulo>
          <Contador rotulo="Adultos" valor={p.adultos} min={1} max={12} onChange={(v) => set("adultos", v)} />
          <Contador
            rotulo="Crianças"
            sub={`Até ${HOTEL.idadeCriancaGratis} anos não pagam`}
            valor={p.idades.length}
            min={0}
            max={8}
            onChange={(v) => set("idades", v > p.idades.length ? [...p.idades, -1] : p.idades.slice(0, v))}
          />
          {p.idades.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {p.idades.map((idade, i) => (
                <label key={i} className="block">
                  <span className={rotuloCampo}>Idade da criança {i + 1}</span>
                  <select value={idade} onChange={(e) => set("idades", p.idades.map((x, k) => (k === i ? Number(e.target.value) : x)))} className={`${campoBase} cursor-pointer`}>
                    <option value={-1} disabled>
                      Escolha a idade
                    </option>
                    {Array.from({ length: 18 }, (_, n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "Menos de 1 ano" : `${n} ano${n > 1 ? "s" : ""}`}
                        {criancaGratis(n) ? " (não paga)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          <p className="text-[14px] text-verde/70">
            {h} pessoa{h > 1 ? "s" : ""} no total{h !== pag ? `, ${pag} pagante${pag > 1 ? "s" : ""}` : ""}.
          </p>
        </>
      ),
    };
  },

  quarto: (c) => ({ esqPrimeiro: true, esq: <GaleriaQuarto c={c} />, dir: <EscolhaQuarto c={c} /> }),

  pesca: (c) => {
    const { p, set, orc } = c;
    const h = totalHospedes(p);
    const dias = Math.min(p.diasPesca, Math.max(1, orc.noites));
    const regras = (
      <ul className="space-y-3 text-[15px] text-verde/80">
        <Item>{brl(PESCA.preco)} por pessoa, por diária, com direito a pescar 24 horas.</Item>
        <Item>Pesque e solte: todo peixe volta para o lago. Exclusiva para hóspedes.</Item>
        <Item>O hotel não aluga equipamento. Traga o seu.</Item>
      </ul>
    );
    return {
      esq: (
        <>
          {regras}
          <Prancha src="/fotos/peixe-janela.webp" alt="Escultura do pirarucu em metal dourado na parede de pedra" legenda="O pirarucu, símbolo do hotel e estrela do lago." />
          <Link href="/pesca" className="inline-block text-[14px] text-salvia-escura underline decoration-dourado underline-offset-4 hover:text-verde">
            Ver iscas permitidas e regras da pesca
          </Link>
        </>
      ),
      esqCelular: regras,
      dir: (
        <>
          <Subtitulo>Pesca esportiva</Subtitulo>
          <p className="text-[15px] text-verde/70">É opcional. Se ninguém vai pescar, é só virar a página.</p>
          <Contador rotulo="Pessoas que vão pescar" valor={p.pescadores} min={0} max={h} onChange={(v) => set("pescadores", v)} />
          {p.pescadores > 0 && (
            <>
              <Contador
                rotulo="Diárias de pesca"
                sub={`Sua estadia tem ${orc.noites} diária${orc.noites > 1 ? "s" : ""}`}
                valor={dias}
                min={1}
                max={Math.max(1, orc.noites)}
                onChange={(v) => set("diasPesca", v)}
              />
              <p className="text-[15px] text-verde">
                Pesca: {p.pescadores} × {dias} × {brl(PESCA.preco)} = <strong className="font-medium">{brl(p.pescadores * dias * PESCA.preco)}</strong>
              </p>
            </>
          )}
        </>
      ),
    };
  },

  dados: (c) => {
    const { p, set } = c;
    const como = (
      <div className="rounded-2xl bg-areia/70 p-5 text-[14px] text-verde/85">
        <p className="text-verde">Como funciona</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Você envia a solicitação e a equipe confirma a disponibilidade pelo WhatsApp.</li>
          <li>A reserva fica garantida com o sinal de {HOTEL.sinalPercentual}%, por PIX, transferência ou cartão. O restante é pago no hotel.</li>
          <li>Mudança de data sem custo. Se cancelar, o valor pago vira crédito para usar em até 3 meses, exceto em feriados.</li>
          <li>Não é permitida a entrada de bebidas externas; para champanhe ou vinho, peça autorização à gerência.</li>
        </ul>
      </div>
    );
    return {
      esq: (
        <>
          {como}
          <Prancha src="/fotos/recepcao.webp" alt="Recepção do hotel" legenda="Recepção aberta 24 horas." />
        </>
      ),
      esqCelular: como,
      dir: (
        <>
          <Subtitulo>Seus dados</Subtitulo>
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
            <textarea rows={3} value={p.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Horário de chegada, ocasião especial, bebida que quer trazer…" className={campoBase} />
          </label>
        </>
      ),
    };
  },

  envio: (c) => ({ esqPrimeiro: true, esq: <Recibo c={c} />, dir: <Envio c={c} /> }),
};

/* ---------- peças ---------- */

const rotuloCampo = "text-[14px] text-salvia-escura";
const campoBase =
  "mt-1.5 w-full rounded-xl border border-verde/15 bg-[#fbfaf4] px-4 py-3 text-verde outline-none transition-colors duration-200 focus:border-salvia focus-visible:ring-2 focus-visible:ring-dourado";

const dataLonga = (s: string) => parseISO(s).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="text-[11px] font-medium tracking-[0.28em] text-dourado-escuro uppercase">{children}</h3>;
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
      <dt className="text-verde/60">{k}</dt>
      <span className="livro-leader" aria-hidden />
      <dd className="text-right text-verde">{v}</dd>
    </div>
  );
}

function Prancha({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  return (
    <figure className="livro-prancha">
      <Foto src={src} alt={alt} className="aspect-[16/10] w-full" />
      <figcaption className="font-display px-1 pt-2 text-[13px] text-verde/65 italic">{legenda}</figcaption>
    </figure>
  );
}

function Contador({ rotulo, sub, valor, min, max, onChange }: { rotulo: string; sub?: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  const botao = "pressionavel grid size-11 cursor-pointer place-items-center rounded-full border border-verde/20 text-lg text-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-verde/10 bg-[#fbfaf4] px-4 py-3">
      <div>
        <p className="text-verde">{rotulo}</p>
        {sub && <p className="text-[13px] text-verde/65">{sub}</p>}
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

function Rodape({ c }: { c: Ctx }) {
  return (
    <div className="livro-rodape pt-6">
      {c.erro && (
        <p role="alert" className="mb-4 rounded-xl border border-dourado-escuro/30 bg-dourado/15 px-4 py-3 text-[14px] text-verde">
          {c.erro}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={c.voltar} className="pressionavel inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-[14px] text-verde/80 hover:bg-verde/5">
          ← Voltar
        </button>
        <button type="button" onClick={c.avancar} className="pressionavel inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-verde px-6 text-[15px] text-marfim hover:bg-verde-claro">
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
  // acompanha a entrada quando ela muda fora do calendário (ex.: link da busca rápida)
  useEffect(() => {
    const d = parseISO(entrada);
    setMes((m) => (m.getFullYear() === d.getFullYear() && m.getMonth() === d.getMonth() ? m : new Date(d.getFullYear(), d.getMonth(), 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrada.slice(0, 7)]);

  const inicio = mes.getDay();
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celulas: (string | null)[] = [...Array(inicio).fill(null), ...Array.from({ length: total }, (_, i) => toISO(new Date(mes.getFullYear(), mes.getMonth(), i + 1)))];
  const mesHoje = hoje ? hoje.slice(0, 7) : "";
  const podeVoltar = !mesHoje || toISO(mes).slice(0, 7) > mesHoje;
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Mês anterior" disabled={!podeVoltar} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className="pressionavel grid size-10 cursor-pointer place-items-center rounded-full text-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-25">
          ‹
        </button>
        <p className="font-display text-xl text-verde first-letter:uppercase" aria-live="polite">
          {nomeMes}
        </p>
        <button type="button" aria-label="Próximo mês" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className="pressionavel grid size-10 cursor-pointer place-items-center rounded-full text-verde hover:bg-verde/5">
          ›
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[11px] tracking-[0.18em] text-verde/50" aria-hidden>
        {SEMANA.map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label={`Dias de ${nomeMes}`}>
        {celulas.map((d, i) => {
          if (!d) return <span key={`v${i}`} />;
          const passado = !!hoje && d < hoje;
          const ponta = d === entrada || d === saida;
          const meio = d > entrada && d < saida;
          const feriado = FERIADOS[d];
          const dia = Number(d.slice(8));
          return (
            <div key={d} className={`relative flex justify-center ${meio ? "bg-salvia/15" : ""} ${d === entrada && saida > entrada ? "bg-gradient-to-r from-transparent from-50% to-salvia/15 to-50%" : ""} ${d === saida ? "bg-gradient-to-r from-salvia/15 from-50% to-transparent to-50%" : ""}`}>
              <button
                type="button"
                disabled={passado}
                onClick={() => escolher(d)}
                aria-pressed={ponta || meio}
                aria-label={`${parseISO(d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${feriado ? `, ${feriado}` : ""}${d === entrada ? ", entrada" : d === saida ? ", saída" : ""}`}
                title={feriado}
                className={`relative grid aspect-square w-full max-w-11 cursor-pointer place-items-center rounded-full text-[15px] tabular-nums transition-colors duration-150 disabled:cursor-not-allowed disabled:text-verde/25 ${
                  ponta ? "bg-verde text-marfim" : "text-verde hover:bg-verde/10"
                }`}
              >
                {dia}
                {feriado && <span aria-hidden className={`absolute bottom-1 size-1 rounded-full ${ponta ? "bg-dourado-claro" : "bg-dourado-escuro"}`} />}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px] text-verde/65">
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
    <div className="space-y-4">
      <figure className="livro-prancha">
        <div className="relative">
          <Foto key={fotos[i]} src={fotos[i]} alt={`${ac.nome}, foto ${i + 1}`} paleta={ac.paleta} className="aspect-[16/10] w-full" />
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {fotos.map((f, k) => (
            <button
              key={f}
              type="button"
              aria-label={`Ver foto ${k + 1} de ${ac.nome}`}
              aria-pressed={k === i}
              onClick={() => setI(k)}
              className={`w-14 shrink-0 cursor-pointer overflow-hidden rounded-sm transition-opacity duration-200 ${k === i ? "opacity-100 ring-2 ring-dourado" : "opacity-60 hover:opacity-100"}`}
            >
              <Foto src={f} alt="" paleta={ac.paleta} className="aspect-square w-full" />
            </button>
          ))}
        </div>
      </figure>
      <div>
        <p className="font-display text-2xl text-verde">{ac.nome}</p>
        <p className="text-[14px] text-verde/65">
          {ac.subtitulo} · {ac.unidades} {ac.unidades > 1 ? "quartos" : "quarto"} como este no hotel
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {ac.comodidades.map((x) => (
            <li key={x} className="rounded-full border border-verde/12 px-2.5 py-0.5 text-[12px] text-verde/80">
              {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EscolhaQuarto({ c }: { c: Ctx }) {
  const { p, orc } = c;
  const h = totalHospedes(p);
  const pag = pagantes(p);
  return (
    <>
      <Subtitulo>
        Valores para {hospedesTexto(p.adultos, p.idades)}, {orc.noites} diária{orc.noites > 1 ? "s" : ""}
      </Subtitulo>
      <div className="space-y-3" role="radiogroup" aria-label="Quartos" onMouseLeave={() => c.setFoco(null)}>
        {ACOMODACOES.map((ac) => {
          const quartos = quartosDoGrupo(ac, h, pag);
          const total = quartos.reduce((s, q) => s + diaria(ac, q.pessoas, q.pagantes), 0) * orc.noites;
          const sel = p.acomodacao === ac.slug;
          return (
            <button
              key={ac.slug}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => {
                c.set("acomodacao", ac.slug);
                c.setFoco(null);
              }}
              onMouseEnter={() => c.setFoco(ac.slug)}
              onFocus={() => c.setFoco(ac.slug)}
              onBlur={() => c.setFoco(null)}
              className={`flex w-full cursor-pointer items-stretch gap-3 rounded-2xl border-2 bg-[#fbfaf4] p-2.5 text-left transition-[border-color,box-shadow] duration-200 ${
                sel ? "border-salvia shadow-[0_12px_30px_-16px_rgba(54,67,57,.5)]" : "border-transparent hover:border-verde/15"
              }`}
            >
              <Foto src={ac.fotos[0]} alt="" paleta={ac.paleta} className="w-20 shrink-0 rounded-xl sm:w-24" />
              <span className="min-w-0 flex-1 py-1">
                <span className="font-display block text-[19px] leading-tight text-verde">{ac.nome}</span>
                <span className="mt-0.5 block text-[12px] text-verde/60">
                  {ac.unidades} unidades · até {ac.capacidade} pessoas
                </span>
                {quartos.length > 1 && <span className="mt-1 block text-[12px] text-dourado-escuro">{quartos.length} quartos ({quartos.map((q) => q.pessoas).join(" + ")})</span>}
                {quartos.some((q) => q.pessoas > 3) && ac.tarifa.tipo === "por-ocupacao" && <span className="mt-1 block text-[12px] text-dourado-escuro">Com cama extra para a 4ª pessoa</span>}
              </span>
              <span className="flex shrink-0 flex-col items-end justify-between py-1">
                <span aria-hidden className={`grid size-6 place-items-center rounded-full border-2 text-[12px] ${sel ? "border-salvia bg-salvia text-marfim" : "border-verde/20"}`}>{sel ? "✓" : ""}</span>
                <span className="text-right">
                  <span className="font-display block text-xl text-verde">{brl(total)}</span>
                  <span className="block text-[11px] text-verde/55">hospedagem</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-verde/60">Com café da manhã, piscinas aquecidas e estacionamento.</p>
    </>
  );
}

/* ---------- orçamento e envio ---------- */

function Recibo({ c }: { c: Ctx }) {
  const { p, orc } = c;
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  return (
    <div className="rounded-sm border border-verde/12 bg-[#fbfaf4] p-5 shadow-[0_10px_24px_-16px_rgba(27,34,29,.4)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-verde/20 pb-3">
        <span className="text-[11px] tracking-[0.24em] text-dourado-escuro uppercase">Orçamento</span>
        <span className="text-[12px] tracking-wider text-verde/55">{p.codigo || "nº gerado ao enviar"}</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-[14px]">
        <Ficha k="Entrada" v={dataLonga(p.entrada)} />
        <Ficha k="Saída" v={dataLonga(p.saida)} />
        <Ficha k="Hóspedes" v={hospedesTexto(p.adultos, p.idades)} />
        <Ficha k="Quarto" v={ac ? ac.nome : "a escolher"} />
      </dl>
      <ul className="mt-4 space-y-1.5 border-t border-dashed border-verde/20 pt-3 text-[13px] text-verde/75">
        {orc.linhas.map((l) => (
          <li key={l.rotulo} className="flex justify-between gap-3">
            <span>{l.rotulo}</span>
            <span className="shrink-0 text-verde">{brl(l.valor)}</span>
          </li>
        ))}
        {orc.linhas.length === 0 && <li>Escolha o quarto para ver o valor.</li>}
      </ul>
      <div className="mt-4 flex items-end justify-between border-t border-verde/20 pt-3">
        <span className="text-[14px] text-verde/70">Total estimado</span>
        <span className="font-display text-3xl text-verde">{brl(orc.total)}</span>
      </div>
      {orc.total > 0 && (
        <div className="mt-1 flex items-baseline justify-between text-[14px]">
          <span className="text-verde/70">Sinal de {HOTEL.sinalPercentual}% para garantir</span>
          <span className="text-verde">{brl(orc.sinal)}</span>
        </div>
      )}
      <p className="mt-3 text-[12px] text-verde/55">Restaurante e bebidas são pagos à parte, no local.</p>
      <button type="button" onClick={c.copiar} className="pressionavel mt-4 h-10 w-full cursor-pointer rounded-full border border-verde/20 text-[14px] text-verde hover:bg-verde/5">
        {c.copiado ? "Orçamento copiado" : "Copiar orçamento"}
      </button>
    </div>
  );
}

function Envio({ c }: { c: Ctx }) {
  const { p } = c;
  if (c.enviado) {
    const msg = mensagemWhatsApp(p);
    return (
      <div className="flex min-h-full flex-col items-center justify-center py-4 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-verde text-dourado-claro">
          <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <p className="font-display mt-6 text-4xl text-verde">Solicitação pronta</p>
        <p className="mt-3 max-w-sm text-[15px] text-verde/75">Abrimos o WhatsApp do hotel com a mensagem preenchida. Se ele não abriu, use o botão abaixo.</p>
        <p className="mt-5 rounded-lg border border-dashed border-salvia px-5 py-2 text-xl tracking-widest text-verde">{p.codigo}</p>
        <p className="mt-2 text-[13px] text-verde/65">Aguardando a confirmação da equipe.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={waLink(msg)} target="_blank" rel="noopener" className="pressionavel inline-flex h-12 items-center gap-2 rounded-full bg-[#1f7a46] px-6 text-[15px] font-medium text-white hover:bg-[#1a6b3d]">
            <IconeWhatsApp className="size-5" /> Abrir WhatsApp
          </a>
          <button type="button" onClick={c.novo} className="pressionavel h-12 cursor-pointer rounded-full border border-verde/20 px-6 text-[15px] text-verde hover:bg-verde/5">
            Fazer outro orçamento
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-full flex-col gap-5">
      <Subtitulo>Enviar solicitação</Subtitulo>
      <p className="text-[15px] text-verde/80">
        Abrimos o WhatsApp do hotel com tudo preenchido. A equipe confirma a disponibilidade e passa os dados para o sinal de {HOTEL.sinalPercentual}%.
      </p>
      <label className="flex cursor-pointer items-start gap-3 text-[14px] text-verde/85">
        <input type="checkbox" checked={c.aceite} onChange={(e) => c.setAceite(e.target.checked)} className="mt-1 size-5 shrink-0 cursor-pointer accent-[#364339]" />
        Li as condições e autorizo o uso dos meus dados apenas para o atendimento desta solicitação, conforme a LGPD.
      </label>
      {c.erro && (
        <p role="alert" className="rounded-xl border border-dourado-escuro/30 bg-dourado/15 px-4 py-3 text-[14px] text-verde">
          {c.erro}
        </p>
      )}
      <button type="button" onClick={c.enviar} className="pressionavel inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#1f7a46] px-6 text-[15px] font-medium text-white hover:bg-[#1a6b3d]">
        <IconeWhatsApp className="size-5" /> Enviar pelo WhatsApp
      </button>
      <p className="text-center text-[13px] text-verde/60">Atendimento: {HOTEL.whatsappExibicao}</p>
      <div className="mt-auto flex items-center justify-between border-t border-verde/10 pt-5">
        <button type="button" onClick={c.voltar} className="pressionavel inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-[14px] text-verde/80 hover:bg-verde/5">
          ← Voltar
        </button>
        <Logo cor="verde" somentePeixe className="w-14 opacity-60" />
      </div>
    </div>
  );
}
