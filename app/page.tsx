import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Faq } from "@/components/Faq";
import { Foto } from "@/components/Foto";
import { Parallax, Reveal } from "@/components/Motion";
import { ShaderFoto } from "@/components/ShaderFoto";
import { CabecalhoSecao } from "@/components/Secao";
import { GaleriaRolo } from "@/components/GaleriaRolo";
import { TextoFluido } from "@/components/TextoFluido";
import { VideoDrone } from "@/components/VideoDrone";
import { IconeBanheira, IconeCafe, IconeCama, IconeLago, IconePesca, IconePiscina, IconeSemBebida } from "@/components/Icones";
import { ACOMODACOES, HOTEL, PESCA } from "@/lib/data";
import { aPartirDe, brl } from "@/lib/reserva";

const DIFERENCIAIS = [
  { Icone: IconeLago, nome: "À beira do lago", texto: "Natureza e pôr do sol a poucos passos do quarto" },
  { Icone: IconeCama, nome: "Acomodações confortáveis", texto: "Quartos e flats amplos, silenciosos e modernos" },
  { Icone: IconeCafe, nome: "Café da manhã", texto: "Incluso na diária, todas as manhãs" },
  { Icone: IconePiscina, nome: "Piscinas aquecidas", texto: "Abertas 24 horas para os hóspedes" },
  { Icone: IconePesca, nome: "Pesca 24 horas", texto: `Exclusiva para hóspedes, ${brl(PESCA.preco)} por pessoa/diária` },
];

const RESUMO: Record<string, string> = {
  executivo: "Silencioso e confortável, para até quatro pessoas com cama extra.",
  deluxe: "Sala e quarto separados, com mais espaço para a família.",
  "deluxe-banheira": "Nosso flat mais completo, com banheira para relaxar.",
};

const EXPERIENCIAS = [
  { Icone: IconePesca, src: "/fotos/lago-noite.webp", alt: "O hotel visto do outro lado do lago, à noite", nome: "Pesca esportiva", texto: "Pesque de madrugada, ao nascer do sol ou depois do jantar.", href: "/pesca" },
  { Icone: IconeBanheira, src: "/fotos/deluxe-banheira-003.webp", alt: "Banheira com vista para o lago ao entardecer", nome: "Banheira com vista", texto: "Relaxe com o lago na janela no flat com banheira.", href: "/acomodacoes/deluxe-banheira" },
  { Icone: IconeLago, src: "/fotos/executivo-triplo-por-do-sol.webp", alt: "Quarto Executivo com o pôr do sol entrando pela porta da varanda", nome: "Pôr do sol no quarto", texto: "Janelas amplas voltadas para o fim de tarde goiano.", href: "/acomodacoes/executivo" },
  { Icone: IconeCafe, src: "/fotos/cafe-001.webp", alt: "Mesa do café da manhã com melancia, mamão, melão e pães", nome: "Café da manhã", texto: "Frutas, pães, bolos e sucos, incluso em toda diária.", href: "/acomodacoes" },
];


