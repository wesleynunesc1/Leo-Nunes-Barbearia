"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton() {
  return (
    <aside aria-label="Suporte rápido via WhatsApp" className="fixed bottom-6 right-6 z-40">
      <a
        href="https://wa.me/5585992227064?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20a%20L%C3%A9o%20Nunes%20Barbearia."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar conosco via WhatsApp"
        className="group flex items-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-[#25C440]/30 hover:shadow-[#25C440]/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25C440] focus:ring-offset-[#080B09]"
      >
        <MessageCircle className="w-5 h-5 fill-current shrink-0" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide uppercase">
          Fale Conosco
        </span>
      </a>
    </aside>
  );
}
