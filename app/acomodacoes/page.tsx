import type { Metadata } from "next";
import Link from "next/link";
import { Foto } from "@/components/Foto";
import { Reveal, SplitText } from "@/components/Motion";
import { BuscaRapida } from "@/components/BuscaRapida";
import { ACOMODACOES } from "@/lib/data";
import { brl } from "@/lib/reserva";

export const metadata: Metadata = {
  title: "Acomodações",
  description: "Quartos e suítes do Pirarucu Park Hotel: capacidade, comodidades e valores de diária.",
};

export default function Page() {
  return (
    <div className="bg-creme-claro pt-36 pb-28 md:pt-44">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="mb-4 text-xs font-bold tracking-[.3em] text-escama uppercase">Acomodações</p>
        <SplitText as="h1" text="Descanso para cada tipo de viagem" className="font-display max-w-4xl text-5xl leading-[0.95] font-medium text-oliva-900 md:text-8xl" />
        <Reveal delay={0.2} className="mt-12">
          <BuscaRapida variante="claro" />
        </Reveal>

        <div className="mt-20 space-y-24 md:space-y-36">
          {ACOMODACOES.map((ac, i) => (
            <Reveal key={ac.slug}>
              <article className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <Link href={`/acomodacoes/${ac.slug}`} className="group block overflow-hidden rounded-[32px]">
                  <Foto src={ac.fotos[0]} alt={`Acomodação ${ac.nome}`} paleta={ac.paleta} rotulo={ac.nome} className="aspect-[4/3] transition-transform duration-[1.4s] ease-[var(--ease-premium)] group-hover:scale-105" />
                </Link>
                <div>
                  <p className="text-xs font-semibold tracking-[.25em] text-oliva-600 uppercase">
                    0{i + 1} · até {ac.capacidade} pessoas · {ac.area} {ac.fonteNome === "suposicao" && <span className="selo-exemplo ml-2 text-escama">nome provisório</span>}
                  </p>
                  <h2 className="font-display mt-3 text-5xl font-medium text-oliva-900 md:text-6xl">{ac.nome}</h2>
                  <p className="mt-5 max-w-lg leading-relaxed text-oliva-700">{ac.descricao}</p>
                  <ul className="mt-6 flex max-w-lg flex-wrap gap-2">
                    {ac.comodidades.map((c) => (
                      <li key={c} className="rounded-full border border-oliva-900/10 px-3 py-1.5 text-sm text-oliva-800">{c}</li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <p className="text-oliva-600">
                      <span className="font-display text-4xl text-oliva-900">{brl(ac.diaria)}</span> /noite
                      <span className="block text-xs">sex e sáb: {brl(ac.diariaFimDeSemana)} · <span className="selo-exemplo text-escama">exemplo</span></span>
                    </p>
                    <Link href={`/reservar?acomodacao=${ac.slug}`} className="rounded-full bg-oliva-900 px-7 py-4 text-sm font-semibold text-creme hover:bg-oliva-700">
                      Reservar esta
                    </Link>
                    <Link href={`/acomodacoes/${ac.slug}`} className="text-sm font-semibold text-oliva-900 underline decoration-champanhe underline-offset-8">
                      Ver detalhes
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
