"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Barber } from "@/data/barbers";

interface TeamCarouselProps {
  barbers: Barber[];
}

export function TeamCarousel({ barbers }: TeamCarouselProps) {
  return (
    <div className="w-full overflow-visible py-4 sm:py-6">
      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase text-[#8E9B91] bg-[#101712] border border-[#202E23]">
          ← Deslize para ver a equipe →
        </span>
      </div>

      {/* Overlapping Card Fan / Deck of Cards Container */}
      <div className="team-deck-container">
        {barbers.map((barber, index) => (
          <div
            key={barber.id}
            className="team-deck-card group"
            id={`team-deck-${barber.slug}`}
          >
            {/* Foto Oficial do Barbeiro */}
            <div className="relative flex-1 w-full overflow-hidden bg-[#0F1410]">
              <Image
                src={barber.photo}
                alt={`Foto oficial do barbeiro ${barber.name}`}
                fill
                priority={index < 2}
                sizes="(max-width: 640px) 250px, 270px"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
              />

              {/* Gradiente para máxima legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/30 to-transparent" />

              {/* Informações sobre a imagem (cargo e nome - SEM descrição e SEM contagem de serviço) */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-[#25C440] block">
                  {barber.role}
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-black text-[#FFFFFF] leading-tight group-hover:text-[#25C440] transition-colors">
                  {barber.name}
                </h3>
              </div>
            </div>

            {/* Ação de Agendamento */}
            <div className="p-3 bg-[#0C120E] border-t border-white/[0.06]">
              <Link
                href={`/agendar/${barber.slug}`}
                className="w-full flex items-center justify-center gap-2 bg-[#162219] hover:bg-[#25C440] text-[#FFFFFF] hover:text-[#080B09] font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080B09] shadow-sm text-center"
              >
                <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Agendar Horário</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
