import { NextRequest, NextResponse } from "next/server";
import { generateOAuthData, getWixAuthUrl, OAUTH_COOKIE_NAME } from "@/lib/wixAuth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get("mode") as "login" | "signup") || "login";
    const returnUrl = searchParams.get("returnUrl") || "/minha-conta";

    const oauthData = generateOAuthData(returnUrl);
    const authUrl = await getWixAuthUrl(oauthData, mode);

    const response = NextResponse.json({ authUrl });

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
