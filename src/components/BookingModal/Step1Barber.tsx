"use client";

import React from "react";
import Image from "next/image";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { getAllBarbers, Barber } from "@/data/barbers";
import { useBooking } from "@/context/BookingContext";

export function Step1Barber() {
  const barbers = getAllBarbers();
  const { selectedBarber, selectBarber } = useBooking();

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Etapa 1 de 5</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-[#FFFFFF]">
          ESCOLHA SEU BARBEIRO
        </h2>
        <p className="text-xs sm:text-sm text-[#9BA59E] max-w-xl">
          Selecione o profissional com quem deseja agendar seu horário. Cada barbeiro possui sua agenda exclusiva.
        </p>
      </div>

      {/* Grid de Profissionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;

          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => selectBarber(barber)}
              className={`group relative text-left rounded-2xl overflow-hidden p-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25C440] flex flex-col justify-between ${
                isSelected
                  ? "bg-[#142618] ring-2 ring-[#25C440] shadow-[0_0_25px_rgba(37,196,64,0.35)] scale-[1.01]"
                  : "bg-[#0E1510] hover:bg-[#141F17] border border-[#1E2C21] hover:border-[#25C440]/50"
              }`}
            >
              {/* Foto do Barbeiro */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0A0E0B]">
                <Image
                  src={barber.photo}
                  alt={`Barbeiro ${barber.name}`}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/30 to-transparent" />

                {/* Badge de Selecionado */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#25C440] text-[#080B09] flex items-center justify-center font-bold shadow-lg animate-in zoom-in-75 duration-200">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Nome e Cargo sobre a foto */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-[#25C440] block">
                    {barber.role}
                  </span>
                  <h3 className="font-heading text-sm sm:text-base font-black text-[#FFFFFF] leading-tight">
                    {barber.name}
                  </h3>
                </div>
              </div>

              {/* Botão de Ação Inferior */}
              <div className="p-2.5 sm:p-3 bg-[#080C09]/90 border-t border-white/[0.06] flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-bold transition-colors ${
                  isSelected ? "text-[#25C440]" : "text-[#A6AEA8] group-hover:text-[#FFFFFF]"
                }`}>
                  {isSelected ? "Selecionado" : "Selecionar"}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                  isSelected ? "text-[#25C440]" : "text-[#6F7B72] group-hover:text-[#25C440]"
                }`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
