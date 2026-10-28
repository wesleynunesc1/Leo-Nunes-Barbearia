"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Barber } from "@/data/barbers";
import { BookingTriggerButton } from "@/components/BookingTriggerButton";

interface TeamCarouselProps {
  barbers: Barber[];
}

export function TeamCarousel({ barbers }: TeamCarouselProps) {
  return (
    <div className="w-full overflow-visible">
      {/* =====================================================================
          1. VERSÃO MOBILE (2 Colunas com Efeito ao Passar o Dedo / Touch)
         ===================================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
        {barbers.map((barber, index) => (
          <div
            key={`mobile-${barber.id}`}
            className="team-mobile-card zeph-borda rounded-2xl overflow-hidden bg-[#0D120E] border border-[#202E23]/60 flex flex-col group relative shadow-md"
            id={`team-mobile-${barber.slug}`}
          >
            {/* Foto do Barbeiro */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0A0E0B]">
              <Image
                src={barber.photo}
                alt={`Foto oficial do barbeiro ${barber.name}`}
                fill
                priority={index < 2}
                sizes="(max-width: 768px) 50vw, 220px"
                className="object-cover object-top group-hover:scale-105 group-active:scale-105 transition-transform duration-500 ease-out will-change-transform"
              />

              {/* Gradiente para contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D120E] via-[#0D120E]/20 to-transparent" />

              {/* Informações sobre a imagem (cargo e nome) */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-[#25C440] block">
                  {barber.role}
                </span>
                <h3 className="font-heading text-sm sm:text-base font-black text-[#FFFFFF] leading-tight group-hover:text-[#25C440] group-active:text-[#25C440] transition-colors">
                  {barber.name}
                </h3>
              </div>
            </div>

            {/* Ação de Agendamento */}
            <div className="p-2 sm:p-2.5 bg-[#0A0E0B] border-t border-white/[0.06]">
              <BookingTriggerButton
                barberSlug={barber.slug}
                className="w-full flex items-center justify-center gap-1.5 bg-[#162219] hover:bg-[#25C440] active:bg-[#25C440] text-[#FFFFFF] hover:text-[#080B09] active:text-[#080B09] font-extrabold text-[11px] sm:text-xs py-2 px-2 rounded-xl border border-[#25C440]/30 transition-all duration-300 text-center cursor-pointer"
              >
                <CalendarCheck className="w-3 h-3 shrink-0" />
                <span>Agendar</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
              </BookingTriggerButton>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          2. VERSÃO DESKTOP (Efeito Baralho de Cards Sobrepostos com Cascata)
         ===================================================================== */}
      <div className="hidden md:flex team-deck-container">
        {barbers.map((barber, index) => (
          <div
            key={`desktop-${barber.id}`}
            className="team-deck-card zeph-borda group"
            id={`team-deck-${barber.slug}`}
          >
            {/* Foto Oficial do Barbeiro */}
            <div className="relative flex-1 w-full overflow-hidden bg-[#0A0E0B]">
              <Image
                src={barber.photo}
                alt={`Foto oficial do barbeiro ${barber.name}`}
                fill
                priority={index < 2}
                sizes="270px"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
              />

              {/* Gradiente para máxima legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/25 to-transparent" />

              {/* Informações sobre a imagem (cargo e nome - SEM descrição e SEM contagem de serviço) */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#25C440] block">
                  {barber.role}
                </span>
                <h3 className="font-heading text-xl font-black text-[#FFFFFF] leading-tight group-hover:text-[#25C440] transition-colors">
                  {barber.name}
                </h3>
              </div>
            </div>

            {/* Ação de Agendamento */}
            <div className="p-3 bg-[#0A0E0B] border-t border-white/[0.06]">
              <BookingTriggerButton
                barberSlug={barber.slug}
                className="w-full flex items-center justify-center gap-2 bg-[#162219] hover:bg-[#25C440] text-[#FFFFFF] hover:text-[#080B09] font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080B09] shadow-sm text-center cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Agendar Horário</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </BookingTriggerButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
