import Link from "next/link";
import { Hero } from "@/components/Hero";
import { AcomodacoesHorizontal } from "@/components/AcomodacoesHorizontal";
import { Faq } from "@/components/Faq";
import { Foto } from "@/components/Foto";
import { Parallax, Reveal } from "@/components/Motion";
import { RevelarImagem } from "@/components/RevelarImagem";
import { TituloMarca } from "@/components/TituloMarca";
import { PalmeiraFachada } from "@/components/Ilustracao";
import { Padrao } from "@/components/Padrao";
import { Logo } from "@/components/Logo";
import { IconeCafe, IconePesca, IconePiscina, IconeRestaurante, IconeSemBebida } from "@/components/Icones";
import { HOTEL, PESCA } from "@/lib/data";
import { brl } from "@/lib/reserva";

const ESTRUTURA = [
  { Icone: IconeCafe, nome: "Café da manhã", detalhe: "Servido todas as manhãs.", status: "Incluso na diária" },
  { Icone: IconePiscina, nome: "Piscinas aquecidas", detalhe: "Acesso livre durante a estadia.", status: "Incluso na diária" },
  { Icone: IconePesca, nome: "Pesca esportiva", detalhe: `${brl(PESCA.preco)} por pessoa/diária, 24 horas.`, status: "Opcional, só hóspedes" },
  { Icone: IconeRestaurante, nome: "Restaurante", detalhe: "Almoço, petiscos e jantar.", status: "Pago à parte no local" },
];

