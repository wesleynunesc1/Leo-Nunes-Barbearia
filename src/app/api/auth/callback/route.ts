import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  OAUTH_COOKIE_NAME,
  StoredOAuthData,
  exchangeCodeForMemberTokens,
} from "@/lib/wixAuth";

export async function POST(request: NextRequest) {
  try {
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

    // Troca o code pelos tokens oficiais do Wix
    const tokens = await exchangeCodeForMemberTokens(code, state, storedOAuth);

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
    console.error("[WIX AUTH CALLBACK ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Falha na troca de tokens de autorização Wix." },
      { status: 500 }
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
    console.error("[GET AUTH CALLBACK ERROR]", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err?.message || "Falha+no+login")}`, request.url)
    );
  }
}
