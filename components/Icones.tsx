/**
 * Ícones em traço fino, no desenho da sinalização oficial do hotel.
 */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IconeRestaurante = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M10 28a14 14 0 0 1 28 0z" /><path d="M24 14v-2" /><circle cx="24" cy="11" r="1.5" /><path d="M8 28h32" />
    <path d="M12 34c3 0 5-2 8-2h7a2 2 0 0 1 0 4h-6" /><path d="M8 32v8h4v-6" /><path d="M27 34l7-3a2 2 0 0 1 2 3l-9 5H12" />
  </svg>
);
export const IconePiscina = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M6 18a14 14 0 0 1 24-6l-12 6z" /><path d="M18 18l6 20" /><path d="M18 30h20l4 8" /><path d="M22 34h18" /><path d="M24 30l-2 8" /><path d="M34 34l-2 4" />
  </svg>
);
export const IconePesca = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M8 40L38 8" /><path d="M38 8v28a3 3 0 0 1-6 0" /><circle cx="16" cy="32" r="1.4" /><path d="M20 28c2 2 4 2 6 0s4-2 6 0" />
  </svg>
);
export const IconePizza = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M24 8L8 38h32z" /><path d="M6 40h36" /><circle cx="22" cy="24" r="2.2" /><circle cx="28" cy="30" r="1.8" /><circle cx="19" cy="32" r="1.5" />
  </svg>
);
export const IconeServico = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M24 14c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" /><path d="M36 6c.4 3 1.6 4.2 4.6 4.6-3 .4-4.2 1.6-4.6 4.6-.4-3-1.6-4.2-4.6-4.6 3-.4 4.2-1.6 4.6-4.6z" /><path d="M11 10v6M8 13h6" />
  </svg>
);
export const IconeCafe = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M10 20h24v8a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" /><path d="M34 23h3a4 4 0 0 1 0 8h-4" /><path d="M6 42h32" /><path d="M18 8c-2 3 2 5 0 8M24 8c-2 3 2 5 0 8" />
  </svg>
);
export const IconeBanheira = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M6 24h36v4a10 10 0 0 1-10 10H16A10 10 0 0 1 6 28z" /><path d="M12 24V12a4 4 0 0 1 8 0" /><path d="M14 38l-2 4M34 38l2 4" />
  </svg>
);
export const IconePessoa = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <circle cx="24" cy="12" r="4" /><path d="M17 20h14v12h-4v10h-6V32h-4z" />
  </svg>
);
export const IconeSofa = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M10 22v-4a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v4" /><path d="M6 24a3 3 0 0 1 6 0v6h24v-6a3 3 0 0 1 6 0v10H6z" /><path d="M10 34v4M38 34v4" />
  </svg>
);
export const IconeSemBebida = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M18 8h12l-2 14a4 4 0 0 1-8 0z" /><path d="M24 26v12M18 40h12" /><path d="M8 40L40 8" />
  </svg>
);
export const IconeRelogio = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <circle cx="24" cy="24" r="16" /><path d="M24 14v10l7 5" />
  </svg>
);
export const IconeCalendario = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={1.3}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M8 14h2M14 14h2M8 17h2" />
  </svg>
);
export const IconeHospedes = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={1.3}>
    <circle cx="9" cy="8" r="3.2" /><path d="M3 20c.6-3.6 3-5.6 6-5.6s5.4 2 6 5.6" /><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.8c1.8.6 3 2.4 3.5 5.2" />
  </svg>
);
export const IconeCama = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <path d="M6 36V14M6 28h36v8M42 28v-4a6 6 0 0 0-6-6H22v10" /><rect x="10" y="20" width="9" height="6" rx="3" /><path d="M6 36v4M42 36v4" />
  </svg>
);
export const IconeLago = ({ className = "" }: P) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
    <circle cx="33" cy="15" r="5" /><path d="M4 30l10-12 7 8 4-4 9 8" /><path d="M4 36c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2" /><path d="M8 42c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2" />
  </svg>
);
export const IconeLocal = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={1.3}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const IconeInstagram = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={1.3}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);
export const IconeSeta = ({ className = "" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} strokeWidth={1.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
