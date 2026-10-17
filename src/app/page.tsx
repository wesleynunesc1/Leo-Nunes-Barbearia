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
import { BarberCard } from "@/components/BarberCard";

export default function HomePage() {
  const barbers = getAllBarbers();

  return (
    <div className="space-y-24 sm:space-y-32 pb-20" id="inicio">
      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0 bg-[#080B09]">
          <Image
            src="/images/hero-bg.png"
            alt="Ambiente da Léo Nunes Barbearia"
            fill
            priority
            quality={90}
            className="object-cover object-center opacity-30 filter contrast-125"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/80 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#080B09]/60 to-[#080B09]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121A14]/90 border border-[#25C440]/30 text-xs font-semibold tracking-widest uppercase text-[#25C440] shadow-lg shadow-black/40">
            <span className="w-2 h-2 rounded-full bg-[#25C440] animate-pulse" />
            <span>PACAJUS — CEARÁ</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F7F3] leading-[1.08] max-w-4xl mx-auto">
            SEU ESTILO. <br className="hidden sm:inline" />
            <span className="text-[#25C440]">NOSSA ASSINATURA.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#A6AEA8] max-w-2xl mx-auto leading-relaxed">
            Cortes contemporâneos, barbas desenhadas com precisão cirúrgica e atendimento
            que respeita o seu tempo. Conheça a experiência de barbearia de alto padrão em Pacajus.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/agendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-base px-8 py-4 rounded-xl btn-green-glow transition-all duration-300"
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

          {/* Highlights Row */}
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
              <span>Produtos Profissionais</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SERVIÇOS EM DESTAQUE (#servicos)
         ========================================================================= */}
      <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
            Tradição & Modernidade
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3]">
            Nossos Serviços
          </h2>
          <p className="text-sm sm:text-base text-[#9BA59E]">
            Cada corte e acabamento é executado com visagismo e produtos de primeira linha para valorizar seus traços.
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="editorial-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440]">
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
              <span>Opção geral e com Léo</span>
              <span>Disponível →</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="editorial-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#291F14] border border-[#E6A960]/30 flex items-center justify-center text-[#E6A960]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Barba & Barboterapia
              </h3>
              <p className="text-xs text-[#9BA59E] leading-relaxed">
                Desenho anatômico, navalhamento seguro, toalha quente revigorante e óleos hidratantes para maciez e alívio da pele.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C2620] text-xs text-[#E6A960] font-semibold flex items-center justify-between">
              <span>Tratamento com toalha quente</span>
              <span>Disponível →</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="editorial-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#102433] border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Combos Completos
              </h3>
              <p className="text-xs text-[#9BA59E] leading-relaxed">
                Cabelo + Barba, Cabelo + Barba + Sobrancelha. A solução prática para renovar o visual integralmente em uma só visita.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C2620] text-xs text-[#38BDF8] font-semibold flex items-center justify-between">
              <span>Mais procurado pelos clientes</span>
              <span>Disponível →</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="editorial-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2A142E] border border-[#D946EF]/30 flex items-center justify-center text-[#D946EF]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Estética & Fios
              </h3>
              <p className="text-xs text-[#9BA59E] leading-relaxed">
                Limpeza facial purificante, hidratação capilar, alinhamento com botox, penteados e design limpo de sobrancelhas.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C2620] text-xs text-[#D946EF] font-semibold flex items-center justify-between">
              <span>Cuidado masculino completo</span>
              <span>Disponível →</span>
            </div>
          </div>
        </div>

        {/* Informative Price Notice */}
        <div className="bg-[#101611]/80 border border-[#202A22] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
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
        </div>
      </section>

      {/* =========================================================================
          EQUIPE DE BARBEIROS (#equipe)
         ========================================================================= */}
      <section id="equipe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
            Nossos Profissionais
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3]">
            Escolha seu Barbeiro
          </h2>
          <p className="text-sm sm:text-base text-[#9BA59E]">
            Nossa equipe é formada por barbeiros com técnica apurada, atendimento cordial e pontualidade.
            Selecione o profissional para visualizar sua lista exclusiva de serviços e horários.
          </p>
        </div>

        {/* 4 Barbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {barbers.map((barber, index) => (
            <BarberCard key={barber.id} barber={barber} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          COMO AGENDAR (3 Passos Claros)
         ========================================================================= */}
      <section className="bg-gradient-to-b from-[#0B100C] via-[#0D140E] to-[#0B100C] border-y border-[#1C2620] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-[#25C440]">
              Passo a Passo
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F5F7F3]">
              Como Funciona o Agendamento
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA59E]">
              Processo direto, transparente e sem necessidade de downloads ou cadastros complicados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="editorial-card rounded-2xl p-8 relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#25C440] text-[#080B09] font-black text-xl flex items-center justify-center font-heading">
                1
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Escolha o Barbeiro
              </h3>
              <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                Selecione o barbeiro de sua preferência: Léo Nunes, Aleffer Nunes, Hélio Victor ou Guilherme Oliveira.
              </p>
            </div>

            {/* Step 2 */}
            <div className="editorial-card rounded-2xl p-8 relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A261D] border border-[#25C440]/40 text-[#25C440] font-black text-xl flex items-center justify-center font-heading">
                2
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Selecione o Serviço
              </h3>
              <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                Visualize os serviços oferecidos por aquele profissional — cortes, barbas, combos e tratamentos estéticos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="editorial-card rounded-2xl p-8 relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A261D] border border-[#25C440]/40 text-[#25C440] font-black text-xl flex items-center justify-center font-heading">
                3
              </div>
              <h3 className="font-heading text-xl font-bold text-[#F5F7F3]">
                Confirme no Calendário
              </h3>
              <p className="text-xs sm:text-sm text-[#9BA59E] leading-relaxed">
                Você é direcionado diretamente para o calendário oficial do profissional no Wix para escolher dia e horário com confirmação imediata.
              </p>
            </div>
          </div>

          <div className="text-center pt-12">
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2.5 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-base px-8 py-4 rounded-xl btn-green-glow transition-all duration-300"
            >
              <Calendar className="w-5 h-5" />
              <span>Iniciar Meu Agendamento Agora</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPERIÊNCIA & ESPAÇO (#experiencia)
         ========================================================================= */}
      <section id="experiencia" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photos Composition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202A22]">
                <Image
                  src="/images/gallery-1.png"
                  alt="Atendimento e corte de cabelo na Léo Nunes Barbearia"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
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
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#202A22]">
                <Image
                  src="/images/gallery-2.png"
                  alt="Espaço climatizado e confortável da barbearia"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
              Espaço & Técnica
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F7F3] leading-tight">
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
                    Ferramentas higienizadas e esterilizadas, lâminas descartáveis e toalhas esterilizadas.
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
        </div>
      </section>

      {/* =========================================================================
          LOCALIZAÇÃO & CONTATO (#localizacao)
         ========================================================================= */}
      <section id="localizacao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#25C440] bg-[#121A14] px-3.5 py-1 rounded-full border border-[#25C440]/30">
            Fácil Acesso
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F7F3]">
            Nossa Localização
          </h2>
          <p className="text-sm sm:text-base text-[#9BA59E]">
            Localizada no centro de Pacajus, em ponto estratégico e de fácil estacionamento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="editorial-card rounded-2xl p-8 space-y-6 flex flex-col justify-between">
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
          </div>

          {/* Map iframe */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#202A22] h-[380px] lg:h-auto min-h-[350px] relative bg-[#101611]">
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
        </div>
      </section>
    </div>
  );
}
