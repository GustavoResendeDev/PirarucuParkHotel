/**
 * Padrão de listras geométricas do papel timbrado e do aviso de porta:
 * faixas diagonais paralelas com quebras em chevron.
 */
export function Padrao({ className = "", cor = "#c8b28a", opacidade = 1 }: { className?: string; cor?: string; opacidade?: number }) {
  const id = `pp-${cor.replace("#", "")}`;
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%" style={{ opacity: opacidade }}>
      <defs>
        <pattern id={id} width="44" height="88" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <path d="M6 0v34l8 8v46" fill="none" stroke={cor} strokeWidth="1.1" />
          <path d="M24 0v58l8 8v22" fill="none" stroke={cor} strokeWidth="1.1" />
          <path d="M38 0v14l-6 6v68" fill="none" stroke={cor} strokeWidth="1.1" opacity=".7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
