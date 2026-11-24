import { ACOMODACOES, HOTEL, PESCA, type Acomodacao } from "./data";

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

export function contarNoites(entrada: string, saida: string) {
  return Math.max(0, Math.round((parseISO(saida).getTime() - parseISO(entrada).getTime()) / 864e5));
}

/** Diária de um quarto com `pessoas` hóspedes. */
export function diaria(ac: Acomodacao, pessoas: number) {
  const t = ac.tarifa;
  if (t.tipo === "por-ocupacao") return t.valores[Math.min(Math.max(1, pessoas), ac.capacidade)];
  return t.casal + Math.max(0, pessoas - 2) * t.adicional;
}

/** Menor diária possível (para "a partir de"). */
export function aPartirDe(ac: Acomodacao) {
  return ac.tarifa.tipo === "por-ocupacao" ? Math.min(...Object.values(ac.tarifa.valores)) : ac.tarifa.casal;
}

/** Distribui as pessoas entre os quartos necessários, o mais equilibrado possível. */
export function distribuir(ac: Acomodacao, pessoas: number) {
  const quartos = Math.max(1, Math.ceil(pessoas / ac.capacidade));
  const base = Math.floor(pessoas / quartos);
  const resto = pessoas % quartos;
  return Array.from({ length: quartos }, (_, i) => base + (i < resto ? 1 : 0));
}

export type Pedido = {
  entrada: string;
  saida: string;
  adultos: number;
  criancas: number;
  acomodacao?: string;
  pescadores: number;
  diasPesca: number;
  nome: string;
  telefone: string;
  obs: string;
  codigo: string;
};

export const totalHospedes = (p: Pick<Pedido, "adultos" | "criancas">) => p.adultos + p.criancas;

export function calcular(p: Pedido) {
  const linhas: { rotulo: string; valor: number }[] = [];
  const noites = contarNoites(p.entrada, p.saida);
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  if (ac && noites > 0) {
    const quartos = distribuir(ac, totalHospedes(p));
    quartos.forEach((pessoas, i) => {
      const d = diaria(ac, pessoas);
      const nome = quartos.length > 1 ? `Quarto ${i + 1}` : ac.nome;
      linhas.push({ rotulo: `${nome}, ${pessoas} pessoa${pessoas > 1 ? "s" : ""}: ${noites} × ${brl(d)}`, valor: d * noites });
    });
  }
  if (p.pescadores > 0 && p.diasPesca > 0)
    linhas.push({
      rotulo: `Pesca esportiva: ${p.pescadores} × ${p.diasPesca} diária${p.diasPesca > 1 ? "s" : ""}`,
      valor: p.pescadores * p.diasPesca * PESCA.preco,
    });
  return { linhas, total: linhas.reduce((s, l) => s + l.valor, 0), noites };
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
    `Olá! Quero solicitar uma reserva no ${HOTEL.nome}.`,
    "",
    `Solicitação: ${p.codigo}`,
    `Nome: ${p.nome}`,
    `Acomodação: ${ac?.nome ?? "-"}`,
    `Entrada: ${fmtData(p.entrada)} (a partir das ${HOTEL.checkin})`,
    `Saída: ${fmtData(p.saida)} (até ${HOTEL.checkout})`,
    `Hóspedes: ${hospedesTexto(p.adultos, p.criancas)}`,
    "",
    "Orçamento feito no site:",
    ...linhas.map((l) => `• ${l.rotulo} = ${brl(l.valor)}`),
    `Total estimado: ${brl(total)}`,
  ];
  if (p.obs) partes.push("", `Observações: ${p.obs}`);
  partes.push("", "Aguardo a confirmação. Obrigado!");
  return partes.join("\n");
}

export const waLink = (texto: string) => `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(texto)}`;
