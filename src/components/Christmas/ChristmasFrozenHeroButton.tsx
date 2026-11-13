"use client";

import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import LivingChristmasElf from "@/components/living-christmas-elf/react/LivingChristmasElf";
import "@/components/living-christmas-elf/styles/cta-frost.css";

export function ChristmasFrozenHeroButton() {
  const { openBooking } = useBooking();

  return (
    <LivingChristmasElf
      personality="AUTO"
      className="w-full sm:w-auto block sm:inline-block"
    >
      <button
        type="button"
        id="hero-cta-agendar"
        onClick={() => openBooking()}
        aria-label="Agendar meu horário"
        className="btn-frozen-christmas lce-frost-host group relative w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 pl-5 sm:pl-6 pr-[84px] sm:pr-[96px] py-3.5 sm:py-4 rounded-xl text-white font-extrabold text-sm sm:text-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] transform active:scale-95 transition-transform duration-200"
      >
        {/* Frost orgânico nos 4 cantos e camada fina de neve no topo via cta-frost.css */}
        <span className="lce-frost" aria-hidden="true" />

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Ícone Calendário */}
          <Calendar className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.3] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]" />

          {/* Texto do Botão */}
          <span className="relative z-10 font-heading font-black text-white text-sm sm:text-base tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] whitespace-nowrap">
            Agendar meu horário
          </span>
        </div>

        {/* Seta Chevron */}
        <ChevronRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.6] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:translate-x-1 ml-auto sm:ml-0" />
      </button>
    </LivingChristmasElf>
  );
}
