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
  serviceIds?: string[];
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
  isMultiService?: boolean;
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
export const DEFAULT_WIX_LOCATION_ID = "c9ff9499-df93-470a-8ece-12f249208d4c";

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

  // 1. Consulta os horários disponíveis da API do Wix especificando o recurso do barbeiro
  let rawSlots: any[] = [];
  let wixTimezone = "America/Sao_Paulo";
  try {
    let slotsResponse: any;
    try {
      slotsResponse = await wixClient.availabilityTimeSlots.listAvailabilityTimeSlots({
        serviceId: resolvedServiceId,
        fromLocalDate: `${dateStr}T00:00:00`,
        toLocalDate: `${dateStr}T23:59:59`,
        resourceTypes: [
          {
            resourceTypeId: WIX_STAFF_RESOURCE_TYPE_ID,
            resourceIds: [barber.resourceId],
          },
        ],
      } as any);
    } catch (resourceTypeErr: any) {
      console.warn("[WIX RESOURCE_TYPES FALLBACK]", resourceTypeErr?.message || resourceTypeErr);
      slotsResponse = await wixClient.availabilityTimeSlots.listAvailabilityTimeSlots({
        serviceId: resolvedServiceId,
        fromLocalDate: `${dateStr}T00:00:00`,
        toLocalDate: `${dateStr}T23:59:59`,
        includeResourceTypeIds: [WIX_STAFF_RESOURCE_TYPE_ID],
      } as any);
    }

    rawSlots = slotsResponse?.timeSlots || [];
    wixTimezone = slotsResponse?.timeZone || "America/Sao_Paulo";
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

  // 2. Consulta reservas oficiais ativas do profissional nessa data no Wix (fuso oficial America/Fortaleza UTC-3)
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
        const resId = b.bookedEntity?.slot?.resource?._id || b.bookedEntity?.slot?.resource?.id;
        const isThisBarber = resId === barber.resourceId;
        // Considera exclusivamente reservas efetivas e confirmadas (ignora sessões de checkout rascunho 'CREATED')
        const isConfirmedBooking = b.status === "CONFIRMED" || b.status === "APPROVED" || b.status === "PENDING";
        return isThisBarber && isConfirmedBooking;
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

  // 3. Processa cada slot com validação matemática estrita
  const nowMs = Date.now();
  const exclusionsLog: Array<{ time: string; reason: string }> = [];

  const mappedSlots: TimeSlot[] = rawSlots.map((slot: any) => {
    const timeString = (slot.localStartDate || "").slice(11, 16);
    const endTimeString = (slot.localEndDate || "").slice(11, 16);
    const hourNumber = Number(timeString.split(":")[0]);

    const slotStartUtcMs = new Date(`${dateStr}T${timeString}:00.000-03:00`).getTime();
    let slotEndUtcMs: number;
    if (endTimeString && endTimeString.includes(":")) {
      slotEndUtcMs = new Date(`${dateStr}T${endTimeString}:00.000-03:00`).getTime();
    } else {
      slotEndUtcMs = slotStartUtcMs + resolvedDuration * 60 * 1000;
    }

    // Regra 1: Validação do Wix Bookings V2
    const isWixBookable = Boolean(
      slot.bookable &&
      (slot.remainingCapacity === undefined || slot.remainingCapacity > 0) &&
      !slot.bookingPolicyViolations?.tooLateToBook &&
      !slot.bookingPolicyViolations?.bookOnlineDisabled
    );

    // Regra 1.1: Validação de recurso retornado pelo Wix
    let barberInSlotResources = true;
    if (slot.availableResources && slot.availableResources.length > 0) {
      const hasBarberList = slot.availableResources.some(
        (ar: any) => ar.resources && ar.resources.length > 0
      );
      if (hasBarberList) {
        barberInSlotResources = slot.availableResources.some((ar: any) =>
          ar.resources?.some((r: any) => (r._id || r.id) === barber.resourceId)
        );
      }
    }

    // Regra 2: Se for hoje, horário não pode estar no passado
    let isPastTime = false;
    if (isToday && slotStartUtcMs <= nowMs) {
      isPastTime = true;
    }

    // Regra 3: Checagem estrita de sobreposição com reservas confirmadas existentes
    let overlapConflict: (typeof activeBarberBookings)[0] | null = null;
    for (const booking of activeBarberBookings) {
      if (slotStartUtcMs < booking.endMs && slotEndUtcMs > booking.startMs) {
        overlapConflict = booking;
        break;
      }
    }

    const available = isWixBookable && barberInSlotResources && !isPastTime && !overlapConflict;
    let reason: string | undefined = undefined;

    if (!isWixBookable) {
      if (slot.bookingPolicyViolations?.tooLateToBook) {
        reason = "Horário indisponível pela política de antecedência mínima do Wix.";
      } else if (slot.bookingPolicyViolations?.bookOnlineDisabled) {
        reason = "Agendamento online desativado no Wix para este horário.";
      } else {
        reason = "Horário indisponível no calendário oficial do Wix.";
      }
    } else if (!barberInSlotResources) {
      reason = "Profissional indisponível neste horário na agenda oficial.";
    } else if (isPastTime) {
      reason = "Horário já passou para o dia de hoje.";
    } else if (overlapConflict) {
      reason =
        overlapConflict.status === "PENDING"
          ? "Horário com reserva pendente de aprovação na agenda."
          : "Horário já reservado na agenda oficial.";
    }

    if (!available && reason) {
      exclusionsLog.push({ time: timeString, reason });
    }

    return {
      time: timeString,
      endTime: endTimeString,
      durationMinutes: Math.round((slotEndUtcMs - slotStartUtcMs) / (60 * 1000)),
      available,
      period: hourNumber < 12 ? "morning" : "afternoon",
      reason,
    };
  });

  const availableSlotsCount = mappedSlots.filter((s) => s.available).length;

  // Log estruturado de diagnóstico para rastreabilidade completa (requisito 7)
  console.log(
    "[AVAILABILITY_DIAGNOSTIC]",
    JSON.stringify({
      type: "single_service",
      dateRequested: dateStr,
      serviceId: resolvedServiceId,
      barber: { id: barber.id, name: barber.name, resourceId: barber.resourceId },
      timezone: "America/Fortaleza",
      utcWindow: { from: dayStartUtcIso, to: dayEndUtcIso },
      totalRawSlots: rawSlots.length,
      totalAvailableSlots: availableSlotsCount,
      activeConfirmedBookingsCount: activeBarberBookings.length,
      exclusionsCount: exclusionsLog.length,
      exclusions: exclusionsLog,
    })
  );

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
    availableSlots: availableSlotsCount,
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
              ar.resources?.some((r: any) => (r._id || r.id) === result.resourceId)
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

/**
 * Consulta a grade de disponibilidade conjunta para múltiplos serviços no Wix Bookings V2
 * utilizando a API oficial listMultiServiceAvailabilityTimeSlots.
 * Garante que todos os serviços sejam executados consecutivamente pelo mesmo barbeiro,
 * sem furos de agenda e sem colisão com reservas existentes.
 */
export async function getVerifiedMultiServiceSlots({
  barberId,
  barberSlug,
  serviceIds,
  dateStr,
}: {
  barberId?: string;
  barberSlug?: string;
  serviceIds: string[];
  dateStr: string;
}): Promise<VerifiedBarberSlotsResult> {
  const barber = barberId ? getBarberById(barberId) : getBarberBySlug(barberSlug || "");
  if (!barber || !barber.resourceId) {
    return {
      success: false,
      date: dateStr,
      barberId: barberId || barberSlug || "",
      barberName: "",
      resourceId: "",
      serviceId: serviceIds[0] || "",
      serviceIds,
      durationMinutes: 40,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      error: "Profissional não encontrado no cadastro oficial.",
      errorCode: "INVALID_DATA",
    };
  }

  // Se houver apenas 1 serviço, delega para a consulta individual existente
  if (serviceIds.length <= 1) {
    return getVerifiedBarberSlots({
      barberId: barber.id,
      barberSlug: barber.slug,
      serviceId: serviceIds[0],
      dateStr,
    });
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceIds[0] || "",
      serviceIds,
      durationMinutes: 40,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      error: "Data informada é inválida.",
      errorCode: "INVALID_DATA",
    };
  }

  const requestedDate = new Date(year, month - 1, day);
  const dayOfWeek = requestedDate.getDay(); // 0 = Domingo
  if (dayOfWeek === 0) {
    return {
      success: true,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceIds[0],
      serviceIds,
      durationMinutes: 40,
      closed: true,
      closedReason: "A barbearia não abre aos domingos.",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      isMultiService: true,
    };
  }

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
      serviceId: serviceIds[0],
      serviceIds,
      durationMinutes: 40,
      isPast: true,
      error: "Não é possível agendar em datas passadas.",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      isMultiService: true,
    };
  }

  if (!isWixConfigured()) {
    return {
      success: true,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceIds[0],
      serviceIds,
      durationMinutes: 40,
      wixIntegrationPending: true,
      error: "Credenciais do Wix Bookings não configuradas.",
      errorCode: "AUTH_ERROR",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      isMultiService: true,
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
      serviceId: serviceIds[0],
      serviceIds,
      durationMinutes: 40,
      error: "Falha na inicialização do cliente Wix SDK.",
      errorCode: "AUTH_ERROR",
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: "America/Fortaleza",
      isMultiService: true,
    };
  }

  // Mapeia e resolve cada serviço para o UUID oficial do Wix
  const resolvedServiceIds = serviceIds.map((sid) => resolveServiceId(barber, sid));
  const matchedServices = serviceIds.map((sid) =>
    barber.services.find((s) => s.id === sid || s.wixServiceId === sid)
  );
  const totalCalculatedDuration = matchedServices.reduce(
    (acc, s) => acc + (s?.durationMinutes || 35),
    0
  );

  // 1. Consulta horários conjuntos na API oficial Multi-Service do Wix
  let rawSlots: any[] = [];
  let wixTimezone = "America/Sao_Paulo";
  try {
    const multiServicePayload = resolvedServiceIds.map((svcId) => ({
      serviceId: svcId,
      resourceTypes: [
        {
          resourceTypeId: WIX_STAFF_RESOURCE_TYPE_ID,
          resourceIds: [barber.resourceId],
        },
      ],
    }));

    const slotsResponse: any = await (wixClient as any).multiServiceAvailabilityTimeSlots.listMultiServiceAvailabilityTimeSlots({
      services: multiServicePayload,
      location: {
        locationType: "BUSINESS",
        id: DEFAULT_WIX_LOCATION_ID,
      },
      fromLocalDate: `${dateStr}T00:00:00`,
      toLocalDate: `${dateStr}T23:59:59`,
    });

    rawSlots = slotsResponse.timeSlots || [];
    wixTimezone = slotsResponse.timeZone || "America/Sao_Paulo";
  } catch (err: any) {
    console.error("[WIX MULTI-SERVICE AVAILABILITY SLOTS ERROR]", err?.message || err);
    return {
      success: false,
      date: dateStr,
      barberId: barber.id,
      barberName: barber.name,
      resourceId: barber.resourceId,
      serviceId: serviceIds[0],
      serviceIds,
      durationMinutes: totalCalculatedDuration,
      slots: [],
      totalSlots: 0,
      availableSlots: 0,
      activeBookingsCount: 0,
      timezone: wixTimezone,
      error: "Não foi possível consultar os horários conjuntos na agenda oficial do Wix.",
      errorCode: "API_UNAVAILABLE",
      isMultiService: true,
    };
  }

  // 2. Consulta reservas oficiais ativas do profissional nessa data no Wix
  const dayStartUtcIso = new Date(`${dateStr}T00:00:00.000-03:00`).toISOString();
  const dayEndUtcIso = new Date(`${dateStr}T23:59:59.999-03:00`).toISOString();

  let activeBarberBookings: Array<{
    id?: string;
    title?: string;
    status: string;
    startMs: number;
    endMs: number;
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
        const resId = b.bookedEntity?.slot?.resource?._id || b.bookedEntity?.slot?.resource?.id;
        const isThisBarber = resId === barber.resourceId;
        // Considera apenas reservas confirmadas ou aprovadas
        const isConfirmedBooking = b.status === "CONFIRMED" || b.status === "APPROVED" || b.status === "PENDING";
        return isThisBarber && isConfirmedBooking;
      })
      .map((b) => ({
        id: b._id || b.id,
        title: b.bookedEntity?.title,
        status: b.status,
        startMs: new Date(b.startDate).getTime(),
        endMs: new Date(b.endDate).getTime(),
      }));
  } catch (bookingQueryErr: any) {
    console.warn("[WIX EXTENDED BOOKINGS QUERY WARN IN MULTI-SERVICE]", bookingQueryErr?.message);
  }

  // 3. Processa cada slot multi-serviço retornado
  const nowMs = Date.now();
  const multiExclusionsLog: Array<{ time: string; reason: string }> = [];

  const mappedSlots: TimeSlot[] = rawSlots.map((slot: any) => {
    const timeString = (slot.localStartDate || "").slice(11, 16);
    const endTimeString = (slot.localEndDate || "").slice(11, 16);
    const hourNumber = Number(timeString.split(":")[0]);

    const slotStartUtcMs = new Date(`${dateStr}T${timeString}:00.000-03:00`).getTime();
    let slotEndUtcMs: number;
    if (endTimeString && endTimeString.includes(":")) {
      slotEndUtcMs = new Date(`${dateStr}T${endTimeString}:00.000-03:00`).getTime();
    } else {
      slotEndUtcMs = slotStartUtcMs + totalCalculatedDuration * 60 * 1000;
    }

    const durationMinutes = Math.round((slotEndUtcMs - slotStartUtcMs) / (60 * 1000));

    // Regra 1: Validação oficial Wix
    const isWixBookable = Boolean(
      slot.bookable &&
      (slot.remainingCapacity === undefined || slot.remainingCapacity > 0) &&
      !slot.bookingPolicyViolations?.tooLateToBook &&
      !slot.bookingPolicyViolations?.bookOnlineDisabled
    );

    // Regra 2: Passado no dia de hoje
    let isPastTime = false;
    if (isToday && slotStartUtcMs <= nowMs) {
      isPastTime = true;
    }

    // Regra 3: Sobreposição com reservas existentes
    const hasOverlap = activeBarberBookings.some((booking) => {
      return slotStartUtcMs < booking.endMs && slotEndUtcMs > booking.startMs;
    });

    const isAvailable = isWixBookable && !isPastTime && !hasOverlap;

    let reason: string | undefined;
    if (isPastTime) reason = "Horário já ultrapassado para o dia de hoje.";
    else if (hasOverlap) reason = "Conflito com outro atendimento já agendado para o profissional.";
    else if (!isWixBookable) {
      if (slot.bookingPolicyViolations?.tooLateToBook) {
        reason = "Horário indisponível pela política de antecedência do Wix.";
      } else {
        reason = "Indisponível na agenda conjunta oficial do Wix.";
      }
    }

    if (!isAvailable && reason) {
      multiExclusionsLog.push({ time: timeString, reason });
    }

    // Extrai os slots aninhados com scheduleId e horários individuais de cada serviço
    const nestedSlots = (slot.nestedTimeSlots || []).map((nts: any) => ({
      serviceId: nts.serviceId,
      scheduleId: nts.scheduleId,
      localStartDate: nts.localStartDate,
      localEndDate: nts.localEndDate,
      resourceId: barber.resourceId,
      resourceName: barber.name,
    }));

    return {
      time: timeString,
      endTime: endTimeString,
      durationMinutes,
      period: hourNumber < 12 ? ("morning" as const) : ("afternoon" as const),
      available: isAvailable,
      reason,
      nestedTimeSlots: nestedSlots,
    };
  });

  const availableSlotsCount = mappedSlots.filter((s) => s.available).length;

  // Log estruturado de diagnóstico para multi-serviços (requisito 7)
  console.log(
    "[AVAILABILITY_DIAGNOSTIC]",
    JSON.stringify({
      type: "multi_service",
      dateRequested: dateStr,
      serviceIds: resolvedServiceIds,
      barber: { id: barber.id, name: barber.name, resourceId: barber.resourceId },
      timezone: "America/Fortaleza",
      utcWindow: { from: dayStartUtcIso, to: dayEndUtcIso },
      totalRawSlots: rawSlots.length,
      totalAvailableSlots: availableSlotsCount,
      activeConfirmedBookingsCount: activeBarberBookings.length,
      exclusionsCount: multiExclusionsLog.length,
      exclusions: multiExclusionsLog,
    })
  );

  return {
    success: true,
    date: dateStr,
    barberId: barber.id,
    barberName: barber.name,
    resourceId: barber.resourceId,
    serviceId: serviceIds[0],
    serviceIds,
    durationMinutes: totalCalculatedDuration,
    slots: mappedSlots,
    totalSlots: mappedSlots.length,
    availableSlots: availableSlotsCount,
    activeBookingsCount: activeBarberBookings.length,
    timezone: wixTimezone,
    rawSlots,
    isMultiService: true,
  };
}

