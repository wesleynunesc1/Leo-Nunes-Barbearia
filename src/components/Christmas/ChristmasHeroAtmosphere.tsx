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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(229,193,88,0.12),transparent_75%)]" />

      {/* Sutil brilho esmeralda & champanhe na borda superior */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/35 to-transparent" />

      {/* Micro-pontos de luz festivos minimalistas e elegantes no topo */}
      <div className="max-w-6xl mx-auto px-6 h-6 flex justify-around items-center opacity-70">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F3E5AB] shadow-[0_0_8px_rgba(243,229,171,0.8)] animate-pulse" style={{ animationDuration: "3.5s" }} />
        <span className="w-1 h-1 rounded-full bg-[#E5C158] shadow-[0_0_6px_rgba(229,193,88,0.7)] animate-pulse" style={{ animationDuration: "4.2s", animationDelay: "1s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#25C440] shadow-[0_0_8px_rgba(37,196,64,0.7)] animate-pulse" style={{ animationDuration: "3.8s", animationDelay: "0.5s" }} />
        <span className="w-1 h-1 rounded-full bg-[#F3E5AB] shadow-[0_0_6px_rgba(243,229,171,0.8)] animate-pulse" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#E5C158] shadow-[0_0_8px_rgba(229,193,88,0.8)] animate-pulse" style={{ animationDuration: "3.2s", animationDelay: "0.8s" }} />
      </div>
    </div>
  );
}

