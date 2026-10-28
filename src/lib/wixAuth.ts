import { createClient, OAuthStrategy, Tokens, TokenRole } from "@wix/sdk";
import { members } from "@wix/members";
import { extendedBookings } from "@wix/bookings";
import { getWixClient } from "./wixClient";

export const WIX_CLIENT_ID =
  process.env.WIX_CLIENT_ID || "c709b4d0-9505-418b-abce-7cd8766f8062";

export const AUTH_COOKIE_NAME = "wix_member_tokens";
export const OAUTH_COOKIE_NAME = "wix_oauth_data";
export const DEFAULT_REDIRECT_URI = "http://localhost:3000/auth/callback";
export const PRODUCTION_REDIRECT_URI = "https://leonunesbarbearia.vercel.app/auth/callback";

/**
 * Resolve a Redirect URI oficial para o Wix OAuth sem misturar ambientes:
 * - Vercel / Produção: https://leonunesbarbearia.vercel.app/auth/callback
 * - Localhost / Desenvolvimento: http://localhost:3000/auth/callback
 */
export function getRedirectUri(originHeader?: string | null): string {
  if (process.env.WIX_REDIRECT_URI?.trim()) {
    return process.env.WIX_REDIRECT_URI.trim();
  }

  const isVercel =
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview";

  const isVercelHost =
    Boolean(originHeader?.includes("leonunesbarbearia.vercel.app")) ||
    Boolean(originHeader?.includes(".vercel.app"));

  if (isVercel || isVercelHost || (process.env.NODE_ENV === "production" && !originHeader?.includes("localhost"))) {
    return PRODUCTION_REDIRECT_URI;
  }

  return DEFAULT_REDIRECT_URI;
}

export interface StoredOAuthData {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  redirectUri: string;
  returnUrl?: string;
}

export interface WixMemberProfile {
  id: string;
  contactId?: string;
  email?: string;
  emailVerified?: boolean;
  name: string;
  nickname?: string;
  phone?: string;
  avatarUrl?: string;
  status?: string;
}

export interface MemberBookingItem {
  id: string;
  serviceId?: string;
  serviceName: string;
  barberName: string;
  barberResourceId?: string;
  startDate: string; // ISO UTC
  endDate: string; // ISO UTC
  localDate: string; // YYYY-MM-DD
  localTime: string; // HH:mm
  formattedDate: string; // ex: "Terça-feira, 27 de Outubro"
  formattedTime: string; // ex: "18:00"
  durationMinutes: number;
  formattedPrice?: string;
  status: string; // "CONFIRMED", "PENDING", "CANCELED", etc.
  paymentStatus?: string;
  isUpcoming: boolean;
  locationName?: string;
}

/**
 * Cria cliente Wix configurado com OAuthStrategy (usado para fluxo de membros)
 */
export function getWixOAuthClient(tokens?: Tokens) {
  return createClient({
    modules: { members },
    auth: OAuthStrategy({
      clientId: WIX_CLIENT_ID,
      tokens: tokens || undefined,
    }),
  });
}

/**
 * Gera os dados PKCE e state para iniciar o fluxo OAuth oficial do Wix
 */
export function generateOAuthData(
  returnUrl: string = "/minha-conta",
  customRedirectUri?: string
): StoredOAuthData {
  const client = getWixOAuthClient();
  const redirectUri = customRedirectUri || getRedirectUri();
  const oauthData = client.auth.generateOAuthData(redirectUri);

  return {
    codeVerifier: oauthData.codeVerifier,
    codeChallenge: oauthData.codeChallenge,
    state: oauthData.state,
    redirectUri: oauthData.redirectUri,
    returnUrl,
  };
}

export const WIX_RECAPTCHA_SITE_KEY = "6Ld0J8IcAAAAANyrnxzrRlX1xrrdXsOmsepUYosy";

/**
 * Gera a URL oficial de autorização do Wix para redirecionamento
 * Com idp: "google", o Wix redireciona diretamente ao Google OAuth sem passar pela tela intermediária de login do Wix
 */
export async function getWixAuthUrl(
  storedOAuth: StoredOAuthData,
  mode: "login" | "signup" = "login",
  sessionToken?: string,
  idp: "google" | "facebook" = "google"
): Promise<string> {
  const client = getWixOAuthClient();
  const oauthData = {
    codeVerifier: storedOAuth.codeVerifier,
    codeChallenge: storedOAuth.codeChallenge,
    state: storedOAuth.state,
    redirectUri: storedOAuth.redirectUri,
    originalUri: storedOAuth.returnUrl || "/minha-conta",
  };

  const { authUrl } = await client.auth.getAuthUrl(oauthData, {
    prompt: sessionToken ? "none" : (mode === "signup" ? "login" : "login"),
    responseMode: "query",
    ...(!sessionToken && idp && { idp }),
    ...(sessionToken && { sessionToken }),
  });

  return authUrl;
}

/**
 * Troca authorization code retornado pelo Wix por tokens oficiais de membro
 */
export async function exchangeCodeForMemberTokens(
  code: string,
  state: string,
  storedOAuth: StoredOAuthData
): Promise<Tokens> {
  const client = getWixOAuthClient();
  const oauthData = {
    codeVerifier: storedOAuth.codeVerifier,
    codeChallenge: storedOAuth.codeChallenge,
    state: storedOAuth.state,
    redirectUri: storedOAuth.redirectUri,
    originalUri: storedOAuth.returnUrl || "/minha-conta",
  };

  return await client.auth.getMemberTokens(code, state, oauthData);
}

