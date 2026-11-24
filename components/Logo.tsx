/* eslint-disable @next/next/no-img-element */
/**
 * Logo oficial (extraído do manual da marca) em duas versões:
 * dourado para fundos verdes e verde para fundos claros.
 */
export function Logo({ cor = "dourado", className = "", somentePeixe = false }: { cor?: "dourado" | "verde"; className?: string; somentePeixe?: boolean }) {
  const arquivo = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/marca/${somentePeixe ? "peixe" : "logo"}-${cor}.webp`;
  return (
    <img
      src={arquivo}
      alt={somentePeixe ? "" : "Pirarucu Park Hotel"}
      aria-hidden={somentePeixe || undefined}
      width={somentePeixe ? 381 : 521}
      height={somentePeixe ? 241 : 366}
      className={`h-auto select-none ${className}`}
      draggable={false}
    />
  );
}
