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
| `/` | Hero com foto em shader WebGL (água ondulando, reflexos dourados, parallax e onda que segue o cursor/toque) e barra de reserva, diferenciais, quartos e flats, experiências, galeria em carrossel, como chegar e dúvidas, chamada final e rodapé completo |
| `/acomodacoes` e `/acomodacoes/[slug]` | As três acomodações com fotos reais e a tabela oficial de diárias |
| `/pesca` | Pesca esportiva exclusiva para hóspedes: R$ 50 por pessoa/diária, 24 horas |
| `/reservar` | Orçamento em 3 passos (datas e hóspedes, acomodação e pesca, seus dados) com resumo ao vivo e envio por WhatsApp |

## Identidade visual

Cores, logo e tipografia seguem o manual da marca: verde `#364339`, creme `#d6cdac`, sálvia `#70826a` e dourado `#c8b28a`. Os tokens ficam em `app/globals.css`; o logo oficial em `public/marca/`. Títulos usam o estilo do manual (caixa alta fina com o "X" traçado sobre uma letra), em `components/TituloMarca.tsx`.

## Animações e desempenho

- `components/ShaderFoto.tsx`: shader WebGL leve (sem bibliotecas 3D) aplicado às fotos do hero e da chamada final. Pausa fora da tela, usa resolução menor no celular e volta para a foto estática quando não há WebGL, com economia de dados ou com "reduzir movimento" ligado.
- Parallax pela rolagem nas fotos dos cartões e no texto do hero (`Parallax` em `components/Motion.tsx`).

## Dados oficiais

Preços, inclusos e regras estão em `lib/data.ts` (tabela do hotel, nov/2026):

- Executivo: individual R$ 220, duplo R$ 330, triplo R$ 430.
- Deluxe Flat: R$ 420 o casal + R$ 120 por pessoa adicional.
- Deluxe Flat com Banheira: R$ 500 o casal + R$ 150 por pessoa adicional.
- Pesca esportiva: R$ 50 por pessoa/diária, 24 horas, só para hóspedes.
- Incluso: café da manhã e piscinas aquecidas. Restaurante pago à parte. Sem bebidas externas.

Ainda a confirmar com o hotel: capacidade máxima dos flats (o site usa 4), se criança paga como pessoa adicional (o site considera que sim), prazo de expiração da solicitação (24h) e o número oficial de WhatsApp (`NEXT_PUBLIC_WHATSAPP` no `.env.local`).

## Próximos passos

1. Validar os pontos acima na visita de 05/12/2026.
2. API NestJS para gravar as solicitações (estado `PENDING`) e checar disponibilidade real.
3. Painel administrativo, analytics (GA4/PostHog) e pagamento.