/**
 * Renova tokens de membro se necessário
 */
export async function renewMemberTokenIfNeeded(tokens: Tokens): Promise<Tokens> {
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAt = tokens.accessToken?.expiresAt || 0;

  // Se expira em menos de 5 minutos e possui refresh token
  if (expiresAt - nowSec < 300 && tokens.refreshToken?.value) {
    try {
      const client = getWixOAuthClient(tokens);
      const renewed = await client.auth.renewToken(tokens.refreshToken);
      return renewed;
    } catch (err) {
      console.error("[WIX AUTH] Falha ao renovar token:", err);
    }
  }

  return tokens;
}

/**
 * Obtém o perfil oficial do membro logado a partir de seus tokens válidos
 */
export async function getCurrentMemberProfile(tokens: Tokens): Promise<WixMemberProfile | null> {
  try {
    const client = getWixOAuthClient(tokens);
    const res = await client.members.getCurrentMember({ fieldsets: ["FULL"] });
    const m = res.member;

    if (!m || !m._id) {
      return null;
    }

    const name =
      m.contact?.firstName && m.contact?.lastName
        ? `${m.contact.firstName} ${m.contact.lastName}`
        : m.contact?.firstName ||
          m.profile?.nickname ||
          m.loginEmail?.split("@")[0] ||
          "Cliente";

    const phone =
      m.contact?.phones && m.contact.phones.length > 0
        ? m.contact.phones[0]
        : undefined;

    return {
      id: m._id,
      contactId: m.contactId || undefined,
      email: m.loginEmail || (m.contact?.emails && m.contact.emails[0]) || undefined,
      emailVerified: Boolean(m.loginEmailVerified),
      name,
      nickname: m.profile?.nickname || undefined,
      phone,
      avatarUrl: m.profile?.photo?.url || undefined,
      status: m.status || undefined,
    };
  } catch (err: any) {
    // 401 ou token expirado/inválido
    return null;
  }
}

/**
 * Consulta segura das reservas oficiais do membro pelo contactId no Wix Bookings Reader V2
 */
export async function getMemberBookings(contactId: string): Promise<{
  upcoming: MemberBookingItem[];
  past: MemberBookingItem[];
  all: MemberBookingItem[];
}> {
  if (!contactId) {
    return { upcoming: [], past: [], all: [] };
  }

  const adminClient = getWixClient();
  if (!adminClient) {
    console.error("[WIX MEMBER BOOKINGS] Cliente administrativo não configurado.");
    return { upcoming: [], past: [], all: [] };
  }

  try {
    // Consulta suportada oficialmente com filtro por contactId e ordenação decrescente de data
    const queryBuilder = adminClient.extendedBookings.queryExtendedBookings() as any;
    const queryRes = await queryBuilder
      .eq("contactDetails.contactId", contactId)
      .descending("startDate")
      .limit(100)
      .find();

    const now = new Date();
    const items: MemberBookingItem[] = [];

    for (const item of queryRes.items) {
      const b = item.booking;
      if (!b || !b._id || !b.startDate) continue;

      const startDateObj = new Date(b.startDate);
      const endDateObj = b.endDate ? new Date(b.endDate) : startDateObj;
      const isUpcoming = startDateObj >= now && b.status !== "CANCELED" && b.status !== "DECLINED";

      // Formatação no fuso oficial America/Fortaleza
      const dateParts = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(startDateObj);

      const timeParts = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(startDateObj);

      const localDateIso = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Fortaleza",
      }).format(startDateObj);

      // Duração em minutos
      const durationMs = endDateObj.getTime() - startDateObj.getTime();
      const durationMinutes = durationMs > 0 ? Math.round(durationMs / 60000) : 40;

      // Preço quando fornecido pelo Wix
      let formattedPrice: string | undefined = undefined;
      if (b.totalPrice?.value) {
        formattedPrice = `R$ ${b.totalPrice.value}`;
      }

      const serviceName = b.bookedEntity?.title || "Atendimento na Barbearia";
      const barberName =
        b.bookedEntity?.slot?.resource?.name ||
        "Profissional Léo Nunes Barbearia";

      items.push({
        id: b._id,
        serviceId: b.bookedEntity?.slot?.serviceId || undefined,
        serviceName,
        barberName,
        barberResourceId: b.bookedEntity?.slot?.resource?._id || undefined,
        startDate: b.startDate,
        endDate: b.endDate || b.startDate,
        localDate: localDateIso,
        localTime: timeParts,
        formattedDate: dateParts.charAt(0).toUpperCase() + dateParts.slice(1),
        formattedTime: timeParts,
        durationMinutes,
        formattedPrice,
        status: b.status || "CONFIRMED",
        paymentStatus: b.paymentStatus || undefined,
        isUpcoming,
        locationName: b.bookedEntity?.slot?.location?.name || undefined,
      });
    }

    const upcoming = items
      .filter((i) => i.isUpcoming)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const past = items
      .filter((i) => !i.isUpcoming)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return {
      upcoming,
      past,
      all: items,
    };
  } catch (err: any) {
    console.error("[WIX MEMBER BOOKINGS] Erro ao consultar reservas:", err);
    return { upcoming: [], past: [], all: [] };
  }
}
