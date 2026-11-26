"use client";
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, animate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Revela o conteúdo subindo e ganhando opacidade quando entra na tela. */
export function Reveal({ children, delay = 0, y = 16, className = "" }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={`revela ${className}`}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Título que sobe palavra por palavra, cada uma saindo de uma máscara. */
export function SplitText({ text, className = "", delay = 0, as: Tag = "h2" }: { text: string; className?: string; delay?: number; as?: "h1" | "h2" | "h3" | "p" }) {
  const palavras = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {palavras.map((p, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 4 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, margin: "-5% 0px" }}
            transition={{ duration: 1.1, delay: delay + i * 0.06, ease: EASE }}
          >
            {p}
            {i < palavras.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Texto que "acende" palavra por palavra conforme a rolagem. */
export function ScrollFillText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const palavras = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {palavras.map((p, i) => (
        <Palavra key={i} progresso={scrollYProgress} inicio={i / palavras.length} fim={(i + 1) / palavras.length}>
          {p}
        </Palavra>
      ))}
    </p>
  );
}
function Palavra({ children, progresso, inicio, fim }: { children: string; progresso: ReturnType<typeof useScroll>["scrollYProgress"]; inicio: number; fim: number }) {
  const opacity = useTransform(progresso, [inicio, fim], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

/** Botão/elemento que é "puxado" pelo cursor. */
export function Magnetic({ children, forca = 0.35, className = "" }: { children: ReactNode; forca?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * forca);
        y.set((e.clientY - (r.top + r.height / 2)) * forca);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Número que conta até o valor quando aparece. */
export function Contador({ valor, sufixo = "", className = "" }: { valor: number; sufixo?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  useEffect(() => {
    if (!emVista) return;
    const c = animate(mv, valor, { duration: 2.2, ease: EASE });
    const un = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("pt-BR") + sufixo;
    });
    return () => {
      c.stop();
      un();
    };
  }, [emVista, mv, valor, sufixo]);
  return (
    <span ref={ref} className={className}>
      0{sufixo}
    </span>
  );
}

/** Faixa de texto infinita, velocidade varia com a rolagem. */
export function Marquee({ itens, className = "" }: { itens: string[]; className?: string }) {
  const lista = [...itens, ...itens, ...itens, ...itens];
  return (
    <div className={`relative flex overflow-hidden ${className}`} aria-hidden="true">
      <motion.div className="flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity }}>
        {lista.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{t}</span>
            <span className="text-[0.5em] text-dourado">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Imagem/bloco com parallax vertical leve. */
export function Parallax({ children, distancia = 80, className = "" }: { children: ReactNode; distancia?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distancia, distancia]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="h-[calc(100%+160px)] -mt-20">
        {children}
      </motion.div>
    </div>
  );
}
