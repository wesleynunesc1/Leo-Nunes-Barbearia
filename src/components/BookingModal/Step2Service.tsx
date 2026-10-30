"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Scissors, Clock, Check, CalendarCheck, CheckCircle2, Shield, Droplets, Layers, Plus, Trash2, ArrowRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { BarberService } from "@/data/barbers";

export function Step2Service() {
  const {
    selectedBarber,
    selectedServices,
    toggleService,
    clearServices,
    totalPrice,
    totalDurationMinutes,
    goToStep,
  } = useBooking();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [liveServices, setLiveServices] = useState<BarberService[]>(selectedBarber?.services || []);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [limitNotice, setLimitNotice] = useState(false);

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

  const handleServiceClick = (service: BarberService) => {
    const isAlreadySelected = selectedServices.some((s) => s.id === service.id);
    if (!isAlreadySelected && selectedServices.length >= 5) {
      setLimitNotice(true);
      setTimeout(() => setLimitNotice(false), 3000);
      return;
    }
    toggleService(service);
  };

  return (
    <div className="space-y-5 pb-20 sm:pb-16">
      {/* Resumo do Barbeiro Selecionado */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0D1510] border border-[#1C2A1E]">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#25C440]/50 shrink-0">
            <Image
              src={selectedBarber.photo}
              alt={selectedBarber.name}
              fill
              className="object-cover object-center"
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
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Etapa 2 de 5</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#1A261D] text-[#A6AEA8] text-[10px] font-mono font-bold">
            {selectedServices.length}/5 selecionados
          </span>
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#FFFFFF]">
          ESCOLHA OS SERVIÇOS
        </h2>
        <p className="text-xs text-[#9BA59E]">
          Selecione um ou vários serviços para realizar no mesmo atendimento com {selectedBarber.name}.
        </p>
      </div>

      {/* Aviso de Limite Máximo */}
      {limitNotice && (
        <div className="p-3 rounded-xl bg-[#261E10] border border-[#E6A020]/40 text-xs text-[#F2C970] animate-in fade-in duration-200 flex items-center justify-between">
          <span>Você pode selecionar no máximo 5 serviços por agendamento.</span>
        </div>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[44vh] sm:max-h-[48vh] overflow-y-auto pr-1">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceClick(service)}
              className={`group relative text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                isSelected
                  ? "bg-[#142618] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.25)] ring-1 ring-[#25C440]"
                  : "bg-[#0E1510] hover:bg-[#141F17] border-[#1C2A1E] hover:border-[#25C440]/40"
              }`}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className={`font-heading text-sm sm:text-base font-extrabold leading-tight transition-colors ${
                      isSelected ? "text-[#25C440]" : "text-[#FFFFFF] group-hover:text-[#25C440]"
                    }`}>
                      {service.name}
                    </h4>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? "bg-[#25C440] border-[#25C440] text-[#080B09]"
                      : "border-[#2A3B2D] text-transparent group-hover:border-[#25C440]/60"
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
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

      {/* Barra Fixa de Resumo & Avanço (quando há pelo menos 1 serviço selecionado) */}
      {selectedServices.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#0D1610] border border-[#25C440]/50 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-black text-[#FFFFFF]">
                  {selectedServices.length} {selectedServices.length === 1 ? "serviço" : "serviços"}
                </span>
                <span className="text-[11px] text-[#25C440] font-mono font-bold bg-[#142618] px-2 py-0.5 rounded-full border border-[#25C440]/30">
                  {totalDurationMinutes} min total
                </span>
              </div>
              <p className="text-xs text-[#8E9B91] truncate max-w-[220px] sm:max-w-[280px]">
                {selectedServices.map((s) => s.name).join(" + ")}
              </p>
            </div>

            <div className="text-right sm:text-left sm:pl-4 sm:border-l sm:border-white/10">
              <span className="text-[10px] text-[#6F7B72] block">Total</span>
              <span className="font-heading text-base font-black text-[#25C440]">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={clearServices}
              title="Limpar seleção"
              className="p-2.5 rounded-xl bg-[#141C16] hover:bg-[#1A251D] text-[#8E9B91] hover:text-[#FFFFFF] border border-[#223326] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-xs sm:text-sm shadow-md shadow-[#25C440]/30 transition-all"
            >
              <span>Avançar para Data</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