/**
 * Validação rigorosa e atômica de um horário multi-serviço selecionado
 */
export async function verifySingleMultiServiceSlot({
  barberId,
  barberSlug,
  serviceIds,
  dateStr,
  timeStr,
}: {
  barberId?: string;
  barberSlug?: string;
  serviceIds: string[];
  dateStr: string;
  timeStr: string;
}): Promise<VerifySingleSlotResult> {
  const result = await getVerifiedMultiServiceSlots({
    barberId,
    barberSlug,
    serviceIds,
    dateStr,
  });

  if (!result.success) {
    return {
      valid: false,
      errorCode: result.errorCode || "API_UNAVAILABLE",
      message: result.error || "Não foi possível validar o horário conjunto.",
      httpStatus: 503,
    };
  }

  const matchedSlot = result.slots.find((s) => s.time === timeStr);
  if (!matchedSlot) {
    return {
      valid: false,
      errorCode: "SLOT_NOT_FOUND",
      message: `O horário ${timeStr} do dia ${dateStr} não existe para o pacote de serviços selecionado.`,
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
        `O horário ${timeStr} do dia ${dateStr} não possui disponibilidade contínua para todos os serviços selecionados.`,
      httpStatus: 409,
    };
  }

  const rawSlot = result.rawSlots?.find(
    (s: any) => (s.localStartDate || "").slice(11, 16) === timeStr
  );

  return {
    valid: true,
    slot: matchedSlot,
    rawSlot,
  };
}

