"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Scissors,
  CheckCircle2,
  Clock3,
  MapPin,
  Loader2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  CalendarCheck,
  CalendarX,
  ArrowRight,
  Info,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TimeSlot } from "@/types/booking";

interface BookingDetail {
  id: string;
  revision: string;
  status: string;
  paymentStatus?: string;
  serviceTitle: string;
  serviceId: string;
  barberName: string;
  barberSlug?: string;
  barberRole: string;
  barberImage?: string;
  barberResourceId?: string;
  startDate: string;
  endDate: string;
  formattedDate: string;
  formattedTime: string;
  localDate: string;
  durationMinutes: number;
  priceFormatted?: string;
  locationName: string;
  allowedActions: {
    canCancel: boolean;
    canReschedule: boolean;
    cancelReason?: string;
    rescheduleReason?: string;
  };
  policies: {
    cancellation: string;
    reschedule: string;
  };
}

function GerenciarReservaContent({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const router = useRouter();
  const { member, loading: authLoading } = useAuth();
  const { bookingId } = use(params);

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Estados do Modal de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Estados do Painel de Reagendamento
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !member) {
      router.replace(`/login?redirect=/minha-conta/agendamentos/${bookingId}`);
    }
  }, [member, authLoading, router, bookingId]);

  // Carrega os dados oficiais da reserva do backend
  const fetchBooking = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/member/bookings/${bookingId}`);
      if (res.status === 401) {
        router.replace(`/login?redirect=/minha-conta/agendamentos/${bookingId}`);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setBooking(data.booking);
      } else {
        setErrorMessage(data.error || "Não foi possível carregar os detalhes do agendamento.");
      }
    } catch {
      setErrorMessage("Erro de conexão com o sistema de agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (member && bookingId) {
      fetchBooking();
    }
  }, [member, bookingId]);

  // Quando o cliente escolhe uma data para reagendar, consulta a disponibilidade oficial do profissional no Wix
  useEffect(() => {
    if (!selectedDate || !booking) return;

    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedTime(null);
      setRescheduleError(null);

      try {
        const barberParam = booking?.barberSlug || "aleffer-nunes";
        const serviceParam = booking?.serviceId;
        const res = await fetch(
          `/api/bookings/slots?date=${selectedDate}&barberId=${barberParam}&serviceId=${serviceParam}`
        );
        const data = await res.json();

        if (isMounted) {
          if (res.ok && Array.isArray(data.slots)) {
            setAvailableSlots(data.slots);
          } else {
            setAvailableSlots([]);
            setRescheduleError(data.error || "Nenhum horário disponível para a data selecionada.");
          }
        }
      } catch {
        if (isMounted) {
          setAvailableSlots([]);
          setRescheduleError("Falha ao consultar horários disponíveis.");
        }
      } finally {
        if (isMounted) {
          setLoadingSlots(false);
        }
      }
    }

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, booking]);

  // Confirmação de cancelamento via endpoint seguro
  const handleConfirmCancel = async () => {
    if (isCanceling || !booking) return;

    setIsCanceling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/member/bookings/${booking.id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsCancelModalOpen(false);
        setFeedbackSuccess("Seu agendamento foi cancelado com sucesso no Wix Bookings.");
        await fetchBooking();
      } else {
        setCancelError(data.error || "Não foi possível cancelar o agendamento.");
      }
    } catch {
      setCancelError("Erro de comunicação ao cancelar. Tente novamente.");
    } finally {
      setIsCanceling(false);
    }
  };

  // Confirmação de reagendamento via endpoint seguro
  const handleConfirmReschedule = async () => {
    if (isRescheduling || !booking || !selectedDate || !selectedTime) return;

    setIsRescheduling(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/member/bookings/${booking.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: selectedDate,
          newTime: selectedTime,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsRescheduleOpen(false);
        setFeedbackSuccess(
          `Agendamento reagendado com sucesso para ${data.formattedDate} às ${data.formattedTime}!`
        );
        await fetchBooking();
      } else {
        setRescheduleError(data.error || "Não foi possível reagendar para este horário.");
      }
    } catch {
      setRescheduleError("Erro de comunicação ao reagendar. Tente novamente.");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Gera as próximas 14 datas úteis para reagendamento (excluindo domingos se fechado)
  const getNextAvailableDates = () => {
    const dates: { dateStr: string; label: string; weekday: string }[] = [];
    const today = new Date();
    // Inicia a partir de amanhã para reagendamento seguro
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0) continue; // Domingo barbearia fechada

      const dateStr = d.toISOString().split("T")[0];
      const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(d);
      const label = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);

      dates.push({ dateStr, label, weekday: weekday.toUpperCase().replace(".", "") });
    }
    return dates;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmado
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock3 className="w-3.5 h-3.5" />
            Pendente
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-[#A6AEA8] border border-white/15">
            <XCircle className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Recusado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
            {status}
          </span>
        );
    }
  };

  if (authLoading || (!member && !errorMessage)) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F3] pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navegação de Topo */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/minha-conta/agendamentos"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D120E] border border-white/[0.08] hover:border-[#25C440]/50 text-[#A6AEA8] hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Meus Agendamentos</span>
          </Link>

          <span className="text-[11px] font-mono text-[#7B857E]">
            ID: {bookingId.slice(0, 12)}...
          </span>
        </div>

        {/* Mensagem de Feedback de Sucesso */}
        {feedbackSuccess && (
          <div className="p-4 rounded-2xl bg-[#25C440]/10 border border-[#25C440]/30 text-[#25C440] text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{feedbackSuccess}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#25C440] mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Consultando Wix Bookings Writer V2...
            </h3>
            <p className="text-xs text-[#A6AEA8]">
              Carregando dados oficiais e verificando políticas de cancelamento e reagendamento.
            </p>
          </div>
        ) : errorMessage || !booking ? (
          <div className="bg-[#0D120E] border border-red-500/30 rounded-2xl p-8 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Não foi possível acessar a reserva</h2>
            <p className="text-sm text-red-300 max-w-md mx-auto">{errorMessage}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={fetchBooking}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar novamente</span>
              </button>
              <Link
                href="/minha-conta/agendamentos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142618] border border-white/[0.08] text-[#A6AEA8] hover:text-white font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar aos Agendamentos</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card Principal da Reserva */}
            <div className="bg-[#0D120E] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {renderStatusBadge(booking.status)}
                    {booking.priceFormatted && (
                      <span className="text-xs font-bold text-white bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {booking.priceFormatted}
                      </span>
                    )}
                    <span className="text-xs text-[#7B857E]">
                      Revisão: v{booking.revision}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {booking.serviceTitle}
                  </h1>
                </div>

                {/* Perfil do Barbeiro com Foto */}
                <div className="flex items-center gap-3 bg-[#121914] border border-white/[0.06] p-3 rounded-2xl shrink-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1A261D] shrink-0 border border-[#25C440]/30">
                    {booking.barberImage ? (
                      <Image
                        src={booking.barberImage}
                        alt={booking.barberName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#25C440] font-bold">
                        {booking.barberName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A6AEA8]">Profissional</p>
                    <p className="text-sm font-bold text-white">{booking.barberName}</p>
                    <p className="text-[10px] text-[#25C440]">{booking.barberRole}</p>
                  </div>
                </div>
              </div>

              {/* Informações de Data, Horário e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <span className="text-xs text-[#7B857E] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#25C440]" />
                    Data Agendada
                  </span>
                  <p className="text-base font-bold text-white">{booking.formattedDate}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#7B857E] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#25C440]" />
                    Horário e Duração
                  </span>
                  <p className="text-base font-bold text-[#25C440]">
                    {booking.formattedTime}{" "}
                    <span className="text-xs font-normal text-[#A6AEA8]">
                      ({booking.durationMinutes} min)
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#7B857E] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#25C440]" />
                    Local de Atendimento
                  </span>
                  <p className="text-xs font-medium text-white">{booking.locationName}</p>
                </div>
              </div>

              {/* Ações Disponíveis */}
              <div className="pt-6 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#A6AEA8]">
                  Ações da Reserva
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Botão Reagendar */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRescheduleOpen(true);
                      setFeedbackSuccess(null);
                    }}
                    disabled={!booking.allowedActions.canReschedule}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#142618] hover:bg-[#1A3320] border border-[#25C440]/40 hover:border-[#25C440]/70 text-[#25C440] hover:text-white font-extrabold text-sm transition-all duration-200 shadow-md hover:shadow-[#25C440]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Reagendar Reserva</span>
                  </button>

                  {/* Botão Cancelar */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCancelModalOpen(true);
                      setCancelError(null);
                      setFeedbackSuccess(null);
                    }}
                    disabled={!booking.allowedActions.canCancel}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 hover:border-red-500/60 text-red-400 font-extrabold text-sm transition-all duration-200 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CalendarX className="w-4 h-4" />
                    <span>Cancelar Reserva</span>
                  </button>
                </div>

                {/* Avisos explicativos caso alguma ação esteja desabilitada */}
                {(!booking.allowedActions.canCancel || !booking.allowedActions.canReschedule) && (
                  <div className="space-y-1.5 pt-2">
                    {!booking.allowedActions.canReschedule && booking.allowedActions.rescheduleReason && (
                      <p className="text-xs text-amber-400/90 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Reagendamento: {booking.allowedActions.rescheduleReason}</span>
                      </p>
                    )}
                    {!booking.allowedActions.canCancel && booking.allowedActions.cancelReason && (
                      <p className="text-xs text-red-300/80 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Cancelamento: {booking.allowedActions.cancelReason}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Painel Interativo de Reagendamento */}
            {isRescheduleOpen && (
              <div className="bg-[#0D120E] border border-[#25C440]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-[#25C440]" />
                    <h2 className="text-lg font-bold text-white">Escolha Nova Data e Horário</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRescheduleOpen(false)}
                    className="text-xs text-[#A6AEA8] hover:text-white"
                  >
                    Fechar
                  </button>
                </div>

                {rescheduleError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{rescheduleError}</span>
                  </div>
                )}

                {/* 1. Escolha da Data */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8]">
                    1. Selecione a Nova Data
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {getNextAvailableDates().map((item) => (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedDate === item.dateStr
                            ? "bg-[#25C440] text-[#080B09] border-[#25C440] font-black shadow-lg"
                            : "bg-[#121914] border-white/[0.08] text-white hover:border-[#25C440]/50"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-80">
                          {item.weekday}
                        </span>
                        <span className="text-sm font-extrabold mt-0.5">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Escolha do Horário */}
                {selectedDate && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8]">
                      2. Horários Disponíveis para {booking.barberName}
                    </label>

                    {loadingSlots ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#25C440] mb-2" />
                        <span className="text-xs text-[#A6AEA8]">
                          Consultando grade oficial no Wix Bookings...
                        </span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#141C16] border border-white/[0.08] text-center text-xs text-[#A6AEA8]">
                        Nenhum horário livre encontrado para este profissional nesta data. Escolha outro dia.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => slot.available && setSelectedTime(slot.time)}
                              disabled={!slot.available}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                                !slot.available
                                  ? "bg-white/[0.03] text-[#5E6861] border border-transparent cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-[#25C440] text-[#080B09] border-[#25C440] shadow-md scale-105"
                                  : "bg-[#142618] text-[#25C440] border border-[#25C440]/30 hover:border-[#25C440] hover:text-white cursor-pointer"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Comparação de Horário e Confirmação */}
                {selectedDate && selectedTime && (
                  <div className="pt-4 border-t border-white/[0.08] space-y-4">
                    <div className="p-4 rounded-2xl bg-[#142016] border border-[#25C440]/30 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#25C440]" />
                        <span>Resumo da Alteração</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#080B09] border border-white/[0.06]">
                          <span className="text-[#7B857E] block text-[11px]">Horário Atual:</span>
                          <span className="text-white font-medium line-through">
                            {booking.formattedDate} às {booking.formattedTime}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#080B09] border border-[#25C440]/40">
                          <span className="text-[#25C440] block text-[11px] font-bold">Novo Horário:</span>
                          <span className="text-white font-bold">
                            {selectedDate.split("-").reverse().join("/")} às {selectedTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {rescheduleError && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{rescheduleError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRescheduleOpen(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-[#A6AEA8] hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReschedule}
                        disabled={isRescheduling}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                      >
                        {isRescheduling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirmando Reagendamento...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirmar Novo Horário</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Informações das Políticas da Barbearia */}
            <div className="bg-[#121914] border border-white/[0.08] rounded-3xl p-6 text-xs text-[#A6AEA8] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#25C440]" />
                <span>Políticas Oficiais de Cancelamento e Reagendamento</span>
              </div>
              <ul className="space-y-2 list-disc list-inside text-[#A6AEA8]">
                <li>{booking.policies.cancellation}</li>
                <li>{booking.policies.reschedule}</li>
                <li>
                  Todas as alterações são sincronizadas imediatamente com a agenda oficial do profissional no Wix Bookings.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      {isCancelModalOpen && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D120E] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <CalendarX className="w-6 h-6 text-red-400" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Cancelar Agendamento?</h3>
              <p className="text-xs text-[#A6AEA8]">
                Tem certeza que deseja cancelar o agendamento de{" "}
                <strong className="text-white">{booking.serviceTitle}</strong> com{" "}
                <strong className="text-white">{booking.barberName}</strong> em{" "}
                <strong className="text-white">{booking.formattedDate} às {booking.formattedTime}</strong>?
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141C16] border border-white/[0.06] text-xs text-[#A6AEA8] space-y-1">
              <p className="text-white font-medium">Atenção:</p>
              <p>O horário será imediatamente liberado para outros clientes no sistema oficial.</p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCanceling}
                className="px-4 py-2.5 text-xs font-semibold text-[#A6AEA8] hover:text-white cursor-pointer disabled:opacity-50"
              >
                Manter Agendamento
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelando...</span>
                  </>
                ) : (
                  <span>Sim, Cancelar Reserva</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GerenciarReservaPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
        </div>
      }
    >
      <GerenciarReservaContent params={params} />
    </Suspense>
  );
}
