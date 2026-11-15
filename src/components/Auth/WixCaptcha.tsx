"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import {
  WIX_RECAPTCHA_INVISIBLE_SITE_KEY,
  WIX_RECAPTCHA_VISIBLE_SITE_KEY,
} from "@/lib/wixAuth";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: "dark" | "light";
          size?: "normal" | "compact" | "invisible";
          tabindex?: number;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: any) => void;
        }
      ) => number;
      execute: (opt_widget_id?: number) => Promise<string>;
      reset: (opt_widget_id?: number) => void;
      getResponse: (opt_widget_id?: number) => string;
    };
    __onWixRecaptchaLoaded?: () => void;
  }
}

export interface WixCaptchaHandle {
  executeInvisible: () => Promise<string | null>;
  reset: () => void;
  getVisibleToken: () => string | null;
  isReady: boolean;
  hasScriptError: boolean;
}

export interface WixCaptchaProps {
  showVisible?: boolean;
  onVerify?: (token: string, type: "invisible" | "visible") => void;
  onExpired?: () => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  onFallbackOAuth?: () => void;
}

export const WixCaptcha = forwardRef<WixCaptchaHandle, WixCaptchaProps>(
  (
    {
      showVisible = false,
      onVerify,
      onExpired,
      onError,
      className = "",
      onFallbackOAuth,
    },
    ref
  ) => {
    const invisibleContainerRef = useRef<HTMLDivElement | null>(null);
    const visibleContainerRef = useRef<HTMLDivElement | null>(null);

    const invisibleWidgetIdRef = useRef<number | null>(null);
    const visibleWidgetIdRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [scriptError, setScriptError] = useState(false);
    const [visibleToken, setVisibleToken] = useState<string | null>(null);

    // Callbacks estáveis para não quebrar referências
    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    const onExpiredRef = useRef(onExpired);
    onExpiredRef.current = onExpired;

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    // Inicializa o reCAPTCHA invisível quando o script carregar
    const initInvisibleWidget = useCallback(() => {
      if (
        !window.grecaptcha ||
        !invisibleContainerRef.current ||
        invisibleWidgetIdRef.current !== null
      ) {
        return;
      }

      try {
        const id = window.grecaptcha.render(invisibleContainerRef.current, {
          sitekey: WIX_RECAPTCHA_INVISIBLE_SITE_KEY,
          size: "invisible",
          callback: (token: string) => {
            if (token) {
              onVerifyRef.current?.(token, "invisible");
            }
          },
          "error-callback": () => {
            onErrorRef.current?.(
              "Não foi possível concluir a verificação invisível."
            );
          },
        });
        invisibleWidgetIdRef.current = id;
        setIsReady(true);
      } catch (err: any) {
        console.warn("[WIX CAPTCHA] Erro ao renderizar invisível:", err);
      }
    }, []);

    // Inicializa o reCAPTCHA visível quando solicitado
    const initVisibleWidget = useCallback(() => {
      if (
        !window.grecaptcha ||
        !visibleContainerRef.current ||
        visibleWidgetIdRef.current !== null
      ) {
        return;
      }

      try {
        const id = window.grecaptcha.render(visibleContainerRef.current, {
          sitekey: WIX_RECAPTCHA_VISIBLE_SITE_KEY,
          theme: "dark",
          size: "normal",
          callback: (token: string) => {
            setVisibleToken(token);
            onVerifyRef.current?.(token, "visible");
          },
          "expired-callback": () => {
            setVisibleToken(null);
            onExpiredRef.current?.();
          },
          "error-callback": () => {
            setVisibleToken(null);
            onErrorRef.current?.(
              "Erro na verificação de segurança. Tente novamente."
            );
          },
        });
        visibleWidgetIdRef.current = id;
      } catch (err: any) {
        console.warn("[WIX CAPTCHA] Erro ao renderizar visível:", err);
      }
    }, []);

    // Carregamento assíncrono do script oficial do Google reCAPTCHA
    useEffect(() => {
      let isMounted = true;

      // Timeout para detectar se extensões/adblockers bloquearam o script
      const timeoutId = setTimeout(() => {
        if (!window.grecaptcha && isMounted) {
          setScriptError(true);
        }
      }, 7000);

      const onLoaded = () => {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        setScriptError(false);
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            if (isMounted) {
              initInvisibleWidget();
            }
          });
        }
      };

      if (typeof window !== "undefined" && typeof window.grecaptcha?.render === "function") {
        onLoaded();
      } else {
        const SCRIPT_ID = "wix-google-recaptcha-script";
        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

        window.__onWixRecaptchaLoaded = onLoaded;

        if (!script) {
          script = document.createElement("script");
          script.id = SCRIPT_ID;
          script.src =
            "https://www.google.com/recaptcha/api.js?onload=__onWixRecaptchaLoaded&render=explicit&hl=pt-BR";
          script.async = true;
          script.defer = true;
          script.onerror = () => {
            if (isMounted) {
              clearTimeout(timeoutId);
              setScriptError(true);
              onErrorRef.current?.(
                "A verificação de segurança foi bloqueada pelo navegador."
              );
            }
          };
          document.head.appendChild(script);
        }
      }

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }, [initInvisibleWidget]);

    // Quando `showVisible` mudar para true, inicializa o widget visível se ainda não estiver montado
    useEffect(() => {
      if (showVisible && window.grecaptcha && isReady) {
        // Pequeno atraso para garantir que o container DOM esteja montado
        const timer = setTimeout(() => {
          initVisibleWidget();
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [showVisible, isReady, initVisibleWidget]);

    // Métodos expostos para o formulário pai
    useImperativeHandle(
      ref,
      () => ({
        executeInvisible: async () => {
          if (!window.grecaptcha || invisibleWidgetIdRef.current === null) {
            return null;
          }

          try {
            // Executa a verificação invisível e retorna o token gerado
            const token = await window.grecaptcha.execute(
              invisibleWidgetIdRef.current
            );
            return token || null;
          } catch (err: any) {
            console.warn("[WIX CAPTCHA] Falha ao executar invisível:", err);
            return null;
          }
        },
        reset: () => {
          setVisibleToken(null);
          if (window.grecaptcha) {
            if (invisibleWidgetIdRef.current !== null) {
              try {
                window.grecaptcha.reset(invisibleWidgetIdRef.current);
              } catch {}
            }
            if (visibleWidgetIdRef.current !== null) {
              try {
                window.grecaptcha.reset(visibleWidgetIdRef.current);
              } catch {}
            }
          }
        },
        getVisibleToken: () => {
          if (visibleWidgetIdRef.current !== null && window.grecaptcha) {
            return window.grecaptcha.getResponse(visibleWidgetIdRef.current) || visibleToken;
          }
          return visibleToken;
        },
        isReady,
        hasScriptError: scriptError,
      }),
      [isReady, scriptError, visibleToken]
    );

    return (
      <div className={`w-full ${className}`}>
        {/* Container invisível sempre presente no DOM sem afetar o layout */}
        <div
          ref={invisibleContainerRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        />

        {/* Desafio Visível quando exigido pelo Wix */}
        {showVisible && (
          <div className="p-3.5 rounded-xl bg-[#080B09] border border-[#25C440]/30 shadow-inner flex flex-col items-center justify-center gap-2.5 my-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A6AEA8]">
              <ShieldCheck className="w-4 h-4 text-[#25C440]" />
              <span>Verificação de Segurança</span>
            </div>

            <div
              ref={visibleContainerRef}
              className="flex justify-center min-h-[78px] overflow-x-auto w-full max-w-[304px]"
            />

            <p className="text-[11px] text-[#7B857E] text-center max-w-xs">
              Marque a caixa acima para confirmar que você não é um robô e concluir o cadastro.
            </p>
          </div>
        )}

        {/* Fallback elegante quando bloqueadores de scripts impedem o carregamento do Google reCAPTCHA */}
        {scriptError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-2.5 my-3 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                A verificação de segurança do Google foi bloqueada pelo seu navegador (ex: bloqueador de anúncios ou modo restrito).
              </span>
            </div>
            {onFallbackOAuth && (
              <button
                type="button"
                onClick={onFallbackOAuth}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium transition-colors cursor-pointer text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Usar autenticação oficial Google / Wix</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

WixCaptcha.displayName = "WixCaptcha";
