"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { BookingModal } from "@/components/BookingModal/BookingModal";
import { BookingAuthModal } from "@/components/BookingModal/BookingAuthModal";
import { ChatbotWidget } from "@/components/Chatbot";
import { ChristmasAudioManager } from "@/components/Christmas/ChristmasAudioManager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BookingProvider>
        {children}
        <BookingModal />
        <BookingAuthModal />
        <ChatbotWidget />
        <ChristmasAudioManager />
      </BookingProvider>
    </AuthProvider>
  );
}
