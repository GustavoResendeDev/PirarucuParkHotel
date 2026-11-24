import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { Parallax, Reveal, SplitText } from "@/components/Motion";
import { ACOMODACOES, HOTEL } from "@/lib/data";
import { brl } from "@/lib/reserva";

export function generateStaticParams() {
  return ACOMODACOES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ac = ACOMODACOES.find((a) => a.slug === slug);
  return ac ? { title: ac.nome, description: `${ac.descricao} Até ${ac.capacidade} pessoas.` } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = ACOMODACOES.findIndex((a) => a.slug === slug);
  if (i < 0) notFound();
  const ac = ACOMODACOES[i];
  const prox = ACOMODACOES[(i + 1) % ACOMODACOES.length];
  return (
    <div className="bg-creme-claro">
      <section className="relative h-[85svh] min-h-[560px] overflow-hidden text-creme">
        <Parallax className="absolute inset-0" distancia={90}>
          <Foto src={ac.fotos[0]} alt={ac.nome} paleta={ac.paleta} className="size-full" prioridade />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-oliva-950/80 via-oliva-950/20 to-oliva-950/40" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 md:px-8">
          <Link href="/acomodacoes" className="mb-6 text-sm text-creme/70 hover:text-creme">← Todas as acomodações</Link>
          <SplitText as="h1" text={ac.nome} className="font-display text-6xl leading-none font-medium md:text-9xl" />
          <p className="mt-4 max-w-xl text-lg text-creme/80">{ac.chamada}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 md:px-8 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <p className="font-display text-3xl leading-snug text-oliva-900 md:text-4xl">{ac.descricao}</p>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-y border-oliva-900/10 py-8">
            <div><dt className="text-xs tracking-[.2em] text-oliva-600 uppercase">Pessoas</dt><dd className="font-display mt-1 text-4xl text-oliva-900">{ac.capacidade}</dd></div>
            <div><dt className="text-xs tracking-[.2em] text-oliva-600 uppercase">Área</dt><dd className="font-display mt-1 text-4xl text-oliva-900">{ac.area}</dd></div>
            <div><dt className="text-xs tracking-[.2em] text-oliva-600 uppercase">Unidades</dt><dd className="font-display mt-1 text-4xl text-oliva-900">{ac.unidades}</dd></div>
          </dl>
          <h2 className="mt-12 text-xs font-bold tracking-[.3em] text-escama uppercase">Comodidades</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {ac.comodidades.map((c) => (
              <li key={c} className="flex items-center gap-3 text-oliva-800"><span className="size-1.5 rounded-full bg-champanhe" />{c}</li>
            ))}
          </ul>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {ac.fotos.map((f, k) => (
              <Foto key={f} src={f} alt={`${ac.nome}, foto ${k + 1}`} paleta={ac.paleta} rotulo={`${ac.nome} ${k + 1}`} className="aspect-[4/3] rounded-3xl" />
            ))}
          </div>
        </Reveal>
        <aside className="h-fit rounded-[28px] bg-oliva-900 p-8 text-creme lg:sticky lg:top-28">
          <p className="text-xs font-bold tracking-[.25em] text-champanhe uppercase">Diária</p>
          <p className="font-display mt-3 text-6xl">{brl(ac.diaria)}</p>
          <p className="mt-1 text-sm text-creme/60">domingo a quinta</p>
          <p className="font-display mt-5 text-3xl">{brl(ac.diariaFimDeSemana)}</p>
          <p className="mt-1 text-sm text-creme/60">sexta e sábado · <span className="selo-exemplo text-champanhe">exemplo</span></p>
          <ul className="mt-6 space-y-1 text-sm text-creme/75">
            <li>Café da manhã incluso</li>
            <li>Check-in {HOTEL.checkin} · Check-out {HOTEL.checkout}</li>
            <li>Pesca esportiva à parte</li>
          </ul>
          <Link href={`/reservar?acomodacao=${ac.slug}`} className="mt-8 block rounded-full bg-escama py-4 text-center text-sm font-semibold text-white hover:bg-escama-escuro">
            Consultar datas e valores
          </Link>
        </aside>
      </section>

      <Link href={`/acomodacoes/${prox.slug}`} className="group block border-t border-oliva-900/10 py-20 text-center">
        <span className="text-xs font-bold tracking-[.3em] text-oliva-600 uppercase">Próxima</span>
        <span className="font-display mt-3 block text-6xl text-oliva-900 transition-transform duration-700 group-hover:translate-x-4 md:text-8xl">{prox.nome} →</span>
      </Link>
    </div>
  );
}
