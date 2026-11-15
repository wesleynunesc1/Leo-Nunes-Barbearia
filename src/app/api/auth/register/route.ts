import { NextRequest, NextResponse } from "next/server";
import {
  getWixOAuthClient,
  generateOAuthData,
  getWixAuthUrl,
  getRedirectUri,
  OAUTH_COOKIE_NAME,
} from "@/lib/wixAuth";
import { LoginState } from "@wix/sdk";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      captchaToken,
      recaptchaToken,
      invisibleRecaptchaToken,
      invisibleCaptchaToken,
      returnUrl: reqReturnUrl,
    } = await request.json();

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

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;
    const redirectUri = getRedirectUri(origin);

    // Mapeamento compatível com o Wix Headless SDK para tokens de reCAPTCHA
    const effectiveVisibleToken = (recaptchaToken || captchaToken)?.trim();
    const effectiveInvisibleToken = (invisibleRecaptchaToken || invisibleCaptchaToken)?.trim();

    const captchaTokensParam: { recaptchaToken?: string; invisibleRecaptchaToken?: string } = {};
    if (effectiveVisibleToken) {
      captchaTokensParam.recaptchaToken = effectiveVisibleToken;
    }
    if (effectiveInvisibleToken) {
      captchaTokensParam.invisibleRecaptchaToken = effectiveInvisibleToken;
      // Garante que o SDK/API envie o token no formato esperado pelo backend Wix
      if (!captchaTokensParam.recaptchaToken) {
        captchaTokensParam.recaptchaToken = effectiveInvisibleToken;
      }
    }

    const client = getWixOAuthClient();
    const regResult = await client.auth.register({
      email: email.trim().toLowerCase(),
      password,
      profile: {
        nickname: name.trim(),
      },
      ...(Object.keys(captchaTokensParam).length > 0 && {
        captchaTokens: captchaTokensParam,
      }),
    });

    if (regResult.loginState === LoginState.SUCCESS) {
      const sessionToken = (regResult as any).data?.sessionToken;
      const oauthData = generateOAuthData(returnUrl, redirectUri);
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

    if (regResult.loginState === LoginState.OWNER_APPROVAL_REQUIRED) {
      return NextResponse.json({
        success: true,
        requiresOwnerApproval: true,
        message:
          "Cadastro recebido com sucesso! Sua conta está em análise de aprovação pela barbearia.",
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
      const isExpiredOrInvalid = errorCode === "invalidCaptchaToken";
      return NextResponse.json(
        {
          success: false,
          requiresCaptcha: true,
          captchaType: "visible",
          errorCode: errorCode || regResult.loginState,
          error: isExpiredOrInvalid
            ? "A verificação de segurança expirou. Por favor, confirme o reCAPTCHA abaixo."
            : "Por segurança, confirme a verificação do reCAPTCHA abaixo para concluir seu cadastro.",
        },
        { status: 422 }
      );
    }

    // Tratamento amigável de outros erros retornados pela API Wix
    let clientErrorMessage = "Não foi possível concluir o cadastro. Verifique os dados informados.";
    const rawError = (regResult as any).error;
    if (typeof rawError === "string") {
      try {
        const parsed = JSON.parse(rawError);
        if (parsed.message?.toLowerCase().includes("password")) {
          clientErrorMessage = "A senha deve conter no mínimo 6 caracteres e incluir números ou letras.";
        } else if (parsed.message?.toLowerCase().includes("email")) {
          clientErrorMessage = "Informe um endereço de e-mail válido.";
        }
      } catch {
        if (!rawError.startsWith("{")) {
          clientErrorMessage = rawError;
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: clientErrorMessage,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[AUTH REGISTER ERROR]", err);
    return NextResponse.json(
      { error: "Erro no servidor ao processar cadastro. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
