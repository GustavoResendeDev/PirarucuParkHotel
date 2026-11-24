import { ACOMODACOES, DAY_USE, FERIADOS, HOTEL, PESCA, type Acomodacao } from "./data";

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

/** Diária de um quarto com `pessoas` hóspedes, dos quais `pagantes` pagam (crianças até 7 anos não pagam). */
export function diaria(ac: Acomodacao, pessoas: number, pagantes = pessoas) {
  const t = ac.tarifa;
  if (t.tipo === "por-ocupacao") {
    const maxTabela = Math.max(...Object.keys(t.valores).map(Number));
    const base = t.valores[Math.min(Math.max(1, pagantes), maxTabela)];
    return base + (pessoas > maxTabela ? (t.camaExtra ?? 0) : 0);
  }
  return t.casal + Math.max(0, pagantes - 2) * t.adicional;
}

/** Valor da cama extra de um quarto com `pessoas` hóspedes (0 quando não precisa). */
export function camaExtra(ac: Acomodacao, pessoas: number) {
  const t = ac.tarifa;
  if (t.tipo !== "por-ocupacao" || !t.camaExtra) return 0;
  return pessoas > Math.max(...Object.keys(t.valores).map(Number)) ? t.camaExtra : 0;
}

/** Menor diária possível (para "a partir de"). */
export function aPartirDe(ac: Acomodacao) {
  return ac.tarifa.tipo === "por-ocupacao" ? Math.min(...Object.values(ac.tarifa.valores)) : ac.tarifa.casal;
}

/** Divide `n` em `partes` o mais equilibrado possível. */
function dividir(n: number, partes: number) {
  const base = Math.floor(n / partes);
  const resto = n % partes;
  return Array.from({ length: partes }, (_, i) => base + (i < resto ? 1 : 0));
}

/** Distribui as pessoas entre os quartos necessários, o mais equilibrado possível. */
export function distribuir(ac: Acomodacao, pessoas: number) {
  return dividir(pessoas, Math.max(1, Math.ceil(pessoas / ac.capacidade)));
}

/** Quartos de uma acomodação para o grupo: pessoas e pagantes em cada um. */
export function quartosDoGrupo(ac: Acomodacao, pessoas: number, pagantes: number) {
  const q = distribuir(ac, pessoas);
  const pag = dividir(pagantes, q.length);
  return q.map((n, i) => ({ pessoas: n, pagantes: Math.min(n, pag[i]) }));
}

export type Pedido = {
  entrada: string;
  saida: string;
  adultos: number;
  /** Idade de cada criança; -1 enquanto não informada. */
  idades: number[];
  acomodacao?: string;
  pescadores: number;
  diasPesca: number;
  nome: string;
  telefone: string;
  obs: string;
  codigo: string;
};

export const totalHospedes = (p: Pick<Pedido, "adultos" | "idades">) => p.adultos + p.idades.length;

/** Crianças até a idade gratuita não pagam; idade não informada conta como pagante. */
export const criancaGratis = (idade: number) => idade >= 0 && idade <= HOTEL.idadeCriancaGratis;
export const pagantes = (p: Pick<Pedido, "adultos" | "idades">) => p.adultos + p.idades.filter((i) => !criancaGratis(i)).length;

/** Feriados (do calendário do hotel) entre a entrada e a véspera da saída. */
export function feriadosNaEstadia(entrada: string, saida: string) {
  const r: string[] = [];
  for (let d = parseISO(entrada); toISO(d) < saida; d = addDias(d, 1)) {
    const nome = FERIADOS[toISO(d)];
    if (nome) r.push(`${nome} (${fmtData(toISO(d))})`);
  }
  return r;
}

export const valorSinal = (total: number) => Math.round((total * HOTEL.sinalPercentual) / 100);

export function calcular(p: Pedido) {
  const linhas: { rotulo: string; valor: number }[] = [];
  const noites = contarNoites(p.entrada, p.saida);
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  if (ac && noites > 0) {
    const quartos = quartosDoGrupo(ac, totalHospedes(p), pagantes(p));
    quartos.forEach((q, i) => {
      const extra = camaExtra(ac, q.pessoas);
      const d = diaria(ac, q.pessoas, q.pagantes) - extra;
      const nome = quartos.length > 1 ? `Quarto ${i + 1}` : ac.nome;
      const gratis = q.pessoas - q.pagantes;
      const quem = `${q.pessoas} pessoa${q.pessoas > 1 ? "s" : ""}${gratis ? ` (${gratis} criança${gratis > 1 ? "s" : ""} grátis)` : ""}`;
      linhas.push({ rotulo: `${nome}, ${quem}: ${noites} × ${brl(d)}`, valor: d * noites });
      if (extra) linhas.push({ rotulo: `${nome}, cama extra: ${noites} × ${brl(extra)}`, valor: extra * noites });
    });
  }
  if (p.pescadores > 0 && p.diasPesca > 0)
    linhas.push({
      rotulo: `Pesca esportiva: ${p.pescadores} × ${p.diasPesca} diária${p.diasPesca > 1 ? "s" : ""}`,
      valor: p.pescadores * p.diasPesca * PESCA.preco,
    });
  const total = linhas.reduce((s, l) => s + l.valor, 0);
  return { linhas, total, sinal: valorSinal(total), noites };
}

export function gerarCodigo() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "PPH-";
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

export function hospedesTexto(adultos: number, idades: number[]) {
  let t = `${adultos} adulto${adultos > 1 ? "s" : ""}`;
  const n = idades.length;
  if (n) {
    const conhecidas = idades.filter((i) => i >= 0);
    const anos = conhecidas.length === n ? ` (${conhecidas.map((i) => (i === 0 ? "menos de 1 ano" : `${i} ano${i > 1 ? "s" : ""}`)).join(", ")})` : "";
    t += ` e ${n} criança${n > 1 ? "s" : ""}${anos}`;
  }
  return t;
}

export function mensagemWhatsApp(p: Pedido) {
  const { linhas, total, sinal } = calcular(p);
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  const partes = [
    `Olá! Quero solicitar uma reserva no ${HOTEL.nome}.`,
    "",
    `Solicitação: ${p.codigo}`,
    `Nome: ${p.nome}`,
    `Acomodação: ${ac?.nome ?? "-"}`,
    `Entrada: ${fmtData(p.entrada)} (a partir das ${HOTEL.checkin})`,
    `Saída: ${fmtData(p.saida)} (até ${HOTEL.checkout})`,
    `Hóspedes: ${hospedesTexto(p.adultos, p.idades)}`,
    "",
    "Orçamento feito no site:",
    ...linhas.map((l) => `• ${l.rotulo} = ${brl(l.valor)}`),
    `Total estimado: ${brl(total)}`,
    `Sinal de ${HOTEL.sinalPercentual}% para garantir: ${brl(sinal)}`,
  ];
  if (p.obs) partes.push("", `Observações: ${p.obs}`);
  partes.push("", "Aguardo a confirmação da disponibilidade e os dados para o sinal. Obrigado!");
  return partes.join("\n");
}

export const waLink = (texto: string) => `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(texto)}`;

export function mensagemDayUse(data: string, pessoas: number) {
  return [
    `Olá! Quero fazer um day use na área das piscinas do ${HOTEL.nome}.`,
    "",
    `Data: ${fmtData(data)}`,
    `Pessoas: ${pessoas}`,
    `Valor estimado: ${pessoas} × ${brl(DAY_USE.preco)} = ${brl(pessoas * DAY_USE.preco)}`,
    "",
    "Pode confirmar se há vaga? Obrigado!",
  ].join("\n");
}
