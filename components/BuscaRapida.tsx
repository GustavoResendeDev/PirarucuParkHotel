"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACOMODACOES } from "@/lib/data";
import { addDias, parseISO, proximaSexta, toISO } from "@/lib/reserva";
import { IconeCalendario, IconeCama, IconeHospedes } from "./Icones";

/** Barra de reserva: datas, hóspedes e acomodação; leva ao orçamento já preenchido. */
export function BuscaRapida({ variante = "escuro" }: { variante?: "escuro" | "claro" }) {
  const router = useRouter();
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [hospedes, setHospedes] = useState(2);
  const [acomodacao, setAcomodacao] = useState("");
  const [hoje, setHoje] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const s = proximaSexta();
    setEntrada(toISO(s));
    setSaida(toISO(addDias(s, 2)));
    setHoje(toISO(new Date()));
  }, []);

  const escuro = variante === "escuro";
  const linha = escuro ? "border-dourado/20" : "border-verde/15";
  const campo = `w-full min-w-0 bg-transparent text-[15px] outline-none ${escuro ? "text-marfim [color-scheme:dark]" : "text-verde"}`;
  const rotulo = `block text-[11px] font-medium tracking-[0.16em] uppercase ${escuro ? "text-dourado" : "text-salvia-escura"}`;
  const icone = `size-5 shrink-0 ${escuro ? "text-dourado-claro/80" : "text-salvia"}`;
  const bloco = `flex h-11 items-center gap-3 border-b ${linha}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!entrada || !saida || saida <= entrada) return setErro("Escolha uma saída depois da entrada.");
        setErro("");
        const q = new URLSearchParams({ entrada, saida, adultos: String(hospedes) });
        if (acomodacao) q.set("acomodacao", acomodacao);
        router.push(`/reservar?${q}`);
      }}
      className={`grid grid-cols-2 gap-x-5 gap-y-5 rounded-2xl p-5 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,.45)] md:p-6 lg:grid-cols-[1fr_1fr_1.15fr_1.15fr_auto] lg:items-end lg:gap-x-5 xl:gap-x-7 ${
        escuro ? "border border-dourado/25 bg-verde/85 backdrop-blur-xl" : "border border-verde/15 bg-areia-clara"
      }`}
      aria-label="Consultar disponibilidade"
    >
      <label className="cursor-pointer">
        <span className={rotulo}>Entrada</span>
        <span className={`mt-1 ${bloco}`}>
          <IconeCalendario className={icone} />
          <input
            type="date"
            required
            value={entrada}
            min={hoje}
            onChange={(e) => {
              setEntrada(e.target.value);
              if (saida <= e.target.value) setSaida(toISO(addDias(parseISO(e.target.value), 1)));
            }}
            className={campo}
          />
        </span>
      </label>
      <label className="cursor-pointer">
        <span className={rotulo}>Saída</span>
        <span className={`mt-1 ${bloco}`}>
          <IconeCalendario className={icone} />
          <input type="date" required value={saida} min={entrada} onChange={(e) => setSaida(e.target.value)} className={campo} />
        </span>
      </label>
      <div>
        <span className={rotulo} id="rot-hospedes">Hóspedes</span>
        <div className={`mt-1 justify-between ${bloco}`}>
          <span className="flex items-center gap-3">
            <IconeHospedes className={`${icone} max-sm:hidden`} />
            <span className={`${campo} whitespace-nowrap`} aria-live="polite" aria-labelledby="rot-hospedes">
              {hospedes} pessoa{hospedes > 1 ? "s" : ""}
            </span>
          </span>
          <span className="flex gap-1.5">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d < 0 ? "Menos hóspedes" : "Mais hóspedes"}
                onClick={() => setHospedes((h) => Math.min(12, Math.max(1, h + d)))}
                className={`pressionavel grid size-8 shrink-0 sm:size-9 cursor-pointer place-items-center rounded-md border leading-none ${escuro ? "border-dourado/40 text-marfim hover:bg-dourado/15" : "border-verde/25 text-verde hover:bg-verde/5"}`}
              >
                {d < 0 ? "−" : "+"}
              </button>
            ))}
          </span>
        </div>
      </div>
      <label className="cursor-pointer">
        <span className={rotulo}>Acomodação</span>
        <span className={`mt-1 ${bloco}`}>
          <IconeCama className={icone} />
          <select value={acomodacao} onChange={(e) => setAcomodacao(e.target.value)} className={`${campo} cursor-pointer appearance-none truncate`}>
            <option value="" className="text-verde">Todas</option>
            {ACOMODACOES.map((a) => (
              <option key={a.slug} value={a.slug} className="text-verde">{a.nome}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" className={`size-4 shrink-0 ${escuro ? "text-marfim/75" : "text-verde/80"}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </label>
      <button
        type="submit"
        className="pressionavel col-span-2 h-12 cursor-pointer rounded-md bg-dourado px-5 text-[13px] font-medium tracking-[0.1em] whitespace-nowrap text-verde-noite uppercase xl:px-7 xl:tracking-[0.14em] hover:bg-dourado-claro lg:col-span-1"
      >
        Ver disponibilidade
      </button>
      {erro && <p role="alert" className={`col-span-full text-sm ${escuro ? "text-dourado-claro" : "text-dourado-escuro"}`}>{erro}</p>}
    </form>
  );
}
