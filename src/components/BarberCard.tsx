import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Barber } from "@/data/barbers";
import { SpotlightCard } from "@/components/MotionSystem";

interface BarberCardProps {
  barber: Barber;
  priority?: boolean;
  showDescription?: boolean;
}

export function BarberCard({
  barber,
  priority = false,
  showDescription = false,
}: BarberCardProps) {
  return (
    <SpotlightCard
      className="editorial-card rounded-2xl overflow-hidden flex flex-col group h-full focus-within:ring-2 focus-within:ring-[#25C440]"
      id={`barber-card-${barber.slug}`}
    >
      {/* Barber Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0F1410]">
        <Image
          src={barber.photo}
          alt={`Foto oficial do barbeiro ${barber.name}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top group-hover:scale-[1.035] transition-transform duration-700 ease-out will-change-transform"
        />

        {/* Gradient Overlay for bottom text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A08] via-[#080A08]/15 to-transparent opacity-85" />



        {/* Name on image bottom */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-20">
          <p className="text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#25C440]">
            {barber.role}
          </p>
          <h3 className="font-heading text-sm sm:text-xl md:text-2xl font-extrabold text-[#FFFFFF] leading-snug group-hover:text-[#25C440] transition-colors duration-300">
            {barber.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-end bg-[#0F1410]/50">
        {showDescription && (
          <p className="text-[10px] sm:text-xs text-[#9BA59E] leading-relaxed line-clamp-2 mb-2.5 sm:mb-3">
            {barber.tagline}
          </p>
        )}

        <div className="pt-1">
          <Link
            href={`/agendar/${barber.slug}`}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-[#162018] hover:bg-[#25C440] text-[#FFFFFF] hover:text-[#080A08] font-bold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080A08] shadow-sm text-center"
          >
            <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Agendar</span>
            <span className="hidden md:inline"> Horário</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
