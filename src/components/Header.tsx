"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Calendar, MapPin, Phone } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navLinks = [
    { href: "/#inicio", label: "Início" },
    { href: "/#servicos", label: "Serviços" },
    { href: "/#equipe", label: "Equipe" },
    { href: "/#experiencia", label: "Experiência" },
    { href: "/#localizacao", label: "Localização" },
    { href: "/contato", label: "Contato" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080B09]/95 backdrop-blur-md border-b border-[#202A22] py-3 shadow-xl shadow-black/40"
          : "bg-gradient-to-b from-[#080B09]/90 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo + Pacajus Pill Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center group focus:outline-none focus:ring-2 focus:ring-[#25C440] rounded-lg p-1"
              aria-label="Léo Nunes Barbearia - Página Inicial"
            >
              <div className="relative h-10 w-36 sm:h-12 sm:w-44 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/logo.png"
                  alt="Léo Nunes Barbearia"
                  fill
                  priority
                  className="object-contain object-left"
                  sizes="(max-width: 640px) 144px, 176px"
                />
              </div>
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#0D1810]/90 text-[#25C440] border border-[#25C440]/35 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#25C440] shrink-0" />
              <span>PACAJUS - CE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegação Principal">
            {navLinks.map((link, index) => {
              const isFirst = index === 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1.5 ${
                    isFirst
                      ? "text-[#FFFFFF] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#25C440] after:rounded-full"
                      : "text-[#A6AEA8] hover:text-[#FFFFFF] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#25C440] hover:after:w-full after:transition-all after:duration-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA with Shimmer Beam */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/agendar"
              className="btn-shimmer inline-flex items-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
              id="header-cta-agendar"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Agendar horário</span>
              <span className="text-base font-bold shrink-0">›</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/agendar"
              className="bg-[#25C440] text-[#080B09] font-bold text-xs px-3 py-2 rounded-md"
            >
              Agendar
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A6AEA8] hover:text-[#F5F7F3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25C440]"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[56px] max-h-[calc(100vh-56px)] overflow-y-auto bg-[#080B09]/98 backdrop-blur-xl border-b border-[#202A22] px-5 pt-4 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200 z-50">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#F5F7F3] hover:text-[#25C440] py-3 px-3.5 rounded-xl hover:bg-[#121813] transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-[#25C440] text-xs">→</span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#202A22] space-y-4">
            <Link
              href="/agendar"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold py-3.5 rounded-xl text-center btn-green-glow text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Horário Agora</span>
            </Link>

            <div className="text-xs text-[#A6AEA8] space-y-2 pt-1 bg-[#101611] p-3.5 rounded-xl border border-[#202A22]">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#25C440] shrink-0" />
                <span>Rua Joaquim Nogueira Lopes, 180, Pacajus</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#25C440] shrink-0" />
                <span>(85) 99222-7064</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
