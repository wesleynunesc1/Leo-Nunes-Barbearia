"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, CheckCircle2, AlertCircle, Loader2, Sparkles, Send } from "lucide-react";

export function PushNotificationManager() {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Helper para converter VAPID base64 para Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Verifica suporte e estado inicial da inscrição
  useEffect(() => {
    async function checkState() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSupported(false);
        setLoading(false);
        return;
      }

      setPermission(Notification.permission);

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (err) {
        console.error("[PushManager] Error reading subscription:", err);
      } finally {
        setLoading(false);
      }
    }

    checkState();
  }, []);

  // Ativar Notificações
  async function handleSubscribe() {
    setActionLoading(true);
    setMessage(null);

    try {
      if (!("Notification" in window)) {
        throw new Error("Seu navegador não possui suporte a notificações.");
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        if (perm === "denied") {
          throw new Error("Permissão bloqueada no navegador. Permita o envio nas configurações do seu navegador.");
        }
        setActionLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // Obtém chave pública VAPID do backend
      const keyRes = await fetch("/api/push/public-key");
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        throw new Error("Chave de push não configurada no servidor.");
      }

      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Salva no backend
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (!saveRes.ok) {
        throw new Error("Falha ao sincronizar inscrição com o servidor.");
      }

      setIsSubscribed(true);
      setMessage({
        text: "Notificações ativadas! Você receberá avisos dos seus agendamentos diretamente neste dispositivo.",
        type: "success",
      });
    } catch (err: any) {
      console.error("[handleSubscribe] Error:", err);
      setMessage({
        text: err.message || "Erro ao ativar notificações.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  }

  // Desativar Notificações
  async function handleUnsubscribe() {
    setActionLoading(true);
    setMessage(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
      setMessage({
        text: "Notificações desativadas para este aparelho.",
        type: "info",
      });
    } catch (err: any) {
      console.error("[handleUnsubscribe] Error:", err);
      setMessage({
        text: err.message || "Erro ao desativar notificações.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  }

  // Enviar Teste Real
  async function handleSendTest() {
    setActionLoading(true);
    setMessage(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub?.endpoint }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Falha ao enviar notificação de teste.");
      }

      setMessage({
        text: "Notificação de teste disparada! Verifique a central de avisos do seu sistema operacional.",
        type: "success",
      });
    } catch (err: any) {
      console.error("[handleSendTest] Error:", err);
      setMessage({
        text: err.message || "Erro ao enviar teste.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="bg-[#0D120E] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#25C440]/5 rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#142618] border border-[#25C440]/30 flex items-center justify-center text-[#25C440]">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Notificações no seu aparelho</span>
            </h2>
            <p className="text-xs text-[#A6AEA8] mt-0.5">
              Receba confirmações de corte, lembretes de atendimento e avisos em tempo real
            </p>
          </div>
        </div>

        {/* Badge de Status */}
        <div className="self-start sm:self-center">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#A6AEA8]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Verificando...
            </span>
          ) : !supported ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#7B857E] border border-white/10">
              <BellOff className="w-3.5 h-3.5" />
              Não suportado neste navegador
            </span>
          ) : permission === "denied" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Permissão Bloqueada
            </span>
          ) : isSubscribed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#142618] text-[#25C440] border border-[#25C440]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Notificações Ativadas
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#A6AEA8] border border-white/10">
              <Bell className="w-3.5 h-3.5" />
              Desativadas
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo / Mensagens / Botões */}
      <div className="space-y-4 relative z-10">
        <p className="text-xs sm:text-sm text-[#A6AEA8] leading-relaxed">
          Ao ativar, você recebe lembretes pontuais dos seus agendamentos no fuso oficial de Pacajus (America/Fortaleza), atualizações caso o barbeiro altere o horário e confirmação instantânea das suas reservas.
        </p>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-[#142618] border border-[#25C440]/40 text-[#25C440]"
                : message.type === "error"
                ? "bg-red-500/10 border border-red-500/30 text-red-300"
                : "bg-white/5 border border-white/10 text-white"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {permission === "denied" && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            As notificações estão bloqueadas nas configurações do seu navegador. Para reativar, clique no cadeado da barra de endereço e altere &quot;Notificações&quot; para &quot;Permitir&quot;.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {!isSubscribed ? (
            <button
              type="button"
              disabled={actionLoading || !supported || permission === "denied"}
              onClick={handleSubscribe}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25C440] hover:bg-[#2CD64A] text-[#080B09] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,196,64,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Ativar Notificações</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSendTest}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#142618] hover:bg-[#1C3622] border border-[#25C440]/40 text-[#25C440] font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Testar Recebimento</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleUnsubscribe}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141815] hover:bg-[#1D241F] border border-white/[0.08] hover:border-red-500/30 text-[#A6AEA8] hover:text-red-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <BellOff className="w-4 h-4" />
                <span>Desativar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
