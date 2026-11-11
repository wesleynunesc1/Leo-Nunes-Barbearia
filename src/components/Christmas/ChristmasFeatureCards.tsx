"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Scissors, Users, Sparkles, ChevronRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

interface ChristmasCardItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  actionType: "booking" | "link";
  href?: string;
  badge?: string;
}

const CHRISTMAS_CARDS: ChristmasCardItem[] = [
  {
    id: "card-agenda-dezembro",
    icon: Calendar,
    title: "Agenda de dezembro",
    subtitle: "Escolha seu melhor horário.",
    actionType: "booking",
    badge: "Dezembro",
  },
  {
    id: "card-corte-festas",
    icon: Scissors,
    title: "Corte para as festas",
    subtitle: "Visual renovado.",
    actionType: "link",
    href: "#servicos",
    badge: "Estilo",
  },
  {
    id: "card-barbeiro-favorito",
    icon: Users,
    title: "Seu barbeiro favorito",
    subtitle: "Escolha seu profissional.",
    actionType: "link",
    href: "#equipe",
    badge: "Equipe",
  },
  {
    id: "card-ano-novo",
    icon: Sparkles,
    title: "Pronto para o Ano Novo",
    subtitle: "Comece o ano no estilo.",
    actionType: "booking",
    badge: "2026/2027",
  },
];

export function ChristmasFeatureCards() {
  const { openBooking } = useBooking();

  return (
    <div className="relative z-20 w-full border-t border-b border-[#1E2B21]/90 bg-[#080C09]/95 backdrop-blur-md py-3.5 sm:py-4 overflow-hidden">
      {/* Sutil brilho dourado/champanhe de fundo */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(229,193,88,0.06),transparent)]" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Touch snap carousel com rolagem suave / Desktop: Grid 4 colunas equilibrado */}
        <div className="flex lg:grid lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
          {CHRISTMAS_CARDS.map((card) => {
            const Icon = card.icon;

            const cardInnerContent = (
              <div className="relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-[#0F1A13]/90 via-[#0B130E]/85 to-[#080E0A]/90 border border-[#1E3023]/90 hover:border-[#25C440]/60 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(37,196,64,0.15)] group-hover:border-[#E5C158]/50 text-left h-full">
                {/* Linha dourada discreta no topo de cada card para toque festivo */}
                <div 
                  className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/35 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" 
                  aria-hidden="true" 
                />

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#142318] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(37,196,64,0.15)]">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-heading font-bold text-xs sm:text-sm text-[#FFFFFF] group-hover:text-[#25C440] transition-colors truncate">
                        {card.title}
                      </p>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#9AA59D] font-light leading-tight mt-0.5 truncate">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[#E5C158]/60 group-hover:text-[#25C440] group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
            );

            if (card.actionType === "booking") {
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => openBooking()}
                  className="group shrink-0 w-[260px] xs:w-[280px] sm:w-[290px] lg:w-auto snap-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] rounded-xl cursor-pointer"
                >
                  {cardInnerContent}
                </button>
              );
            }

            return (
              <a
                key={card.id}
                href={card.href}
                className="group shrink-0 w-[260px] xs:w-[280px] sm:w-[290px] lg:w-auto snap-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] rounded-xl block"
              >
                {cardInnerContent}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

