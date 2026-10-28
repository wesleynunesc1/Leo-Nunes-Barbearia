import { getBarberById, getBarberBySlug, Barber } from "@/data/barbers";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";
import { TimeSlot, BookingErrorCode } from "@/types/booking";

export interface VerifiedBarberSlotsResult {
  success: boolean;
  date: string;
  barberId: string;
  barberName: string;
  resourceId: string;
  serviceId: string;
  durationMinutes: number;
  slots: TimeSlot[];
  totalSlots: number;
  availableSlots: number;
  activeBookingsCount: number;
  timezone: string;
  closed?: boolean;
  closedReason?: string;
  isPast?: boolean;
  wixIntegrationPending?: boolean;
  error?: string;
  errorCode?: BookingErrorCode;
  rawSlots?: any[];
}

export interface VerifySingleSlotResult {
  valid: boolean;
  slot?: TimeSlot;
  rawSlot?: any;
  errorCode?: BookingErrorCode;
  message?: string;
  httpStatus?: number;
}

export const WIX_STAFF_RESOURCE_TYPE_ID = "1cd44cf8-756f-41c3-bd90-3e2ffcaf1155";

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveServiceId(barber: Barber, serviceId?: string | null): string {
  if (serviceId && IS_UUID_REGEX.test(serviceId)) {
    return serviceId;
  }
  const foundService = barber.services.find(
    (s) => s.id === serviceId || s.wixServiceId === serviceId
  );
  if (foundService?.wixServiceId) {
    return foundService.wixServiceId;
  }
  // Fallback oficial por profissional
  return barber.id === "leo-nunes"
    ? "71a2e1ca-2bce-410f-8d98-a64a5225a9ab"
    : "5fdf0f3a-8e3e-4009-8421-4467ef3b3871";
}

/**
 * Consulta a grade oficial do Wix Bookings e realiza conferência com as reservas existentes
 * garantindo que nenhum horário já ocupado para o profissional seja apresentado como livre.
 */
