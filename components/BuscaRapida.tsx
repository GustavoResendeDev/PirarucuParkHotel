"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDias, parseISO, proximaSexta, toISO } from "@/lib/reserva";

/** Busca do hero: datas e hóspedes, leva ao orçamento já preenchido. */
export function BuscaRapida({ variante = "escuro" }: { variante?: "escuro" | "claro" }) {
  const router = useRouter();
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [hospedes, setHospedes] = useState(2);
  const [hoje, setHoje] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const s = proximaSexta();
    setEntrada(toISO(s));
    setSaida(toISO(addDias(s, 2)));
    setHoje(toISO(new Date()));
  }, []);

  const escuro = variante === "escuro";
  const campo = `w-full bg-transparent text-base outline-none ${escuro ? "text-marfim [color-scheme:dark]" : "text-verde"}`;
  const rotulo = `block text-[13px] ${escuro ? "text-dourado" : "text-salvia-escura"}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!entrada || !saida || saida <= entrada) return setErro("Escolha uma saída depois da entrada.");
        setErro("");
        router.push(`/reservar?entrada=${entrada}&saida=${saida}&adultos=${hospedes}`);
      }}
      className={`grid grid-cols-2 overflow-hidden rounded-2xl text-left md:grid-cols-[1fr_1fr_1.1fr_auto] ${
        escuro ? "border border-dourado/30 bg-verde-noite/55 backdrop-blur-xl" : "border border-verde/15 bg-areia-clara"
      }`}
      aria-label="Consultar valores"
    >
      <label className={`cursor-pointer px-5 py-3.5 ${escuro ? "border-r border-dourado/15" : "border-r border-verde/10"}`}>
        <span className={rotulo}>Entrada</span>
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
      </label>
      <label className={`cursor-pointer px-5 py-3.5 md:border-r ${escuro ? "md:border-dourado/15" : "md:border-verde/10"}`}>
        <span className={rotulo}>Saída</span>
        <input type="date" required value={saida} min={entrada} onChange={(e) => setSaida(e.target.value)} className={campo} />
      </label>
      <div className={`col-span-2 flex items-center justify-between border-t px-5 py-3 md:col-span-1 md:border-t-0 ${escuro ? "border-dourado/15" : "border-verde/10"}`}>
        <div>
          <span className={rotulo}>Hóspedes</span>
          <span className={campo} aria-live="polite">
            {hospedes} pessoa{hospedes > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Menos hóspedes" : "Mais hóspedes"}
              onClick={() => setHospedes((h) => Math.min(12, Math.max(1, h + d)))}
              className={`pressionavel grid size-11 cursor-pointer place-items-center rounded-full border text-lg ${escuro ? "border-dourado/40 hover:bg-dourado/15" : "border-verde/25 hover:bg-verde/5"}`}
            >
              {d < 0 ? "−" : "+"}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" className="pressionavel col-span-2 m-2 cursor-pointer rounded-xl bg-dourado px-8 py-4 text-[15px] font-medium tracking-wide text-verde-noite hover:bg-dourado-claro md:col-span-1">
        Ver valores
      </button>
      {erro && <p role="alert" className={`col-span-full px-5 pb-3 text-sm ${escuro ? "text-dourado-claro" : "text-dourado-escuro"}`}>{erro}</p>}
    </form>
  );
}
