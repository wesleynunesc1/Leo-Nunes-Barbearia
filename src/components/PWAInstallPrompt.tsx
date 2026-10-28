"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone, Check } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Verifica se já está rodando em modo standalone (PWA instalado)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Verifica se o usuário recusou recentemente (respeita recusas por 7 dias)
    const dismissedTime = localStorage.getItem("leo_nunes_pwa_dismissed");
    if (dismissedTime) {
      const diffDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return;
      }
    }

    // 3. Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // 4. Captura evento beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Exibe após 3 segundos para não interromper carregamento inicial
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Escuta quando for instalado com sucesso
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      localStorage.setItem("leo_nunes_pwa_installed", "true");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Para iOS, exibe após alguns segundos se não foi recusado
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsVisible(false);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("leo_nunes_pwa_dismissed", Date.now().toString());
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Banner Principal de Instalação */}
      <aside
        aria-label="Instalação do Aplicativo Leo Nunes Barbearia"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-[#0D120E]/95 backdrop-blur-md border border-[#25C440]/30 rounded-2xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-start gap-3.5">
          {/* Logo Original da Barbearia sobre Preto Puro */}
          <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
            <Image
              src="/images/logo.png"
              alt="Leo Nunes Barbearia"
              width={40}
              height={14}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white leading-tight">
                Leo Nunes Barbearia no seu celular.
              </h3>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[#7B857E] hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A6AEA8] mt-1 leading-normal">
              Instale nosso aplicativo e tenha seus agendamentos sempre à mão.
            </p>

            <div className="flex items-center gap-2.5 mt-3.5">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-[0_0_15px_rgba(37,196,64,0.3)] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar aplicativo</span>
                </button>
              ) : isIos ? (
                <button
                  type="button"
                  onClick={() => setShowIosGuide(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-extrabold text-xs shadow-[0_0_15px_rgba(37,196,64,0.3)] transition-all cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Como instalar no iPhone</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A6AEA8] hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal Guia Passo a Passo para iPhone / iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D120E] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#25C440]" />
                <span>Instalar no iPhone</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="text-[#7B857E] hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3.5 text-xs text-[#A6AEA8]">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#142618] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                <p>
                  No Safari do iPhone, toque no botão de <strong className="text-white">Compartilhar</strong>{" "}
                  <Share2 className="inline w-3.5 h-3.5 text-[#25C440] mx-0.5" /> na barra inferior.
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#142618] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                <p>
                  Role o menu para baixo e selecione <strong className="text-white">&quot;Adicionar à Tela de Início&quot;</strong>{" "}
                  <PlusSquare className="inline w-3.5 h-3.5 text-[#25C440] mx-0.5" />.
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#142618] text-[#25C440] border border-[#25C440]/30 flex items-center justify-center font-bold shrink-0">
                  3
                </span>
                <p>
                  Toque em <strong className="text-[#25C440]">&quot;Adicionar&quot;</strong> no canto superior direito para finalizar.
                </p>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-[#25C440] text-[#080B09] font-bold text-xs hover:bg-[#2CD64A] transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
