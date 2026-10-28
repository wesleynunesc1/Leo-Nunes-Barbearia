"use client";

import React, { useEffect, useState } from "react";
import { Clock, Sun, Sunset, AlertCircle, Loader2, CalendarCheck } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { TimeSlot, BookingSlotResponse } from "@/types/booking";

export function Step4Time() {
  const { selectedBarber, selectedService, selectedDate, selectedTime, selectTime, goToStep } = useBooking();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchSlots = async () => {
      try {
        const svcId = selectedService?.wixServiceId || selectedService?.id;
        const url = `/api/bookings/slots?date=${selectedDate}&barberId=${selectedBarber.id}${
          svcId ? `&serviceId=${svcId}` : ""
        }`;
        const res = await fetch(url, { cache: "no-store" });
        const data: BookingSlotResponse & { error?: string; closed?: boolean; closedReason?: string } = await res.json();

        if (!isMounted) return;

        if (!res.ok || data.error) {
          setError(data.error || "Não foi possível carregar os horários para esta data.");
          setSlots([]);
        } else if (data.closed) {
          setError(data.closedReason || "Barbearia fechada nesta data.");
          setSlots([]);
        } else {
          setSlots(data.slots || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[FETCH SLOTS ERROR]", err);
          setError("Erro de conexão ao buscar horários. Tente novamente.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedBarber, selectedService, selectedDate]);

  if (!selectedBarber || !selectedService || !selectedDate) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#A6AEA8]">Data ou profissional não definidos.</p>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="mt-4 px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
        >
          Voltar para escolher o dia
        </button>
      </div>
    );
  }

  // Formatar data em português
  const [year, month, day] = selectedDate.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const morningSlots = slots.filter((s) => s.period === "morning");
  const afternoonSlots = slots.filter((s) => s.period === "afternoon");
  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-5">
      {/* Resumo da Data e Barbeiro */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1510] border border-[#1C2A1E]">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold block">
            Dia Selecionado
          </span>
          <p className="font-heading text-xs sm:text-sm font-bold text-[#FFFFFF] capitalize">
            {formattedDate}
          </p>
        </div>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="text-xs font-semibold text-[#A6AEA8] hover:text-[#25C440] border border-[#243327] hover:border-[#25C440]/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          Trocar Dia
        </button>
      </div>

      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Etapa 4 de 5</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#FFFFFF]">
          ESCOLHA O HORÁRIO
        </h2>
        <p className="text-xs text-[#9BA59E]">
          Horários disponíveis em tempo real para {selectedService.name} com {selectedBarber.name}.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#0B100C] rounded-2xl border border-[#1C291E]">
          <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
          <p className="text-xs text-[#A6AEA8]">Consultando agenda oficial...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[#15100F] border border-[#402321] rounded-2xl space-y-3">
          <AlertCircle className="w-8 h-8 text-[#E65050]" />
          <p className="text-xs sm:text-sm text-[#F5B5B5] max-w-sm">{error}</p>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
          >
            Escolher outra data
          </button>
        </div>
      )}

      {/* Slots Grid */}
      {!isLoading && !error && slots.length === 0 && (
        <div className="text-center py-12 p-6 bg-[#0B100C] rounded-2xl border border-[#1C291E] space-y-3">
          <Clock className="w-8 h-8 text-[#A6AEA8] mx-auto" />
          <p className="text-xs sm:text-sm text-[#A6AEA8]">
            Não há horários disponíveis para esta data.
          </p>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
          >
            Escolher outro dia
          </button>
        </div>
      )}

      {!isLoading && !error && slots.length > 0 && (
        <div className="space-y-5 max-h-[46vh] sm:max-h-[50vh] overflow-y-auto pr-1">
          {availableCount === 0 && (
            <div className="p-3 bg-[#181110] border border-[#3E211E] rounded-xl flex items-center gap-2.5 text-xs text-[#EBA39D]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E65050]" />
              <span>Todos os horários desta data já foram preenchidos para {selectedBarber.name}. Escolha outro dia ou outro profissional.</span>
            </div>
          )}

          {/* Manhã */}
          {morningSlots.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#25C440]">
                <Sun className="w-4 h-4" />
                <span>Manhã (08h às 12h)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {morningSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      title={slot.reason || undefined}
                      onClick={() => selectTime(slot.time)}
                      className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all ${
                        isSelected
                          ? "bg-[#25C440] text-[#080B09] shadow-lg shadow-[#25C440]/30 scale-[1.03] ring-2 ring-[#FFFFFF]"
                          : !slot.available
                          ? "bg-[#0C120E]/40 text-[#3A473E] border border-[#162118] cursor-not-allowed line-through opacity-40"
                          : "bg-[#101712] text-[#FFFFFF] hover:bg-[#1C2A1F] hover:text-[#25C440] border border-[#1E2C20] hover:border-[#25C440]/40"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tarde */}
          {afternoonSlots.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#25C440]">
                <Sunset className="w-4 h-4" />
                <span>Tarde (13h às 19h)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {afternoonSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      title={slot.reason || undefined}
                      onClick={() => selectTime(slot.time)}
                      className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all ${
                        isSelected
                          ? "bg-[#25C440] text-[#080B09] shadow-lg shadow-[#25C440]/30 scale-[1.03] ring-2 ring-[#FFFFFF]"
                          : !slot.available
                          ? "bg-[#0C120E]/40 text-[#3A473E] border border-[#162118] cursor-not-allowed line-through opacity-40"
                          : "bg-[#101712] text-[#FFFFFF] hover:bg-[#1C2A1F] hover:text-[#25C440] border border-[#1E2C20] hover:border-[#25C440]/40"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
