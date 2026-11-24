"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDias, proximaSexta, toISO } from "@/lib/reserva";

/** Barra de busca do hero: datas + hóspedes → /reservar já preenchido. */
export function BuscaRapida({ variante = "vidro" }: { variante?: "vidro" | "claro" }) {
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

  const vidro = variante === "vidro";
  const campo = `w-full bg-transparent text-[15px] font-medium outline-none ${vidro ? "text-creme [color-scheme:dark]" : "text-oliva-900"}`;
  const rotulo = `block text-[10px] font-bold tracking-[.2em] uppercase ${vidro ? "text-champanhe" : "text-oliva-600"}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!entrada || !saida || saida <= entrada) return setErro("A saída precisa ser depois da entrada.");
        setErro("");
        router.push(`/reservar?entrada=${entrada}&saida=${saida}&adultos=${hospedes}`);
      }}
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-[1fr_1fr_1fr_auto] ${
        vidro ? "border border-creme/15 bg-creme/10 backdrop-blur-2xl" : "border border-oliva-900/10 bg-white shadow-xl"
      }`}
      aria-label="Consultar disponibilidade"
    >
      <label className="px-5 py-4 md:px-6">
        <span className={rotulo}>Entrada</span>
        <input type="date" required value={entrada} min={hoje} onChange={(e) => { setEntrada(e.target.value); if (saida <= e.target.value) setSaida(toISO(addDias(new Date(e.target.value + "T00:00"), 1))); }} className={campo} />
      </label>
      <label className="px-5 py-4 md:px-6">
        <span className={rotulo}>Saída</span>
        <input type="date" required value={saida} min={entrada} onChange={(e) => setSaida(e.target.value)} className={campo} />
      </label>
      <div className="col-span-2 flex items-center justify-between px-5 py-4 md:col-span-1 md:px-6">
        <div>
          <span className={rotulo}>Hóspedes</span>
          <span className={campo}>{hospedes} adulto{hospedes > 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Menos hóspedes" : "Mais hóspedes"}
              onClick={() => setHospedes((h) => Math.min(12, Math.max(1, h + d)))}
              className={`grid size-9 place-items-center rounded-full border text-lg transition-colors ${vidro ? "border-creme/30 hover:bg-creme/15" : "border-oliva-900/20 hover:bg-oliva-900/5"}`}
            >
              {d < 0 ? "−" : "+"}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" className="col-span-2 m-2 rounded-2xl bg-escama px-8 py-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-escama-escuro md:col-span-1">
        Consultar valores
      </button>
      {erro && <p role="alert" className="col-span-full px-6 pb-3 text-sm text-escama">{erro}</p>}
    </form>
  );
}
