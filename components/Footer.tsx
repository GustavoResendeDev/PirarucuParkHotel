import Link from "next/link";
import { HOTEL, INCLUSOS } from "@/lib/data";
import { Logo } from "./Logo";
import { Padrao } from "./Padrao";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-verde text-marfim/80">
      <div className="relative h-16 border-b border-dourado/20">
        <Padrao cor="#c8b28a" opacidade={0.35} className="absolute inset-0" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Logo className="w-44" />
          <p className="mt-8 max-w-xs text-[15px] leading-relaxed">
            Hotel com pesca esportiva e piscinas aquecidas em {HOTEL.cidade}, Goiás, a {HOTEL.distancia}.
          </p>
        </div>
        <div>
          <h4 className="font-display mb-4 text-lg text-dourado">Hospede-se</h4>
          <ul className="space-y-2 text-[15px]">
            <li><Link href="/acomodacoes" className="hover:text-marfim">Acomodações e preços</Link></li>
            <li><Link href="/reservar" className="hover:text-marfim">Fazer orçamento</Link></li>
            <li><Link href="/pesca" className="hover:text-marfim">Pesca esportiva</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display mb-4 text-lg text-dourado">Na sua diária</h4>
          <ul className="space-y-2 text-[15px]">
            {INCLUSOS.map((i) => <li key={i}>{i}</li>)}
            <li>Check-in a partir das {HOTEL.checkin}</li>
            <li>Check-out até as {HOTEL.checkout}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display mb-4 text-lg text-dourado">Siga</h4>
          <ul className="space-y-2 text-[15px]">
            <li><a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="hover:text-marfim">@pirarucuparkhotel</a></li>
            <li><a href={HOTEL.instagramPesqueiro} target="_blank" rel="noopener" className="hover:text-marfim">Recanto do Pirarucu</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-marfim/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-marfim/50 md:px-8">
          © {new Date().getFullYear()} {HOTEL.nome}. Valores sujeitos a confirmação no momento da reserva.
        </p>
      </div>
    </footer>
  );
}
