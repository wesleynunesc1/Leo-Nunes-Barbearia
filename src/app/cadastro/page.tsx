"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { WIX_RECAPTCHA_SITE_KEY } from "@/lib/wixAuth";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: "dark" | "light";
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoaded?: () => void;
  }
}

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, loading: authLoading, initiateOAuth } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/minha-conta";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const recaptchaWidgetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && member) {
      router.replace(redirectUrl);
    }
  }, [member, authLoading, redirectUrl, router]);

  // Carrega o Google reCAPTCHA v2 oficial do Wix
  useEffect(() => {
    const scriptId = "google-recaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    window.onRecaptchaLoaded = () => {
      const container = document.getElementById("recaptcha-element");
      if (container && window.grecaptcha && recaptchaWidgetRef.current === null) {
        try {
          recaptchaWidgetRef.current = window.grecaptcha.render(container, {
            sitekey: WIX_RECAPTCHA_SITE_KEY,
            theme: "dark",
            callback: (token: string) => {
              setCaptchaToken(token);
              setErrorMessage(null);
            },
            "expired-callback": () => {
              setCaptchaToken(null);
            },
          });
        } catch (e) {
          // Já renderizado
        }
      }
    };

    if (window.grecaptcha && recaptchaWidgetRef.current === null) {
      window.onRecaptchaLoaded();
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (name.trim().length < 3) {
      setErrorMessage("Informe seu nome completo (mínimo de 3 caracteres).");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Informe um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          password,
          captchaToken: captchaToken || undefined,
          returnUrl: redirectUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.redirectUrl) {
          setSuccessMessage("Cadastro concluído com sucesso! Conectando sua sessão...");
          window.location.href = data.redirectUrl;
          return;
        }

        setSuccessMessage(
          data.message ||
            "Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta."
        );
      } else {
        if (data.requiresCaptcha) {
          setErrorMessage(
            data.error ||
              "Por favor, marque a caixa de verificação 'Não sou um robô' abaixo para prosseguir com o cadastro, ou utilize o botão Wix ID."
          );
        } else {
          setErrorMessage(data.error || "Erro ao realizar cadastro.");
        }

        // Reseta o captcha caso tenha expirado ou falhado
        if (window.grecaptcha && recaptchaWidgetRef.current !== null) {
          try {
            window.grecaptcha.reset(recaptchaWidgetRef.current);
            setCaptchaToken(null);
          } catch {}
        }
      }
    } catch (err) {
      console.error("[REGISTER SUBMIT ERROR]", err);
      setErrorMessage("Erro de conexão ao enviar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignup = async () => {
    if (isOAuthLoading) return;
    setIsOAuthLoading(true);
    try {
      await initiateOAuth("signup", redirectUrl);
    } catch {
      setIsOAuthLoading(false);
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
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#25C440]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
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
          Criar Nova Conta
        </h1>
        <p className="mt-2 text-center text-sm text-[#A6AEA8]">
          Cadastre-se para gerenciar seus agendamentos oficiais e usufruir de agendamento ágil.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0D120E] border border-white/[0.08] py-8 px-6 sm:px-8 rounded-2xl shadow-2xl relative">
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
            onClick={handleOAuthSignup}
            disabled={isOAuthLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#141C16] hover:bg-[#1A261D] border border-[#25C440]/30 hover:border-[#25C440]/60 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-[#25C440]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isOAuthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#25C440]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#25C440]" />
            )}
            <span>Cadastrar com Wix ID / Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0D120E] px-3 text-[#7B857E]">ou preencha seus dados</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5">
                Nome Completo
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                />
              </div>
            </div>

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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5">
                WhatsApp / Celular
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(85) 99999-9999"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5">
                  Senha
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 6 chars"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5">
                  Confirmar
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B857E]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#7B857E]">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPassword ? "Ocultar senhas" : "Ver senhas digitadas"}</span>
              </button>
            </div>

            {/* Container reCAPTCHA Google v2 com dark mode */}
            <div className="pt-2 flex justify-center">
              <div id="recaptcha-element" className="overflow-hidden rounded-xl border border-white/[0.08]" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isOAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(37,196,64,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <span>Criar Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-sm text-[#A6AEA8]">
              Já possui conta?{" "}
              <Link
                href={`/login${redirectUrl !== "/minha-conta" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="font-bold text-[#25C440] hover:text-[#2CD64A] transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
        </div>
      }
    >
      <CadastroForm />
    </Suspense>
  );
}
