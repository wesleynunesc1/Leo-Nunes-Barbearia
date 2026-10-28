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
    const { email, password, returnUrl: reqReturnUrl } = await request.json();
    const returnUrl = reqReturnUrl || "/minha-conta";

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const client = getWixOAuthClient();
    const loginResult = await client.auth.login({
      email: email.trim().toLowerCase(),
      password,
    });

    if (loginResult.loginState === LoginState.SUCCESS) {
      const sessionToken = (loginResult as any).data?.sessionToken;

      // Gera PKCE oficial e URL com sessionToken e prompt='none' para troca full-page
      const oauthData = generateOAuthData(returnUrl);
      const authUrl = await getWixAuthUrl(oauthData, "login", sessionToken);

      const response = NextResponse.json({
        success: true,
        loginState: loginResult.loginState,
        redirectUrl: authUrl,
        message: "Login autenticado com sucesso! Estabelecendo sessão oficial...",
      });

      // Grava o cookie temporário seguro para validação do state no callback
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

    if (loginResult.loginState === LoginState.EMAIL_VERIFICATION_REQUIRED) {
      return NextResponse.json(
        {
          success: false,
          loginState: loginResult.loginState,
          requiresEmailVerification: true,
          error: "Verificação de e-mail necessária. Verifique sua caixa de entrada.",
        },
        { status: 403 }
      );
    }

    if (
      loginResult.loginState === LoginState.USER_CAPTCHA_REQUIRED ||
      loginResult.loginState === LoginState.SILENT_CAPTCHA_REQUIRED ||
      (loginResult as any).errorCode === "missingCaptchaToken" ||
      (loginResult as any).errorCode === "invalidCaptchaToken"
    ) {
      return NextResponse.json(
        {
          success: false,
          requiresCaptcha: true,
          error:
            "O Wix exigiu verificação de segurança (Captcha). Utilize o botão de acesso oficial Wix ID abaixo para autenticar.",
        },
        { status: 422 }
      );
    }

    // Tratamento de erros de credenciais
    const errorCode = (loginResult as any).errorCode;
    let userMessage = "E-mail ou senha incorretos.";
    if (errorCode === "invalidPassword") {
      userMessage = "Senha incorreta. Tente novamente ou redefina sua senha.";
    } else if (errorCode === "invalidEmail") {
      userMessage = "Conta não encontrada com este e-mail.";
    } else if (errorCode === "resetPassword") {
      userMessage = "É necessário redefinir sua senha antes de acessar.";
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        errorCode,
      },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("[AUTH DIRECT LOGIN ERROR]", err);
    return NextResponse.json(
      { error: "Erro no servidor ao autenticar. Tente novamente." },
      { status: 500 }
    );
  }
}
