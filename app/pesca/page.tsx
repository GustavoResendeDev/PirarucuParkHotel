import type { Metadata } from "next";
import Link from "next/link";
import { Foto } from "@/components/Foto";
import { Logo } from "@/components/Logo";
import { Padrao } from "@/components/Padrao";
import { Reveal } from "@/components/Motion";
import { TituloMarca } from "@/components/TituloMarca";
import { IconeLago, IconePesca, IconeRelogio, IconePessoa } from "@/components/Icones";
import { HOTEL, PESCA, REGRAS_PESCA } from "@/lib/data";
import { brl } from "@/lib/reserva";

export const metadata: Metadata = {
  title: "Pesca esportiva",
  description: `Pesca esportiva no pesque e solte, 24 horas, exclusiva para hóspedes do ${HOTEL.nome}: ${brl(PESCA.preco)} por pessoa, por diária. Veja as regras e iscas permitidas.`,
};

const COMO = [
  { Icone: IconePessoa, titulo: "Só para hóspedes", texto: "O direito à pesca é exclusivo de quem está hospedado no hotel." },
  { Icone: IconeRelogio, titulo: "24 horas", texto: "Pesque de madrugada, ao amanhecer ou depois do jantar. O horário é seu." },
  { Icone: IconePesca, titulo: `${brl(PESCA.preco)} por pessoa`, texto: "O valor é por diária. Você escolhe quantas pessoas e quantos dias vão pescar." },
  { Icone: IconeLago, titulo: "Pesque e solte", texto: "Todo peixe volta para o lago. Para soltar o pirarucu, chame a equipe no quiosque da pesca." },
];

export default function Page() {
  return (
    <div className="bg-verde text-marfim">
      <section className="relative overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="absolute inset-0 opacity-35"><Foto src="/fotos/lago-noite.webp" alt="" className="size-full" prioridade /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-verde/70 via-verde/80 to-verde" />
        <Padrao cor="#c8b28a" opacidade={0.08} className="absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <TituloMarca as="h1" texto="PESCA" letra={1} className="text-[clamp(3rem,9vw,6.5rem)] text-dourado" corTraco="#e9dfcb" />
            <p className="font-display mt-10 max-w-xl text-3xl leading-snug md:text-4xl">O lago fica a poucos passos do quarto, e a pesca funciona a qualquer hora para quem está hospedado.</p>
            <Link href="/reservar" className="pressionavel mt-10 inline-flex h-14 items-center rounded-full bg-dourado px-9 text-[15px] font-medium text-verde-noite hover:bg-dourado-claro">
              Incluir pesca no orçamento
            </Link>
          </div>
          <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dourado/30 bg-verde-noite/40 p-10 text-center backdrop-blur md:p-14">
            <Logo somentePeixe className="w-44 md:w-56" />
            <p className="font-display text-7xl text-dourado-claro md:text-8xl">{brl(PESCA.preco)}</p>
            <p className="text-marfim/75">por pessoa, por diária, com direito a pescar 24 horas</p>
          </div>
        </div>
      </section>

      <section className="bg-verde-escuro py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-4xl md:text-5xl">Como funciona</h2>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-dourado/15 bg-dourado/15 sm:grid-cols-2 lg:grid-cols-4">
            {COMO.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="bg-verde-escuro p-8">
                <Icone className="size-11 text-dourado" />
                <h3 className="font-display mt-7 text-2xl">{titulo}</h3>
                <p className="mt-2 text-[15px] text-marfim/70">{texto}</p>
              </li>
            ))}
          </ul>
          <Reveal className="mt-10 rounded-2xl border border-dourado/15 p-6 text-[15px] text-marfim/75 md:p-8">
            <p>
              Exemplo: um casal em 2 diárias, com as duas pessoas pescando, soma {brl(PESCA.preco * 4)} de pesca ao valor da hospedagem. No orçamento você ajusta quantas pessoas e quantos dias.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-4xl md:text-5xl">Regras da pesca</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-[15px] text-dourado">Iscas permitidas</h3>
              <ul className="mt-3 space-y-2 text-marfim/85">{REGRAS_PESCA.iscasPermitidas.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-[15px] text-dourado">Iscas proibidas</h3>
              <ul className="mt-3 space-y-2 text-marfim/85">{REGRAS_PESCA.iscasProibidas.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-[15px] text-dourado">Equipamentos proibidos</h3>
              <ul className="mt-3 space-y-2 text-marfim/85">{REGRAS_PESCA.equipamentosProibidos.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <ul className="mt-12 space-y-3 border-t border-dourado/15 pt-8 text-[15px] text-marfim/75">
            {REGRAS_PESCA.avisos.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      </section>

      <section className="border-t border-dourado/15 py-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 md:px-8">
          <p className="text-marfim/75">Conheça também o clube de pesca Recanto do Pirarucu.</p>
          <a href={HOTEL.instagramPesqueiro} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-[15px] text-dourado-claro underline decoration-dourado underline-offset-8 hover:decoration-2">
            Recanto do Pirarucu no Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
