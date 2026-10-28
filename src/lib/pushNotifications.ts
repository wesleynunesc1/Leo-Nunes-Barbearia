import webpush from "web-push";
import {
  getAllSubscriptions,
  getSubscriptionsByMember,
  removeSubscription,
  StoredSubscription,
} from "./pushSubscriptionStore";

const DEFAULT_VAPID_PUBLIC =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BDZnflFa1MGc5HYnsOVjPCoPCNaVoT_gEGoBJP477zc19eJNNBvpGoRhJU-uEaUT08XqN4I9YDWIuRpzQifCQGc";

const DEFAULT_VAPID_PRIVATE =
  process.env.VAPID_PRIVATE_KEY ||
  "4mjk3xkR0EA-rGIm9NsAdX6vS15rTfz9nhvW-mM-1qk";

const DEFAULT_VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:contato@leonunesbarbearia.com.br";

try {
  webpush.setVapidDetails(
    DEFAULT_VAPID_SUBJECT,
    DEFAULT_VAPID_PUBLIC,
    DEFAULT_VAPID_PRIVATE
  );
} catch (err) {
  console.error("[pushNotifications] Failed to set VAPID details:", err);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
}

export async function sendNotificationToSubscription(
  sub: StoredSubscription,
  payload: PushPayload
): Promise<boolean> {
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: payload.title || "Leo Nunes Barbearia ✂️",
        body: payload.body,
        url: payload.url || "/minha-conta/agendamentos",
        icon: payload.icon || "/icon-192.png",
        badge: payload.badge || "/icon-192.png",
      })
    );
    return true;
  } catch (err: any) {
    // Se a inscrição expirou (410 Gone ou 404 Not Found), remove do banco
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log(`[pushNotifications] Removing expired subscription: ${sub.endpoint}`);
      await removeSubscription(sub.endpoint);
    } else {
      console.error("[pushNotifications] Error sending push:", err.message || err);
    }
    return false;
  }
}

export async function sendPushNotification(
  target: { memberId?: string; endpoint?: string },
  payload: PushPayload
): Promise<{ sent: number; total: number }> {
  let targetSubs: StoredSubscription[] = [];

  if (target.endpoint) {
    const all = await getAllSubscriptions();
    const found = all.find((s) => s.endpoint === target.endpoint);
    if (found) targetSubs = [found];
  } else if (target.memberId) {
    targetSubs = await getSubscriptionsByMember(target.memberId);
  } else {
    targetSubs = await getAllSubscriptions();
  }

  if (targetSubs.length === 0) {
    return { sent: 0, total: 0 };
  }

  let sent = 0;
  for (const sub of targetSubs) {
    const success = await sendNotificationToSubscription(sub, payload);
    if (success) sent++;
  }

  return { sent, total: targetSubs.length };
}

export function getVapidPublicKey(): string {
  return DEFAULT_VAPID_PUBLIC;
}
