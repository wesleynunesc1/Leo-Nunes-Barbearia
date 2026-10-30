"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  DollarSign,
  Layers,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Scissors,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

type AdminTab = "calendar" | "sales" | "catalog" | "team";

export default function AdminPage() {
  const router = useRouter();
  const { member, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("calendar");

  // Estados de dados
  const [bookings, setBookings] = useState<any[]>([]);
  const [barbersList, setBarbersList] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>(null);
  const [catalogServices, setCatalogServices] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Estados de carregamento e filtros
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedBarberFilter, setSelectedBarberFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Efeito para carregar dados conforme a aba ativa
  useEffect(() => {
    if (authLoading) return;
    if (!member || !member.isOwner) return;

    async function loadData() {
      setLoadingData(true);
      setErrorMsg("");
      try {
        if (activeTab === "calendar") {
          const params = new URLSearchParams();
          if (selectedBarberFilter !== "ALL") params.append("resourceId", selectedBarberFilter);
          if (selectedStatusFilter !== "ALL") params.append("status", selectedStatusFilter);

          const res = await fetch(`/api/admin/bookings?${params.toString()}`);
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Erro ao carregar reservas");
          setBookings(json.bookings || []);
          if (json.barbers) setBarbersList(json.barbers);
        } else if (activeTab === "sales") {
          const res = await fetch("/api/admin/sales");
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Erro ao carregar dados financeiros");
          setSalesData(json);
        } else if (activeTab === "catalog") {
          const res = await fetch("/api/admin/catalog");
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Erro ao carregar catálogo");
          setCatalogServices(json.services || []);
        } else if (activeTab === "team") {
          const res = await fetch("/api/admin/team");
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Erro ao carregar equipe");
          setTeamMembers(json.team || []);
        }
      } catch (err: any) {
        console.error("[ADMIN LOAD ERROR]", err);
        setErrorMsg(err.message || "Erro de conexão com as APIs do Wix.");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [activeTab, member, authLoading, selectedBarberFilter, selectedStatusFilter]);

  // Se estiver carregando autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center pt-24 pb-16 px-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#25C440] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#A6AEA8]">Verificando credenciais de proprietário...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado ou não for o OWNER autorizado
  if (!member || !member.isOwner) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center pt-28 pb-16 px-4">
        <div className="max-w-md w-full bg-[#0D140F] border border-red-500/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Acesso Restrito ao Proprietário
          </h1>
          <p className="text-xs text-[#A6AEA8] leading-relaxed">
            Esta área é exclusiva para a conta proprietária autorizada da Léo Nunes Barbearia (
            <span className="text-[#25C440] font-medium">wesleymito700@gmail.com</span>). Clientes e
            visitantes comuns não possuem permissão de acesso.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Página Inicial</span>
            </Link>
            {!member && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] text-xs font-extrabold shadow-sm transition-all"
              >
                <span>Fazer Login com a Conta Proprietária</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtragem de agendamentos por texto de busca
  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.customerName?.toLowerCase().includes(q) ||
      b.serviceName?.toLowerCase().includes(q) ||
      b.barberName?.toLowerCase().includes(q) ||
      b.customerPhone?.toLowerCase().includes(q) ||
      b.bookingNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#080B09] text-white pt-24 sm:pt-28 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho da Central Administrativa */}
        <div className="bg-[#0B120D]/95 border border-[#25C440]/30 rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25C440] to-[#178529] flex items-center justify-center text-[#080B09] shadow-lg shadow-[#25C440]/25 shrink-0">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Central Administrativa
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
                  OWNER
                </span>
              </div>
              <p className="text-xs text-[#A6AEA8] mt-1">
                Conectado como <strong className="text-white">{member.email}</strong> • Wix
                Bookings Reader V2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-semibold text-[#C8D5CA] hover:text-white transition-all border border-white/[0.06]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Site</span>
            </Link>
            <a
              href="https://manage.wix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#25C440]/10 hover:bg-[#25C440]/20 text-xs font-semibold text-[#25C440] transition-all border border-[#25C440]/30"
              title="Acessar painel completo oficial do Wix"
            >
              <span>Painel Wix</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4 Módulos Principais (Abas em estilo Dark Glassmorphism) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
              activeTab === "calendar"
                ? "bg-[#101D13] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.2)]"
                : "bg-[#0C130E]/80 border-white/[0.06] hover:bg-[#101A12] hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Calendar
                className={`w-5 h-5 ${
                  activeTab === "calendar" ? "text-[#25C440]" : "text-[#A6AEA8]"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeTab === "calendar" ? "text-[#25C440]" : "text-[#7B887E]"
                }`}
              >
                Módulo 1
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Calendário Geral</p>
              <p className="text-[11px] text-[#A6AEA8] truncate">Agendamentos de todos barbeiros</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
              activeTab === "sales"
                ? "bg-[#101D13] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.2)]"
                : "bg-[#0C130E]/80 border-white/[0.06] hover:bg-[#101A12] hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <DollarSign
                className={`w-5 h-5 ${
                  activeTab === "sales" ? "text-[#25C440]" : "text-[#A6AEA8]"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeTab === "sales" ? "text-[#25C440]" : "text-[#7B887E]"
                }`}
              >
                Módulo 2
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Vendas & Finanças</p>
              <p className="text-[11px] text-[#A6AEA8] truncate">Receitas e indicadores</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
              activeTab === "catalog"
                ? "bg-[#101D13] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.2)]"
                : "bg-[#0C130E]/80 border-white/[0.06] hover:bg-[#101A12] hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Layers
                className={`w-5 h-5 ${
                  activeTab === "catalog" ? "text-[#25C440]" : "text-[#A6AEA8]"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeTab === "catalog" ? "text-[#25C440]" : "text-[#7B887E]"
                }`}
              >
                Módulo 3
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Catálogo de Serviços</p>
              <p className="text-[11px] text-[#A6AEA8] truncate">Preços, durações e ofertas</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
              activeTab === "team"
                ? "bg-[#101D13] border-[#25C440] shadow-[0_0_20px_rgba(37,196,64,0.2)]"
                : "bg-[#0C130E]/80 border-white/[0.06] hover:bg-[#101A12] hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Users
                className={`w-5 h-5 ${
                  activeTab === "team" ? "text-[#25C440]" : "text-[#A6AEA8]"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeTab === "team" ? "text-[#25C440]" : "text-[#7B887E]"
                }`}
              >
                Módulo 4
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Equipe de Barbeiros</p>
              <p className="text-[11px] text-[#A6AEA8] truncate">Profissionais e recursos</p>
            </div>
          </button>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* CONTEÚDO DO MÓDULO 1: CALENDÁRIO GERAL */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A6AEA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, serviço, barbeiro ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#080B09] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#7B887E] focus:outline-none focus:border-[#25C440]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBarberFilter}
                  onChange={(e) => setSelectedBarberFilter(e.target.value)}
                  className="bg-[#080B09] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#E8EDE9] focus:outline-none focus:border-[#25C440] cursor-pointer"
                >
                  <option value="ALL">Todos os Barbeiros</option>
                  {barbersList.map((b) => (
                    <option key={b.id} value={b.resourceId}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-[#080B09] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#E8EDE9] focus:outline-none focus:border-[#25C440] cursor-pointer"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="CONFIRMED">Confirmados</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="CANCELED">Cancelados</option>
                </select>
              </div>
            </div>

            {/* Lista de Reservas Oficiais */}
            <div className="bg-[#0D1510] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Reservas do Wix Bookings</h3>
                  <p className="text-[11px] text-[#A6AEA8]">
                    Exibindo {filteredBookings.length} agendamentos registrados
                  </p>
                </div>
                {loadingData && (
                  <RefreshCw className="w-4 h-4 text-[#25C440] animate-spin" />
                )}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-[#A6AEA8] space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-white/20" />
                  <p className="text-xs">Nenhum agendamento encontrado para os filtros selecionados.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filteredBookings.map((b) => {
                    const dt = b.startDate ? new Date(b.startDate) : null;
                    const dateFormatted = dt
                      ? dt.toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })
                      : "Data a definir";
                    const timeFormatted = dt
                      ? dt.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--";

                    const isConfirmed = b.status === "CONFIRMED";
                    const isCanceled = b.status === "CANCELED";

                    return (
                      <div
                        key={b.id}
                        className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#111A13] border border-white/[0.08] flex flex-col items-center justify-center text-center shrink-0">
                            <span className="text-[10px] font-bold text-[#25C440] uppercase">
                              {timeFormatted}
                            </span>
                            <span className="text-[9px] text-[#A6AEA8]">{dateFormatted}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{b.customerName}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                  isConfirmed
                                    ? "bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30"
                                    : isCanceled
                                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#C8D5CA] mt-0.5">
                              {b.serviceName} •{" "}
                              <strong className="text-white">{b.barberName}</strong>
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-[#7B887E] mt-1">
                              {b.customerPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-[#25C440]" />
                                  {b.customerPhone}
                                </span>
                              )}
                              {b.price && (
                                <span className="text-[#25C440] font-semibold">
                                  R$ {b.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <a
                            href={`https://manage.wix.com/dashboard`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-medium text-[#C8D5CA] hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <span>Gerenciar no Wix</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTEÚDO DO MÓDULO 2: VENDAS & FINANÇAS */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            {salesData && (
              <>
                {/* Cards de Indicadores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 space-y-1">
                    <span className="text-[11px] text-[#A6AEA8] uppercase font-bold">
                      Previsão de Receita
                    </span>
                    <p className="text-2xl font-black text-[#25C440]">
                      R$ {salesData.indicators?.totalEstimatedRevenue?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-[10px] text-[#7B887E]">
                      Soma dos agendamentos confirmados
                    </p>
                  </div>

                  <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 space-y-1">
                    <span className="text-[11px] text-[#A6AEA8] uppercase font-bold">
                      Recebimentos Registrados
                    </span>
                    <p className="text-2xl font-black text-white">
                      R$ {salesData.indicators?.totalPaidRevenue?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-[10px] text-[#7B887E]">
                      Pagamentos com status PAID/COMPLETED
                    </p>
                  </div>

                  <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 space-y-1">
                    <span className="text-[11px] text-[#A6AEA8] uppercase font-bold">
                      Total Confirmados
                    </span>
                    <p className="text-2xl font-black text-white">
                      {salesData.indicators?.totalConfirmedCount || 0}
                    </p>
                    <p className="text-[10px] text-[#7B887E]">
                      Taxa de presença/conversão: {salesData.indicators?.conversionRate || 100}%
                    </p>
                  </div>

                  <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 space-y-1">
                    <span className="text-[11px] text-[#A6AEA8] uppercase font-bold">
                      Cancelamentos
                    </span>
                    <p className="text-2xl font-black text-red-400">
                      {salesData.indicators?.totalCanceledCount || 0}
                    </p>
                    <p className="text-[10px] text-[#7B887E]">Reservas canceladas no período</p>
                  </div>
                </div>

                {/* Tabela de Vendas Recentes */}
                <div className="bg-[#0D1510] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-5 py-4 border-b border-white/[0.08]">
                    <h3 className="text-sm font-bold text-white">Últimas Transações e Reservas</h3>
                    <p className="text-[11px] text-[#A6AEA8]">{salesData.note}</p>
                  </div>

                  <div className="divide-y divide-white/[0.06]">
                    {salesData.recentSales?.map((sale: any) => (
                      <div
                        key={sale.id}
                        className="p-4 hover:bg-white/[0.02] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{sale.serviceName}</p>
                          <p className="text-[11px] text-[#A6AEA8]">{sale.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#25C440]">R$ {sale.amount?.toFixed(2)}</p>
                          <span className="text-[10px] text-[#7B887E] uppercase">
                            {sale.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CONTEÚDO DO MÓDULO 3: CATÁLOGO DE SERVIÇOS */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Catálogo Oficial de Serviços</h3>
                <p className="text-[11px] text-[#A6AEA8]">
                  Serviços registrados na plataforma Wix Bookings ({catalogServices.length} ativos)
                </p>
              </div>
              <a
                href="https://manage.wix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25C440]/10 hover:bg-[#25C440]/20 text-xs font-semibold text-[#25C440] border border-[#25C440]/30 transition-all"
              >
                <span>Editar no Wix</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {catalogServices.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-[#0D1510] border border-white/[0.08] hover:border-[#25C440]/30 rounded-2xl p-4 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                    <span className="text-xs font-black text-[#25C440] whitespace-nowrap">
                      {srv.price}
                    </span>
                  </div>
                  {srv.description && (
                    <p className="text-xs text-[#A6AEA8] line-clamp-2">{srv.description}</p>
                  )}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#7B887E]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#25C440]" />
                      {srv.duration}
                    </span>
                    <span className="truncate max-w-[150px]">
                      {srv.assignedBarbers?.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO DO MÓDULO 4: EQUIPE */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <div className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Equipe de Barbeiros Profissionais</h3>
                <p className="text-[11px] text-[#A6AEA8]">
                  Recursos humanos e calendários cadastrados no Wix ({teamMembers.length} barbeiros)
                </p>
              </div>
              <a
                href="https://manage.wix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25C440]/10 hover:bg-[#25C440]/20 text-xs font-semibold text-[#25C440] border border-[#25C440]/30 transition-all"
              >
                <span>Horários no Wix</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#0D1510] border border-white/[0.08] rounded-2xl p-5 flex items-start gap-4"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#25C440]/40 shrink-0">
                    <Image
                      src={b.photo}
                      alt={b.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white truncate">{b.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
                        {b.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#A6AEA8]">
                      Resource ID: <code className="text-[10px] text-[#7B887E]">{b.resourceId}</code>
                    </p>
                    <p className="text-xs text-[#C8D5CA]">
                      {b.servicesCount} serviços atribuídos no catálogo
                    </p>
                    {b.tagline && (
                      <p className="text-xs text-[#A6AEA8] italic pt-1 line-clamp-2">
                        "{b.tagline}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

