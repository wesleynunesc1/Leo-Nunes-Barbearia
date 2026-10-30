import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Award,
  Flame,
  ExternalLink,
  Users,
} from "lucide-react";
import { getDynamicBarbers, getDynamicInstitutional } from "@/lib/wixDynamicSync";
import { TeamCarousel } from "@/components/TeamCarousel";
import { ModulesServicesSection } from "@/components/ModulesServicesSection";
import { ThreeDScrollTrigger } from "@/components/ThreeDScrollTrigger";
import {
  ScrollReveal,
  SpotlightCard,
  PointerAura,
} from "@/components/MotionSystem";
import { BookingTriggerButton } from "@/components/BookingTriggerButton";
import { HeroVideo } from "@/components/HeroVideo";

export default async function HomePage() {
  const [barbers, institutional] = await Promise.all([
    getDynamicBarbers(),
    getDynamicInstitutional(),
  ]);

  return (
    <div className="pb-16 sm:pb-24 overflow-x-hidden" id="inicio">
      {/* GSAP ScrollTrigger 3D Perspective Controller */}
      <ThreeDScrollTrigger />

      {/* =========================================================================
          HERO SECTION (Header transparente no topo, texto reposicionado no mobile)
         ========================================================================= */}
      <section className="relative min-h-[82vh] xs:min-h-[86vh] sm:min-h-[68vh] lg:min-h-[70vh] flex flex-col justify-between pt-20 sm:pt-18 lg:pt-20 pb-0 overflow-hidden bg-[#080B09]">
        {/* Subtle Ambient Mouse Tracking Glow */}
        <PointerAura />

        {/* Hero Video Background - Execução contínua ininterrupta (Desktop e Mobile) */}
        <HeroVideo />

        {/* Main Content Area (Left Column Content + Right Floating Tag) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 sm:pt-12 lg:pt-12 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content (Columns 1-8) - Reposicionado 75px mais para baixo no mobile */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-3.5 text-left pt-16 xs:pt-20 sm:pt-0">
              {/* Identificador Superior Limpo */}
              <div className="flex items-center gap-2.5">
                <div className="w-6 sm:w-8 h-[2px] bg-[#25C440]" aria-hidden="true" />
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-[#25C440]">
                  {institutional.hero.badge}
                </span>
              </div>

              {/* Headline nítida com sombra cinematográfica para contraste perfeito sobre a imagem */}
              <h1 className="font-heading font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[58px] xl:text-[66px] tracking-tight uppercase leading-[0.98] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                <span className="text-[#FFFFFF] block">
                  {institutional.hero.headlineLine1}
                </span>
                <span className="text-[#25C440] block mt-1 sm:mt-1.5">
                  {institutional.hero.headlineLine2}
                </span>
              </h1>

              {/* Subtitle Paragraph calibrado com contraste elevado */}
              <p className="text-xs sm:text-base text-[#D4DDD6] max-w-lg leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
                {institutional.hero.subheadline}
              </p>

              {/* Action Buttons Row - 100% responsivo para toque no mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
                {/* Primary CTA */}
                <BookingTriggerButton
                  id="hero-cta-agendar"
                  className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-xl shadow-[0_0_25px_rgba(37,196,64,0.35)] hover:shadow-[0_0_35px_rgba(37,196,64,0.5)] transition-all duration-300 transform active:scale-95 group cursor-pointer"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.2]" />
                  <span>Agendar meu horário</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5" />
                </BookingTriggerButton>

                {/* Secondary CTA */}
                <a
                  href="#servicos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0E1510]/90 hover:bg-[#152018] text-[#F5F7F3] font-semibold text-sm sm:text-base px-6 py-3.5 sm:py-4 rounded-xl border border-[#253328] hover:border-[#25C440]/50 transition-all duration-300 group backdrop-blur-sm"
                >
                  <span>Conhecer serviços</span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#9BA59E] group-hover:text-[#FFFFFF] group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>

            {/* Right Column: Floating Vertical Editorial Text */}
            <div className="hidden xl:flex lg:col-span-4 justify-end items-center pointer-events-none select-none pr-4">
              <div className="flex flex-col items-end space-y-2.5">
                <p className="font-heading text-[10px] sm:text-[11px] tracking-[0.24em] font-bold text-[#8E9891]/80 leading-snug uppercase text-right">
                  MAIS<br />
                  QUE<br />
                  UM<br />
                  CORTE,<br />
                  CONFIANÇA.
                </p>
                <div className="w-5 h-[2px] bg-[#25C440]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            INFINITE CONTINUOUS MARQUEE TICKER (Carrossel Contínuo de Destaques)
           ===================================================================== */}
        <div className="relative z-20 w-full border-t border-[#1D2720]/90 bg-[#080B09]/95 backdrop-blur-md py-3 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Set 1 */}
              {[
                {
                  icon: Clock,
                  title: "Atendimento com hora marcada",
                  subtitle: "Seu tempo é valioso",
                },
                {
                  icon: Users,
                  title: "4 barbeiros especialistas",
                  subtitle: "Experiência e técnica",
                },
                {
                  icon: Scissors,
                  title: "Produtos profissionais",
                  subtitle: "Resultado superior",
                },
                {
                  icon: CheckCircle2,
                  title: "Visagismo exclusivo",
                  subtitle: "Alinhado ao seu rosto",
                },
                {
                  icon: Flame,
                  title: "Barboterapia completa",
                  subtitle: "Toalha quente & relaxamento",
                },
                {
                  icon: MapPin,
                  title: "Pacajus — Ceará",
                  subtitle: "Referência desde 2015",
                },
                {
                  icon: Calendar,
                  title: "Agendamento online 24h",
                  subtitle: "Sem filas de espera",
                },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={`m1-${idx}`} className="marquee-item group cursor-default">
                    <div className="w-8 h-8 rounded-lg bg-[#142016] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-colors">
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <p className="font-heading font-bold text-xs sm:text-sm text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#8E9B91] font-light leading-tight mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Set 2 (Duplicado para loop infinito sem emenda) */}
              {[
                {
                  icon: Clock,
                  title: "Atendimento com hora marcada",
                  subtitle: "Seu tempo é valioso",
                },
                {
                  icon: Users,
                  title: "4 barbeiros especialistas",
                  subtitle: "Experiência e técnica",
                },
                {
                  icon: Scissors,
                  title: "Produtos profissionais",
                  subtitle: "Resultado superior",
                },
                {
                  icon: CheckCircle2,
                  title: "Visagismo exclusivo",
                  subtitle: "Alinhado ao seu rosto",
                },
                {
                  icon: Flame,
                  title: "Barboterapia completa",
                  subtitle: "Toalha quente & relaxamento",
                },
                {
                  icon: MapPin,
                  title: "Pacajus — Ceará",
                  subtitle: "Referência desde 2015",
                },
                {
                  icon: Calendar,
                  title: "Agendamento online 24h",
                  subtitle: "Sem filas de espera",
                },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={`m2-${idx}`} className="marquee-item group cursor-default" aria-hidden="true">
                    <div className="w-8 h-8 rounded-lg bg-[#142016] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-colors">
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <p className="font-heading font-bold text-xs sm:text-sm text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#8E9B91] font-light leading-tight mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
          CATÁLOGO DE SERVIÇOS & MÓDULOS (#servicos) - Conectado diretamente ao carrossel
         ========================================================================= */}
      <ModulesServicesSection />

      {/* Seções seguintes com espaçamento nobre e consistente */}
      <div className="space-y-16 sm:space-y-28 pt-8 sm:pt-14">
        {/* =========================================================================
            EQUIPE DE BARBEIROS (#equipe) - Tema Escuro Oficial
           ========================================================================= */}
        <section id="equipe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
              EQUIPE DE ESPECIALISTAS
            </span>
            <h2 className="font-heading text-2xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Escolha seu{" "}
              <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                Barbeiro
              </span>
            </h2>
            <p className="text-xs sm:text-base text-[#9BA59E] leading-relaxed max-w-xl mx-auto font-normal">
              Equipe qualificada com técnica apurada, respeito ao seu tempo e pontualidade rigorosa.
              Selecione o profissional para visualizar sua agenda e serviços exclusivos.
            </p>
          </div>
        </ScrollReveal>

        {/* Team Carousel (2 colunas no mobile com efeito touch, deck sobreposto no desktop) */}
        <TeamCarousel barbers={barbers} />
      </section>

      {/* =========================================================================
          COMO AGENDAR (3 Passos Claros) - Dark Luxury Theme
         ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#080B09] via-[#0C130E] to-[#080B09] text-[#FFFFFF] border-t border-[#18241B] pt-14 sm:pt-20 pb-8 sm:pb-12 relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#25C440]/[0.03] blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
                PASSO A PASSO
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-[1.1] mb-3 sm:mb-4">
                Como Funciona o{" "}
                <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                  Agendamento
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA59E] max-w-md mx-auto">
                Processo direto, transparente e sem necessidade de downloads de aplicativos ou cadastros complicados.
              </p>
            </div>
          </ScrollReveal>

          {/* Steps Container with connecting line on desktop */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div
              className="hidden md:block absolute top-1/2 left-16 right-16 h-[2px] bg-gradient-to-r from-[#25C440]/10 via-[#25C440]/40 to-[#25C440]/10 -translate-y-12 z-0"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 relative z-10">
              {/* Step 1 */}
              <ScrollReveal delay={100}>
                <div className="zeph-borda video h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/95 to-[#0A0E0B]/98 border border-[#1D2B20]/60 hover:shadow-[0_10px_30px_rgba(37,196,64,0.15)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[#25C440] text-[#080B09] font-black text-lg sm:text-xl flex items-center justify-center font-heading shadow-[0_0_20px_rgba(37,196,64,0.35)] group-hover:scale-105 transition-transform">
                    1
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors">
                    Escolha o Barbeiro
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Selecione o profissional de sua preferência: Léo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal delay={200}>
                <div className="zeph-borda video h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/95 to-[#0A0E0B]/98 border border-[#1D2B20]/60 hover:shadow-[0_10px_30px_rgba(37,196,64,0.15)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[#142017] border border-[#25C440]/50 text-[#25C440] font-black text-lg sm:text-xl flex items-center justify-center font-heading shadow-[0_0_15px_rgba(37,196,64,0.15)] group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-all">
                    2
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors">
                    Selecione o Serviço
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Escolha o corte, barba com toalha quente, sobrancelha ou os combos completos com duração e valores transparentes.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 3 */}
              <ScrollReveal delay={300}>
                <div className="zeph-borda video h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/95 to-[#0A0E0B]/98 border border-[#1D2B20]/60 hover:shadow-[0_10px_30px_rgba(37,196,64,0.15)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[#142017] border border-[#25C440]/50 text-[#25C440] font-black text-lg sm:text-xl flex items-center justify-center font-heading shadow-[0_0_15px_rgba(37,196,64,0.15)] group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-all">
                    3
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#25C440] transition-colors">
                    Confirmação Imediata
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Você escolhe o dia e horário no calendário oficial e sua vaga fica reservada instantaneamente sem filas ou espera.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <div className="text-center pt-8 sm:pt-10">
            <BookingTriggerButton
              className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.35)] hover:shadow-[0_0_30px_rgba(37,196,64,0.5)] transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.2]" />
              <span>Iniciar Meu Agendamento Agora</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
            </BookingTriggerButton>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPERIÊNCIA & ESPAÇO (#experiencia) - Tema Escuro Oficial (Dark Luxury Theme)
         ========================================================================= */}
      <section id="experiencia" className="w-full bg-[#080B09] text-[#FFFFFF] pt-10 sm:pt-14 pb-14 sm:pb-22 border-y border-[#18241B] scroll-mt-28 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[350px] bg-[#25C440]/[0.03] blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Photos Composition with reveal from left + Efeito 3D (.video) */}
            <ScrollReveal direction="left">
              <div className="video grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202E23] shadow-md group">
                    <Image
                      src="/images/gallery-1.webp"
                      alt="Atendimento e corte de cabelo na Leo Nunes Barbearia"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0E1510] border border-[#202E23] text-center shadow-sm">
                    <p className="font-heading text-2xl font-black text-[#25C440]">100%</p>
                    <p className="text-[11px] text-[#8E9B91] uppercase tracking-wider font-semibold">
                      Foco na Pontualidade
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                  <div className="p-4 rounded-2xl bg-[#0E1510] border border-[#202E23] text-center shadow-sm">
                    <p className="font-heading text-2xl font-black text-[#25C440]">+5.000</p>
                    <p className="text-[11px] text-[#8E9B91] uppercase tracking-wider font-semibold">
                      Clientes Atendidos
                    </p>
                  </div>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202E23] shadow-md group">
                    <Image
                      src="/images/gallery-2.webp"
                      alt="Espaço climatizado e confortável da barbearia"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Narrative with reveal from right */}
            <ScrollReveal direction="right">
              <div className="space-y-5 sm:space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
                  ESPAÇO & TRADIÇÃO
                </span>

                <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#FFFFFF] leading-[1.12] tracking-tight mb-3 sm:mb-4">
                  Mais do que um corte,{" "}
                  <span className="text-[#25C440]">
                    o seu momento de confiança.
                  </span>
                </h2>

                <p className="text-xs sm:text-base text-[#9EA9A1] leading-relaxed">
                  Na Leo Nunes Barbearia em Pacajus, aliamos ambiente climatizado, rigor em higiene e biossegurança, e domínio técnico apurado em tesoura e máquina.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0E1510] border border-[#202E23] shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#FFFFFF]">Respeito rigoroso ao seu tempo</p>
                      <p className="text-xs text-[#8E9B91]">
                        Agendamento com hora marcada para você não perder horas aguardando em filas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0E1510] border border-[#202E23] shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#FFFFFF]">Visagismo personalizado</p>
                      <p className="text-xs text-[#8E9B91]">
                        Análise do seu formato de rosto para indicar o corte e desenho de barba ideais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0E1510] border border-[#202E23] shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#FFFFFF]">Ambiente limpo, climatizado e café expresso</p>
                      <p className="text-xs text-[#8E9B91]">
                        100% de lâminas descartáveis, toalhas higienizadas e ferramentas esterilizadas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <BookingTriggerButton
                    className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.3)] transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 stroke-[2.2]" />
                    <span>Agendar com um Barbeiro</span>
                    <ArrowRight className="w-4 h-4" />
                  </BookingTriggerButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>



      {/* =========================================================================
          LOCALIZAÇÃO & CONTATO (#localizacao)
         ========================================================================= */}
      <section id="localizacao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
              ONDE ESTAMOS
            </span>
            <h2 className="font-heading text-2xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Nossa{" "}
              <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                Localização
              </span>
            </h2>
            <p className="text-xs sm:text-base text-[#9BA59E] max-w-md mx-auto">
              Localizada no centro de Pacajus, em ponto estratégico e com facilidade para estacionar.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Info Card */}
          <ScrollReveal direction="left" className="h-full">
            <SpotlightCard className="h-full rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 flex flex-col justify-between bg-gradient-to-b from-[#0F1611]/90 to-[#0A0E0B]/95 border border-[#1D2B20]">
              <div className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                      Endereço Oficial
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#25C440] bg-[#25C440]/10 border border-[#25C440]/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25C440] animate-pulse" />
                      {institutional.hours.badgeText}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F5F7F3]">
                    {institutional.contact.cityStateZip}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A6AEA8] leading-relaxed">
                    {institutional.contact.addressLine1}
                    <br />
                    {institutional.contact.addressLine2}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#1C2620] space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Horário de Funcionamento
                  </span>
                  <div className="space-y-1.5 text-xs text-[#A6AEA8]">
                    <p className="flex justify-between py-0.5">
                      <span>Segunda a Sexta:</span>
                      <strong className="text-[#F5F7F3]">{institutional.hours.weekdays}</strong>
                    </p>
                    <p className="flex justify-between py-0.5">
                      <span>Sábado:</span>
                      <strong className="text-[#F5F7F3]">{institutional.hours.saturday}</strong>
                    </p>
                    <p className="flex justify-between py-0.5 text-[#6F7B72]">
                      <span>Domingo:</span>
                      <span>{institutional.hours.sunday}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#1C2620] space-y-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Telefone / WhatsApp
                  </span>
                  <p className="text-sm sm:text-base font-bold text-[#F5F7F3]">
                    {institutional.contact.phoneFormatted}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 sm:pt-6">
                <a
                  href={institutional.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#1B261E] hover:bg-[#25C440] text-[#F5F7F3] hover:text-[#080B09] font-bold text-xs py-3.5 rounded-xl border border-[#25C440]/30 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir Rota no Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={institutional.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-xs py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(37,196,64,0.2)]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Conversar pelo WhatsApp</span>
                </a>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Map iframe com Efeito 3D (.video) */}
          <ScrollReveal direction="right" className="lg:col-span-2 h-full">
            <div className="video rounded-2xl overflow-hidden border border-[#202E24] h-[280px] sm:h-[350px] lg:h-full min-h-[280px] relative bg-[#101611] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <iframe
                src="https://www.google.com/maps?q=Rua+Joaquim+Nogueira+Lopes,+180,+Pacajus+-+CE&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(90%)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Localização da Leo Nunes Barbearia"
                className="w-full h-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
      </div>
    </div>
  );
}
