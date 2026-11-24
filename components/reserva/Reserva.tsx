"use client";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ACOMODACOES, HOTEL, PESCA } from "@/lib/data";
import {
  addDias,
  brl,
  calcular,
  contarNoites,
  diaria,
  distribuir,
  fmtDataCurta,
  gerarCodigo,
  hospedesTexto,
  mensagemWhatsApp,
  parseISO,
  proximaSexta,
  toISO,
  totalHospedes,
  waLink,
  type Pedido,
} from "@/lib/reserva";
import { Foto } from "../Foto";
import { IconeWhatsApp } from "../WhatsAppFlutuante";
import { TituloMarca } from "../TituloMarca";

const EASE = [0.22, 1, 0.36, 1] as const;

type Etapa = "estadia" | "opcoes" | "dados";
const ETAPAS: Etapa[] = ["estadia", "opcoes", "dados"];
const NOMES: Record<Etapa, string> = { estadia: "Datas", opcoes: "Acomodação", dados: "Seus dados" };

type Setter = <K extends keyof Pedido>(k: K, v: Pedido[K]) => void;

function pedidoInicial(): Pedido {
  const s = proximaSexta();
  return {
    entrada: toISO(s),
    saida: toISO(addDias(s, 2)),
    adultos: 2,
    criancas: 0,
    acomodacao: undefined,
    pescadores: 0,
    diasPesca: 2,
    nome: "",
    telefone: "",
    obs: "",
    codigo: "",
  };
}

