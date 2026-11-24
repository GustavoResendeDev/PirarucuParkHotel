"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Foto com fallback ilustrado.
 * Enquanto o arquivo em /public/fotos não existir, mostra uma arte em degradê
 * com o nome do ambiente, para o layout já ficar correto.
 */
export function Foto({
  src,
  alt,
  paleta = ["#4f5e49", "#1e261d"],
  rotulo,
  className = "",
  prioridade = false,
}: {
  src?: string;
  alt: string;
  paleta?: [string, string];
  rotulo?: string;
  className?: string;
  prioridade?: boolean;
}) {
  const [falhou, setFalhou] = useState(!src);
  const img = useRef<HTMLImageElement>(null);
  // o erro pode acontecer antes da hidratação; confere o estado da imagem ao montar
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFalhou(true);
  }, []);
  return (
    <div className={`relative overflow-hidden bg-oliva-800 ${className}`}>
      {!falhou && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`}
          alt={alt}
          loading={prioridade ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFalhou(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div role="img" aria-label={`${alt} (foto a ser enviada pelo hotel)`} className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 20% 10%, ${paleta[0]}, ${paleta[1]})` }}>
          <svg className="absolute inset-0 size-full opacity-[.18]" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <pattern id="ondas" width="40" height="14" patternUnits="userSpaceOnUse">
                <path d="M0 7 Q10 0 20 7 T40 7" fill="none" stroke="#efe8d8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect y="170" width="400" height="130" fill="url(#ondas)" />
            <circle cx="300" cy="80" r="46" fill="#efe8d8" opacity=".5" />
          </svg>
          {rotulo && (
            <span className="absolute bottom-4 left-4 rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold tracking-wider text-creme uppercase backdrop-blur">
              {rotulo} · foto em breve
            </span>
          )}
        </div>
      )}
    </div>
  );
}
