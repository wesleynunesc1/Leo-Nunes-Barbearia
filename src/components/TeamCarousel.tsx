"use client";

import React, { useRef, useState, useEffect } from "react";
import { Barber } from "@/data/barbers";
import { BarberCard } from "@/components/BarberCard";
import { ScrollReveal } from "@/components/MotionSystem";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeamCarouselProps {
  barbers: Barber[];
}

export function TeamCarousel({ barbers }: TeamCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active index based on scroll position
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 300;
    const gap = 16;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), barbers.length - 1));
  };

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const card = container.children[index] as HTMLElement;
    if (card) {
      container.scrollTo({
        left: card.offsetLeft - 16,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < barbers.length - 1) scrollToIndex(activeIndex + 1);
  };

  // Keyboard navigation on mobile container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="w-full">
      {/* =====================================================================
          DESKTOP: Refined 4-card grid with staggered entrance
         ===================================================================== */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
        {barbers.map((barber, index) => (
          <ScrollReveal
            key={barber.id}
            direction="up"
            delay={index * 120}
            className="h-full"
          >
            <BarberCard barber={barber} priority={index < 2} />
          </ScrollReveal>
        ))}
      </div>

      {/* =====================================================================
          MOBILE: Mandatory Touch Carousel with Partial Next-Card Peek
         ===================================================================== */}
      <div className="lg:hidden space-y-5">
        {/* Swipe Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Carrossel de Barbeiros da Equipe"
          className="flex gap-4 overflow-x-auto pb-4 pt-1 px-4 sm:px-6 snap-x snap-mandatory scrollbar-none focus:outline-none focus:ring-1 focus:ring-[#25C440]/50"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className="w-[82vw] max-w-[320px] shrink-0 snap-start"
            >
              <BarberCard barber={barber} priority={index === 0} />
            </div>
          ))}
        </div>

        {/* Carousel Controls: Dots & Navigation Arrows */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-1">
          {/* Active Dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Indicadores do Carrossel">
            {barbers.map((barber, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={barber.id}
                  onClick={() => scrollToIndex(index)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ir para ${barber.name}`}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                    isActive
                      ? "w-7 bg-[#25C440]"
                      : "w-2 bg-[#202A22] hover:bg-[#A6AEA8]"
                  }`}
                />
              );
            })}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Barbeiro anterior"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === 0
                  ? "border-[#1E2720] text-[#6F7B72] opacity-40 cursor-not-allowed"
                  : "border-[#25C440]/30 text-[#FFFFFF] bg-[#111712] hover:bg-[#25C440] hover:text-[#080A08]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === barbers.length - 1}
              aria-label="Próximo barbeiro"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === barbers.length - 1
                  ? "border-[#1E2720] text-[#6F7B72] opacity-40 cursor-not-allowed"
                  : "border-[#25C440]/30 text-[#FFFFFF] bg-[#111712] hover:bg-[#25C440] hover:text-[#080A08]"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Small swipe helper hint */}
        <p className="text-[11px] text-center text-[#6F7B72]">
          Deslize para o lado para conhecer todos os barbeiros
        </p>
      </div>
    </div>
  );
}
