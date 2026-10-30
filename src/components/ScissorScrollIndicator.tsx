"use client";

import React, { useEffect, useState } from "react";

export function ScissorScrollIndicator() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const calculateScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;

      if (totalScrollable > 50) {
        const currentProgress = Math.min(Math.max(scrollY / totalScrollable, 0), 1);
        setProgress(currentProgress);
        setIsVisible(scrollY > 20);
      } else {
        setIsVisible(false);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Verificação inicial imediata
    calculateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso da página com indicador de tesoura"
      className={`fixed top-1/2 -translate-y-1/2 z-[48] flex flex-col items-center pointer-events-none select-none transition-opacity duration-300
        /* Desktop: trilha elegante à direita */
        right-2 sm:right-3 lg:right-4
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* Container da Trilha Vertical (H = 190px mobile, 250px desktop) */}
      <div className="relative w-7 h-[190px] sm:h-[250px] flex items-center justify-center">
        {/* Trilho de fundo escuro premium */}
        <div className="w-[2px] h-full bg-[#152018]/90 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Preenchimento verde com gradiente de alta precisão */}
          <div
            className="w-full bg-gradient-to-b from-[#25C440] via-[#3FE85D] to-[#25C440] rounded-full transition-all duration-75"
            style={{
              height: `${progress * 100}%`,
              boxShadow: "0 0 8px rgba(37,196,64,0.75)",
            }}
          />
        </div>

        {/* Marcadores discretos de início e fim */}
        <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#18261C] border border-[#25C440]/40" />
        <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#18261C] border border-[#25C440]/40" />

        {/* 
          Tesoura Deslizante Minimalista:
          - Apontando estritamente para CIMA (lâminas abertas em direção ao topo)
          - Sem rotação dinâmica durante rolagem
          - Posição perfeitamente sincronizada com o progresso do scroll
        */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75 will-change-transform flex items-center justify-center"
          style={{
            top: `calc(${progress} * (100% - 22px))`,
          }}
        >
          {/* Glow e container da tesoura apontada para CIMA */}
          <div className="relative flex items-center justify-center">
            {/* Glow verde sutil */}
            <div className="absolute -inset-1.5 bg-[#25C440]/25 rounded-full blur-[4px] pointer-events-none" />

            {/* Ícone de Tesoura Vetorial (Lâminas para CIMA, anéis embaixo) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#25C440"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
              style={{
                transform: "rotate(-45deg)", // Aponta as pontas afiadas exatamente para o TOPO (0 graus vertical)
              }}
            >
              {/* Anel Inferior Esquerdo */}
              <circle cx="6" cy="18" r="3" stroke="#25C440" fill="#0C150E" strokeWidth="1.8" />
              {/* Lâmina que cruza em direção ao topo direito */}
              <path d="M8.12 15.88L12 12m0 0L20 4" />
              {/* Anel Inferior Direito */}
              <circle cx="18" cy="18" r="3" stroke="#25C440" fill="#0C150E" strokeWidth="1.8" />
              {/* Lâmina que cruza em direção ao topo esquerdo */}
              <path d="M15.88 15.88L12 12m0 0L4 4" />
              {/* Parafuso pivô central refinado */}
              <circle cx="12" cy="12" r="1.3" fill="#FFFFFF" stroke="#080B09" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
