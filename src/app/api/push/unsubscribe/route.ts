import { NextRequest, NextResponse } from "next/server";
import { removeSubscription } from "@/lib/pushSubscriptionStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint obrigatório." },
        { status: 400 }
      );
    }

    await removeSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: "Dispositivo desinscrito com sucesso.",
    });
  } catch (err: any) {
    console.error("[api/push/unsubscribe] Error:", err);
    return NextResponse.json(
      { error: "Erro ao remover inscrição." },
      { status: 500 }
    );
  }
}
