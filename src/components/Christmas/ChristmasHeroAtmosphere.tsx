import React from "react";

/**
 * Detalhes Festivos Discretos - Campanha Fim de Ano
 * Adiciona iluminação suave champanhe/dourada no topo da Hero
 * e micro-brilhos pontuais de alta performance (sem 3D, sem animações pesadas de neve).
 */
export function ChristmasHeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* Halo de luz suave champanhe no topo central */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(229,193,88,0.08),transparent_75%)]" />

      {/* Sutil brilho esmeralda & champanhe na borda superior */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/25 to-transparent" />
    </div>
  );
}

