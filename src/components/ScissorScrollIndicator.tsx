"use client";

import React, { useEffect, useState, useRef } from "react";

export function ScissorScrollIndicator() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCutting, setIsCutting] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const cutTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 100) {
            const currentProgress = Math.min(Math.max(currentScrollY / totalHeight, 0), 1);
            setProgress(currentProgress);
            setIsVisible(currentScrollY > 60);

            // Micro efeito sutil de corte apenas durante rolagem ativa
            if (Math.abs(currentScrollY - lastScrollY.current) > 3) {
              setIsCutting(true);
              if (cutTimeout.current) clearTimeout(cutTimeout.current);
              cutTimeout.current = setTimeout(() => {
                setIsCutting(false);
              }, 180);
            }
          } else {
            setIsVisible(false);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Checagem inicial
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (cutTimeout.current) clearTimeout(cutTimeout.current);
    };
  }, []);

  return (
    <>
      {/* =========================================================================
          1. INDICADOR DESKTOP / TABLET (Rail vertical refinado na lateral direita)
         ========================================================================= */}
      <div
        className={`hidden sm:flex fixed right-2.5 lg:right-3.5 top-1/2 -translate-y-1/2 z-40 flex-col items-center pointer-events-none transition-all duration-300 select-none ${
          isVisible ? "opacity-90 translate-x-0" : "opacity-0 translate-x-2"
        }`}
        aria-hidden="true"
      >
        {/* Container da Trilha Vertical (H = 260px) */}
        <div className="relative w-7 h-[260px] flex items-center justify-center">
          {/* Trilha de fundo suave */}
          <div className="w-[2px] h-full bg-[#1A251D]/80 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Preenchimento de progresso verde oficial */}
            <div
              className="w-full bg-gradient-to-b from-[#25C440] via-[#38E054] to-[#25C440] transition-all duration-75 rounded-full"
              style={{
                height: `${progress * 100}%`,
                boxShadow: "0 0 10px rgba(37,196,64,0.6)",
              }}
            />
          </div>

          {/* Marcadores de início e fim da trilha */}
          <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#1F2E23] border border-[#25C440]/30" />
          <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#1F2E23] border border-[#25C440]/30" />

          {/* Tesoura Deslizante Minimalista */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75 will-change-transform"
            style={{
              top: `${progress * (260 - 24)}px`,
            }}
          >
            <div
              className={`relative flex items-center justify-center transition-transform duration-150 ${
                isCutting ? "scale-110 -rotate-12" : "scale-100 rotate-0"
              }`}
            >
              {/* Glow sutil ao redor da tesoura */}
              <div className="absolute -inset-1 bg-[#25C440]/25 rounded-full blur-[4px] pointer-events-none" />

              {/* Ícone de Tesoura Vetorial Fino e Premium */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#25C440"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                {/* Lâmina 1 + Anel Superior */}
                <circle cx="6" cy="6" r="3" stroke="#25C440" fill="#0C150E" strokeWidth="1.8" />
                <path d="M8.12 8.12L12 12m0 0l7.88 7.88M12 12L20 4" />
                {/* Lâmina 2 + Anel Inferior */}
                <circle cx="6" cy="18" r="3" stroke="#25C440" fill="#0C150E" strokeWidth="1.8" />
                <path d="M8.12 15.88L12 12m0 0l3-3" />
                {/* Parafuso pivô central */}
                <circle cx="12" cy="12" r="1.2" fill="#E8EDE9" stroke="#080B09" strokeWidth="0.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. INDICADOR MOBILE (Barra superior ultraleve com Tesoura Cortante)
          Localizada no topo, abaixo do header seguro, sem cobrir CTAs nem botões
         ========================================================================= */}
      <div
        className={`sm:hidden fixed top-[60px] left-0 right-0 z-40 pointer-events-none transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {/* Linha de progresso no topo */}
        <div className="relative w-full h-[2px] bg-[#142017]/70 backdrop-blur-xs">
          {/* Preenchimento verde com brilho sutil */}
          <div
            className="h-full bg-gradient-to-r from-[#187528] via-[#25C440] to-[#42E55F] transition-all duration-75"
            style={{
              width: `${progress * 100}%`,
              boxShadow: "0 0 6px rgba(37, 196, 64, 0.7)",
            }}
          />

          {/* Tesoura que acompanha o corte horizontal da barra no mobile */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-75"
            style={{
              left: `${Math.min(Math.max(progress * 100, 2), 98)}%`,
            }}
          >
            <div
              className={`flex items-center justify-center transition-transform duration-150 ${
                isCutting ? "scale-110 rotate-12" : "scale-95 rotate-0"
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#25C440"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]"
              >
                <circle cx="6" cy="6" r="3" stroke="#25C440" fill="#080B09" strokeWidth="2" />
                <path d="M8.12 8.12L12 12m0 0l7.88 7.88M12 12L20 4" />
                <circle cx="6" cy="18" r="3" stroke="#25C440" fill="#080B09" strokeWidth="2" />
                <path d="M8.12 15.88L12 12m0 0l3-3" />
                <circle cx="12" cy="12" r="1.2" fill="#E8EDE9" stroke="#080B09" strokeWidth="0.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
