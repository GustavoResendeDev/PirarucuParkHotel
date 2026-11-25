/**
 * Comprovante (ticket) do orçamento, desenhado no navegador com a identidade do
 * hotel. Sai como imagem (PNG) e como PDF de uma página, sem bibliotecas.
 */
import { ACOMODACOES, HOTEL } from "./data";
import { brl, calcular, fmtData, hospedesTexto, type Pedido } from "./reserva";

const L = 1200;
const A_MIN = 1700;
const COR = {
  verde: "#364339",
  verdeEscuro: "#263028",
  salvia: "#70826a",
  creme: "#f4f1e6",
  papel: "#fbfaf4",
  dourado: "#c8b28a",
  douradoEscuro: "#8f7a55",
  douradoClaro: "#e9dfcb",
  tinta: "#2c372f",
};

function familia(variavel: string, reserva: string) {
  const v = getComputedStyle(document.body).getPropertyValue(variavel).trim();
  return v ? `${v}, ${reserva}` : reserva;
}

function carregar(src: string) {
  return new Promise<HTMLImageElement | null>((ok) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = src;
  });
}

/** Quebra o texto em linhas que cabem na largura. */
function linhas(ctx: CanvasRenderingContext2D, texto: string, largura: number, max = 99) {
  const palavras = texto.split(/\s+/);
  const out: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > largura && atual) {
      out.push(atual);
      atual = p;
    } else atual = teste;
  }
  if (atual) out.push(atual);
  if (out.length > max) {
    out.length = max;
    out[max - 1] = out[max - 1].replace(/\s*\S*$/, "") + "…";
  }
  return out;
}

function espacado(ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, esp: number, alinhar: "left" | "center" | "right" = "left") {
  const chars = [...texto];
  const largura = chars.reduce((s, c) => s + ctx.measureText(c).width + esp, -esp);
  let cx = alinhar === "center" ? x - largura / 2 : alinhar === "right" ? x - largura : x;
  const antes = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + esp;
  }
  ctx.textAlign = antes;
}

