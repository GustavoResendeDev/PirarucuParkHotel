import type { Metadata } from "next";
import Link from "next/link";
import { Foto } from "@/components/Foto";
import { Magnetic, Marquee, Parallax, Reveal, SplitText } from "@/components/Motion";
import { RevelarImagem } from "@/components/RevelarImagem";
import { HOTEL, SERVICOS_PESCA } from "@/lib/data";
import { brl } from "@/lib/reserva";

export const metadata: Metadata = {
  title: "Pesqueiro e day use",
  description: `Recanto do Pirarucu: pesca esportiva, restaurante e day use em ${HOTEL.cidade} (${HOTEL.uf}). Aberto ${HOTEL.pesqueiroFuncionamento.toLowerCase()}.`,
};

const REGRAS = [
  "Pesca esportiva no sistema pesque e solte nos lagos principais.",
  "Manuseio cuidadoso do peixe: sem retirar da água por tempo prolongado.",
  "Uso de anzol sem farpa recomendado.",
  "Crianças sempre acompanhadas de um responsável.",
];

export default function Page() {
  return (
    <div className="bg-marinho text-creme">
      <section className="grao relative flex min-h-[90svh] items-end overflow-hidden pb-20">
        <Parallax className="absolute inset-0" distancia={100}>
          <Foto src="/fotos/pesqueiro-hero.jpg" alt="Lagos do Recanto do Pirarucu" paleta={["#22345a", "#0b1222"]} className="size-full" prioridade />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-marinho via-marinho/40 to-marinho/20" />
        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
          <p className="mb-5 text-xs font-bold tracking-[.3em] text-champanhe uppercase">Recanto do Pirarucu · {HOTEL.pesqueiroFuncionamento}</p>
          <SplitText as="h1" text="Seu paraíso de pesca e lazer" className="font-display max-w-5xl text-6xl leading-[0.92] font-medium md:text-9xl" />
        </div>
      </section>

      <div className="border-y border-creme/10 py-6">
        <Marquee itens={["Pirarucu", "Tambaqui", "Pintado", "Pesca esportiva", "Restaurante", "Drinks"]} className="font-display text-3xl text-creme/70 italic md:text-5xl" />
      </div>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-28 md:px-8 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-5xl leading-[0.95] font-medium md:text-6xl">Pesca esportiva, comida boa e ambiente incrível</h2>
          <p className="mt-6 max-w-md leading-relaxed text-creme/75">
            O pesqueiro fica no mesmo complexo do hotel. Hóspedes pescam a poucos passos do quarto, e visitantes podem vir para o day use. <span className="selo-exemplo text-champanhe">espécies a confirmar</span>
          </p>
          <ul className="mt-10 space-y-4">
            {REGRAS.map((r) => (
              <li key={r} className="flex gap-4 border-b border-creme/10 pb-4 text-creme/85"><span className="text-champanhe">✦</span>{r}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-creme/50">Regras de exemplo. O regulamento oficial será publicado pelo hotel.</p>
        </Reveal>
        <RevelarImagem className="aspect-[4/5] overflow-hidden">
          <Foto src="/fotos/pescador.jpg" alt="Pescador com peixe" paleta={["#3f5a5c", "#14203a"]} rotulo="Pescaria" className="size-full" />
        </RevelarImagem>
      </section>

      <section className="bg-creme-claro py-28 text-oliva-900">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="mb-4 text-xs font-bold tracking-[.3em] text-escama uppercase">Valores</p>
          <h2 className="font-display text-5xl leading-[0.95] font-medium md:text-7xl">Day use e pesca</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {SERVICOS_PESCA.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.1}>
                <div className="h-full rounded-[28px] border border-oliva-900/10 bg-white p-9">
                  <h3 className="font-display text-4xl">{s.nome}</h3>
                  <p className="mt-3 text-oliva-600">{s.descricao}</p>
                  <p className="mt-8"><span className="font-display text-5xl">{brl(s.preco)}</span> <span className="text-oliva-600">/{s.unidade}</span></p>
                  <span className="selo-exemplo mt-3 text-escama">valor de exemplo</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap gap-4">
            <Magnetic>
              <Link href="/reservar?tipo=dayuse" className="inline-flex rounded-full bg-marinho px-8 py-4 text-sm font-semibold text-creme">Orçamento de day use</Link>
            </Magnetic>
            <Magnetic>
              <Link href="/reservar" className="inline-flex rounded-full border border-oliva-900/20 px-8 py-4 text-sm font-semibold">Hospedagem + pesca</Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
