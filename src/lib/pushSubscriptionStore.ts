import fs from "fs";
import path from "path";

export interface StoredSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  memberId?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_SUBSCRIPTIONS_FILE = path.join(process.cwd(), ".push_subscriptions.json");

function getKvConfig() {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (url && token && !token.includes("READ_ONLY")) {
    return { url, token };
  }
  return null;
}

async function kvGet<T>(key: string): Promise<T | null> {
  const config = getKvConfig();
  if (!config) return null;
  try {
    const res = await fetch(`${config.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (err) {
    console.error("[pushSubscriptionStore] KV get error:", err);
    return null;
  }
}

async function kvSet(key: string, value: any): Promise<boolean> {
  const config = getKvConfig();
  if (!config) return false;
  try {
    const res = await fetch(`${config.url}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(value)),
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.error("[pushSubscriptionStore] KV set error:", err);
    return false;
  }
}

function loadLocalSubscriptions(): StoredSubscription[] {
  try {
    if (fs.existsSync(LOCAL_SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(LOCAL_SUBSCRIPTIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[pushSubscriptionStore] Error reading local file:", err);
  }
  return [];
}

function saveLocalSubscriptions(subs: StoredSubscription[]) {
  try {
    fs.writeFileSync(LOCAL_SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
  } catch (err) {
    console.error("[pushSubscriptionStore] Error saving local file:", err);
  }
}

export async function getAllSubscriptions(): Promise<StoredSubscription[]> {
  const kvConfig = getKvConfig();
  if (kvConfig) {
    const fromKv = await kvGet<StoredSubscription[]>("leo_nunes_push_subs");
    if (fromKv && Array.isArray(fromKv)) return fromKv;
  }
  return loadLocalSubscriptions();
}

export async function saveSubscription(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  memberId?: string,
  userAgent?: string
): Promise<void> {
  const subs = await getAllSubscriptions();
  const now = new Date().toISOString();
  const existingIndex = subs.findIndex((s) => s.endpoint === sub.endpoint);

  const entry: StoredSubscription = {
    endpoint: sub.endpoint,
    keys: sub.keys,
    memberId: memberId || subs[existingIndex]?.memberId,
    userAgent: userAgent || subs[existingIndex]?.userAgent,
    createdAt: subs[existingIndex]?.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    subs[existingIndex] = entry;
  } else {
    subs.push(entry);
  }

  const kvConfig = getKvConfig();
  if (kvConfig) {
    await kvSet("leo_nunes_push_subs", subs);
  } else {
    saveLocalSubscriptions(subs);
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  let subs = await getAllSubscriptions();
  subs = subs.filter((s) => s.endpoint !== endpoint);

  const kvConfig = getKvConfig();
  if (kvConfig) {
    await kvSet("leo_nunes_push_subs", subs);
  } else {
    saveLocalSubscriptions(subs);
  }
}

export async function getSubscriptionsByMember(memberId?: string): Promise<StoredSubscription[]> {
  const subs = await getAllSubscriptions();
  if (!memberId) return subs;
  return subs.filter((s) => s.memberId === memberId);
}
