/**
 * DADOS DO SITE
 * ----------------------------------------------------------------------------
 * Preços, inclusos, regras e horários: tabela oficial do hotel (nov/2026).
 * Regras e capacidades: questionário respondido pela gerente em 24/11/2026.
 * Itens marcados como "a confirmar" ainda precisam de confirmação do hotel.
 */

export const HOTEL = {
  nome: "Pirarucu Park Hotel",
  cidade: "Itapuranga",
  uf: "GO",
  distancia: "164 km de Goiânia",
  endereco: "Fazenda Margem Esquerda do Rio Canastra",
  email: "pirarucuparkhotel@gmail.com",
  instagramUsuario: "@pirarucuparkhotel",
  instagramHotel: "https://www.instagram.com/pirarucuparkhotel/",
  instagramPesqueiro: "https://www.instagram.com/clubedepescarecantodopirarucu/",
  // WhatsApp oficial de reservas: (62) 99622-6450. Pode ser trocado por NEXT_PUBLIC_WHATSAPP.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5562996226450",
  whatsappExibicao: "(62) 99622-6450",
  checkin: "14h",
  checkout: "12h",
  cafe: "7h às 9h30",
  restaurante: "Terça a domingo",
  piscinas: "24 horas",
  sinalPercentual: 50,
  idadeCriancaGratis: 7, // crianças até 7 anos não pagam
  minimoDiariasFeriado: 2,
  mapsQuery: "Pirarucu Park Hotel, Itapuranga, GO",
};

/**
 * Feriados nacionais em que vale o mínimo de diárias.
 * A confirmar com o hotel: feriados locais e datas de alta temporada.
 */
export const FERIADOS: Record<string, string> = {
  "2026-12-25": "Natal",
  "2027-01-01": "Ano Novo",
  "2027-02-08": "Carnaval",
  "2027-02-09": "Carnaval",
  "2027-03-26": "Sexta-feira Santa",
  "2027-04-21": "Tiradentes",
  "2027-05-01": "Dia do Trabalho",
  "2027-05-27": "Corpus Christi",
  "2027-09-07": "Independência",
  "2027-10-12": "Nossa Senhora Aparecida",
  "2027-11-02": "Finados",
  "2027-11-15": "Proclamação da República",
  "2027-11-20": "Consciência Negra",
  "2027-12-25": "Natal",
  "2028-01-01": "Ano Novo",
};

/** Como a diária é calculada. */
export type Tarifa =
  | { tipo: "por-ocupacao"; valores: Record<number, number>; camaExtra?: number } // preço fechado por nº de pessoas + cama extra
  | { tipo: "casal-mais-adicional"; casal: number; adicional: number }; // 2 pessoas + adicional por pessoa

export type Acomodacao = {
  slug: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  capacidade: number;
  camas: string[];
  comodidades: string[];
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
      "Quarto confortável e silencioso com vista para o lago, na medida para quem vem pescar ou passar poucos dias. Você paga pela ocupação, e cabe uma quarta pessoa com cama extra.",
    capacidade: 4,
    tarifa: { tipo: "por-ocupacao", valores: { 1: 220, 2: 330, 3: 430 }, camaExtra: 100 },
    camas: ["Individual: cama de casal ou de solteiro", "Duplo: 2 camas de solteiro", "Triplo: 1 casal + 1 solteiro, ou 3 de solteiro", "4ª pessoa: cama extra"],
    comodidades: ["Ar-condicionado", "TV", "Frigobar", "Wi-Fi", "Varanda", "Vista para o lago"],
    destaques: ["Vista para o lago", "Café da manhã incluso", "Até 4 pessoas"],
    fotos: ["/fotos/executivo-casal-000.webp", "/fotos/executivo-triplo-000.webp", "/fotos/executivo-triplo-003.webp", "/fotos/executivo-casal-003.webp", "/fotos/executivo-casal-004.webp", "/fotos/executivo-casal-005.webp"],
    paleta: ["#56664f", "#222c25"],
  },
  {
    slug: "deluxe",
    nome: "Deluxe Flat",
    subtitulo: "Sala e quarto",
    descricao:
      "Flat com sala e quarto separados e vista para o lago, mais espaço para a família ou para quem quer ficar mais dias. Diária para o casal, com valor por pessoa adicional.",
    capacidade: 4,
    tarifa: { tipo: "casal-mais-adicional", casal: 420, adicional: 120 },
    camas: ["Quarto: 1 cama de casal + 1 de solteiro", "Sala: 1 sofá-cama de casal"],
    comodidades: ["Ar-condicionado", "TV", "Frigobar", "Wi-Fi", "Varanda", "Sala separada", "Balcão com pia", "Vista para o lago"],
    destaques: ["Sala e quarto", "Vista para o lago", "Até 4 pessoas"],
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
    tarifa: { tipo: "casal-mais-adicional", casal: 500, adicional: 150 },
    camas: ["Quarto: 1 cama de casal + 1 de solteiro", "Sala: 1 sofá-cama de casal"],
    comodidades: ["Banheira", "Ar-condicionado", "TV", "Frigobar", "Wi-Fi", "Varanda", "Sala separada", "Balcão com pia", "Vista para o lago"],
    destaques: ["Banheira", "Sala e quarto", "Vista para o lago", "Até 4 pessoas"],
    fotos: ["/fotos/deluxe-banheira-004.webp", "/fotos/deluxe-banheira-003.webp", "/fotos/deluxe-banheira-000.webp", "/fotos/deluxe-banheira-006.webp", "/fotos/deluxe-banheira-007.webp"],
    paleta: ["#70826a", "#1f2a22"],
  },
];

