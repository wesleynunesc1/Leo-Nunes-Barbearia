import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://leonunesbarbearia.com.br"),
  title: {
    default: "Léo Nunes Barbearia | Cortes, Barbas e Estilo em Pacajus - CE",
    template: "%s | Léo Nunes Barbearia",
  },
  description:
    "Barbearia de alto padrão em Pacajus - CE. Cortes modernos, barbas desenhadas, visagismo e atendimento pontual. Agende online seu horário com nossa equipe de barbeiros.",
  keywords: [
    "Barbearia Pacajus",
    "Léo Nunes Barbearia",
    "Corte de cabelo Pacajus",
    "Barbeiro Pacajus",
    "Barboterapia Pacajus CE",
    "Agendamento barbearia",
    "Léo Nunes",
    "Aleffer Nunes",
    "Hélio Victor",
    "Guilherme Oliveira",
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
      "Na Léo Nunes Barbearia você encontra cortes de precisão, barbas alinhadas e ambiente moderno em Pacajus - CE. Agende seu horário online.",
    url: "https://leonunesbarbearia.com.br/",
    siteName: "Léo Nunes Barbearia",
    images: [
      {
        url: "/images/hero-bg.png",
        width: 1080,
        height: 1080,
        alt: "Léo Nunes Barbearia - Pacajus CE",
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
    icon: "/images/logo.png",
    apple: "/images/logo.png",
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
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
