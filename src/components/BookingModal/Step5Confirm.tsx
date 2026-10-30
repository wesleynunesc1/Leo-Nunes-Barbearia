"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CalendarCheck,
  Phone,
  User,
  Mail,
  FileText,
  Lock,
  Layers,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";

export function Step5Confirm() {
  const { member } = useAuth();
  const {
    selectedBarber,
    selectedService,
    selectedServices,
    totalPrice,
    totalDurationMinutes,
    selectedSlotMetadata,
    selectedDate,
    selectedTime,
    customer,
    updateCustomer,
    submitBooking,
    isSubmitting,
    bookingResult,
    goToStep,
    closeBooking,
    resetBooking,
  } = useBooking();

  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  // Preenchimento automático para membros autenticados
  React.useEffect(() => {
    if (member) {
      updateCustomer({
        name: customer.name || member.name,
        email: customer.email || member.email || "",
        phone: customer.phone || member.phone || "",
      });
    }
  }, [member]);

  if (!selectedBarber || (selectedServices.length === 0 && !selectedService) || !selectedDate || !selectedTime) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#A6AEA8]">Dados incompletos para a confirmação.</p>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="mt-4 px-4 py-2 bg-[#25C440] text-[#080B09] font-bold text-xs rounded-xl"
        >
          Reiniciar agendamento
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

  const isMulti = selectedServices.length > 1;
  const estimatedEndTime = selectedSlotMetadata?.endTime || "";

  // Máscara de telefone/WhatsApp: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    updateCustomer({ phone: value });
    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCustomer({ name: e.target.value });
    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: { name?: string; phone?: string } = {};
    if (!customer.name || customer.name.trim().length < 3) {
      errors.name = "Informe seu nome completo.";
    }

    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      errors.phone = "Informe um WhatsApp válido com DDD.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    await submitBooking();
  };

  // =========================================================================
  // TELA DE SUCESSO: QUANDO CONFIRMADO OFICIALMENTE NO WIX
  // =========================================================================
  if (bookingResult && bookingResult.success && bookingResult.status === "CONFIRMED") {
    return (
      <div className="py-6 sm:py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#142E19] border-2 border-[#25C440] flex items-center justify-center text-[#25C440] mx-auto shadow-[0_0_35px_rgba(37,196,64,0.4)]">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#25C440]">
            {isMulti ? "Pacote de Serviços Confirmado no Wix" : "Reserva Oficial Wix Confirmada"}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            AGENDAMENTO CONFIRMADO!
          </h2>
          <p className="text-xs sm:text-sm text-[#A6AEA8] max-w-md mx-auto">
            {bookingResult.message}
          </p>
        </div>

        {/* Card do Resumo Confirmado */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B100C] border border-[#1E2E21] max-w-md mx-auto text-left space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#25C440]/50 shrink-0">
              <Image src={selectedBarber.photo} alt={selectedBarber.name} fill className="object-cover object-center" sizes="48px" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#25C440] font-bold">Barbeiro</p>
              <h4 className="font-heading text-sm font-black text-[#FFFFFF]">{selectedBarber.name}</h4>
            </div>
          </div>

          {/* Lista de Serviços */}
          <div className="space-y-1.5 py-1 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase text-[#6F7B72] font-bold block">
              {isMulti ? `Serviços Agendados (${selectedServices.length})` : "Serviço"}
            </span>
            {selectedServices.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#FFFFFF]">{svc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A6AEA8]">{svc.durationMinutes} min</span>
                  <span className="font-bold text-[#25C440]">{svc.formattedPrice}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-[#6F7B72] block">Data:</span>
              <span className="font-bold text-[#FFFFFF] capitalize">{formattedDate}</span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Horário:</span>
              <span className="font-bold text-[#FFFFFF]">
                {selectedTime} {estimatedEndTime ? `às ${estimatedEndTime}` : ""}
              </span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Duração Total:</span>
              <span className="font-bold text-[#25C440]">{totalDurationMinutes} minutos</span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Valor Total:</span>
              <span className="font-bold text-[#25C440]">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {(bookingResult.multiServiceBookingId || bookingResult.bookingId) && (
            <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#6F7B72]">
              Código da Reserva:{" "}
              <span className="text-[#A6AEA8]">
                {bookingResult.multiServiceBookingId || bookingResult.bookingId}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeBooking}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-xs sm:text-sm shadow-lg shadow-[#25C440]/25 transition-all"
          >
            Concluir
          </button>
          <button
            type="button"
            onClick={resetBooking}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#121A14] text-[#A6AEA8] hover:text-[#FFFFFF] text-xs font-bold border border-[#202E23] transition-colors"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA DE RESERVA PENDENTE DE APROVAÇÃO
  // =========================================================================
  if (bookingResult && bookingResult.success && bookingResult.status === "PENDING") {
    return (
      <div className="py-6 sm:py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2A2412] border-2 border-[#E6C650] flex items-center justify-center text-[#E6C650] mx-auto shadow-[0_0_35px_rgba(230,198,80,0.3)]">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E6C650]">
            Reserva Registrada no Wix
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            SOLICITAÇÃO RECEBIDA
          </h2>
          <p className="text-xs sm:text-sm text-[#A6AEA8] max-w-md mx-auto">
            {bookingResult.message || "Solicitação recebida. Aguardando confirmação da barbearia."}
          </p>
        </div>

        {/* Card do Resumo */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B100C] border border-[#2A2412] max-w-md mx-auto text-left space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E6C650]/50 shrink-0">
              <Image src={selectedBarber.photo} alt={selectedBarber.name} fill className="object-cover object-center" sizes="48px" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#E6C650] font-bold">Barbeiro</p>
              <h4 className="font-heading text-sm font-black text-[#FFFFFF]">{selectedBarber.name}</h4>
            </div>
          </div>

          <div className="space-y-1.5 py-1 border-b border-white/[0.06]">
            {selectedServices.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#FFFFFF]">{svc.name}</span>
                <span className="text-[#E6C650]">{svc.formattedPrice}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-[#6F7B72] block">Data:</span>
              <span className="font-bold text-[#FFFFFF] capitalize">{formattedDate}</span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Horário:</span>
              <span className="font-bold text-[#FFFFFF]">{selectedTime}</span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Valor Total:</span>
              <span className="font-bold text-[#E6C650]">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>
            <div>
              <span className="text-[#6F7B72] block">Duração Total:</span>
              <span className="font-bold text-[#FFFFFF]">{totalDurationMinutes} min</span>
            </div>
          </div>

          {bookingResult.bookingId && (
            <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#6F7B72]">
              Código da Reserva: <span className="text-[#E6C650]">{bookingResult.bookingId}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeBooking}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#E6C650] hover:bg-[#F0D265] text-[#080B09] font-black text-xs sm:text-sm shadow-lg shadow-[#E6C650]/20 transition-all"
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={resetBooking}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#121A14] text-[#A6AEA8] hover:text-[#FFFFFF] text-xs font-bold border border-[#202E23] transition-colors"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA DE VALIDAÇÃO DRY-RUN / CHECKOUT SEGURO
  // =========================================================================
  if (
    bookingResult &&
    (bookingResult.status === "CHECKOUT_REQUIRED" ||
      bookingResult.status === "DRY_RUN_VALIDATED" ||
      bookingResult.checkoutUrl)
  ) {
    return (
      <div className="py-4 sm:py-6 space-y-5 animate-in zoom-in-95 duration-300">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131A14] border border-[#25C440]/50 space-y-4 shadow-[0_0_30px_rgba(37,196,64,0.15)]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#182F1D] border border-[#25C440]/60 flex items-center justify-center text-[#25C440] shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18281C] text-[10px] font-mono font-bold uppercase tracking-wider text-[#25C440] border border-[#25C440]/40">
                <span>{isMulti ? "Wix Multi-Service V2 Conectado" : "Conexão Wix Bookings V2 Ativa"}</span>
              </div>
              <h3 className="font-heading text-base sm:text-lg font-black text-[#FFFFFF]">
                Disponibilidade Conjunta & Dados Validados!
              </h3>
              <p className="text-xs text-[#A6AEA8] leading-relaxed">
                {bookingResult.message}
              </p>
            </div>
          </div>

          {/* Dados confirmados */}
          <div className="p-3.5 rounded-xl bg-[#0B100C] border border-[#1A251D] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#25C440] font-bold block">
              Resumo da Simulação de Agendamento:
            </span>
            <div className="space-y-1 py-1 border-b border-white/[0.06]">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#FFFFFF]">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#A6AEA8]">{s.durationMinutes} min</span>
                    <span className="font-bold text-[#25C440]">{s.formattedPrice}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div>
                <span className="text-[#6F7B72] block text-[10px]">Barbeiro</span>
                <span className="font-bold text-[#FFFFFF]">{selectedBarber.name}</span>
              </div>
              <div>
                <span className="text-[#6F7B72] block text-[10px]">Data & Horário</span>
                <span className="font-bold text-[#25C440] capitalize">{formattedDate} às {selectedTime}</span>
              </div>
              <div>
                <span className="text-[#6F7B72] block text-[10px]">Duração & Valor</span>
                <span className="font-bold text-[#FFFFFF]">{totalDurationMinutes} min • R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
              <div>
                <span className="text-[#6F7B72] block text-[10px]">Cliente</span>
                <span className="font-bold text-[#FFFFFF] truncate block">{customer.name}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1611] border border-[#233526] text-[11px] text-[#8EA093] leading-relaxed">
            🛡️ <strong className="text-white">Segurança Garantida:</strong> A disponibilidade contínua de todas as sessões foi verificada diretamente na API oficial do Wix Bookings. Nenhuma reserva real foi gerada sem sua autorização explícita.
          </div>

          {/* Ações */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeBooking}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-xs sm:text-sm shadow-md transition-all"
            >
              Concluir Teste
            </button>
            {bookingResult.directWixUrl && (
              <a
                href={bookingResult.directWixUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#25C440]/40 text-[#25C440] hover:bg-[#25C440]/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <span>Ver na Agenda Wix Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={resetBooking}
            className="text-xs text-[#A6AEA8] hover:text-[#FFFFFF] underline"
          >
            Fazer outro teste de agendamento
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FORMULÁRIO DE CONFIRMAÇÃO (ETAPA 5)
  // =========================================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142618] border border-[#25C440]/30 text-[11px] font-bold uppercase tracking-wider text-[#25C440]">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Etapa 5 de 5</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#FFFFFF]">
          CONFIRMAR AGENDAMENTO
        </h2>
        <p className="text-xs text-[#9BA59E]">
          Revise os detalhes dos serviços selecionados e preencha seus dados para finalizar a reserva.
        </p>
      </div>

      {/* Banner de Erros Semânticos do Wix */}
      {bookingResult && bookingResult.status === "ERROR" && (
        <div className="p-4 rounded-xl bg-[#201010] border border-[#E65050]/60 space-y-2 animate-in fade-in-50 duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#E65050] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-heading text-xs sm:text-sm font-bold text-[#FFFFFF]">
                {bookingResult.errorCode === "SLOT_UNAVAILABLE" && "Horário Não Mais Disponível"}
                {bookingResult.errorCode === "SLOT_NOT_FOUND" && "Horário Não Encontrado na Grade"}
                {bookingResult.errorCode === "DUPLICATE_BOOKING" && "Solicitação Recente Detectada"}
                {bookingResult.errorCode === "CONCURRENT_REQUEST" && "Horário em Processamento"}
                {bookingResult.errorCode === "AUTH_ERROR" && "Erro de Autenticação com o Wix"}
                {bookingResult.errorCode === "PERMISSION_DENIED" && "Permissão Insuficiente no Wix"}
                {bookingResult.errorCode === "API_UNAVAILABLE" && "Instabilidade no Servidor Wix"}
                {(!bookingResult.errorCode || bookingResult.errorCode === "CREATION_FAILED") && "Falha na Criação da Reserva"}
              </h5>
              <p className="text-xs text-[#F2B8B8] leading-relaxed">
                {bookingResult.message}
              </p>
            </div>
          </div>

          {(bookingResult.errorCode === "SLOT_UNAVAILABLE" || bookingResult.errorCode === "SLOT_NOT_FOUND") && (
            <div className="pt-2 border-t border-[#E65050]/20 flex justify-end">
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="text-xs font-bold text-[#FFFFFF] bg-[#E65050]/30 hover:bg-[#E65050]/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Escolher outro horário
              </button>
            </div>
          )}
        </div>
      )}

      {/* Card de Resumo do Agendamento */}
      <div className="p-4 rounded-2xl bg-[#0B100C] border border-[#1C291E] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#25C440]/50 shrink-0">
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
                {selectedBarber.role}
              </span>
              <h4 className="font-heading text-sm sm:text-base font-black text-[#FFFFFF]">
                {selectedBarber.name}
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#6F7B72] block">Valor Total</span>
            <span className="font-heading text-base sm:text-lg font-black text-[#25C440]">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        {/* Breakdown de Serviços */}
        <div className="space-y-2 py-1 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F7B72] font-bold block">
            {isMulti ? `Serviços Selecionados (${selectedServices.length})` : "Serviço Selecionado"}
          </span>
          <div className="space-y-1.5">
            {selectedServices.map((service, idx) => (
              <div
                key={service.id || idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#101712] border border-[#1A251D] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#16251A] text-[#25C440] flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-[#FFFFFF]">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#A6AEA8] text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#25C440]" />
                    {service.durationMinutes} min
                  </span>
                  <span className="font-black text-[#25C440]">{service.formattedPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dados de Horário e Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-[#101712] border border-[#1A251D]">
            <span className="text-[#6F7B72] block text-[10px]">Data</span>
            <span className="font-bold text-[#FFFFFF] capitalize leading-snug">{formattedDate}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101712] border border-[#1A251D]">
            <span className="text-[#6F7B72] block text-[10px]">Horário</span>
            <span className="font-bold text-[#25C440] text-sm leading-snug">{selectedTime}</span>
            {estimatedEndTime && (
              <span className="text-[10px] text-[#A6AEA8] block mt-0.5">
                Término estimado: {estimatedEndTime}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-[#101712] border border-[#1A251D]">
            <span className="text-[#6F7B72] block text-[10px]">Duração Total</span>
            <span className="font-bold text-[#FFFFFF] text-sm leading-snug">{totalDurationMinutes} min</span>
            <span className="text-[10px] text-[#25C440] block mt-0.5">Sessão contínua oficial</span>
          </div>
        </div>
      </div>

      {/* Formulário do Cliente */}
      <div className="space-y-3 pt-1">
        {member ? (
          <div className="p-3 rounded-xl bg-[#142618]/60 border border-[#25C440]/30 flex items-center justify-between text-xs text-[#25C440]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Conectado como <strong>{member.name}</strong> • Vínculo oficial com sua conta</span>
            </span>
          </div>
        ) : null}

        <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-[#D4DDD6] flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#25C440]" />
          <span>Seus Dados para o Agendamento</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#A6AEA8] block">
              Nome Completo <span className="text-[#25C440]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customer.name}
                onChange={handleNameChange}
                placeholder="Ex: Wesley Nunes"
                required
                className={`w-full bg-[#0E1510] text-[#FFFFFF] text-base sm:text-sm px-3.5 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                  formErrors.name ? "border-[#E65050]" : "border-[#1E2C20] focus:border-[#25C440]"
                }`}
              />
            </div>
            {formErrors.name && (
              <span className="text-[10px] text-[#E65050]">{formErrors.name}</span>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#A6AEA8] block">
              WhatsApp / Celular <span className="text-[#25C440]">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={customer.phone}
                onChange={handlePhoneChange}
                placeholder="(85) 99999-9999"
                required
                className={`w-full bg-[#0E1510] text-[#FFFFFF] text-base sm:text-sm px-3.5 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                  formErrors.phone ? "border-[#E65050]" : "border-[#1E2C20] focus:border-[#25C440]"
                }`}
              />
            </div>
            {formErrors.phone && (
              <span className="text-[10px] text-[#E65050]">{formErrors.phone}</span>
            )}
          </div>

          {/* E-mail (opcional) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#A6AEA8] block">
              E-mail <span className="text-[#6F7B72]">(opcional)</span>
            </label>
            <input
              type="email"
              value={customer.email || ""}
              onChange={(e) => updateCustomer({ email: e.target.value })}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-[#0E1510] text-[#FFFFFF] text-base sm:text-sm px-3.5 py-3 rounded-xl border border-[#1E2C20] focus:border-[#25C440] focus:outline-none focus:ring-2 focus:ring-[#25C440] transition-all"
            />
          </div>

          {/* Observações (opcional) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#A6AEA8] block">
              Observações <span className="text-[#6F7B72]">(opcional)</span>
            </label>
            <input
              type="text"
              value={customer.notes || ""}
              onChange={(e) => updateCustomer({ notes: e.target.value })}
              placeholder="Alguma preferência ou detalhe?"
              className="w-full bg-[#0E1510] text-[#FFFFFF] text-base sm:text-sm px-3.5 py-3 rounded-xl border border-[#1E2C20] focus:border-[#25C440] focus:outline-none focus:ring-2 focus:ring-[#25C440] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Botão Principal de Confirmação */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-xl shadow-[0_0_25px_rgba(37,196,64,0.35)] hover:shadow-[0_0_35px_rgba(37,196,64,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>VALIDANDO AGENDAMENTO...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <span>CONFIRMAR AGENDAMENTO</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-[#6F7B72] mt-2.5 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-[#25C440]" />
          <span>Seus dados são protegidos e sincronizados com a agenda oficial Wix.</span>
        </p>
      </div>
    </form>
  );
}
