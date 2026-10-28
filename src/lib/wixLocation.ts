/**
 * Utilitário de Mapeamento e Validação de Localização e V2Slot
 * para o Wix Bookings Writer V2.
 * 
 * Regras Oficiais Wix Bookings V2:
 * - A API de Availability Time Slots retorna os tipos: 'BUSINESS' | 'CUSTOMER' | 'CUSTOM'
 * - O Bookings Writer V2 (createBooking, rescheduleBooking) aceita:
 *   'UNDEFINED' | 'OWNER_BUSINESS' | 'OWNER_CUSTOM' | 'CUSTOM'
 * 
 * Mapeamento Obrigatório:
 *   BUSINESS → OWNER_BUSINESS
 *   CUSTOMER → OWNER_CUSTOM
 *   CUSTOM   → CUSTOM
 * 
 * Valores desconhecidos ou 'OTHER' NÃO devem ser convertidos automaticamente
 * para OWNER_BUSINESS e devem ser rejeitados com erro controlado.
 */

export type WixBookingLocationType =
  | "UNDEFINED"
  | "OWNER_BUSINESS"
  | "OWNER_CUSTOM"
  | "CUSTOM";

/**
 * Mapeia o tipo de localização retornado pela API de Disponibilidade
 * para o enum estrito aceito pelo Wix Bookings Writer V2.
 */
export function mapToWixBookingLocationType(
  rawType: string | undefined | null
): WixBookingLocationType | null {
  if (!rawType || typeof rawType !== "string") {
    return null;
  }

  const normalized = rawType.trim().toUpperCase();

  // Mapeamentos oficiais Availability → Booking Writer V2
  if (normalized === "BUSINESS") return "OWNER_BUSINESS";
  if (normalized === "CUSTOMER") return "OWNER_CUSTOM";
  if (normalized === "CUSTOM") return "CUSTOM";

  // Valores já compatíveis com Bookings Writer V2
  if (normalized === "OWNER_BUSINESS") return "OWNER_BUSINESS";
  if (normalized === "OWNER_CUSTOM") return "OWNER_CUSTOM";
  if (normalized === "UNDEFINED") return "UNDEFINED";

  // 'OTHER' e qualquer valor desconhecido são expressamente inválidos
  return null;
}

export interface ResolveLocationResult {
  valid: boolean;
  location?: {
    id: string;
    _id: string;
    locationType: WixBookingLocationType;
    name?: string;
    formattedAddress?: string;
  };
  error?: string;
}

/**
 * Valida e compõe a localização oficial do slot com base nos dados do slot
 * de disponibilidade verificado e/ou da reserva original.
 */
export function resolveValidSlotLocation(
  slotLocation?: any,
  fallbackLocation?: any
): ResolveLocationResult {
  const primary = slotLocation || {};
  const fallback = fallbackLocation || {};

  // 1. Identificar o ID da localização oficial
  const locationId = primary._id || primary.id || fallback._id || fallback.id;
  if (!locationId || typeof locationId !== "string" || locationId.trim().length === 0) {
    return {
      valid: false,
      error: "Identificador de localização ausente ou inválido.",
    };
  }

  // 2. Identificar e validar o tipo de localização
  const rawLocType = primary.locationType || fallback.locationType;
  if (!rawLocType) {
    return {
      valid: false,
      error: "Tipo de localização não especificado.",
    };
  }

  const mappedType = mapToWixBookingLocationType(rawLocType);
  if (!mappedType) {
    return {
      valid: false,
      error: `Tipo de localização '${rawLocType}' não é aceito pelo Wix Bookings Writer V2.`,
    };
  }

  // 3. Montar localização válida e preservada
  const name = primary.name || fallback.name || "Léo Nunes Barbearia";
  const formattedAddress =
    primary.formattedAddress ||
    fallback.formattedAddress ||
    primary.formattedAddressTranslated ||
    fallback.formattedAddressTranslated;

  return {
    valid: true,
    location: {
      id: locationId.trim(),
      _id: locationId.trim(),
      locationType: mappedType,
      name,
      ...(formattedAddress ? { formattedAddress } : {}),
    },
  };
}

export interface BuildV2SlotParams {
  newDate: string; // YYYY-MM-DD
  newTime: string; // HH:mm
  serviceId: string;
  scheduleId?: string;
  resourceId: string;
  resourceName: string;
  resourceScheduleId?: string;
  durationMinutes: number;
  timezone?: string;
  rawSlotLocation?: any;
  originalBookingLocation?: any;
}

export interface BuildV2SlotResult {
  valid: boolean;
  v2Slot?: any;
  error?: string;
}

/**
 * Constrói o V2Slot oficial em conformidade com o Wix Bookings Writer V2.
 */
export function buildV2Slot(params: BuildV2SlotParams): BuildV2SlotResult {
  const {
    newDate,
    newTime,
    serviceId,
    scheduleId,
    resourceId,
    resourceName,
    resourceScheduleId,
    durationMinutes,
    timezone = "America/Sao_Paulo",
    rawSlotLocation,
    originalBookingLocation,
  } = params;

  if (!serviceId) {
    return { valid: false, error: "Identificador de serviço ausente." };
  }

  if (!resourceId) {
    return { valid: false, error: "Identificador de barbeiro ausente." };
  }

  // Resolver localização
  const locResult = resolveValidSlotLocation(rawSlotLocation, originalBookingLocation);
  if (!locResult.valid || !locResult.location) {
    return { valid: false, error: locResult.error || "Localização inválida." };
  }

  // Calcular datas em UTC a partir do fuso oficial Pacajus (UTC-3)
  const startUtc = new Date(`${newDate}T${newTime}:00.000-03:00`);
  if (isNaN(startUtc.getTime())) {
    return { valid: false, error: "Data ou horário inválido." };
  }

  const durationMs = (durationMinutes > 0 ? durationMinutes : 35) * 60 * 1000;
  const endUtc = new Date(startUtc.getTime() + durationMs);

  const resourceObj: any = {
    id: resourceId,
    _id: resourceId,
    name: resourceName,
  };
  if (resourceScheduleId) {
    resourceObj.scheduleId = resourceScheduleId;
  }

  const slot: any = {
    startDate: startUtc.toISOString(),
    endDate: endUtc.toISOString(),
    serviceId,
    timezone,
    resource: resourceObj,
    location: locResult.location,
  };

  if (scheduleId) {
    slot.scheduleId = scheduleId;
  }

  return {
    valid: true,
    v2Slot: slot,
  };
}