export default function Home() {
  return (
    <>
      <Hero />

      {/* Diferenciais */}
      <section className="bg-verde text-marfim">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 px-3 py-10 sm:grid-cols-3 md:px-8 md:py-14 lg:grid-cols-5">
          {DIFERENCIAIS.map(({ Icone, nome, texto }, i) => (
            <li
              key={nome}
              className={`flex flex-col items-center px-3 py-5 text-center lg:border-l lg:border-dourado/20 lg:first:border-l-0 ${i === DIFERENCIAIS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <Reveal y={16} delay={i * 0.06} className="flex flex-col items-center">
                <Icone className="size-11 text-dourado" />
                <h3 className="mt-4 text-[12px] font-medium tracking-[0.16em] text-marfim uppercase">{nome}</h3>
                <p className="mt-2 max-w-[13rem] text-[14px] leading-snug text-marfim/75">{texto}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Acomodações */}
      <section className="bg-marfim py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <CabecalhoSecao sobre="Hospede-se com estilo" titulo="Quartos e flats pensados para você" />
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-7">
            {ACOMODACOES.map((ac, i) => (
              <Reveal key={ac.slug} delay={i * 0.1} y={36}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-verde shadow-[0_14px_40px_-22px_rgba(27,34,29,.45)] transition-shadow duration-500 hover:shadow-[0_22px_50px_-20px_rgba(27,34,29,.5)]">
                  <Link href={`/acomodacoes/${ac.slug}`} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
                    <Parallax distancia={22} className="aspect-[4/3]">
                      <Foto src={ac.fotos[0]} alt="" paleta={ac.paleta} className="size-full transition-transform duration-[1.2s] ease-[var(--ease-premium)] group-hover:scale-105" />
                    </Parallax>
                  </Link>
                  <div className="flex flex-1 flex-col items-center px-6 pt-7 pb-8 text-center">
                    <h3 className="font-display text-2xl text-marfim">{ac.nome}</h3>
                    <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-marfim/75">{RESUMO[ac.slug] ?? ac.subtitulo}</p>
                    <p className="mt-5 text-[12px] tracking-[0.14em] text-marfim/75 uppercase">
                      A partir de <span className="font-display text-2xl tracking-normal text-dourado-claro normal-case">{brl(aPartirDe(ac))}</span> / diária
                    </p>
                    <Link href={`/acomodacoes/${ac.slug}`} className="pressionavel mt-6 inline-flex h-11 items-center rounded-md bg-dourado px-7 text-[12px] font-medium tracking-[0.16em] text-verde-noite uppercase hover:bg-dourado-claro">
                      Ver detalhes<span className="sr-only"> de {ac.nome}</span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/acomodacoes" className="pressionavel inline-flex h-11 items-center rounded-md border border-verde/40 px-7 text-[12px] font-medium tracking-[0.16em] text-verde uppercase hover:border-verde hover:bg-verde hover:text-marfim">
              Comparar todas as acomodações
            </Link>
          </div>
        </div>
      </section>

      {/* Vídeo de drone */}
      <VideoDrone />

      {/* Experiências */}
      <section id="experiencias" className="relative scroll-mt-20 overflow-hidden bg-salvia-escura py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <CabecalhoSecao sobre="Momentos inesquecíveis" titulo="Experiências para viver aqui" claro />
          <div className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCIAS.map(({ Icone, src, alt, nome, texto, href }, i) => (
              <Reveal key={nome} delay={i * 0.08} y={32}>
                <Link href={href} className="group block text-center">
                  <div className="relative">
                    <Parallax distancia={26} className="aspect-[4/3] rounded-xl sm:aspect-[5/4]">
                      <Foto src={src} alt={alt} className="size-full transition-transform duration-[1.2s] ease-[var(--ease-premium)] group-hover:scale-105" />
                    </Parallax>
                    <span className="absolute bottom-0 left-1/2 grid size-16 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full border border-dourado/40 bg-marfim text-verde shadow-[0_8px_24px_-8px_rgba(27,34,29,.4)] transition-colors duration-300 group-hover:bg-verde group-hover:text-dourado">
                      <Icone className="size-8" />
                    </span>
                  </div>
                  <h3 className="mt-12 text-[13px] font-medium tracking-[0.16em] text-marfim uppercase">{nome}</h3>
                  <p className="mx-auto mt-2 max-w-[16rem] text-[15px] leading-relaxed text-marfim/85">{texto}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href="/pesca" className="pressionavel inline-flex h-11 items-center rounded-md border border-marfim/45 px-7 text-[12px] font-medium tracking-[0.16em] text-marfim uppercase hover:border-dourado hover:bg-dourado hover:text-verde-noite">
              Como funciona a pesca
            </Link>
          </div>
        </div>
      </section>

      {/* Galeria em rolo de filme */}
      <GaleriaRolo />

      {/* Como chegar + dúvidas */}
      <section id="localizacao" className="scroll-mt-20 bg-marfim py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[12px] font-medium tracking-[0.26em] text-dourado-escuro uppercase">Como chegar</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-verde"><TextoFluido texto={`${HOTEL.cidade}, Goiás`} /></h2>
            <p className="mt-4 max-w-md text-verde/75">{HOTEL.endereco}, {HOTEL.cidade} ({HOTEL.uf}), a {HOTEL.distancia}. Check-in a partir das {HOTEL.checkin} e check-out até as {HOTEL.checkout}.</p>
            <div className="mt-8 aspect-[4/3] overflow-hidden rounded-xl border border-verde/10 bg-creme">
              <iframe
                title={`Mapa de ${HOTEL.cidade}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapsQuery)}&output=embed`}
                className="size-full grayscale-[.5] sepia-[.2]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-6 flex items-start gap-4 rounded-xl bg-verde p-5 text-[15px] text-marfim/85">
              <IconeSemBebida className="size-8 shrink-0 text-dourado" />
              <p>Não é permitida a entrada de bebidas externas. Para trazer algo específico, como champanhe ou vinho, consulte a gerência antes.</p>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.26em] text-dourado-escuro uppercase">Dúvidas</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-verde"><TextoFluido texto="Antes de reservar" /></h2>
            <div className="mt-8">
              <Faq />
            </div>
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="relative isolate overflow-hidden bg-verde-noite text-marfim">
        <div className="absolute inset-0 -z-10">
          <ShaderFoto src="/fotos/fachada-noite.webp" alt="" foco={[0.5, 0.55]} parallax={1} brilho={1.2} className="size-full" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(54,67,57,.95)_0%,rgba(54,67,57,.75)_45%,rgba(54,67,57,.15)_100%)]" />
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal y={24} className="max-w-xl">
            <h2 className="font-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.06]"><TextoFluido texto="Planeje sua escapada perfeita" /></h2>
            <p className="mt-5 text-marfim/80">Monte seu orçamento em poucos passos e envie direto para o nosso WhatsApp. O valor aparece na hora, sem cadastro.</p>
            <Link href="/reservar" className="pressionavel mt-9 inline-flex h-12 items-center rounded-md bg-dourado px-8 text-[13px] font-medium tracking-[0.14em] text-verde-noite uppercase hover:bg-dourado-claro">
              Fazer orçamento
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
