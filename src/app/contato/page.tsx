import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Award,
  Scissors,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contato & Agendamento | Léo Nunes Barbearia - Pacajus CE",
  description:
    "Tudo o que você precisa em um só lugar. Baixe nossos apps oficiais para Android e iPhone, agende seu horário online ou fale diretamente com a equipe da Léo Nunes Barbearia.",
  alternates: {
    canonical: "https://leonunesbarbearia.com.br/contato",
  },
  openGraph: {
    title: "Contato & Agendamento | Léo Nunes Barbearia",
    description:
      "Agende seu horário online, baixe o aplicativo para Android e iPhone ou fale com nossa equipe em Pacajus - CE.",
    url: "https://leonunesbarbearia.com.br/contato",
    siteName: "Léo Nunes Barbearia",
    images: [
      {
        url: "/images/gallery-2.png",
        width: 1200,
        height: 630,
        alt: "Léo Nunes Barbearia - Contato e Agendamento",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

// 4 Links Oficiais informados
const ACTION_LINKS = {
  androidApp:
    "https://play.google.com/store/apps/details?id=com.wix.android&pcampaignid=web_share",
  iphoneApp:
    "https://apps.apple.com/br/app/spaces-follow-businesses/id1099748482",
  webBooking: "https://leonunesbarbearia.vercel.app/",
  whatsappContact:
    "https://api.whatsapp.com/send/?phone=5585992227064&text&type=phone_number&app_absent=0",
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F3] selection:bg-[#25C440] selection:text-[#080B09]">
      {/* =========================================================================
          PRIMEIRA SEÇÃO: CONTATO & AGENDAMENTO
         ========================================================================= */}
      <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-32 overflow-hidden border-b border-[#1A251D]">
        {/* Fundo Cinematográfico com Imagem Real e Máscara Gradiente */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/gallery-2.png"
            alt="Ambiente da Léo Nunes Barbearia"
            fill
            priority
            className="object-cover object-center opacity-15 scale-105"
            sizes="100vw"
          />
          {/* Vinheta escura profunda e glow verde extremamente sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B09] via-[#080B09]/90 to-[#080B09]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(37,196,64,0.12),transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção: Identificação + Headline + Descrição */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#25C440] bg-[#0E1711] border border-[#25C440]/30 shadow-[0_0_20px_rgba(37,196,64,0.15)]">
              <Scissors className="w-3.5 h-3.5 text-[#25C440]" />
              <span>CONTATO & AGENDAMENTO</span>
            </div>

            <h1 className="font-heading font-black text-3xl xs:text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.08] text-[#FFFFFF]">
              TUDO QUE VOCÊ PRECISA,{" "}
              <span className="text-[#25C440] block sm:inline drop-shadow-[0_0_25px_rgba(37,196,64,0.35)]">
                EM UM SÓ LUGAR.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#B3BEB6] max-w-2xl mx-auto leading-relaxed">
              Agende seu horário, acesse nossos serviços ou converse diretamente com nossa equipe.
              Tudo de forma simples, rápida e prática, para você aproveitar a experiência Léo Nunes Barbearia.
            </p>
          </div>

          {/* Grid Principal: 4 Botões Oficiais + Card Informativo de Apoio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Coluna dos 4 Botões Grandes Oficiais (Colunas 1 a 7) */}
            <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 justify-center">
              {/* BOTÃO 03: AGENDAR PELO SITE (CTA PRINCIPAL / MAIOR DESTAQUE) */}
              <a
                href={ACTION_LINKS.webBooking}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#25C440] via-[#2CD64A] to-[#25C440] text-[#080B09] p-5 sm:p-6 shadow-[0_10px_35px_rgba(37,196,64,0.35)] border border-[#5BE376]/50 transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_15px_45px_rgba(37,196,64,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25C440]"
                id="btn-contato-agendar-site"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#080B09] text-[#25C440] flex items-center justify-center shrink-0 shadow-md">
                      <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#080B09] text-[#25C440]">
                          Mais Rápido
                        </span>
                        <span className="text-[11px] text-[#080B09]/80 font-bold uppercase tracking-wider hidden sm:inline">
                          Online 24h
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-lg sm:text-xl md:text-2xl tracking-tight uppercase text-[#080B09] mt-0.5">
                        AGENDAR PELO SITE
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-[#080B09]/85 mt-0.5">
                        Escolha seu barbeiro, serviço e horário em segundos
                      </p>
                    </div>
                  </div>

                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#080B09] text-[#25C440] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </a>

              {/* BOTÃO 04: WHATSAPP */}
              <a
                href={ACTION_LINKS.whatsappContact}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl bg-[#0F1711] hover:bg-[#142017] border border-[#233326] hover:border-[#25C440]/60 p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440]"
                id="btn-contato-whatsapp"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#17261B] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-colors duration-300">
                      {/* WhatsApp SVG Icon */}
                      <svg
                        className="w-6 h-6 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20.52 3.48A11.9 11.9 0 0012.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.63a11.93 11.93 0 005.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-.12-6.21-3.52-8.43zM12.06 21.87h-.01a9.92 9.92 0 01-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.9 9.9 0 01-1.52-5.24c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.03 7.02 2.91a9.9 9.9 0 012.91 7.02c0 5.48-4.46 9.91-9.94 9.91zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.21 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base sm:text-lg md:text-xl tracking-tight uppercase text-[#FFFFFF] group-hover:text-[#25C440] transition-colors">
                        FALAR COM A NOSSA EQUIPE
                      </h2>
                      <p className="text-xs sm:text-sm text-[#A6AEA8] mt-0.5">
                        Tire dúvidas sobre serviços, produtos e confirmação de horários
                      </p>
                    </div>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18241B] text-[#A6AEA8] group-hover:text-[#25C440] group-hover:bg-[#203124] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </a>

              {/* Grid 2 Colunas para os Apps Mobile (ou empilhados no mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BOTÃO 01: APP ANDROID */}
                <a
                  href={ACTION_LINKS.androidApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative zeph-borda rounded-2xl bg-[#0F1711] hover:bg-[#142017] border border-[#233326]/60 hover:border-[#25C440]/60 p-4 sm:p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440]"
                  id="btn-contato-app-android"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#17261B] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-colors duration-300">
                        {/* Android Minimalist SVG */}
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003 0-.5511.4482-1.0003.9993-1.0003.5516 0 .9997.4492.9997 1.0003 0 .5517-.4481 1.0003-.9997 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003 0-.5511.4482-1.0003.9993-1.0003.5516 0 .9997.4492.9997 1.0003 0 .5517-.4481 1.0003-.9997 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.854 8 12 8s-3.5902.4116-5.1367 1.0498L4.841 5.4468a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.152 5676l1.9972 3.4591C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[#8E9B91] uppercase tracking-wider block">
                          Google Play
                        </span>
                        <h3 className="font-heading font-bold text-xs sm:text-sm tracking-tight uppercase text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-tight">
                          BAIXAR APP PARA ANDROID
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8E9B91] group-hover:text-[#25C440] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </a>

                {/* BOTÃO 02: APP IPHONE */}
                <a
                  href={ACTION_LINKS.iphoneApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative zeph-borda rounded-2xl bg-[#0F1711] hover:bg-[#142017] border border-[#233326]/60 hover:border-[#25C440]/60 p-4 sm:p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440]"
                  id="btn-contato-app-iphone"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#17261B] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center shrink-0 group-hover:bg-[#25C440] group-hover:text-[#080B09] transition-colors duration-300">
                        {/* Apple Minimalist SVG */}
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.61 1.34-.56.64-.99 1.7-0.87 2.73 1 .08 1.93-.47 2.55-1.22z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[#8E9B91] uppercase tracking-wider block">
                          App Store
                        </span>
                        <h3 className="font-heading font-bold text-xs sm:text-sm tracking-tight uppercase text-[#FFFFFF] group-hover:text-[#25C440] transition-colors leading-tight">
                          BAIXAR APP PARA IPHONE
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8E9B91] group-hover:text-[#25C440] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </a>
              </div>

              {/* Informação Discreta de Transparência sobre os Apps (Exigência do Prompt) */}
              <div className="pt-2 text-center sm:text-left">
                <p className="text-[11px] text-[#7E8A81] leading-relaxed">
                  * Os aplicativos <span className="text-[#A6AEA8]">Spaces by Wix</span> e{" "}
                  <span className="text-[#A6AEA8]">Wix App</span> são utilizados oficialmente para acesso ágil à plataforma de agendamento online da Léo Nunes Barbearia.
                </p>
              </div>
            </div>

            {/* Coluna Visual e Informativa (Colunas 8 a 12) */}
            <div className="lg:col-span-5 zeph-borda flex flex-col justify-between rounded-2xl bg-[#0D140F] border border-[#202E23]/60 p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase text-[#25C440] bg-[#142016] border border-[#25C440]/25">
                  <span className="w-2 h-2 rounded-full bg-[#25C440] animate-pulse" />
                  SISTEMA DE AGENDAMENTO ATIVO
                </div>

                <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#FFFFFF] leading-snug">
                  Atendimento ágil com o padrão de excelência de Pacajus.
                </h3>

                <p className="text-xs sm:text-sm text-[#A6AEA8] leading-relaxed">
                  Evite filas e garanta o seu horário na cadeira com o profissional de sua preferência. Nosso atendimento prioriza rigorosamente a pontualidade e o respeito ao seu tempo.
                </p>
              </div>

              {/* Dados Rápidos da Barbearia */}
              <div className="space-y-3 pt-4 border-t border-[#1C271E] text-xs sm:text-sm text-[#CAD5CD]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Endereço Oficial</strong>
                    <span className="text-[#9BA69E]">Rua Joaquim Nogueira Lopes, 180, Pacajus - CE</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Horário de Funcionamento</strong>
                    <span className="text-[#9BA69E]">Segunda a Sexta: 08h às 19h | Sábado: 08h às 18h</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Telefone & WhatsApp</strong>
                    <span className="text-[#9BA69E]">(85) 99222-7064</span>
                  </div>
                </div>
              </div>

              {/* Mini Foto da Barbearia com Efeito Glassmorphism */}
              <div className="relative h-36 sm:h-40 rounded-xl overflow-hidden border border-[#233527]">
                <Image
                  src="/images/gallery-1.png"
                  alt="Interior Léo Nunes Barbearia"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[11px] font-mono text-[#25C440] bg-[#080B09]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-[#25C440]/30">
                  Léo Nunes Barbearia • Pacajus - CE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEGUNDA SEÇÃO: NOSSA HISTÓRIA
         ========================================================================= */}
      <section className="py-20 sm:py-32 relative overflow-hidden bg-gradient-to-b from-[#080B09] via-[#0B110D] to-[#080B09]" id="historia">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Coluna Esquerda: Conteúdo Institucional (Colunas 1 a 6) */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              {/* Identificador Superior */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#25C440] bg-[#101812] border border-[#25C440]/30 shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#25C440]" />
                <span>DESDE 2015 • PACAJUS — CE</span>
              </div>

              {/* Headline */}
              <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#FFFFFF] leading-[1.05]">
                NOSSA{" "}
                <span className="text-[#25C440] drop-shadow-[0_0_20px_rgba(37,196,64,0.3)]">
                  HISTÓRIA.
                </span>
              </h2>

              {/* Linha Divisória com Acento Verde */}
              <div className="w-16 h-1 bg-[#25C440] rounded-full" />

              {/* Texto Institucional Obrigatório */}
              <div className="space-y-4 text-sm sm:text-base text-[#C5D0C8] leading-relaxed font-normal">
                <p>
                  Fundada em 2015 por Léo Nunes, nossa barbearia nasceu com o propósito de oferecer mais do que um bom corte: uma experiência marcada pela qualidade, pelo cuidado e pela atenção aos detalhes.
                </p>
                <p>
                  Ao longo dos anos, construímos nossa história em Pacajus, Ceará, valorizando a confiança de cada cliente que passa por nossas cadeiras.
                </p>
                <p>
                  Com uma equipe dedicada, técnicas atualizadas e um ambiente preparado para receber bem, seguimos evoluindo sem perder aquilo que sempre fez parte da nossa essência: respeito, profissionalismo e compromisso com o seu estilo.
                </p>
              </div>

              {/* Métricas da Barbearia */}
              <div className="grid grid-cols-3 gap-3 pt-3 pb-2 border-y border-[#1E2B21]">
                <div>
                  <span className="font-heading font-black text-xl sm:text-2xl text-[#25C440] block">
                    2015
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#8E9B91] block uppercase tracking-wider">
                    Fundação
                  </span>
                </div>
                <div>
                  <span className="font-heading font-black text-xl sm:text-2xl text-[#FFFFFF] block">
                    4 Barbeiros
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#8E9B91] block uppercase tracking-wider">
                    Especialistas
                  </span>
                </div>
                <div>
                  <span className="font-heading font-black text-xl sm:text-2xl text-[#25C440] block">
                    100%
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#8E9B91] block uppercase tracking-wider">
                    Pontualidade
                  </span>
                </div>
              </div>

              {/* Botão de Agendamento da Seção */}
              <div className="pt-2">
                <Link
                  href="/agendar"
                  className="btn-shimmer inline-flex items-center justify-center gap-3 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(37,196,64,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95 group w-full sm:w-auto"
                  id="btn-historia-agendar"
                >
                  <Calendar className="w-5 h-5 shrink-0" />
                  <span>AGENDAR MEU HORÁRIO</span>
                  <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Coluna Direita: Fotografia Original com Moldura de Alta Precisão (Colunas 7 a 12) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Aura luminosa verde atrás da foto */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#25C440]/20 to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />

                {/* Container da Fotografia */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#233527] bg-[#0E1510] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <Image
                    src="/images/gallery-2.png"
                    alt="Equipe e estrutura da Léo Nunes Barbearia em Pacajus"
                    fill
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />

                  {/* Gradiente interno sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B09]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Selo Flutuante no canto superior */}
                  <div className="absolute top-4 right-4 bg-[#080B09]/90 backdrop-blur-md border border-[#25C440]/40 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-[#25C440] shadow-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#25C440]" />
                    <span>TRADIÇÃO & PRECISÃO</span>
                  </div>

                  {/* Legenda na base */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs sm:text-sm text-[#F5F7F3] font-medium drop-shadow-md">
                      Estrutura climatizada, equipamentos de precisão e atendimento individualizado.
                    </p>
                    <span className="text-[11px] font-mono text-[#25C440]">
                      Pacajus, Ceará • Referência desde 2015
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
