"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      // 1. Tenta obter code e state de query params
      let code = searchParams.get("code");
      let state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDesc = searchParams.get("error_description");

      if (errorParam) {
        setErrorMsg(errorDesc || errorParam || "Autenticação cancelada ou recusada.");
        return;
      }

      // 2. Se não estiver nos query params, verifica o hash do fragmento (#code=...&state=...)
      if (!code && typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        code = hashParams.get("code");
        state = hashParams.get("state");
      }

      if (!code || !state) {
        setErrorMsg("Parâmetros de autorização não recebidos do Wix. Tente novamente.");
        return;
      }

      try {
        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const redirectUrl = data.redirectUrl || "/minha-conta";
          window.location.href = redirectUrl;
        } else {
          setErrorMsg(data.error || "Falha ao validar sessão Wix. Tente fazer login novamente.");
        }
      } catch (err: any) {
        console.error("[AUTH CALLBACK CLIENT ERROR]", err);
        setErrorMsg("Erro de conexão ao processar login. Verifique sua internet.");
      }
    }

    processCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#080B09] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0D120E] border border-white/[0.08] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#25C440]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative h-12 w-44 mb-6">
            <Image
              src="/images/logo.png"
              alt="Léo Nunes Barbearia"
              fill
              priority
              className="object-contain"
            />
          </div>

          {!errorMsg ? (
            <>
              <div className="w-12 h-12 rounded-full bg-[#142016] border border-[#25C440]/30 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-[#25C440] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Conectando sua conta...</h1>
              <p className="text-sm text-[#A6AEA8]">
                Validando suas credenciais oficiais junto ao Wix. Aguarde um instante.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Falha na Autenticação</h1>
              <p className="text-sm text-red-300/90 mb-6">{errorMsg}</p>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full py-3 px-4 rounded-xl bg-[#25C440] text-[#080B09] font-extrabold text-sm hover:bg-[#2CD64A] transition-colors"
              >
                Voltar ao Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B09] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#25C440] animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
