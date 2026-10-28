import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/pushNotifications";
import { AUTH_COOKIE_NAME, getCurrentMemberProfile, renewMemberTokenIfNeeded } from "@/lib/wixAuth";

export async function POST(req: NextRequest) {
  try {
    let memberId: string | undefined;
    const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (authCookie) {
      try {
        const tokens = JSON.parse(authCookie);
        const activeTokens = await renewMemberTokenIfNeeded(tokens);
        const member = await getCurrentMemberProfile(activeTokens);
        if (member?.id) {
          memberId = member.id;
        }
      } catch {}
    }

    const body = await req.json().catch(() => ({}));
    const targetEndpoint = body.endpoint;

    const result = await sendPushNotification(
      { memberId, endpoint: targetEndpoint },
      {
        title: "Leo Nunes Barbearia ✂️",
        body: "Notificação de teste recebida com sucesso! Seus lembretes de corte e agendamentos serão avisados aqui.",
        url: "/minha-conta/agendamentos",
      }
    );

    if (result.sent === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nenhum dispositivo ativo encontrado para esta sessão. Ative as notificações no navegador primeiro.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notificação enviada para ${result.sent} dispositivo(s).`,
      sent: result.sent,
    });
  } catch (err: any) {
    console.error("[api/push/test] Error:", err);
    return NextResponse.json(
      { error: "Erro ao disparar notificação de teste." },
      { status: 500 }
    );
  }
}
