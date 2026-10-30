import { NextRequest, NextResponse } from "next/server";
import { validateOwnerSession } from "@/lib/adminAuth";
import { getWixClient } from "@/lib/wixClient";

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

    // Consulta reservas dos últimos meses para calcular métricas financeiras reais
    const queryBuilder = adminClient.extendedBookings.queryExtendedBookings() as any;
    const result = await queryBuilder.descending("startDate").limit(200).find();
    const rawItems = result.items || [];

    let totalConfirmedCount = 0;
    let totalCanceledCount = 0;
    let totalPendingCount = 0;
    let totalEstimatedRevenue = 0;
    let totalPaidRevenue = 0;

    const recentSales = rawItems.map((item: any) => {
      const b = item.booking || {};
      const service = b.bookedEntity || {};
      const contact = item.contactDetails || {};
      const status = item.status || "CONFIRMED";
      const paymentStatus = item.paymentStatus || "NOT_PAID";
      const priceAmount = Number(service.rate?.price?.amount) || 0;

      if (status === "CONFIRMED") {
        totalConfirmedCount++;
        totalEstimatedRevenue += priceAmount;
        if (paymentStatus === "PAID" || paymentStatus === "COMPLETED") {
          totalPaidRevenue += priceAmount;
        }
      } else if (status === "CANCELED" || status === "DECLINED") {
        totalCanceledCount++;
      } else {
        totalPendingCount++;
      }

      return {
        id: item._id || item.id,
        date: item.startDate,
        serviceName: service.title || service.name || "Serviço",
        customerName: contact.firstName
          ? `${contact.firstName} ${contact.lastName || ""}`.trim()
          : contact.fullName || "Cliente",
        status,
        paymentStatus,
        amount: priceAmount,
      };
    });

    return NextResponse.json({
      success: true,
      indicators: {
        totalConfirmedCount,
        totalCanceledCount,
        totalPendingCount,
        totalEstimatedRevenue,
        totalPaidRevenue,
        conversionRate:
          totalConfirmedCount + totalCanceledCount > 0
            ? Math.round(
                (totalConfirmedCount /
                  (totalConfirmedCount + totalCanceledCount)) *
                  100
              )
            : 100,
      },
      recentSales: recentSales.slice(0, 30),
      note: "Dados sincronizados com o Wix Bookings Reader V2. Pagamentos online ou no local refletem o status de pagamento de cada agendamento.",
    });
  } catch (err: any) {
    console.error("[ADMIN SALES API ERROR]", err);
    return NextResponse.json(
      { error: "Falha ao consultar indicadores de vendas: " + (err.message || "") },
      { status: 500 }
    );
  }
}

