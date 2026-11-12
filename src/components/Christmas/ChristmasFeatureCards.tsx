"use client";

import React from "react";
import { Calendar, Scissors, Users, Sparkles, ChevronRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import ChristmasExpress from "@/components/christmas-express";

interface ChristmasCardItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  actionType: "booking" | "link";
  href?: string;
}

const CHRISTMAS_CARDS: ChristmasCardItem[] = [
  {
    id: "card-agenda-dezembro",
    icon: Calendar,
    title: "Agenda de dezembro",
    subtitle: "Escolha seu melhor horário.",
    actionType: "booking",
  },
  {
    id: "card-corte-festas",
    icon: Scissors,
    title: "Corte para as festas",
    subtitle: "Visual renovado.",
    actionType: "link",
    href: "#servicos",
  },
  {
    id: "card-barbeiro-favorito",
    icon: Users,
    title: "Seu barbeiro favorito",
    subtitle: "Escolha seu profissional.",
    actionType: "link",
    href: "#equipe",
  },
  {
    id: "card-ano-novo",
    icon: Sparkles,
    title: "Pronto para o Ano Novo",
    subtitle: "Comece o ano no estilo.",
    actionType: "booking",
  },
];

export function ChristmasFeatureCards() {
  const { openBooking } = useBooking();

  const renderCard = (card: ChristmasCardItem, uniqueKey: string, isAriaHidden = false) => {
    const Icon = card.icon;

    const cardInnerContent = (
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-br from-[#0F1A13]/90 via-[#0B130E]/85 to-[#080E0A]/90 border border-[#1E3023]/90 hover:border-[#25C440]/60 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(37,196,64,0.18)] group-hover:border-[#E5C158]/50 text-left h-full">
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
            <p className="font-heading font-bold text-xs sm:text-sm text-[#FFFFFF] group-hover:text-[#25C440] transition-colors truncate">
              {card.title}
            </p>
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
          key={uniqueKey}
          type="button"
          onClick={() => openBooking()}
          aria-hidden={isAriaHidden}
          tabIndex={isAriaHidden ? -1 : 0}
          className="group shrink-0 w-[270px] sm:w-[290px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] rounded-xl cursor-pointer"
        >
          {cardInnerContent}
        </button>
      );
    }

    return (
      <a
        key={uniqueKey}
        href={card.href}
        aria-hidden={isAriaHidden}
        tabIndex={isAriaHidden ? -1 : 0}
        className="group shrink-0 w-[270px] sm:w-[290px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] rounded-xl block"
      >
        {cardInnerContent}
      </a>
    );
  };

  return (
    <div className="relative z-20 w-full bg-[#080C09]/95 backdrop-blur-md py-2.5 sm:py-3">
      {/* Camada decorativa animada 2D Christmas Express 3.0 acima dos cards */}
      <ChristmasExpress
        duration={24}
        exit={4}
        pause={5}
        backdrop="soft"
        snowfall={true}
        halo={false}
        style={{
          "--cx-height": "clamp(65px, 9vw, 125px)",
          "--cx-offset-y": "-100%",
          "--cx-z": "25",
        } as React.CSSProperties}
      />

      {/* Sutil brilho dourado/champanhe de fundo */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(229,193,88,0.06),transparent)]" 
        aria-hidden="true" 
      />

      <div className="marquee-container !p-0 overflow-hidden">
        <div className="marquee-track" style={{ animationDuration: "28s" }}>
          {/* Loop Set 1 */}
          {CHRISTMAS_CARDS.map((card) => renderCard(card, `set1-${card.id}`))}
          {CHRISTMAS_CARDS.map((card) => renderCard(card, `set2-${card.id}`))}

          {/* Loop Set 2 (duplicado para scroll contínuo sem emenda) */}
          {CHRISTMAS_CARDS.map((card) => renderCard(card, `set3-${card.id}`, true))}
          {CHRISTMAS_CARDS.map((card) => renderCard(card, `set4-${card.id}`, true))}
        </div>
      </div>
    </div>
  );
}
