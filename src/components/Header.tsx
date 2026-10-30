"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Calendar, MapPin, Phone, User, LogOut } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { openBooking } = useBooking();
  const { member, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileMobileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileDesktopTriggerRef = useRef<HTMLButtonElement>(null);
  const navLinks = [
    { href: "/#inicio", label: "Início" },
    { href: "/#servicos", label: "Serviços" },
    { href: "/#equipe", label: "Equipe" },
    { href: "/#experiencia", label: "Experiência" },
    { href: "/#localizacao", label: "Localização" },
    { href: "/contato", label: "Contato" },
  ];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 45;
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
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

  // Fechar menu de perfil ao clicar fora ou pressionar ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        !profileMobileTriggerRef.current?.contains(target) &&
        !profileDesktopTriggerRef.current?.contains(target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  const memberInitials = member?.name
    ? member.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "LN";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        mobileMenuOpen
          ? "bg-[#080B09] py-3.5 sm:py-4 shadow-2xl"
          : scrolled
          ? "header-glass py-3 sm:py-3.5 shadow-none sm:shadow-lg sm:shadow-black/40"
          : "bg-gradient-to-b from-black/50 via-black/15 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo + Pacajus Pill Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center group focus:outline-none focus:ring-2 focus:ring-[#25C440] rounded-lg p-1"
              aria-label="Leo Nunes Barbearia - Página Inicial"
            >
              <div className="relative h-10 w-36 sm:h-12 sm:w-44 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/logo.png"
                  alt="Leo Nunes Barbearia"
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

          {/* Desktop CTA with Shimmer Beam + Minha Conta */}
          <div className="hidden sm:flex items-center gap-3">
            {member ? (
              <button
                ref={profileDesktopTriggerRef}
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer border ${
                  profileMenuOpen
                    ? "bg-[#142618] border-[#25C440]/50 text-white shadow-[#25C440]/10"
                    : "bg-[#0D1810]/90 hover:bg-[#142618] border-white/[0.08] hover:border-[#25C440]/40 text-[#A6AEA8] hover:text-white"
                }`}
                id="header-cta-minha-conta"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="Menu do Usuário"
              >
                <User className="w-3.5 h-3.5 text-[#25C440]" />
                <span>{member.name.split(" ")[0]}</span>
                <span className={`text-[8px] text-[#A6AEA8] transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0D1810]/90 hover:bg-[#142618] border border-white/[0.08] hover:border-[#25C440]/40 text-[#A6AEA8] hover:text-white text-xs font-semibold transition-all shadow-sm"
                id="header-cta-minha-conta"
              >
                <User className="w-3.5 h-3.5 text-[#25C440]" />
                <span>Minha Conta</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => openBooking()}
              className="btn-shimmer inline-flex items-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,196,64,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              id="header-cta-agendar"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Agendar horário</span>
              <span className="text-base font-bold shrink-0">›</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            {member ? (
              <button
                ref={profileMobileTriggerRef}
                type="button"
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  profileMenuOpen
                    ? "bg-[#142618] text-[#25C440] ring-1 ring-[#25C440]/50"
                    : "text-[#A6AEA8] hover:text-white"
                }`}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="Abrir menu do perfil"
                id="mobile-profile-trigger"
              >
                <User className="w-5 h-5 text-[#25C440]" />
              </button>
            ) : (
              <Link
                href="/login"
                className="p-2 text-[#A6AEA8] hover:text-white rounded-xl active:scale-95"
                aria-label="Entrar na Minha Conta"
              >
                <User className="w-5 h-5 text-[#25C440]" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => openBooking()}
              className="bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs px-3 py-2 rounded-xl active:scale-95 transition-transform cursor-pointer shadow-sm"
            >
              Agendar
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (profileMenuOpen) setProfileMenuOpen(false);
              }}
              className="p-2 text-[#A6AEA8] hover:text-[#F5F7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25C440]"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu de Perfil Compacto (Mobile & Desktop) */}
      {profileMenuOpen && member && (
        <div
          ref={profileMenuRef}
          className="absolute right-3 sm:right-6 lg:right-8 top-full mt-1.5 w-[calc(100vw-24px)] max-w-[270px] bg-[#0A0F0C]/98 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_1px_rgba(37,196,64,0.4)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
          aria-label="Menu do Usuário"
        >
          {/* Top: Avatar compacto + Nome + Email */}
          <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-white/[0.06]">
            {member.avatarUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#25C440]/40 shrink-0">
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25C440]/25 to-[#122517] border border-[#25C440]/40 flex items-center justify-center text-[#25C440] font-bold text-xs shrink-0 shadow-inner">
                {memberInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {member.name}
              </p>
              {member.email && (
                <p className="text-[10px] text-[#A6AEA8] truncate leading-tight mt-0.5">
                  {member.email}
                </p>
              )}
            </div>
          </div>

          {/* Opções organizadas */}
          <div className="pt-1 space-y-0.5">
            <Link
              href="/minha-conta"
              onClick={() => setProfileMenuOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#C8D5CA] hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#25C440] group-hover:scale-110 transition-transform" />
              <span>Minha Conta</span>
            </Link>

            <Link
              href="/minha-conta/agendamentos"
              onClick={() => setProfileMenuOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#C8D5CA] hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors group cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#25C440] group-hover:scale-110 transition-transform" />
              <span>Meus Agendamentos</span>
            </Link>

            <div className="pt-1 mt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={async () => {
                  setProfileMenuOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-red-400/90 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/15 transition-colors group text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute inset-x-0 top-full max-h-[calc(100vh-100%)] overflow-y-auto bg-[#080B09] border-b border-white/[0.08] px-5 pt-4 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200 z-50">
          <div className="flex flex-col space-y-1">
            {member ? (
              <div className="bg-[#121813] border border-[#25C440]/25 rounded-2xl p-3 mb-2 space-y-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                  {member.avatarUrl ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#25C440]/40 shrink-0">
                      <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" sizes="28px" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#25C440]/25 to-[#122517] border border-[#25C440]/40 flex items-center justify-center text-[#25C440] font-bold text-[10px] shrink-0">
                      {memberInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{member.name}</p>
                    {member.email && <p className="text-[10px] text-[#A6AEA8] truncate">{member.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <Link
                    href="/minha-conta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-xs font-medium text-[#C8D5CA] hover:text-white flex items-center gap-1.5 justify-center"
                  >
                    <User className="w-3 h-3 text-[#25C440]" />
                    <span>Minha Conta</span>
                  </Link>
                  <Link
                    href="/minha-conta/agendamentos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-xs font-medium text-[#C8D5CA] hover:text-white flex items-center gap-1.5 justify-center"
                  >
                    <Calendar className="w-3 h-3 text-[#25C440]" />
                    <span>Agendamentos</span>
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-center text-[11px] text-red-400 hover:text-red-300 pt-1 border-t border-white/[0.06] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-[#25C440] py-3 px-3.5 rounded-xl bg-[#121813] border border-[#25C440]/25 transition-colors flex items-center justify-between mb-1"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Área do Cliente (Entrar / Cadastrar)</span>
                </span>
                <span className="text-[#25C440] text-xs">→</span>
              </Link>
            )}

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
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold py-3.5 rounded-xl text-center btn-green-glow text-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Horário Agora</span>
            </button>

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
