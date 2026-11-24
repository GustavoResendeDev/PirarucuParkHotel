/** Fotos da galeria "Rolo do hotel": mesa de fotos, sequência em tela cheia e rolo completo. */

export type Grupo = "Chegada" | "Áreas comuns" | "Quartos" | "Café da manhã" | "Detalhes";
export type FotoGaleria = { src: string; alt: string; grupo: Grupo };

const f = (nome: string, alt: string, grupo: Grupo): FotoGaleria => ({ src: `/fotos/${nome}.webp`, alt, grupo });

/** Todas as fotos do hotel, na ordem do rolo completo. */
export const ROLO: FotoGaleria[] = [
  f("fachada-lago", "Fachada do hotel vista do lago, com palmeiras e varandas", "Chegada"),
  f("fachada-dia", "Entrada do hotel durante o dia, com a parede de pedra", "Chegada"),
  f("marquise-dia", "Marquise da entrada contra o céu azul", "Chegada"),
  f("fachada-noite", "Entrada do hotel à noite, com a marquise iluminada", "Chegada"),
  f("lateral-noite", "Lateral do hotel iluminada à noite", "Chegada"),
  f("colunas-noite", "Colunas da entrada com luz dourada à noite", "Chegada"),
  f("entrada-luzes", "Linhas de luz no teto da entrada", "Chegada"),
  f("lago-noite", "O hotel visto do outro lado do lago, à noite", "Chegada"),
  f("recepcao", "Recepção com balcão de mármore verde e o pirarucu dourado na parede", "Áreas comuns"),
  f("lobby", "Lobby com sofá curvo, jardim interno e escada", "Áreas comuns"),
  f("lounge-000", "Lounge do mezanino com sofás curvos e o corredor dos quartos ao fundo", "Áreas comuns"),
  f("lounge-001", "Lounge do mezanino com mesas e janelões para o verde", "Áreas comuns"),
  f("lounge-002", "Mezanino com guarda-corpo de vidro, sofá e mesas ao entardecer", "Áreas comuns"),
  f("lounge-003", "Mezanino com mesa de centro orgânica e painéis de madeira", "Áreas comuns"),
  f("lounge-004", "Sofá curvo branco diante da janela, com uma planta grande ao lado", "Áreas comuns"),
  f("lounge-005", "Mesa de centro de mármore verde e madeira no lounge", "Áreas comuns"),
  f("lavabo", "Lavabo com cubas brancas e espelho oval", "Áreas comuns"),
  f("executivo-triplo-por-do-sol", "Quarto Executivo com três camas e o pôr do sol entrando pela varanda", "Quartos"),
  f("executivo-triplo-lago", "Quarto Executivo com vista para o lago ao entardecer", "Quartos"),
  f("executivo-triplo-007", "Quarto Executivo com sol pela porta da varanda", "Quartos"),
  f("executivo-triplo-008", "Quarto Executivo com três camas e painel de madeira iluminado", "Quartos"),
  f("executivo-triplo-009", "Quarto Executivo visto de frente, com o pôr do sol na porta de vidro", "Quartos"),
  f("executivo-triplo-010", "Três camas de solteiro e a varanda para o lago", "Quartos"),
  f("executivo-triplo-000", "Quarto Executivo triplo com a luz do fim de tarde", "Quartos"),
  f("executivo-triplo-003", "Quarto Executivo com duas camas e luz do dia", "Quartos"),
  f("executivo-casal-000", "Quarto Executivo com cama de casal e cabeceira iluminada", "Quartos"),
  f("executivo-casal-006", "Cama de casal e cama de solteiro no Executivo", "Quartos"),
  f("executivo-casal-007", "Cama de casal com toalhas e arara iluminada", "Quartos"),
  f("executivo-casal-008", "Quarto Executivo com camas, TV e frigobar", "Quartos"),
  f("executivo-casal-003", "Bancada com TV e frigobar no Executivo", "Quartos"),
  f("executivo-casal-010", "Bancada verde-sálvia com TV, interfone e cadeira", "Quartos"),
  f("executivo-casal-004", "Arara aberta com cabides e luz de LED", "Quartos"),
  f("executivo-casal-005", "Banheiro com azulejo verde e parede amadeirada", "Quartos"),
  f("executivo-casal-009", "Banheiro com box de azulejo verde em espinha de peixe e espelho redondo", "Quartos"),
  f("executivo-triplo-006", "Banheiro do Executivo com box de vidro", "Quartos"),
  f("deluxe-000", "Quarto do Deluxe Flat com cama de casal", "Quartos"),
  f("deluxe-001", "Quarto do Deluxe Flat visto da porta", "Quartos"),
  f("deluxe-004", "Sala do Deluxe Flat com sofá, estante e janela", "Quartos"),
  f("deluxe-005", "Sala do Deluxe Flat com sofá-cama e vista para o lago ao entardecer", "Quartos"),
  f("deluxe-003", "Canto do Deluxe Flat com azulejo verde e mesa redonda", "Quartos"),
  f("deluxe-002", "Armário com roupões e toalhas", "Quartos"),
  f("deluxe-banheira-008", "Flat com banheira: cama de casal e banheira diante da janela para o lago", "Quartos"),
  f("deluxe-banheira-009", "Banheira de hidromassagem com o pôr do sol na janela", "Quartos"),
  f("deluxe-banheira-010", "Cama com balde de espumante e a banheira ao fundo", "Quartos"),
  f("deluxe-banheira-011", "Quarto com banheira visto da cabeceira", "Quartos"),
  f("deluxe-banheira-003", "Banheira com vista para o lago ao entardecer", "Quartos"),
  f("deluxe-banheira-004", "Banheira junto à janela no fim do dia", "Quartos"),
  f("deluxe-banheira-000", "Quarto do flat com banheira e janela para o lago", "Quartos"),
  f("deluxe-banheira-006", "Armário com roupões no flat com banheira", "Quartos"),
  f("deluxe-banheira-007", "Banheiro do flat com banheira", "Quartos"),
  f("cafe-001", "Melancia, mamão e melão no buffet do café da manhã", "Café da manhã"),
  f("cafe-000", "Pães de coco, sucos e café no buffet da manhã", "Café da manhã"),
  f("cafe-002", "Bolo de chocolate, pães de queijo e mini sanduíches", "Café da manhã"),
  f("cafe-003", "Abacaxi e mamão fatiados com o buffet ao fundo", "Café da manhã"),
  f("peixe-janela", "Escultura do pirarucu em metal dourado numa abertura da parede de pedra", "Detalhes"),
  f("peixe-fachada", "O pirarucu da marca em relevo na fachada", "Detalhes"),
  f("logo-pedra", "Logo do hotel na parede de pedra natural", "Detalhes"),
  f("logo-pedra-noite", "Logo do hotel iluminado na parede de pedra", "Detalhes"),
  f("bones", "Bonés verdes com o pirarucu e o nome do hotel bordados", "Detalhes"),
];

export const GRUPOS: Grupo[] = ["Chegada", "Áreas comuns", "Quartos", "Café da manhã", "Detalhes"];

const por = (nome: string) => {
  const x = ROLO.find((r) => r.src === `/fotos/${nome}.webp`);
  if (!x) throw new Error(`Foto da galeria não encontrada: ${nome}`);
  return x;
};

/**
 * Fotos espalhadas na mesa: centro x/y em % do palco, largura em unidades de --u
 * (1% do lado maior), inclinação em graus e profundidade para o parallax do ponteiro.
 * `alto` marca as que somem no celular para não cobrir o título.
 */
export const MESA = [
  { foto: por("lounge-004"), x: 11, y: 20, w: 9.4, r: 12, d: 0.6 },
  { foto: por("cafe-001"), x: 25, y: 9, w: 6.4, r: -4, d: 0.3 },
  { foto: por("recepcao"), x: 37.5, y: 18, w: 7.6, r: 14, d: 0.5 },
  { foto: por("peixe-janela"), x: 53, y: 11, w: 6.8, r: -9, d: 0.4 },
  { foto: por("executivo-triplo-por-do-sol"), x: 67, y: 20, w: 9.2, r: 6, d: 0.55 },
  { foto: por("cafe-000"), x: 82, y: 13, w: 7.4, r: 11, d: 0.5 },
  { foto: por("deluxe-banheira-008"), x: 29, y: 36, w: 7.6, r: -12, d: 0.7 },
  { foto: por("bones"), x: 93, y: 34, w: 7, r: 6, d: 0.6 },
  { foto: por("lounge-002"), x: 62, y: 42, w: 8.1, r: -11, d: 0.7, alto: true },
  { foto: por("deluxe-005"), x: 80, y: 50, w: 9.4, r: -15, d: 0.9, alto: true },
  { foto: por("logo-pedra-noite"), x: 68, y: 66, w: 9.6, r: 7, d: 0.8, alto: true },
  { foto: por("cafe-002"), x: 44, y: 53, w: 6.6, r: 9, d: 0.45, alto: true },
];

/** A foto em que a rolagem mergulha (a primeira da sequência). */
export const ALVO = { x: 46.6, y: 34, w: 7, r: -2 };

/** Sequência em tela cheia depois do mergulho, uma tela de rolagem por foto. */
export const SEQUENCIA = [
  { foto: por("fachada-lago"), titulo: "À beira do lago", texto: "Varandas, palmeiras e água a poucos passos do quarto." },
  { foto: por("recepcao"), titulo: "Chegada", texto: "Mármore verde e o pirarucu dourado, símbolo da casa." },
  { foto: por("lounge-000"), titulo: "Lounge do mezanino", texto: "Sofás curvos e janelões para ler, conversar ou ver o fim de tarde." },
  { foto: por("executivo-triplo-por-do-sol"), titulo: "Pôr do sol no quarto", texto: "O fim de tarde goiano entra pela porta da varanda." },
  { foto: por("deluxe-banheira-009"), titulo: "Banheira com vista", texto: "Hidromassagem diante da janela, com o lago lá fora." },
  { foto: por("cafe-001"), titulo: "Café da manhã", texto: "Frutas, pães, bolos e sucos, incluso em toda diária." },
];
