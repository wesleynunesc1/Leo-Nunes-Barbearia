"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";

function GoogleIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function BookingAuthModal() {
  const { isAuthModalOpen, closeAuthModal, onAuthSuccess, authSource, authInitialTab } = useBooking();
  const { member, refreshMember, initiateOAuth } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sincroniza a aba inicial (login ou cadastro) quando o modal abre
  useEffect(() => {
    if (isAuthModalOpen && authInitialTab) {
      setTab(authInitialTab);
    }
  }, [isAuthModalOpen, authInitialTab]);

  // Limpa mensagens ao trocar de aba ou fechar
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [tab, isAuthModalOpen]);

  // Se já estiver logado e o modal estiver aberto, dispara sucesso e fecha
  useEffect(() => {
    if (isAuthModalOpen && member) {
      closeAuthModal();
      onAuthSuccess();
    }
  }, [isAuthModalOpen, member, closeAuthModal, onAuthSuccess]);

  if (!isAuthModalOpen) return null;

  const handlePhoneMask = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handleGoogleAuth = async () => {
    if (isOAuthLoading || isSubmitting) return;
    setIsOAuthLoading(true);
    setErrorMessage(null);

    try {
      // Salva flag no sessionStorage para reabrir o agendamento após o callback do Google
      if (typeof window !== "undefined") {
        if (authSource === "chatbot") {
          sessionStorage.setItem("leo_chatbot_resume_after_login", "true");
        } else {
          sessionStorage.setItem("leo_resume_booking_after_login", "true");
        }
      }
      await initiateOAuth(tab === "register" ? "signup" : "login", "/");
    } catch (err: any) {
      console.error("[GOOGLE AUTH TRIGGER ERROR]", err);
      setErrorMessage(
        err.message ||
        "Login com Google temporariamente indisponível. Por favor, utilize seu e-mail e senha abaixo."
      );
      setIsOAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isOAuthLoading) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          returnUrl: "/",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.redirectUrl) {
          // Se o Wix retorna redirectUrl OAuth (com sessionToken), redireciona para estabelecer sessão oficial
          if (typeof window !== "undefined") {
            if (authSource === "chatbot") {
              sessionStorage.setItem("leo_chatbot_resume_after_login", "true");
            } else {
              sessionStorage.setItem("leo_resume_booking_after_login", "true");
            }
          }
          window.location.href = data.redirectUrl;
        } else {
          // Sessão direta estabelecida em cookies
          await refreshMember();
          closeAuthModal();
          onAuthSuccess();
        }
      } else {
        setErrorMessage(data.error || "Falha na autenticação. Verifique suas credenciais.");
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage("Erro de conexão ao autenticar. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isOAuthLoading) return;

    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage("Informe seu nome completo (mínimo de 3 caracteres).");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas digitadas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          returnUrl: "/",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.redirectUrl) {
          if (typeof window !== "undefined") {
            if (authSource === "chatbot") {
              sessionStorage.setItem("leo_chatbot_resume_after_login", "true");
            } else {
              sessionStorage.setItem("leo_resume_booking_after_login", "true");
            }
          }
          window.location.href = data.redirectUrl;
        } else if (data.requiresEmailVerification) {
          setSuccessMessage(
            data.message ||
            "Cadastro iniciado com sucesso! Um e-mail de confirmação foi enviado para ativar sua conta."
          );
          setIsSubmitting(false);
        } else {
          // Atualiza o perfil e retoma o agendamento
          await refreshMember();
          closeAuthModal();
          onAuthSuccess();
        }
      } else {
        setErrorMessage(data.error || "Não foi possível concluir o cadastro. Verifique os dados.");
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage("Erro de conexão ao realizar cadastro. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-auth-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-[#040605]/85 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#080B09] border border-[#1E2D22] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#0B100C] border-b border-[#1A261D] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#142618] border border-[#25C440]/40 flex items-center justify-center text-[#25C440]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#25C440] font-bold block">
                Identificação Obrigatória
              </span>
              <h2 id="booking-auth-title" className="font-heading text-sm font-black text-[#FFFFFF]">
                Entre para agendar seu horário
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Fechar janela"
            className="p-1.5 rounded-xl text-[#A6AEA8] hover:text-[#FFFFFF] hover:bg-[#142017] border border-[#202E23] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle / Explicação */}
        <div className="px-5 pt-4 pb-2 text-center sm:text-left">
          <p className="text-xs text-[#A6AEA8] leading-relaxed">
            Faça login ou crie sua conta para continuar. Seus dados e preferências ficarão salvos para os próximos agendamentos.
          </p>
        </div>

        {/* Abas Entrar / Criar Conta */}
        <div className="px-5 pt-2">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0F1611] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${tab === "login"
                  ? "bg-[#25C440] text-[#080B09] shadow-sm font-extrabold"
                  : "text-[#A6AEA8] hover:text-white"
                }`}
            >
              Entrar na minha conta
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${tab === "register"
                  ? "bg-[#25C440] text-[#080B09] shadow-sm font-extrabold"
                  : "text-[#A6AEA8] hover:text-white"
                }`}
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="p-5 space-y-4">
          {/* Botão Google Oficial */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isOAuthLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.1] text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isOAuthLoading ? (
              <Loader2 className="w-4 h-4 text-[#25C440] animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>{tab === "login" ? "Continuar com o Google" : "Cadastrar com o Google"}</span>
          </button>

          <div className="flex items-center gap-3 text-[10px] text-[#6F7B72] uppercase font-mono tracking-wider">
            <div className="flex-1 h-[1px] bg-white/[0.08]" />
            <span>ou com seu e-mail</span>
            <div className="flex-1 h-[1px] bg-white/[0.08]" />
          </div>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-start gap-2.5 text-xs text-[#25C440]">
              <ShieldCheck className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === "login" ? (
            /* Formulário de Login */
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#A6AEA8] block">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#A6AEA8] block">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha segura"
                    autoComplete="current-password"
                    className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7B72] hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isOAuthLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-xs py-3 rounded-xl shadow-lg shadow-[#25C440]/25 transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Entrar e Continuar Agendamento</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Formulário de Cadastro */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#A6AEA8] block">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    autoComplete="name"
                    className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#A6AEA8] block">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#A6AEA8] block">
                    WhatsApp / Celular
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(handlePhoneMask(e.target.value))}
                      placeholder="(85) 99999-9999"
                      autoComplete="tel"
                      className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#A6AEA8] block">
                    Senha (mín. 6 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#A6AEA8] block">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6F7B72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      className="w-full bg-[#0D140F] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#5A665D] focus:outline-none focus:border-[#25C440] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isOAuthLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-black text-xs py-3 rounded-xl shadow-lg shadow-[#25C440]/25 transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Criar Conta e Prosseguir</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

