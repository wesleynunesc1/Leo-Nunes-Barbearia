import React from "react";
import { Scissors, Sparkles, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { BarberService } from "@/data/barbers";

interface ServiceCardProps {
  service: BarberService;
  barberName: string;
}

export function ServiceCard({ service, barberName }: ServiceCardProps) {
  const categoryLabels: Record<string, { label: string; color: string }> = {
    cabelo: { label: "Cabelo", color: "text-[#62D876] bg-[#142618] border-[#25C440]/30" },
    barba: { label: "Barba", color: "text-[#E6A960] bg-[#291F14] border-[#E6A960]/30" },
    combo: { label: "Combo Especial", color: "text-[#38BDF8] bg-[#102433] border-[#38BDF8]/30" },
    tratamento: { label: "Cuidado Facial / Fios", color: "text-[#D946EF] bg-[#2A142E] border-[#D946EF]/30" },
  };

  const badge = categoryLabels[service.category] || categoryLabels.cabelo;

  return (
    <article
      className="editorial-card rounded-2xl p-6 flex flex-col justify-between h-full group"
      id={`service-card-${service.id}`}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-[11px] text-[#6F7B72] flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#25C440]" />
            Agenda Oficial
          </span>
        </div>

        <div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F5F7F3] group-hover:text-[#25C440] transition-colors leading-snug">
            {service.name}
          </h3>
          <p className="text-xs text-[#25C440] font-medium mt-0.5">
            Com {barberName}
          </p>
        </div>

        {service.description && (
          <p className="text-xs text-[#9BA59E] leading-relaxed">
            {service.description}
          </p>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-[#1C2620] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#6F7B72]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#25C440]" />
            Horários em tempo real
          </span>
          <span className="text-[#A6AEA8] font-medium text-[11px]">
            Valores no calendário
          </span>
        </div>

        {/* Primary CTA - literal exact bookingUrl */}
        <a
          href={service.bookingUrl}
          className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-sm py-3 px-4 rounded-xl btn-green-glow transition-all duration-200"
          id={`btn-book-${service.id}`}
          aria-label={`Agendar ${service.name} com ${barberName}`}
        >
          <span>Escolher Dia e Horário</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>

        <p className="text-[10px] text-center text-[#6F7B72] leading-tight">
          Você continuará no sistema oficial de agendamento (Wix)
        </p>
      </div>
    </article>
  );
}
