"use client";

import React from "react";
import { Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { BarberService } from "@/data/barbers";
import { SpotlightCard } from "@/components/MotionSystem";
import { useBooking } from "@/context/BookingContext";

interface ServiceCardProps {
  service: BarberService;
  barberName: string;
  barberSlug?: string;
}

export function ServiceCard({ service, barberName, barberSlug }: ServiceCardProps) {
  const { openBooking } = useBooking();

  // Strict palette: Green, Black and White only
  const categoryLabels: Record<string, { label: string; badgeClass: string }> = {
    cabelo: {
      label: "Corte",
      badgeClass: "text-[#25C440] bg-[#111A13] border-[#25C440]/30",
    },
    barba: {
      label: "Barba",
      badgeClass: "text-[#FFFFFF] bg-[#171E19] border-white/20",
    },
    combo: {
      label: "Combo Especial",
      badgeClass: "text-[#25C440] bg-[#142618] border-[#25C440]/50 font-bold",
    },
    tratamento: {
      label: "Cuidado Facial / Fios",
      badgeClass: "text-[#9BA59E] bg-[#131A15] border-[#232F26]",
    },
  };

  const badge = categoryLabels[service.category] || categoryLabels.cabelo;

  return (
    <SpotlightCard
      className="editorial-card zeph-borda rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between h-full group"
      id={`service-card-${service.id}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${badge.badgeClass}`}>
            {badge.label}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#6F7B72] flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#25C440]" />
            Agenda Oficial
          </span>
        </div>

        <div>
          <h3 className="font-heading text-base sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-snug">
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

      <div className="pt-4 sm:pt-6 mt-4 border-t border-[#1C2620] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#6F7B72]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#25C440]" />
            {service.durationMinutes} minutos
          </span>
          <span className="text-[#25C440] font-heading font-black text-sm">
            {service.formattedPrice}
          </span>
        </div>

        {/* Primary CTA - Abre fluxo integrado no modal */}
        <button
          type="button"
          onClick={() => openBooking({ barberSlug, serviceId: service.id })}
          className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080A08] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl btn-green-glow transition-all duration-200 cursor-pointer"
          id={`btn-book-${service.id}`}
          aria-label={`Agendar ${service.name} com ${barberName}`}
        >
          <span>Escolher Dia e Horário</span>
          <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>

        <p className="text-[10px] text-center text-[#6F7B72] leading-tight">
          Agendamento integrado com o sistema oficial Wix
        </p>
      </div>
    </SpotlightCard>
  );
}
