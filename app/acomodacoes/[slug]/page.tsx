import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { Parallax, Reveal } from "@/components/Motion";
import { TextoFluido } from "@/components/TextoFluido";
import { TabelaPrecos } from "@/components/TabelaPrecos";
import { ACOMODACOES, HOTEL, INCLUSOS, PESCA } from "@/lib/data";
import { brl } from "@/lib/reserva";

export function generateStaticParams() {
  return ACOMODACOES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ac = ACOMODACOES.find((a) => a.slug === slug);
  return ac ? { title: ac.nome, description: ac.descricao } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = ACOMODACOES.findIndex((a) => a.slug === slug);
  if (i < 0) notFound();
  const ac = ACOMODACOES[i];
  const prox = ACOMODACOES[(i + 1) % ACOMODACOES.length];
  const [capa, ...demais] = ac.fotos;
  return (
    <div className="bg-marfim">
      <section className="relative h-[80svh] min-h-[520px] overflow-hidden text-marfim">
        <Parallax className="absolute inset-0" distancia={80}>
          <Foto src={capa} alt={`${ac.nome}: ${ac.subtitulo.toLowerCase()}`} paleta={ac.paleta} className="size-full" prioridade />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-verde-noite/85 via-verde-noite/20 to-verde-noite/45" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 md:px-8">
          <Link href="/acomodacoes" className="mb-6 inline-flex min-h-11 w-fit items-center text-[15px] text-marfim/75 hover:text-marfim">Todas as acomodações</Link>
          <p className="text-dourado-claro">{ac.subtitulo}</p>
          <h1 className="font-display mt-2 text-5xl leading-none md:text-8xl"><TextoFluido texto={ac.nome} passo={34} /></h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="font-display text-3xl leading-snug text-verde md:text-4xl">{ac.descricao}</p>
          <ul className="mt-10 flex flex-wrap gap-2">
            {ac.destaques.map((c) => (
              <li key={c} className="rounded-full bg-verde px-4 py-2 text-[15px] text-marfim">{c}</li>
            ))}
          </ul>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-[15px] text-salvia-escura">Camas</h2>
              <ul className="mt-3 space-y-2 text-verde">
                {ac.camas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-[15px] text-salvia-escura">No quarto</h2>
              <ul className="mt-3 space-y-2 text-verde">
                {ac.comodidades.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
          <p className="mt-8 text-[15px] text-verde/70">Até {ac.capacidade} pessoas. Crianças até {HOTEL.idadeCriancaGratis} anos não pagam. Temos elevador e banheiro adaptado.</p>
          <div className="mt-14 grid grid-cols-2 gap-3 md:gap-4">
            {demais.map((f, k) => (
              <Reveal key={f} y={24} className={k === 0 && demais.length % 2 === 1 ? "col-span-2" : ""}>
                <Foto src={f} alt={`${ac.nome}, foto ${k + 2}`} paleta={ac.paleta} className={`rounded-2xl ${k === 0 && demais.length % 2 === 1 ? "aspect-[16/9]" : "aspect-[4/5]"}`} />
              </Reveal>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-[28px] bg-verde p-8 text-marfim lg:sticky lg:top-28">
          <h2 className="text-[15px] text-dourado">Diárias</h2>
          <div className="mt-3">
            <TabelaPrecos ac={ac} escuro />
          </div>
          <h3 className="mt-8 text-[15px] text-dourado">Incluso</h3>
          <ul className="mt-2 space-y-1 text-marfim/85">
            {INCLUSOS.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <h3 className="mt-6 text-[15px] text-dourado">Opcional</h3>
          <p className="mt-2 text-marfim/85">Pesca esportiva 24 horas, {brl(PESCA.preco)} por pessoa/diária.</p>
          <p className="mt-6 text-sm text-marfim/60">Reserva garantida com sinal de {HOTEL.sinalPercentual}%. Mínimo de {HOTEL.minimoDiariasFeriado} diárias em feriados.</p>
          <p className="mt-6 text-sm text-marfim/60">Check-in a partir das {HOTEL.checkin}, check-out até as {HOTEL.checkout}.</p>
          <Link href={`/reservar?acomodacao=${ac.slug}`} className="pressionavel mt-8 flex h-14 items-center justify-center rounded-md bg-dourado text-[15px] font-medium text-verde-noite hover:bg-dourado-claro">
            Fazer orçamento
          </Link>
        </aside>
      </section>

      <Link href={`/acomodacoes/${prox.slug}`} className="group block bg-verde py-20 text-center">
        <span className="text-[15px] text-dourado">Próxima acomodação</span>
        <span className="font-display mt-3 block text-5xl text-marfim transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-3 md:text-7xl">{prox.nome}</span>
      </Link>
    </div>
  );
}
