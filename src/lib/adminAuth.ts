import { NextRequest } from "next/server";
import { Tokens } from "@wix/sdk";
import {
  AUTH_COOKIE_NAME,
  getCurrentMemberProfile,
  renewMemberTokenIfNeeded,
  WixMemberProfile,
} from "@/lib/wixAuth";

/**
 * Lista de e-mails oficialmente autorizados como OWNER (proprietário).
 * O e-mail solicitado é wesleymito700@gmail.com
 * Pode ser estendido ou sobreposto via variável de ambiente OWNER_EMAILS no servidor.
 */
const DEFAULT_OWNER_EMAILS = ["wesleymito700@gmail.com"];

export function getOwnerEmails(): string[] {
  const envEmails = process.env.OWNER_EMAILS;
  if (envEmails) {
    const list = envEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return DEFAULT_OWNER_EMAILS;
}

/**
 * Verifica se um determinado e-mail pertence aos proprietários autorizados.
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const owners = getOwnerEmails();
  return owners.includes(normalized);
}

/**
 * Validação segura de sessão do proprietário no Backend:
 * 1. Extrai o cookie de autenticação oficial do Wix (httpOnly).
 * 2. Renova token Wix se expirado.
 * 3. Valida a identidade diretamente com a API do Wix Members.
 * 4. Valida se o e-mail do membro corresponde à conta do proprietário autorizado (ex: wesleymito700@gmail.com).
 * 5. Garante que nenhum usuário comum ou visitante receba autorização.
 */
export async function validateOwnerSession(request: NextRequest): Promise<{
  isOwner: boolean;
  member: WixMemberProfile | null;
  error?: string;
  statusCode?: number;
}> {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!authCookie) {
      return {
        isOwner: false,
        member: null,
        error: "Sessão não encontrada. Faça login com a conta do proprietário.",
        statusCode: 401,
      };
    }

    let tokens: Tokens;
    try {
      tokens = JSON.parse(authCookie);
    } catch {
      return {
        isOwner: false,
        member: null,
        error: "Sessão inválida ou corrompida.",
        statusCode: 401,
      };
    }

    const activeTokens = await renewMemberTokenIfNeeded(tokens);
    const member = await getCurrentMemberProfile(activeTokens);

    if (!member || !member.id) {
      return {
        isOwner: false,
        member: null,
        error: "Sessão expirada ou não autorizada pela API do Wix Members.",
        statusCode: 401,
      };
    }

    const memberEmail = member.email?.trim().toLowerCase();
    if (!memberEmail || !isOwnerEmail(memberEmail)) {
      return {
        isOwner: false,
        member,
        error: "Acesso negado. Esta conta não possui privilégios de proprietário (OWNER).",
        statusCode: 403,
      };
    }

    return {
      isOwner: true,
      member,
    };
  } catch (err: any) {
    console.error("[VALIDATE OWNER SESSION ERROR]", err);
    return {
      isOwner: false,
      member: null,
      error: "Erro interno ao validar autorização do proprietário.",
      statusCode: 500,
    };
  }
}

