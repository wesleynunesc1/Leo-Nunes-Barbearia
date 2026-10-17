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
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";
import { getAllBarbers } from "@/data/barbers";
import { TeamCarousel } from "@/components/TeamCarousel";
import {
  ScrollReveal,
  SpotlightCard,
  PointerAura,
  HeroHeadline,
} from "@/components/MotionSystem";

export default function HomePage() {
  const barbers = getAllBarbers();

  return (
    <div className="space-y-24 sm:space-y-36 pb-24 overflow-x-hidden" id="inicio">
      {/* =========================================================================
          HERO SECTION (Cinematic Editorial, Pointer Aura, Masked Headline)
         ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-12 pb-20 overflow-hidden">
        {/* Subtle Mouse Following Ambient Aura */}
        <PointerAura />

        {/* Hero Background Image with Editorial Vignette */}
        <div className="absolute inset-0 z-0 bg-[#080B09]">
          <Image
            src="/images/hero-bg.png"
            alt="Ambiente exclusivo da Léo Nunes Barbearia"
            fill
            priority
            quality={92}
            className="object-cover object-center opacity-30 filter contrast-125 transition-transform duration-1000 scale-100 hover:scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B09]/90 via-transparent to-[#080B09]" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#080B09]/60 to-[#080B09]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
          {/* Masked Hero Headline with Animated Green Line Sweep */}
          <HeroHeadline />

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#A6AEA8] max-w-2xl mx-auto leading-relaxed font-light">
            Cortes contemporâneos, barboterapia com toalha quente e atendimento com hora marcada que respeita o seu tempo.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/agendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-base px-8 py-4 rounded-xl btn-green-glow transition-all duration-300 transform active:scale-95"
              id="hero-cta-agendar"
            >
              <Calendar className="w-5 h-5" />
              <span>Agendar Meu Horário</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#servicos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#121813]/80 hover:bg-[#1A231C] text-[#F5F7F3] font-semibold text-base px-7 py-4 rounded-xl border border-[#202A22] hover:border-[#25C440]/40 transition-all duration-300"
            >
              <span>Conhecer Serviços</span>
            </a>
          </div>

          {/* Highlights Row with Scroll Stagger */}
          <ScrollReveal delay={250}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-12 max-w-3xl mx-auto border-t border-[#1C2620]/80">
              <div className="flex items-center justify-center gap-2.5 text-left text-xs sm:text-sm text-[#A6AEA8]">
                <ShieldCheck className="w-5 h-5 text-[#25C440] shrink-0" />
                <span>Atendimento com Hora Marcada</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 text-left text-xs sm:text-sm text-[#A6AEA8]">
                <Scissors className="w-5 h-5 text-[#25C440] shrink-0" />
                <span>4 Barbeiros Especialistas</span>
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2.5 text-left text-xs sm:text-sm text-[#A6AEA8]">
                <Sparkles className="w-5 h-5 text-[#25C440] shrink-0" />
                <span>Biossegurança e Higiene</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          SERVIÇOS EM DESTAQUE (#servicos) - Spotlight Cards & Pure Brand Colors
         ========================================================================= */}
      <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
              Tradição & Visagismo
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight">
              Nossos Serviços
            </h2>
            <p className="text-sm sm:text-base text-[#9BA59E] leading-relaxed">
              Cada corte e finalização é executado com visagismo anatômico e produtos profissionais de alta performance.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Feature Columns with Spotlight and Strict Palette */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <ScrollReveal delay={100}>
            <SpotlightCard className="h-full rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shadow-lg shadow-[#25C440]/10">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                  Cortes de Precisão
                </h3>
                <p className="text-xs text-[#9BA59E] leading-relaxed">
                  Degradês suaves, fade milimétrico, tesoura e cortes clássicos personalizados de acordo com seu estilo e formato de rosto.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1C2620] text-xs text-[#25C440] font-semibold flex items-center justify-between">
                <span>Geral e com Léo Nunes</span>
                <span>Disponível →</span>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={180}>
            <SpotlightCard className="h-full rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shadow-lg shadow-[#25C440]/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                  Barba & Barboterapia
                </h3>
                <p className="text-xs text-[#9BA59E] leading-relaxed">
                  Desenho anatômico, navalhamento seguro, toalha quente revigorante e óleos hidratantes para maciez e alívio da pele.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1C2620] text-xs text-[#25C440] font-semibold flex items-center justify-between">
                <span>Toalha quente relaxante</span>
                <span>Disponível →</span>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={260}>
            <SpotlightCard className="h-full rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shadow-lg shadow-[#25C440]/10">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                  Combos Completos
                </h3>
                <p className="text-xs text-[#9BA59E] leading-relaxed">
                  Cabelo + Barba, Cabelo + Barba + Sobrancelha. A solução prática para renovar o visual integralmente em uma só visita.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1C2620] text-xs text-[#25C440] font-semibold flex items-center justify-between">
                <span>Mais procurado da barbearia</span>
                <span>Disponível →</span>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Card 4 */}
          <ScrollReveal delay={340}>
            <SpotlightCard className="h-full rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440] shadow-lg shadow-[#25C440]/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                  Estética & Fios
                </h3>
                <p className="text-xs text-[#9BA59E] leading-relaxed">
                  Limpeza facial purificante, hidratação capilar, alinhamento com botox capilar, penteados e design limpo de sobrancelhas.
                </p>
              </div>
              <div className="pt-4 border-t border-[#1C2620] text-xs text-[#25C440] font-semibold flex items-center justify-between">
                <span>Cuidado masculino completo</span>
                <span>Disponível →</span>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </div>

        {/* Informative Price Notice */}
        <ScrollReveal delay={200}>
          <SpotlightCard className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-[#F5F7F3]">
                Quer conferir os preços exatos e disponibilidade em tempo real?
              </p>
              <p className="text-xs text-[#9BA59E]">
                Os valores e durações são atualizados individualmente na agenda de cada profissional no calendário oficial.
              </p>
            </div>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-sm px-6 py-3 rounded-xl btn-green-glow transition-all duration-200 shrink-0"
            >
              <span>Escolher Barbeiro</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SpotlightCard>
        </ScrollReveal>
      </section>

      {/* =========================================================================
          EQUIPE DE BARBEIROS (#equipe) - Responsive Touch Carousel & Desktop Grid
         ========================================================================= */}
      <section id="equipe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
              Nossos Profissionais
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight">
              Escolha seu Barbeiro
            </h2>
            <p className="text-sm sm:text-base text-[#9BA59E] leading-relaxed">
              Nossa equipe é formada por barbeiros com técnica apurada, atendimento cordial e pontualidade.
              Selecione o profissional para visualizar sua lista exclusiva de serviços e horários.
            </p>
          </div>
        </ScrollReveal>

        {/* Team Carousel (Desktop 4 Grid + Mobile Touch Carousel with 15% preview) */}
        <TeamCarousel barbers={barbers} />
      </section>

      {/* =========================================================================
          COMO AGENDAR (3 Passos Claros com Conexão Visual Progressiva)
         ========================================================================= */}
      <section className="bg-gradient-to-b from-[#0B100C] via-[#0D140E] to-[#0B100C] border-y border-[#1C2620] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold tracking-widest uppercase text-[#25C440]">
                Passo a Passo
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F5F7F3] tracking-tight">
                Como Funciona o Agendamento
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA59E]">
                Processo direto, transparente e sem necessidade de downloads ou cadastros complicados.
              </p>
            </div>
          </ScrollReveal>

          {/* Steps Container with connecting line on desktop */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div
              className="hidden md:block absolute top-1/2 left-12 right-12 h-[2px] bg-gradient-to-r from-[#25C440]/10 via-[#25C440]/40 to-[#25C440]/10 -translate-y-12 z-0"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <ScrollReveal delay={100}>
                <SpotlightCard className="h-full rounded-2xl p-8 relative space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25C440] text-[#080B09] font-black text-xl flex items-center justify-center font-heading shadow-lg shadow-[#25C440]/30">
                    1
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                    Escolha o Barbeiro
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Selecione o profissional de sua preferência: Léo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira.
                  </p>
                </SpotlightCard>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal delay={200}>
                <SpotlightCard className="h-full rounded-2xl p-8 relative space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/50 text-[#25C440] font-black text-xl flex items-center justify-center font-heading shadow-md shadow-[#25C440]/15">
                    2
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                    Selecione o Serviço
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Visualize os serviços oferecidos por aquele profissional — cortes, barboterapia, combos e estética.
                  </p>
                </SpotlightCard>
              </ScrollReveal>

              {/* Step 3 */}
              <ScrollReveal delay={300}>
                <SpotlightCard className="h-full rounded-2xl p-8 relative space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/50 text-[#25C440] font-black text-xl flex items-center justify-center font-heading shadow-md shadow-[#25C440]/15">
                    3
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                    Confirme no Calendário
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                    Você é direcionado diretamente para o calendário oficial do profissional no Wix para escolher dia e horário com confirmação imediata.
                  </p>
                </SpotlightCard>
              </ScrollReveal>
            </div>
          </div>

          <div className="text-center pt-14">
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-base px-8 py-4 rounded-xl btn-green-glow transition-all duration-300 transform active:scale-95"
            >
              <Calendar className="w-5 h-5" />
              <span>Iniciar Meu Agendamento Agora</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPERIÊNCIA & ESPAÇO (#experiencia) - Editorial Asymmetric Composition
         ========================================================================= */}
      <section id="experiencia" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photos Composition with reveal from left */}
          <ScrollReveal direction="left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202A22] group">
                  <Image
                    src="/images/gallery-1.png"
                    alt="Atendimento e corte de cabelo na Léo Nunes Barbearia"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B09]/80 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-4 rounded-2xl bg-[#101611] border border-[#202A22] text-center">
                  <p className="font-heading text-2xl font-black text-[#25C440]">100%</p>
                  <p className="text-[11px] text-[#9BA59E] uppercase tracking-wider font-semibold">
                    Foco na Pontualidade
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-4 rounded-2xl bg-[#101611] border border-[#202A22] text-center">
                  <p className="font-heading text-2xl font-black text-[#25C440]">Premium</p>
                  <p className="text-[11px] text-[#9BA59E] uppercase tracking-wider font-semibold">
                    Produtos Selecionados
                  </p>
                </div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202A22] group">
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
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
                Espaço & Técnica
              </span>

              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F7F3] leading-tight tracking-tight">
                Mais do que um corte, o seu momento de confiança.
              </h2>

              <p className="text-sm sm:text-base text-[#9BA59E] leading-relaxed">
                Na Léo Nunes Barbearia em Pacajus, aliamos ambiente climatizado, rigor em higiene e biossegurança, e domínio técnico apurado em tesoura e máquina.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Respeito ao seu tempo</p>
                    <p className="text-xs text-[#9BA59E]">
                      Agendamento organizado para que você não perca horas aguardando na fila.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Visagismo personalizado</p>
                    <p className="text-xs text-[#9BA59E]">
                      Análise do seu perfil para indicar o corte e desenho de barba que mais harmonizam com o seu rosto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#F5F7F3]">Ambiente limpo e profissional</p>
                    <p className="text-xs text-[#9BA59E]">
                      Ferramentas higienizadas e esterilizadas, lâminas descartáveis e toalhas higienizadas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/agendar"
                  className="inline-flex items-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-sm px-6 py-3.5 rounded-xl btn-green-glow transition-all"
                >
                  <span>Agendar com um Barbeiro</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          LOCALIZAÇÃO & CONTATO (#localizacao)
         ========================================================================= */}
      <section id="localizacao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
              Fácil Acesso
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3] tracking-tight">
              Nossa Localização
            </h2>
            <p className="text-sm sm:text-base text-[#9BA59E]">
              Localizada no centro de Pacajus, em ponto estratégico e de fácil estacionamento.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <ScrollReveal direction="left" className="h-full">
            <SpotlightCard className="h-full rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Endereço Oficial
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                    Pacajus — CE
                  </h3>
                  <p className="text-sm text-[#A6AEA8] leading-relaxed">
                    Rua Joaquim Nogueira Lopes, 180, Centro
                    <br />
                    CEP 62870-000 — Pacajus / Ceará
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1C2620] space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Horário de Funcionamento
                  </span>
                  <div className="space-y-1 text-xs text-[#A6AEA8]">
                    <p className="flex justify-between">
                      <span>Segunda a Sexta:</span>
                      <strong className="text-[#F5F7F3]">08h às 19h</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Sábado:</span>
                      <strong className="text-[#F5F7F3]">08h às 18h</strong>
                    </p>
                    <p className="flex justify-between text-[#6F7B72]">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C2620] space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#25C440]">
                    Telefone / WhatsApp
                  </span>
                  <p className="text-base font-bold text-[#F5F7F3]">
                    (85) 99222-7064
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <a
                  href="https://maps.google.com/?q=Rua+Joaquim+Nogueira+Lopes,+180,+Centro,+Pacajus+-+CE,+62870-000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#1B261E] hover:bg-[#25C440] text-[#F5F7F3] hover:text-[#080B09] font-bold text-xs py-3 rounded-xl border border-[#25C440]/30 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir Rota no Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://wa.me/5585992227064?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20L%C3%A9o%20Nunes%20Barbearia."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-xs py-3 rounded-xl transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>Conversar pelo WhatsApp</span>
                </a>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Map iframe */}
          <ScrollReveal direction="right" className="lg:col-span-2 h-full">
            <div className="rounded-2xl overflow-hidden border border-[#202A22] h-[380px] lg:h-full min-h-[350px] relative bg-[#101611]">
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
