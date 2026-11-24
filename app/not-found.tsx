import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-creme-claro px-5 pt-24 text-center">
      <div>
        <p className="font-display text-9xl text-oliva-900/20">404</p>
        <h1 className="font-display text-5xl text-oliva-900">Esse peixe escapou</h1>
        <p className="mt-3 text-oliva-600">A página que você procura não existe.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-oliva-900 px-7 py-4 text-sm font-semibold text-creme">Voltar ao início</Link>
      </div>
    </div>
  );
}
