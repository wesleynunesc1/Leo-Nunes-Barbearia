import { NextRequest, NextResponse } from "next/server";
import { validateOwnerSession } from "@/lib/adminAuth";
import { getWixClient } from "@/lib/wixClient";
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
    const adminClient = getWixClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Cliente administrativo do Wix não está configurado." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const barberResourceId = searchParams.get("resourceId");
    const statusFilter = searchParams.get("status");

    // Consulta reservas oficiais do Wix Bookings
    const queryBuilder = adminClient.extendedBookings.queryExtendedBookings() as any;
    let query = queryBuilder.descending("startDate").limit(100);

    if (barberResourceId && barberResourceId !== "ALL") {
      query = query.eq("booking.resource.id", barberResourceId);
    }

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    const result = await query.find();
    const rawItems = result.items || [];

    const bookings = rawItems.map((item: any) => {
      const b = item.booking || {};
      const contact = item.contactDetails || {};
      const resource = b.resource || {};
      const service = b.bookedEntity || {};

      return {
        id: item._id || item.id,
        bookingNumber: item.bookingNumber || null,
        status: item.status || "CONFIRMED",
        paymentStatus: item.paymentStatus || "NOT_PAID",
        startDate: item.startDate,
        endDate: item.endDate,
        serviceName: service.title || service.name || "Serviço",
        serviceId: service.serviceId || service.id,
        barberName: resource.name || "Barbeiro",
        barberResourceId: resource.id,
        customerName: contact.firstName
          ? `${contact.firstName} ${contact.lastName || ""}`.trim()
          : contact.fullName || "Cliente",
        customerEmail: contact.email || null,
        customerPhone: contact.phone || null,
        notes: item.notes || null,
        price: service.rate?.price?.amount || null,
        currency: service.rate?.price?.currency || "BRL",
        totalParticipants: item.totalParticipants || 1,
      };
    });

    return NextResponse.json({
      success: true,
      bookings,
      barbers: BARBERS.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        resourceId: b.resourceId,
        role: b.role,
      })),
      total: bookings.length,
    });
  } catch (err: any) {
    console.error("[ADMIN BOOKINGS API ERROR]", err);
    return NextResponse.json(
      { error: "Falha ao consultar reservas no Wix Bookings: " + (err.message || "") },
      { status: 500 }
    );
  }
}

