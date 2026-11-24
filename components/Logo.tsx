/**
 * Releitura em SVG do logo do Instagram (peixe em traço + "PIRARUCU" + "PARK HOTEL").
 * Substituir pelo arquivo oficial (public/logo.svg) quando o hotel enviar.
 */
export function Logo({ className = "", mostrarPeixe = true }: { className?: string; mostrarPeixe?: boolean }) {
  return (
    <svg viewBox="0 0 220 92" className={className} role="img" aria-label="Pirarucu Park Hotel">
      {mostrarPeixe && <PeixeTraco x={62} y={2} w={96} />}
      <text x="110" y="70" textAnchor="middle" fontFamily="var(--font-cormorant), Georgia, serif" fontSize="34" fontWeight="600" letterSpacing="3" fill="currentColor">
        PIRARUCU
      </text>
      <text x="110" y="87" textAnchor="middle" fontFamily="var(--font-manrope), sans-serif" fontSize="8.5" fontWeight="600" letterSpacing="5.5" fill="currentColor" opacity=".75">
        PARK HOTEL
      </text>
    </svg>
  );
}

export function PeixeTraco({ x = 0, y = 0, w = 100, className = "" }: { x?: number; y?: number; w?: number; className?: string }) {
  const s = w / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 24 C 18 10, 52 6, 76 14 L 92 6 L 88 20 L 96 32 L 78 27 C 52 36, 20 36, 4 24 Z" />
      <path d="M12 22 a1.6 1.6 0 1 0 0.1 0" />
      <path d="M30 14 c 4 6 4 14 0 20 M40 12 c 4 7 4 16 0 23 M50 12 c 4 7 4 16 0 23 M60 13 c 3 6 3 14 0 20" opacity=".55" />
      <path d="M44 10 c 6 -6 14 -6 20 -1" />
      <path d="M40 34 c 6 4 12 4 16 1" />
    </g>
  );
}
