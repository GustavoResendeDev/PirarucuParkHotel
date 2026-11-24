import Link from "next/link";
import { HOTEL } from "@/lib/data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="grao relative overflow-hidden bg-oliva-950 text-creme/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-20 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Logo className="w-40 text-creme" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed">
            {HOTEL.slogan} em {HOTEL.cidade} ({HOTEL.uf}), a {HOTEL.distancia}. Em complexo com o Recanto do Pirarucu.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-[.2em] text-champanhe uppercase">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/acomodacoes" className="hover:text-creme">Acomodações</Link></li>
            <li><Link href="/pesqueiro" className="hover:text-creme">Pesqueiro e day use</Link></li>
            <li><Link href="/reservar" className="hover:text-creme">Reservar</Link></li>
            <li><Link href="/reservar?tipo=dayuse" className="hover:text-creme">Orçamento de day use</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-[.2em] text-champanhe uppercase">Contato</h4>
          <ul className="space-y-2 text-sm">
            <li>WhatsApp (00) 00000-0000 <span className="selo-exemplo ml-1">exemplo</span></li>
            <li>{HOTEL.email}</li>
            <li><a href={HOTEL.instagramHotel} target="_blank" rel="noopener" className="hover:text-creme">@pirarucuparkhotel</a></li>
            <li><a href={HOTEL.instagramPesqueiro} target="_blank" rel="noopener" className="hover:text-creme">@clubedepescarecantodopirarucu</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-[.2em] text-champanhe uppercase">Informações</h4>
          <ul className="space-y-2 text-sm">
            <li>Check-in {HOTEL.checkin} · Check-out {HOTEL.checkout}</li>
            <li>Pesqueiro: {HOTEL.pesqueiroFuncionamento}</li>
            <li>Política de privacidade (LGPD)</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl overflow-hidden px-5 md:px-8">
        <p aria-hidden="true" className="font-display -mb-[0.22em] text-[19vw] leading-none font-semibold tracking-tight text-creme/[.06] select-none md:text-[15vw]">
          PIRARUCU
        </p>
      </div>
      <div className="border-t border-creme/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-creme/50 md:px-8">
          © {new Date().getFullYear()} {HOTEL.nome}. Valores e algumas informações deste site são exemplos até a validação com o hotel.
        </p>
      </div>
    </footer>
  );
}
