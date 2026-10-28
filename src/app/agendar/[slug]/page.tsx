import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDynamicBarbers, getDynamicBarberBySlug } from "@/lib/wixDynamicSync";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceList } from "@/components/ServiceList";
import { ArrowLeft, Users, Calendar, ShieldCheck, Phone } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const barbers = await getDynamicBarbers();
  return barbers.map((b) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const barber = await getDynamicBarberBySlug(slug);

  if (!barber) {
    return {
      title: "Profissional Não Encontrado",
    };
  }

  return {
    title: `Agendar com ${barber.name} | Serviços & Horários`,
    description: `Confira os serviços de ${barber.name} na Léo Nunes Barbearia em Pacajus - CE. Cortes, barbas e tratamentos com agendamento online.`,
    alternates: {
      canonical: `https://leonunesbarbearia.com.br/agendar/${barber.slug}`,
    },
    openGraph: {
      title: `Agendar com ${barber.name} | Léo Nunes Barbearia`,
      description: barber.tagline,
      images: [
        {
          url: barber.photo,
          width: 800,
          height: 800,
          alt: `Barbeiro ${barber.name}`,
        },
      ],
    },
  };
}

export default async function BarberServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const barber = await getDynamicBarberBySlug(slug);

  if (!barber) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-6 sm:space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Agendar", href: "/agendar" },
          { label: barber.name },
        ]}
      />

      {/* Compact Hero Card with selected barber */}
      <div className="editorial-card rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border border-[#202A22]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Barber Photo */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#25C440]/40 shrink-0 bg-[#121A14]">
            <Image
              src={barber.photo}
              alt={barber.name}
              fill
              priority
              className="object-cover object-top"
              sizes="96px"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#142618] text-[#25C440] border border-[#25C440]/30">
              {barber.role}
            </div>
            <h1 className="font-heading text-xl sm:text-4xl font-extrabold text-[#F5F7F3]">
              {barber.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#A6AEA8] max-w-xl">
              {barber.tagline}
            </p>
          </div>
        </div>

        {/* Change Barber Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <Link
            href="/agendar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-[#F5F7F3] hover:text-[#25C440] bg-[#141B15] hover:bg-[#1A241C] border border-[#222E25] hover:border-[#25C440]/40 px-4 py-2.5 sm:py-3 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trocar Barbeiro</span>
          </Link>
        </div>
      </div>

      {/* Services Section Header */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#25C440]">
          <span className="w-2 h-2 rounded-full bg-[#25C440]" />
          <span>Passo 2 de 2: Escolha o Serviço</span>
        </div>
        <h2 className="font-heading text-xl sm:text-3xl font-bold text-[#F5F7F3]">
          Serviços Disponíveis com {barber.name}
        </h2>
        <p className="text-xs sm:text-sm text-[#9BA59E]">
          Clique no botão do serviço desejado para abrir diretamente a agenda oficial com os horários livres.
        </p>
      </div>

      {/* Services List with Filter */}
      <ServiceList services={barber.services} barberName={barber.name} barberSlug={barber.slug} />

      {/* Support and Safety Note */}
      <div className="pt-5 sm:pt-6 border-t border-[#1C2620] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[#9BA59E] text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#25C440] shrink-0" />
          <span>
            Ao clicar em &quot;Escolher Dia e Horário&quot;, você continua no calendário Wix original de {barber.name}.
          </span>
        </div>

        <a
          href="https://wa.me/5585992227064"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#25C440] hover:underline font-semibold"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Atendimento de Suporte via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
