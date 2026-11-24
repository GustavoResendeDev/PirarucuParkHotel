# Pirarucu Park Hotel — site

Site público do Pirarucu Park Hotel (Itapuranga, GO): apresentação do hotel e do pesqueiro, consulta de valores, orçamento de hospedagem e de day use, e solicitação de reserva enviada pelo WhatsApp com a mensagem preenchida.

Segue a proposta do documento *Projeto de Sistema Web Hoteleiro e Pesqueiro*: Next.js + React + TypeScript + Tailwind CSS + Motion. Esta é a parte `web` do monorepo previsto; a API (NestJS + PostgreSQL) entra numa próxima etapa.

## Rodar no computador

Requer Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env.local   # opcional: troca o WhatsApp do hotel
npm run dev                  # abre em http://localhost:3000
```

Versão de produção: `npm run build` gera o site estático em `out/`. Todo push na `main` publica no GitHub Pages (`.github/workflows/pages.yml`).

## Páginas

| Rota | O que tem |
| --- | --- |
| `/` | Hero com foto em shader WebGL (água ondulando, reflexos dourados, parallax e onda que segue o cursor/toque) e barra de reserva, diferenciais, quartos e flats, experiências, galeria em carrossel, como chegar e dúvidas, chamada final e rodapé completo |
| `/acomodacoes` e `/acomodacoes/[slug]` | As três acomodações com fotos reais e a tabela oficial de diárias |
| `/pesca` | Pesca esportiva exclusiva para hóspedes (R$ 50 por pessoa/diária, 24 horas), regras e iscas permitidas, link para o Recanto do Pirarucu |
| `/reservar` | Orçamento em 3 passos (datas e hóspedes, acomodação e pesca, seus dados) com resumo ao vivo, sinal de 50% e envio por WhatsApp. Abaixo, orçamento de day use nas piscinas |

## Identidade visual

Cores, logo e tipografia seguem o manual da marca: verde `#364339`, creme `#d6cdac`, sálvia `#70826a` e dourado `#c8b28a`. Os tokens ficam em `app/globals.css`; o logo oficial em `public/marca/`. Títulos usam o estilo do manual (caixa alta fina com o "X" traçado sobre uma letra), em `components/TituloMarca.tsx`.

## Animações e desempenho

- `components/ShaderFoto.tsx`: shader WebGL leve (sem bibliotecas 3D) aplicado às fotos do hero e da chamada final. Pausa fora da tela, usa resolução menor no celular e volta para a foto estática quando não há WebGL, com economia de dados ou com "reduzir movimento" ligado.
- `components/VideoDrone.tsx`: seção "Visto do alto" na home com as imagens de drone em loop, sem som (`public/video/drone-loop.mp4`, 27 s, 1,6 MB), que só toca quando aparece na tela. O botão abre o vídeo completo com som (`public/video/tour-completo.mp4`, 1 min, 4,8 MB), carregado só no clique. Com "reduzir movimento" ou economia de dados fica só a capa.
- Parallax pela rolagem nas fotos dos cartões e no texto do hero (`Parallax` em `components/Motion.tsx`).

## Dados oficiais

Preços em `lib/data.ts` (tabela do hotel, nov/2026). Regras e capacidades do questionário respondido pela gerente em 24/11/2026:

- Executivo (18 quartos): individual R$ 220, duplo R$ 330, triplo R$ 430, e 4ª pessoa com cama extra de R$ 100.
- Deluxe Flat (3) e Deluxe Flat com Banheira (3): até 4 pessoas, R$ 420 + R$ 120 e R$ 500 + R$ 150 por pessoa adicional.
- Crianças até 7 anos não pagam (o orçamento pede a idade de cada criança).
- Sinal de 50% garante a reserva. Mínimo de 2 diárias em feriados (lista em `FERIADOS`).
- Pesca: R$ 50 por pessoa/diária, 24 horas, pesque e solte, só para hóspedes. Day use nas piscinas: R$ 30 por pessoa.
- WhatsApp oficial: (62) 99622-6450. Também pode vir de `NEXT_PUBLIC_WHATSAPP`.

Ainda a confirmar na visita de 05/12/2026: se a cama extra é por diária, se crianças grátis contam na capacidade do quarto, feriados locais e datas de alta temporada, e o prazo para pagar o sinal.

## Próximos passos

1. Validar os pontos acima na visita de 05/12/2026.
2. API NestJS para gravar as solicitações (estado `PENDING`) e checar disponibilidade real.
3. Painel administrativo, analytics (GA4/PostHog) e pagamento.
