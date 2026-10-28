import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getCurrentMemberProfile,
  renewMemberTokenIfNeeded,
} from "@/lib/wixAuth";
import { Tokens } from "@wix/sdk";

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!authCookie) {
      return NextResponse.json({ authenticated: false, member: null });
    }

    let tokens: Tokens;
    try {
      tokens = JSON.parse(authCookie);
    } catch {
      return NextResponse.json({ authenticated: false, member: null });
    }

    // Renova token se necessário
    const activeTokens = await renewMemberTokenIfNeeded(tokens);
    const member = await getCurrentMemberProfile(activeTokens);

    if (!member) {
      // Token inválido ou expirado
      const res = NextResponse.json({ authenticated: false, member: null });
      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    const res = NextResponse.json({
      authenticated: true,
      member,
    });

    // Se o token foi renovado, atualiza o cookie
    if (activeTokens !== tokens) {
      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: JSON.stringify(activeTokens),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err: any) {
    console.error("[AUTH ME ERROR]", err);
    return NextResponse.json({ authenticated: false, member: null });
  }
}
