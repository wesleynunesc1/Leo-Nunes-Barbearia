"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Plus,
  Scissors,
  CheckCircle2,
  Clock3,
  MapPin,
  Loader2,
  AlertCircle,
  XCircle,
  History,
  ShieldCheck,
  Info,
  Settings,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import { MemberBookingItem } from "@/lib/wixAuth";

export default function MeusAgendamentosPage() {
  const router = useRouter();
  const { member, loading: authLoading } = useAuth();
  const { openBooking } = useBooking();

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<MemberBookingItem[]>([]);
  const [past, setPast] = useState<MemberBookingItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !member) {
      router.replace("/login?redirect=/minha-conta/agendamentos");
    }
  }, [member, authLoading, router]);

  useEffect(() => {
    if (!member) return;

    let isMounted = true;
    async function fetchBookings() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch("/api/member/bookings");
        if (res.status === 401) {
          router.replace("/login?redirect=/minha-conta/agendamentos");
          return;
        }

        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setUpcoming(data.upcoming || []);
            setPast(data.past || []);
          } else {
            setErrorMessage(data.error || "Não foi possível carregar as reservas.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage("Erro de conexão com o Wix Bookings.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [member, router]);

  if (authLoading || (!member && !errorMessage)) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
      </div>
    );
  }

  const currentList = activeTab === "upcoming" ? upcoming : past;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
            <CheckCircle2 className="w-3 h-3" />
            Confirmado
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock3 className="w-3 h-3" />
            Pendente
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-[#A6AEA8] border border-white/15">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Recusado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F3] pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navegação de Topo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/minha-conta"
              className="p-2 rounded-xl bg-[#0D120E] border border-white/[0.08] hover:border-[#25C440]/50 text-[#A6AEA8] hover:text-white transition-colors"
              title="Voltar para Minha Conta"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>Meus Agendamentos</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#142618] text-[#25C440] border border-[#25C440]/30">
                  Wix Bookings
                </span>
              </h1>
              <p className="text-xs text-[#A6AEA8]">
                Consulte suas reservas em tempo real com dados oficiais do Wix
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-[0_0_15px_rgba(37,196,64,0.3)] transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Novo Horário</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs rounded-t-xl transition-all cursor-pointer relative ${
              activeTab === "upcoming"
                ? "text-[#25C440] bg-[#0D120E] border-t border-x border-white/[0.08] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-[#25C440]"
                : "text-[#A6AEA8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Próximos Agendamentos</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#142618] text-[#25C440]">
              {upcoming.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs rounded-t-xl transition-all cursor-pointer relative ${
              activeTab === "past"
                ? "text-[#25C440] bg-[#0D120E] border-t border-x border-white/[0.08] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-[#25C440]"
                : "text-[#A6AEA8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Atendimentos</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-white/10 text-[#A6AEA8]">
              {past.length}
            </span>
          </button>
        </div>

        {/* Conteúdo da Lista */}
        {loading ? (
          <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#25C440] mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Consultando Wix Bookings Reader V2...
            </h3>
            <p className="text-xs text-[#A6AEA8]">
              Verificando reservas associadas ao seu Contact ID oficial.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="bg-[#0D120E] border border-red-500/30 rounded-2xl p-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Falha ao Carregar Agendamentos
              </h3>
              <p className="text-xs text-red-300/90">{errorMessage}</p>
            </div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-12 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#142016] border border-[#25C440]/30 flex items-center justify-center mx-auto mb-4">
              {activeTab === "upcoming" ? (
                <Calendar className="w-6 h-6 text-[#25C440]" />
              ) : (
                <History className="w-6 h-6 text-[#25C440]" />
              )}
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {activeTab === "upcoming"
                ? "Nenhum agendamento futuro encontrado"
                : "Nenhum atendimento no histórico"}
            </h3>
            <p className="text-xs text-[#A6AEA8] max-w-md mx-auto mb-6">
              {activeTab === "upcoming"
                ? "Você ainda não possui horários marcados para os próximos dias. Garanta seu atendimento com nossa equipe de especialistas."
                : "Seus atendimentos concluídos serão exibidos aqui conforme você frequentar a Léo Nunes Barbearia."}
            </p>
            {activeTab === "upcoming" && (
              <button
                type="button"
                onClick={() => openBooking()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar Horário Agora</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((item) => (
              <div
                key={item.id}
                className="bg-[#0D120E] border border-white/[0.08] hover:border-[#25C440]/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(item.status)}
                      {item.multiServiceBookingId && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
                          <Layers className="w-3 h-3" />
                          Pacote Agrupado
                        </span>
                      )}
                      {item.formattedPrice && (
                        <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                          {item.formattedPrice}
                        </span>
                      )}
                      <span className="text-[11px] text-[#7B857E]">
                        ID: {item.id.slice(0, 8)}...
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {item.serviceName}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-[#A6AEA8]">
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                        <span>Barbeiro: <strong className="text-white">{item.barberName}</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                        <span>Duração: <strong className="text-white">{item.durationMinutes} minutos</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                        <span>Data: <strong className="text-white">{item.formattedDate}</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                        <span>Horário: <strong className="text-[#25C440] font-bold">{item.formattedTime}</strong> (Fuso Fortaleza)</span>
                      </p>
                    </div>

                    <p className="flex items-center gap-2 text-xs text-[#7B857E] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                      <span>{item.locationName || "Rua Joaquim Nogueira Lopes, 180, Pacajus - CE"}</span>
                    </p>
                  </div>

                  {/* Ações da Reserva */}
                  {item.isUpcoming && item.status !== "CANCELED" && item.status !== "DECLINED" && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] shrink-0">
                      <Link
                        href={`/minha-conta/agendamentos/${item.id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#142618] hover:bg-[#1a3320] border border-[#25C440]/30 hover:border-[#25C440]/60 text-[#25C440] hover:text-white font-bold text-xs transition-all shadow-sm hover:shadow-[#25C440]/10 cursor-pointer"
                        id={`btn-gerenciar-${item.id}`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Gerenciar Reserva</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card Informativo sobre Vínculo Seguro de Reservas */}
        <div className="bg-[#121914] border border-[#25C440]/25 rounded-2xl p-5 sm:p-6 text-xs text-[#A6AEA8] space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#25C440]" />
            <span>Segurança e Vínculo de Reservas Wix</span>
          </div>
          <p>
            Seus agendamentos são consultados diretamente pelo seu identificador oficial <strong>Contact ID</strong> no Wix Bookings Reader V2.
            Por rigorosos critérios de privacidade e segurança, reservas nunca são expostas com base apenas em nome ou telefone digitados no navegador.
          </p>
          <p className="text-[#7B857E]">
            Reservas realizadas anteriormente como visitante no mesmo WhatsApp ou e-mail são vinculadas automaticamente pelo Wix Contacts assim que seu perfil de membro estiver com e-mail verificado.
          </p>
        </div>
      </div>
    </div>
  );
}
