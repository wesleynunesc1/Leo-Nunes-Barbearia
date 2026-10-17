import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllBarbers } from "@/data/barbers";
import { BarberCard } from "@/components/BarberCard";
import { ShieldCheck, Calendar, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Escolha seu Barbeiro | Agendamento Online",
  description:
    "Selecione o profissional de sua preferência na Léo Nunes Barbearia: Léo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira.",
  alternates: {
    canonical: "https://leonunesbarbearia.com.br/agendar",
  },
};

export default function AgendarBarbeiroPage() {
  const barbers = getAllBarbers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Agendar Horário" }]} />

      {/* Header / Intro */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A14] border border-[#25C440]/30 text-xs font-semibold tracking-wider uppercase text-[#25C440]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25C440]" />
          <span>Passo 1 de 2: Selecione o Profissional</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-black text-[#F5F7F3] leading-tight">
          ESCOLHA SEU BARBEIRO
        </h1>

        <p className="text-base text-[#A6AEA8] leading-relaxed">
          O próximo corte começa aqui. Cada profissional possui sua agenda e lista exclusiva de serviços.
          Selecione o barbeiro com quem deseja agendar para conferir as opções disponíveis.
        </p>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {barbers.map((barber, index) => (
          <BarberCard key={barber.id} barber={barber} priority={index < 2} />
        ))}
      </div>

      {/* Explanatory Info Card */}
      <div className="editorial-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#202A22]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#F5F7F3]">
              Como funciona o agendamento?
            </h3>
            <p className="text-xs sm:text-sm text-[#9BA59E] max-w-2xl leading-relaxed">
              Primeiro você escolhe o barbeiro, depois o serviço desejado. Em seguida, você será direcionado
              ao calendário oficial do profissional para escolher data e horário em tempo real no sistema Wix.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <a
            href="https://wa.me/5585992227064?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20escolher%20um%20barbeiro%20ou%20servi%C3%A7o."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A6AEA8] hover:text-[#25C440] border border-[#202A22] hover:border-[#25C440]/40 px-4 py-2.5 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#25C440]" />
            <span>Dúvidas? Fale no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
