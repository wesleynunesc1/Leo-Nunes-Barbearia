"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarCheck } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Step3Date() {
  const {
    selectedBarber,
    selectedService,
    selectedServices,
    totalPrice,
    totalDurationMinutes,
    selectedDate,
    selectDate,
    goToStep,
  } = useBooking();

  // Data atual no fuso de Fortaleza (UTC-3)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Fortaleza" }));
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  const todayStr = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}-${String(todayDay).padStart(2, "0")}`;

  const [currentMonth, setCurrentMonth] = useState(todayMonth);
  const [currentYear, setCurrentYear] = useState(todayYear);

  if (!selectedBarber || (selectedServices.length === 0 && !selectedService)) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#A6AEA8]">Por favor, escolha o barbeiro e o serviço primeiro.</p>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="mt-4 px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  // Navegação de mês
  const handlePrevMonth = () => {
    if (currentYear === todayYear && currentMonth === todayMonth) return; // Não volta para mês passado
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Permite navegar até 3 meses no futuro
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Cálculo dos dias do mês
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isPrevDisabled = currentYear === todayYear && currentMonth === todayMonth;

  return (
    <div className="space-y-5">
      {/* Resumo do Barbeiro e Serviço(s) */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1510] border border-[#1C2A1E]">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold block">
            {selectedServices.length > 1 ? `${selectedServices.length} Serviços Selecionados` : "Serviço & Barbeiro"}
          </span>
          <p className="font-heading text-xs sm:text-sm font-bold text-[#FFFFFF]">
            {selectedServices.length > 1
              ? selectedServices.map((s) => s.name).join(" + ")
              : selectedService?.name}{" "}
            <span className="text-[#8E9B91]">com</span> {selectedBarber.name}
          </p>
          <span className="text-[11px] text-[#A6AEA8] block">
            Duração total: <strong className="text-[#25C440]">{totalDurationMinutes} min</strong> • Total: <strong className="text-[#25C440]">R$ {totalPrice.toFixed(2).replace(".", ",")}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="text-xs font-semibold text-[#A6AEA8] hover:text-[#25C440] border border-[#243327] hover:border-[#25C440]/40 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Trocar
        </button>
      </div>

      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Etapa 3 de 5</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#FFFFFF]">
          ESCOLHA O DIA
        </h2>
        <p className="text-xs text-[#9BA59E]">
          Horário de funcionamento: Seg a Sex (08h às 19h) | Sábado (08h às 18h) | Domingo fechado
        </p>
      </div>

      {/* Calendário Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B100C] border border-[#1C291E] space-y-4">
        {/* Header de Navegação do Mês */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm sm:text-base font-extrabold text-[#FFFFFF] capitalize flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#25C440]" />
            <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              aria-label="Mês anterior"
              className={`p-2 rounded-lg border transition-all ${
                isPrevDisabled
                  ? "border-[#1A241C] text-[#3E4A40] cursor-not-allowed"
                  : "border-[#202E23] text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#142017]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-2 rounded-lg border border-[#202E23] text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#142017] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dias da Semana (D, S, T, Q, Q, S, S) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK_DAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-[10px] sm:text-xs font-mono font-bold uppercase py-1 ${
                idx === 0 ? "text-[#E65050]/70" : "text-[#6F7B72]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grade de Dias do Mês */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {/* Espaços vazios antes do 1º dia */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}

          {/* Dias válidos */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dateObj = new Date(currentYear, currentMonth, dayNum);
            const isSunday = dateObj.getDay() === 0;
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate === dateStr;
            const isDisabled = isPast || isSunday;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => selectDate(dateStr)}
                className={`relative aspect-square sm:aspect-auto sm:py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "bg-[#25C440] text-[#080B09] font-black shadow-lg shadow-[#25C440]/30 scale-[1.04] ring-2 ring-[#FFFFFF]"
                    : isDisabled
                    ? "text-[#3A453C] bg-transparent cursor-not-allowed line-through opacity-40"
                    : "text-[#FFFFFF] bg-[#101712] hover:bg-[#1B291E] hover:text-[#25C440] border border-[#1A251D] hover:border-[#25C440]/40"
                }`}
              >
                <span>{dayNum}</span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#25C440] mt-0.5" />
                )}
                {isSunday && (
                  <span className="text-[8px] font-mono text-[#E65050]/80 hidden sm:inline">
                    Fechado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
