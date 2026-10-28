import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  OAUTH_COOKIE_NAME,
  StoredOAuthData,
  exchangeCodeForMemberTokens,
} from "@/lib/wixAuth";

// Cache em memória para prevenir requisições concorrentes ou duplicadas com o mesmo código de autorização
const processedCodes = new Map<string, { tokens: any; timestamp: number }>();
const inFlightPromises = new Map<string, Promise<any>>();

function cleanExpiredCodes() {
  const now = Date.now();
  for (const [codeKey, data] of processedCodes.entries()) {
    if (now - data.timestamp > 60000) {
      processedCodes.delete(codeKey);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanExpiredCodes();
    const body = await request.json();
    const { code, state } = body;

    if (!code || !state) {
      return NextResponse.json(
        { error: "Parâmetros code e state são obrigatórios." },
        { status: 400 }
      );
    }

    const oauthCookie = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
    if (!oauthCookie) {
      // Se o código já foi processado recentemente (ex: re-renderização concorrente)
      if (processedCodes.has(code)) {
        const cached = processedCodes.get(code)!;
        const response = NextResponse.json({
          success: true,
          redirectUrl: "/minha-conta",
        });
        response.cookies.set({
          name: AUTH_COOKIE_NAME,
          value: JSON.stringify(cached.tokens),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        return response;
      }

      return NextResponse.json(
        { error: "Dados de sessão OAuth expirados ou não encontrados. Tente fazer login novamente." },
        { status: 400 }
      );
    }

    let storedOAuth: StoredOAuthData;
    try {
      storedOAuth = JSON.parse(oauthCookie);
    } catch {
      return NextResponse.json(
        { error: "Dados de sessão OAuth inválidos." },
        { status: 400 }
      );
    }

    // Validação estrita do State para segurança contra CSRF
    if (storedOAuth.state !== state) {
      return NextResponse.json(
        { error: "State de autenticação inválido. Possível ataque CSRF." },
        { status: 403 }
      );
    }

    // Se o mesmo código já foi trocado com sucesso no último minuto, reaproveita tokens
    if (processedCodes.has(code)) {
      const cached = processedCodes.get(code)!;
      const targetUrl = storedOAuth.returnUrl || "/minha-conta";
      const response = NextResponse.json({
        success: true,
        redirectUrl: targetUrl,
      });
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: JSON.stringify(cached.tokens),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    // Se houver uma requisição em andamento para o mesmo código, aguarda conclusão
    let tokens: any;
    if (inFlightPromises.has(code)) {
      tokens = await inFlightPromises.get(code);
    } else {
      const exchangePromise = exchangeCodeForMemberTokens(code, state, storedOAuth)
        .then((tok) => {
          processedCodes.set(code, { tokens: tok, timestamp: Date.now() });
          return tok;
        })
        .finally(() => {
          inFlightPromises.delete(code);
        });

      inFlightPromises.set(code, exchangePromise);
      tokens = await exchangePromise;
    }

    const targetUrl = storedOAuth.returnUrl || "/minha-conta";
    const response = NextResponse.json({
      success: true,
      redirectUrl: targetUrl,
    });

    // Armazena os tokens de membro no cookie seguro e HttpOnly
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: JSON.stringify(tokens),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    // Limpa o cookie temporário de oauth_data
    response.cookies.set({
      name: OAUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("[WIX AUTH CALLBACK ERROR]", err?.message || err);
    let friendlyMessage = "Falha na validação de acesso com Wix. Tente fazer login novamente.";
    if (err?.message?.includes("invalid_grant")) {
      friendlyMessage =
        "O código de autorização expirou ou já foi processado. Faça login novamente para renovar seu acesso.";
    }

    return NextResponse.json(
      { error: friendlyMessage },
      { status: 400 }
    );
  }
}

// Também aceita GET caso o Wix redirecione diretamente para o endpoint
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=Código+de+autorização+ausente", request.url)
    );
  }

  const oauthCookie = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
  if (!oauthCookie) {
    return NextResponse.redirect(
      new URL("/login?error=Sessão+OAuth+expirada", request.url)
    );
  }

  try {
    const storedOAuth: StoredOAuthData = JSON.parse(oauthCookie);
    if (storedOAuth.state !== state) {
      return NextResponse.redirect(
        new URL("/login?error=State+de+autenticação+inválido", request.url)
      );
    }

    const tokens = await exchangeCodeForMemberTokens(code, state, storedOAuth);
    const targetUrl = storedOAuth.returnUrl || "/minha-conta";
    const response = NextResponse.redirect(new URL(targetUrl, request.url));

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: JSON.stringify(tokens),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set({
      name: OAUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("[GET AUTH CALLBACK ERROR]", err?.message || err);
    let friendlyError = "Falha no login. Tente novamente.";
    if (err?.message?.includes("invalid_grant")) {
      friendlyError = "O link de autorização expirou. Faça login novamente.";
    }
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(friendlyError)}`, request.url)
    );
  }
}
