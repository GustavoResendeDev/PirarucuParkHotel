import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-verde px-5 pt-24 text-center text-marfim">
      <div className="flex flex-col items-center">
        <Logo somentePeixe className="w-40 opacity-80" />
        <h1 className="font-display mt-10 text-5xl">Esse peixe escapou</h1>
        <p className="mt-3 text-marfim/70">A página que você procura não existe ou mudou de endereço.</p>
        <Link href="/" className="pressionavel mt-8 inline-flex h-12 items-center rounded-md bg-dourado px-7 text-[15px] font-medium text-verde-noite hover:bg-dourado-claro">Voltar ao início</Link>
      </div>
    </div>
  );
}
