/**
 * DADOS DO SITE
 * ----------------------------------------------------------------------------
 * Tudo marcado com `exemplo: true` (ou comentado como EXEMPLO) é suposição
 * feita antes da visita de 05/12/2026 e deve ser trocado pelos dados reais.
 * Fontes já confirmadas: perfil @pirarucuparkhotel e @clubedepescarecantodopirarucu.
 */

export const HOTEL = {
  nome: "Pirarucu Park Hotel",
  cidade: "Itapuranga",
  uf: "GO",
  distancia: "164 km de Goiânia", // fonte: bio do Instagram
  slogan: "Pesca esportiva, piscina e hospedagem", // fonte: bio do Instagram
  instagramHotel: "https://www.instagram.com/pirarucuparkhotel/",
  instagramPesqueiro: "https://www.instagram.com/clubedepescarecantodopirarucu/",
  // EXEMPLO: trocar pelo número oficial em .env.local (NEXT_PUBLIC_WHATSAPP)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5500000000000",
  email: "contato@exemplo.com.br", // EXEMPLO
  checkin: "14h", // EXEMPLO
  checkout: "12h", // EXEMPLO
  pesqueiroFuncionamento: "Terça a domingo e feriados", // fonte: bio do Instagram do pesqueiro
  expiracaoSolicitacaoHoras: 24, // EXEMPLO
  mapsQuery: "Itapuranga, GO",
};

export type Acomodacao = {
  slug: string;
  nome: string;
  chamada: string;
  descricao: string;
  capacidade: number;
  unidades: number;
  area: string;
  diaria: number;
  diariaFimDeSemana: number;
  comodidades: string[];
  fotos: string[]; // caminhos em /public/fotos (ver README)
  paleta: [string, string];
  fonteNome: "instagram" | "suposicao";
  exemplo: true;
};

export const ACOMODACOES: Acomodacao[] = [
  {
    slug: "standard",
    nome: "Standard",
    chamada: "Prático para quem vem pescar",
    descricao:
      "Quarto confortável e silencioso para descansar depois de um dia inteiro no lago. Tudo o que importa, sem excessos.",
    capacidade: 2,
    unidades: 6,
    area: "18 m²",
    diaria: 280,
    diariaFimDeSemana: 340,
    comodidades: ["Cama de casal", "Ar-condicionado", "Smart TV", "Frigobar", "Wi-Fi", "Café da manhã"],
    fotos: ["/fotos/standard-1.jpg", "/fotos/standard-2.jpg"],
    paleta: ["#5d6b55", "#2e3a2c"],
    fonteNome: "suposicao",
    exemplo: true,
  },
  {
    slug: "executivo",
    nome: "Executivo",
    chamada: "Conforto de hotel urbano, vista para o verde",
    descricao:
      "Acabamento moderno, iluminação aconchegante e espaço extra para trabalhar ou relaxar. Ideal para casais e pequenos grupos.",
    capacidade: 3,
    unidades: 5,
    area: "24 m²",
    diaria: 360,
    diariaFimDeSemana: 430,
    comodidades: ["Casal + solteiro", "Ar-condicionado", "Smart TV", "Frigobar", "Mesa de trabalho", "Wi-Fi", "Café da manhã"],
    fotos: ["/fotos/executivo-1.jpg", "/fotos/executivo-2.jpg"],
    paleta: ["#b89f72", "#5b4a2e"],
    fonteNome: "instagram",
    exemplo: true,
  },
  {
    slug: "suite-master",
    nome: "Suíte Master",
    chamada: "A melhor vista do lago",
    descricao:
      "Nossa suíte mais completa: cama king, ambiente amplo e varanda para ver o sol se pôr sobre a água. Feita para ocasiões especiais.",
    capacidade: 4,
    unidades: 3,
    area: "36 m²",
    diaria: 520,
    diariaFimDeSemana: 620,
    comodidades: ["Cama king + sofá-cama", "Varanda", "Vista do lago", "Ar-condicionado", "Smart TV 55\"", "Frigobar", "Café da manhã"],
    fotos: ["/fotos/suite-master-1.jpg", "/fotos/suite-master-2.jpg"],
    paleta: ["#3f5a5c", "#1b2b2d"],
    fonteNome: "instagram",
    exemplo: true,
  },
  {
    slug: "familia",
    nome: "Família",
    chamada: "Espaço para a turma toda",
    descricao:
      "Dois ambientes integrados para famílias e grupos de pescadores que querem ficar juntos, com espaço para guardar o equipamento.",
    capacidade: 6,
    unidades: 2,
    area: "48 m²",
    diaria: 690,
    diariaFimDeSemana: 820,
    comodidades: ["2 ambientes", "Casal + 4 solteiro", "Ar-condicionado", "Smart TV", "Frigobar", "Espaço para equipamentos", "Café da manhã"],
    fotos: ["/fotos/familia-1.jpg", "/fotos/familia-2.jpg"],
    paleta: ["#8a5a3c", "#3b2416"],
    fonteNome: "suposicao",
    exemplo: true,
  },
];

