"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft, Calendar, Sparkles } from "lucide-react";
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

  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(errorParam);

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

  const handleGoogleSignup = async () => {
    if (isOAuthLoading) return;
    setIsOAuthLoading(true);
    setErrorMessage(null);

    try {
      await initiateOAuth("signup", redirectUrl);
    } catch (err: any) {
      console.error("[GOOGLE SIGNUP TRIGGER ERROR]", err);
      setErrorMessage("Erro de conexão ao iniciar cadastro com o Google. Tente novamente.");
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
          Cadastre-se com o Google em poucos segundos para gerenciar seus agendamentos.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0D120E] border border-white/[0.08] py-8 px-6 sm:px-8 rounded-2xl shadow-2xl relative">
          {/* Mensagens de Erro */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-in fade-in">
              <span className="text-red-400 font-bold shrink-0">✕</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Botão Oficial Google OAuth */}
          <button
            type="button"
            id="btn-google-signup"
            onClick={handleGoogleSignup}
            disabled={isOAuthLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl bg-[#141C16] hover:bg-[#1A261D] border border-[#25C440]/35 hover:border-[#25C440]/70 text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-[#25C440]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
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

          {/* Vantagens do Cadastro */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-3.5">
            <div className="flex items-start gap-3 text-xs text-[#A6AEA8]">
              <Sparkles className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Cadastro Instantâneo:</strong> Sem formulários demorados ou senhas para memorizar.
              </span>
            </div>
            <div className="flex items-start gap-3 text-xs text-[#A6AEA8]">
              <Calendar className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Histórico Completo:</strong> Acompanhe reservas futuras e agendamentos anteriores.
              </span>
            </div>
            <div className="flex items-start gap-3 text-xs text-[#A6AEA8]">
              <ShieldCheck className="w-4 h-4 text-[#25C440] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">Privacidade e Segurança:</strong> Seus dados protegidos pela infraestrutura oficial do Google e Wix.
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
