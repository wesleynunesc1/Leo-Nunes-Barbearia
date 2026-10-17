import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, CalendarCheck } from "lucide-react";
import { Barber } from "@/data/barbers";
import { SpotlightCard } from "@/components/MotionSystem";

interface BarberCardProps {
  barber: Barber;
  priority?: boolean;
}

export function BarberCard({ barber, priority = false }: BarberCardProps) {
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

        {/* Badge: Services Count */}
        <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#080A08]/85 backdrop-blur-md text-[#25C440] border border-[#25C440]/30 shadow-md">
            <Scissors className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{barber.services.length} serviços</span>
          </span>
        </div>

        {/* Name on image bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-20">
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#25C440]">
            {barber.role}
          </p>
          <h3 className="font-heading text-lg sm:text-2xl font-extrabold text-[#FFFFFF] leading-tight group-hover:text-[#25C440] transition-colors duration-300">
            {barber.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 bg-[#0F1410]/50">
        <p className="text-[11px] sm:text-xs text-[#9BA59E] leading-relaxed line-clamp-2">
          {barber.tagline}
        </p>

        <div className="pt-1 sm:pt-2">
          <Link
            href={`/agendar/${barber.slug}`}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#162018] hover:bg-[#25C440] text-[#FFFFFF] hover:text-[#080A08] font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080A08] shadow-sm text-center"
          >
            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Ver Serviços</span>
            <span className="hidden md:inline"> & Horários</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