/** Serviços do pesqueiro (Recanto do Pirarucu). Preços: EXEMPLO. */
export type ServicoPesca = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  unidade: "pessoa/dia" | "pessoa" | "kg";
  paraHospede: boolean;
  exemplo: true;
};

export const SERVICOS_PESCA: ServicoPesca[] = [
  {
    id: "pesque-solte",
    nome: "Pesca esportiva (pesque e solte)",
    descricao: "Acesso aos lagos de pesca esportiva durante o dia, com regras de manejo do peixe.",
    preco: 80,
    unidade: "pessoa/dia",
    paraHospede: true,
    exemplo: true,
  },
  {
    id: "day-use",
    nome: "Day use lazer (sem pesca)",
    descricao: "Piscina, áreas de convivência e restaurante para acompanhantes que não pescam.",
    preco: 40,
    unidade: "pessoa/dia",
    paraHospede: false,
    exemplo: true,
  },
];

export const EXPERIENCIAS = [
  {
    titulo: "Pesca esportiva",
    texto: "Lagos com pirarucus, tambaquis e outras espécies de grande porte. Para o pescador experiente e para quem vai fisgar o primeiro peixe.",
    icone: "pesca",
  },
  {
    titulo: "Piscina e lazer",
    texto: "Dias de sol à beira da piscina enquanto a turma pesca. Lazer para a família inteira, sem sair do complexo.",
    icone: "piscina",
  },
  {
    titulo: "Gastronomia",
    texto: "Café da manhã caprichado e o restaurante do Recanto do Pirarucu, com pratos regionais e drinks.",
    icone: "gastronomia",
  },
] as const;

export const NUMEROS = [
  { valor: 164, sufixo: " km", rotulo: "de Goiânia" },
  { valor: 43, sufixo: " mil", rotulo: "seguidores no Instagram" },
  { valor: 6, sufixo: " dias", rotulo: "de pesqueiro aberto por semana" },
  { valor: 16, sufixo: "", rotulo: "acomodações (exemplo)" },
];

export const FAQ = [
  {
    p: "A reserva fica garantida quando eu envio a solicitação?",
    r: `Ainda não. Você envia a solicitação pelo site e nossa equipe confirma a disponibilidade e a forma de pagamento pelo WhatsApp. Sem confirmação em até ${HOTEL.expiracaoSolicitacaoHoras}h, a solicitação expira.`,
  },
  { p: "Quais os horários de check-in e check-out?", r: `Check-in a partir das ${HOTEL.checkin} e check-out até as ${HOTEL.checkout}.` },
  { p: "A pesca está inclusa na diária?", r: "A pesca esportiva é cobrada à parte e pode ser adicionada ao seu orçamento na hora da reserva." },
  { p: "Quem não hospeda pode usar o pesqueiro?", r: `Sim. O Recanto do Pirarucu funciona ${HOTEL.pesqueiroFuncionamento.toLowerCase()} e recebe visitantes de day use.` },
  { p: "Crianças pagam?", r: "Crianças contam na capacidade da acomodação. A política de cobrança para crianças será confirmada pela equipe." },
  { p: "Aceitam pets?", r: "Consulte a equipe pelo WhatsApp antes de reservar." },
];
