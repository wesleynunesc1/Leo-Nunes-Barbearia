import { NextRequest, NextResponse } from "next/server";
import { generateOAuthData, getRedirectUri, getWixAuthUrl, OAUTH_COOKIE_NAME } from "@/lib/wixAuth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get("mode") as "login" | "signup") || "login";
    const returnUrl = searchParams.get("returnUrl") || "/minha-conta";
    const idp = (searchParams.get("idp") as "google" | "facebook") || "google";

    // Detecta origem da requisição sem misturar ambientes entre Vercel e Localhost
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;

    const redirectUri = getRedirectUri(origin);
    const oauthData = generateOAuthData(returnUrl, redirectUri);
    const authUrl = await getWixAuthUrl(oauthData, mode, undefined, idp);

    const response = NextResponse.json({ authUrl, redirectUri });

    // Armazena state e codeVerifier em cookie HttpOnly seguro para validação no callback
    response.cookies.set({
      name: OAUTH_COOKIE_NAME,
      value: JSON.stringify(oauthData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutos
    });

    return response;
  } catch (err: any) {
    console.error("[AUTH OAUTH-URL ERROR]", err);
    return NextResponse.json(
      { error: "Erro ao inicializar autenticação com Wix." },
      { status: 500 }
    );
  }
}