export function Reserva() {
  const params = useSearchParams();
  const [p, setP] = useState<Pedido>(pedidoInicial);
  const [etapa, setEtapa] = useState<Etapa>("estadia");
  const [dir, setDir] = useState(1);
  const [erro, setErro] = useState("");
  const [aceite, setAceite] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [hoje, setHoje] = useState("");

  // lê parâmetros vindos da busca rápida ou de uma página de acomodação
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
  }, [params]);

  const idx = ETAPAS.indexOf(etapa);
  const orc = useMemo(() => calcular(p), [p]);
  const noites = orc.noites;
  const set: Setter = (k, v) => setP((x) => ({ ...x, [k]: v }));

  function ir(prox: Etapa) {
    setErro("");
    setDir(ETAPAS.indexOf(prox) >= idx ? 1 : -1);
    setEtapa(prox);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function avancar() {
    if (etapa === "estadia") {
      if (!p.entrada || !p.saida || p.saida <= p.entrada) return setErro("Escolha uma saída depois da entrada.");
      if (hoje && p.entrada < hoje) return setErro("A entrada não pode ser uma data que já passou.");
      // limita pescadores e dias de pesca ao que a nova estadia permite
      setP((x) => ({
        ...x,
        pescadores: Math.min(x.pescadores, totalHospedes(x)),
        diasPesca: Math.min(Math.max(1, x.diasPesca), Math.max(1, noites)),
      }));
    }
    if (etapa === "opcoes" && !p.acomodacao) return setErro("Escolha uma acomodação para continuar.");
    ir(ETAPAS[idx + 1]);
  }

  function enviar() {
    if (p.nome.trim().length < 3) return setErro("Informe seu nome.");
    if (p.telefone.replace(/\D/g, "").length < 10) return setErro("Informe um WhatsApp com DDD.");
    if (!aceite) return setErro("Para enviar, marque que leu as condições.");
    const final = { ...p, codigo: p.codigo || gerarCodigo() };
    setP(final);
    window.open(waLink(mensagemWhatsApp(final)), "_blank", "noopener");
    // TODO backend: POST /api/reservations criando a solicitação PENDING (ver PDF, seção 4.3)
    setEnviado(true);
    window.scrollTo({ top: 0 });
  }

  if (enviado)
    return (
      <Enviado
        p={p}
        onNovo={() => {
          setP(pedidoInicial());
          setAceite(false);
          setEnviado(false);
          setEtapa("estadia");
        }}
      />
    );

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-28 md:px-8 md:pt-40">
      <TituloMarca as="h1" texto="ORÇAMENTO" letra={3} className="text-[clamp(2.4rem,6vw,4.6rem)] text-salvia" />
      <p className="mt-6 max-w-xl text-verde/80">Três passos, sem cadastro. No final, a solicitação vai pronta para o WhatsApp do hotel.</p>

      {/* etapas: são uma sequência real, por isso numeradas */}
      <ol className="mt-10 mb-10 flex gap-2 overflow-x-auto pb-1" aria-label="Etapas">
        {ETAPAS.map((e, i) => (
          <li key={e} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={i > idx}
              aria-current={i === idx ? "step" : undefined}
              onClick={() => i < idx && ir(e)}
              className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] transition-colors duration-200 ${
                i === idx ? "bg-verde text-marfim" : i < idx ? "cursor-pointer bg-verde/10 text-verde hover:bg-verde/15" : "bg-verde/5 text-verde/45"
              }`}
            >
              <span className={`grid size-6 place-items-center rounded-full text-xs ${i === idx ? "bg-dourado text-verde-noite" : "bg-areia"}`}>{i < idx ? "✓" : i + 1}</span>
              {NOMES[e]}
            </button>
            {i < ETAPAS.length - 1 && <span aria-hidden className="h-px w-6 bg-verde/15" />}
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-[420px] min-w-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={etapa}
              custom={dir}
              initial={{ opacity: 0, x: dir * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -32 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {etapa === "estadia" && <EtapaEstadia p={p} set={set} hoje={hoje} noites={noites} />}
              {etapa === "opcoes" && <EtapaOpcoes p={p} set={set} noites={noites} />}
              {etapa === "dados" && <EtapaDados p={p} set={set} aceite={aceite} setAceite={setAceite} />}
            </motion.div>
          </AnimatePresence>

          {erro && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-6 rounded-2xl border border-dourado-escuro/30 bg-dourado/15 px-5 py-3 text-[15px] text-verde">
              {erro}
            </motion.p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            {idx > 0 ? (
              <button type="button" onClick={() => ir(ETAPAS[idx - 1])} className="pressionavel inline-flex h-12 cursor-pointer items-center rounded-full px-6 text-[15px] text-verde hover:bg-verde/5">
                Voltar
              </button>
            ) : (
              <span />
            )}
            {etapa === "dados" ? (
              <button type="button" onClick={enviar} className="pressionavel inline-flex h-14 cursor-pointer items-center gap-3 rounded-full bg-[#1f7a46] px-8 text-[15px] font-medium text-white hover:bg-[#1a6b3d]">
                <IconeWhatsApp className="size-5" /> Enviar solicitação pelo WhatsApp
              </button>
            ) : (
              <button type="button" onClick={avancar} className="pressionavel inline-flex h-14 cursor-pointer items-center rounded-full bg-verde px-9 text-[15px] text-marfim hover:bg-verde-claro">
                Continuar
              </button>
            )}
          </div>
        </div>

        <Resumo
          p={p}
          orc={orc}
          copiado={copiado}
          onCopiar={async () => {
            const texto = mensagemWhatsApp({ ...p, codigo: p.codigo || "(gerado ao enviar)", nome: p.nome || "-" });
            try {
              await navigator.clipboard.writeText(texto);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            } catch {}
          }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- */

function Contador({ rotulo, sub, valor, min, max, onChange }: { rotulo: string; sub?: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  const botao = "pressionavel grid size-11 cursor-pointer place-items-center rounded-full border border-verde/20 text-lg text-verde hover:bg-verde/5 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-verde/10 bg-marfim px-5 py-4">
      <div>
        <p className="text-verde">{rotulo}</p>
        {sub && <p className="text-sm text-verde/65">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Diminuir ${rotulo.toLowerCase()}`} disabled={valor <= min} onClick={() => onChange(valor - 1)} className={botao}>−</button>
        <span aria-live="polite" className="w-6 text-center text-lg text-verde tabular-nums">{valor}</span>
        <button type="button" aria-label={`Aumentar ${rotulo.toLowerCase()}`} disabled={valor >= max} onClick={() => onChange(valor + 1)} className={botao}>+</button>
      </div>
    </div>
  );
}

const rotuloCampo = "text-[15px] text-salvia-escura";
const campoBase = "mt-2 w-full rounded-2xl border border-verde/15 bg-marfim px-5 py-4 text-verde outline-none transition-colors duration-200 focus:border-salvia focus-visible:ring-2 focus-visible:ring-dourado";

