// ============================================================
// Chatbot Léo Nunes Barbearia — Tipos TypeScript
// Motor baseado em fluxos e estados, sem IA generativa
// ============================================================

export type ChatbotStepId =
  | "WELCOME"
  | "MAIN_MENU"
  | "SERVICES_MENU"
  | "SERVICES_LIST"
  | "BOOK_BARBER"
  | "BOOK_SERVICE"
  | "BOOK_DATE"
  | "BOOK_TIME"
  | "BOOK_CUSTOMER_NAME"
  | "BOOK_CUSTOMER_PHONE"
  | "BOOK_CUSTOMER_EMAIL"
  | "BOOK_CONFIRM"
  | "BOOK_RESULT"
  | "MY_BOOKINGS"
  | "BOOKING_DETAIL"
  | "CANCEL_CONFIRM"
  | "CANCEL_RESULT"
  | "RESCHEDULE_DATE"
  | "RESCHEDULE_TIME"
  | "RESCHEDULE_CONFIRM"
  | "RESCHEDULE_RESULT"
  | "WHATSAPP"
  | "ERROR"
  | "LOADING";

export type ChatMessageRole = "bot" | "user" | "system";

export type ChatMessageType =
  | "text"
  | "buttons"
  | "barber_cards"
  | "service_cards"
  | "date_picker"
  | "time_slots"
  | "booking_summary"
  | "booking_result"
  | "bookings_list"
  | "booking_detail"
  | "loading"
  | "error"
  | "input_request";

export interface ChatButton {
  id: string;
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
}

export interface BarberCardData {
  id: string;
  slug: string;
  name: string;
  role: string;
  photo: string;
  tagline: string;
  servicesCount: number;
}

export interface ServiceCardData {
  id: string;
  wixServiceId?: string;
  name: string;
  category: string;
  price: number;
  formattedPrice: string;
  durationMinutes: number;
  description?: string;
  selected?: boolean;
}

export interface TimeSlotData {
  time: string; // HH:mm
  available: boolean;
  metadata?: any;
}

export interface BookingSummaryData {
  barberName: string;
  barberPhoto?: string;
  services: { name: string; formattedPrice: string; durationMinutes: number }[];
  totalPrice: number;
  totalDuration: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface MemberBookingItem {
  id: string;
  bookingId: string;
  serviceName: string;
  barberName?: string;
  date: string;
  time: string;
  status: string;
  price?: string;
  canCancel?: boolean;
  canReschedule?: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  type: ChatMessageType;
  text?: string;
  buttons?: ChatButton[];
  barberCards?: BarberCardData[];
  serviceCards?: ServiceCardData[];
  timeSlots?: TimeSlotData[];
  bookingSummary?: BookingSummaryData;
  bookingResult?: {
    success: boolean;
    bookingId?: string;
    status?: string;
    message: string;
    directWixUrl?: string;
    checkoutUrl?: string;
    dryRun?: boolean;
  };
  bookingsList?: MemberBookingItem[];
  bookingDetail?: MemberBookingItem;
  inputRequest?: {
    placeholder: string;
    type: "text" | "tel" | "email";
    validation?: "name" | "phone" | "email";
  };
  timestamp: Date;
}

export interface ChatbotSession {
  step: ChatbotStepId;
  messages: ChatMessage[];

  // Dados coletados no fluxo de agendamento
  selectedBarberId?: string;
  selectedBarberSlug?: string;
  selectedBarberName?: string;
  selectedBarberPhoto?: string;
  selectedServiceIds?: string[]; // IDs locais (ln-corte, etc.)
  selectedServiceWixIds?: string[];
  selectedServiceNames?: string[];
  selectedServicePrices?: number[];
  selectedServiceDurations?: number[];
  selectedDate?: string; // YYYY-MM-DD
  selectedTime?: string; // HH:mm
  selectedSlotMetadata?: any;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Para cancelamento / reagendamento
  activeBookingId?: string;
  activeBookingDetail?: MemberBookingItem;
  rescheduleDate?: string;
  rescheduleTime?: string;

  // Estado da UI
  isLoading?: boolean;
  error?: string;
}

export type ChatbotAction =
  | { type: "SELECT_BARBER"; barberId: string; barberSlug: string; barberName: string; barberPhoto: string }
  | { type: "SELECT_SERVICE"; serviceId: string; wixServiceId?: string; name: string; price: number; duration: number; formattedPrice: string }
  | { type: "TOGGLE_SERVICE"; serviceId: string; wixServiceId?: string; name: string; price: number; duration: number; formattedPrice: string }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SELECT_TIME"; time: string; metadata?: any }
  | { type: "SET_CUSTOMER_NAME"; name: string }
  | { type: "SET_CUSTOMER_PHONE"; phone: string }
  | { type: "SET_CUSTOMER_EMAIL"; email: string }
  | { type: "CONFIRM_BOOKING" }
  | { type: "GOTO_STEP"; step: ChatbotStepId }
  | { type: "MAIN_MENU" }
  | { type: "RESTART" }
  | { type: "SHOW_SERVICES_MENU" }
  | { type: "SHOW_MY_BOOKINGS" }
  | { type: "SELECT_BOOKING"; booking: MemberBookingItem }
  | { type: "CONFIRM_CANCEL" }
  | { type: "SELECT_RESCHEDULE_DATE"; date: string }
  | { type: "SELECT_RESCHEDULE_TIME"; time: string; metadata?: any }
  | { type: "CONFIRM_RESCHEDULE" }
  | { type: "GOTO_WHATSAPP" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage };
