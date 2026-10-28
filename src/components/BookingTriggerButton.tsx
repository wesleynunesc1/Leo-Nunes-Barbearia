"use client";

import React from "react";
import { useBooking } from "@/context/BookingContext";

interface BookingTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  barberSlug?: string;
  barberId?: string;
  serviceId?: string;
  children: React.ReactNode;
}

export function BookingTriggerButton({
  barberSlug,
  barberId,
  serviceId,
  children,
  className,
  id,
  ...props
}: BookingTriggerButtonProps) {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      id={id}
      onClick={() => openBooking({ barberSlug, barberId, serviceId })}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