function EtapaEstadia({ p, set, hoje, noites }: { p: Pedido; set: Setter; hoje: string; noites: number }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={rotuloCampo}>Entrada</span>
          <input
            type="date"
            value={p.entrada}
            min={hoje}
            onChange={(e) => {
              set("entrada", e.target.value);
              if (p.saida <= e.target.value) set("saida", toISO(addDias(parseISO(e.target.value), 1)));
            }}
            className={`${campoBase} text-lg`}
          />
        </label>
        <label className="block">
          <span className={rotuloCampo}>Saída</span>
          <input type="date" value={p.saida} min={p.entrada} onChange={(e) => set("saida", e.target.value)} className={`${campoBase} text-lg`} />
        </label>
      </div>
      <p className="text-[15px] text-verde/70">
        {noites > 0 ? `${noites} diária${noites > 1 ? "s" : ""}, de ${fmtDataCurta(p.entrada)} a ${fmtDataCurta(p.saida)}.` : "Escolha as datas."} Check-in a partir das {HOTEL.checkin}, check-out até as {HOTEL.checkout}.
      </p>
      <Contador rotulo="Adultos" valor={p.adultos} min={1} max={12} onChange={(v) => set("adultos", v)} />
      <Contador rotulo="Crianças" sub="Contam como pessoa na diária" valor={p.criancas} min={0} max={8} onChange={(v) => set("criancas", v)} />
    </div>
  );
}

function EtapaOpcoes({ p, set, noites }: { p: Pedido; set: Setter; noites: number }) {
  const h = totalHospedes(p);
  return (
    <div className="space-y-10">
      <fieldset className="space-y-4">
        <legend className="font-display text-3xl text-verde">Acomodação</legend>
        <p className="text-[15px] text-verde/70">Valores para {hospedesTexto(p.adultos, p.criancas)}, {noites} diária{noites > 1 ? "s" : ""}, com café da manhã e piscinas aquecidas.</p>
        {ACOMODACOES.map((ac) => {
          const quartos = distribuir(ac, h);
          const total = quartos.reduce((s, n) => s + diaria(ac, n), 0) * noites;
          const sel = p.acomodacao === ac.slug;
          return (
            <button
              key={ac.slug}
              type="button"
              onClick={() => set("acomodacao", ac.slug)}
              aria-pressed={sel}
              className={`grid w-full cursor-pointer overflow-hidden rounded-3xl border-2 bg-marfim text-left transition-[border-color,box-shadow] duration-200 sm:grid-cols-[180px_1fr_auto] ${
                sel ? "border-salvia shadow-[0_12px_40px_-16px_rgba(54,67,57,.45)]" : "border-transparent hover:border-verde/15"
              }`}
            >
              <Foto src={ac.fotos[0]} alt="" paleta={ac.paleta} className="h-40 sm:h-full" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-verde md:text-3xl">{ac.nome}</h3>
                <p className="mt-1 text-sm text-verde/65">{ac.subtitulo}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {ac.destaques.slice(0, 3).map((x) => (
                    <li key={x} className="rounded-full bg-areia px-3 py-1 text-[13px] text-verde">{x}</li>
                  ))}
                </ul>
                {quartos.length > 1 && <p className="mt-3 text-sm text-dourado-escuro">Para {h} pessoas: {quartos.length} quartos ({quartos.join(" + ")})</p>}
              </div>
              <div className="flex flex-row items-center justify-between gap-1 border-t border-verde/5 bg-areia-clara p-6 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l">
                <span className="text-sm text-verde/65">total da hospedagem</span>
                <span className="font-display text-3xl text-verde">{brl(total)}</span>
                <span aria-hidden className={`mt-1 grid size-7 place-items-center rounded-full border-2 text-sm ${sel ? "border-salvia bg-salvia text-marfim" : "border-verde/20"}`}>{sel ? "✓" : ""}</span>
              </div>
            </button>
          );
        })}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-3xl text-verde">Pesca esportiva</legend>
        <p className="text-[15px] text-verde/70">Opcional e exclusiva para hóspedes: {brl(PESCA.preco)} por pessoa, por diária, com direito a pescar 24 horas.</p>
        <Contador rotulo="Pessoas que vão pescar" valor={p.pescadores} min={0} max={h} onChange={(v) => set("pescadores", v)} />
        {p.pescadores > 0 && (
          <Contador rotulo="Diárias de pesca" sub={`Sua estadia tem ${noites} diária${noites > 1 ? "s" : ""}`} valor={Math.min(p.diasPesca, Math.max(1, noites))} min={1} max={Math.max(1, noites)} onChange={(v) => set("diasPesca", v)} />
        )}
      </fieldset>
    </div>
  );
}

