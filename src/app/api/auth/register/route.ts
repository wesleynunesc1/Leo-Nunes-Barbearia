import { NextRequest, NextResponse } from "next/server";
import {
  getWixOAuthClient,
  generateOAuthData,
  getWixAuthUrl,
  OAUTH_COOKIE_NAME,
} from "@/lib/wixAuth";
import { LoginState } from "@wix/sdk";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, captchaToken, returnUrl: reqReturnUrl } = await request.json();
    const returnUrl = reqReturnUrl || "/minha-conta";

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Informe seu nome completo (mínimo de 3 caracteres)." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Informe um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const client = getWixOAuthClient();
    const regResult = await client.auth.register({
      email: email.trim().toLowerCase(),
      password,
      profile: {
        nickname: name.trim(),
      },
      ...(captchaToken && {
        captchaTokens: {
          recaptchaToken: captchaToken,
        },
      }),
    });

    if (regResult.loginState === LoginState.SUCCESS) {
      const sessionToken = (regResult as any).data?.sessionToken;
      const oauthData = generateOAuthData(returnUrl);
      const authUrl = await getWixAuthUrl(oauthData, "signup", sessionToken);

      const response = NextResponse.json({
        success: true,
        redirectUrl: authUrl,
        message: "Cadastro realizado com sucesso! Conectando sua sessão...",
      });

      response.cookies.set({
        name: OAUTH_COOKIE_NAME,
        value: JSON.stringify(oauthData),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      return response;
    }

    if (regResult.loginState === LoginState.EMAIL_VERIFICATION_REQUIRED) {
      return NextResponse.json({
        success: true,
        requiresEmailVerification: true,
        message:
          "Cadastro iniciado com sucesso! Um e-mail de confirmação foi enviado pelo Wix. Verifique sua caixa de entrada para ativar sua conta.",
      });
    }

    const errorCode = (regResult as any).errorCode;
    if (errorCode === "emailAlreadyExists") {
      return NextResponse.json(
        {
          success: false,
          error: "Este e-mail já está cadastrado na barbearia. Faça login com sua senha.",
          errorCode: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    if (
      errorCode === "missingCaptchaToken" ||
      errorCode === "invalidCaptchaToken" ||
      regResult.loginState === LoginState.USER_CAPTCHA_REQUIRED ||
      regResult.loginState === LoginState.SILENT_CAPTCHA_REQUIRED
    ) {
      return NextResponse.json(
        {
          success: false,
          requiresCaptcha: true,
          error:
            "Confirme a verificação de segurança (reCAPTCHA) abaixo para prosseguir com o cadastro, ou utilize o botão oficial Wix ID.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: (regResult as any).error || "Não foi possível concluir o cadastro.",
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[AUTH REGISTER ERROR]", err);
    return NextResponse.json(
      { error: "Erro no servidor ao processar cadastro." },
      { status: 500 }
    );
  }
}
