"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  LogOut,
  Plus,
  Scissors,
  CheckCircle2,
  Clock3,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  History,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import { MemberBookingItem } from "@/lib/wixAuth";
import { PushNotificationManager } from "@/components/PushNotificationManager";

export default function MinhaContaPage() {
  const router = useRouter();
  const { member, loading: authLoading, logout } = useAuth();
  const { openBooking } = useBooking();

  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<MemberBookingItem[]>([]);
  const [pastBookings, setPastBookings] = useState<MemberBookingItem[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!authLoading && !member) {
      router.replace("/login?redirect=/minha-conta");
    }
  }, [member, authLoading, router]);

  // Carrega as reservas reais do membro
  useEffect(() => {
    if (!member) return;

    let isMounted = true;
    async function loadBookings() {
      setBookingsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/member/bookings");
        if (res.status === 401) {
          router.replace("/login?redirect=/minha-conta");
          return;
        }
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setUpcomingBookings(data.upcoming || []);
            setPastBookings(data.past || []);
          } else {
            setFetchError(data.error || "Não foi possível carregar seus agendamentos.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError("Erro de conexão ao carregar agendamentos.");
        }
      } finally {
        if (isMounted) {
          setBookingsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [member, router]);

  if (authLoading || (!member && !fetchError)) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
      </div>
    );
  }

  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  // Iniciais do membro
  const initials = member?.name
    ? member.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LN";

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F3] pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#25C440]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabeçalho do Perfil */}
        <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#25C440]/5 rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            {/* Avatar com Fallback Elegante de Iniciais */}
            {member?.avatarUrl &&
            !avatarError &&
            (member.avatarUrl.startsWith("https://") || member.avatarUrl.startsWith("http://")) ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 sm:max-w-20 rounded-full overflow-hidden border-2 border-[#25C440] shadow-[0_0_15px_rgba(37,196,64,0.3)] shrink-0 bg-[#142016]">
                <Image
                  src={member.avatarUrl}
                  alt={member?.name || "Foto de perfil"}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#142016] border-2 border-[#25C440] flex items-center justify-center text-xl sm:text-2xl font-black text-[#25C440] shadow-[0_0_15px_rgba(37,196,64,0.3)] shrink-0 select-none">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {member?.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#142618] text-[#25C440] border border-[#25C440]/30">
                  <ShieldCheck className="w-3 h-3" />
                  Membro Wix
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A6AEA8]">
                {member?.email || "E-mail não informado"}
              </p>
              {member?.phone && (
                <p className="text-xs text-[#7B857E] mt-0.5">
                  WhatsApp: {member.phone}
                </p>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <button
              type="button"
              onClick={() => openBooking()}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,196,64,0.3)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#141815] hover:bg-[#1D241F] border border-white/[0.08] hover:border-red-500/30 text-[#A6AEA8] hover:text-red-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#0D120E] border border-white/[0.08] p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-[#7B857E] tracking-wider">
                Próximo Atendimento
              </span>
              <Calendar className="w-4 h-4 text-[#25C440]" />
            </div>
            <div className="text-lg font-bold text-white truncate">
              {bookingsLoading
                ? "Carregando..."
                : nextBooking
                ? `${nextBooking.localDate.split("-").reverse().slice(0, 2).join("/")} às ${nextBooking.formattedTime}`
                : "Nenhum agendado"}
            </div>
            <p className="text-xs text-[#A6AEA8] mt-1">
              {nextBooking ? nextBooking.serviceName : "Agenda livre"}
            </p>
          </div>

          <div className="bg-[#0D120E] border border-white/[0.08] p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-[#7B857E] tracking-wider">
                Agendamentos Futuros
              </span>
              <Clock3 className="w-4 h-4 text-[#25C440]" />
            </div>
            <div className="text-2xl font-black text-white">
              {bookingsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : upcomingBookings.length}
            </div>
            <p className="text-xs text-[#A6AEA8] mt-1">
              {upcomingBookings.length === 1 ? "1 horário confirmado" : `${upcomingBookings.length} horários ativos`}
            </p>
          </div>

          <div className="bg-[#0D120E] border border-white/[0.08] p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-[#7B857E] tracking-wider">
                Histórico Concluído
              </span>
              <History className="w-4 h-4 text-[#25C440]" />
            </div>
            <div className="text-2xl font-black text-white">
              {bookingsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : pastBookings.length}
            </div>
            <p className="text-xs text-[#A6AEA8] mt-1">
              Atendimentos realizados no Wix
            </p>
          </div>
        </div>

        {/* Destaque do Próximo Agendamento */}
        <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#25C440]" />
                <span>Seu Próximo Agendamento</span>
              </h2>
              <p className="text-xs text-[#A6AEA8] mt-0.5">
                Dados oficiais sincronizados diretamente com o Wix Bookings
              </p>
            </div>

            <Link
              href="/minha-conta/agendamentos"
              className="text-xs font-semibold text-[#25C440] hover:text-[#2CD64A] flex items-center gap-1 transition-colors"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#A6AEA8]">
              <Loader2 className="w-6 h-6 animate-spin text-[#25C440] mb-2" />
              <span className="text-xs">Consultando agenda no Wix...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{fetchError}</span>
            </div>
          ) : nextBooking ? (
            <div className="bg-[#121914] border border-[#25C440]/30 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_0_20px_rgba(37,196,64,0.08)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#25C440]/20 text-[#25C440] border border-[#25C440]/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {nextBooking.status === "CONFIRMED" ? "Confirmado" : nextBooking.status}
                  </span>
                  {nextBooking.formattedPrice && (
                    <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                      {nextBooking.formattedPrice}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-white">
                  {nextBooking.serviceName}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A6AEA8]">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#25C440] shrink-0" />
                    <span>Barbeiro: <strong className="text-white">{nextBooking.barberName}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#25C440] shrink-0" />
                    <span>Duração: <strong className="text-white">{nextBooking.durationMinutes} minutos</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#25C440] shrink-0" />
                    <span>Data: <strong className="text-white">{nextBooking.formattedDate}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-[#25C440] shrink-0" />
                    <span>Horário: <strong className="text-[#25C440] font-bold text-sm">{nextBooking.formattedTime}</strong> (Fuso Fortaleza)</span>
                  </p>
                </div>

                <p className="flex items-center gap-2 text-xs text-[#7B857E] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                  <span>Rua Joaquim Nogueira Lopes, 180, Pacajus - CE</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <Link
                  href="/minha-conta/agendamentos"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 text-center transition-colors"
                >
                  Ver Detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="px-5 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-xs text-center transition-colors cursor-pointer"
                >
                  Agendar Outro Horário
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 border border-dashed border-white/[0.08] rounded-xl">
              <Calendar className="w-10 h-10 text-[#7B857E] mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Nenhum agendamento futuro
              </h3>
              <p className="text-xs text-[#A6AEA8] max-w-md mx-auto mb-5">
                Você não possui horários marcados no momento. Escolha o barbeiro, serviço e horário de sua preferência.
              </p>
              <button
                type="button"
                onClick={() => openBooking()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agendar Horário Agora</span>
              </button>
            </div>
          )}
        </div>

        {/* Gerenciamento de Notificações Push PWA */}
        <PushNotificationManager />

        {/* Histórico Recente */}
        {pastBookings.length > 0 && (
          <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#25C440]" />
                <span>Atendimentos Concluídos Recentes</span>
              </h2>
              <Link
                href="/minha-conta/agendamentos"
                className="text-xs text-[#25C440] hover:underline"
              >
                Histórico completo ({pastBookings.length})
              </Link>
            </div>

            <div className="space-y-3">
              {pastBookings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#080B09] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">
                      {item.serviceName}
                    </h4>
                    <p className="text-[#A6AEA8]">
                      Barbeiro: {item.barberName} • {item.formattedDate} às {item.formattedTime}
                    </p>
                  </div>
                  <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#A6AEA8] border border-white/10">
                    Concluído
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
