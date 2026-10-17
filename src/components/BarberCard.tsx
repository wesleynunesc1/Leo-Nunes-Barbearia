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
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top filter grayscale contrast-[1.08] group-hover:grayscale-0 group-hover:scale-[1.035] transition-all duration-700 ease-out will-change-transform"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A08] via-transparent to-black/25 opacity-90 group-hover:opacity-75 transition-opacity duration-500" />

        {/* Badge: Services Count */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#080A08]/85 backdrop-blur-md text-[#25C440] border border-[#25C440]/30 shadow-md">
            <Scissors className="w-3 h-3" />
            <span>{barber.services.length} serviços</span>
          </span>
        </div>

        {/* Name on image bottom */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#25C440]">
            {barber.role}
          </p>
          <h3 className="font-heading text-2xl font-extrabold text-[#FFFFFF] leading-tight group-hover:text-[#25C440] transition-colors duration-300">
            {barber.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#0F1410]/50">
        <p className="text-xs text-[#9BA59E] leading-relaxed line-clamp-2">
          {barber.tagline}
        </p>

        <div className="pt-2">
          <Link
            href={`/agendar/${barber.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-[#162018] hover:bg-[#25C440] text-[#FFFFFF] hover:text-[#080A08] font-bold text-sm py-3 px-4 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080A08] shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Ver Serviços & Horários</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
