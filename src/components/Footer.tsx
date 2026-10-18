"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#050706] border-t border-[#1C241E] text-[#A6AEA8] pt-12 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="Léo Nunes Barbearia">
              <div className="relative h-12 w-44">
                <Image
                  src="/images/logo.png"
                  alt="Léo Nunes Barbearia"
                  fill
                  className="object-contain object-left"
                  sizes="176px"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-[#9BA59E]">
              Cortes precisos, barbas bem desenhadas e atendimento que respeita o seu tempo.
              Ambiente moderno e profissionais dedicados à sua melhor versão.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/leonunesbarbearia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#101611] border border-[#202A22] flex items-center justify-center text-[#F5F7F3] hover:text-[#25C440] hover:border-[#25C440]/50 transition-colors"
                aria-label="Instagram da Léo Nunes Barbearia"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5585992227064"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#101611] border border-[#202A22] flex items-center justify-center text-[#F5F7F3] hover:text-[#25C440] hover:border-[#25C440]/50 transition-colors"
                aria-label="WhatsApp da Léo Nunes Barbearia"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-[#F5F7F3] tracking-wider uppercase border-l-2 border-[#25C440] pl-3">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#inicio" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Início
                </Link>
              </li>
              <li>
                <Link href="/agendar" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5 font-semibold text-[#F5F7F3]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Agendar Horário
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Nossos Serviços
                </Link>
              </li>
              <li>
                <Link href="/#equipe" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Barbeiros Oficiais
                </Link>
              </li>
              <li>
                <Link href="/#experiencia" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Nosso Espaço
                </Link>
              </li>
              <li>
                <Link href="/#localizacao" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Como Chegar
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-[#25C440] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#25C440]" /> Contato & Agendamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Professional Portals */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-[#F5F7F3] tracking-wider uppercase border-l-2 border-[#25C440] pl-3">
              Agendar Por Barbeiro
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/agendar/leo-nunes" className="hover:text-[#25C440] transition-colors flex items-center justify-between group">
                  <span>Léo Nunes</span>
                  <span className="text-xs text-[#25C440] opacity-0 group-hover:opacity-100 transition-opacity">10 serviços →</span>
                </Link>
              </li>
              <li>
                <Link href="/agendar/aleffer-nunes" className="hover:text-[#25C440] transition-colors flex items-center justify-between group">
                  <span>Aleffer Nunes</span>
                  <span className="text-xs text-[#25C440] opacity-0 group-hover:opacity-100 transition-opacity">8 serviços →</span>
                </Link>
              </li>
              <li>
                <Link href="/agendar/helio-victor" className="hover:text-[#25C440] transition-colors flex items-center justify-between group">
                  <span>Hélio Victor</span>
                  <span className="text-xs text-[#25C440] opacity-0 group-hover:opacity-100 transition-opacity">10 serviços →</span>
                </Link>
              </li>
              <li>
                <Link href="/agendar/guilherme-oliveira" className="hover:text-[#25C440] transition-colors flex items-center justify-between group">
                  <span>Guilherme Oliveira</span>
                  <span className="text-xs text-[#25C440] opacity-0 group-hover:opacity-100 transition-opacity">8 serviços →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-[#F5F7F3] tracking-wider uppercase border-l-2 border-[#25C440] pl-3">
              Atendimento & Local
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#25C440] shrink-0 mt-1" />
                <div>
                  <p className="text-[#F5F7F3] font-medium">Pacajus — Ceará</p>
                  <p className="text-xs text-[#9BA59E]">
                    Rua Joaquim Nogueira Lopes, 180, Centro, CEP 62870-000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#25C440] shrink-0 mt-1" />
                <div className="text-xs space-y-0.5">
                  <p className="text-[#F5F7F3] font-medium">Horário de Funcionamento:</p>
                  <p>Segunda a Sexta: 08h às 19h</p>
                  <p>Sábado: 08h às 18h</p>
                  <p className="text-[#6F7B72]">Domingo: Fechado</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#25C440] shrink-0" />
                <a
                  href="https://wa.me/5585992227064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#F5F7F3] hover:text-[#25C440] transition-colors"
                >
                  (85) 99222-7064
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#1C241E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F7B72]">
          <p>
            © {currentYear} Léo Nunes Barbearia. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            Desenvolvido com excelência editorial e agendamento oficial integrado.
          </p>
        </div>
      </div>
    </footer>
  );
}
