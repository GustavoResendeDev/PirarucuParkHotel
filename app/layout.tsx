import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFlutuante } from "@/components/WhatsAppFlutuante";
import { Preloader } from "@/components/Preloader";
import { HOTEL } from "@/lib/data";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pirarucuparkhotel.com.br"), // EXEMPLO: domínio a definir
  title: {
    default: `${HOTEL.nome} · Hotel com pesqueiro em ${HOTEL.cidade} (${HOTEL.uf})`,
    template: `%s · ${HOTEL.nome}`,
  },
  description: `Hospedagem, pesca esportiva e piscina em ${HOTEL.cidade}, a ${HOTEL.distancia}. Consulte valores, faça seu orçamento e solicite sua reserva.`,
  openGraph: { type: "website", locale: "pt_BR", siteName: HOTEL.nome },
};

export const viewport: Viewport = { themeColor: "#1e261d" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: HOTEL.nome,
  description: HOTEL.slogan,
  address: { "@type": "PostalAddress", addressLocality: HOTEL.cidade, addressRegion: HOTEL.uf, addressCountry: "BR" },
  sameAs: [HOTEL.instagramHotel],
  amenityFeature: ["Pesca esportiva", "Piscina", "Café da manhã", "Restaurante"].map((n) => ({
    "@type": "LocationFeatureSpecification",
    name: n,
    value: true,
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Preloader />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFlutuante />
      </body>
    </html>
  );
}
