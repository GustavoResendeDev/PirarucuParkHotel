/**
 * DADOS DO SITE
 * ----------------------------------------------------------------------------
 * Preços, inclusos, regras e horários: tabela oficial do hotel (nov/2026).
 * Itens marcados com `suposicao` ainda precisam de confirmação do hotel.
 */

export const HOTEL = {
  nome: "Pirarucu Park Hotel",
  cidade: "Itapuranga",
  uf: "GO",
  distancia: "164 km de Goiânia",
  instagramHotel: "https://www.instagram.com/pirarucuparkhotel/",
  instagramPesqueiro: "https://www.instagram.com/clubedepescarecantodopirarucu/",
  // Número oficial em .env.local (NEXT_PUBLIC_WHATSAPP). Ainda não informado.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5500000000000",
  checkin: "14h",
  checkout: "12h",
  pesqueiroFuncionamento: "Terça a domingo e feriados",
  expiracaoSolicitacaoHoras: 24, // suposição
  mapsQuery: "Itapuranga, GO",
};

/** Como a diária é calculada. */
export type Tarifa =
  | { tipo: "por-ocupacao"; valores: Record<number, number> } // preço fechado por nº de pessoas
  | { tipo: "casal-mais-adicional"; casal: number; adicional: number }; // 2 pessoas + adicional por pessoa

export type Acomodacao = {
  slug: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  capacidade: number;
  capacidadeSuposicao?: boolean;
  tarifa: Tarifa;
  destaques: string[];
  fotos: string[];
  paleta: [string, string];
};

export const ACOMODACOES: Acomodacao[] = [
  {
    slug: "executivo",
    nome: "Executivo",
    subtitulo: "Individual, duplo ou triplo",
    descricao:
      "Quarto confortável e silencioso, na medida para quem vem pescar ou passar poucos dias. Você paga pela ocupação: uma, duas ou três pessoas.",
    capacidade: 3,
    tarifa: { tipo: "por-ocupacao", valores: { 1: 220, 2: 330, 3: 430 } },
    destaques: ["Café da manhã incluso", "Piscinas aquecidas", "Até 3 pessoas"],
    fotos: ["/fotos/executivo-casal-000.webp", "/fotos/executivo-triplo-000.webp", "/fotos/executivo-triplo-003.webp", "/fotos/executivo-casal-003.webp", "/fotos/executivo-casal-004.webp", "/fotos/executivo-casal-005.webp"],
    paleta: ["#56664f", "#222c25"],
  },
  {
    slug: "deluxe",
    nome: "Deluxe Flat",
    subtitulo: "Sala e quarto",
    descricao:
      "Flat com sala e quarto separados, mais espaço para a família ou para quem quer ficar mais dias. Diária para o casal, com valor por pessoa adicional.",
    capacidade: 4,
    capacidadeSuposicao: true,
    tarifa: { tipo: "casal-mais-adicional", casal: 420, adicional: 120 },
    destaques: ["Sala e quarto", "Café da manhã incluso", "Piscinas aquecidas"],
    fotos: ["/fotos/deluxe-000.webp", "/fotos/deluxe-004.webp", "/fotos/deluxe-001.webp", "/fotos/deluxe-003.webp", "/fotos/deluxe-002.webp"],
    paleta: ["#9c8660", "#364339"],
  },
  {
    slug: "deluxe-banheira",
    nome: "Deluxe Flat com Banheira",
    subtitulo: "Sala, quarto e banheira",
    descricao:
      "Nosso flat mais completo: sala, quarto e banheira para relaxar depois de um dia no lago. Diária para o casal, com valor por pessoa adicional.",
    capacidade: 4,
    capacidadeSuposicao: true,
    tarifa: { tipo: "casal-mais-adicional", casal: 500, adicional: 150 },
    destaques: ["Banheira", "Sala e quarto", "Café da manhã incluso", "Piscinas aquecidas"],
    fotos: ["/fotos/deluxe-banheira-004.webp", "/fotos/deluxe-banheira-003.webp", "/fotos/deluxe-banheira-000.webp", "/fotos/deluxe-banheira-006.webp", "/fotos/deluxe-banheira-007.webp"],
    paleta: ["#70826a", "#1f2a22"],
  },
];

export const PESCA = {
  preco: 50,
  descricao: "Direito à pesca 24 horas, exclusivo para hóspedes.",
};

export const INCLUSOS = ["Café da manhã", "Acesso livre às piscinas aquecidas"];

export const OPCIONAIS = [
  { nome: "Pesca esportiva", detalhe: "R$ 50 por pessoa/diária, 24 horas, exclusiva para hóspedes" },
  { nome: "Restaurante", detalhe: "Almoço, petiscos e jantar, pagos à parte no local" },
];

export const REGRAS = [
  "Não é permitida a entrada de bebidas externas. Todas as bebidas devem ser adquiridas no hotel.",
  "Quer trazer uma bebida específica, como champanhe ou vinho? Consulte a gerência antes para autorização.",
  "Check-in a partir das 14h e check-out até as 12h.",
];

export const FAQ = [
  {
    p: "A reserva fica garantida quando eu envio a solicitação?",
    r: `Ainda não. Você envia a solicitação pelo site e nossa equipe confirma a disponibilidade e a forma de pagamento pelo WhatsApp. Sem confirmação em até ${HOTEL.expiracaoSolicitacaoHoras}h, a solicitação expira.`,
  },
  { p: "O que está incluso na diária?", r: "Café da manhã e acesso livre à área das piscinas aquecidas." },
  { p: "A pesca está inclusa?", r: "Não. A pesca esportiva é opcional: R$ 50 por pessoa por diária, com direito a pescar 24 horas. É exclusiva para hóspedes." },
  { p: "Posso levar bebidas?", r: "Não é permitida a entrada de bebidas externas. Para trazer algo específico, como champanhe ou vinho, consulte a gerência antes." },
  { p: "E as refeições?", r: "O café da manhã está incluso. Almoço, petiscos e jantar são servidos no restaurante e pagos à parte, no local." },
  { p: "Quais os horários?", r: `Check-in a partir das ${HOTEL.checkin} e check-out até as ${HOTEL.checkout}.` },
];