function EtapaDados({ p, set, aceite, setAceite }: { p: Pedido; set: Setter; aceite: boolean; setAceite: (v: boolean) => void }) {
  return (
    <div className="space-y-5">
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
      <div className="rounded-2xl bg-areia p-5 text-[15px] text-verde/85">
        <p className="text-verde">Como funciona</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Você envia a solicitação e nossa equipe confirma a disponibilidade pelo WhatsApp.</li>
          <li>A reserva só é garantida após a confirmação e o pagamento combinado.</li>
          <li>Não é permitida a entrada de bebidas externas. Para trazer algo específico, consulte a gerência.</li>
        </ul>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-[15px] text-verde/85">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-1 size-5 shrink-0 cursor-pointer accent-[#364339]" />
        Li as condições e autorizo o uso dos meus dados apenas para o atendimento desta solicitação, conforme a LGPD.
      </label>
    </div>
  );
}

function Resumo({ p, orc, copiado, onCopiar }: { p: Pedido; orc: ReturnType<typeof calcular>; copiado: boolean; onCopiar: () => void }) {
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  return (
    <aside className="rounded-[28px] bg-verde p-7 text-marfim lg:sticky lg:top-28" aria-label="Resumo do orçamento">
      <h2 className="text-[15px] text-dourado">Seu orçamento</h2>
      <dl className="mt-5 space-y-3 text-[15px]">
        <Linha k="Período" v={`${fmtDataCurta(p.entrada)} a ${fmtDataCurta(p.saida)}`} />
        <Linha k="Diárias" v={String(orc.noites)} />
        <Linha k="Hóspedes" v={hospedesTexto(p.adultos, p.criancas)} />
        <Linha k="Acomodação" v={ac ? ac.nome : "a escolher"} />
      </dl>
      <div className="my-6 h-px bg-marfim/10" />
      <ul className="space-y-2 text-sm text-marfim/75">
        <AnimatePresence initial={false}>
          {orc.linhas.map((l) => (
            <motion.li key={l.rotulo.split(":")[0]} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex justify-between gap-4">
              <span>{l.rotulo}</span>
              <span className="shrink-0 text-marfim">{brl(l.valor)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        {orc.linhas.length === 0 && <li>Escolha a acomodação para ver o valor.</li>}
      </ul>
      <div className="mt-6 flex items-end justify-between border-t border-marfim/15 pt-5">
        <span className="text-[15px] text-marfim/70">Total estimado</span>
        <span className="font-display text-4xl text-dourado-claro">{brl(orc.total)}</span>
      </div>
      <p className="mt-3 text-sm text-marfim/55">Restaurante e bebidas são pagos à parte, no local.</p>
      <button type="button" onClick={onCopiar} className="pressionavel mt-6 h-12 w-full cursor-pointer rounded-full border border-marfim/20 text-[15px] hover:bg-marfim/10">
        {copiado ? "Orçamento copiado" : "Copiar orçamento"}
      </button>
    </aside>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-marfim/60">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function Enviado({ p, onNovo }: { p: Pedido; onNovo: () => void }) {
  const msg = mensagemWhatsApp(p);
  return (
    <div className="mx-auto max-w-2xl px-5 pt-36 pb-28 text-center md:pt-44">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35, ease: EASE }} className="mx-auto grid size-24 place-items-center rounded-full bg-verde text-dourado-claro">
        <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
        </svg>
      </motion.div>
      <h1 className="font-display mt-8 text-5xl text-verde md:text-6xl">Solicitação pronta</h1>
      <p className="mt-4 text-verde/75">Abrimos o WhatsApp do hotel com a mensagem preenchida. Se ele não abriu, use o botão abaixo.</p>
      <p className="mt-6 inline-block rounded-xl border border-dashed border-salvia px-5 py-2 text-xl tracking-widest text-verde">{p.codigo}</p>
      <p className="mt-3 text-sm text-verde/70">Aguardando a confirmação da equipe.</p>
      <div className="mx-auto mt-10 max-w-md rounded-3xl rounded-bl-md bg-marfim p-5 text-left text-sm whitespace-pre-wrap text-verde">{msg}</div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href={waLink(msg)} target="_blank" rel="noopener" className="pressionavel inline-flex h-14 items-center gap-2 rounded-full bg-[#1f7a46] px-7 text-[15px] font-medium text-white hover:bg-[#1a6b3d]">
          <IconeWhatsApp className="size-5" /> Abrir WhatsApp
        </a>
        <button type="button" onClick={onNovo} className="pressionavel h-14 cursor-pointer rounded-full border border-verde/20 px-7 text-[15px] text-verde hover:bg-verde/5">
          Fazer outro orçamento
        </button>
      </div>
    </div>
  );
}
