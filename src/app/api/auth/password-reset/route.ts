import { NextRequest, NextResponse } from "next/server";
import { getWixOAuthClient } from "@/lib/wixAuth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Informe um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;
    const redirectUri = `${origin}/login`;

    const client = getWixOAuthClient();

    try {
      await client.auth.sendPasswordResetEmail(email.trim().toLowerCase(), redirectUri);
    } catch (wixErr: any) {
      console.warn("[PASSWORD RESET NOTIFICATION]", wixErr?.message || wixErr);
      // Por segurança contra enumeração de e-mails, retornamos mensagem neutra de sucesso
    }

    return NextResponse.json({
      success: true,
      message:
        "Se o e-mail estiver cadastrado na Léo Nunes Barbearia, você receberá um link seguro do Wix para redefinir sua senha.",
    });
  } catch (err: any) {
    console.error("[PASSWORD RESET ERROR]", err);
    return NextResponse.json(
      { error: "Erro ao processar solicitação de recuperação de senha." },
      { status: 500 }
    );
  }
}
