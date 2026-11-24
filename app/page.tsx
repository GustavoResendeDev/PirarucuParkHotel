import Link from "next/link";
import { Hero } from "@/components/Hero";
import { AcomodacoesHorizontal } from "@/components/AcomodacoesHorizontal";
import { Experiencias } from "@/components/Experiencias";
import { Faq } from "@/components/Faq";
import { Foto } from "@/components/Foto";
import { Contador, Magnetic, Marquee, Parallax, Reveal, ScrollFillText, SplitText } from "@/components/Motion";
import { RevelarImagem } from "@/components/RevelarImagem";
import { HOTEL, NUMEROS } from "@/lib/data";

const GALERIA: { src: string; alt: string; paleta: [string, string]; classe: string }[] = [
  { src: "/fotos/galeria-1.jpg", alt: "Lago ao amanhecer", paleta: ["#5b7c78", "#1b2b2d"], classe: "md:col-span-2 md:row-span-2" },
  { src: "/fotos/galeria-2.jpg", alt: "Pescador com pirarucu", paleta: ["#8a6a3c", "#2e2414"], classe: "" },
  { src: "/fotos/galeria-3.jpg", alt: "Piscina", paleta: ["#6f9fb0", "#24414f"], classe: "" },
  { src: "/fotos/galeria-4.jpg", alt: "Quarto", paleta: ["#b89f72", "#5b4a2e"], classe: "md:row-span-2" },
  { src: "/fotos/galeria-5.jpg", alt: "Restaurante", paleta: ["#a0623d", "#3b2416"], classe: "md:row-span-2" },
  { src: "/fotos/galeria-6.jpg", alt: "Pôr do sol no lago", paleta: ["#c48d5e", "#2a3527"], classe: "col-span-2" },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="bg-oliva-950 py-6 text-creme/80">
        <Marquee itens={["Pesca esportiva", "Piscina", "Hospedagem", "Gastronomia regional", "Day use", "Pôr do sol no lago"]} className="font-display text-3xl italic md:text-5xl" />
      </div>

      {/* Manifesto + números */}
      <section className="bg-creme-claro py-28 md:py-44">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mb-10 text-xs font-bold tracking-[.3em] text-escama uppercase">O Pirarucu</p>
          <ScrollFillText
            className="font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.08] font-medium text-oliva-900"
            text="Um hotel pensado para quem ama a pesca e para quem só quer desacelerar. Acorde com a névoa sobre o lago, passe a tarde na piscina e termine o dia com o sol se pondo sobre a água."
          />
          <div className="mt-24 grid grid-cols-2 gap-y-12 border-t border-oliva-900/10 pt-12 md:grid-cols-4">
            {NUMEROS.map((n, i) => (
              <Reveal key={n.rotulo} delay={i * 0.08}>
                <Contador valor={n.valor} sufixo={n.sufixo} className="font-display block text-5xl text-oliva-900 md:text-6xl" />
                <p className="mt-2 text-sm text-oliva-600">{n.rotulo}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Experiencias />

      <AcomodacoesHorizontal />

      {/* Pesqueiro */}
      <section className="grao relative overflow-hidden bg-marinho py-28 text-creme md:py-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="mb-4 text-xs font-bold tracking-[.3em] text-champanhe uppercase">Recanto do Pirarucu</p>
            <SplitText text="O pesqueiro ao lado do seu quarto" className="font-display text-5xl leading-[0.95] font-medium md:text-7xl" />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md leading-relaxed text-creme/75">
                Pesca esportiva, comida boa e ambiente incrível, aberto {HOTEL.pesqueiroFuncionamento.toLowerCase()}. Hóspedes e visitantes de day use são bem-vindos.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Magnetic>
                  <Link href="/pesqueiro" className="inline-flex rounded-full bg-creme px-8 py-4 text-sm font-semibold text-marinho transition-colors hover:bg-white">
                    Conhecer o pesqueiro
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/reservar?tipo=dayuse" className="inline-flex rounded-full border border-creme/30 px-8 py-4 text-sm font-semibold transition-colors hover:bg-creme/10">
                    Orçamento de day use
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <RevelarImagem className="relative aspect-[4/5] overflow-hidden md:aspect-[5/4]">
            <Parallax className="absolute inset-0" distancia={60}>
              <Foto src="/fotos/pesqueiro.jpg" alt="Lago do pesqueiro" paleta={["#22345a", "#0b1222"]} rotulo="Pesqueiro" className="size-full" />
            </Parallax>
          </RevelarImagem>
        </div>
      </section>

      {/* Galeria */}
      <section className="bg-creme-claro py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <SplitText text="Momentos no Pirarucu" className="font-display text-5xl leading-[0.95] font-medium text-oliva-900 md:text-7xl" />
            <a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="text-sm font-semibold text-oliva-900 underline decoration-champanhe underline-offset-8">
              @pirarucuparkhotel →
            </a>
          </div>
          <div className="grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-4 md:gap-4">
            {GALERIA.map((g, i) => (
              <Reveal key={g.src} delay={(i % 4) * 0.08} className={`group overflow-hidden rounded-3xl ${g.classe}`}>
                <Foto src={g.src} alt={g.alt} paleta={g.paleta} rotulo={g.alt} className="size-full transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-105" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Chamada para orçamento */}
      <section className="relative overflow-hidden bg-oliva-800 py-28 text-creme md:py-36">
        <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
          <SplitText text="Monte seu orçamento em um minuto" className="font-display text-5xl leading-[0.95] font-medium md:text-7xl" />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-creme/75">
              Escolha as datas, a acomodação e quantas pessoas vão pescar. Você vê o valor estimado na hora e envia a solicitação direto para o nosso WhatsApp.
            </p>
            <div className="mt-10 flex justify-center">
              <Magnetic forca={0.5}>
                <Link href="/reservar" className="group relative inline-flex size-44 items-center justify-center rounded-full bg-escama text-center text-sm font-semibold tracking-wide text-white transition-transform hover:scale-105">
                  Fazer meu
                  <br />
                  orçamento
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Localização + dúvidas */}
      <section id="localizacao" className="bg-creme-claro py-28 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold tracking-[.3em] text-escama uppercase">Como chegar</p>
            <SplitText text={`${HOTEL.cidade}, a ${HOTEL.distancia}`} className="font-display text-5xl leading-[0.95] font-medium text-oliva-900 md:text-6xl" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-oliva-600">Endereço completo e rotas serão confirmados com o hotel. <span className="selo-exemplo text-escama">a confirmar</span></p>
              <div className="mt-8 aspect-[4/3] overflow-hidden rounded-3xl border border-oliva-900/10 bg-creme">
                <iframe
                  title={`Mapa de ${HOTEL.cidade}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapsQuery)}&output=embed`}
                  className="size-full grayscale-[.4] sepia-[.15]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold tracking-[.3em] text-escama uppercase">Dúvidas frequentes</p>
            <h2 className="font-display mb-10 text-5xl leading-[0.95] font-medium text-oliva-900 md:text-6xl">Antes de reservar</h2>
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
