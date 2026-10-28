import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, OAUTH_COOKIE_NAME } from "@/lib/wixAuth";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Sessão encerrada com sucesso." });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
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
}
