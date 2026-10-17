import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, CalendarCheck } from "lucide-react";
import { Barber } from "@/data/barbers";

interface BarberCardProps {
  barber: Barber;
  priority?: boolean;
}

export function BarberCard({ barber, priority = false }: BarberCardProps) {
  return (
    <article
      className="editorial-card rounded-2xl overflow-hidden flex flex-col group h-full focus-within:ring-2 focus-within:ring-[#25C440]"
      id={`barber-card-${barber.slug}`}
    >
      {/* Barber Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#101611]">
        <Image
          src={barber.photo}
          alt={`Foto oficial do barbeiro ${barber.name}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C110D] via-transparent to-black/20" />

        {/* Badge: Services Count */}
        <div className="absolute top-3.5 right-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#080B09]/80 backdrop-blur-md text-[#25C440] border border-[#25C440]/30 shadow-md">
            <Scissors className="w-3 h-3" />
            <span>{barber.services.length} serviços</span>
          </span>
        </div>

        {/* Name on image bottom */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#25C440]">
            {barber.role}
          </p>
          <h3 className="font-heading text-2xl font-extrabold text-[#F5F7F3] leading-tight">
            {barber.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-[#A6AEA8] leading-relaxed line-clamp-2">
          {barber.tagline}
        </p>

        <div className="pt-2">
          <Link
            href={`/agendar/${barber.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-[#17221A] hover:bg-[#25C440] text-[#F5F7F3] hover:text-[#080B09] font-bold text-sm py-3 px-4 rounded-xl border border-[#25C440]/30 hover:border-transparent transition-all duration-300 group-hover:bg-[#25C440] group-hover:text-[#080B09] shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Ver Serviços & Horários</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
