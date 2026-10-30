"use client";

import React, { useReducer, useCallback, useRef, useEffect, useState } from "react";
import { chatbotReducer, createInitialSession, formatDate, formatPrice, parseTotalPrice, parseTotalDuration } from "@/lib/chatbotEngine";
import { ChatbotSession, ChatbotAction, ChatMessage, BarberCardData, ServiceCardData, TimeSlotData, MemberBookingItem, ChatButton, RepeatCardData } from "@/types/chatbot";
import { BARBERS } from "@/data/barbers";
import { useAuth } from "@/context/AuthContext";
import { X, MessageCircle, ChevronDown, RotateCcw, Send, Check, CheckCircle2, XCircle, Clock, Clock3, Calendar, Scissors, User, Phone, Mail, AlertCircle, ExternalLink, ChevronRight, Layers, MapPin, Sparkles, RefreshCw } from "lucide-react";
import Image from "next/image";

// ─── Constantes ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "5585992227064";
const WHATSAPP_TEXT = encodeURIComponent("Olá! Vim pelo site da Léo Nunes Barbearia e gostaria de informações.");

// ─── Utilitários ───────────────────────────────────────────────────────────────
function formatDateBR(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const dt = new Date(y, m - 1, d);
  return `${days[dt.getDay()]}, ${d} de ${months[m - 1]}`;
}

function getFortalezaDate(offsetDays = 0): string {
  const now = new Date();
  const tzDateStr = now.toLocaleString("en-US", { timeZone: "America/Fortaleza" });
  const tzDate = new Date(tzDateStr);
  tzDate.setDate(tzDate.getDate() + offsetDays);
  const year = tzDate.getFullYear();
  const month = String(tzDate.getMonth() + 1).padStart(2, "0");
  const day = String(tzDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSundayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getDay() === 0;
}

function getStatusLabel(status: string) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { label: string; color: string }> = {
    CONFIRMED: { label: "Confirmado", color: "#25C440" },
    PENDING: { label: "Pendente", color: "#F59E0B" },
    PENDING_APPROVAL: { label: "Aguardando", color: "#F59E0B" },
    CANCELED: { label: "Cancelado", color: "#EF4444" },
    CANCELED_BY_ADMIN: { label: "Cancelado", color: "#EF4444" },
    CANCELED_BY_CUSTOMER: { label: "Cancelado", color: "#EF4444" },
    DECLINED: { label: "Recusado", color: "#EF4444" },
  };
  return map[s] || { label: status || "Confirmado", color: "#25C440" };
}

// Agrupamento seguro de múltiplos serviços sob o identificador oficial do Wix
function groupMultiServiceBookings(bookings: MemberBookingItem[]): MemberBookingItem[] {
  const groupsMap = new Map<string, MemberBookingItem[]>();
  const standalone: MemberBookingItem[] = [];

  for (const b of bookings) {
    if (b.multiServiceBookingId) {
      const list = groupsMap.get(b.multiServiceBookingId) || [];
      list.push(b);
      groupsMap.set(b.multiServiceBookingId, list);
    } else {
      standalone.push(b);
    }
  }

  const grouped: MemberBookingItem[] = [];

  for (const [, items] of groupsMap.entries()) {
    if (items.length === 1) {
      grouped.push(items[0]);
      continue;
    }

    items.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
    const primary = items[0];
    const serviceNames = items.map((i) => i.serviceName).filter(Boolean);
    const totalDuration = items.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    grouped.push({
      ...primary,
      serviceName: serviceNames.join(" + "),
      groupedServices: serviceNames,
      durationMinutes: totalDuration > 0 ? totalDuration : primary.durationMinutes,
      canCancel: items.every((i) => i.canCancel !== false),
      canReschedule: items.every((i) => i.canReschedule !== false),
    });
  }

  const combined = [...grouped, ...standalone];
  // Ordenar por data e horário crescente (mais próximo primeiro)
  combined.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
  return combined;
}

