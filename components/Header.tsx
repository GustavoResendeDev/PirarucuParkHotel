"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/acomodacoes", rotulo: "Acomodações" },
  { href: "/pesqueiro", rotulo: "Pesqueiro" },
  { href: "/#experiencias", rotulo: "Experiências" },
  { href: "/#localizacao", rotulo: "Como chegar" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [oculto, setOculto] = useState(false);
  const [solido, setSolido] = useState(false);
  const [aberto, setAberto] = useState(false);
  const path = usePathname();
  const escuroNoTopo = path === "/" || path === "/pesqueiro";

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setOculto(y > prev && y > 240 && !aberto);
    setSolido(y > 40);
  });

  const claro = escuroNoTopo && !solido && !aberto;

  return (
    <>
      <motion.header
        animate={{ y: oculto ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          claro ? "text-creme" : "text-oliva-900"
        } ${solido && !aberto ? "bg-creme-claro/80 shadow-[0_1px_0_rgba(30,38,29,.08)] backdrop-blur-xl" : ""}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Início" className="relative z-10 block w-28 md:w-32" onClick={() => setAberto(false)}>
            <Logo className="h-auto w-full" />
          </Link>
          <nav className="hidden items-center gap-9 text-[15px] font-medium lg:flex" aria-label="Principal">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="group relative py-2">
                {l.rotulo}
                <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-premium)] group-hover:origin-left group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/reservar"
              className={`hidden rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:inline-flex ${
                claro ? "bg-creme text-oliva-900 hover:bg-white" : "bg-oliva-800 text-creme hover:bg-oliva-700"
              }`}
            >
              Reservar
            </Link>
            <button
              type="button"
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={aberto}
              onClick={() => setAberto((v) => !v)}
              className="grid size-11 place-items-center rounded-full border border-current/25 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${aberto ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${aberto ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-creme px-6 pt-28 pb-10 lg:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Menu">
              {[...LINKS, { href: "/reservar", rotulo: "Reservar" }].map((l, i) => (
                <motion.div key={l.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={l.href} onClick={() => setAberto(false)} className="font-display text-5xl font-medium text-oliva-900">
                    {l.rotulo}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="mt-10 text-sm text-oliva-600">Itapuranga · GO · 164 km de Goiânia</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
