import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { BookingErrorCode } from "../types/booking";

export interface IdempotencyRecord {
  idempotencyKey: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  phone: string;
  status: "IN_FLIGHT" | "CONFIRMED" | "PENDING" | "CHECKOUT_REQUIRED" | "INCONCLUSIVE" | "FAILED";
  bookingId?: string;
  createdAt: number;
  responsePayload?: any;
}

export interface BookingLockIdentifier {
  userLockKey: string;
  slotLockKey: string;
  ownerToken: string;
}

/**
 * Interface abstrata de armazenamento para suportar tanto armazenamento distribuído
 * em produção na Vercel (Upstash Redis via KV REST API) quanto desenvolvimento local.
 */
export interface BookingStorageAdapter {
  name: string;
  acquireLock(lockKey: string, ttlSeconds: number, ownerToken: string): Promise<boolean>;
  releaseLock(lockKey: string, ownerToken?: string): Promise<void>;
  releaseLocks?(lockKeys: string[], ownerToken?: string): Promise<void>;
  getIdempotency(key: string): Promise<IdempotencyRecord | null>;
  setIdempotency(key: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void>;
  testConnection?(): Promise<{ ok: boolean; latencyMs?: number; error?: string }>;
}

// ============================================================================
// 1. PREFIXOS E DETECÇÃO DE AMBIENTE (LOCALHOST / PREVIEW / PRODUÇÃO)
// ============================================================================

export type RuntimeEnvironment = "prod" | "prev" | "dev" | "local";

/**
 * Identifica o ambiente de execução para separar os prefixos de chaves no Redis:
 * - Vercel Production: 'prod'
 * - Vercel Preview (PR / branch deploy): 'prev'
 * - Vercel Development: 'dev'
 * - Localhost / outros: 'local'
 */
export function getEnvironmentPrefix(): RuntimeEnvironment {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv === "production") return "prod";
  if (vercelEnv === "preview") return "prev";
  if (vercelEnv === "development") return "dev";
  if (process.env.NODE_ENV === "production") return "prod";
  return "local";
}

/**
 * Retorna se o código está executando no ambiente serverless da Vercel.
 */
export function isVercelEnvironment(): boolean {
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.VERCEL_URL)
  );
}

/**
 * Formata chave Redis com namespace e prefixo de isolamento de ambiente.
 * Exemplo: 'lnb:local:lock:slot_leo-nunes_2026-10-28_18:00'
 */
export function formatStorageKey(namespace: "lock" | "idemp", rawKey: string): string {
  const env = getEnvironmentPrefix();
  return `lnb:${env}:${namespace}:${rawKey}`;
}

/**
 * Detecta e resolve automaticamente as credenciais Redis de escrita disponíveis:
 * 1. Prioridade: Vercel KV REST API oficial (KV_REST_API_URL + KV_REST_API_TOKEN)
 * 2. Compatibilidade: Upstash Redis direto (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * Observação: KV_REST_API_READ_ONLY_TOKEN é explicitamente ignorado pois não possui permissão de escrita/lock.
 */
export function resolveRedisConfig(): { url: string; token: string; source: string } | null {
  // 1. Integração oficial Vercel KV REST API
  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();

  if (kvUrl && kvToken) {
    return {
      url: kvUrl,
      token: kvToken,
      source: "KV_REST_API (Vercel Integration)",
    };
  }

  // 2. Variáveis diretas Upstash Redis
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (upstashUrl && upstashToken) {
    return {
      url: upstashUrl,
      token: upstashToken,
      source: "UPSTASH_REDIS_REST (Direct)",
    };
  }

  return null;
}

// ============================================================================
// 2. ADAPTER DE PRODUÇÃO: UPSTASH REDIS REST API (Vercel KV / Upstash)
// ============================================================================

/**
 * Lua script atômico para liberação de lock exclusivo pelo proprietário (ownerToken).
 * Deleta a chave apenas se o valor armazenado for estritamente igual ao token de posse.
 */
const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

/**
 * Lua script para liberação em lote verificando posse de cada chave.
 */
const BATCH_RELEASE_LOCK_LUA = `
local deleted = 0
for i = 1, #KEYS do
  if redis.call("get", KEYS[i]) == ARGV[1] then
    deleted = deleted + redis.call("del", KEYS[i])
  end
end
return deleted
`;

