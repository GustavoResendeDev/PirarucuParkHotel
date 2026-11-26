"use client";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/reserva";
import { HOTEL } from "@/lib/data";

export function IconeWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

export function WhatsAppFlutuante() {
  const path = usePathname();
  // na primeira tela ele cobriria o botão da busca; aparece ao rolar
  const { scrollY } = useScroll();
  const [vis, setVis] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVis(y > window.innerHeight * 0.6));
  const texto =
    path?.startsWith("/pesca")
      ? "Olá! Vi o site e quero saber mais sobre a pesca esportiva para hóspedes."
      : path?.startsWith("/acomodacoes")
        ? "Olá! Vi as acomodações no site e gostaria de tirar uma dúvida."
        : `Olá! Vi o site do ${HOTEL.nome} e gostaria de informações sobre hospedagem.`;
  if (path?.startsWith("/reservar")) return null;
  return (
    <aside aria-label="Contato rápido">
    <motion.a
      inert={!vis}
      href={waLink(texto)}
      target="_blank"
      rel="noopener"
      aria-label="Falar com o hotel no WhatsApp"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={vis ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="fixed right-5 bottom-5 z-40 grid size-14 cursor-pointer place-items-center rounded-xl bg-[#1f9d55] text-white shadow-[0_10px_30px_rgba(0,0,0,.3)]"
    >
      <IconeWhatsApp className="relative size-7" />
    </motion.a>
    </aside>
  );
}
