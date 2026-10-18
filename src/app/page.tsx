import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Award,
  Flame,
  ExternalLink,
  Users,
  Star,
} from "lucide-react";
import { getAllBarbers } from "@/data/barbers";
import { TeamCarousel } from "@/components/TeamCarousel";
import { ModulesServicesSection } from "@/components/ModulesServicesSection";
import {
  ScrollReveal,
  SpotlightCard,
  PointerAura,
} from "@/components/MotionSystem";

export default function HomePage() {
  const barbers = getAllBarbers();

  return (
    <div className="space-y-16 sm:space-y-32 pb-16 sm:pb-24 overflow-x-hidden" id="inicio">
      {/* =========================================================================
          HERO SECTION (20% mais compacta, tipografia calibrada e fundo responsivo)
         ========================================================================= */}
      <section className="relative min-h-[72vh] sm:min-h-[76vh] lg:min-h-[80vh] flex flex-col justify-between pt-20 sm:pt-24 lg:pt-26 pb-0 overflow-hidden bg-[#080B09]">
        {/* Subtle Ambient Mouse Tracking Glow */}
        <PointerAura />

        {/* Desktop Background (md e superiores) */}
        <div className="hidden md:block absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/home-desktop.png"
            alt="Atendimento premium na Léo Nunes Barbearia"
            fill
            priority
            className="object-cover object-right lg:object-[82%_center] brightness-[0.92] contrast-[1.05]"
            sizes="100vw"
          />
          {/* Gradiente escuro à esquerda para legibilidade máxima da headline */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B09] via-[#080B09]/75 to-transparent z-10" />
          {/* Vinheta superior suave sob o header */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080B09]/90 via-[#080B09]/30 to-transparent z-10" />
          {/* Vinheta inferior para fusão com a barra de destaques */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#080B09] via-[#080B09]/60 to-transparent z-10" />
        </div>

        {/* Mobile Background (abaixo de md - Fundo com claridade natural e nitidez fotográfica) */}
        <div className="block md:hidden absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/home-mobile.png"
            alt="Atendimento premium na Léo Nunes Barbearia"
            fill
            priority
            className="object-cover object-top brightness-[1.0] contrast-[1.04]"
            sizes="100vw"
          />
          {/* Suave vinheta superior para destacar header */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080B09]/85 via-[#080B09]/25 to-transparent z-10" />
          {/* Suave vinheta inferior para acomodar os textos mantendo a foto do corte visível */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/70 via-40% to-transparent z-10" />
        </div>

        {/* Main Content Area (Left Column Content + Right Floating Tag) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto pt-24 sm:pt-28 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content (Columns 1-8) */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6 text-left">
              {/* Headline nítida com sombra cinematográfica para contraste perfeito sobre a imagem */}
              <h1 className="font-heading font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] tracking-tight uppercase leading-[0.98] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                <span className="text-[#FFFFFF] block">
                  SEU ESTILO.
                </span>
                <span className="text-[#25C440] block mt-1 sm:mt-1.5">
                  NOSSA ASSINATURA.
                </span>
              </h1>

              {/* Subtitle Paragraph calibrado com contraste elevado */}
              <p className="text-xs sm:text-base text-[#D4DDD6] max-w-lg leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
                Cortes contemporâneos, barbas desenhadas com precisão cirúrgica e atendimento de alto padrão, em Pacajus.
              </p>

              {/* Action Buttons Row - 100% responsivo para toque no mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
                {/* Primary CTA */}
                <Link
                  href="/agendar"
                  id="hero-cta-agendar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-xl shadow-[0_0_25px_rgba(37,196,64,0.35)] hover:shadow-[0_0_35px_rgba(37,196,64,0.5)] transition-all duration-300 transform active:scale-95 group"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.2]" />
                  <span>Agendar meu horário</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>

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
            3-COLUMN FEATURE STRIP (Compacta e responsiva)
           ===================================================================== */}
        <div className="relative z-20 w-full border-t border-[#1D2720]/90 bg-[#080B09]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#1D2720]/80">
              {/* Feature 1 */}
              <div className="flex items-center gap-3.5 py-1 md:py-0 md:pr-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#121A14] flex items-center justify-center text-[#25C440] shrink-0 border border-[#25C440]/20">
                  <Clock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xs sm:text-sm md:text-base text-[#FFFFFF] leading-tight">
                    Atendimento com hora marcada
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#8E9891] mt-0.5 font-light">
                    Seu tempo é valioso.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3.5 py-1 md:py-0 md:px-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#121A14] flex items-center justify-center text-[#25C440] shrink-0 border border-[#25C440]/20">
                  <Users className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xs sm:text-sm md:text-base text-[#FFFFFF] leading-tight">
                    4 barbeiros especialistas
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#8E9891] mt-0.5 font-light">
                    Experiência e técnica.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3.5 py-1 md:py-0 md:pl-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#121A14] flex items-center justify-center text-[#25C440] shrink-0 border border-[#25C440]/20">
                  <Scissors className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xs sm:text-sm md:text-base text-[#FFFFFF] leading-tight">
                    Produtos profissionais
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#8E9891] mt-0.5 font-light">
                    Resultado superior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
          CATÁLOGO DE SERVIÇOS & MÓDULOS (#servicos) - Baseado no Modelo Elementor
         ========================================================================= */}
      <ModulesServicesSection />

      {/* =========================================================================
          EQUIPE DE BARBEIROS (#equipe) - Responsive Touch Carousel & Desktop Grid
         ========================================================================= */}
      <section id="equipe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#121A14] border border-[#25C440]/30 shadow-[0_0_15px_rgba(37,196,64,0.1)] mb-3 sm:mb-4">
              EQUIPE DE ESPECIALISTAS
            </span>
            <h2 className="font-heading text-2xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Escolha seu{" "}
              <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                Barbeiro
              </span>
            </h2>
            <p className="text-xs sm:text-base text-[#9BA59E] leading-relaxed max-w-xl mx-auto">
              Equipe qualificada com técnica apurada, respeito ao seu tempo e pontualidade rigorosa.
              Selecione o profissional para visualizar sua agenda e serviços exclusivos.
            </p>
          </div>
        </ScrollReveal>

        {/* Team Carousel (2 columns on mobile, 4 on desktop) */}
        <TeamCarousel barbers={barbers} />
      </section>

      {/* =========================================================================
          COMO AGENDAR (3 Passos Claros) - Dark Luxury Theme
         ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#080B09] via-[#0C130E] to-[#080B09] text-[#FFFFFF] border-y border-[#18241B] py-16 sm:py-24 relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#25C440]/[0.03] blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
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
                <div className="h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/90 to-[#0A0E0B]/95 border border-[#1D2B20] hover:border-[#25C440]/50 hover:shadow-[0_10px_30px_rgba(37,196,64,0.12)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
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
                <div className="h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/90 to-[#0A0E0B]/95 border border-[#1D2B20] hover:border-[#25C440]/50 hover:shadow-[0_10px_30px_rgba(37,196,64,0.12)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
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
                <div className="h-full rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0F1611]/90 to-[#0A0E0B]/95 border border-[#1D2B20] hover:border-[#25C440]/50 hover:shadow-[0_10px_30px_rgba(37,196,64,0.12)] transition-all duration-300 relative space-y-3.5 sm:space-y-4 group">
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

          <div className="text-center pt-10 sm:pt-14">
            <Link
              href="/agendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.35)] hover:shadow-[0_0_30px_rgba(37,196,64,0.5)] transition-all duration-300 transform active:scale-95"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.2]" />
              <span>Iniciar Meu Agendamento Agora</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPERIÊNCIA & ESPAÇO (#experiencia) - Editorial Asymmetric Composition
         ========================================================================= */}
      <section id="experiencia" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Photos Composition with reveal from left */}
          <ScrollReveal direction="left">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202E24] group">
                  <Image
                    src="/images/gallery-1.png"
                    alt="Atendimento e corte de cabelo na Léo Nunes Barbearia"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B09]/80 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0F1611] to-[#0A0E0B] border border-[#1D2B20] text-center shadow-sm">
                  <p className="font-heading text-2xl font-black text-[#25C440]">100%</p>
                  <p className="text-[11px] text-[#9BA59E] uppercase tracking-wider font-semibold">
                    Foco na Pontualidade
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0F1611] to-[#0A0E0B] border border-[#1D2B20] text-center shadow-sm">
                  <p className="font-heading text-2xl font-black text-[#25C440]">+5.000</p>
                  <p className="text-[11px] text-[#9BA59E] uppercase tracking-wider font-semibold">
                    Clientes Atendidos
                  </p>
                </div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202E24] group">
                  <Image
                    src="/images/gallery-2.png"
                    alt="Espaço climatizado e confortável da barbearia"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B09]/80 via-transparent to-transparent opacity-60" />
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

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F7F3] leading-[1.12] tracking-tight mb-3 sm:mb-4">
                Mais do que um corte,{" "}
                <span className="bg-gradient-to-r from-[#25C440] via-[#5BE376] to-[#FFFFFF] bg-clip-text text-transparent">
                  o seu momento de confiança.
                </span>
              </h2>

              <p className="text-xs sm:text-base text-[#9BA59E] leading-relaxed">
                Na Léo Nunes Barbearia em Pacajus, aliamos ambiente climatizado, rigor em higiene e biossegurança, e domínio técnico apurado em tesoura e máquina.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0F1611]/60 border border-[#1D2B20]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Respeito rigoroso ao seu tempo</p>
                    <p className="text-xs text-[#9BA59E]">
                      Agendamento com hora marcada para você não perder horas aguardando em filas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0F1611]/60 border border-[#1D2B20]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Visagismo personalizado</p>
                    <p className="text-xs text-[#9BA59E]">
                      Análise do seu formato de rosto para indicar o corte e desenho de barba ideais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0F1611]/60 border border-[#1D2B20]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Ambiente limpo, climatizado e café expresso</p>
                    <p className="text-xs text-[#9BA59E]">
                      100% de lâminas descartáveis, toalhas higienizadas e ferramentas esterilizadas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/agendar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-sm px-7 py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.3)] transition-all"
                >
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                  <span>Agendar com um Barbeiro</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          FAIXA DE CONFIANÇA & AVALIAÇÕES (Google Reviews)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#0F1712] via-[#121D16] to-[#0F1712] border border-[#233327] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25C440]/15 border border-[#25C440]/40 flex items-center justify-center text-[#25C440] shrink-0">
                <Star className="w-6 h-6 fill-[#25C440]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-xl text-[#FFFFFF]">4.9</span>
                  <div className="flex text-[#25C440]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#25C440]" />
                    ))}
                  </div>
                  <span className="text-xs text-[#8E9B91] font-mono ml-1">(+300 avaliações no Google)</span>
                </div>
                <p className="text-xs text-[#C2CDC5] mt-0.5">
                  A barbearia mais bem avaliada de Pacajus por excelência no atendimento e pontualidade.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-[#25C440] bg-[#25C440]/10 border border-[#25C440]/30 px-3 py-1.5 rounded-lg">
                100% PONTUALIDADE
              </span>
              <span className="text-xs font-mono text-[#8E9B91] bg-[#141E16] border border-[#202E24] px-3 py-1.5 rounded-lg">
                BIOSSEGURANÇA TOTAL
              </span>
            </div>
          </div>
        </ScrollReveal>
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
                      ABERTO HOJE
                    </span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F5F7F3]">
                    Pacajus — Ceará
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A6AEA8] leading-relaxed">
                    Rua Joaquim Nogueira Lopes, 180, Centro
                    <br />
                    CEP 62870-000 — Pacajus / Ceará
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#1C2620] space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Horário de Funcionamento
                  </span>
                  <div className="space-y-1.5 text-xs text-[#A6AEA8]">
                    <p className="flex justify-between py-0.5">
                      <span>Segunda a Sexta:</span>
                      <strong className="text-[#F5F7F3]">08h às 19h</strong>
                    </p>
                    <p className="flex justify-between py-0.5">
                      <span>Sábado:</span>
                      <strong className="text-[#F5F7F3]">08h às 18h</strong>
                    </p>
                    <p className="flex justify-between py-0.5 text-[#6F7B72]">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#1C2620] space-y-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Telefone / WhatsApp
                  </span>
                  <p className="text-sm sm:text-base font-bold text-[#F5F7F3]">
                    (85) 99222-7064
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 sm:pt-6">
                <a
                  href="https://maps.google.com/?q=Rua+Joaquim+Nogueira+Lopes,+180,+Centro,+Pacajus+-+CE,+62870-000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#1B261E] hover:bg-[#25C440] text-[#F5F7F3] hover:text-[#080B09] font-bold text-xs py-3.5 rounded-xl border border-[#25C440]/30 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir Rota no Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://wa.me/5585992227064?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20L%C3%A9o%20Nunes%20Barbearia."
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

          {/* Map iframe */}
          <ScrollReveal direction="right" className="lg:col-span-2 h-full">
            <div className="rounded-2xl overflow-hidden border border-[#202E24] h-[280px] sm:h-[350px] lg:h-full min-h-[280px] relative bg-[#101611] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <iframe
                src="https://www.google.com/maps?q=Rua+Joaquim+Nogueira+Lopes,+180,+Pacajus+-+CE&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(90%)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Localização da Léo Nunes Barbearia"
                className="w-full h-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
