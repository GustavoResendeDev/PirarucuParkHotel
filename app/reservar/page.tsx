import type { Metadata } from "next";
import { Suspense } from "react";
import { DayUse } from "@/components/reserva/DayUse";
import { Reserva } from "@/components/reserva/Reserva";

export const metadata: Metadata = {
  title: "Reserva e orçamento",
  description: "Consulte valores, monte seu orçamento de hospedagem com pesca opcional ou de day use nas piscinas e envie sua solicitação pelo WhatsApp.",
};

export default function Page() {
  return (
    <div className="bg-areia-clara">
      <Suspense>
        <Reserva />
      </Suspense>
      <DayUse />
    </div>
  );
}