export async function getVerifiedBarberSlots({
  barberId,
  barberSlug,
  serviceId,
  dateStr,
  durationMinutes,
}: {
  barberId?: string;
  barberSlug?: string;
  serviceId?: string | null;
  dateStr: string;
  durationMinutes?: number;
}): Promise<VerifiedBarberSlotsResult> {
  const barber = barberId ? getBarberById(barberId) : getBarberBySlug(barberSlug || "");
  if (!barber || !barber.resourceId) {
    return {
      success: false,
      date: dateStr,
      barberId: barberId || barberSlug || "",
      barberName: "",
      resourceId: "",
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      error: "Profissional não encontrado no cadastro oficial.",
      errorCode: "INVALID_DATA",
    };
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      error: "Formato de data inválido. Use YYYY-MM-DD.",
      errorCode: "INVALID_DATA",
    };
  }

  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0 = Domingo

  if (dayOfWeek === 0) {
    return {
      success: true,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      closed: true,
      closedReason: "A barbearia não abre aos domingos.",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
    };
  }

  // Fuso horário oficial de Pacajus (UTC-3)
  const nowInFortaleza = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Fortaleza" })
  );
  const todayStr = `${nowInFortaleza.getFullYear()}-${String(nowInFortaleza.getMonth() + 1).padStart(2, "0")}-${String(nowInFortaleza.getDate()).padStart(2, "0")}`;
  const isToday = dateStr === todayStr;
  const currentHour = nowInFortaleza.getHours();
  const currentMinute = nowInFortaleza.getMinutes();

  if (dateStr < todayStr) {
    return {
      success: true,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      isPast: true,
      error: "Não é possível agendar em datas passadas.",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
    };
  }

  if (!isWixConfigured()) {
    return {
      success: true,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      wixIntegrationPending: true,
      error: "Credenciais do Wix Bookings não configuradas.",
      errorCode: "AUTH_ERROR",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
    };
  }

  const wixClient = getWixClient();
  if (!wixClient) {
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceId || "",
      durationMinutes: durationMinutes || 35,
      error: "Falha na inicialização do cliente Wix SDK.",
      errorCode: "AUTH_ERROR",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
    };
  }

  const resolvedServiceId = resolveServiceId(barber, serviceId);
  const matchedService = barber.services.find(
    (s) => s.id === serviceId || s.wixServiceId === resolvedServiceId
  );
  const resolvedDuration = durationMinutes || matchedService?.durationMinutes || 35;

  // 1. Consulta os horários disponíveis da API do Wix
  let rawSlots: any[] = [];
  let wixTimezone = "America/Sao_Paulo";
  try {
    const slotsResponse: any = await wixClient.availabilityTimeSlots.listAvailabilityTimeSlots({
      serviceId: resolvedServiceId,
      fromLocalDate: `${dateStr}T00:00:00`,
      toLocalDate: `${dateStr}T23:59:59`,
      includeResourceTypeIds: [WIX_STAFF_RESOURCE_TYPE_ID],
    } as any);

    rawSlots = slotsResponse.timeSlots || [];
    wixTimezone = slotsResponse.timeZone || "America/Sao_Paulo";
  } catch (err: any) {
    console.error("[WIX AVAILABILITY SLOTS ERROR]", err?.message || err);
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: resolvedServiceId,
      durationMinutes: resolvedDuration,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: wixTimezone,
      error: "Não foi possível consultar os horários na agenda oficial do Wix.",
      errorCode: "API_UNAVAILABLE",
    };
  }

  // 2. Consulta reservas oficiais ativas do profissional nessa data no Wix
  // Busca ampla pelo dia completo no fuso UTC-3
  const dayStartUtcIso = new Date(`${dateStr}T00:00:00.000-03:00`).toISOString();
  const dayEndUtcIso = new Date(`${dateStr}T23:59:59.999-03:00`).toISOString();

  let activeBarberBookings: Array<{
    id?: string;
    title?: string;
    status: string;
    startMs: number;
    endMs: number;
    localStart?: string;
    localEnd?: string;
  }> = [];

  try {
    const bookingsRes: any = await (wixClient as any).extendedBookings
      .queryExtendedBookings()
      .ge("startDate", dayStartUtcIso)
      .le("startDate", dayEndUtcIso)
      .limit(100)
      .find();

    const items: any[] = bookingsRes.items || [];
    activeBarberBookings = items
      .map((item) => item.booking || item)
      .filter((b) => {
        const resId = b.bookedEntity?.slot?.resource?._id;
        const isThisBarber = resId === barber.resourceId;
        const isNotCanceled = b.status !== "CANCELED" && b.status !== "DECLINED";
        return isThisBarber && isNotCanceled;
      })
      .map((b) => ({
        id: b._id || b.id,
        title: b.bookedEntity?.title,
        status: b.status,
        startMs: new Date(b.startDate).getTime(),
        endMs: new Date(b.endDate).getTime(),
        localStart: b.adjustedStart?.localDate,
        localEnd: b.adjustedEnd?.localDate,
      }));
  } catch (bookingQueryErr: any) {
    console.error("[WIX EXTENDED BOOKINGS QUERY ERROR]", bookingQueryErr?.message || bookingQueryErr);
    // Em caso de falha crítica na checagem de sobreposição, não podemos garantir disponibilidade segura
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: resolvedServiceId,
      durationMinutes: resolvedDuration,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: wixTimezone,
      error: "Não foi possível validar as reservas existentes na agenda oficial do Wix.",
      errorCode: "API_UNAVAILABLE",
    };
  }

  // 3. Processa cada slot com validação matemática estrita de sobreposição
  const mappedSlots: TimeSlot[] = rawSlots.map((slot: any) => {
    const timeString = (slot.localStartDate || "").slice(11, 16);
    const endTimeString = (slot.localEndDate || "").slice(11, 16);
    const hourNumber = Number(timeString.split(":")[0]);
    const slotMinute = Number(timeString.split(":")[1] || 0);

    const slotStartUtcMs = new Date(`${dateStr}T${timeString}:00.000-03:00`).getTime();
    let slotEndUtcMs: number;
    if (endTimeString && endTimeString.includes(":")) {
      slotEndUtcMs = new Date(`${dateStr}T${endTimeString}:00.000-03:00`).getTime();
    } else {
      slotEndUtcMs = slotStartUtcMs + resolvedDuration * 60 * 1000;
    }

    // Regra 1: Validação do Wix Bookings
    const isWixBookable = Boolean(
      slot.bookable &&
      (slot.remainingCapacity === undefined || slot.remainingCapacity > 0) &&
      !slot.bookingPolicyViolations?.tooLateToBook &&
      !slot.bookingPolicyViolations?.bookOnlineDisabled
    );

    // Regra 1.1: Validação individual do recurso do barbeiro retornado pelo Wix
    let barberInSlotResources = true;
    if (slot.availableResources && slot.availableResources.length > 0) {
      const hasBarberList = slot.availableResources.some(
        (ar: any) => ar.resources && ar.resources.length > 0
      );
      if (hasBarberList) {
        barberInSlotResources = slot.availableResources.some((ar: any) =>
          ar.resources?.some((r: any) => r._id === barber.resourceId)
        );
      }
    }

    // Regra 2: Se for hoje, horário não pode estar no passado
    let isPastTime = false;
    if (isToday) {
      if (
        hourNumber < currentHour ||
        (hourNumber === currentHour && slotMinute <= currentMinute + 15)
      ) {
        isPastTime = true;
      }
    }

    // Regra 3: Checagem estrita de sobreposição (overlap) com reservas existentes do barbeiro
    let overlapConflict: (typeof activeBarberBookings)[0] | null = null;
    for (const booking of activeBarberBookings) {
      // Sobreposição real: início do slot < fim da reserva E fim do slot > início da reserva
      if (slotStartUtcMs < booking.endMs && slotEndUtcMs > booking.startMs) {
        overlapConflict = booking;
        break;
      }
    }

    let available = isWixBookable && barberInSlotResources && !isPastTime && !overlapConflict;
    let reason: string | undefined = undefined;

    if (!isWixBookable) {
      reason = "Horário indisponível pelas políticas do Wix";
    } else if (!barberInSlotResources) {
      reason = "Profissional indisponível neste horário na agenda oficial";
    } else if (isPastTime) {
      reason = "Horário já passou";
    } else if (overlapConflict) {
      reason =
        overlapConflict.status === "PENDING"
          ? "Horário com reserva pendente na agenda"
          : "Horário já reservado na agenda oficial";
    }

    return {
      time: timeString,
      available,
      period: hourNumber < 12 ? "morning" : "afternoon",
      reason,
    };
  });

  return {
    success: true,
    date: dateStr,
    barberId: barber.id,
    barberName: barber.name,
    resourceId: barber.resourceId,
    serviceId: resolvedServiceId,
    durationMinutes: resolvedDuration,
    slots: mappedSlots,
    totalSlots: mappedSlots.length,
    availableSlots: mappedSlots.filter((s) => s.available).length,
    activeBookingsCount: activeBarberBookings.length,
    timezone: wixTimezone,
    rawSlots,
  };
}

