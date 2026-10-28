import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getCurrentMemberProfile,
  getMemberBookings,
  renewMemberTokenIfNeeded,
} from "@/lib/wixAuth";
import { Tokens } from "@wix/sdk";

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!authCookie) {
      return NextResponse.json(
        { error: "Acesso restrito. Faça login para visualizar seus agendamentos." },
        { status: 401 }
      );
    }

    let tokens: Tokens;
    try {
      tokens = JSON.parse(authCookie);
    } catch {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const activeTokens = await renewMemberTokenIfNeeded(tokens);
    const member = await getCurrentMemberProfile(activeTokens);

    if (!member || !member.id) {
      return NextResponse.json(
        { error: "Sessão expirada ou não autorizada pelo Wix." },
        { status: 401 }
      );
    }

    // Se o membro ainda não possui contactId registrado no Wix
    if (!member.contactId) {
      return NextResponse.json({
        upcoming: [],
        past: [],
        all: [],
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
        },
        message: "Nenhuma reserva vinculada ao seu perfil ainda.",
      });
    }

    // Busca exclusivamente as reservas oficiais que pertencem ao contactId do membro
    const bookingsData = await getMemberBookings(member.contactId);

    return NextResponse.json({
      success: true,
      upcoming: bookingsData.upcoming,
      past: bookingsData.past,
      all: bookingsData.all,
      member: {
        id: member.id,
        contactId: member.contactId,
        name: member.name,
        email: member.email,
        phone: member.phone,
      },
    });
  } catch (err: any) {
    console.error("[MEMBER BOOKINGS API ERROR]", err);
    return NextResponse.json(
      { error: "Falha ao consultar agendamentos no Wix Bookings." },
      { status: 500 }
    );
  }
}
