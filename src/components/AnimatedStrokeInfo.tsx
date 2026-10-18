"use client";

import React, { useState, useEffect } from "react";
import { Scissors } from "lucide-react";

interface AnimatedStrokeInfoProps {
  className?: string;
}

const INFO_STATEMENTS = [
  "CORTES DE PRECISÃO & FADE DEGRADÊ",
  "BARBOTERAPIA COM TOALHA QUENTE",
  "VISAGISMO & DESIGN EXCLUSIVO",
  "ATENDIMENTO 100% PONTUAL",
  "PACAJUS — CE • DESDE 2015",
];

export function AnimatedStrokeInfo({ className = "" }: AnimatedStrokeInfoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    // Cicla para a próxima informação a cada 5 segundos (sincronizado com a animação de 5s)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INFO_STATEMENTS.length);
      setFadeKey((k) => k + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentText = INFO_STATEMENTS[currentIndex];

  return (
    <div className={`inline-block ${className}`}>
      <div className="stroke-text-container group" title="Léo Nunes Barbearia - Diferenciais Oficiais">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Scissors className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#25C440] shrink-0" />
          <span
            key={fadeKey}
            className="stroke-text-title text-[11px] xs:text-xs sm:text-sm"
            data-text={currentText}
          >
            {currentText}
          </span>
        </div>
      </div>
    </div>
  );
}