const GALERIA = [
  { src: "/fotos/fachada-noite.webp", alt: "Entrada do hotel à noite, com a marquise iluminada e o logo na parede de pedra", classe: "md:col-span-2 md:row-span-2" },
  { src: "/fotos/recepcao.webp", alt: "Recepção com balcão de mármore verde e o pirarucu dourado na parede", classe: "md:row-span-2" },
  { src: "/fotos/peixe-janela.webp", alt: "Escultura do pirarucu em metal dourado numa abertura da parede de pedra", classe: "" },
  { src: "/fotos/logo-pedra-noite.webp", alt: "Logo do hotel iluminado na parede de pedra", classe: "" },
  { src: "/fotos/lago-noite.webp", alt: "O hotel visto do outro lado do lago, à noite", classe: "md:col-span-2" },
  { src: "/fotos/deluxe-banheira-003.webp", alt: "Banheira com vista para o lago ao entardecer", classe: "md:col-span-2" },
  { src: "/fotos/lobby.webp", alt: "Lobby com sofá curvo, jardim interno e escada", classe: "" },
  { src: "/fotos/executivo-triplo-000.webp", alt: "Quarto Executivo com o pôr do sol na janela", classe: "" },
  { src: "/fotos/lavabo.webp", alt: "Lavabo com cubas brancas e espelhos ovais", classe: "" },
  { src: "/fotos/entrada-luzes.webp", alt: "Pilares da entrada com linhas de luz", classe: "" },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* O hotel */}
      <section className="relative overflow-hidden bg-creme pt-28 md:pt-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <TituloMarca texto="O HOTEL" letra={3} className="text-[clamp(2.6rem,6vw,4.6rem)] text-salvia" corTraco="#efeadb" />
            <div className="mt-10 max-w-[34rem] space-y-5 text-lg leading-relaxed text-verde">
              <p>
                O Pirarucu Park Hotel nasceu em {HOTEL.cidade}, Goiás, com o compromisso de entregar excelência em hospedagem, a {HOTEL.distancia}.
              </p>
              <p>
                O nome vem do peixe que batiza o grupo Pirarucu e que é a alma do lugar. Aqui, o lago fica a poucos passos do quarto e a pesca esportiva funciona 24 horas para quem está hospedado.
              </p>
            </div>
            <Link href="/acomodacoes" className="pressionavel mt-10 inline-flex h-12 items-center rounded-full border border-verde px-7 text-[15px] text-verde hover:bg-verde hover:text-marfim">
              Conhecer as acomodações
            </Link>
          </div>
          <RevelarImagem className="relative aspect-[4/5] overflow-hidden lg:aspect-[5/6]">
            <Parallax className="absolute inset-0" distancia={50}>
              <Foto src="/fotos/fachada-lago.webp" alt="Fachada do hotel vista do lago, com a estrutura em X e a parede de pedra" className="size-full" />
            </Parallax>
          </RevelarImagem>
        </div>
        <PalmeiraFachada className="mt-16 block h-auto w-full max-w-none translate-y-1 md:mt-8" />
      </section>

      {/* Estrutura */}
      <section id="estrutura" className="scroll-mt-20 bg-areia py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <TituloMarca texto="ESTRUTURA" letra={4} className="text-[clamp(2.6rem,6vw,4.6rem)] text-salvia" />
            <p className="max-w-sm text-verde/80">O que está incluso na sua diária e o que você pode contratar à parte.</p>
          </div>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-verde/10 bg-verde/10 sm:grid-cols-2 lg:grid-cols-4">
            {ESTRUTURA.map(({ Icone, nome, detalhe, status }) => (
              <li key={nome} className="flex flex-col bg-areia-clara p-8">
                <Icone className="size-12 text-salvia" />
                <h3 className="font-display mt-8 text-2xl text-verde">{nome}</h3>
                <p className="mt-2 text-[15px] text-verde/75">{detalhe}</p>
                <p className={`mt-6 text-sm ${status.startsWith("Incluso") ? "text-verde" : "text-dourado-escuro"}`}>{status}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-verde/10 p-6 text-[15px] text-verde/80">
            <IconeSemBebida className="size-8 shrink-0 text-salvia" />
            <p>
              Não é permitida a entrada de bebidas externas; todas as bebidas devem ser adquiridas no hotel. Para trazer algo específico, como champanhe ou vinho, consulte a gerência antes.
            </p>
          </div>
        </div>
      </section>

      <AcomodacoesHorizontal />

      {/* Pesca */}
      <section className="relative overflow-hidden bg-verde py-28 text-marfim md:py-36">
        <Padrao cor="#c8b28a" opacidade={0.12} className="absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <TituloMarca texto="PESCA" letra={1} className="text-[clamp(2.6rem,6vw,4.6rem)] text-dourado" corTraco="#e9dfcb" />
            <p className="font-display mt-10 max-w-lg text-3xl leading-snug md:text-4xl">Pescar de madrugada, ao nascer do sol ou depois do jantar. O lago é seu durante toda a estadia.</p>
            <p className="mt-6 max-w-md text-marfim/75">
              A pesca esportiva é opcional e exclusiva para hóspedes, com direito a pescar 24 horas. Você inclui no orçamento e paga por pessoa, por diária.
            </p>
            <Link href="/pesca" className="pressionavel mt-10 inline-flex h-12 items-center rounded-full border border-dourado/60 px-7 text-[15px] hover:bg-dourado hover:text-verde-noite">
              Como funciona a pesca
            </Link>
          </div>
          <div className="flex flex-col items-center gap-6 rounded-[28px] border border-dourado/30 bg-verde-noite/40 p-10 text-center backdrop-blur md:p-14">
            <Logo somentePeixe className="w-48 md:w-60" />
            <p className="font-display text-7xl text-dourado-claro md:text-8xl">{brl(PESCA.preco)}</p>
            <p className="text-marfim/75">por pessoa, por diária · 24 horas</p>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="bg-areia py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <TituloMarca texto="AMBIENTES" letra={5} className="text-[clamp(2.6rem,6vw,4.6rem)] text-salvia" />
            <a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="text-[15px] text-verde underline decoration-dourado underline-offset-8 hover:decoration-2">
              Mais fotos no @pirarucuparkhotel
            </a>
          </div>
          <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[240px] md:grid-cols-4 md:gap-4">
            {GALERIA.map((g) => (
              <Reveal key={g.src} y={24} className={`group overflow-hidden rounded-2xl ${g.classe}`}>
                <Foto src={g.src} alt={g.alt} className="size-full transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Orçamento */}
      <section className="relative overflow-hidden bg-verde-escuro py-28 text-marfim md:py-36">
        <Padrao cor="#c8b28a" opacidade={0.18} className="absolute inset-y-0 right-0 w-1/3" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05]">Monte seu orçamento e envie direto para o nosso WhatsApp.</h2>
          <p className="mt-6 max-w-xl text-marfim/75">Escolha as datas, a acomodação e quantas pessoas vão pescar. O valor aparece na hora, sem cadastro.</p>
          <Link href="/reservar" className="pressionavel mt-10 inline-flex h-14 items-center rounded-full bg-dourado px-9 text-[15px] font-medium text-verde-noite hover:bg-dourado-claro">
            Fazer orçamento
          </Link>
        </div>
      </section>

      {/* Localização + dúvidas */}
      <section id="localizacao" className="scroll-mt-20 bg-areia py-28 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <TituloMarca texto="COMO CHEGAR" letra={6} className="text-[clamp(2.2rem,5vw,3.8rem)] text-salvia" />
            <p className="mt-8 max-w-md text-lg text-verde">{HOTEL.cidade}, Goiás, a {HOTEL.distancia}.</p>
            <div className="mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-verde/10 bg-creme">
              <iframe
                title={`Mapa de ${HOTEL.cidade}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapsQuery)}&output=embed`}
                className="size-full grayscale-[.5] sepia-[.2]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div>
            <TituloMarca texto="DÚVIDAS" letra={3} className="text-[clamp(2.2rem,5vw,3.8rem)] text-salvia" />
            <div className="mt-8">
              <Faq />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
