import type { Metadata } from "next";
import { Suspense } from "react";
import { DayUse } from "@/components/reserva/DayUse";
import { LivroReserva } from "@/components/reserva/LivroReserva";

export const metadata: Metadata = {
  title: "Reserva e orçamento",
  description: "Consulte valores, monte seu orçamento de hospedagem com pesca opcional ou de day use nas piscinas e envie sua solicitação ao hotel.",
};

export default function Page() {
  return (
    <div className="bg-areia-clara">
      <Suspense>
        <LivroReserva />
      </Suspense>
      <DayUse />
    </div>
  );
}
