import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTitleChanger } from "@/components/PageTitleChanger";
import { Providers } from "@/components/Providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://leonunesbarbearia.vercel.app";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Leo Nunes Barbearia | Barbearia em Pacajus - CE",
    template: "%s | Leo Nunes Barbearia",
  },
  description:
    "Na Leo Nunes Barbearia, em Pacajus, você encontra cortes modernos, atendimento de qualidade e praticidade para agendar seu horário online.",
  keywords: [
    "Leo Nunes Barbearia",
    "Barbearia Pacajus",
    "Barbearia em Pacajus",
    "Melhor barbearia de Pacajus",
    "Corte de cabelo masculino Pacajus",
    "Corte degradê fade Pacajus",
    "Barbeiro Pacajus",
    "Barboterapia Pacajus CE",
    "Agendamento barbearia Pacajus",
    "Leo Nunes",
    "Aleffer Nunes",
    "Hélio Victor",
    "Guilherme Oliveira",
    "Salão masculino Pacajus",
    "Barbearia Ceará",
  ],
  authors: [{ name: "Leo Nunes Barbearia" }],
  creator: "Leo Nunes Barbearia",
  publisher: "Leo Nunes Barbearia",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Leo Nunes Barbearia | Barbearia em Pacajus - CE",
    description:
      "Na Leo Nunes Barbearia, em Pacajus, você encontra cortes modernos, atendimento de qualidade e praticidade para agendar seu horário online.",
    url: SITE_URL,
    siteName: "Leo Nunes Barbearia",
    images: [
      {
        url: "/images/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Leo Nunes Barbearia - Pacajus CE",
      },
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Leo Nunes Barbearia",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leo Nunes Barbearia | Barbearia em Pacajus - CE",
    description:
      "Na Leo Nunes Barbearia, em Pacajus, você encontra cortes modernos, atendimento de qualidade e praticidade para agendar seu horário online.",
    images: ["/images/hero-bg.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: "Leo Nunes Barbearia",
    alternateName: "Leo Nunes Barbearia Pacajus",
    description:
      "Na Leo Nunes Barbearia, em Pacajus, você encontra cortes modernos, atendimento de qualidade e praticidade para agendar seu horário online.",
    image: `${SITE_URL}/images/hero-bg.png`,
    logo: `${SITE_URL}/images/logo.png`,
    url: SITE_URL,
    telephone: "+5585992227064",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Joaquim Nogueira Lopes, 180",
      addressLocality: "Pacajus",
      addressRegion: "CE",
      postalCode: "62870-000",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -4.1742,
      longitude: -38.4619,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    sameAs: ["https://instagram.com/leonunesbarbearia"],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/agendar`,
        inLanguage: "pt-BR",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Agendamento de Serviços de Barbearia",
      },
    },
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Leo Nunes Barbearia" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#080B09] text-[#F5F7F3] antialiased flex flex-col min-h-screen">
        {/* Camada Fixa de Ruído / Dots Pattern (Apenas Desktop) */}
        <div className="quadrado hidden md:block" aria-hidden="true" />
        <Providers>
          <ServiceWorkerRegister />
          <PageTitleChanger />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
