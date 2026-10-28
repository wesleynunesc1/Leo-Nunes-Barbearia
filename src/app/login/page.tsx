"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, loading: authLoading, refreshMember, initiateOAuth } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/minha-conta";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(errorParam);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal de esqueci a senha
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);

  // Se já estiver logado, redireciona para a página de destino
  useEffect(() => {
    if (!authLoading && member) {
      router.replace(redirectUrl);
    }
  }, [member, authLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, returnUrl: redirectUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Autenticação autorizada! Conectando sua sessão...");
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        await refreshMember();
        router.replace(redirectUrl);
      } else {
        if (data.requiresCaptcha) {
          setErrorMessage(
            "O Wix exigiu verificação de segurança. Clique no botão 'Entrar com Wix ID' abaixo para acessar com segurança."
          );
        } else {
          setErrorMessage(data.error || "E-mail ou senha incorretos.");
        }
      }
    } catch (err: any) {
      console.error("[LOGIN SUBMIT ERROR]", err);
      setErrorMessage("Erro de conexão ao autenticar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async () => {
    if (isOAuthLoading) return;
    setIsOAuthLoading(true);
    try {
      await initiateOAuth("login", redirectUrl);
    } catch {
      setIsOAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotLoading || !forgotEmail.trim()) return;

    setIsForgotLoading(true);
    setForgotFeedback(null);

    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      setForgotFeedback(
        data.message ||
          "Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas."
      );
    } catch {
      setForgotFeedback("Erro ao enviar solicitação. Tente novamente mais tarde.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B09] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#25C440]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-[#122A17]/30 rounded-full blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-block relative h-12 w-48">
            <Image
              src="/images/logo.png"
              alt="Léo Nunes Barbearia"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Área do Cliente
        </h1>
        <p className="mt-2 text-center text-sm text-[#A6AEA8]">
          Acesse sua conta para consultar seus agendamentos oficiais e gerenciar seu perfil.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0D120E] border border-white/[0.08] py-8 px-6 sm:px-8 rounded-2xl shadow-2xl relative">
          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
              <span className="text-red-400 font-bold shrink-0">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[#25C440]/10 border border-[#25C440]/30 text-[#25C440] text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Botão Oficial OAuth Wix */}
          <button
            type="button"
            onClick={handleOAuthLogin}
            disabled={isOAuthLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#141C16] hover:bg-[#1A261D] border border-[#25C440]/30 hover:border-[#25C440]/60 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-[#25C440]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isOAuthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#25C440]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#25C440]" />
            )}
            <span>Entrar com Wix ID / Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0D120E] px-3 text-[#7B857E]">ou acesse com e-mail e senha</span>
            </div>
          </div>

          {/* Formulário com E-mail e Senha */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5">
                E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8]">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-[#25C440] hover:text-[#2CD64A] transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7B857E] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isOAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(37,196,64,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link para Cadastro */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-sm text-[#A6AEA8]">
              Ainda não tem conta?{" "}
              <Link
                href={`/cadastro${redirectUrl !== "/minha-conta" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="font-bold text-[#25C440] hover:text-[#2CD64A] transition-colors"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D120E] border border-white/[0.1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-2">Recuperar Senha</h2>
            <p className="text-xs text-[#A6AEA8] mb-4">
              Informe seu e-mail cadastrado. Enviaremos um link de recuperação oficial do Wix para definir uma nova senha.
            </p>

            {forgotFeedback ? (
              <div className="mb-4 p-3.5 rounded-xl bg-[#25C440]/10 border border-[#25C440]/30 text-[#25C440] text-xs">
                {forgotFeedback}
              </div>
            ) : null}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#A6AEA8] hover:text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-5 py-2 rounded-xl bg-[#25C440] text-[#080B09] font-bold text-xs hover:bg-[#2CD64A] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isForgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Enviar Instruções</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