export const PESCA = {
  preco: 50,
  descricao: "Pesque e solte, 24 horas, exclusivo para hóspedes.",
};

export const DAY_USE = {
  preco: 30,
  descricao: "Para quem não está hospedado: um dia na área das piscinas.",
};

export const REGRAS_PESCA = {
  iscasPermitidas: ["Guelra e cabeça de tilápia", "Tilapinhas vivas (pegas no barranco)", "Salsicha", "Massas", "Ração para ceva"],
  iscasProibidas: ["Couro de frango", "Sebo", "Lesma"],
  equipamentosProibidos: ["Linha multifilamento", "Anzol com fisga"],
  avisos: [
    "Todo peixe é devolvido ao lago: aqui a pesca é pesque e solte.",
    "Você pode trazer as suas iscas, dentro das permitidas.",
    "Para manusear e soltar o pirarucu, chame a equipe no quiosque da pesca.",
    "O hotel não empresta nem aluga vara, isca ou equipamento. Traga o seu.",
    "O hotel não se responsabiliza por perdas ou equipamentos esquecidos nos quiosques e demais áreas.",
  ],
};

export const INCLUSOS = ["Café da manhã (7h às 9h30)", "Piscinas aquecidas, abertas 24 horas", "Estacionamento", "Wi-Fi"];

export const OPCIONAIS = [
  { nome: "Pesca esportiva", detalhe: "R$ 50 por pessoa/diária, 24 horas, exclusiva para hóspedes" },
  { nome: "Restaurante", detalhe: "Almoço, petiscos e jantar, de terça a domingo, pagos à parte no local" },
];

export const REGRAS = [
  "Check-in a partir das 14h e check-out até as 12h. Entrada antes ou saída depois sem custo, se houver vaga.",
  "A reserva é garantida com o pagamento de 50% do valor como sinal.",
  "Em feriados e alta temporada, o mínimo é de 2 diárias.",
  "Crianças até 7 anos não pagam.",
  "Não aceitamos animais de estimação.",
  "Visitas podem ficar até 15 minutos. Depois disso, é cobrada a taxa de hóspede adicional.",
  "Não é permitida a entrada de bebidas externas. Para trazer champanhe ou vinho, peça autorização à gerência antes.",
  "Cancelou? O valor pago vira crédito para usar em até 3 meses, exceto em feriados.",
  "A data da reserva pode ser alterada sem custo.",
];

export const FAQ = [
  {
    p: "Quando a minha reserva fica garantida?",
    r: `Quando o sinal de ${HOTEL.sinalPercentual}% é pago. Você envia a solicitação pelo site, nossa equipe confirma a disponibilidade pelo WhatsApp e passa os dados para o pagamento do sinal. Aceitamos PIX, transferência, dinheiro, débito e crédito à vista.`,
  },
  { p: "Criança paga?", r: `Crianças até ${HOTEL.idadeCriancaGratis} anos não pagam. A partir de 8 anos, contam como pessoa na diária.` },
  { p: "O que está incluso na diária?", r: "Café da manhã, das 7h às 9h30, piscinas aquecidas abertas 24 horas, estacionamento e Wi-Fi." },
  { p: "A pesca está inclusa?", r: "Não. A pesca esportiva é opcional: R$ 50 por pessoa por diária, com direito a pescar 24 horas, no sistema pesque e solte. É exclusiva para hóspedes, e o hotel não aluga equipamento." },
  { p: "Quem não está hospedado pode passar o dia?", r: "Sim. O day use na área das piscinas custa R$ 30 por pessoa. A pesca continua exclusiva para hóspedes." },
  { p: "E se eu precisar cancelar ou mudar a data?", r: "A mudança de data é sem custo. Se cancelar, o valor pago vira crédito para usar em até 3 meses, exceto em feriados." },
  { p: "Posso levar bebidas ou meu pet?", r: "Não é permitida a entrada de bebidas externas. Para trazer champanhe ou vinho, peça autorização à gerência antes. Não aceitamos animais de estimação." },
  { p: "O hotel tem acessibilidade?", r: "Sim. Temos elevador e banheiro adaptado para pessoas com deficiência ou mobilidade reduzida." },
  { p: "E as refeições?", r: "O café da manhã está incluso. O restaurante abre de terça a domingo, para hóspedes e visitantes, com almoço, petiscos e jantar pagos à parte." },
  { p: "Quais os horários?", r: `Check-in a partir das ${HOTEL.checkin} e check-out até as ${HOTEL.checkout}. Se houver vaga, você pode entrar antes ou sair depois sem custo.` },
];
