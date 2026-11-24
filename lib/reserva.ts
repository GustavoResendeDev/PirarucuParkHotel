import { ACOMODACOES, HOTEL, SERVICOS_PESCA, type Acomodacao } from "./data";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const toISO = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const addDias = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const fmtData = (s: string) =>
  parseISO(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
export const fmtDataCurta = (s: string) =>
  parseISO(s).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

export function proximaSexta(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const delta = (5 - d.getDay() + 7) % 7 || 7;
  return addDias(d, delta);
}

/** Noites entre entrada e saída. Sexta e sábado usam a tarifa de fim de semana (EXEMPLO). */
export function cotarHospedagem(ac: Acomodacao, entrada: string, saida: string) {
  let semana = 0;
  let fimDeSemana = 0;
  for (let d = parseISO(entrada); d < parseISO(saida); d = addDias(d, 1)) {
    if (d.getDay() === 5 || d.getDay() === 6) fimDeSemana++;
    else semana++;
  }
  const noites = semana + fimDeSemana;
  return {
    noites,
    semana,
    fimDeSemana,
    total: semana * ac.diaria + fimDeSemana * ac.diariaFimDeSemana,
  };
}

export type Pedido = {
  tipo: "hospedagem" | "dayuse";
  entrada: string;
  saida: string;
  adultos: number;
  criancas: number;
  acomodacao?: string;
  quartos: number;
  pescadores: number; // pessoas que vão pescar
  diasPesca: number;
  acompanhantes: number; // day use lazer (só no tipo dayuse)
  nome: string;
  telefone: string;
  obs: string;
  codigo: string;
};

export function totalHospedes(p: Pick<Pedido, "adultos" | "criancas">) {
  return p.adultos + p.criancas;
}

export function calcular(p: Pedido) {
  const linhas: { rotulo: string; valor: number }[] = [];
  if (p.tipo === "hospedagem") {
    const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
    if (ac) {
      const c = cotarHospedagem(ac, p.entrada, p.saida);
      if (c.semana)
        linhas.push({ rotulo: `${c.semana} diária${c.semana > 1 ? "s" : ""} × ${brl(ac.diaria)}${p.quartos > 1 ? ` × ${p.quartos} quartos` : ""}`, valor: c.semana * ac.diaria * p.quartos });
      if (c.fimDeSemana)
        linhas.push({ rotulo: `${c.fimDeSemana} diária${c.fimDeSemana > 1 ? "s" : ""} fim de semana × ${brl(ac.diariaFimDeSemana)}${p.quartos > 1 ? ` × ${p.quartos} quartos` : ""}`, valor: c.fimDeSemana * ac.diariaFimDeSemana * p.quartos });
    }
  }
  const pesca = SERVICOS_PESCA.find((s) => s.id === "pesque-solte")!;
  const lazer = SERVICOS_PESCA.find((s) => s.id === "day-use")!;
  if (p.pescadores > 0 && p.diasPesca > 0)
    linhas.push({ rotulo: `Pesca esportiva: ${p.pescadores} pescador${p.pescadores > 1 ? "es" : ""} × ${p.diasPesca} dia${p.diasPesca > 1 ? "s" : ""}`, valor: p.pescadores * p.diasPesca * pesca.preco });
  if (p.tipo === "dayuse" && p.acompanhantes > 0)
    linhas.push({ rotulo: `Day use lazer: ${p.acompanhantes} pessoa${p.acompanhantes > 1 ? "s" : ""}`, valor: p.acompanhantes * lazer.preco });
  const total = linhas.reduce((s, l) => s + l.valor, 0);
  return { linhas, total };
}

export function gerarCodigo() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "PPH-";
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

export function hospedesTexto(adultos: number, criancas: number) {
  let t = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  if (criancas) t += ` e ${criancas} criança${criancas > 1 ? "s" : ""}`;
  return t;
}

export function mensagemWhatsApp(p: Pedido) {
  const { linhas, total } = calcular(p);
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  const partes = [
    p.tipo === "hospedagem"
      ? `Olá! Quero solicitar uma reserva no ${HOTEL.nome}.`
      : `Olá! Quero um orçamento de day use no Recanto do Pirarucu.`,
    "",
    `Solicitação: ${p.codigo}`,
    `Nome: ${p.nome}`,
  ];
  if (p.tipo === "hospedagem") {
    partes.push(
      `Acomodação: ${ac?.nome ?? "-"}${p.quartos > 1 ? ` (${p.quartos} quartos)` : ""}`,
      `Entrada: ${fmtData(p.entrada)} (a partir das ${HOTEL.checkin})`,
      `Saída: ${fmtData(p.saida)} (até ${HOTEL.checkout})`,
      `Hóspedes: ${hospedesTexto(p.adultos, p.criancas)}`,
    );
  } else {
    partes.push(`Data: ${fmtData(p.entrada)}`, `Pescadores: ${p.pescadores}`, `Acompanhantes (lazer): ${p.acompanhantes}`);
  }
  partes.push("", "Orçamento estimado pelo site:", ...linhas.map((l) => `• ${l.rotulo}: ${brl(l.valor)}`), `Total estimado: ${brl(total)}`);
  if (p.obs) partes.push("", `Observações: ${p.obs}`);
  partes.push("", "Aguardo a confirmação. Obrigado!");
  return partes.join("\n");
}

export const waLink = (texto: string) => `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(texto)}`;
