"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { BookingModal } from "@/components/BookingModal/BookingModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BookingProvider>
        {children}
        <BookingModal />
      </BookingProvider>
    </AuthProvider>
  );
}