// ─── Sub-componentes ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-none bg-[#111712] border border-[#1E2720] w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#25C440] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#25C440] to-[#1A942E] flex items-center justify-center shrink-0 shadow-md shadow-[#25C440]/20">
      <Scissors className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage; onAction?: (action: ChatbotAction) => void }) {
  const isBot = message.role === "bot";
  const text = message.text;

  if (!text) return null;

  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && <BotAvatar />}
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isBot
            ? "bg-[#111712] border border-[#1E2720] text-[#E8EDE9] rounded-bl-none"
            : "bg-[#25C440] text-[#080B09] font-medium rounded-br-none"
        }`}
        dangerouslySetInnerHTML={{
          __html: (text || "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>"),
        }}
      />
    </div>
  );
}

function ActionButtons({ buttons, onAction }: { buttons: ChatButton[]; onAction: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 pl-0 sm:pl-8">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onAction(btn.id)}
          disabled={btn.disabled}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 text-left border ${
            btn.variant === "primary"
              ? "bg-[#25C440] text-[#080B09] border-[#25C440] hover:bg-[#2CD64A] active:scale-[0.98]"
              : btn.variant === "danger"
              ? "bg-transparent text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/10"
              : btn.variant === "ghost"
              ? "bg-transparent text-[#9BA59E] border-[#1E2720] hover:text-[#E8EDE9] hover:border-[#27342A]"
              : "bg-[#111712] text-[#E8EDE9] border-[#1E2720] hover:bg-[#172019] hover:border-[#25C440]/30"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// Cards de Barbeiros
function BarberCards({
  dispatch,
  onSelect,
}: {
  dispatch: React.Dispatch<ChatbotAction>;
  onSelect?: (barber: BarberCardData) => void;
}) {
  const barbers: BarberCardData[] = BARBERS.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    role: b.role,
    photo: b.photo,
    tagline: b.tagline,
    servicesCount: b.services.length,
  }));

  return (
    <div className="pl-0 sm:pl-8 grid grid-cols-2 gap-2">
      {barbers.map((barber) => (
        <button
          key={barber.id}
          onClick={() => {
            if (onSelect) {
              onSelect(barber);
            } else {
              dispatch({
                type: "SELECT_BARBER",
                barberId: barber.id,
                barberSlug: barber.slug,
                barberName: barber.name,
                barberPhoto: barber.photo,
              });
            }
          }}
          className="bg-[#111712] border border-[#1E2720] hover:border-[#25C440]/40 hover:bg-[#172019] rounded-2xl p-3 text-left transition-all duration-150 active:scale-[0.97] group cursor-pointer"
        >
          <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#0D1410]">
            <Image
              src={barber.photo}
              alt={barber.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="160px"
            />
          </div>
          <p className="text-xs font-bold text-[#E8EDE9] truncate">{barber.name}</p>
          <p className="text-[10px] text-[#25C440] font-medium">{barber.role}</p>
          <p className="text-[10px] text-[#9BA59E] mt-0.5">{barber.servicesCount} serviços</p>
        </button>
      ))}
    </div>
  );
}

// Cards de Serviços
function ServiceCards({
  session,
  dispatch,
  onProceed,
}: {
  session: ChatbotSession;
  dispatch: React.Dispatch<ChatbotAction>;
  onProceed: () => void;
}) {
  const barber = BARBERS.find((b) => b.id === session.selectedBarberId);
  const services = barber?.services || [];
  const selectedIds = session.selectedServiceIds || [];
  const totalPrice = parseTotalPrice(session);
  const totalDuration = parseTotalDuration(session);

  return (
    <div className="pl-0 sm:pl-8 flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2">
        {services.map((svc) => {
          const isSelected = selectedIds.includes(svc.id);
          return (
            <button
              key={svc.id}
              onClick={() =>
                dispatch({
                  type: "TOGGLE_SERVICE",
                  serviceId: svc.id,
                  wixServiceId: svc.wixServiceId,
                  name: svc.name,
                  price: svc.price,
                  duration: svc.durationMinutes,
                  formattedPrice: svc.formattedPrice,
                })
              }
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? "bg-[#172019] border-[#25C440]/60 shadow-sm shadow-[#25C440]/10"
                  : "bg-[#0D1410] border-[#1E2720] hover:border-[#25C440]/20 hover:bg-[#111712]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-[#25C440] border-[#25C440]" : "border-[#2A3830]"
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 text-[#080B09] stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isSelected ? "text-[#E8EDE9]" : "text-[#C8D5CA]"}`}>
                  {svc.name}
                </p>
                <p className="text-[10px] text-[#9BA59E]">{svc.durationMinutes} min</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${isSelected ? "text-[#25C440]" : "text-[#9BA59E]"}`}>
                {svc.formattedPrice}
              </span>
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-1 p-3 bg-[#0B1410] border border-[#1E2720] rounded-xl">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#9BA59E]">{selectedIds.length} serviço(s) selecionado(s)</span>
            <span className="text-[#9BA59E]">{totalDuration} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#E8EDE9]">Total</span>
            <span className="text-sm font-bold text-[#25C440]">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <button
          onClick={onProceed}
          className="w-full py-3 rounded-xl bg-[#25C440] text-[#080B09] font-bold text-sm hover:bg-[#2CD64A] active:scale-[0.98] transition-all"
        >
          ✂️ Escolher Data →
        </button>
      )}
    </div>
  );
}

// Date Picker
function DatePicker({ onSelect }: { onSelect: (date: string) => void }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string>("");

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const days = getDaysInMonth(viewMonth.year, viewMonth.month);
  const firstDay = getFirstDayOfMonth(viewMonth.year, viewMonth.month);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

  const isPast = (day: number) => {
    const d = new Date(viewMonth.year, viewMonth.month, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  const isSunday = (day: number) => {
    const d = new Date(viewMonth.year, viewMonth.month, day);
    return d.getDay() === 0;
  };

  const dateStr = (day: number) =>
    `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => {
    setViewMonth((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewMonth((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
  };

  const isBeforeCurrentMonth = viewMonth.year < today.getFullYear() ||
    (viewMonth.year === today.getFullYear() && viewMonth.month <= today.getMonth());

  return (
    <div className="pl-0 sm:pl-8">
      <div className="bg-[#0D1410] border border-[#1E2720] rounded-2xl p-3">
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            disabled={isBeforeCurrentMonth}
            className="p-1.5 rounded-lg text-[#9BA59E] hover:text-[#E8EDE9] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <span className="text-xs font-bold text-[#E8EDE9]">
            {monthNames[viewMonth.month]} {viewMonth.year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-[#9BA59E] hover:text-[#E8EDE9]">
            ›
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d, i) => (
            <div key={i} className="text-center text-[9px] text-[#9BA59E] font-bold py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
            const ds = dateStr(day);
            const past = isPast(day);
            const sun = isSunday(day);
            const disabled = past || sun;
            const isSelected = selectedDate === ds;

            return (
              <button
                key={day}
                onClick={() => {
                  if (!disabled) {
                    setSelectedDate(ds);
                    onSelect(ds);
                  }
                }}
                disabled={disabled}
                className={`aspect-square rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? "bg-[#25C440] text-[#080B09] font-bold"
                    : disabled
                    ? "text-[#2A3830] cursor-not-allowed"
                    : "text-[#C8D5CA] hover:bg-[#172019] hover:text-[#E8EDE9]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-[#9BA59E] mt-2 text-center">Domingos não disponíveis</p>
      </div>
    </div>
  );
}

// Time Slots
function TimeSlots({
  slots,
  onSelect,
  isLoading,
  error,
}: {
  slots: TimeSlotData[];
  onSelect: (time: string, meta?: any) => void;
  isLoading: boolean;
  error?: string;
}) {
  if (isLoading) return <div className="pl-0 sm:pl-8"><TypingIndicator /></div>;
  if (error) {
    return (
      <div className="pl-0 sm:pl-8 p-3 bg-[#1A0D0D] border border-[#EF4444]/20 rounded-xl text-xs text-[#EF4444]">
        {error}
      </div>
    );
  }
  const available = slots.filter((s) => s.available);
  if (!available.length) {
    return (
      <div className="pl-0 sm:pl-8 p-3 bg-[#111712] border border-[#1E2720] rounded-xl text-xs text-[#9BA59E]">
        😕 Nenhum horário disponível nesta data. Tente outro dia!
      </div>
    );
  }

  return (
    <div className="pl-0 sm:pl-8">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {available.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onSelect(slot.time, slot.metadata)}
            className="py-2.5 px-2 bg-[#111712] border border-[#1E2720] hover:border-[#25C440]/50 hover:bg-[#172019] rounded-xl text-xs font-bold text-[#E8EDE9] transition-all active:scale-[0.97]"
          >
            ⏰ {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}

// Booking Summary Card
function BookingSummaryCard({ summary }: { summary: NonNullable<ChatMessage["bookingSummary"]> }) {
  const isMulti = summary.services.length > 1;

  return (
    <div className="pl-0 sm:pl-8">
      <div className="bg-[#0D1410] border border-[#25C440]/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-[#111E13] border-b border-[#1A2D1D] flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#25C440] font-bold">
            Resumo do Agendamento
          </p>
          {isMulti && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#25C440]/15 text-[#25C440] font-bold border border-[#25C440]/30 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> Pacote
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-3 items-center">
            {summary.barberPhoto && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#25C440]/40">
                <Image src={summary.barberPhoto} alt={summary.barberName} fill className="object-cover object-center" sizes="48px" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[#E8EDE9]">{summary.barberName}</p>
              <p className="text-[10px] text-[#25C440]">Profissional da barbearia</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {summary.services.map((svc, i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-[#111712] border border-[#1E2720] rounded-xl px-3 py-2">
                <span className="text-[#C8D5CA] font-medium truncate mr-2">{svc.name}</span>
                <span className="text-[#25C440] font-bold shrink-0">{svc.formattedPrice}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1E2720] grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#25C440]" />
              <span className="text-[11px] text-[#E8EDE9]">{formatDateBR(summary.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#25C440]" />
              <span className="text-[11px] text-[#E8EDE9]">{summary.time} (Fortaleza)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#25C440]" />
              <span className="text-[11px] text-[#E8EDE9] truncate">{summary.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#25C440]" />
              <span className="text-[11px] text-[#E8EDE9]">{summary.customerPhone}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E2720] flex items-center justify-between text-xs">
            <span className="text-[#9BA59E] text-[10px]">Forma de pagamento:</span>
            <span className="text-[#25C440] text-[11px] font-bold">Na barbearia ao finalizar</span>
          </div>

          <div className="pt-2 border-t border-[#1E2720] flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#9BA59E]">Duração estimada</p>
              <p className="text-xs font-bold text-[#E8EDE9]">{summary.totalDuration} minutos</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#9BA59E]">Total atualizado</p>
              <p className="text-lg font-black text-[#25C440]">{formatPrice(summary.totalPrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card de Repetição do Último Atendimento
function RepeatCard({
  data,
  onRepeat,
  onChangeBarber,
  onChangeServices,
}: {
  data: RepeatCardData;
  onRepeat: () => void;
  onChangeBarber: () => void;
  onChangeServices: () => void;
}) {
  return (
    <div className="pl-0 sm:pl-8">
      <div className="bg-[#0D1410] border border-[#25C440]/30 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-[#111E13] border-b border-[#1A2D1D] flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#25C440] font-bold">
            Atendimento Anterior Encontrado
          </p>
          {data.lastDate && (
            <span className="text-[10px] text-[#9BA59E]">{formatDateBR(data.lastDate)}</span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Barbeiro */}
          <div className="flex gap-3 items-center">
            {data.barberPhoto && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#25C440]/40">
                <Image src={data.barberPhoto} alt={data.barberName} fill className="object-cover object-center" sizes="48px" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[#E8EDE9]">{data.barberName}</p>
              <p className="text-[10px] text-[#25C440]">Profissional da barbearia</p>
            </div>
          </div>

          {/* Serviços */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BA59E]">Serviço(s) Realizado(s)</p>
            {data.services.map((svc, i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-[#111712] border border-[#1E2720] rounded-xl px-3 py-2">
                <div>
                  <span className="text-[#E8EDE9] font-medium">{svc.name}</span>
                  <span className="text-[10px] text-[#9BA59E] block">{svc.durationMinutes} min</span>
                </div>
                <span className="text-xs font-bold text-[#25C440]">{svc.formattedPrice}</span>
              </div>
            ))}
          </div>

          {/* Total & Duração */}
          <div className="pt-2 border-t border-[#1E2720] flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#9BA59E]">Duração Total Estimada</p>
              <p className="text-xs font-bold text-[#E8EDE9]">{data.totalDuration} min</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#9BA59E]">Valor Atualizado</p>
              <p className="text-base font-black text-[#25C440]">{data.formattedTotalPrice}</p>
            </div>
          </div>

          <div className="text-[9px] text-[#7B857E] bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
            ℹ️ Valores e disponibilidade verificados com base na tabela atual da barbearia.
          </div>
        </div>

        {/* Ações */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={onRepeat}
            className="w-full py-2.5 px-4 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            ✂️ Repetir Agendamento
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onChangeBarber}
              className="py-2 px-3 rounded-xl bg-[#111712] border border-[#1E2720] hover:border-[#25C440]/30 text-[#C8D5CA] hover:text-white text-[11px] font-semibold transition-all cursor-pointer text-center"
            >
              Outro Barbeiro
            </button>
            <button
              onClick={onChangeServices}
              className="py-2 px-3 rounded-xl bg-[#111712] border border-[#1E2720] hover:border-[#25C440]/30 text-[#C8D5CA] hover:text-white text-[11px] font-semibold transition-all cursor-pointer text-center"
            >
              Alterar Serviços
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Result
function BookingResultCard({ result }: { result: NonNullable<ChatMessage["bookingResult"]> }) {
  const success = result.success && result.status !== "ERROR";
  return (
    <div className="pl-0 sm:pl-8">
      <div className={`rounded-2xl border p-4 ${success ? "bg-[#0B1A0D] border-[#25C440]/40" : "bg-[#1A0D0D] border-[#EF4444]/30"}`}>
        <div className="flex items-start gap-3 mb-3">
          {success ? (
            <CheckCircle2 className="w-6 h-6 text-[#25C440] shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-xs font-bold mb-1 ${success ? "text-[#25C440]" : "text-[#EF4444]"}`}>
              {success ? "Agendamento Confirmado!" : "Erro no Agendamento"}
            </p>
            <p className="text-xs text-[#C8D5CA] leading-relaxed">{result.message}</p>
          </div>
        </div>
        {result.bookingId && (
          <div className="bg-[#0A0F0B] rounded-xl px-3 py-2 text-[10px] text-[#9BA59E]">
            ID: <span className="font-mono text-[#25C440]">{result.bookingId}</span>
          </div>
        )}
        {result.dryRun && (
          <div className="mt-2 text-[10px] text-[#F59E0B] bg-[#1A1100] border border-[#F59E0B]/20 rounded-lg px-3 py-2">
            ⚠️ Modo validação ativo. Defina ENABLE_REAL_WIX_BOOKINGS=true para confirmar reservas reais.
          </div>
        )}
        {(result.directWixUrl || result.checkoutUrl) && (
          <a
            href={result.checkoutUrl || result.directWixUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs text-[#25C440] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {result.checkoutUrl ? "Concluir no checkout oficial" : "Agendar no site oficial"}
          </a>
        )}
      </div>
    </div>
  );
}

// Bookings List (Exclusivamente Agendamentos Futuros Ordenados)
function BookingsListCard({
  bookings,
  onSelect,
}: {
  bookings: MemberBookingItem[];
  onSelect: (b: MemberBookingItem) => void;
}) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="pl-0 sm:pl-8 p-4 bg-[#111712] border border-[#1E2720] rounded-2xl text-xs text-[#9BA59E] text-center">
        📅 Nenhum agendamento futuro encontrado no momento.
      </div>
    );
  }

  return (
    <div className="pl-0 sm:pl-8 flex flex-col gap-2.5">
      {bookings.map((b) => {
        const status = getStatusLabel(b.status);
        const isGrouped = Boolean(b.multiServiceBookingId || (b.groupedServices && b.groupedServices.length > 1));

        return (
          <div
            key={b.id}
            className="bg-[#0E1510] border border-[#1E2720] hover:border-[#25C440]/40 rounded-2xl p-3.5 transition-all shadow-sm"
          >
            {/* Header: Status + Badge de pacote + Preço */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.05]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${status.color}15`,
                    color: status.color,
                    border: `1px solid ${status.color}35`,
                  }}
                >
                  {status.label}
                </span>

                {isGrouped && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#25C440]/15 text-[#25C440] border border-[#25C440]/30">
                    <Layers className="w-2.5 h-2.5" />
                    Pacote Agrupado
                  </span>
                )}
              </div>

              {b.formattedPrice && (
                <span className="text-[11px] font-bold text-white bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.08]">
                  {b.formattedPrice}
                </span>
              )}
            </div>

            {/* Informações Principais */}
            <div className="space-y-1.5">
              <div>
                <p className="text-xs font-bold text-white leading-snug">
                  {b.serviceName}
                </p>
                {b.groupedServices && b.groupedServices.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.groupedServices.map((svc, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#A6AEA8] border border-white/[0.06]"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-[#A6AEA8] pt-1">
                {b.barberName && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Scissors className="w-3 h-3 text-[#25C440] shrink-0" />
                    <span className="truncate">Barbeiro: <strong className="text-[#E8EDE9]">{b.barberName}</strong></span>
                  </div>
                )}
                {b.durationMinutes ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#25C440] shrink-0" />
                    <span>Duração: <strong className="text-[#E8EDE9]">{b.durationMinutes} min</strong></span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#25C440] shrink-0" />
                  <span className="capitalize">{b.formattedDate || (b.date ? formatDateBR(b.date) : "Data confirmada")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="w-3 h-3 text-[#25C440] shrink-0" />
                  <span>Horário: <strong className="text-[#25C440] font-bold">{b.formattedTime || b.time}</strong></span>
                </div>
              </div>
            </div>

            {/* Botão para visualizar detalhes */}
            <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-end">
              <button
                type="button"
                onClick={() => onSelect(b)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142618] hover:bg-[#1B3520] border border-[#25C440]/30 hover:border-[#25C440]/60 text-[#25C440] hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Visualizar Detalhes</span>
                <span className="text-[10px]">›</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Booking Detail
function BookingDetailCard({
  booking,
  onCancel,
  onReschedule,
  onBack,
}: {
  booking: MemberBookingItem;
  onCancel: () => void;
  onReschedule: () => void;
  onBack: () => void;
}) {
  const status = getStatusLabel(booking.status);
  const isCancelable = booking.canCancel && booking.status !== "CANCELED";
  const isReschedulable = booking.canReschedule && booking.status !== "CANCELED";
  const isGrouped = Boolean(booking.multiServiceBookingId || (booking.groupedServices && booking.groupedServices.length > 1));

  return (
    <div className="pl-0 sm:pl-8">
      <div className="bg-[#0D1410] border border-[#1E2720] rounded-2xl overflow-hidden shadow-md">
        <div className="px-4 py-3 border-b border-[#1A2D1D] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold">
              Detalhe do Agendamento
            </p>
            {isGrouped && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#25C440]/15 text-[#25C440] font-bold">
                Pacote
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-[#E8EDE9]">{booking.serviceName}</p>
            {booking.groupedServices && booking.groupedServices.length > 1 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {booking.groupedServices.map((svc, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-[#A6AEA8] border border-white/[0.08]">
                    {svc}
                  </span>
                ))}
              </div>
            )}
            {booking.barberName && <p className="text-[10px] text-[#9BA59E] mt-1">✂️ Barbeiro: <strong className="text-white">{booking.barberName}</strong></p>}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
              <span className="text-[#C8D5CA] capitalize">{booking.formattedDate || (booking.date ? formatDateBR(booking.date) : "Data confirmada")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
              <span className="text-[#25C440] font-bold">{booking.formattedTime || booking.time} (Fuso Fortaleza)</span>
            </div>
            {booking.durationMinutes ? (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
                <span className="text-[#C8D5CA]">{booking.durationMinutes} minutos</span>
              </div>
            ) : null}
            {booking.formattedPrice || booking.price ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[#9BA59E]">Valor:</span>
                <span className="text-[#25C440] font-bold">{booking.formattedPrice || booking.price}</span>
              </div>
            ) : null}
          </div>

          {booking.locationName && (
            <p className="text-[10px] text-[#7B857E] flex items-center gap-1.5 pt-1">
              <MapPin className="w-3 h-3 text-[#25C440] shrink-0" />
              <span>{booking.locationName}</span>
            </p>
          )}
        </div>

        <div className="px-4 pb-4 flex flex-col gap-2">
          {isReschedulable && (
            <button
              onClick={onReschedule}
              className="w-full py-2.5 rounded-xl bg-[#111712] border border-[#25C440]/30 text-[#25C440] text-xs font-bold hover:bg-[#172019] transition-all cursor-pointer"
            >
              📅 Reagendar Horário
            </button>
          )}
          {isCancelable && (
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-transparent border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold hover:bg-[#EF4444]/10 transition-all cursor-pointer"
            >
              ❌ Cancelar Agendamento
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full py-2 rounded-xl text-[#9BA59E] text-xs hover:text-[#E8EDE9] transition-all cursor-pointer text-center"
          >
            ← Voltar à lista de agendamentos
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal do Widget ────────────────────────────────────────────

export function ChatbotWidget() {
  const { member } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, dispatch] = useReducer(chatbotReducer, member, createInitialSession);
  const [slots, setSlots] = useState<TimeSlotData[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [memberBookings, setMemberBookings] = useState<MemberBookingItem[]>([]);
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlotData[]>([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const prevMemberRef = useRef(member);

  // Sincronização dinâmica de autenticação (login / logout)
  useEffect(() => {
    if (prevMemberRef.current && !member) {
      // Logout: limpa dados cadastrais do estado e reseta para menu convencional
      dispatch({ type: "SYNC_MEMBER", member: null });
      dispatch({ type: "MAIN_MENU" });
    } else if (!prevMemberRef.current && member) {
      // Login: sincroniza sessão e dados
      dispatch({ type: "SYNC_MEMBER", member });
    }
    prevMemberRef.current = member;
  }, [member]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(session.messages.length);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll inteligente: alinha a partir do início da mensagem de atendimento do robô
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (session.messages.length <= 2) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      prevMessagesLengthRef.current = session.messages.length;
      return;
    }

    if (session.messages.length > prevMessagesLengthRef.current) {
      const prevCount = prevMessagesLengthRef.current;
      const newMessages = session.messages.slice(prevCount);
      // Encontra a primeira mensagem do bot na nova rodada (mensagem de atendimento)
      const firstNewBotMsg = newMessages.find((m) => m.role === "bot" && m.type !== "loading");

      const timer = setTimeout(() => {
        if (firstNewBotMsg) {
          const targetEl = document.getElementById(`chat-msg-${firstNewBotMsg.id}`);
          if (targetEl && container) {
            const targetTop = targetEl.offsetTop;
            container.scrollTo({
              top: Math.max(0, targetTop - 12),
              behavior: "smooth",
            });
            return;
          }
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 70);

      prevMessagesLengthRef.current = session.messages.length;
      return () => clearTimeout(timer);
    }

    prevMessagesLengthRef.current = session.messages.length;
  }, [session.messages]);

  // Marcar unread quando fechado
  useEffect(() => {
    if (!isOpen && session.messages.length > 2) {
      setHasUnread(true);
    }
  }, [session.messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Mostrar date picker ao entrar no step
  useEffect(() => {
    if (session.step === "BOOK_DATE") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  }, [session.step]);

  useEffect(() => {
    if (session.step === "RESCHEDULE_DATE") {
      setShowRescheduleDatePicker(true);
    } else {
      setShowRescheduleDatePicker(false);
    }
  }, [session.step]);

  // Buscar horários quando data for selecionada
  useEffect(() => {
    if (session.step === "BOOK_TIME" && session.selectedDate && session.selectedBarberSlug) {
      fetchSlots(session.selectedBarberSlug, session.selectedDate, session.selectedServiceWixIds);
    }
  }, [session.step, session.selectedDate]);

  // Buscar horários para reagendamento
  useEffect(() => {
    if (session.step === "RESCHEDULE_TIME" && session.rescheduleDate) {
      const booking = session.activeBookingDetail;
      if (booking) {
        fetchRescheduleSlots(booking);
      }
    }
  }, [session.step, session.rescheduleDate]);

  // Buscar agendamentos do membro
  useEffect(() => {
    if (session.step === "MY_BOOKINGS") {
      fetchMemberBookings();
    }
  }, [session.step]);

  const findAndShowNextSlots = async (barberSlug: string, serviceWixIds?: string[], barberName?: string) => {
    setSlotsLoading(true);
    setSlotsError("");
    setSlots([]);

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: `searching-slots-${Date.now()}`,
        role: "bot",
        type: "loading",
        timestamp: new Date(),
      },
    });

    const bName = barberName || BARBERS.find((b) => b.slug === barberSlug)?.name || "Barbeiro";
    const daysToScan = 7;
    let foundDate: string | null = null;
    let foundSlots: TimeSlotData[] = [];

    try {
      for (let i = 0; i < daysToScan; i++) {
        const candidateDate = getFortalezaDate(i);
        if (isSundayDate(candidateDate)) continue;

        const serviceParam = serviceWixIds && serviceWixIds.length > 1
          ? `serviceIds=${serviceWixIds.join(",")}`
          : serviceWixIds?.[0]
          ? `serviceId=${serviceWixIds[0]}`
          : "";

        try {
          const res = await fetch(`/api/bookings/slots?date=${candidateDate}&barberSlug=${barberSlug}${serviceParam ? `&${serviceParam}` : ""}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.slots)) {
            const available: TimeSlotData[] = data.slots
              .filter((s: any) => s.bookable !== false)
              .map((s: any) => ({
                time: s.startTime || s.time,
                available: true,
                metadata: s,
              }));

            if (available.length > 0) {
              foundDate = candidateDate;
              foundSlots = available;
              break;
            }
          }
        } catch {
          // ignora falha pontual do dia e continua a busca
        }
      }

      if (foundDate && foundSlots.length > 0) {
        setSlots(foundSlots);
        dispatch({ type: "SELECT_DATE", date: foundDate });
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `next-slots-found-${Date.now()}`,
            role: "bot",
            type: "text",
            text: `⚡ Encontrei os próximos horários disponíveis para **${bName}** em **${formatDateBR(foundDate)}**:\n\nEscolha o melhor horário:`,
            timestamp: new Date(),
          },
        });
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `choose-other-date-btn-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Prefere escolher outra data no calendário?",
            buttons: [
              { id: "SHOW_CUSTOM_DATE_PICKER", label: "📅 Escolher Outra Data", variant: "ghost" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
      } else {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `next-slots-empty-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: `Não encontrei horários disponíveis para **${bName}** nos próximos 7 dias.\n\nVocê pode consultar outra data no calendário:`,
            buttons: [
              { id: "SHOW_CUSTOM_DATE_PICKER", label: "📅 Abrir Calendário", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
      }
    } catch {
      setSlotsError("Erro de conexão ao buscar próximos horários.");
    } finally {
      setSlotsLoading(false);
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const fetchRepeatLastBooking = async () => {
    if (!member) {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `repeat-auth-${Date.now()}`,
          role: "bot",
          type: "buttons",
          text: "Para repetir seu último agendamento, você precisa entrar na sua conta.",
          buttons: [
            { id: "GOTO_LOGIN", label: "🔑 Entrar na Minha Conta", variant: "primary" },
            { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
          ],
          timestamp: new Date(),
        },
      });
      return;
    }

    dispatch({
      type: "ADD_MESSAGE",
      message: { id: `rep-load-${Date.now()}`, role: "bot", type: "loading", timestamp: new Date() },
    });

    try {
      const res = await fetch("/api/member/bookings");
      if (res.status === 401) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `repeat-auth-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Para repetir seu último agendamento, você precisa entrar na sua conta.",
            buttons: [
              { id: "GOTO_LOGIN", label: "🔑 Entrar na Minha Conta", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      if (!res.ok) {
        throw new Error("Erro na resposta");
      }

      const data = await res.json();
      const pastRaw: any[] = data.past || [];
      const nowMs = Date.now();

      // Filtra agendamentos passados não cancelados
      const pastValid = pastRaw.filter((b: any) => {
        const startMs = b.startDate ? new Date(b.startDate).getTime() : 0;
        const statusUpper = (b.status || "").toUpperCase();
        const isCanceled = ["CANCELED", "DECLINED", "CANCELED_BY_ADMIN", "CANCELED_BY_CUSTOMER"].includes(statusUpper);
        return startMs > 0 && startMs < nowMs && !isCanceled;
      });

      if (pastValid.length === 0) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `rep-empty-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Você ainda não possui atendimentos anteriores registrados. Vamos agendar seu primeiro horário?",
            buttons: [
              { id: "START_BOOKING", label: "✂️ Agendar Agora", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      // Ordena decrescente (mais recente primeiro)
      pastValid.sort((a: any, b: any) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
      const latest = pastValid[0];

      // Se fizer parte de um pacote multi-serviço, busca todos os itens desse pacote
      const multiId = latest.multiServiceBookingId ||
        latest.multiServiceBookingInfo?._id ||
        latest.multiServiceBookingInfo?.multiServiceBookingId ||
        latest.multiServiceBooking?.id;

      let targetBookings = [latest];
      if (multiId) {
        targetBookings = pastValid.filter((b: any) => {
          const itemMultiId = b.multiServiceBookingId ||
            b.multiServiceBookingInfo?._id ||
            b.multiServiceBookingInfo?.multiServiceBookingId ||
            b.multiServiceBooking?.id;
          return itemMultiId === multiId;
        });
      }

      // Identificar barbeiro
      const rawBarberName = latest.barberName || latest.bookedEntity?.slot?.resource?.name || "";
      const activeBarber = BARBERS.find((b) =>
        b.name.toLowerCase().trim() === rawBarberName.toLowerCase().trim() ||
        b.slug.toLowerCase() === rawBarberName.toLowerCase()
      );

      if (!activeBarber) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `rep-barber-inactive-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: `Encontrei seu último atendimento com **${rawBarberName || "Barbeiro"}**, mas este profissional não está disponível no momento.\n\nGostaria de escolher outro barbeiro para realizar o seu atendimento?`,
            buttons: [
              { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Escolher Outro Barbeiro", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      // Mapear serviços do atendimento anterior para o catálogo atual do barbeiro ativo
      const activeServices: typeof activeBarber.services = [];
      for (const b of targetBookings) {
        const sName = (b.serviceName || b.bookedEntity?.title || "").toLowerCase().trim();
        const sWixId = b.serviceId || b.bookedEntity?.slot?.serviceId;

        const foundService = activeBarber.services.find(
          (s) => (sWixId && s.wixServiceId === sWixId) || s.name.toLowerCase().trim() === sName
        );
        if (foundService && !activeServices.some((s) => s.id === foundService.id)) {
          activeServices.push(foundService);
        }
      }

      if (activeServices.length === 0) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `rep-svc-inactive-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: `Os serviços do seu último atendimento com **${activeBarber.name}** foram alterados ou atualizados em nosso catálogo.\n\nPor favor, escolha os serviços desejados na lista atualizada:`,
            buttons: [
              { id: "GOTO_STEP:BOOK_SERVICE", label: "✂️ Escolher Serviços", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      // Calcular valores e durações ATUALIZADOS
      const totalPrice = activeServices.reduce((sum, s) => sum + s.price, 0);
      const totalDuration = activeServices.reduce((sum, s) => sum + s.durationMinutes, 0);

      const repeatCard: RepeatCardData = {
        barberId: activeBarber.id,
        barberSlug: activeBarber.slug,
        barberName: activeBarber.name,
        barberPhoto: activeBarber.photo,
        services: activeServices.map((s) => ({
          id: s.id,
          wixServiceId: s.wixServiceId,
          name: s.name,
          price: s.price,
          formattedPrice: s.formattedPrice,
          durationMinutes: s.durationMinutes,
        })),
        totalPrice,
        formattedTotalPrice: formatPrice(totalPrice),
        totalDuration,
        isMultiService: activeServices.length > 1,
        lastDate: latest.startDate ? latest.startDate.split("T")[0] : undefined,
      };

      dispatch({
        type: "SHOW_REPEAT_CARD",
        data: repeatCard,
      });
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `rep-err-${Date.now()}`,
          role: "bot",
          type: "buttons",
          text: "Não foi possível carregar seu histórico de agendamentos no momento. Deseja iniciar um novo agendamento?",
          buttons: [
            { id: "START_BOOKING", label: "✂️ Iniciar Agendamento", variant: "primary" },
            { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
          ],
          timestamp: new Date(),
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const fetchSlots = async (barberSlug: string, date: string, serviceWixIds?: string[]) => {
    setSlotsLoading(true);
    setSlotsError("");
    setSlots([]);
    try {
      const serviceParam = serviceWixIds && serviceWixIds.length > 1
        ? `serviceIds=${serviceWixIds.join(",")}`
        : serviceWixIds?.[0]
        ? `serviceId=${serviceWixIds[0]}`
        : "";
      const res = await fetch(`/api/bookings/slots?date=${date}&barberSlug=${barberSlug}${serviceParam ? `&${serviceParam}` : ""}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && data.slots) {
        const available: TimeSlotData[] = data.slots
          .filter((s: any) => s.bookable !== false)
          .map((s: any) => ({
            time: s.startTime || s.time,
            available: true,
            metadata: s,
          }));
        setSlots(available);
        // Remove loading message e adiciona time slots
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `time-slots-${Date.now()}`,
            role: "bot",
            type: available.length > 0 ? "text" : "text",
            text: available.length > 0
              ? `✅ Encontrei **${available.length} horários disponíveis** para ${formatDateBR(date)}. Escolha o melhor para você:`
              : `😕 Não há horários disponíveis para ${formatDateBR(date)}. Tente outra data!`,
            timestamp: new Date(),
          },
        });
      } else {
        setSlotsError(data.error || "Não foi possível consultar os horários.");
      }
    } catch {
      setSlotsError("Erro de conexão ao consultar horários.");
    } finally {
      setSlotsLoading(false);
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const fetchRescheduleSlots = async (booking: MemberBookingItem) => {
    setRescheduleSlotsLoading(true);
    setRescheduleSlots([]);
    try {
      const res = await fetch(
        `/api/bookings/slots?date=${session.rescheduleDate}&barberSlug=${getBarberSlugFromName(booking.barberName || "")}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      const data = await res.json();
      if (data.success && data.slots) {
        const available: TimeSlotData[] = data.slots
          .filter((s: any) => s.bookable !== false)
          .map((s: any) => ({ time: s.startTime || s.time, available: true, metadata: s }));
        setRescheduleSlots(available);
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `reschd-slots-${Date.now()}`,
            role: "bot",
            type: "text",
            text: available.length > 0
              ? `✅ ${available.length} horários disponíveis. Escolha:`
              : "😕 Nenhum horário disponível nesta data.",
            timestamp: new Date(),
          },
        });
      }
    } catch {
      // ignora silenciosamente
    } finally {
      setRescheduleSlotsLoading(false);
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const fetchMemberBookings = async () => {
    try {
      const res = await fetch("/api/member/bookings");

      // 1. Cliente não autenticado
      if (res.status === 401) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `mb-auth-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Para consultar seus agendamentos, você precisa entrar na sua conta.",
            buttons: [
              { id: "GOTO_LOGIN", label: "🔑 Entrar na Minha Conta", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        dispatch({ type: "SET_LOADING", loading: false });
        return;
      }

      // 2. Falha de comunicação ou resposta de erro do servidor
      if (!res.ok) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `mb-err-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Não foi possível carregar seus agendamentos no momento. Por favor, tente novamente.",
            buttons: [
              { id: "SHOW_MY_BOOKINGS", label: "🔄 Tentar Novamente", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        dispatch({ type: "SET_LOADING", loading: false });
        return;
      }

      const data = await res.json();
      if (!data.success && !Array.isArray(data.upcoming)) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `mb-err-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Não foi possível carregar seus agendamentos no momento. Por favor, tente novamente.",
            buttons: [
              { id: "SHOW_MY_BOOKINGS", label: "🔄 Tentar Novamente", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        dispatch({ type: "SET_LOADING", loading: false });
        return;
      }

      // 3. Regras estritas de filtragem:
      // - Somente agendamentos futuros (início estritamente posterior ao horário atual: data e hora completas)
      // - Excluir realizados
      // - Excluir cancelados e recusados
      // - Excluir horário já passado hoje
      // - Preservar agendamentos futuros confirmados e solicitações pendentes futuras
      const nowMs = Date.now();
      const rawUpcoming: MemberBookingItem[] = (data.upcoming || []).map((b: any) => ({
        id: b.id || b._id,
        serviceId: b.serviceId || b.bookedEntity?.slot?.serviceId,
        serviceName: b.serviceName || b.bookedEntity?.title || "Atendimento na Barbearia",
        barberName: b.barberName || b.bookedEntity?.slot?.resource?.name || "Profissional da Barbearia",
        barberResourceId: b.barberResourceId || b.bookedEntity?.slot?.resource?._id,
        startDate: b.startDate,
        endDate: b.endDate || b.startDate,
        localDate: b.localDate || (b.startDate ? b.startDate.split("T")[0] : ""),
        localTime: b.localTime || b.formattedTime || (b.startDate ? new Date(b.startDate).toLocaleTimeString("pt-BR", { timeZone: "America/Fortaleza", hour: "2-digit", minute: "2-digit" }) : ""),
        formattedDate: b.formattedDate || (b.startDate ? formatDateBR(b.startDate.split("T")[0]) : ""),
        formattedTime: b.formattedTime || b.localTime || (b.startDate ? new Date(b.startDate).toLocaleTimeString("pt-BR", { timeZone: "America/Fortaleza", hour: "2-digit", minute: "2-digit" }) : ""),
        durationMinutes: b.durationMinutes || 40,
        formattedPrice: b.formattedPrice || (b.price ? (typeof b.price === "string" ? b.price : `R$ ${b.price}`) : undefined),
        status: b.status || "CONFIRMED",
        paymentStatus: b.paymentStatus,
        isUpcoming: true,
        locationName: b.locationName || "Rua Joaquim Nogueira Lopes, 180, Pacajus - CE",
        multiServiceBookingId:
          b.multiServiceBookingId ||
          b.multiServiceBookingInfo?._id ||
          b.multiServiceBookingInfo?.multiServiceBookingId ||
          b.multiServiceBooking?.id,
        canCancel: b.canCancel !== false && b.allowedActions?.cancel !== false,
        canReschedule: b.canReschedule !== false && b.allowedActions?.reschedule !== false,
      }));

      const futureList = rawUpcoming.filter((b) => {
        const startMs = b.startDate ? new Date(b.startDate).getTime() : 0;
        const statusUpper = (b.status || "").toUpperCase();
        const isCanceled = ["CANCELED", "DECLINED", "CANCELED_BY_ADMIN", "CANCELED_BY_CUSTOMER"].includes(statusUpper);
        return startMs > 0 && startMs > nowMs && !isCanceled;
      });

      // 4. Agrupamento seguro para agendamentos com múltiplos serviços (pacotes do Wix)
      const groupedList = groupMultiServiceBookings(futureList);

      // Ordenar por data e horário crescente (mais próximo primeiro)
      groupedList.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());

      setMemberBookings(groupedList);
      dispatch({ type: "SET_LOADING", loading: false });

      // 5. Quando não houver agendamentos futuros
      if (groupedList.length === 0) {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `mb-empty-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Você não possui agendamentos futuros no momento. ✂️\n\nQue tal reservar seu próximo horário?",
            buttons: [
              { id: "START_BOOKING", label: "✂️ Agendar Horário", variant: "primary" },
              { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      // 6. Exibição dos cards compactos dos agendamentos futuros
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `mb-list-${Date.now()}`,
          role: "bot",
          type: "bookings_list",
          text: `📋 Encontrei **${groupedList.length} agendamento(s) futuro(s)** na sua conta:`,
          bookingsList: groupedList,
          timestamp: new Date(),
        },
      });
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `mb-err-${Date.now()}`,
          role: "bot",
          type: "buttons",
          text: "Não foi possível consultar seus agendamentos no momento. Por favor, tente novamente.",
          buttons: [
            { id: "SHOW_MY_BOOKINGS", label: "🔄 Tentar Novamente", variant: "primary" },
            { id: "MAIN_MENU", label: "← Voltar ao Menu", variant: "ghost" },
          ],
          timestamp: new Date(),
        },
      });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const executeBooking = async () => {
    const body = {
      barberId: session.selectedBarberId,
      barberSlug: session.selectedBarberSlug,
      serviceId: session.selectedServiceWixIds?.[0] || session.selectedServiceIds?.[0],
      services: (session.selectedServiceIds || []).map((id, i) => ({
        id,
        wixServiceId: session.selectedServiceWixIds?.[i],
        name: session.selectedServiceNames?.[i] || "",
        price: session.selectedServicePrices?.[i] || 0,
        durationMinutes: session.selectedServiceDurations?.[i] || 0,
        formattedPrice: `R$ ${((session.selectedServicePrices?.[i] || 0)).toFixed(2).replace(".", ",")}`,
      })),
      date: session.selectedDate,
      time: session.selectedTime,
      slotMetadata: session.selectedSlotMetadata,
      customer: {
        name: session.customerName,
        phone: session.customerPhone,
        email: session.customerEmail || "",
        notes: "",
      },
    };

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `booking-result-${Date.now()}`,
          role: "bot",
          type: "booking_result",
          bookingResult: {
            success: data.success,
            bookingId: data.bookingId,
            status: data.status,
            message: data.message,
            directWixUrl: data.directWixUrl,
            checkoutUrl: data.checkoutUrl,
            dryRun: data.dryRun,
          },
          timestamp: new Date(),
        },
      });

      if (data.success) {
        setTimeout(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `post-booking-${Date.now()}`,
              role: "bot",
              type: "buttons",
              text: "O que mais posso fazer por você?",
              buttons: [
                { id: "SHOW_MY_BOOKINGS", label: "📅 Ver meus agendamentos", variant: "secondary" },
                { id: "GOTO_WHATSAPP", label: "💬 Falar no WhatsApp", variant: "ghost" },
                { id: "MAIN_MENU", label: "🏠 Menu principal", variant: "ghost" },
              ],
              timestamp: new Date(),
            },
          });
        }, 1000);
      } else {
        setTimeout(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `post-err-${Date.now()}`,
              role: "bot",
              type: "buttons",
              text: "O que deseja fazer?",
              buttons: [
                { id: "GOTO_STEP:BOOK_DATE", label: "📅 Tentar outra data", variant: "primary" },
                { id: "MAIN_MENU", label: "🏠 Menu principal", variant: "ghost" },
              ],
              timestamp: new Date(),
            },
          });
        }, 1000);
      }
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `booking-fail-${Date.now()}`,
          role: "bot",
          type: "booking_result",
          bookingResult: {
            success: false,
            message: "Erro de conexão ao criar a reserva. Verifique sua internet e tente novamente.",
          },
          timestamp: new Date(),
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const executeCancel = async () => {
    const bookingId = session.activeBookingId;
    if (!bookingId) return;
    try {
      const res = await fetch(`/api/member/bookings/${bookingId}/cancel`, { method: "POST" });
      const data = await res.json();
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `cancel-result-${Date.now()}`,
          role: "bot",
          type: "text",
          text: data.success
            ? "✅ Agendamento cancelado com sucesso no Wix Bookings!"
            : `❌ ${data.error || "Não foi possível cancelar."}`,
          timestamp: new Date(),
        },
      });
      if (data.success) {
        setTimeout(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `post-cancel-${Date.now()}`,
              role: "bot",
              type: "buttons",
              text: "O que mais posso fazer por você?",
              buttons: [
                { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Novo Agendamento", variant: "primary" },
                { id: "MAIN_MENU", label: "🏠 Menu principal", variant: "ghost" },
              ],
              timestamp: new Date(),
            },
          });
        }, 1000);
      }
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `cancel-err-${Date.now()}`,
          role: "bot",
          type: "text",
          text: "❌ Erro de conexão ao cancelar. Tente novamente.",
          timestamp: new Date(),
        },
      });
    }
  };

  const executeReschedule = async () => {
    const bookingId = session.activeBookingId;
    if (!bookingId) return;
    try {
      const res = await fetch(`/api/member/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: session.rescheduleDate,
          newTime: session.rescheduleTime,
          slotMetadata: session.selectedSlotMetadata,
        }),
      });
      const data = await res.json();
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `reschedule-result-${Date.now()}`,
          role: "bot",
          type: "text",
          text: data.success
            ? `✅ Reagendamento confirmado! Nova data: ${formatDateBR(session.rescheduleDate || "")} às ${session.rescheduleTime}.`
            : `❌ ${data.error || "Não foi possível reagendar."}`,
          timestamp: new Date(),
        },
      });
      if (data.success) {
        setTimeout(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `post-reschd-${Date.now()}`,
              role: "bot",
              type: "buttons",
              text: "Seu agendamento foi reagendado com sucesso!",
              buttons: [
                { id: "SHOW_MY_BOOKINGS", label: "📅 Ver meus agendamentos", variant: "secondary" },
                { id: "MAIN_MENU", label: "🏠 Menu principal", variant: "ghost" },
              ],
              timestamp: new Date(),
            },
          });
        }, 1000);
      }
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `reschd-err-${Date.now()}`,
          role: "bot",
          type: "text",
          text: "❌ Erro de conexão ao reagendar. Tente novamente.",
          timestamp: new Date(),
        },
      });
    }
  };

  // Handler principal de ações dos botões
  const handleButtonAction = useCallback(
    async (actionId: string) => {
      // Ações especiais
      if (actionId === "WHATSAPP_OPEN") {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`, "_blank");
        return;
      }
      if (actionId === "GOTO_LOGIN") {
        window.location.href = "/login?redirect=/minha-conta/agendamentos";
        return;
      }
      if (actionId === "START_BOOKING" || actionId === "BOOK_AGAIN") {
        dispatch({ type: "GOTO_STEP", step: "BOOK_BARBER" });
        return;
      }
      if (actionId === "REPEAT_LAST_BOOKING") {
        await fetchRepeatLastBooking();
        return;
      }
      if (actionId === "FIND_NEXT_SLOT") {
        dispatch({ type: "FIND_NEXT_SLOT" });
        return;
      }
      if (actionId === "EDIT_CUSTOMER_DATA") {
        dispatch({ type: "EDIT_CUSTOMER_DATA" });
        return;
      }
      if (actionId === "CONFIRM_REPEAT_SLOTS") {
        const repeatData = session.repeatCardData;
        if (!repeatData) return;
        dispatch({
          type: "SELECT_BARBER",
          barberId: repeatData.barberId,
          barberSlug: repeatData.barberSlug,
          barberName: repeatData.barberName,
          barberPhoto: repeatData.barberPhoto || "",
        });
        for (const svc of repeatData.services) {
          dispatch({
            type: "TOGGLE_SERVICE",
            serviceId: svc.id,
            wixServiceId: svc.wixServiceId,
            name: svc.name,
            price: svc.price,
            duration: svc.durationMinutes,
            formattedPrice: svc.formattedPrice,
          });
        }
        await findAndShowNextSlots(
          repeatData.barberSlug,
          repeatData.services.map((s) => s.wixServiceId).filter(Boolean) as string[],
          repeatData.barberName
        );
        return;
      }
      if (actionId === "CHANGE_REPEAT_BARBER") {
        dispatch({ type: "GOTO_STEP", step: "BOOK_BARBER" });
        return;
      }
      if (actionId === "CHANGE_REPEAT_SERVICES") {
        const repeatData = session.repeatCardData;
        if (repeatData) {
          dispatch({
            type: "SELECT_BARBER",
            barberId: repeatData.barberId,
            barberSlug: repeatData.barberSlug,
            barberName: repeatData.barberName,
            barberPhoto: repeatData.barberPhoto || "",
          });
        }
        dispatch({ type: "GOTO_STEP", step: "BOOK_SERVICE" });
        return;
      }
      if (actionId === "SHOW_CUSTOM_DATE_PICKER") {
        setShowDatePicker(true);
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `date-picker-${Date.now()}`,
            role: "bot",
            type: "text",
            text: "📅 Escolha uma data no calendário:",
            timestamp: new Date(),
          },
        });
        dispatch({ type: "GOTO_STEP", step: "BOOK_DATE" });
        return;
      }
      if (actionId === "CONFIRM_MULTI_PACKAGE") {
        const text = encodeURIComponent(
          `Olá! Gostaria de confirmar meu agendamento na Léo Nunes Barbearia:\n\n` +
          `✂️ Barbeiro: ${session.selectedBarberName}\n` +
          `📋 Serviços: ${(session.selectedServiceNames || []).join(" + ")}\n` +
          `📅 Data: ${formatDateBR(session.selectedDate || "")}\n` +
          `⏰ Horário: ${session.selectedTime} (Fortaleza)\n` +
          `👤 Nome: ${session.customerName}\n` +
          `📱 Telefone: ${session.customerPhone}\n` +
          `💰 Total: ${formatPrice(parseTotalPrice(session))}\n` +
          `💳 Forma de Pagamento: Na barbearia ao finalizar\n\n` +
          `Por favor, confirmem o encaixe para mim!`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
        return;
      }
      if (actionId === "DO_CANCEL") {
        dispatch({ type: "ADD_MESSAGE", message: { id: `user-cancel-${Date.now()}`, role: "user", type: "text", text: "❌ Confirmar cancelamento", timestamp: new Date() } });
        dispatch({ type: "ADD_MESSAGE", message: { id: `loading-cancel-${Date.now()}`, role: "bot", type: "loading", timestamp: new Date() } });
        await executeCancel();
        return;
      }
      if (actionId === "CONFIRM_RESCHEDULE") {
        dispatch({ type: "CONFIRM_RESCHEDULE" });
        await executeReschedule();
        return;
      }
      if (actionId === "BOOKING_DETAIL_BACK" || actionId === "SHOW_MY_BOOKINGS") {
        dispatch({ type: "SHOW_MY_BOOKINGS" });
        return;
      }
      if (actionId === "RESCHEDULE_DATE_BACK") {
        setShowRescheduleDatePicker(true);
        dispatch({ type: "GOTO_STEP", step: "RESCHEDULE_DATE" });
        return;
      }
      if (actionId === "SKIP_EMAIL") {
        dispatch({ type: "SET_CUSTOMER_EMAIL", email: "" });
        return;
      }
      if (actionId === "CONFIRM_BOOKING") {
        dispatch({ type: "CONFIRM_BOOKING" });
        await executeBooking();
        return;
      }

      // Ações de serviços por categoria
      if (actionId.startsWith("SERVICES:")) {
        const category = actionId.split(":")[1];
        const barbers = BARBERS;
        const allServices = barbers.flatMap((b) =>
          b.services
            .filter((s) => s.category === category)
            .map((s) => ({ ...s, barberName: b.name }))
        );

        const uniqueServices = Array.from(
          new Map(allServices.map((s) => [s.name, s])).values()
        );

        const catNames: Record<string, string> = {
          cabelo: "Cortes de Cabelo",
          barba: "Barba",
          combo: "Combos Especiais",
          tratamento: "Tratamentos",
        };

        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `svc-list-${Date.now()}`,
            role: "bot",
            type: "service_cards",
            text: `📋 **${catNames[category] || category}** — valores a partir de:`,
            serviceCards: uniqueServices.map((s) => ({
              id: s.id,
              wixServiceId: s.wixServiceId,
              name: s.name,
              category: s.category,
              price: s.price,
              formattedPrice: s.formattedPrice,
              durationMinutes: s.durationMinutes,
              description: s.description,
            })),
            timestamp: new Date(),
          },
        });

        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `svc-cta-${Date.now()}`,
            role: "bot",
            type: "buttons",
            text: "Para agendar qualquer serviço:",
            buttons: [
              { id: "GOTO_STEP:BOOK_BARBER", label: "✂️ Agendar agora", variant: "primary" },
              { id: "SHOW_SERVICES_MENU", label: "← Outras categorias", variant: "ghost" },
              { id: "MAIN_MENU", label: "🏠 Menu principal", variant: "ghost" },
            ],
            timestamp: new Date(),
          },
        });
        return;
      }

      // Ações GOTO_STEP
      if (actionId.startsWith("GOTO_STEP:")) {
        const stepId = actionId.split(":")[1] as any;
        if (stepId === "BOOK_DATE") {
          setShowDatePicker(true);
          dispatch({
            type: "ADD_MESSAGE",
            message: {
              id: `date-picker-${Date.now()}`,
              role: "bot",
              type: "text",
              text: "📅 Escolha uma data para o atendimento:",
              timestamp: new Date(),
            },
          });
          dispatch({ type: "GOTO_STEP", step: "BOOK_DATE" });
          return;
        }
        dispatch({ type: "GOTO_STEP", step: stepId });
        return;
      }

      if (actionId === "RESCHEDULE") {
        const booking = session.activeBookingDetail;
        if (!booking) return;
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            id: `reschedule-date-${Date.now()}`,
            role: "bot",
            type: "text",
            text: "📅 Escolha a nova data para o reagendamento:",
            timestamp: new Date(),
          },
        });
        dispatch({ type: "GOTO_STEP", step: "RESCHEDULE_DATE" });
        return;
      }

      // Mapear ações de botão para ações do reducer
      const actionMap: Record<string, ChatbotAction> = {
        MAIN_MENU: { type: "MAIN_MENU" },
        RESTART: { type: "RESTART" },
        SHOW_SERVICES_MENU: { type: "SHOW_SERVICES_MENU" },
        SHOW_OPENING_HOURS: { type: "SHOW_OPENING_HOURS" },
        SHOW_MY_BOOKINGS: { type: "SHOW_MY_BOOKINGS" },
        GOTO_WHATSAPP: { type: "GOTO_WHATSAPP" },
        CONFIRM_CANCEL: { type: "CONFIRM_CANCEL" },
      };

      if (actionMap[actionId]) {
        dispatch(actionMap[actionId]);
      }
    },
    [session]
  );

  // Handler de input de texto
  const handleInputSubmit = useCallback(() => {
    const val = inputValue.trim();
    if (!val) return;

    setInputError("");

    if (session.step === "BOOK_CUSTOMER_NAME") {
      if (val.length < 3) { setInputError("Nome deve ter pelo menos 3 caracteres"); return; }
      dispatch({ type: "SET_CUSTOMER_NAME", name: val });
      setInputValue("");
    } else if (session.step === "BOOK_CUSTOMER_PHONE") {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) { setInputError("Número inválido. Use DDD + número (10-11 dígitos)"); return; }
      dispatch({ type: "SET_CUSTOMER_PHONE", phone: val });
      setInputValue("");
    } else if (session.step === "BOOK_CUSTOMER_EMAIL") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (val && !emailRegex.test(val)) { setInputError("E-mail inválido"); return; }
      dispatch({ type: "SET_CUSTOMER_EMAIL", email: val });
      setInputValue("");
    }
  }, [inputValue, session.step]);

  const currentInput = session.messages.findLast((m) => m.type === "input_request");
  const showInput = currentInput && ["BOOK_CUSTOMER_NAME", "BOOK_CUSTOMER_PHONE", "BOOK_CUSTOMER_EMAIL"].includes(session.step);

  // Verificar se deve mostrar date picker agora
  const lastDatePickerMsg = session.messages.findLast((m) => m.type === "text" && m.text?.includes("Escolha uma data"));
  const isInBookDateStep = session.step === "BOOK_DATE";

  // Verificar se deve mostrar time slots
  const isInBookTimeStep = session.step === "BOOK_TIME";
  const isInRescheduleTimeStep = session.step === "RESCHEDULE_TIME";

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Fechar atendimento" : "Abrir atendimento automático"}
        title={isOpen ? "Fechar atendimento" : "Abrir atendimento automático"}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-[#101712] border-2 border-[#25C440] hover:border-[#EF4444] text-[#25C440] hover:text-[#EF4444] hover:bg-[#1A0E0E] rotate-0 scale-100 hidden sm:flex"
            : "bg-[#25C440] hover:bg-[#2CD64A] hover:scale-110 active:scale-95 text-[#080B09]"
        }`}
        style={{ bottom: "calc(1.5rem + 60px)" }} // acima do WhatsApp float
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                !
              </span>
            )}
          </>
        )}
      </button>

      {/* Backdrop para mobile (toque fora para fechar) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Widget do Chat */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#080B09] border border-[#1E2720] shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden
            /* Mobile: painel flutuante responsivo, não tela cheia */
            inset-x-3 bottom-3 top-auto h-[82vh] max-h-[580px] rounded-3xl
            /* Tablet / Desktop */
            sm:inset-x-auto sm:right-6 sm:bottom-[calc(1.5rem+60px+1rem)]
            sm:w-[390px] sm:h-[580px] sm:max-h-[85vh] sm:rounded-2xl
          `}
          style={{ animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Alça tátil visual para Mobile */}
          <div className="w-10 h-1 bg-[#27342A] rounded-full mx-auto mt-2 -mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="px-4 py-3 bg-[#0B100C] border-b border-[#1A261D] flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25C440] to-[#1A942E] flex items-center justify-center shadow-lg shadow-[#25C440]/20">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-[#E8EDE9] tracking-tight">Léo Nunes Barbearia</p>
              <p className="text-[10px] text-[#25C440] font-medium">🟢 Atendimento automático</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: "RESTART" })}
                title="Recomeçar atendimento"
                className="p-2 rounded-xl text-[#9BA59E] hover:text-[#E8EDE9] hover:bg-[#111712] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar janela de atendimento"
                title="Fechar"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162219] hover:bg-[#EF4444] text-[#E8EDE9] hover:text-white border border-[#25C440]/40 hover:border-[#EF4444] transition-all duration-200 text-xs font-bold shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span className="inline">Fechar</span>
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 sm:space-y-4 overscroll-contain">
            {session.messages.map((msg, idx) => {
              // Remove mensagens de loading duplicadas (só a última conta)
              if (msg.type === "loading") {
                const isLastLoading = session.messages.slice(idx + 1).every((m) => m.type !== "loading");
                if (!isLastLoading) return null;
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex gap-2">
                    <BotAvatar />
                    <TypingIndicator />
                  </div>
                );
              }

              if (msg.type === "text" || msg.type === "buttons") {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col gap-2">
                    <MessageBubble message={msg} />
                    {msg.buttons && (
                      <ActionButtons buttons={msg.buttons} onAction={handleButtonAction} />
                    )}
                  </div>
                );
              }

              if (msg.type === "barber_cards") {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col gap-2">
                    <MessageBubble message={{ ...msg, type: "text" }} />
                    <BarberCards
                      dispatch={dispatch}
                      onSelect={
                        session.step === "FIND_NEXT_SLOT"
                          ? (barber) => {
                              dispatch({
                                type: "SELECT_BARBER",
                                barberId: barber.id,
                                barberSlug: barber.slug,
                                barberName: barber.name,
                                barberPhoto: barber.photo,
                              });
                              findAndShowNextSlots(barber.slug, [], barber.name);
                            }
                          : undefined
                      }
                    />
                  </div>
                );
              }

              if (msg.type === "repeat_card" && msg.repeatCard) {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col gap-2">
                    {msg.text && <MessageBubble message={{ ...msg, type: "text" }} />}
                    <RepeatCard
                      data={msg.repeatCard}
                      onRepeat={() => handleButtonAction("CONFIRM_REPEAT_SLOTS")}
                      onChangeBarber={() => handleButtonAction("CHANGE_REPEAT_BARBER")}
                      onChangeServices={() => handleButtonAction("CHANGE_REPEAT_SERVICES")}
                    />
                  </div>
                );
              }

              if (msg.type === "service_cards" && session.step === "BOOK_SERVICE") {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col gap-2">
                    <MessageBubble message={{ ...msg, type: "text", text: msg.text }} />
                    <ServiceCards
                      session={session}
                      dispatch={dispatch}
                      onProceed={() => {
                        setShowDatePicker(true);
                        dispatch({
                          type: "ADD_MESSAGE",
                          message: {
                            id: `date-prompt-${Date.now()}`,
                            role: "bot",
                            type: "text",
                            text: "📅 Ótimo! Agora escolha a data do seu atendimento:",
                            timestamp: new Date(),
                          },
                        });
                        dispatch({ type: "GOTO_STEP", step: "BOOK_DATE" });
                      }}
                    />
                  </div>
                );
              }

              if (msg.type === "service_cards") {
                // Lista de serviços por categoria (modo informativo)
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="pl-0 sm:pl-8 flex flex-col gap-1.5">
                    {msg.text && <MessageBubble message={{ ...msg, type: "text" }} />}
                    {(msg.serviceCards || []).map((svc) => (
                      <div
                        key={svc.id}
                        className="bg-[#111712] border border-[#1E2720] rounded-xl p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#E8EDE9]">{svc.name}</p>
                          <p className="text-[10px] text-[#9BA59E]">{svc.durationMinutes} min</p>
                        </div>
                        <span className="text-sm font-bold text-[#25C440]">{svc.formattedPrice}</span>
                      </div>
                    ))}
                  </div>
                );
              }

              if (msg.type === "booking_summary" && msg.bookingSummary) {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`}>
                    <BookingSummaryCard summary={msg.bookingSummary} />
                  </div>
                );
              }

              if (msg.type === "booking_result" && msg.bookingResult) {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`}>
                    <BookingResultCard result={msg.bookingResult} />
                  </div>
                );
              }

              if (msg.type === "bookings_list") {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col gap-2">
                    {msg.text && <MessageBubble message={{ ...msg, type: "text" }} />}
                    <BookingsListCard
                      bookings={msg.bookingsList || memberBookings}
                      onSelect={(b) => dispatch({ type: "SELECT_BOOKING", booking: b })}
                    />
                    <div className="pl-0 sm:pl-8">
                      <button
                        onClick={() => dispatch({ type: "MAIN_MENU" })}
                        className="text-xs text-[#9BA59E] hover:text-[#E8EDE9] transition-colors"
                      >
                        ← Menu principal
                      </button>
                    </div>
                  </div>
                );
              }

              if (msg.type === "booking_detail" && msg.bookingDetail) {
                return (
                  <div key={msg.id} id={`chat-msg-${msg.id}`}>
                    <BookingDetailCard
                      booking={msg.bookingDetail}
                      onCancel={() => dispatch({ type: "CONFIRM_CANCEL" })}
                      onReschedule={() => handleButtonAction("RESCHEDULE")}
                      onBack={() => dispatch({ type: "SHOW_MY_BOOKINGS" })}
                    />
                  </div>
                );
              }

              if (msg.type === "input_request") {
                return null; // renderizado abaixo via showInput
              }

              return (
                <div key={msg.id} id={`chat-msg-${msg.id}`}>
                  <MessageBubble message={msg} />
                </div>
              );
            })}

            {/* Date Picker no fluxo de agendamento */}
            {isInBookDateStep && (
              <DatePicker
                onSelect={(date) => dispatch({ type: "SELECT_DATE", date })}
              />
            )}

            {/* Date Picker para reagendamento */}
            {session.step === "RESCHEDULE_DATE" && (
              <div className="pl-0 sm:pl-8">
                <DatePicker
                  onSelect={(date) => dispatch({ type: "SELECT_RESCHEDULE_DATE", date })}
                />
              </div>
            )}

            {/* Time Slots */}
            {isInBookTimeStep && (
              <TimeSlots
                slots={slots}
                onSelect={(time, meta) => dispatch({ type: "SELECT_TIME", time, metadata: meta })}
                isLoading={slotsLoading}
                error={slotsError}
              />
            )}

            {/* Time Slots para reagendamento */}
            {isInRescheduleTimeStep && (
              <TimeSlots
                slots={rescheduleSlots}
                onSelect={(time, meta) => dispatch({ type: "SELECT_RESCHEDULE_TIME", time, metadata: meta })}
                isLoading={rescheduleSlotsLoading}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de texto */}
          {showInput && (
            <div className="p-3 border-t border-[#1A261D] bg-[#0B100C] shrink-0">
              {inputError && (
                <p className="text-[10px] text-[#EF4444] mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {inputError}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type={currentInput?.inputRequest?.type || "text"}
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleInputSubmit(); }}
                  placeholder={currentInput?.inputRequest?.placeholder || "Digite aqui..."}
                  className="flex-1 bg-[#111712] border border-[#1E2720] rounded-xl px-3 py-2.5 text-base sm:text-sm text-[#E8EDE9] placeholder-[#47544A] outline-none focus:border-[#25C440]/50 focus:ring-1 focus:ring-[#25C440]/20 transition-all"
                  autoFocus
                />
                <button
                  onClick={handleInputSubmit}
                  disabled={!inputValue.trim()}
                  className="p-2.5 bg-[#25C440] rounded-xl text-[#080B09] hover:bg-[#2CD64A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-[#080B09] border-t border-[#111712] shrink-0">
            <p className="text-[9px] text-[#2A3830] text-center">
              Atendimento automático • Dados seguros • Reserva oficial via Wix Bookings
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      ` }} />
    </>
  );
}

// Helper para obter slug do barbeiro pelo nome
function getBarberSlugFromName(name: string): string {
  const barber = BARBERS.find((b) => b.name.toLowerCase() === name.toLowerCase());
  return barber?.slug || "leo-nunes";
}
