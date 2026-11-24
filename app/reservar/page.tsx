import type { Metadata } from "next";
import { Suspense } from "react";
import { Reserva } from "@/components/reserva/Reserva";

export const metadata: Metadata = {
  title: "Reserva e orçamento",
  description: "Consulte valores, monte seu orçamento de hospedagem com pesca opcional e envie sua solicitação de reserva pelo WhatsApp.",
};

export default function Page() {
  return (
    <div className="bg-areia-clara">
      <Suspense>
        <Reserva />
      </Suspense>
    </div>
  );
}
