import { NextRequest, NextResponse } from "next/server";
import { getVerifiedBarberSlots } from "@/lib/wixAvailability";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const barberSlug = searchParams.get("barberSlug") || undefined;
    const barberId = searchParams.get("barberId") || undefined;
    const serviceId = searchParams.get("serviceId") || undefined;

    if (!dateStr || (!barberSlug && !barberId)) {
      return NextResponse.json(
        { success: false, error: "Parâmetros date e barber são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await getVerifiedBarberSlots({
      barberId,
      barberSlug,
      serviceId,
      dateStr,
    });

    if (!result.success) {
      const httpStatus = result.errorCode === "INVALID_DATA" ? 400 : 503;
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Não foi possível carregar os horários disponíveis.",
          errorCode: result.errorCode,
          date: dateStr,
          barberId: result.barberId,
        },
        { status: httpStatus }
      );
    }

    if (result.closed) {
      return NextResponse.json({
        success: true,
        date: dateStr,
        barberId: result.barberId,
        serviceId: result.serviceId,
        closed: true,
        closedReason: result.closedReason,
        slots: [],
        totalSlots: 0,
        availableSlots: 0,
        timezone: result.timezone,
      });
    }

    return NextResponse.json(
      {
        success: true,
        date: dateStr,
        barberId: result.barberId,
        barberName: result.barberName,
        serviceId: result.serviceId,
        slots: result.slots,
        totalSlots: result.totalSlots,
        availableSlots: result.availableSlots,
        activeBookingsCount: result.activeBookingsCount,
        source: "wix_official_verified",
        wixIntegrationPending: result.wixIntegrationPending || false,
        timezone: result.timezone,
        message:
          result.availableSlots === 0
            ? "Não há horários disponíveis para este profissional nesta data."
            : undefined,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("[API SLOTS ROUTE CRITICAL ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao consultar disponibilidade" },
      { status: 500 }
    );
  }
}
