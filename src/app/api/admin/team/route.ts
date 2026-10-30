import { NextRequest, NextResponse } from "next/server";
import { validateOwnerSession } from "@/lib/adminAuth";
import { getDynamicBarbers } from "@/lib/wixDynamicSync";
import { BARBERS } from "@/data/barbers";

export async function GET(request: NextRequest) {
  // 1. Validação estrita de autorização OWNER no backend
  const auth = await validateOwnerSession(request);
  if (!auth.isOwner) {
    return NextResponse.json(
      { error: auth.error || "Acesso negado. Módulo restrito ao proprietário." },
      { status: auth.statusCode || 403 }
    );
  }

  try {
    const barbers = await getDynamicBarbers();

    return NextResponse.json({
      success: true,
      team: barbers.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        role: b.role,
        photo: b.photo,
        resourceId: b.resourceId,
        tagline: b.tagline,
        servicesCount: b.services?.length || 0,
        services: b.services,
      })),
      totalBarbers: barbers.length,
    });
  } catch (err: any) {
    console.error("[ADMIN TEAM API ERROR]", err);
    return NextResponse.json(
      { error: "Falha ao consultar equipe: " + (err.message || "") },
      { status: 500 }
    );
  }
}

