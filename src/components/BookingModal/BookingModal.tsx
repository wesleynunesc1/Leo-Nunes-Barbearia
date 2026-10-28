"use client";

import React, { useEffect } from "react";
import { X, ArrowLeft, Check } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { Step1Barber } from "./Step1Barber";
import { Step2Service } from "./Step2Service";
import { Step3Date } from "./Step3Date";
import { Step4Time } from "./Step4Time";
import { Step5Confirm } from "./Step5Confirm";

const STEP_LABELS = [
  "Barbeiro",
  "Serviço",
  "Data",
  "Horário",
  "Confirmação",
];

export function BookingModal() {
  const { isModalOpen, closeBooking, step, goToStep } = useBooking();

  if (!isModalOpen) return null;

  const handlePrevStep = () => {
    if (step > 1) {
      goToStep((step - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Backdrop escuro com blur */}
      <div
        onClick={closeBooking}
        className="fixed inset-0 bg-[#040605]/85 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl md:max-w-4xl bg-[#080B09] sm:rounded-3xl border-0 sm:border border-[#1E2D22] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col z-10 overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0B100C] border-b border-[#1A261D] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                aria-label="Voltar para etapa anterior"
                className="p-1.5 sm:p-2 rounded-xl text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#142017] border border-[#202E23] transition-all flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            ) : (
              <div className="w-8" />
            )}

            <div className="pl-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold block">
                Agendamento Online
              </span>
              <h1 id="booking-modal-title" className="font-heading text-sm sm:text-base font-black text-[#FFFFFF]">
                LÉO NUNES BARBEARIA
              </h1>
            </div>
          </div>

          {/* Botão Fechar */}
          <button
            type="button"
            onClick={closeBooking}
            aria-label="Fechar janela de agendamento"
            className="p-2 rounded-xl text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#142017] border border-[#202E23] transition-all focus:outline-none focus:ring-2 focus:ring-[#25C440]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#090E0A] border-b border-[#162118] shrink-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEP_LABELS.map((label, idx) => {
              const stepNumber = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              const isCompleted = step > stepNumber;
              const isCurrent = step === stepNumber;

              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  {/* Step Item */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      disabled={!isCompleted && !isCurrent}
                      onClick={() => isCompleted && goToStep(stepNumber)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isCurrent
                          ? "bg-[#25C440] text-[#080B09] ring-2 ring-[#FFFFFF] shadow-lg shadow-[#25C440]/30 font-black scale-105"
                          : isCompleted
                          ? "bg-[#18301D] text-[#25C440] border border-[#25C440]/50 hover:bg-[#203D26] cursor-pointer"
                          : "bg-[#101712] text-[#47544A] border border-[#1B271E] cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNumber}
                    </button>
                    <span className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase mt-1 hidden sm:block ${
                      isCurrent ? "text-[#25C440] font-bold" : isCompleted ? "text-[#D4DDD6]" : "text-[#47544A]"
                    }`}>
                      {label}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {idx < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-1.5 sm:mx-2 rounded-full transition-colors ${
                      step > stepNumber ? "bg-[#25C440]" : "bg-[#18231B]"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Active Step */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-contain">
          {step === 1 && <Step1Barber />}
          {step === 2 && <Step2Service />}
          {step === 3 && <Step3Date />}
          {step === 4 && <Step4Time />}
          {step === 5 && <Step5Confirm />}
        </div>
      </div>
    </div>
  );
}
