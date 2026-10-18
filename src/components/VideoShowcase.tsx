"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, Calendar, ShieldCheck, Scissors, Sparkles, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/MotionSystem";

export function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section
      id="tour-video"
      className="relative w-full bg-[#080B09] text-[#FFFFFF] py-16 sm:py-24 border-t border-[#18231B] overflow-hidden scroll-mt-24"
    >
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#25C440]/[0.05] blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#25C440] bg-[#121E15] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.12)]">
              <Scissors className="w-3.5 h-3.5 text-[#25C440]" />
              <span>EXPERIÊNCIA CINEMATOGRÁFICA</span>
            </span>

            <h2 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#FFFFFF] leading-[1.08]">
              ASSISTA AO PADRÃO{" "}
              <span className="text-[#25C440] drop-shadow-[0_0_20px_rgba(37,196,64,0.35)]">
                LÉO NUNES
              </span>
            </h2>

            <p className="text-xs sm:text-base text-[#9EA9A1] max-w-xl mx-auto leading-relaxed">
              Sinta a atmosfera, a precisão e o cuidado em cada detalhe que transformaram nossa barbearia na maior referência de Pacajus.
            </p>
          </div>
        </ScrollReveal>

        {/* =========================================================================
            3D VIDEO FRAME COM EFEITO DE PERSPECTIVA ON SCROLL (.video) + BORDA ANIMADA
           ========================================================================= */}
        <div className="max-w-4xl mx-auto">
          <div
            className="video zeph-borda relative rounded-3xl overflow-hidden aspect-video bg-[#0D140F] border border-[#233527]/70 shadow-[0_20px_60px_rgba(0,0,0,0.8)] group cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {/* Poster / Imagem de Fundo Cinematográfica */}
            <Image
              src="/images/gallery-2.png"
              alt="Ambiente e atendimento na Léo Nunes Barbearia"
              fill
              priority
              className={`object-cover object-center transition-transform duration-700 ease-out ${
                isPlaying ? "scale-105 filter brightness-75" : "group-hover:scale-105"
              }`}
              sizes="(max-width: 1024px) 100vw, 900px"
            />

            {/* Overlay Gradiente Escuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B09]/95 via-[#080B09]/40 to-[#080B09]/20" />

            {/* Badges Flutuantes Superiores */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase text-[#25C440] bg-[#080B09]/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#25C440]/30 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#25C440] animate-pulse" />
                PACAJUS — CE • DESDE 2015
              </span>

              <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#CAD5CD] bg-[#080B09]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#25C440]" />
                100% Biossegurança
              </span>
            </div>

            {/* Central Play Button com Glow Verde Pulsante */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4 text-center">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_35px_rgba(37,196,64,0.4)] ${
                  isPlaying
                    ? "bg-[#25C440]/90 text-[#080B09] scale-95"
                    : "bg-[#25C440] text-[#080B09] group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(37,196,64,0.6)]"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                )}
              </div>

              <div className="mt-4 sm:mt-5">
                <h3 className="font-heading font-black text-base sm:text-xl text-[#FFFFFF] drop-shadow-md">
                  {isPlaying ? "Pausar Vídeo" : "Assistir Vídeo Institucional"}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#A8B6AC] mt-0.5">
                  Clique para conferir os cortes, ambiente e técnica
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#FFFFFF] bg-[#080B09]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10">
                  4K ULTRA HD
                </span>
                <span className="text-[11px] text-[#A6AEA8] hidden md:inline">
                  Visagismo • Barboterapia • Pontualidade
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="w-8 h-8 rounded-full bg-[#080B09]/80 backdrop-blur-sm border border-white/10 text-[#25C440] flex items-center justify-center hover:bg-[#142017] transition-colors"
                title={isMuted ? "Ativar som" : "Desativar som"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Destaques em linha abaixo do vídeo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="p-3.5 rounded-xl bg-[#0E1510] border border-[#1F2E22] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#25C440] shrink-0" />
              <span className="text-xs font-semibold text-[#CAD5CD]">
                Ambiente climatizado com café expresso
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0E1510] border border-[#1F2E22] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#25C440] shrink-0" />
              <span className="text-xs font-semibold text-[#CAD5CD]">
                Ferramentas esterilizadas e navalhas descartáveis
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0E1510] border border-[#1F2E22] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#25C440] shrink-0" />
              <span className="text-xs font-semibold text-[#CAD5CD]">
                Atendimento pontual com hora marcada
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
