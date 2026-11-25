import type { Acomodacao } from "@/lib/data";
import { brl } from "@/lib/reserva";

/** Linhas da tabela oficial de diárias de uma acomodação. */
export function linhasPreco(ac: Acomodacao) {
  const t = ac.tarifa;
  if (t.tipo === "por-ocupacao")
    return [
      ...Object.entries(t.valores).map(([n, v]) => ({
        rotulo: Number(n) === 1 ? "Individual" : Number(n) === 2 ? "Duplo" : "Triplo",
        detalhe: `${n} pessoa${Number(n) > 1 ? "s" : ""}`,
        valor: brl(v),
      })),
      ...(t.camaExtra ? [{ rotulo: "Cama extra", detalhe: "4ª pessoa", valor: `+ ${brl(t.camaExtra)}` }] : []),
    ];
  return [
    { rotulo: "Casal", detalhe: "2 pessoas", valor: brl(t.casal) },
    { rotulo: "Pessoa adicional", detalhe: "por pessoa", valor: `+ ${brl(t.adicional)}` },
  ];
}

export function TabelaPrecos({ ac, escuro = false }: { ac: Acomodacao; escuro?: boolean }) {
  return (
    <dl className={`divide-y ${escuro ? "divide-marfim/15" : "divide-verde/10"}`}>
      {linhasPreco(ac).map((l) => (
        <div key={l.rotulo} className="flex items-baseline justify-between gap-4 py-3">
          <dt>
            <span className={escuro ? "text-marfim" : "text-verde"}>{l.rotulo}</span>
            <span className={`ml-2 text-sm ${escuro ? "text-marfim/75" : "text-verde/80"}`}>{l.detalhe}</span>
          </dt>
          <dd className={`font-display text-2xl ${escuro ? "text-dourado-claro" : "text-verde"}`}>{l.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
