import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTitleChanger } from "@/components/PageTitleChanger";

export const metadata: Metadata = {
  metadataBase: new URL("https://leonunesbarbearia.com.br"),
  title: {
    default: "Léo Nunes Barbearia | Cortes, Barbas e Estilo em Pacajus - CE",
    template: "%s | Léo Nunes Barbearia",
  },
  description:
    "A barbearia referência em Pacajus - CE. Cortes masculinos de alta precisão, barboterapia, visagismo e atendimento pontual. Agende online seu horário com barbeiros especialistas.",
  keywords: [
    "Barbearia Pacajus",
    "Barbearia em Pacajus",
    "Melhor barbearia de Pacajus",
    "Léo Nunes Barbearia",
    "Corte de cabelo masculino Pacajus",
    "Corte degradê fade Pacajus",
    "Barbeiro Pacajus",
    "Barboterapia Pacajus CE",
    "Agendamento barbearia Pacajus",
    "Léo Nunes",
    "Aleffer Nunes",
    "Hélio Victor",
    "Guilherme Oliveira",
    "Salão masculino Pacajus",
    "Barbearia Ceará",
  ],
  authors: [{ name: "Léo Nunes Barbearia" }],
  creator: "Léo Nunes Barbearia",
  publisher: "Léo Nunes Barbearia",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://leonunesbarbearia.com.br/",
  },
  openGraph: {
    title: "Léo Nunes Barbearia | Seu Estilo. Nossa Assinatura.",
    description:
      "A barbearia referência em Pacajus - CE. Cortes de precisão, barboterapia e atendimento pontual. Agende online seu horário.",
    url: "https://leonunesbarbearia.com.br/",
    siteName: "Léo Nunes Barbearia",
    images: [
      {
        url: "/images/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Léo Nunes Barbearia - Pacajus CE",
      },
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Léo Nunes Barbearia",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Léo Nunes Barbearia | Pacajus - CE",
    description: "Cortes modernos, barbas alinhadas e agendamento prático online.",
    images: ["/images/hero-bg.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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
    name: "Léo Nunes Barbearia",
    image: "https://leonunesbarbearia.com.br/images/hero-bg.png",
    logo: "https://leonunesbarbearia.com.br/images/logo.png",
    url: "https://leonunesbarbearia.com.br",
    telephone: "+5585992227064",
    priceRange: "$$",
    description: "Barbearia referência em Pacajus - CE. Cortes masculinos de alta precisão, degradê, visagismo e barboterapia.",
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
    sameAs: [
      "https://instagram.com/leonunesbarbearia",
    ],
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <PageTitleChanger />
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
