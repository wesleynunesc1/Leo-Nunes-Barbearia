import React from "react";
import Image from "next/image";

interface ChristmasHeroHeadlineProps {
  badge: string;
  subheadline: string;
}

export function ChristmasHeroHeadline({
  badge,
  subheadline,
}: ChristmasHeroHeadlineProps) {
  return (
    <>
      {/* Identificador Superior Limpo — Versão Fim de Ano */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 sm:w-8 h-[2px] bg-[#25C440]" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-[#25C440] flex items-center gap-1.5">
          <span>{badge}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5C158] animate-pulse" />
        </span>
      </div>

      {/* Headline Natalina com Gorro de Natal ancorado responsivamente à letra 'O' de 'O ANO' */}
      <h1 className="font-heading font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[58px] xl:text-[66px] tracking-tight uppercase leading-[0.98] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
        <span className="text-[#FFFFFF] block">
          {/* Letra 'O' com Gorro Natalino Ancorado */}
          <span className="relative inline-block">
            O
            <img
              src="/images/christmas/gorro_natal_trimmed.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.75)] z-20"
              style={{
                width: "1.32em",
                maxWidth: "none",
                top: "calc(-0.33em - 3px)",
                left: "calc(-0.09em - 25px)",
                transform: "rotate(5deg)",
                transformOrigin: "center bottom",
              }}
            />
          </span>
          {" ANO TERMINA."}
        </span>
        <span className="text-[#25C440] block mt-1 sm:mt-1.5">
          SEU ESTILO NÃO.
        </span>
      </h1>

      {/* Subtitle Paragraph calibrado com contraste elevado */}
      <p className="text-xs sm:text-base text-[#D4DDD6] max-w-lg leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
        {subheadline}
      </p>
    </>
  );
}

