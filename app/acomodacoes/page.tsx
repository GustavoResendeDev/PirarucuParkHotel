import type { Metadata } from "next";
import Link from "next/link";
import { Foto } from "@/components/Foto";
import { Reveal } from "@/components/Motion";
import { BuscaRapida } from "@/components/BuscaRapida";
import { TituloMarca } from "@/components/TituloMarca";
import { TabelaPrecos } from "@/components/TabelaPrecos";
import { ACOMODACOES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Acomodações",
  description: "Executivo, Deluxe Flat e Deluxe Flat com Banheira: fotos, o que está incluso e a tabela de diárias do Pirarucu Park Hotel.",
};

export default function Page() {
  return (
    <div className="bg-areia-clara pt-36 pb-28 md:pt-44">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <TituloMarca as="h1" texto="ACOMODAÇÕES" letra={6} className="text-[clamp(2.6rem,7vw,5.4rem)] text-salvia" />
        <p className="mt-8 max-w-xl text-lg text-verde/80">Todas as diárias incluem café da manhã e acesso livre às piscinas aquecidas. Escolha as datas para ver o valor da sua estadia.</p>
        <Reveal delay={0.15} className="mt-10">
          <BuscaRapida variante="claro" />
        </Reveal>

        <div className="mt-20 space-y-24 md:space-y-32">
          {ACOMODACOES.map((ac, i) => (
            <Reveal key={ac.slug}>
              <article className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <Link href={`/acomodacoes/${ac.slug}`} className="group block overflow-hidden rounded-[28px]" aria-label={`Ver fotos e detalhes do ${ac.nome}`}>
                  <Foto src={ac.fotos[0]} alt={`${ac.nome}: ${ac.subtitulo.toLowerCase()}`} paleta={ac.paleta} rotulo={ac.nome} className="aspect-[4/3] transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-[1.04]" />
                </Link>
                <div>
                  <p className="text-[15px] text-salvia-escura">{ac.subtitulo}</p>
                  <h2 className="font-display mt-2 text-5xl text-verde md:text-6xl">{ac.nome}</h2>
                  <p className="mt-5 max-w-lg leading-relaxed text-verde/80">{ac.descricao}</p>
                  <ul className="mt-6 flex max-w-lg flex-wrap gap-2">
                    {ac.destaques.map((c) => (
                      <li key={c} className="rounded-full border border-verde/15 px-3 py-1.5 text-sm text-verde">{c}</li>
                    ))}
                  </ul>
                  <div className="mt-8 max-w-md">
                    <TabelaPrecos ac={ac} />
                    <p className="mt-2 text-sm text-verde/60">Valores por diária.</p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <Link href={`/reservar?acomodacao=${ac.slug}`} className="pressionavel inline-flex h-12 items-center rounded-full bg-verde px-7 text-[15px] text-marfim hover:bg-verde-claro">
                      Fazer orçamento
                    </Link>
                    <Link href={`/acomodacoes/${ac.slug}`} className="text-[15px] text-verde underline decoration-dourado underline-offset-8 hover:decoration-2">
                      Ver todas as fotos
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
