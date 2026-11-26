"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Logo } from "./Logo";
import { HOTEL } from "@/lib/data";

const LINKS = [
  { href: "/", rotulo: "Início" },
  { href: "/acomodacoes", rotulo: "Acomodações" },
  { href: "/#experiencias", rotulo: "Experiências" },
  { href: "/pesca", rotulo: "Pesca" },
  { href: "/#galeria", rotulo: "Galeria" },
  { href: "/#localizacao", rotulo: "Como chegar" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [oculto, setOculto] = useState(false);
  const [solido, setSolido] = useState(false);
  const [aberto, setAberto] = useState(false);
  const path = usePathname();
  const escuroNoTopo = path === "/" || !!path?.startsWith("/pesca") || !!path?.startsWith("/acomodacoes");

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setOculto(y > prev && y > 240 && !aberto);
    setSolido(y > 40);
  });

  const sobreVerde = escuroNoTopo || solido || aberto;

  return (
    <>
      <motion.header
        animate={{ y: oculto ? "-110%" : "0%" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${sobreVerde ? "text-marfim" : "text-verde"} ${
          solido && !aberto ? "bg-verde/90 shadow-[0_1px_0_rgba(200,178,138,.2)] backdrop-blur-xl" : ""
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Pirarucu Park Hotel, início" className="relative z-10 block w-20 md:w-24" onClick={() => setAberto(false)}>
            <Logo cor={sobreVerde ? "dourado" : "verde"} className="w-full" />
          </Link>
          <nav className="hidden items-center gap-8 text-[12px] font-medium tracking-[0.16em] uppercase lg:flex xl:gap-10" aria-label="Principal">
            {LINKS.map((l) => {
              const ativo = l.href === path || (l.href !== "/" && !l.href.includes("#") && !!path?.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href} aria-current={ativo ? "page" : undefined} className="group relative cursor-pointer py-2">
                  {l.rotulo}
                  <span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-dourado transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100 ${ativo ? "scale-x-100" : "scale-x-0"}`} />
                </Link>
              );
            })}
          </nav>
          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/reservar"
              className={`pressionavel hidden h-11 items-center rounded-md px-6 text-[12px] font-medium tracking-[0.16em] uppercase sm:inline-flex ${
                sobreVerde ? "bg-dourado text-verde-noite hover:bg-dourado-claro" : "bg-verde text-marfim hover:bg-verde-claro"
              }`}
            >
              Reservar agora
            </Link>
            <button
              type="button"
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={aberto}
              onClick={() => setAberto((v) => !v)}
              className="pressionavel grid size-11 cursor-pointer place-items-center rounded-md border border-current/30 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-current top-1.5 transition-transform duration-300 ease-[var(--ease-premium)] ${aberto ? "rotate-45" : "-translate-y-1.5"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current top-1.5 transition-transform duration-300 ease-[var(--ease-premium)] ${aberto ? "-rotate-45" : "translate-y-1.5"}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-verde px-6 pt-28 pb-10 text-marfim lg:hidden"
          >
            <nav className="flex flex-col gap-3" aria-label="Menu">
              {[...LINKS.slice(1), { href: "/reservar", rotulo: "Reservar" }].map((l, i) => (
                <motion.div key={l.href} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={l.href} onClick={() => setAberto(false)} className="font-display text-4xl">
                    {l.rotulo}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="mt-10 text-sm text-marfim/70">
              {HOTEL.cidade}, Goiás. A {HOTEL.distancia}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
