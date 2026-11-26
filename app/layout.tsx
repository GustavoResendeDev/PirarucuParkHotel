import type { Metadata, Viewport } from "next";
import { Marcellus } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFlutuante } from "@/components/WhatsAppFlutuante";
import { Preloader } from "@/components/Preloader";
import { Movimento } from "@/components/Movimento";
import { HOTEL } from "@/lib/data";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://gustavoresendedev.github.io"), // trocar quando houver domínio próprio
  title: {
    default: `${HOTEL.nome} · Hotel com pesqueiro em ${HOTEL.cidade} (${HOTEL.uf})`,
    template: `%s · ${HOTEL.nome}`,
  },
  description: `Hotel com pesca esportiva e piscinas aquecidas em ${HOTEL.cidade} (${HOTEL.uf}), a ${HOTEL.distancia}. Consulte valores, monte seu orçamento e solicite sua reserva.`,
  openGraph: { type: "website", locale: "pt_BR", siteName: HOTEL.nome },
};

export const viewport: Viewport = { themeColor: "#364339" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: HOTEL.nome,
  description: "Hotel com pesca esportiva e piscinas aquecidas em Itapuranga, Goiás.",
  address: { "@type": "PostalAddress", addressLocality: HOTEL.cidade, addressRegion: HOTEL.uf, addressCountry: "BR" },
  sameAs: [HOTEL.instagramHotel],
  amenityFeature: ["Pesca esportiva", "Piscinas aquecidas", "Café da manhã", "Restaurante"].map((n) => ({
    "@type": "LocationFeatureSpecification",
    name: n,
    value: true,
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={marcellus.variable} suppressHydrationWarning>
      <head>
        {/* marca que o JavaScript rodou: só então o conteúdo pode começar escondido para animar */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Movimento>
        <Preloader />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFlutuante />
        </Movimento>
      </body>
    </html>
  );
}
