import Link from "next/link";
import { HOTEL, PESCA } from "@/lib/data";
import { brl, waLink } from "@/lib/reserva";
import { Logo } from "./Logo";
import { Padrao } from "./Padrao";
import { IconeInstagram, IconeLocal, IconePesca } from "./Icones";
import { IconeWhatsApp } from "./WhatsAppFlutuante";

const LINKS = [
  { href: "/", rotulo: "Início" },
  { href: "/acomodacoes", rotulo: "Acomodações" },
  { href: "/#experiencias", rotulo: "Experiências" },
  { href: "/pesca", rotulo: "Pesca esportiva" },
  { href: "/#galeria", rotulo: "Galeria" },
  { href: "/reservar", rotulo: "Fazer orçamento" },
  { href: "/reservar#day-use", rotulo: "Day use" },
];

const titulo = "mb-5 text-[12px] font-medium tracking-[0.2em] text-dourado uppercase";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-verde-escuro text-marfim/75">
      <Padrao cor="#c8b28a" opacidade={0.06} className="absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-x-10 gap-y-12 px-5 py-16 sm:grid-cols-2 md:px-8 md:py-20 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr_1.3fr]">
        <div className="sm:col-span-2 lg:col-span-1 lg:border-r lg:border-marfim/10 lg:pr-10">
          <Logo className="w-36" />
          <p className="mt-6 max-w-xs text-[14px] leading-relaxed">
            Hotel com pesca esportiva e piscinas aquecidas em {HOTEL.cidade}, Goiás, a {HOTEL.distancia}.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={HOTEL.instagramHotel} target="_blank" rel="noopener" aria-label="Instagram do hotel" className="pressionavel grid size-10 place-items-center rounded-md border border-marfim/25 hover:border-dourado hover:text-dourado">
              <IconeInstagram className="size-[18px]" />
            </a>
            <a href={HOTEL.instagramPesqueiro} target="_blank" rel="noopener" aria-label="Instagram do Recanto do Pirarucu" className="pressionavel grid size-10 place-items-center rounded-md border border-marfim/25 hover:border-dourado hover:text-dourado">
              <IconePesca className="size-5" />
            </a>
            <a href={waLink(`Olá! Vi o site do ${HOTEL.nome} e gostaria de informações.`)} target="_blank" rel="noopener" aria-label="WhatsApp do hotel" className="pressionavel grid size-10 place-items-center rounded-md border border-marfim/25 hover:border-dourado hover:text-dourado">
              <IconeWhatsApp className="size-[18px]" />
            </a>
          </div>
        </div>

        <div>
          <h4 className={titulo}>Links rápidos</h4>
          <ul className="space-y-2.5 text-[14px]">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-marfim">{l.rotulo}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={titulo}>O hotel</h4>
          <ul className="space-y-4 text-[14px]">
            <li className="flex gap-3">
              <IconeLocal className="mt-0.5 size-[18px] shrink-0 text-dourado" />
              <span>{HOTEL.endereco}<br />{HOTEL.cidade}, {HOTEL.uf} · a {HOTEL.distancia}</span>
            </li>
            <li className="flex gap-3">
              <IconeWhatsApp className="mt-0.5 size-[18px] shrink-0 text-dourado" />
              <a href={waLink(`Olá! Vi o site do ${HOTEL.nome} e gostaria de informações.`)} target="_blank" rel="noopener" className="hover:text-marfim">{HOTEL.whatsappExibicao}</a>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-0.5 w-[18px] shrink-0 text-center text-dourado">@</span>
              <a href={`mailto:${HOTEL.email}`} className="break-all hover:text-marfim">{HOTEL.email}</a>
            </li>
            <li className="flex gap-3">
              <IconeInstagram className="mt-0.5 size-[18px] shrink-0 text-dourado" />
              <a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="hover:text-marfim">{HOTEL.instagramUsuario}</a>
            </li>
            <li className="flex gap-3">
              <IconePesca className="mt-0.5 size-[18px] shrink-0 text-dourado" />
              <a href={HOTEL.instagramPesqueiro} target="_blank" rel="noopener" className="hover:text-marfim">Recanto do Pirarucu</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={titulo}>Horários</h4>
          <dl className="space-y-3 text-[14px]">
            <div><dt className="text-marfim">Check-in</dt><dd>a partir das {HOTEL.checkin}</dd></div>
            <div><dt className="text-marfim">Check-out</dt><dd>até as {HOTEL.checkout}</dd></div>
            <div><dt className="text-marfim">Café da manhã</dt><dd>{HOTEL.cafe}</dd></div>
            <div><dt className="text-marfim">Restaurante</dt><dd>{HOTEL.restaurante}</dd></div>
            <div><dt className="text-marfim">Piscinas e pesca</dt><dd>24 horas · pesca {brl(PESCA.preco)}/pessoa</dd></div>
          </dl>
        </div>

        <div>
          <h4 className={titulo}>Fale com a gente</h4>
          <p className="text-[14px] leading-relaxed">Tire dúvidas, peça condições especiais e confirme sua reserva pelo WhatsApp.</p>
          <a
            href={waLink(`Olá! Vi o site do ${HOTEL.nome} e gostaria de informações sobre hospedagem.`)}
            target="_blank"
            rel="noopener"
            className="pressionavel mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-dourado px-4 text-[12px] font-medium tracking-[0.08em] whitespace-nowrap text-verde-noite uppercase hover:bg-dourado-claro"
          >
            <IconeWhatsApp className="size-4" /> Chamar no WhatsApp
          </a>
        </div>
      </div>
      <div className="relative border-t border-marfim/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[12px] text-marfim/50 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} {HOTEL.nome}. Todos os direitos reservados.</p>
          <p>Valores sujeitos a confirmação no momento da reserva.</p>
        </div>
      </div>
    </footer>
  );
}
