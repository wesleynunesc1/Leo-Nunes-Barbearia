"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { isChristmasCampaignActive } from "@/config/christmasCampaign";

const STORAGE_KEY = "ln_christmas_audio_muted";
const TARGET_VOLUME = 0.50; // Volume a 50% conforme solicitado
const FADE_IN_MS = 2000;
const FADE_OUT_MS = 800;

export function ChristmasAudioManager() {
  const isChristmas = isChristmasCampaignActive();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingBeforeHiddenRef = useRef<boolean>(false);
  const isExplicitlyMutedRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showInvitePill, setShowInvitePill] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Limpa qualquer fade em andamento
  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Fade-in suave de volume
  const fadeIn = useCallback(
    (audio: HTMLAudioElement, targetVol = TARGET_VOLUME, durationMs = FADE_IN_MS) => {
      clearFade();
      const stepMs = 30;
      const totalSteps = Math.max(1, durationMs / stepMs);
      const volStep = targetVol / totalSteps;

      audio.volume = 0;
      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          clearFade();
          return;
        }
        const nextVol = Math.min(targetVol, audio.volume + volStep);
        audio.volume = nextVol;
        if (nextVol >= targetVol) {
          audio.volume = targetVol;
          clearFade();
        }
      }, stepMs);
    },
    [clearFade]
  );

  // Fade-out suave de volume antes de pausar
  const fadeOut = useCallback(
    (audio: HTMLAudioElement, durationMs = FADE_OUT_MS, onComplete?: () => void) => {
      clearFade();
      const stepMs = 30;
      const startVol = audio.volume;
      const totalSteps = Math.max(1, durationMs / stepMs);
      const volStep = startVol / totalSteps;

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          clearFade();
          onComplete?.();
          return;
        }
        const nextVol = Math.max(0, audio.volume - volStep);
        audio.volume = nextVol;
        if (nextVol <= 0.005) {
          audio.volume = 0;
          audio.pause();
          clearFade();
          onComplete?.();
        }
      }, stepMs);
    },
    [clearFade]
  );

  // Iniciar reprodução segura
  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearFade();
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          fadeIn(audio, TARGET_VOLUME, FADE_IN_MS);
          setShowInvitePill(false);
        })
        .catch(() => {
          // Bloqueado pelo navegador
          setIsPlaying(false);
          setShowInvitePill(true);
        });
    }
  }, [clearFade, fadeIn]);

  // Pausar reprodução segura com fade-out
  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeOut(audio, FADE_OUT_MS, () => {
      setIsPlaying(false);
    });
  }, [fadeOut]);

  // Alternar som manualmente ao clicar no botão
  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Usuário escolheu silenciar
      isExplicitlyMutedRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {}
      pauseAudio();
      setShowInvitePill(false);
    } else {
      // Usuário escolheu ativar som
      isExplicitlyMutedRef.current = false;
      try {
        localStorage.setItem(STORAGE_KEY, "false");
      } catch {}
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  useEffect(() => {
    if (!isChristmas) return;
    setMounted(true);

    // 1. Inicializar objeto de áudio persistente em memória
    const audio = new Audio("/audio/christmas-ambient.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    // 2. Verificar preferência do visitante em localStorage
    let savedMuted: string | null = null;
    try {
      savedMuted = localStorage.getItem(STORAGE_KEY);
    } catch {}

    const isMutedByUser = savedMuted === "true";
    isExplicitlyMutedRef.current = isMutedByUser;

    // 3. Se o usuário NÃO silenciou previamente, tentar reprodução automática
    if (!isMutedByUser) {
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay permitido pelo navegador
            setIsPlaying(true);
            fadeIn(audio, TARGET_VOLUME, FADE_IN_MS);
          })
          .catch(() => {
            // Autoplay bloqueado pelas políticas de mídia do navegador (ex: Safari iOS / Chrome sem interação)
            setIsPlaying(false);
            setShowInvitePill(true);

            // Listener de primeira interação na página para ativar suavemente (somente se não silenciado)
            const handleFirstInteraction = () => {
              if (isExplicitlyMutedRef.current) return;
              const currentAudio = audioRef.current;
              if (currentAudio && currentAudio.paused) {
                currentAudio.volume = 0;
                currentAudio
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    fadeIn(currentAudio, TARGET_VOLUME, FADE_IN_MS);
                    setShowInvitePill(false);
                  })
                  .catch(() => {});
              }
              cleanupInteractionListeners();
            };

            const cleanupInteractionListeners = () => {
              window.removeEventListener("pointerdown", handleFirstInteraction);
              window.removeEventListener("keydown", handleFirstInteraction);
            };

            window.addEventListener("pointerdown", handleFirstInteraction, {
              once: true,
              passive: true,
            });
            window.addEventListener("keydown", handleFirstInteraction, {
              once: true,
              passive: true,
            });
          });
      }
    } else {
      setIsPlaying(false);
    }

    // 4. Pausar ao ocultar a aba / retomar ao voltar
    const handleVisibilityChange = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      if (document.hidden) {
        if (!currentAudio.paused) {
          wasPlayingBeforeHiddenRef.current = true;
          currentAudio.pause();
        }
      } else {
        if (wasPlayingBeforeHiddenRef.current && !isExplicitlyMutedRef.current) {
          wasPlayingBeforeHiddenRef.current = false;
          currentAudio.volume = 0;
          currentAudio
            .play()
            .then(() => {
              setIsPlaying(true);
              fadeIn(currentAudio, TARGET_VOLUME, 1000);
            })
            .catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Auto-esconder o pill de convite após 8 segundos para manter discreto
    const pillTimer = setTimeout(() => {
      setShowInvitePill(false);
    }, 8000);

    return () => {
      clearTimeout(pillTimer);
      clearFade();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [isChristmas, clearFade, fadeIn]);

  if (!isChristmas || !mounted) return null;

  return (
    <div
      className="fixed z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] left-4 sm:bottom-6 sm:left-6 flex items-center select-none"
      aria-label="Controle de música ambiente natalina"
    >
      {/* Botão de Som Minimalista */}
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? "Desativar música natalina" : "Ativar música natalina"}
        title={isPlaying ? "Silenciar música de Natal" : "Ouvir música de Natal"}
        className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full backdrop-blur-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25C440] cursor-pointer ${
          isPlaying
            ? "bg-[#0B150E]/90 border border-[#25C440]/60 text-[#25C440] shadow-[0_0_18px_rgba(37,196,64,0.35)] hover:shadow-[0_0_25px_rgba(37,196,64,0.5)] hover:scale-105"
            : "bg-[#0A0D0B]/85 border border-white/20 text-[#A2ADA5] hover:text-[#FFFFFF] hover:border-[#25C440]/40 hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Pulso discreto ao redor do botão enquanto toca */}
        {isPlaying && (
          <span
            className="absolute -inset-1 rounded-full bg-[#25C440]/15 animate-pulse pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Ícone de Volume */}
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2] animate-in fade-in zoom-in-95 duration-200" />
            {/* Ondinhas de som decorativas */}
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#25C440] animate-ping opacity-75"
              aria-hidden="true"
            />
          </div>
        ) : (
          <VolumeX className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2] animate-in fade-in zoom-in-95 duration-200" />
        )}
      </button>

      {/* Pill Discreto de Convite (quando o autoplay foi pausado pelo navegador na primeira visita) */}
      {showInvitePill && !isPlaying && (
        <div
          role="status"
          className="ml-3 px-3 py-1.5 rounded-full bg-[#0D150F]/95 border border-[#25C440]/40 text-xs text-[#D8E6DC] shadow-[0_6px_20px_rgba(0,0,0,0.7)] backdrop-blur-md flex items-center gap-1.5 cursor-pointer animate-in fade-in slide-in-from-left-2 duration-300 hover:border-[#25C440] transition-colors"
          onClick={toggleAudio}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E5C158] shrink-0" aria-hidden="true" />
          <span className="font-medium whitespace-nowrap">Música de Natal</span>
        </div>
      )}
    </div>
  );
}

