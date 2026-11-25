/**
 * Entrega do orçamento ao hotel, sem o cliente precisar mandar mensagem.
 * O destino pode ser trocado por NEXT_PUBLIC_ORCAMENTO_ENDPOINT. Se a entrega
 * falhar, o site avisa e oferece o comprovante e o WhatsApp como alternativa.
 */
import { ACOMODACOES, HOTEL } from "./data";
import { brl, calcular, fmtData, hospedesTexto, type Pedido } from "./reserva";

/**
 * FormSubmit (formsubmit.co) entrega o formulário no e-mail do hotel, com o PDF anexo.
 * No primeiro envio, o FormSubmit manda ao hotel um e-mail de ativação; até alguém clicar
 * em "Activate", os orçamentos ficam guardados lá (30 dias) e não chegam. Depois da ativação
 * dá para trocar o e-mail do endereço abaixo pela sequência aleatória que o FormSubmit envia.
 */
export const ENDPOINT = process.env.NEXT_PUBLIC_ORCAMENTO_ENDPOINT || `https://formsubmit.co/ajax/${HOTEL.email}`;

export function resumoTexto(p: Pedido) {
  const { linhas, total, sinal, noites } = calcular(p);
  const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);
  return [
    `Solicitação: ${p.codigo}`,
    `Nome: ${p.nome}`,
    `WhatsApp: ${p.telefone}`,
    `Entrada: ${fmtData(p.entrada)} | Saída: ${fmtData(p.saida)} | ${noites} diária(s)`,
    `Hóspedes: ${hospedesTexto(p.adultos, p.idades)}`,
    `Quarto: ${ac?.nome ?? "-"}`,
    ...linhas.map((l) => `• ${l.rotulo} = ${brl(l.valor)}`),
    `Total estimado: ${brl(total)} | Sinal ${HOTEL.sinalPercentual}%: ${brl(sinal)}`,
    p.obs ? `Observações: ${p.obs}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function enviarAoHotel(p: Pedido, pdf: Blob): Promise<{ ok: boolean; motivo?: string }> {
  const fd = new FormData();
  fd.append("_subject", `Novo orçamento ${p.codigo} · ${p.nome}`);
  fd.append("_template", "table");
  fd.append("_captcha", "false");
  fd.append("codigo", p.codigo);
  fd.append("nome", p.nome);
  fd.append("whatsapp", p.telefone);
  fd.append("resumo", resumoTexto(p));
  fd.append("attachment", new File([pdf], `orcamento-${p.codigo}.pdf`, { type: "application/pdf" }));
  try {
    const r = await fetch(ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } });
    if (!r.ok) return { ok: false, motivo: `http-${r.status}` };
    const j = (await r.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    return String(j.success) === "true" ? { ok: true } : { ok: false, motivo: j.message || "recusado" };
  } catch {
    return { ok: false, motivo: "rede" };
  }
}
