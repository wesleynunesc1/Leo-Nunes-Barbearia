"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Barber, BarberService, getAllBarbers, getBarberBySlug, getBarberById } from "@/data/barbers";
import { BookingCustomer, BookingCreateResponse } from "@/types/booking";

interface OpenBookingOptions {
  barberSlug?: string;
  barberId?: string;
  serviceId?: string;
}

interface BookingContextType {
  isModalOpen: boolean;
  step: 1 | 2 | 3 | 4 | 5;
  selectedBarber: Barber | null;
  selectedService: BarberService | null;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm
  customer: BookingCustomer;
  bookingResult: BookingCreateResponse | null;
  isSubmitting: boolean;

  openBooking: (options?: OpenBookingOptions) => void;
  closeBooking: () => void;
  goToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  selectBarber: (barber: Barber) => void;
  selectService: (service: BarberService) => void;
  selectDate: (dateStr: string) => void;
  selectTime: (timeStr: string) => void;
  updateCustomer: (customerData: Partial<BookingCustomer>) => void;
  submitBooking: () => Promise<BookingCreateResponse | null>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customer, setCustomer] = useState<BookingCustomer>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [bookingResult, setBookingResult] = useState<BookingCreateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetBooking = useCallback(() => {
    setStep(1);
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
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

        if (options.serviceId) {
          const service = barber.services.find((s) => s.id === options.serviceId);
          if (service) {
            setSelectedService(service);
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
    // Se o serviço anterior não pertencer ao novo barbeiro, limpa
    setSelectedService((prev) => (prev && barber.services.some((s) => s.id === prev.id) ? prev : null));
    setStep(2);
  }, []);

  const selectService = useCallback((service: BarberService) => {
    setSelectedService(service);
    setStep(3);
  }, []);

  const selectDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(""); // Limpa horário ao trocar de data
    setStep(4);
  }, []);

  const selectTime = useCallback((timeStr: string) => {
    setSelectedTime(timeStr);
    setStep(5);
  }, []);

  const updateCustomer = useCallback((customerData: Partial<BookingCustomer>) => {
    setCustomer((prev) => ({ ...prev, ...customerData }));
  }, []);

  const submitBooking = useCallback(async (): Promise<BookingCreateResponse | null> => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      return null;
    }
    if (isSubmitting) {
      return null;
    }

    setIsSubmitting(true);
    setBookingResult(null);

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarber.id,
          barberSlug: selectedBarber.slug,
          barberName: selectedBarber.name,
          serviceId: selectedService.wixServiceId || selectedService.id,
          serviceName: selectedService.name,
          servicePrice: selectedService.price,
          serviceDuration: selectedService.durationMinutes,
          date: selectedDate,
          time: selectedTime,
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
        directWixUrl: selectedService.bookingUrl,
      };
      setBookingResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBarber, selectedService, selectedDate, selectedTime, customer, isSubmitting]);

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
        selectedDate,
        selectedTime,
        customer,
        bookingResult,
        isSubmitting,
        openBooking,
        closeBooking,
        goToStep,
        selectBarber,
        selectService,
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