/**
 * Revalida um slot específico no momento da confirmação (Etapa 5)
 * utilizando EXATAMENTE a mesma fonte da Etapa 4.
 */
export async function verifySingleSlotAvailability({
  barberId,
  barberSlug,
  serviceId,
  dateStr,
  timeStr,
  durationMinutes,
}: {
  barberId?: string;
  barberSlug?: string;
  serviceId?: string | null;
  dateStr: string;
  timeStr: string;
  durationMinutes?: number;
}): Promise<VerifySingleSlotResult> {
  const result = await getVerifiedBarberSlots({
    barberId,
    barberSlug,
    serviceId,
    dateStr,
    durationMinutes,
  });

  if (!result.success) {
    return {
      valid: false,
      errorCode: result.errorCode || "API_UNAVAILABLE",
      message: result.error || "Não foi possível verificar a disponibilidade no Wix.",
      httpStatus: result.errorCode === "AUTH_ERROR" ? 401 : 503,
    };
  }

  const matchedSlot = result.slots.find((s) => s.time === timeStr);
  if (!matchedSlot) {
    return {
      valid: false,
      errorCode: "SLOT_NOT_FOUND",
      message: `O horário ${timeStr} não consta na grade oficial para o dia ${dateStr}.`,
      httpStatus: 404,
    };
  }

  if (!matchedSlot.available) {
    return {
      valid: false,
      slot: matchedSlot,
      errorCode: "SLOT_UNAVAILABLE",
      message:
        matchedSlot.reason ||
        `O horário ${timeStr} do dia ${dateStr} já está preenchido na agenda oficial do profissional.`,
      httpStatus: 409,
    };
  }

  const rawSlot = result.rawSlots?.find(
    (s: any) => (s.localStartDate || "").slice(11, 16) === timeStr
  );

  // Consulta individual oficial via Get Availability Time Slot V2
  const wixClient = getWixClient();
  if (wixClient && rawSlot?.localStartDate && rawSlot?.localEndDate && rawSlot?.location) {
    try {
      const getRes: any = await wixClient.availabilityTimeSlots.getAvailabilityTimeSlot(
        result.serviceId,
        rawSlot.localStartDate,
        rawSlot.localEndDate,
        result.timezone || "America/Sao_Paulo",
        rawSlot.location,
        {
          includeResourceTypeIds: [WIX_STAFF_RESOURCE_TYPE_ID],
        } as any
      );

      const slotDetail = getRes?.timeSlot;
      if (slotDetail) {
        if (!slotDetail.bookable) {
          return {
            valid: false,
            slot: matchedSlot,
            errorCode: "SLOT_UNAVAILABLE",
            message: `O horário ${timeStr} tornou-se indisponível no Wix Bookings.`,
            httpStatus: 409,
          };
        }

        if (slotDetail.availableResources && slotDetail.availableResources.length > 0) {
          const hasBarbers = slotDetail.availableResources.some(
            (ar: any) => ar.resources && ar.resources.length > 0
          );
          if (hasBarbers) {
            const isSpecificBarberFree = slotDetail.availableResources.some((ar: any) =>
              ar.resources?.some((r: any) => r._id === result.resourceId)
            );
            if (!isSpecificBarberFree) {
              return {
                valid: false,
                slot: matchedSlot,
                errorCode: "SLOT_UNAVAILABLE",
                message: `O horário ${timeStr} já está preenchido especificamente para ${result.barberName} no Wix.`,
                httpStatus: 409,
              };
            }
          }
        }
      }
    } catch (getSlotErr: any) {
      console.warn("[WIX GET AVAILABILITY SLOT FALLBACK]", getSlotErr?.message || getSlotErr);
    }
  }

  return {
    valid: true,
    slot: matchedSlot,
    rawSlot,
  };
}
