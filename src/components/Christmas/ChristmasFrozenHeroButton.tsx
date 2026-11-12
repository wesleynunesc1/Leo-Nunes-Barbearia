"use client";

import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

/**
 * Cantoneira de cristais de gelo e geada para os 4 cantos do botão.
 * Vetor leve, nítido e estático (sem consumo de CPU).
 */
function IceCornerSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="iceFacetGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#D8F5FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#85DCFF" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Camada base de gelo suave fundido à borda */}
      <path
        d="M0 0 L18 0 C14 3 10 7 6 12 L0 18 Z"
        fill="url(#iceFacetGrad)"
      />

      {/* Cristais geométricos pontiagudos nos cantos */}
      {/* Cristal principal apontando para o interior */}
      <polygon
        points="0,0 12,2 10,7 3,6"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <polygon
        points="0,0 2,12 7,10 6,3"
        fill="#E8F9FF"
        opacity="0.9"
      />
      
      {/* Faceta de reflexo secundária */}
      <polygon
        points="3,3 11,4 6,11"
        fill="#BAECFF"
        opacity="0.75"
      />

      {/* Agulhas de gelo finas saindo do canto */}
      <path
        d="M12 0 L17 1 L10 5 Z"
        fill="#FFFFFF"
        opacity="0.8"
      />
      <path
        d="M0 12 L1 17 L5 10 Z"
        fill="#FFFFFF"
        opacity="0.8"
      />
      <path
        d="M6 7 L15 11 L10 13 Z"
        fill="#C9F2FF"
        opacity="0.7"
      />

      {/* Micro-pontos de orvalho/cristal brilhante */}
      <circle cx="8" cy="8" r="1.2" fill="#FFFFFF" />
      <circle cx="14" cy="5" r="0.9" fill="#E8F8FF" />
      <circle cx="5" cy="14" r="0.9" fill="#E8F8FF" />
    </svg>
  );
}

export function ChristmasFrozenHeroButton() {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      id="hero-cta-agendar"
      onClick={() => openBooking()}
      aria-label="Agendar meu horário"
      className="btn-frozen-christmas group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-xl text-white font-extrabold text-sm sm:text-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] transform active:scale-95 transition-transform duration-200"
    >
      {/* Cristais congelados nos 4 cantos */}
      {/* Canto Superior Esquerdo */}
      <IceCornerSvg className="absolute -top-[1px] -left-[1px] w-8 h-8 sm:w-9 sm:h-9 z-10" />

      {/* Canto Superior Direito (espelhado horizontalmente) */}
      <IceCornerSvg className="absolute -top-[1px] -right-[1px] w-8 h-8 sm:w-9 sm:h-9 z-10 -scale-x-100" />

      {/* Canto Inferior Esquerdo (espelhado verticalmente) */}
      <IceCornerSvg className="absolute -bottom-[1px] -left-[1px] w-8 h-8 sm:w-9 sm:h-9 z-10 -scale-y-100" />

      {/* Canto Inferior Direito (espelhado nos dois eixos) */}
      <IceCornerSvg className="absolute -bottom-[1px] -right-[1px] w-8 h-8 sm:w-9 sm:h-9 z-10 -scale-x-100 -scale-y-100" />

      {/* Borda de gelo sutil ao longo do topo */}
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E0F7FF]/70 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Borda de gelo sutil na base */}
      <div
        className="pointer-events-none absolute inset-x-6 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#A5E8FF]/40 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Ícone Calendário */}
      <Calendar className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.3] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]" />

      {/* Texto do Botão */}
      <span className="relative z-10 font-heading font-black text-white text-sm sm:text-base tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
        Agendar meu horário
      </span>

      {/* Seta Chevron */}
      <ChevronRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.6] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
