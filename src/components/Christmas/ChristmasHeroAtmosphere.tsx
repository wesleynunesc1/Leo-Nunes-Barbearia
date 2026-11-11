"use client";

import React from "react";

/**
 * Detalhes Festivos Discretos - Campanha Fim de Ano
 * - Ramos de pinheiro discretos nos cantos superiores da Hero
 * - Pequenas luzes douradas com brilho suave e sutil
 * - Decoração natalina sutil no lado direito
 * - Identidade preta e verde preservada, alta performance (vetorial SVG, sem 3D, leve no mobile)
 */

function CornerPineSprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Filtro de brilho suave dourado para as luzes */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradiente sutil da haste principal */}
        <linearGradient id="stemGrad" x1="0" y1="0" x2="300" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B281E" />
          <stop offset="60%" stopColor="#28382B" />
          <stop offset="100%" stopColor="#162218" />
        </linearGradient>
      </defs>

      {/* ================= HASTES PRINCIPAIS DO PINHEIRO ================= */}
      <path
        d="M-10,-10 C45,25 120,40 185,25 C240,12 285,-5 320,-8"
        stroke="url(#stemGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M35,18 C70,60 135,100 215,95 C265,92 295,70 310,55"
        stroke="url(#stemGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M95,78 C125,130 170,175 240,185 C275,190 300,175 315,160"
        stroke="url(#stemGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M20,6 C15,55 35,115 70,165 C95,200 125,225 150,235"
        stroke="url(#stemGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* ================= TUFOS DE AGULHAS DE PINHEIRO ================= */}
      {/* Camada Profunda (Verde Escuro Floresta #0D1C12) */}
      <g stroke="#0D1C12" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
        {/* Tufo 1 - Canto superior */}
        <path d="M5,-2 L25,18 M15,-5 L38,12 M28,-8 L50,8 M38,-2 L65,16 M52,2 L78,22" />
        {/* Tufo 2 - Ramo central */}
        <path d="M70,22 L92,48 M85,26 L110,46 M100,28 L128,42 M115,26 L145,36 M130,22 L162,28" />
        {/* Tufo 3 - Ponta direita */}
        <path d="M170,20 L202,32 M190,18 L225,26 M210,14 L248,18 M235,8 L272,10 M260,2 L298,4" />
        {/* Tufo 4 - Ramo intermediário */}
        <path d="M60,42 L80,82 M82,58 L108,92 M105,72 L135,100 M130,82 L165,102 M158,88 L195,102" />
        {/* Tufo 5 - Ramo inferior */}
        <path d="M120,110 L145,152 M145,128 L175,165 M172,145 L208,175 M200,162 L238,185" />
        {/* Tufo 6 - Ramo vertical descendo */}
        <path d="M22,35 L48,55 M24,65 L56,82 M32,95 L68,112 M45,125 L82,140 M62,155 L98,170" />
      </g>

      {/* Camada Intermediária (Verde Musgo / Esmeralda Escuro #163821) */}
      <g stroke="#163821" strokeWidth="1.8" strokeLinecap="round" opacity="0.9">
        <path d="M10,-4 L28,12 M20,-3 L42,9 M32,-4 L55,4 M42,4 L68,12 M55,6 L80,18" />
        <path d="M75,20 L95,42 M90,22 L112,38 M105,24 L130,34 M120,22 L148,30 M138,18 L165,22" />
        <path d="M175,16 L205,24 M195,14 L228,18 M218,10 L250,12 M240,5 L275,6 M265,-1 L300,0" />
        <path d="M65,46 L82,78 M88,62 L112,88 M112,74 L138,94 M138,84 L168,96 M165,88 L198,96" />
        <path d="M128,114 L150,146 M152,132 L178,158 M180,148 L212,170 M208,164 L242,178" />
        <path d="M25,40 L46,58 M28,70 L54,86 M36,100 L66,116 M50,130 L80,144 M68,160 L96,174" />
      </g>

      {/* Camada de Destaque (Verde Vibrante da Identidade #235431 com toques sutis de dourado) */}
      <g stroke="#235431" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        <path d="M15,-1 L30,10 M25,0 L45,8 M38,0 L58,3 M48,7 L70,11" />
        <path d="M80,24 L98,40 M96,25 L115,36 M110,26 L132,32 M126,23 L150,28" />
        <path d="M180,18 L206,22 M200,15 L230,17 M222,11 L252,11 M245,6 L278,5" />
        <path d="M70,50 L85,74 M92,66 L114,84 M118,76 L140,92 M142,86 L170,94" />
        <path d="M132,118 L152,142 M158,135 L180,154 M184,150 L214,166" />
        <path d="M30,45 L48,60 M32,74 L55,88 M40,104 L68,118 M54,134 L82,146" />
      </g>

      {/* Pedaços sutis de pinha / nó natural na base das ramificações */}
      <g fill="#4A3824" opacity="0.75">
        <ellipse cx="68" cy="38" rx="4" ry="6" transform="rotate(25 68 38)" />
        <ellipse cx="128" cy="74" rx="3.5" ry="5.5" transform="rotate(35 128 74)" />
        <ellipse cx="168" cy="85" rx="3" ry="5" transform="rotate(-15 168 85)" />
      </g>

      {/* ================= MICRO-LUZES DOURADAS (FAIRY LIGHTS) ================= */}
      {/* Luz 1 - Canto superior */}
      <g filter="url(#softGlow)">
        <circle cx="58" cy="14" r="5" fill="#FFEAA0" fillOpacity="0.3" />
        <circle cx="58" cy="14" r="2.8" fill="#FCE588" fillOpacity="0.85" />
        <circle cx="58" cy="14" r="1.4" fill="#FFFFFF" />
      </g>

      {/* Luz 2 - Ramo médio superior */}
      <g filter="url(#softGlow)">
        <circle cx="148" cy="24" r="6" fill="#FFEAA0" fillOpacity="0.25" />
        <circle cx="148" cy="24" r="3.2" fill="#FCE588" fillOpacity="0.9" />
        <circle cx="148" cy="24" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Luz 3 - Ponta direita */}
      <g filter="url(#softGlow)">
        <circle cx="258" cy="12" r="5" fill="#FFEAA0" fillOpacity="0.3" />
        <circle cx="258" cy="12" r="2.8" fill="#F5D77F" fillOpacity="0.85" />
        <circle cx="258" cy="12" r="1.3" fill="#FFFFFF" />
      </g>

      {/* Luz 4 - Ramo intermediário */}
      <g filter="url(#softGlow)">
        <circle cx="112" cy="78" r="5.5" fill="#FFEAA0" fillOpacity="0.25" />
        <circle cx="112" cy="78" r="3" fill="#FCE588" fillOpacity="0.85" />
        <circle cx="112" cy="78" r="1.4" fill="#FFFFFF" />
      </g>

      {/* Luz 5 - Ramo inferior */}
      <g filter="url(#softGlow)">
        <circle cx="198" cy="160" r="5" fill="#FFEAA0" fillOpacity="0.3" />
        <circle cx="198" cy="160" r="2.6" fill="#F5D77F" fillOpacity="0.85" />
        <circle cx="198" cy="160" r="1.2" fill="#FFFFFF" />
      </g>

      {/* Luz 6 - Haste descendente */}
      <g filter="url(#softGlow)">
        <circle cx="48" cy="115" r="4.5" fill="#FFEAA0" fillOpacity="0.25" />
        <circle cx="48" cy="115" r="2.5" fill="#FCE588" fillOpacity="0.8" />
        <circle cx="48" cy="115" r="1.1" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/**
 * Decoração Natalina Sutil da Lateral Direita
 * Cascata de pinheiro e micro-luzes com um discreto elemento dourado
 */
function RightFestiveDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 160 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <filter id="rightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Haste sinuosa vertical discreta */}
        <path
          d="M170,0 C140,50 110,120 125,180 C140,240 100,290 80,350"
          stroke="#1E2E21"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Agulhas de pinheiro elegantes para a lateral */}
        <g stroke="#102517" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <path d="M150,30 L115,48 M140,65 L105,78 M130,105 L92,118 M122,145 L85,155 M125,190 L90,205 M135,225 L102,238 M115,265 L80,278 M95,305 L65,318" />
        </g>
        <g stroke="#1E4429" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
          <path d="M145,35 L120,48 M135,70 L110,80 M125,110 L98,120 M118,150 L92,158 M120,195 L95,208 M130,230 L108,240 M110,270 L85,280 M90,310 L70,320" />
        </g>
        <g stroke="#2C633B" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
          <path d="M142,38 L124,47 M132,73 L114,81 M122,113 L104,121 M115,153 L96,159 M118,198 L100,209 M126,233 L112,241" />
        </g>

        {/* Micro-luzes douradas ao longo da lateral */}
        <g filter="url(#rightGlow)">
          <circle cx="118" cy="85" r="4.5" fill="#FFEAA0" fillOpacity="0.25" />
          <circle cx="118" cy="85" r="2.5" fill="#FCE588" fillOpacity="0.85" />
          <circle cx="118" cy="85" r="1.1" fill="#FFFFFF" />
        </g>
        <g filter="url(#rightGlow)">
          <circle cx="102" cy="185" r="5" fill="#FFEAA0" fillOpacity="0.25" />
          <circle cx="102" cy="185" r="2.7" fill="#F5D77F" fillOpacity="0.9" />
          <circle cx="102" cy="185" r="1.2" fill="#FFFFFF" />
        </g>
        <g filter="url(#rightGlow)">
          <circle cx="88" cy="285" r="4.5" fill="#FFEAA0" fillOpacity="0.25" />
          <circle cx="88" cy="285" r="2.4" fill="#FCE588" fillOpacity="0.85" />
          <circle cx="88" cy="285" r="1" fill="#FFFFFF" />
        </g>

        {/* Estrela/Ponto dourado sutil no terminal inferior */}
        <g filter="url(#rightGlow)">
          <path
            d="M80,345 L82,349 L86,350 L82,351 L80,355 L78,351 L74,350 L78,349 Z"
            fill="#FCE588"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}

export function ChristmasHeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* Halo de luz suave champanhe no topo central */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(229,193,88,0.07),transparent_75%)]" />

      {/* Sutil brilho esmeralda & champanhe na borda superior */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/25 to-transparent" />

      {/* ================= RAMOS DE PINHEIRO NOS CANTOS SUPERIORES ================= */}
      {/* Canto Superior Direito (espelhado horizontalmente) */}
      <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-44 xs:w-52 sm:w-64 md:w-80 lg:w-96 max-w-[55vw] opacity-85 sm:opacity-90 select-none -scale-x-100">
        <CornerPineSprig className="w-full h-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]" />
      </div>

      {/* ================= DECORAÇÃO NATALINA SUTIL NO LADO DIREITO ================= */}
      <div className="hidden lg:block absolute top-1/4 right-0 w-28 xl:w-36 opacity-75 xl:opacity-85 select-none pointer-events-none">
        <RightFestiveDecoration />
      </div>
    </div>
  );
}
