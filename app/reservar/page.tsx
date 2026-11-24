import type { Metadata } from "next";
import { Suspense } from "react";
import { Reserva } from "@/components/reserva/Reserva";

export const metadata: Metadata = {
  title: "Reserva e orçamento",
  description: "Consulte valores, monte seu orçamento de hospedagem ou day use e envie sua solicitação de reserva pelo WhatsApp.",
};

export default function Page() {
  return (
    <div className="bg-creme-claro">
      <Suspense>
        <Reserva />
      </Suspense>
    </div>
  );
}