export async function desenharTicket(p: Pedido, emitidoEm = new Date()): Promise<HTMLCanvasElement> {
  await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const logo = await carregar(`${base}/marca/logo-dourado.webp`);
  const serif = familia("--font-marcellus", "Georgia, serif");
  const sans = familia("--font-jost", "system-ui, sans-serif");

  const R_RODAPE = 250;
  const pintar = (A: number) => {
    const cv = document.createElement("canvas");
    cv.width = L;
    cv.height = A;
    const ctx = cv.getContext("2d")!;
    const { linhas: itens, total, sinal, noites } = calcular(p);
    const ac = ACOMODACOES.find((a) => a.slug === p.acomodacao);

    // papel
    ctx.fillStyle = COR.creme;
    ctx.fillRect(0, 0, L, A);

    // cabeçalho verde com o padrão de listras da marca
    const H = 400;
    ctx.fillStyle = COR.verde;
    ctx.fillRect(0, 0, L, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, L, H);
    ctx.clip();
    ctx.strokeStyle = "rgba(200,178,138,.16)";
    ctx.lineWidth = 1.6;
    for (let x = -H; x < L + H; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + H * 0.78, 0);
      ctx.stroke();
    }
    ctx.restore();
    const grad = ctx.createRadialGradient(L / 2, H / 2, 40, L / 2, H / 2, L * 0.6);
    grad.addColorStop(0, "rgba(54,67,57,.92)");
    grad.addColorStop(1, "rgba(38,48,40,.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, L, H);
    if (logo) {
      const w = 330;
      const h = (logo.height / logo.width) * w;
      ctx.drawImage(logo, (L - w) / 2, 60, w, h);
    }
    ctx.fillStyle = COR.dourado;
    ctx.font = `500 22px ${sans}`;
    espacado(ctx, "COMPROVANTE DE ORÇAMENTO", L / 2, H - 50, 7, "center");

    // picote do ticket
    ctx.fillStyle = "#ddd5bb";
    for (const x of [0, L]) {
      ctx.beginPath();
      ctx.arc(x, H, 34, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = COR.creme;
    ctx.strokeStyle = "rgba(54,67,57,.35)";
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, H + 2);
    ctx.lineTo(L - 60, H + 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const M = 90;
    let y = H + 100;

    // código e status
    ctx.textAlign = "left";
    ctx.fillStyle = COR.douradoEscuro;
    ctx.font = `500 20px ${sans}`;
    espacado(ctx, "SOLICITAÇÃO", M, y, 5);
    ctx.fillStyle = COR.verde;
    ctx.font = `64px ${serif}`;
    ctx.fillText(p.codigo, M, y + 72);
    ctx.textAlign = "right";
    ctx.fillStyle = COR.tinta;
    ctx.font = `400 22px ${sans}`;
    ctx.fillText(`Emitido em ${emitidoEm.toLocaleDateString("pt-BR")} às ${emitidoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, L - M, y + 2);
    // selo de status
    const selo = "AGUARDANDO CONFIRMAÇÃO";
    ctx.font = `500 18px ${sans}`;
    const sw = [...selo].reduce((s, c) => s + ctx.measureText(c).width + 3, 24);
    ctx.strokeStyle = COR.salvia;
    ctx.lineWidth = 2;
    ctx.strokeRect(L - M - sw, y + 32, sw, 46);
    ctx.fillStyle = COR.salvia;
    espacado(ctx, selo, L - M - sw / 2, y + 62, 3, "center");
    ctx.textAlign = "left";
    y += 140;

    function secao(titulo: string) {
      ctx.fillStyle = COR.douradoEscuro;
      ctx.font = `500 20px ${sans}`;
      espacado(ctx, titulo, M, y, 5);
      ctx.strokeStyle = "rgba(143,122,85,.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(M, y + 18);
      ctx.lineTo(L - M, y + 18);
      ctx.stroke();
      y += 62;
    }
    function campo(k: string, v: string, maxLinhas = 1) {
      ctx.font = `400 26px ${sans}`;
      ctx.fillStyle = "rgba(44,55,47,.62)";
      ctx.textAlign = "left";
      ctx.fillText(k, M, y);
      ctx.fillStyle = COR.tinta;
      ctx.textAlign = "right";
      const ls = linhas(ctx, v || "-", L - 2 * M - 260, maxLinhas);
      ls.forEach((l, i) => ctx.fillText(l, L - M, y + i * 36));
      ctx.textAlign = "left";
      y += 26 + ls.length * 36;
    }

    secao("HÓSPEDE");
    campo("Nome", p.nome);
    campo("WhatsApp", p.telefone);
    if (p.obs) campo("Observações", p.obs, 2);
    y += 16;

    secao("ESTADIA");
    campo("Entrada", `${fmtData(p.entrada)}, a partir das ${HOTEL.checkin}`);
    campo("Saída", `${fmtData(p.saida)}, até as ${HOTEL.checkout}`);
    campo("Diárias", String(noites));
    campo("Hóspedes", hospedesTexto(p.adultos, p.idades), 2);
    campo("Quarto", ac?.nome ?? "-");
    y += 16;

    secao("VALORES");
    ctx.font = `400 23px ${sans}`;
    for (const it of itens.slice(0, 7)) {
      const ls = linhas(ctx, it.rotulo, L - 2 * M - 220, 2);
      ctx.fillStyle = "rgba(44,55,47,.8)";
      ls.forEach((l, i) => ctx.fillText(l, M, y + i * 32));
      ctx.textAlign = "right";
      ctx.fillStyle = COR.tinta;
      ctx.fillText(brl(it.valor), L - M, y);
      ctx.textAlign = "left";
      y += 14 + ls.length * 32;
    }
    y += 18;
    ctx.strokeStyle = "rgba(54,67,57,.3)";
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(L - M, y);
    ctx.stroke();
    y += 64;
    ctx.fillStyle = COR.tinta;
    ctx.font = `400 28px ${sans}`;
    ctx.fillText("Total estimado", M, y);
    ctx.textAlign = "right";
    ctx.fillStyle = COR.verde;
    ctx.font = `60px ${serif}`;
    ctx.fillText(brl(total), L - M, y + 6);
    ctx.textAlign = "left";
    y += 50;
    ctx.font = `400 24px ${sans}`;
    ctx.fillStyle = "rgba(44,55,47,.75)";
    ctx.fillText(`Sinal de ${HOTEL.sinalPercentual}% para garantir a reserva`, M, y);
    ctx.textAlign = "right";
    ctx.fillStyle = COR.tinta;
    ctx.fillText(brl(sinal), L - M, y);
    ctx.textAlign = "left";

    const fim = y;
    // rodapé verde
    const R = 250;
    ctx.fillStyle = COR.verde;
    ctx.fillRect(0, A - R, L, R);
    ctx.fillStyle = COR.douradoClaro;
    ctx.font = `400 23px ${sans}`;
    const aviso = linhas(
      ctx,
      `Este é um orçamento, não uma reserva confirmada. A equipe do hotel entra em contato pelo WhatsApp informado para confirmar a disponibilidade. A reserva fica garantida com o sinal de ${HOTEL.sinalPercentual}%. Restaurante e bebidas são pagos à parte.`,
      L - 2 * M,
      4,
    );
    aviso.forEach((l, i) => ctx.fillText(l, M, A - R + 62 + i * 34));
    ctx.fillStyle = COR.dourado;
    ctx.font = `500 19px ${sans}`;
    espacado(ctx, `${HOTEL.nome.toUpperCase()}  ·  ${HOTEL.cidade.toUpperCase()}-${HOTEL.uf}  ·  ${HOTEL.whatsappExibicao}`, L / 2, A - 34, 3, "center");
    return { cv, fim };
  };
  const rascunho = pintar(4000);
  return pintar(Math.max(A_MIN, Math.ceil(rascunho.fim + 90 + R_RODAPE))).cv;
}

const blob = (cv: HTMLCanvasElement, tipo: string, q?: number) => new Promise<Blob>((ok, erro) => cv.toBlob((b) => (b ? ok(b) : erro(new Error("canvas"))), tipo, q));

/** PDF de uma página (A5) com o ticket como imagem JPEG. */
export async function ticketPDF(cv: HTMLCanvasElement): Promise<Blob> {
  const jpg = new Uint8Array(await (await blob(cv, "image/jpeg", 0.92)).arrayBuffer());
  const W = 420;
  const Hp = Math.round((W * cv.height) / cv.width);
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (b: Uint8Array | string) => {
    const u = typeof b === "string" ? enc.encode(b) : b;
    partes.push(u);
    pos += u.length;
  };
  const obj = (n: number, corpo: string) => {
    offsets[n] = pos;
    push(`${n} 0 obj\n${corpo}\nendobj\n`);
  };
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${Hp}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = pos;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
  push(jpg);
  push("\nendstream\nendobj\n");
  const conteudo = `q ${W} 0 0 ${Hp} 0 0 cm /Im0 Do Q`;
  obj(5, `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);
  const xref = pos;
  let tabela = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) tabela += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  push(`${tabela}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(partes as BlobPart[], { type: "application/pdf" });
}

export const ticketPNG = (cv: HTMLCanvasElement) => blob(cv, "image/png");

export function baixar(b: Blob, nome: string) {
  const url = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
