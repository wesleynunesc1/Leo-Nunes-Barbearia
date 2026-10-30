"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * HeroVideo Component
 * Gerenciador robusto de reprodução contínua e ininterrupta do vídeo da Hero.
 * Garante autoplay contínuo tanto no Desktop quanto no Mobile (iOS Safari, Android Chrome),
 * evitando pausas por economia de energia, troca de aba, scroll ou fim de loop.
 */
export function HeroVideo() {
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const desktopVideo = desktopVideoRef.current;
    const mobileVideo = mobileVideoRef.current;
    const videos = [desktopVideo, mobileVideo].filter(
      (v): v is HTMLVideoElement => v !== null
    );

    // 1. Configurações obrigatórias no nível de propriedade DOM para WebKit/Safari
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x5-playsinline", "");
    });

    // Função de reprodução segura com retry
    const ensurePlayback = (video: HTMLVideoElement) => {
      // Verifica se o elemento está visível no breakpoint atual (não display: none)
      const style = window.getComputedStyle(video);
      if (style.display === "none") return;

      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Bloqueado temporariamente pelo navegador; aguardará primeiro toque/scroll
        });
      }
    };

    const playActiveVideos = () => {
      videos.forEach(ensurePlayback);
    };

    // 2. Inicia reprodução imediata
    playActiveVideos();

    // 3. Retoma reprodução quando a aba volta a ficar visível ou smartphone é desbloqueado
    const handleVisibility = () => {
      if (!document.hidden) {
        playActiveVideos();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", playActiveVideos);
    window.addEventListener("pageshow", playActiveVideos);

    // 4. Desbloqueia autoplay em dispositivos móveis no primeiro toque ou rolagem
    const unlockGestures = ["touchstart", "touchend", "click", "scroll"];
    const handleUnlock = () => {
      playActiveVideos();
      unlockGestures.forEach((evt) =>
        window.removeEventListener(evt, handleUnlock)
      );
    };
    unlockGestures.forEach((evt) =>
      window.addEventListener(evt, handleUnlock, { passive: true })
    );

    // 5. Watchdog de segurança contínuo: verifica a cada 1.5s se algum vídeo visível foi pausado
    const watchdogInterval = setInterval(() => {
      if (!document.hidden) {
        videos.forEach((video) => {
          const style = window.getComputedStyle(video);
          if (style.display !== "none" && video.paused) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    }, 1500);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", playActiveVideos);
      window.removeEventListener("pageshow", playActiveVideos);
      unlockGestures.forEach((evt) =>
        window.removeEventListener(evt, handleUnlock)
      );
      clearInterval(watchdogInterval);
    };
  }, []);

  return (
    <>
      {/* Desktop Background (md e superiores - Vídeo hero otimizado com fallback poster) */}
      <div className="hidden md:block absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <video
          ref={desktopVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/hero-barbearia-desktop.webp"
          onEnded={(e) => {
            const v = e.currentTarget;
            v.currentTime = 0;
            v.play().catch(() => {});
          }}
          onPause={(e) => {
            if (!document.hidden) {
              e.currentTarget.play().catch(() => {});
            }
          }}
          className="w-full h-full object-cover object-[65%_center] brightness-[0.92] contrast-[1.05]"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Gradiente escuro à esquerda para legibilidade máxima da headline */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B09] via-[#080B09]/75 to-transparent z-10" />
        {/* Vinheta superior suave sob o header */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080B09]/90 via-[#080B09]/30 to-transparent z-10" />
        {/* Vinheta inferior para fusão com a barra de destaques */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#080B09] via-[#080B09]/60 to-transparent z-10" />
      </div>

      {/* Mobile Background (abaixo de md - Enquadramento aberto, fundo ambiente e loop infinito sem engasgos) */}
      <div className="block md:hidden absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* 1. Camada de Fundo Complementar Estática (Zero sobrecarga de decodificadores de vídeo simultâneos no iOS) */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src="/images/hero-barbearia-mobile.webp"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center scale-110 blur-2xl opacity-35 brightness-75"
          />
        </div>

        {/* 2. Camada Principal Focal com Enquadramento Aberto 16:9 (Zero cortes laterais) */}
        <div
          className="absolute inset-x-0 top-0 w-full aspect-video overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        >
          <video
            ref={mobileVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/images/hero-barbearia-mobile.webp"
            onEnded={(e) => {
              const v = e.currentTarget;
              v.currentTime = 0;
              v.play().catch(() => {});
            }}
            onPause={(e) => {
              if (!document.hidden) {
                e.currentTarget.play().catch(() => {});
              }
            }}
            className="w-full h-full object-cover object-center brightness-[0.98] contrast-[1.05]"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Suave fusão inferior extra como fallback */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080B09]/80 to-transparent pointer-events-none" />
        </div>

        {/* 3. Vinheta Superior Suave sob o header transparente */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080B09]/85 via-[#080B09]/25 to-transparent z-10 pointer-events-none" />

        {/* 4. Gradiente Inferior Calibrado para contraste dos textos, badges e botões */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B09] via-[#080B09]/80 via-40% to-transparent z-10 pointer-events-none" />
      </div>
    </>
  );
}