class UpstashRedisStorageAdapter implements BookingStorageAdapter {
  name = "upstash-redis";
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "");
    this.token = token;
  }

  private async executeCommand(...args: any[]): Promise<any> {
    const res = await fetch(`${this.url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Upstash Redis HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.error) {
      throw new Error(`Upstash Redis Command Error: ${json.error}`);
    }

    return json.result;
  }

  async acquireLock(lockKey: string, ttlSeconds: number, ownerToken: string): Promise<boolean> {
    // SET lockKey ownerToken EX ttlSeconds NX (Operação Atômica)
    const result = await this.executeCommand("SET", lockKey, ownerToken, "EX", ttlSeconds, "NX");
    return result === "OK";
  }

  async releaseLock(lockKey: string, ownerToken?: string): Promise<void> {
    try {
      if (ownerToken) {
        // Liberação segura atômica via Lua: somente quem adquiriu pode liberar
        await this.executeCommand("EVAL", RELEASE_LOCK_LUA, "1", lockKey, ownerToken);
      } else {
        await this.executeCommand("DEL", lockKey);
      }
    } catch (err: any) {
      console.warn("[UPSTASH RELEASE LOCK WARNING]", err?.message || err);
    }
  }

  async releaseLocks(lockKeys: string[], ownerToken?: string): Promise<void> {
    if (!lockKeys || lockKeys.length === 0) return;
    try {
      if (ownerToken) {
        // Liberação atômica em lote com verificação de proprietário
        await this.executeCommand(
          "EVAL",
          BATCH_RELEASE_LOCK_LUA,
          String(lockKeys.length),
          ...lockKeys,
          ownerToken
        );
      } else {
        await this.executeCommand("DEL", ...lockKeys);
      }
    } catch (err: any) {
      console.warn("[UPSTASH RELEASE LOCKS WARNING]", err?.message || err);
    }
  }

  async getIdempotency(key: string): Promise<IdempotencyRecord | null> {
    const raw = await this.executeCommand("GET", key);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }

  async setIdempotency(key: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void> {
    await this.executeCommand("SET", key, JSON.stringify(record), "EX", ttlSeconds);
  }

  async testConnection(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      const pong = await this.executeCommand("PING");
      const latencyMs = Date.now() - start;
      if (pong === "PONG" || pong === "OK") {
        return { ok: true, latencyMs };
      }
      return { ok: false, error: `Resposta inesperada do Redis: ${String(pong)}` };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }
}

// ============================================================================
// 3. ADAPTER LOCAL: ARQUIVO (.bookings_lock.json) PARA AMBIENTE LOCAL
// ============================================================================

class FileStorageAdapter implements BookingStorageAdapter {
  name = "file-system";
  private filePath = path.join(process.cwd(), ".bookings_lock.json");
  private queue: Promise<any> = Promise.resolve();

  private runInQueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => {});
    return next;
  }

  private async readData(): Promise<Record<string, any>> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private async writeData(data: Record<string, any>): Promise<void> {
    try {
      const now = Date.now();
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v && v.expiresAt && v.expiresAt < now) continue;
        if (v && v.createdAt && now - v.createdAt > 86400000) continue;
        cleaned[k] = v;
      }
      await fs.writeFile(this.filePath, JSON.stringify(cleaned, null, 2), "utf-8");
    } catch (err) {
      console.warn("[FILE STORAGE WRITE ERROR]", err);
    }
  }

  async acquireLock(lockKey: string, ttlSeconds: number, ownerToken: string): Promise<boolean> {
    return this.runInQueue(async () => {
      const data = await this.readData();
      const now = Date.now();
      const existing = data[lockKey];

      if (existing && existing.expiresAt && existing.expiresAt > now) {
        return false;
      }

      data[lockKey] = {
        lockKey,
        ownerToken,
        acquiredAt: now,
        expiresAt: now + ttlSeconds * 1000,
      };

      await this.writeData(data);
      return true;
    });
  }

  async releaseLock(lockKey: string, ownerToken?: string): Promise<void> {
    return this.runInQueue(async () => {
      const data = await this.readData();
      const existing = data[lockKey];
      // Libera somente se o lock pertencer ao ownerToken solicitado
      if (!existing || !ownerToken || existing.ownerToken === ownerToken) {
        delete data[lockKey];
        await this.writeData(data);
      }
    });
  }

  async releaseLocks(lockKeys: string[], ownerToken?: string): Promise<void> {
    return this.runInQueue(async () => {
      const data = await this.readData();
      for (const key of lockKeys) {
        const existing = data[key];
        if (!existing || !ownerToken || existing.ownerToken === ownerToken) {
          delete data[key];
        }
      }
      await this.writeData(data);
    });
  }

  async getIdempotency(key: string): Promise<IdempotencyRecord | null> {
    return this.runInQueue(async () => {
      const data = await this.readData();
      const now = Date.now();
      const item = data[key];
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < now) return null;
      return item;
    });
  }

  async setIdempotency(key: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void> {
    return this.runInQueue(async () => {
      const data = await this.readData();
      data[key] = {
        ...record,
        expiresAt: Date.now() + ttlSeconds * 1000,
      };
      await this.writeData(data);
    });
  }

  async testConnection(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.readData();
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }
}

// ============================================================================
// 4. ADAPTER DE BLOQUEIO PARA VERCEL SEM REDIS (FAIL-CLOSED)
// ============================================================================

class VercelMissingRedisAdapter implements BookingStorageAdapter {
  name = "vercel-missing-redis";

  async acquireLock(): Promise<boolean> {
    throw new Error(
      "Ambiente Vercel detectado sem credenciais Upstash Redis (KV_REST_API_URL e KV_REST_API_TOKEN). O armazenamento local em arquivo é proibido em produção serverless."
    );
  }

  async releaseLock(): Promise<void> {}
  async releaseLocks(): Promise<void> {}

  async getIdempotency(): Promise<IdempotencyRecord | null> {
    throw new Error("Redis não configurado na Vercel.");
  }

  async setIdempotency(): Promise<void> {
    throw new Error("Redis não configurado na Vercel.");
  }

  async testConnection(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    return {
      ok: false,
      error:
        "Variáveis KV_REST_API_URL e KV_REST_API_TOKEN não encontradas no ambiente Vercel. Conecte o Upstash Redis pela integração oficial.",
    };
  }
}

// ============================================================================
// 5. FÁBRICA DO ADAPTER
// ============================================================================

let activeAdapter: BookingStorageAdapter | null = null;

export function getStorageAdapter(): BookingStorageAdapter {
  if (activeAdapter) return activeAdapter;

  const redisConfig = resolveRedisConfig();

  if (redisConfig) {
    activeAdapter = new UpstashRedisStorageAdapter(redisConfig.url, redisConfig.token);
  } else if (isVercelEnvironment()) {
    activeAdapter = new VercelMissingRedisAdapter();
  } else {
    activeAdapter = new FileStorageAdapter();
  }

  return activeAdapter;
}

export function resetStorageAdapterForTesting(): void {
  activeAdapter = null;
}

/**
 * Retorna diagnóstico do adaptador de armazenamento sem vazar senhas ou tokens.
 */
export async function getStorageAdapterInfo(): Promise<{
  adapter: string;
  source: string;
  environmentPrefix: RuntimeEnvironment;
  isVercel: boolean;
  configured: boolean;
  connection: { ok: boolean; latencyMs?: number; error?: string };
}> {
  const adapter = getStorageAdapter();
  const redisConfig = resolveRedisConfig();
  const envPrefix = getEnvironmentPrefix();
  const isVercel = isVercelEnvironment();

  let connResult: { ok: boolean; latencyMs?: number; error?: string } = {
    ok: false,
    error: "Teste não suportado",
  };
  if (adapter.testConnection) {
    connResult = await adapter.testConnection();
  }

  return {
    adapter: adapter.name,
    source: redisConfig ? redisConfig.source : isVercel ? "Vercel sem Redis" : ".bookings_lock.json (local)",
    environmentPrefix: envPrefix,
    isVercel,
    configured: Boolean(redisConfig) || (!isVercel && adapter.name === "file-system"),
    connection: connResult,
  };
}

// ============================================================================
// 6. FUNÇÕES DE ALTO NÍVEL: IDEMPOTÊNCIA E TRAVAS DISTRIBUÍDAS
// ============================================================================

/**
 * Calcula chave determinística de idempotência baseada na intenção de reserva.
 */
export function computeIdempotencyKey(params: {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  phone: string;
  clientKey?: string;
}): string {
  if (params.clientKey && params.clientKey.trim().length >= 8) {
    return `cli_${params.clientKey.trim()}`;
  }
  const cleanPhone = params.phone.replace(/\D/g, "");
  const payloadStr = `${params.barberId}|${params.serviceId}|${params.date}|${params.time}|${cleanPhone}`;
  return crypto.createHash("sha256").update(payloadStr).digest("hex").slice(0, 32);
}

const IN_FLIGHT_LOCK_TTL_SEC = 25; // 25 segundos para travar requisições paralelas
const IDEMPOTENCY_TTL_SEC = 600; // 10 minutos para guardar o resultado idêntico

/**
 * Valida idempotência e adquire travas de concorrência com posse exclusiva (ownerToken).
 * Fail-Closed: se o Redis estiver configurado mas inacessível, rejeita a criação para proteger a agenda.
 */
export async function checkAndAcquireBookingLock(params: {
  idempotencyKey: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  phone: string;
}): Promise<{
  allowed: boolean;
  existingRecord?: IdempotencyRecord;
  errorCode?: BookingErrorCode;
  message?: string;
  lockKeys: BookingLockIdentifier;
}> {
  const adapter = getStorageAdapter();
  const cleanPhone = params.phone.replace(/\D/g, "");
  const ownerToken = crypto.randomUUID();

  // Nomes de chaves com prefixo de ambiente e namespace
  const userLockKey = formatStorageKey(
    "lock",
    `user_${params.barberId}_${params.date}_${params.time}_${cleanPhone}`
  );
  const slotLockKey = formatStorageKey(
    "lock",
    `slot_${params.barberId}_${params.date}_${params.time}`
  );
  const idempStorageKey = formatStorageKey("idemp", params.idempotencyKey);

  const lockIdentifier: BookingLockIdentifier = {
    userLockKey,
    slotLockKey,
    ownerToken,
  };

  try {
    // 1. Verifica registro de idempotência anterior
    const existingRecord = await adapter.getIdempotency(idempStorageKey);
    if (existingRecord) {
      if (existingRecord.status === "CONFIRMED" || existingRecord.status === "PENDING") {
        return {
          allowed: false,
          existingRecord,
          errorCode: "DUPLICATE_BOOKING",
          message: "Esta reserva já foi processada anteriormente com sucesso.",
          lockKeys: lockIdentifier,
        };
      }

      if (existingRecord.status === "IN_FLIGHT") {
        return {
          allowed: false,
          existingRecord,
          errorCode: "CONCURRENT_REQUEST",
          message: "Sua solicitação já está sendo processada. Aguarde alguns segundos.",
          lockKeys: lockIdentifier,
        };
      }

      if (existingRecord.status === "INCONCLUSIVE") {
        return {
          allowed: false,
          existingRecord,
          errorCode: "CONFIRMATION_PENDING",
          message:
            "A confirmação da sua tentativa anterior ainda está em andamento. Verifique seu WhatsApp antes de reenviar.",
          lockKeys: lockIdentifier,
        };
      }
    }

    // 2. Adquire trava atômica no slot (SET NX EX)
    const slotLockAcquired = await adapter.acquireLock(slotLockKey, IN_FLIGHT_LOCK_TTL_SEC, ownerToken);
    if (!slotLockAcquired) {
      return {
        allowed: false,
        errorCode: "CONCURRENT_REQUEST",
        message: "Este horário está sendo reservado no momento por outro cliente. Aguarde alguns segundos.",
        lockKeys: lockIdentifier,
      };
    }

    // 3. Adquire trava atômica no usuário (SET NX EX)
    const userLockAcquired = await adapter.acquireLock(userLockKey, IN_FLIGHT_LOCK_TTL_SEC, ownerToken);
    if (!userLockAcquired) {
      // Reverte trava do slot se o usuário já estiver com requisição em andamento
      await adapter.releaseLock(slotLockKey, ownerToken);
      return {
        allowed: false,
        errorCode: "CONCURRENT_REQUEST",
        message: "Sua solicitação já está em processamento.",
        lockKeys: lockIdentifier,
      };
    }

    // 4. Marca o status como IN_FLIGHT no registro de idempotência com TTL
    await adapter.setIdempotency(
      idempStorageKey,
      {
        idempotencyKey: params.idempotencyKey,
        barberId: params.barberId,
        serviceId: params.serviceId,
        date: params.date,
        time: params.time,
        phone: cleanPhone,
        status: "IN_FLIGHT",
        createdAt: Date.now(),
      },
      IN_FLIGHT_LOCK_TTL_SEC
    );

    return {
      allowed: true,
      lockKeys: lockIdentifier,
    };
  } catch (storageError: any) {
    // Fail-Closed: impede criação se o Redis estiver inacessível
    console.error("[STORAGE ADAPTER FAIL-CLOSED]", storageError?.message || storageError);
    return {
      allowed: false,
      errorCode: "STORAGE_UNAVAILABLE",
      message:
        "O sistema de proteção e validação de reservas está temporariamente indisponível. Por favor, tente novamente em instantes.",
      lockKeys: lockIdentifier,
    };
  }
}

/**
 * Libera as travas com segurança garantindo que apenas o proprietário (ownerToken)
 * possa excluir os registros.
 */
export async function releaseBookingLocks(lockKeys: BookingLockIdentifier): Promise<void> {
  const adapter = getStorageAdapter();
  try {
    if (typeof adapter.releaseLocks === "function") {
      await adapter.releaseLocks(
        [lockKeys.userLockKey, lockKeys.slotLockKey],
        lockKeys.ownerToken
      );
    } else {
      await adapter.releaseLock(lockKeys.userLockKey, lockKeys.ownerToken);
      await adapter.releaseLock(lockKeys.slotLockKey, lockKeys.ownerToken);
    }
  } catch (err: any) {
    console.warn("[RELEASE LOCKS WARNING]", err?.message || err);
  }
}

/**
 * Registra o desfecho final da operação na tabela de idempotência com TTL.
 */
export async function finalizeIdempotency(params: {
  idempotencyKey: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  phone: string;
  status: "CONFIRMED" | "PENDING" | "CHECKOUT_REQUIRED" | "INCONCLUSIVE" | "FAILED";
  bookingId?: string;
  responsePayload?: any;
}): Promise<void> {
  const adapter = getStorageAdapter();
  const ttl = params.status === "FAILED" ? 30 : IDEMPOTENCY_TTL_SEC;
  const idempStorageKey = formatStorageKey("idemp", params.idempotencyKey);

  try {
    await adapter.setIdempotency(
      idempStorageKey,
      {
        idempotencyKey: params.idempotencyKey,
        barberId: params.barberId,
        serviceId: params.serviceId,
        date: params.date,
        time: params.time,
        phone: params.phone.replace(/\D/g, ""),
        status: params.status,
        bookingId: params.bookingId,
        createdAt: Date.now(),
        responsePayload: params.responsePayload,
      },
      ttl
    );
  } catch (err: any) {
    console.warn("[FINALIZE IDEMPOTENCY WARNING]", err?.message || err);
  }
}

/**
 * Adquire trava exclusiva para cancelamento ou reagendamento de uma reserva específica.
 * Evita duplo clique, cliques múltiplos ou processamento concorrente no mesmo agendamento.
 */
export async function acquireBookingMutationLock(
  bookingId: string,
  action: "cancel" | "reschedule",
  ttlSeconds = 25
): Promise<{ acquired: boolean; lockKey: string; ownerToken: string; message?: string }> {
  const adapter = getStorageAdapter();
  const ownerToken = crypto.randomUUID();
  const lockKey = formatStorageKey("lock", `mutation_${action}_${bookingId}`);

  try {
    const acquired = await adapter.acquireLock(lockKey, ttlSeconds, ownerToken);
    if (!acquired) {
      return {
        acquired: false,
        lockKey,
        ownerToken,
        message: `Uma operação de ${action === "cancel" ? "cancelamento" : "reagendamento"} já está em andamento para este agendamento. Aguarde alguns instantes.`,
      };
    }

    return { acquired: true, lockKey, ownerToken };
  } catch (err: any) {
    console.error("[MUTATION LOCK ERROR]", err?.message || err);
    return {
      acquired: false,
      lockKey,
      ownerToken,
      message: "Falha temporária no sistema de validação de concorrência. Tente novamente.",
    };
  }
}

/**
 * Libera a trava exclusiva da mutação da reserva apenas se o ownerToken conferir.
 */
export async function releaseBookingMutationLock(
  lockKey: string,
  ownerToken: string
): Promise<void> {
  const adapter = getStorageAdapter();
  try {
    await adapter.releaseLock(lockKey, ownerToken);
  } catch (err: any) {
    console.warn("[RELEASE MUTATION LOCK WARNING]", err?.message || err);
  }
}

