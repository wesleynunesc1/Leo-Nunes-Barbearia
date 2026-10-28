"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, loading: authLoading, initiateOAuth } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/minha-conta";
  const errorParam = searchParams.get("error");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(errorParam);
  const [oauthDetails, setOAuthDetails] = useState<any | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Se já estiver logado, redireciona para a página de destino
  useEffect(() => {
    if (!authLoading && member) {
      router.replace(redirectUrl);
    }
  }, [member, authLoading, redirectUrl, router]);

  useEffect(() => {
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      if (raw.length > 6) {
        setPhone(`(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`);
      } else if (raw.length > 2) {
        setPhone(`(${raw.slice(0, 2)}) ${raw.slice(2)}`);
      } else {
        setPhone(raw);
      }
    }
  };

  const handleGoogleSignup = async () => {
    if (isOAuthLoading || isSubmitting) return;
    setIsOAuthLoading(true);
    setErrorMessage(null);
    setOAuthDetails(null);

    try {
      await initiateOAuth("signup", redirectUrl);
    } catch (err: any) {
      console.error("[GOOGLE SIGNUP TRIGGER ERROR]", err);
      if (err.code === "INVALID_REDIRECT_URI" || err.details) {
        setOAuthDetails(err.details || { redirectUri: "https://leonunesbarbearia.vercel.app/auth/callback" });
        setErrorMessage(null);
      } else {
        setOAuthDetails(null);
        setErrorMessage(err.message || "Erro de conexão ao iniciar cadastro com o Google. Tente novamente.");
      }
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isOAuthLoading) return;

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
          returnUrl: redirectUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else if (data.requiresEmailVerification) {
          setSuccessMessage(
            data.message ||
              "Cadastro iniciado com sucesso! Um e-mail de confirmação foi enviado para ativar sua conta."
          );
        } else {
          router.replace(redirectUrl);
        }
      } else {
        setErrorMessage(data.error || "Não foi possível concluir o cadastro. Verifique os dados.");
      }
    } catch {
      setErrorMessage("Erro de conexão ao realizar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
          <Link href="/" className="inline-block relative h-12 w-48 hover:opacity-90 transition-opacity">
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
          Crie sua Conta
        </h1>
        <p className="mt-2 text-center text-sm text-[#A6AEA8]">
          Cadastre-se na Léo Nunes Barbearia para agendar e gerenciar seus horários.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0D120E] border border-white/[0.08] py-8 px-6 sm:px-8 rounded-2xl shadow-2xl relative">
          {/* Mensagens de Sucesso */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[#25C440]/10 border border-[#25C440]/30 text-[#25C440] text-sm flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Alerta de Configuração Pendente no Wix com Instrução Direta e Cópia */}
          {oauthDetails && (
            <div className="mb-6 p-4 rounded-xl bg-[#25C440]/10 border border-[#25C440]/30 text-white text-xs sm:text-sm animate-in fade-in space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#25C440] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#25C440]">Configuração do Google no Wix</p>
                  <p className="text-[#A6AEA8] leading-relaxed">
                    Para habilitar o Google na Vercel, adicione a URL abaixo no campo <strong className="text-white">Allowed authorization redirect URIs</strong> do app no painel Wix Developers:
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#080B09] p-2.5 rounded-lg border border-white/[0.1]">
                <code className="text-[11px] text-[#25C440] font-mono flex-1 break-all select-all">
                  {oauthDetails.redirectUri || "https://leonunesbarbearia.vercel.app/auth/callback"}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(oauthDetails.redirectUri || "https://leonunesbarbearia.vercel.app/auth/callback");
                    setCopiedUri(true);
                    setTimeout(() => setCopiedUri(false), 2500);
                  }}
                  className="px-2.5 py-1.5 bg-[#25C440]/20 hover:bg-[#25C440]/30 text-[#25C440] rounded font-bold text-xs shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedUri ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUri ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#A6AEA8]">
                👉 Enquanto isso, você pode criar sua conta preenchendo o formulário logo abaixo.
              </p>
            </div>
          )}

          {/* Mensagens de Erro */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* OPÇÃO 1: Botão Oficial Google OAuth */}
          <button
            type="button"
            id="btn-google-signup"
            onClick={handleGoogleSignup}
            disabled={isOAuthLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-[#141C16] hover:bg-[#1A261D] border border-[#25C440]/35 hover:border-[#25C440]/70 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-[#25C440]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isOAuthLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#25C440]" />
                <span className="text-[#A6AEA8]">Conectando ao Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Separador Elegante */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-[#0D120E] px-3 text-[#7B857E]">ou cadastre-se com seus dados</span>
            </div>
          </div>

          {/* OPÇÃO 2: Formulário Manual */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5"
              >
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
                  className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5"
              >
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
                  className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5"
              >
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
                  className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5"
                >
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
                    placeholder="Mín. 6 dígitos"
                    className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#A6AEA8] mb-1.5"
                >
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
                    className="block w-full pl-10 pr-3.5 py-3 bg-[#080B09] border border-white/[0.1] rounded-xl text-white placeholder-[#5E6861] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25C440] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#7B857E]">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPassword ? "Ocultar senhas" : "Ver senhas digitadas"}</span>
              </button>
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

          {/* Garantias de Segurança */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-[#A6AEA8]">
              <ShieldCheck className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Conta Segura:</strong> Seus dados ficam protegidos no ecossistema oficial Wix Members.
              </span>
            </div>
          </div>

          {/* Link para Login */}
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

          {/* Voltar ao Início */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#7B857E] hover:text-[#25C440] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o início</span>
            </Link>
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
