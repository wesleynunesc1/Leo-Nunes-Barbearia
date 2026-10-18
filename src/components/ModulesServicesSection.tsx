"use client";

import React from "react";
import Link from "next/link";
import {
  Scissors,
  Flame,
  Crown,
  Eye,
  Droplets,
  Brush,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import { ScrollReveal } from "@/components/MotionSystem";

interface ServiceModule {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  badge: string;
  icon: React.ElementType;
}

const SERVICE_MODULES: ServiceModule[] = [
  {
    id: "corte-precisao",
    title: "Cortes de Precisão & Fade",
    description:
      "Degradês milimétricos (Low, Mid, High Fade), Scissor Cut na tesoura e cortes clássicos executados com visagismo anatômico para harmonizar com seu formato de rosto.",
    highlights: ["Fade em alta definição", "Corte na tesoura", "Acabamento navalhado"],
    badge: "Geral & Léo Nunes",
    icon: Scissors,
  },
  {
    id: "barboterapia",
    title: "Barboterapia & Toalha Quente",
    description:
      "Desenho simétrico da barba com lâmina descartável estéril, toalha quente vaporizada para dilatação dos poros, esfoliação suave e hidratação com óleos nobres.",
    highlights: ["Toalha quente aromática", "Alívio contra foliculite", "Massagem facial"],
    badge: "Relaxamento Total",
    icon: Flame,
  },
  {
    id: "combo-completo",
    title: "Cabelo + Barba + Sobrancelha",
    description:
      "A assinatura mais requisitada da barbearia. Uma experiência completa de alinhamento facial integral que renova sua presença em uma única sessão.",
    highlights: ["Harmonização completa", "Mais procurado da casa", "Padrão de excelência"],
    badge: "Mais Escolhido",
    icon: Crown,
  },
  {
    id: "sobrancelhas",
    title: "Design de Sobrancelhas",
    description:
      "Alinhamento cirúrgico dos fios na navalha ou pinça, respeitando o arco natural e a estrutura óssea do seu olhar sem perder a identidade masculina.",
    highlights: ["Design limpo e natural", "Simetria anatômica", "Expressão marcante"],
    badge: "Acabamento Fino",
    icon: Eye,
  },
  {
    id: "tratamentos",
    title: "Hidratação & Botox Capilar",
    description:
      "Nutrição profunda da raiz às pontas, alinhamento de fios rebeldes e revitalização do couro cabeludo com produtos profissionais de alta performance.",
    highlights: ["Brilho e maciez", "Controle de volume", "Proteção térmica"],
    badge: "Saúde dos Fios",
    icon: Droplets,
  },
  {
    id: "quimica-estilo",
    title: "Platinado & Química Masculina",
    description:
      "Descoloração técnica segura para platinados uniformes, reflexos, luzes e matização com reconstrução capilar integrada para preservar a estrutura do fio.",
    highlights: ["Platinado global", "Reflexos & luzes", "Tratamento pós-química"],
    badge: "Técnica Avançada",
    icon: Brush,
  },
];

export function ModulesServicesSection() {
  return (
    <section
      id="servicos"
      className="relative w-full bg-[#080B09] text-[#FFFFFF] py-16 sm:py-28 overflow-hidden scroll-mt-24 border-t border-[#18221B]"
    >
      {/* Background Lighting FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#25C440]/[0.04] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-0 w-[500px] h-[400px] bg-[#25C440]/[0.03] blur-[120px] pointer-events-none rounded-full" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #25C440 1px, transparent 1px), linear-gradient(to bottom, #25C440 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            HEADER DE SERVIÇOS (Espaçamento nobre e respeitável)
           ========================================================================= */}
        <ScrollReveal>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            {/* Tag nobre acima da seção */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
              SERVIÇOS DE ELITE
            </span>

            {/* Headline com txt-degrade */}
            <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-[#FFFFFF] leading-[1.08] max-w-3xl mb-3 sm:mb-4">
              O que você vai{" "}
              <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                vivenciar
              </span>
            </h2>

            {/* Subtitle Helvetica / Inter */}
            <p className="text-xs sm:text-base text-[#9BA59E] max-w-[580px] font-normal leading-relaxed mx-auto">
              Atendimento estruturado do clássico ao contemporâneo com visagismo anatômico e produtos profissionais de alta performance.
            </p>
          </div>
        </ScrollReveal>

        {/* =========================================================================
            CONTAINER: Grid de Serviços (Largura: 1220px) com Efeito Foco Interativo
           ========================================================================= */}
        <div className="max-w-[1220px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 focus-cards-group">
            {SERVICE_MODULES.map((module, idx) => {
              const IconComp = module.icon;
              return (
                <ScrollReveal key={module.id} delay={idx * 80}>
                  <div className="focus-card group relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#0F1611]/90 to-[#0A0E0B]/95 border border-[#1D2B20] hover:border-[#25C440]/60 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(37,196,64,0.12)]">
                    {/* Glowing Top Edge Accent on hover */}
                    <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#25C440]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div>

                      {/* Icon + Title */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#142017] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-all duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(37,196,64,0.15)]">
                          <IconComp className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-snug">
                            {module.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#A2ADA5] leading-relaxed mb-4">
                        {module.description}
                      </p>

                      {/* Highlights Pill Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {module.highlights.map((hl, i) => (
                          <span
                            key={i}
                            className="text-[11px] text-[#C2CDC5] bg-[#121A14] border border-[#1E2C21] px-2.5 py-0.5 rounded-md"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-4 border-t border-[#18241B] flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium text-[#25C440] bg-[#25C440]/10 border border-[#25C440]/25 px-2.5 py-1 rounded">
                        {module.badge}
                      </span>

                      <Link
                        href="/agendar"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors"
                      >
                        <span>Agendar</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Real-time Schedule Callout Box */}
          <ScrollReveal delay={250}>
            <div className="mt-8 sm:mt-12 rounded-2xl p-6 sm:p-8 bg-[#0D1510] border border-[#203124] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#25C440]/10 blur-[80px] pointer-events-none rounded-full" />

              <div className="space-y-1.5 text-center sm:text-left relative z-10">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-[#25C440] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>DISPONIBILIDADE EM TEMPO REAL</span>
                </div>
                <h4 className="font-heading text-lg sm:text-xl font-bold text-[#FFFFFF]">
                  Consulte os horários e valores com cada profissional
                </h4>
                <p className="text-xs sm:text-sm text-[#8E9B91] max-w-xl">
                  Escolha entre Léo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira e visualize a agenda completa online.
                </p>
              </div>

              <Link
                href="/agendar"
                className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.35)] hover:shadow-[0_0_30px_rgba(37,196,64,0.5)] transition-all duration-300 shrink-0 group active:scale-95"
              >
                <Calendar className="w-4 h-4 stroke-[2.2]" />
                <span>Escolher Barbeiro</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
