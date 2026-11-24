"use client";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ACOMODACOES, HOTEL, SERVICOS_PESCA } from "@/lib/data";
import {
  addDias,
  brl,
  calcular,
  cotarHospedagem,
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

const EASE = [0.22, 1, 0.36, 1] as const;

type Etapa = "datas" | "acomodacao" | "pesca" | "dados" | "enviado";
const ETAPAS_HOSP: Etapa[] = ["datas", "acomodacao", "pesca", "dados"];
const ETAPAS_DAY: Etapa[] = ["datas", "dados"];
const NOMES: Record<Etapa, string> = { datas: "Datas", acomodacao: "Acomodação", pesca: "Pesca", dados: "Resumo", enviado: "Enviado" };

function pedidoInicial(): Pedido {
  const s = proximaSexta();
  return {
    tipo: "hospedagem",
    entrada: toISO(s),
    saida: toISO(addDias(s, 2)),
    adultos: 2,
    criancas: 0,
    acomodacao: undefined,
    quartos: 1,
    pescadores: 0,
    diasPesca: 1,
    acompanhantes: 0,
    nome: "",
    telefone: "",
    obs: "",
    codigo: "",
  };
}

export function Reserva() {
  const params = useSearchParams();
  const [p, setP] = useState<Pedido>(pedidoInicial);
  const [etapa, setEtapa] = useState<Etapa>("datas");
  const [dir, setDir] = useState(1);
  const [erro, setErro] = useState("");
  const [aceite, setAceite] = useState(false);
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
      if (params.get("tipo") === "dayuse") {
        n.tipo = "dayuse";
        n.pescadores = 2;
      }
      if (e && s && s > e) {
        n.entrada = e;
        n.saida = s;
      }
      if (a > 0 && a <= 12) n.adultos = a;
      if (ac && ACOMODACOES.some((x) => x.slug === ac)) n.acomodacao = ac;
      return n;
    });
  }, [params]);

  const etapas = p.tipo === "hospedagem" ? ETAPAS_HOSP : ETAPAS_DAY;
  const idx = etapas.indexOf(etapa);
  const orc = useMemo(() => calcular(p), [p]);
  const noites = useMemo(() => Math.max(0, Math.round((parseISO(p.saida).getTime() - parseISO(p.entrada).getTime()) / 864e5)), [p.entrada, p.saida]);
  const set = <K extends keyof Pedido>(k: K, v: Pedido[K]) => setP((x) => ({ ...x, [k]: v }));

  function ir(prox: Etapa) {
    setErro("");
    setDir(etapas.indexOf(prox) >= idx ? 1 : -1);
    setEtapa(prox);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function avancar() {
    if (etapa === "datas") {
      if (!p.entrada || (p.tipo === "hospedagem" && (!p.saida || p.saida <= p.entrada))) return setErro("A saída precisa ser depois da entrada.");
      if (p.entrada < hoje) return setErro("A data não pode estar no passado.");
      if (p.tipo === "dayuse" && p.pescadores + p.acompanhantes < 1) return setErro("Informe ao menos uma pessoa.");
      if (p.tipo === "hospedagem") {
        // sugere dias de pesca = noites e ajusta quartos se a acomodação já escolhida não comporta
        setP((x) => ({ ...x, diasPesca: Math.min(Math.max(1, noites), x.diasPesca || 1) }));
      }
    }
    if (etapa === "acomodacao" && !p.acomodacao) return setErro("Escolha uma acomodação.");
    ir(etapas[idx + 1]);
  }

  function enviar() {
    if (p.nome.trim().length < 3) return setErro("Informe seu nome.");
    if (p.telefone.replace(/\D/g, "").length < 10) return setErro("Informe um WhatsApp com DDD.");
    if (!aceite) return setErro("Para enviar, aceite as condições.");
    const final = { ...p, codigo: p.codigo || gerarCodigo() };
    setP(final);
    window.open(waLink(mensagemWhatsApp(final)), "_blank", "noopener");
    // TODO backend: POST /api/reservations criando a solicitação PENDING (ver PDF, seção 4.3)
    ir("enviado");
  }

  function trocarTipo(t: Pedido["tipo"]) {
    setP((x) => ({ ...x, tipo: t, pescadores: t === "dayuse" ? Math.max(1, x.pescadores) : x.pescadores }));
    setEtapa("datas");
    setErro("");
  }

  if (etapa === "enviado") return <Enviado p={p} onNovo={() => { setP(pedidoInicial()); setAceite(false); setEtapa("datas"); }} />;

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-28 md:px-8 md:pt-40">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs font-bold tracking-[.3em] text-escama uppercase">Reserva e orçamento</p>
          <h1 className="font-display text-5xl leading-[0.95] font-medium text-oliva-900 md:text-7xl">
            {p.tipo === "hospedagem" ? "Planeje sua estadia" : "Day use no pesqueiro"}
          </h1>
        </div>
        <div role="tablist" aria-label="Tipo de orçamento" className="relative flex rounded-full bg-oliva-900/5 p-1">
          {(["hospedagem", "dayuse"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={p.tipo === t}
              onClick={() => trocarTipo(t)}
              className={`relative z-10 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${p.tipo === t ? "text-creme" : "text-oliva-700"}`}
            >
              {p.tipo === t && <motion.span layoutId="aba" className="absolute inset-0 -z-10 rounded-full bg-oliva-800" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              {t === "hospedagem" ? "Hospedagem" : "Só o pesqueiro"}
            </button>
          ))}
        </div>
      </div>

      {/* etapas */}
      <ol className="mb-10 flex gap-2 overflow-x-auto pb-1" aria-label="Etapas">
        {etapas.map((e, i) => (
          <li key={e} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={i > idx}
              onClick={() => i < idx && ir(e)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === idx ? "bg-oliva-900 text-creme" : i < idx ? "bg-oliva-900/10 text-oliva-800 hover:bg-oliva-900/15" : "bg-oliva-900/5 text-oliva-400"
              }`}
            >
              <span className={`grid size-5 place-items-center rounded-full text-[11px] ${i === idx ? "bg-creme text-oliva-900" : "bg-white/70"}`}>{i < idx ? "✓" : i + 1}</span>
              {NOMES[e]}
            </button>
            {i < etapas.length - 1 && <span className="h-px w-6 bg-oliva-900/15" />}
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={etapa + p.tipo}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {etapa === "datas" && <EtapaDatas p={p} set={set} hoje={hoje} noites={noites} />}
              {etapa === "acomodacao" && <EtapaAcomodacao p={p} setP={setP} />}
              {etapa === "pesca" && <EtapaPesca p={p} set={set} noites={noites} />}
              {etapa === "dados" && <EtapaDados p={p} set={set} aceite={aceite} setAceite={setAceite} />}
            </motion.div>
          </AnimatePresence>

          {erro && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-6 rounded-2xl bg-escama/10 px-5 py-3 text-sm font-medium text-escama-escuro">
              {erro}
            </motion.p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            {idx > 0 ? (
              <button type="button" onClick={() => ir(etapas[idx - 1])} className="rounded-full px-6 py-4 text-sm font-semibold text-oliva-800 hover:bg-oliva-900/5">
                ← Voltar
              </button>
            ) : (
              <span />
            )}
            {etapa === "dados" ? (
              <button type="button" onClick={enviar} className="inline-flex items-center gap-3 rounded-full bg-[#1f9d55] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1f9d55]/25 transition-transform hover:scale-[1.03]">
                <IconeWhatsApp className="size-5" /> Enviar solicitação pelo WhatsApp
              </button>
            ) : (
              <button type="button" onClick={avancar} className="rounded-full bg-oliva-900 px-8 py-4 text-sm font-semibold text-creme transition-transform hover:scale-[1.03]">
                Continuar →
              </button>
            )}
          </div>
        </div>

        <Resumo p={p} orc={orc} noites={noites} copiado={copiado} onCopiar={async () => {
          const texto = mensagemWhatsApp({ ...p, codigo: p.codigo || "(gerado ao enviar)", nome: p.nome || "-" });
          try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch {}
        }} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- */

function Contador({ rotulo, sub, valor, min, max, onChange }: { rotulo: string; sub?: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-oliva-900/10 bg-white px-5 py-4">
      <div>
        <p className="font-semibold text-oliva-900">{rotulo}</p>
        {sub && <p className="text-sm text-oliva-600">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Diminuir ${rotulo}`} disabled={valor <= min} onClick={() => onChange(valor - 1)} className="grid size-10 place-items-center rounded-full border border-oliva-900/15 text-lg text-oliva-900 disabled:opacity-30">−</button>
        <motion.span key={valor} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-lg font-semibold tabular-nums">{valor}</motion.span>
        <button type="button" aria-label={`Aumentar ${rotulo}`} disabled={valor >= max} onClick={() => onChange(valor + 1)} className="grid size-10 place-items-center rounded-full border border-oliva-900/15 text-lg text-oliva-900 disabled:opacity-30">+</button>
      </div>
    </div>
  );
}

const campoData = "mt-2 w-full rounded-2xl border border-oliva-900/10 bg-white px-5 py-4 text-lg font-medium text-oliva-900 outline-none focus:border-oliva-700";

function EtapaDatas({ p, set, hoje, noites }: { p: Pedido; set: <K extends keyof Pedido>(k: K, v: Pedido[K]) => void; hoje: string; noites: number }) {
  if (p.tipo === "dayuse")
    return (
      <div className="space-y-6">
        <label className="block">
          <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">Data da visita</span>
          <input type="date" value={p.entrada} min={hoje} onChange={(e) => set("entrada", e.target.value)} className={campoData} />
          <span className="mt-2 block text-sm text-oliva-600">Pesqueiro aberto {HOTEL.pesqueiroFuncionamento.toLowerCase()}.</span>
        </label>
        <Contador rotulo="Pescadores" sub={`Pesca esportiva · ${brl(SERVICOS_PESCA[0].preco)} por pessoa`} valor={p.pescadores} min={0} max={30} onChange={(v) => set("pescadores", v)} />
        <Contador rotulo="Acompanhantes" sub={`Day use lazer, sem pesca · ${brl(SERVICOS_PESCA[1].preco)} por pessoa`} valor={p.acompanhantes} min={0} max={30} onChange={(v) => set("acompanhantes", v)} />
        <p className="text-sm text-oliva-600"><span className="selo-exemplo text-escama">valores de exemplo</span> Para grupos e eventos, o hotel monta um orçamento especial.</p>
      </div>
    );
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">Entrada</span>
          <input
            type="date"
            value={p.entrada}
            min={hoje}
            onChange={(e) => {
              set("entrada", e.target.value);
              if (p.saida <= e.target.value) set("saida", toISO(addDias(parseISO(e.target.value), 1)));
            }}
            className={campoData}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">Saída</span>
          <input type="date" value={p.saida} min={p.entrada} onChange={(e) => set("saida", e.target.value)} className={campoData} />
        </label>
      </div>
      <p className="text-sm text-oliva-600">
        {noites > 0 ? `${noites} noite${noites > 1 ? "s" : ""} · ${fmtDataCurta(p.entrada)} a ${fmtDataCurta(p.saida)}` : "Escolha as datas"} · check-in {HOTEL.checkin}, check-out {HOTEL.checkout}
      </p>
      <Contador rotulo="Adultos" valor={p.adultos} min={1} max={12} onChange={(v) => set("adultos", v)} />
      <Contador rotulo="Crianças" sub="até 12 anos" valor={p.criancas} min={0} max={8} onChange={(v) => set("criancas", v)} />
    </div>
  );
}

function EtapaAcomodacao({ p, setP }: { p: Pedido; setP: React.Dispatch<React.SetStateAction<Pedido>> }) {
  const h = totalHospedes(p);
  return (
    <div className="space-y-4">
      <p className="text-sm text-oliva-600">
        Valores para {hospedesTexto(p.adultos, p.criancas)}. Sexta e sábado têm tarifa de fim de semana. <span className="selo-exemplo text-escama">exemplo</span>
      </p>
      {ACOMODACOES.map((ac) => {
        const quartos = Math.ceil(h / ac.capacidade);
        const c = cotarHospedagem(ac, p.entrada, p.saida);
        const sel = p.acomodacao === ac.slug;
        return (
          <motion.button
            key={ac.slug}
            type="button"
            layout
            onClick={() => setP((x) => ({ ...x, acomodacao: ac.slug, quartos }))}
            aria-pressed={sel}
            className={`grid w-full overflow-hidden rounded-3xl border-2 bg-white text-left transition-shadow sm:grid-cols-[200px_1fr_auto] ${
              sel ? "border-oliva-800 shadow-xl shadow-oliva-900/10" : "border-transparent hover:shadow-lg"
            }`}
          >
            <Foto src={ac.fotos[0]} alt={ac.nome} paleta={ac.paleta} className="h-40 sm:h-full" />
            <div className="p-6">
              <h3 className="font-display text-3xl text-oliva-900">{ac.nome}</h3>
              <p className="mt-1 text-sm text-oliva-600">até {ac.capacidade} pessoas · {ac.area}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {ac.comodidades.slice(0, 4).map((x) => (
                  <li key={x} className="rounded-full bg-creme px-3 py-1 text-xs text-oliva-800">{x}</li>
                ))}
              </ul>
              {quartos > 1 && <p className="mt-3 text-sm font-medium text-escama">Para {h} pessoas: {quartos} quartos</p>}
            </div>
            <div className="flex flex-row items-center justify-between gap-1 border-t border-oliva-900/5 bg-creme-claro p-6 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l">
              <span className="text-xs text-oliva-600">{c.noites} noite{c.noites > 1 ? "s" : ""}</span>
              <span className="font-display text-3xl text-oliva-900">{brl(c.total * quartos)}</span>
              <span className={`mt-1 grid size-7 place-items-center rounded-full border-2 ${sel ? "border-oliva-800 bg-oliva-800 text-creme" : "border-oliva-900/20"}`}>{sel ? "✓" : ""}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function EtapaPesca({ p, set, noites }: { p: Pedido; set: <K extends keyof Pedido>(k: K, v: Pedido[K]) => void; noites: number }) {
  const h = totalHospedes(p);
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-marinho p-8 text-creme">
        <p className="text-xs font-bold tracking-[.25em] text-champanhe uppercase">Recanto do Pirarucu</p>
        <h3 className="font-display mt-2 text-4xl">Vai pescar?</h3>
        <p className="mt-2 max-w-md text-sm text-creme/75">
          A pesca esportiva é cobrada à parte ({brl(SERVICOS_PESCA[0].preco)} por pessoa/dia, exemplo). Adicione agora para já sair com o orçamento completo.
        </p>
      </div>
      <Contador rotulo="Pessoas que vão pescar" valor={p.pescadores} min={0} max={h} onChange={(v) => set("pescadores", v)} />
      {p.pescadores > 0 && (
        <Contador rotulo="Dias de pesca" sub={`Sua estadia tem ${noites + 1} dias`} valor={p.diasPesca} min={1} max={Math.max(1, noites + 1)} onChange={(v) => set("diasPesca", v)} />
      )}
      <p className="text-sm text-oliva-600">Não vai pescar? Tudo bem, é só continuar. A piscina e as áreas de lazer são para todos os hóspedes.</p>
    </div>
  );
}

function EtapaDados({ p, set, aceite, setAceite }: { p: Pedido; set: <K extends keyof Pedido>(k: K, v: Pedido[K]) => void; aceite: boolean; setAceite: (v: boolean) => void }) {
  const campo = "mt-2 w-full rounded-2xl border border-oliva-900/10 bg-white px-5 py-4 text-oliva-900 outline-none focus:border-oliva-700";
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">Nome completo</span>
        <input autoComplete="name" value={p.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como devemos te chamar?" className={campo} />
      </label>
      <label className="block">
        <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">WhatsApp</span>
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
          className={campo}
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold tracking-[.2em] text-oliva-600 uppercase">Observações (opcional)</span>
        <textarea rows={3} value={p.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Horário de chegada, ocasião especial, equipamento de pesca…" className={campo} />
      </label>
      <div className="rounded-2xl bg-creme p-5 text-sm text-oliva-700">
        <p className="font-semibold text-oliva-900">Como funciona</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Você envia a solicitação e nossa equipe confirma a disponibilidade pelo WhatsApp.</li>
          <li>A reserva só é garantida após a confirmação e o pagamento combinado.</li>
          <li>Sem confirmação em até {HOTEL.expiracaoSolicitacaoHoras}h, a solicitação expira.</li>
        </ul>
      </div>
      <label className="flex items-start gap-3 text-sm text-oliva-700">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-1 size-5 accent-oliva-800" />
        Li as condições e autorizo o uso dos meus dados apenas para o atendimento desta solicitação, conforme a Política de Privacidade (LGPD).
      </label>
    </div>
  );
}

function Resumo({ p, orc, noites, copiado, onCopiar }: { p: Pedido; orc: ReturnType<typeof calcular>; noites: number; copiado: boolean; onCopiar: () => void }) {
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  return (
    <aside className="rounded-[28px] bg-oliva-900 p-7 text-creme lg:sticky lg:top-28" aria-label="Resumo do orçamento">
      <p className="text-xs font-bold tracking-[.25em] text-champanhe uppercase">Seu orçamento</p>
      <dl className="mt-5 space-y-3 text-sm">
        {p.tipo === "hospedagem" ? (
          <>
            <Linha k="Período" v={`${fmtDataCurta(p.entrada)} → ${fmtDataCurta(p.saida)}`} />
            <Linha k="Noites" v={String(noites)} />
            <Linha k="Hóspedes" v={hospedesTexto(p.adultos, p.criancas)} />
            <Linha k="Acomodação" v={ac ? `${ac.nome}${p.quartos > 1 ? ` × ${p.quartos}` : ""}` : "—"} />
          </>
        ) : (
          <>
            <Linha k="Data" v={fmtDataCurta(p.entrada)} />
            <Linha k="Pescadores" v={String(p.pescadores)} />
            <Linha k="Acompanhantes" v={String(p.acompanhantes)} />
          </>
        )}
      </dl>
      <div className="my-6 h-px bg-creme/10" />
      <ul className="space-y-2 text-sm text-creme/75">
        <AnimatePresence initial={false}>
          {orc.linhas.map((l) => (
            <motion.li key={l.rotulo} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between gap-4">
              <span>{l.rotulo}</span>
              <span className="shrink-0 text-creme">{brl(l.valor)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        {orc.linhas.length === 0 && <li>Escolha as opções para ver o valor.</li>}
      </ul>
      <div className="mt-6 flex items-end justify-between border-t border-creme/15 pt-5">
        <span className="text-sm text-creme/70">
          Total estimado <span className="selo-exemplo ml-1 text-champanhe">exemplo</span>
        </span>
        <motion.span key={orc.total} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-4xl">
          {brl(orc.total)}
        </motion.span>
      </div>
      <button type="button" onClick={onCopiar} className="mt-6 w-full rounded-full border border-creme/20 py-3 text-sm font-semibold transition-colors hover:bg-creme/10">
        {copiado ? "Orçamento copiado ✓" : "Copiar orçamento"}
      </button>
    </aside>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-creme/60">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Enviado({ p, onNovo }: { p: Pedido; onNovo: () => void }) {
  const msg = mensagemWhatsApp(p);
  return (
    <div className="mx-auto max-w-2xl px-5 pt-36 pb-28 text-center md:pt-44">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="mx-auto grid size-24 place-items-center rounded-full bg-oliva-800 text-creme">
        <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
        </svg>
      </motion.div>
      <h1 className="font-display mt-8 text-5xl font-medium text-oliva-900 md:text-6xl">Solicitação pronta!</h1>
      <p className="mt-4 text-oliva-600">Abrimos o WhatsApp do hotel com a mensagem preenchida. Se não abriu, toque no botão abaixo.</p>
      <p className="mt-6 inline-block rounded-xl border border-dashed border-oliva-700 px-5 py-2 font-mono text-xl font-bold tracking-widest text-oliva-800">{p.codigo}</p>
      <p className="mt-3 text-sm text-oliva-600">Status: <b className="text-champanhe-escuro">aguardando confirmação</b></p>
      <div className="mx-auto mt-10 max-w-md rounded-3xl rounded-bl-md bg-[#e7f6ec] p-5 text-left text-sm whitespace-pre-wrap text-[#173b28]">{msg}</div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href={waLink(msg)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#1f9d55] px-7 py-4 text-sm font-semibold text-white">
          <IconeWhatsApp className="size-5" /> Abrir WhatsApp
        </a>
        <button type="button" onClick={onNovo} className="rounded-full border border-oliva-900/20 px-7 py-4 text-sm font-semibold text-oliva-900">
          Fazer outro orçamento
        </button>
      </div>
    </div>
  );
}
