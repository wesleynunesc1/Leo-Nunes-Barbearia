export interface BookingCustomer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface BookingPayload {
  barberId: string;
  barberSlug: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice?: number;
  serviceDuration?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customer: BookingCustomer;
  idempotencyKey?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  period: "morning" | "afternoon";
  reason?: string;
}

export interface BookingSlotResponse {
  date: string;
  barberId: string;
  serviceId: string;
  slots: TimeSlot[];
  wixIntegrationPending: boolean;
  timezone: string;
}

export type BookingResponseStatus =
  | "CONFIRMED"
  | "PENDING"
  | "CHECKOUT_REQUIRED"
  | "DRY_RUN_VALIDATED"
  | "WIX_CREDENTIALS_PENDING"
  | "ERROR";

export type BookingErrorCode =
  | "SLOT_UNAVAILABLE"
  | "SLOT_NOT_FOUND"
  | "DUPLICATE_BOOKING"
  | "CONCURRENT_REQUEST"
  | "AUTH_ERROR"
  | "PERMISSION_DENIED"
  | "CREATION_FAILED"
  | "API_UNAVAILABLE"
  | "CONFIRMATION_PENDING"
  | "INVALID_DATA"
  | "STORAGE_UNAVAILABLE";

export interface BookingCreateResponse {
  success: boolean;
  status: BookingResponseStatus;
  errorCode?: BookingErrorCode;
  bookingId?: string;
  message: string;
  directWixUrl?: string;
  checkoutUrl?: string;
  wixIntegrationPending?: boolean;
  dryRun?: boolean;
  details?: Record<string, unknown>;
}
