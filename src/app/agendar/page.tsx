import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getDynamicBarbers } from "@/lib/wixDynamicSync";
import { BarberCard } from "@/components/BarberCard";
import { ShieldCheck, Calendar, ArrowRight, HelpCircle } from "lucide-react";
import { BookingTriggerButton } from "@/components/BookingTriggerButton";

export const metadata: Metadata = {
  title: "Agendar Horário",
  description:
    "Selecione o profissional de sua preferência na Leo Nunes Barbearia em Pacajus - CE: Leo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira.",
  alternates: {
    canonical: "/agendar",
  },
};

export default async function AgendarBarbeiroPage() {
  const barbers = await getDynamicBarbers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-6 sm:space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Agendar Horário" }]} />

      {/* Header / Intro */}
      <div className="max-w-3xl space-y-2.5 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A14] border border-[#25C440]/30 text-xs font-semibold tracking-wider uppercase text-[#25C440]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25C440]" />
          <span>Passo 1 de 2: Selecione o Profissional</span>
        </div>

        <h1 className="font-heading text-2xl sm:text-5xl font-black text-[#F5F7F3] leading-tight">
          ESCOLHA SEU BARBEIRO
        </h1>

        <p className="text-xs sm:text-base text-[#A6AEA8] leading-relaxed">
          O próximo corte começa aqui. Cada profissional possui sua agenda e lista exclusiva de serviços.
          Selecione o barbeiro com quem deseja agendar para conferir as opções disponíveis.
        </p>

        <div className="pt-2">
          <BookingTriggerButton className="btn-shimmer inline-flex items-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.3)] transition-all cursor-pointer">
            <Calendar className="w-4 h-4" />
            <span>Abrir Sistema de Agendamento Integrado</span>
          </BookingTriggerButton>
        </div>
      </div>

      {/* Barbers Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
        {barbers.map((barber, index) => (
          <BarberCard key={barber.id} barber={barber} priority={index < 2} />
        ))}
      </div>

      {/* Explanatory Info Card */}
      <div className="editorial-card rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border border-[#202A22]">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-sm sm:text-lg font-bold text-[#F5F7F3]">
              Como funciona o agendamento?
            </h3>
            <p className="text-xs sm:text-sm text-[#9BA59E] max-w-2xl leading-relaxed">
              Primeiro você escolhe o barbeiro, depois o serviço desejado. Em seguida, você será direcionado
              ao calendário oficial do profissional para escolher data e horário em tempo real no sistema Wix.
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <a
            href="https://wa.me/5585992227064?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20escolher%20um%20barbeiro%20ou%20servi%C3%A7o."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#A6AEA8] hover:text-[#25C440] border border-[#202A22] hover:border-[#25C440]/40 px-4 py-2.5 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#25C440]" />
            <span>Dúvidas? Fale no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
