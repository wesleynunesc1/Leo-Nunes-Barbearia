import React from "react";
import Link from "next/link";
import { Scissors, ArrowLeft, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="editorial-card rounded-2xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 border border-[#202A22]">
        <div className="w-16 h-16 rounded-2xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] mx-auto">
          <Scissors className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-[#25C440]">
            Erro 404
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-[#F5F7F3]">
            Página Não Encontrada
          </h1>
          <p className="text-sm text-[#9BA59E] leading-relaxed">
            O link que você tentou acessar não existe ou foi movido.
            Você pode retornar à página inicial ou ir direto para o agendamento de horários.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#121813] hover:bg-[#18221A] text-[#F5F7F3] font-semibold text-sm py-3 px-4 rounded-xl border border-[#202A22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página Inicial</span>
          </Link>

          <Link
            href="/agendar"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-sm py-3 px-4 rounded-xl btn-green-glow transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Horário</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
