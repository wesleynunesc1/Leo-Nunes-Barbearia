import { NextRequest, NextResponse } from "next/server";
import { getDynamicBarbers } from "@/lib/wixDynamicSync";
import { isWixConfigured } from "@/lib/wixClient";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barberSlug = searchParams.get("barberSlug");
    const barberId = searchParams.get("barberId");

    const wixConfigured = isWixConfigured();
    const barbers = await getDynamicBarbers();

    // Se nenhum barbeiro foi especificado, retorna todos os barbeiros com serviços sincronizados
    if (!barberSlug && !barberId) {
      return NextResponse.json(
        {
          success: true,
          wixIntegrationPending: !wixConfigured,
          data: barbers,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const barber = barbers.find((b) =>
      barberSlug ? b.slug === barberSlug : b.id === barberId
    );

    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        wixIntegrationPending: !wixConfigured,
        source: wixConfigured ? "wix_official_api" : "local_official_registry",
        barber: {
          id: barber.id,
          name: barber.name,
          role: barber.role,
          photo: barber.photo,
          resourceId: barber.resourceId,
        },
        services: barber.services,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[API SERVICES ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao carregar serviços" },
      { status: 500 }
    );
  }
}
