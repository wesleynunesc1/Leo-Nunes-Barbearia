"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Barber, BarberService, getAllBarbers, getBarberBySlug, getBarberById } from "@/data/barbers";
import { BookingCustomer, BookingCreateResponse, SelectedServiceItem } from "@/types/booking";

interface OpenBookingOptions {
  barberSlug?: string;
  barberId?: string;
  serviceId?: string;
  serviceIds?: string[];
}

interface BookingContextType {
  isModalOpen: boolean;
  step: 1 | 2 | 3 | 4 | 5;
  selectedBarber: Barber | null;
  selectedService: BarberService | null; // Retrocompatibilidade (retorna o 1º serviço ou null)
  selectedServices: BarberService[]; // Lista com múltiplos serviços
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm
  selectedSlotMetadata: any;
  customer: BookingCustomer;
  bookingResult: BookingCreateResponse | null;
  isSubmitting: boolean;
  totalPrice: number;
  totalDurationMinutes: number;

  openBooking: (options?: OpenBookingOptions) => void;
  closeBooking: () => void;
  goToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  selectBarber: (barber: Barber) => void;
  selectService: (service: BarberService) => void; // Seleciona único serviço e avança
  addService: (service: BarberService) => boolean;
  removeService: (serviceId: string) => void;
  toggleService: (service: BarberService) => void;
  clearServices: () => void;
  selectDate: (dateStr: string) => void;
  selectTime: (timeStr: string, slotMetadata?: any) => void;
  updateCustomer: (customerData: Partial<BookingCustomer>) => void;
  submitBooking: () => Promise<BookingCreateResponse | null>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServices, setSelectedServices] = useState<BarberService[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotMetadata, setSelectedSlotMetadata] = useState<any>(null);
  const [customer, setCustomer] = useState<BookingCustomer>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [bookingResult, setBookingResult] = useState<BookingCreateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Getter de retrocompatibilidade para o primeiro serviço
  const selectedService = selectedServices[0] || null;

  // Cálculos automáticos do conjunto de serviços
  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + (s.durationMinutes || 35), 0);

  const resetBooking = useCallback(() => {
    setStep(1);
    setSelectedBarber(null);
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedSlotMetadata(null);
    setBookingResult(null);
    setIsSubmitting(false);
  }, []);

  const openBooking = useCallback((options?: OpenBookingOptions) => {
    setBookingResult(null);
    setIsSubmitting(false);

    if (options?.barberSlug || options?.barberId) {
      const barber = options.barberSlug
        ? getBarberBySlug(options.barberSlug)
        : getBarberById(options.barberId!);

      if (barber) {
        setSelectedBarber(barber);

        if (options.serviceIds && options.serviceIds.length > 0) {
          const matched = barber.services.filter((s) => options.serviceIds!.includes(s.id));
          if (matched.length > 0) {
            setSelectedServices(matched.slice(0, 5));
            setStep(3);
            setIsModalOpen(true);
            return;
          }
        } else if (options.serviceId) {
          const service = barber.services.find((s) => s.id === options.serviceId);
          if (service) {
            setSelectedServices([service]);
            setStep(3); // Vai direto para escolher a data
            setIsModalOpen(true);
            return;
          }
        }

        setStep(2); // Vai direto para escolher serviço
        setIsModalOpen(true);
        return;
      }
    }

    setStep(1);
    setIsModalOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const goToStep = useCallback((newStep: 1 | 2 | 3 | 4 | 5) => {
    setStep(newStep);
  }, []);

  const selectBarber = useCallback((barber: Barber) => {
    setSelectedBarber(barber);
    // Preserva apenas serviços que também pertencem ao novo barbeiro
    setSelectedServices((prev) => prev.filter((s) => barber.services.some((bs) => bs.id === s.id)));
    setSelectedTime("");
    setSelectedSlotMetadata(null);
    setStep(2);
  }, []);

  // Seleciona um único serviço e avança (para compatibilidade rápida)
  const selectService = useCallback((service: BarberService) => {
    setSelectedServices([service]);
    setSelectedTime("");
    setSelectedSlotMetadata(null);
    setStep(3);
  }, []);

  // Adiciona serviço ao pacote (limite de 5)
  const addService = useCallback((service: BarberService): boolean => {
    let added = false;
    setSelectedServices((prev) => {
      if (prev.some((s) => s.id === service.id)) return prev;
      if (prev.length >= 5) return prev;
      added = true;
      return [...prev, service];
    });
    setSelectedTime("");
    setSelectedSlotMetadata(null);
    return added;
  }, []);

  // Remove serviço do pacote
  const removeService = useCallback((serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
    setSelectedTime("");
    setSelectedSlotMetadata(null);
  }, []);

  // Alterna seleção de serviço
  const toggleService = useCallback((service: BarberService) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }
      if (prev.length >= 5) {
        return prev; // Limite de 5 serviços
      }
      return [...prev, service];
    });
    setSelectedTime("");
    setSelectedSlotMetadata(null);
  }, []);

  const clearServices = useCallback(() => {
    setSelectedServices([]);
    setSelectedTime("");
    setSelectedSlotMetadata(null);
  }, []);

  const selectDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(""); // Limpa horário ao trocar de data
    setSelectedSlotMetadata(null);
    setStep(4);
  }, []);

  const selectTime = useCallback((timeStr: string, slotMetadata?: any) => {
    setSelectedTime(timeStr);
    setSelectedSlotMetadata(slotMetadata || null);
    setStep(5);
  }, []);

  const updateCustomer = useCallback((customerData: Partial<BookingCustomer>) => {
    setCustomer((prev) => ({ ...prev, ...customerData }));
  }, []);

  const submitBooking = useCallback(async (): Promise<BookingCreateResponse | null> => {
    if (!selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      return null;
    }
    if (isSubmitting) {
      return null;
    }

    setIsSubmitting(true);
    setBookingResult(null);

    const primaryService = selectedServices[0];
    const servicesPayload: SelectedServiceItem[] = selectedServices.map((s) => ({
      id: s.id,
      wixServiceId: s.wixServiceId,
      name: s.name,
      price: s.price,
      durationMinutes: s.durationMinutes,
      category: s.category,
      formattedPrice: s.formattedPrice,
    }));

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarber.id,
          barberSlug: selectedBarber.slug,
          barberName: selectedBarber.name,
          serviceId: primaryService.wixServiceId || primaryService.id,
          serviceName: selectedServices.map((s) => s.name).join(" + "),
          servicePrice: totalPrice,
          serviceDuration: totalDurationMinutes,
          services: servicesPayload,
          totalPrice,
          totalDuration: totalDurationMinutes,
          date: selectedDate,
          time: selectedTime,
          endTime: selectedSlotMetadata?.endTime,
          slotMetadata: selectedSlotMetadata,
          customer,
        }),
      });

      const data: BookingCreateResponse = await res.json();
      setBookingResult(data);
      return data;
    } catch (err) {
      console.error("[SUBMIT BOOKING ERROR]", err);
      const fallbackResult: BookingCreateResponse = {
        success: false,
        status: "ERROR",
        message: "Ocorreu um erro ao enviar a reserva. Verifique sua conexão.",
        directWixUrl: primaryService.bookingUrl,
      };
      setBookingResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedBarber,
    selectedServices,
    totalPrice,
    totalDurationMinutes,
    selectedDate,
    selectedTime,
    selectedSlotMetadata,
    customer,
    isSubmitting,
  ]);

  // Previne rolagem de fundo quando modal estiver aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Fecha modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeBooking();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeBooking]);

  return (
    <BookingContext.Provider
      value={{
        isModalOpen,
        step,
        selectedBarber,
        selectedService,
        selectedServices,
        selectedDate,
        selectedTime,
        selectedSlotMetadata,
        customer,
        bookingResult,
        isSubmitting,
        totalPrice,
        totalDurationMinutes,
        openBooking,
        closeBooking,
        goToStep,
        selectBarber,
        selectService,
        addService,
        removeService,
        toggleService,
        clearServices,
        selectDate,
        selectTime,
        updateCustomer,
        submitBooking,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

