# Pirarucu Park Hotel — site

Site público do Pirarucu Park Hotel (Itapuranga, GO): apresentação do hotel e do pesqueiro, consulta de valores, orçamento de hospedagem e de day use, e solicitação de reserva enviada pelo WhatsApp com a mensagem preenchida.

Segue a proposta do documento *Projeto de Sistema Web Hoteleiro e Pesqueiro*: Next.js + React + TypeScript + Tailwind CSS + Motion. Esta é a parte `web` do monorepo previsto; a API (NestJS + PostgreSQL) entra numa próxima etapa.

## Rodar no computador

Requer Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env.local   # coloque o WhatsApp oficial do hotel
npm run dev                  # abre em http://localhost:3000
```

Versão de produção: `npm run build` gera o site estático em `out/`. Todo push na `main` publica no GitHub Pages (`.github/workflows/pages.yml`).

## Páginas

| Rota | O que tem |
| --- | --- |
| `/` | Hero 3D (lago ao pôr do sol com pirarucu saltando), experiências, acomodações em rolagem horizontal, pesqueiro, galeria, chamada de orçamento, mapa e dúvidas |
| `/acomodacoes` e `/acomodacoes/[slug]` | Catálogo e detalhe de cada acomodação, com diária e comodidades |
| `/pesqueiro` | Recanto do Pirarucu: regras, valores de pesca e day use |
| `/reservar` | Orçamento em etapas (datas, acomodação, pesca, dados) com resumo ao vivo e envio por WhatsApp. `?tipo=dayuse` abre o orçamento só do pesqueiro |

## Movimento e 3D

- Cena 3D feita com Three.js / React Three Fiber, sem modelos externos (água com shader, céu, mata, pirarucu com ondulação e respingos). Pausa quando sai da tela e fica estática para quem prefere menos movimento.
- Scroll suave (Lenis), títulos revelados palavra por palavra, texto que acende com a rolagem, cartões empilhados, parallax, botões magnéticos, contadores e abertura com o peixe do logo sendo desenhado.

## O que ainda é exemplo

Tudo o que é suposição está marcado no site com o selo **exemplo** e concentrado em `lib/data.ts`:

- Preços das diárias, da pesca e do day use.
- Acomodações "Standard" e "Família" (as categorias "Executivo" e "Suíte Master" aparecem no Instagram do hotel), capacidades, áreas e quantidade de unidades.
- WhatsApp, e-mail, horários de check-in/out, prazo de expiração da solicitação, regras do pesqueiro e endereço exato.
- Logo: releitura em SVG (`components/Logo.tsx`). Trocar pelo arquivo oficial.

Confirmados pelo Instagram: Itapuranga (GO), 164 km de Goiânia, pesca esportiva + piscina + hospedagem, complexo com o Recanto do Pirarucu, pesqueiro aberto de terça a domingo e feriados.

## Fotos

Coloque as fotos em `public/fotos/` com estes nomes (JPG, de preferência 2000 px de largura). Enquanto um arquivo não existir, o site mostra uma arte em degradê no lugar.

```
standard-1.jpg  standard-2.jpg      executivo-1.jpg   executivo-2.jpg
suite-master-1.jpg suite-master-2.jpg familia-1.jpg   familia-2.jpg
pesca.jpg  piscina.jpg  gastronomia.jpg  pesqueiro.jpg  pesqueiro-hero.jpg  pescador.jpg
galeria-1.jpg … galeria-6.jpg
```

## Próximos passos

1. Validar dados na visita de 05/12/2026 e atualizar `lib/data.ts`.
2. API NestJS para gravar as solicitações (estado `PENDING`) e checar disponibilidade real.
3. Painel administrativo, analytics (GA4/PostHog) e pagamento.
