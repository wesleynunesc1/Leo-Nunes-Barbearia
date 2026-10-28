import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/pushSubscriptionStore";
import { AUTH_COOKIE_NAME, getCurrentMemberProfile, renewMemberTokenIfNeeded } from "@/lib/wixAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Inscrição push inválida ou incompleta." },
        { status: 400 }
      );
    }

    // Identifica o membro se estiver logado via cookie/token Wix
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
      } catch {
        // Ignora silenciosamente para visitantes
      }
    }

    const userAgent = req.headers.get("user-agent") || undefined;
    await saveSubscription(subscription, memberId, userAgent);

    return NextResponse.json({
      success: true,
      message: "Dispositivo inscrito com sucesso para notificações push.",
      memberId: memberId || null,
    });
  } catch (err: any) {
    console.error("[api/push/subscribe] Error:", err);
    return NextResponse.json(
      { error: "Erro ao processar inscrição push." },
      { status: 500 }
    );
  }
}
