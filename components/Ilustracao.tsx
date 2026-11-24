/**
 * Palmeira e fachada em sálvia, inspiradas na ilustração do manual da marca.
 */
export function PalmeiraFachada({ className = "", cor = "#70826a" }: { className?: string; cor?: string }) {
  const folhas = [
    "M150 96 C 120 70, 80 66, 40 84",
    "M150 96 C 124 60, 96 40, 62 36",
    "M150 96 C 140 56, 128 28, 104 10",
    "M150 96 C 158 56, 172 30, 196 14",
    "M150 96 C 180 62, 214 50, 250 56",
    "M150 96 C 186 82, 224 90, 262 110",
    "M150 96 C 120 96, 92 110, 70 136",
    "M150 96 C 176 104, 196 122, 206 150",
  ];
  return (
    <svg viewBox="0 0 600 260" className={className} aria-hidden="true" fill="none" stroke={cor} strokeLinecap="round">
      {/* fachada */}
      <path d="M0 150 H300" strokeWidth="14" />
      <path d="M210 168 H600 M226 168 v92 M210 182 H600" strokeWidth="2" />
      <path d="M0 176 H180 V260 M30 176 V260 M90 176 V260 M150 176 V260" strokeWidth="2" />
      <path d="M40 120 L70 260 M60 120 L30 260" strokeWidth="2" />
      {Array.from({ length: 46 }, (_, k) => (
        <path key={k} d={`M${236 + k * 8} 200 v${44 + ((k * 7) % 13)}`} strokeWidth="5" strokeDasharray="2 3" opacity=".75" />
      ))}
      {/* palmeira */}
      <path d="M150 96 C 154 150, 150 210, 156 260" strokeWidth="5" />
      {folhas.map((d, k) => (
        <g key={k}>
          <path d={d} strokeWidth="2.2" />
          <path d={d} strokeWidth="9" strokeDasharray="1.2 3.2" opacity=".85" />
        </g>
      ))}
    </svg>
  );
}
