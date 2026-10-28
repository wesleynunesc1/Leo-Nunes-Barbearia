"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Scissors, Clock, Check, CalendarCheck, CheckCircle2, Shield, Droplets, Layers } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { BarberService } from "@/data/barbers";

export function Step2Service() {
  const { selectedBarber, selectedService, selectService, goToStep } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [liveServices, setLiveServices] = useState<BarberService[]>(selectedBarber?.services || []);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  React.useEffect(() => {
    if (!selectedBarber) return;
    let isMounted = true;
    setIsLoadingLive(true);
    fetch(`/api/bookings/services?barberId=${selectedBarber.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setLiveServices(data.services);
        }
      })
      .catch((err) => {
        console.warn("[LIVE SERVICES FETCH ERROR]", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingLive(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBarber]);

  if (!selectedBarber) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#A6AEA8]">Nenhum barbeiro selecionado.</p>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="mt-4 px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
        >
          Voltar e escolher barbeiro
        </button>
      </div>
    );
  }

  const services = liveServices.length > 0 ? liveServices : selectedBarber.services;

  const categories = [
    { id: "all", label: "Todos", icon: Layers, count: services.length },
    {
      id: "cabelo",
      label: "Cortes",
      icon: Scissors,
      count: services.filter((s) => s.category === "cabelo").length,
    },
    {
      id: "combo",
      label: "Combos",
      icon: CheckCircle2,
      count: services.filter((s) => s.category === "combo").length,
    },
    {
      id: "barba",
      label: "Barba",
      icon: Shield,
      count: services.filter((s) => s.category === "barba").length,
    },
    {
      id: "tratamento",
      label: "Tratamentos",
      icon: Droplets,
      count: services.filter((s) => s.category === "tratamento").length,
    },
  ].filter((c) => c.id === "all" || c.count > 0);

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-5">
      {/* Resumo do Barbeiro Selecionado */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0D1510] border border-[#1C2A1E]">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#25C440]/50 shrink-0">
            <Image
              src={selectedBarber.photo}
              alt={selectedBarber.name}
              fill
              className="object-cover object-top"
              sizes="48px"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold block">
              Profissional selecionado
            </span>
            <h3 className="font-heading text-sm sm:text-base font-black text-[#FFFFFF]">
              {selectedBarber.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => goToStep(1)}
          className="text-xs font-semibold text-[#A6AEA8] hover:text-[#25C440] border border-[#243327] hover:border-[#25C440]/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          Trocar
        </button>
      </div>

      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Etapa 2 de 5</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#FFFFFF]">
          SELECIONE O SERVIÇO
        </h2>
        <p className="text-xs text-[#9BA59E]">
          Serviços cadastrados no sistema Wix de {selectedBarber.name}.
        </p>
      </div>

      {/* Tabs de Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              role="tab"
              aria-selected={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus:outline-none focus:ring-1 focus:ring-[#25C440] ${
                isActive
                  ? "bg-[#25C440] text-[#080B09] shadow-md shadow-[#25C440]/25"
                  : "bg-[#101712] text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#162119] border border-[#1F2C21]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-[#080B09]/20 text-[#080B09]" : "bg-[#1A261D] text-[#25C440]"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] sm:max-h-[50vh] overflow-y-auto pr-1">
        {filteredServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => selectService(service)}
              className={`group relative text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                isSelected
                  ? "bg-[#142618] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.25)] ring-1 ring-[#25C440]"
                  : "bg-[#0E1510] hover:bg-[#141F17] border-[#1C2A1E] hover:border-[#25C440]/40"
              }`}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-heading text-sm sm:text-base font-extrabold leading-tight transition-colors ${
                    isSelected ? "text-[#25C440]" : "text-[#FFFFFF] group-hover:text-[#25C440]"
                  }`}>
                    {service.name}
                  </h4>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#25C440] text-[#080B09] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="text-[11px] text-[#8E9B91] leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Detalhes de Duração e Preço */}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-[11px] text-[#A6AEA8]">
                  <Clock className="w-3.5 h-3.5 text-[#25C440]" />
                  <span>{service.durationMinutes} min</span>
                </div>

                <div className="text-right">
                  <span className="font-heading text-sm sm:text-base font-black text-[#FFFFFF]">
                    {service.formattedPrice}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
