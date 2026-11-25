"use client";
import { useEffect, useState } from "react";
import { DAY_USE, HOTEL } from "@/lib/data";
import { addDias, brl, mensagemDayUse, proximaSexta, toISO, waLink } from "@/lib/reserva";
import { IconePiscina } from "../Icones";
import { IconeWhatsApp } from "../WhatsAppFlutuante";

/** Orçamento de day use na área das piscinas, para quem não está hospedado. */
export function DayUse() {
  const [data, setData] = useState(() => toISO(addDias(proximaSexta(), 1)));
  const [pessoas, setPessoas] = useState(2);
  const [hoje, setHoje] = useState("");
  useEffect(() => setHoje(toISO(new Date())), []);

  const botao = "pressionavel grid size-11 cursor-pointer place-items-center rounded-md border border-marfim/25 text-lg hover:bg-marfim/10 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <section id="day-use" className="scroll-mt-28 bg-verde text-marfim">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <IconePiscina className="size-11 text-dourado" />
          <h2 className="font-display mt-6 text-4xl md:text-5xl">Day use nas piscinas</h2>
          <p className="mt-4 max-w-md text-marfim/75">
            Não vai se hospedar? Passe o dia na área das piscinas por {brl(DAY_USE.preco)} por pessoa. A pesca esportiva continua exclusiva para hóspedes, e o restaurante abre de {HOTEL.restaurante.toLowerCase()}.
          </p>
        </div>
        <div className="rounded-2xl border border-dourado/25 bg-verde-noite/40 p-7 md:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-[15px] text-dourado-claro">Data</span>
              <input
                type="date"
                value={data}
                min={hoje}
                onChange={(e) => setData(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-marfim/20 bg-transparent px-5 py-4 text-lg text-marfim outline-none [color-scheme:dark] focus:border-dourado focus-visible:ring-2 focus-visible:ring-dourado"
              />
            </label>
            <div>
              <span className="text-[15px] text-dourado-claro">Pessoas</span>
              <div className="mt-2 flex h-[62px] items-center justify-between rounded-2xl border border-marfim/20 px-3">
                <button type="button" aria-label="Diminuir pessoas" disabled={pessoas <= 1} onClick={() => setPessoas(pessoas - 1)} className={botao}>−</button>
                <span aria-live="polite" className="text-lg tabular-nums">{pessoas}</span>
                <button type="button" aria-label="Aumentar pessoas" disabled={pessoas >= 30} onClick={() => setPessoas(pessoas + 1)} className={botao}>+</button>
              </div>
            </div>
          </div>
          <div className="mt-7 flex items-end justify-between border-t border-marfim/15 pt-5">
            <span className="text-[15px] text-marfim/70">{pessoas} × {brl(DAY_USE.preco)}</span>
            <span className="font-display text-4xl text-dourado-claro">{brl(pessoas * DAY_USE.preco)}</span>
          </div>
          <a
            href={waLink(mensagemDayUse(data, pessoas))}
            target="_blank"
            rel="noopener"
            className="pressionavel mt-7 flex h-14 items-center justify-center gap-2 rounded-md bg-[#1f7a46] text-[15px] font-medium text-white hover:bg-[#1a6b3d]"
          >
            <IconeWhatsApp className="size-5" /> Consultar day use pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
