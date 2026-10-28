import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getCurrentMemberProfile,
  renewMemberTokenIfNeeded,
} from "@/lib/wixAuth";
import { getWixClient } from "@/lib/wixClient";
import { BARBERS } from "@/data/barbers";
import { Tokens } from "@wix/sdk";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Identificador de reserva ausente." },
        { status: 400 }
      );
    }

    // 1. Validar sessão autenticada do membro
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!authCookie) {
      return NextResponse.json(
        { error: "Acesso restrito. Faça login para gerenciar seu agendamento." },
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

    if (!member || !member.id || !member.contactId) {
      return NextResponse.json(
        { error: "Sessão expirada ou membro sem Contact ID vinculado." },
        { status: 401 }
      );
    }

    const adminClient = getWixClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Sistema de agendamentos temporariamente indisponível." },
        { status: 503 }
      );
    }

    // 2. Buscar a reserva oficial diretamente no Wix via _id
    const queryBuilder = adminClient.extendedBookings.queryExtendedBookings() as any;
    const queryRes = await queryBuilder
      .eq("_id", bookingId)
      .limit(1)
      .find();

    if (!queryRes.items || queryRes.items.length === 0) {
      return NextResponse.json(
        { error: "Agendamento não encontrado no sistema." },
        { status: 404 }
      );
    }

    const booking = queryRes.items[0].booking;
    if (!booking || !booking._id) {
      return NextResponse.json(
        { error: "Dados da reserva inválidos." },
        { status: 404 }
      );
    }

    // 3. Validação Estrita de Propriedade: o Contact ID da reserva DEVE ser igual ao do membro logado
    const bookingContactId = booking.contactDetails?.contactId;
    if (bookingContactId !== member.contactId) {
      return NextResponse.json(
        { error: "Você não tem autorização para visualizar ou gerenciar esta reserva." },
        { status: 403 }
      );
    }

    // 4. Verificar ações permitidas oficialmente pelo Wix
    let wixCanCancel = false;
    let wixCanReschedule = false;
    try {
      const allowedActionsRes = await (adminClient.bookings.bulkCalculateAllowedActions as any)([booking._id]);
      if (allowedActionsRes?.results && allowedActionsRes.results.length > 0) {
        const itemResult =
          allowedActionsRes.results.find((r: any) => r.itemMetadata?._id === booking._id) ||
          allowedActionsRes.results[0];
        wixCanCancel = Boolean(itemResult?.item?.cancel);
        wixCanReschedule = Boolean(itemResult?.item?.reschedule);
      }
    } catch (allowedErr: any) {
      console.warn("[ALLOWED ACTIONS WARNING]", allowedErr?.message || allowedErr);
    }

    const startDateObj = new Date(booking.startDate);
    const endDateObj = booking.endDate ? new Date(booking.endDate) : startDateObj;
    const now = new Date();
    const isPast = startDateObj < now;
    const isTerminalStatus = booking.status === "CANCELED" || booking.status === "DECLINED";

    // Formatação no fuso America/Fortaleza
    const dateFormatted = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Fortaleza",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(startDateObj);

    const timeFormatted = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Fortaleza",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(startDateObj);

    const localDateIso = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Fortaleza",
    }).format(startDateObj);

    const durationMs = endDateObj.getTime() - startDateObj.getTime();
    const durationMinutes = durationMs > 0 ? Math.round(durationMs / 60000) : 40;

    // Enriquecimento com os dados locais do barbeiro
    const resourceId = booking.bookedEntity?.slot?.resource?._id;
    const resourceName = booking.bookedEntity?.slot?.resource?.name || "";
    const matchedBarber = BARBERS.find(
      (b) =>
        (resourceId && b.resourceId === resourceId) ||
        b.name.toLowerCase() === resourceName.toLowerCase()
    );

    // Avaliação final de regras de negócio para exibição clara
    let canCancel = wixCanCancel && !isPast && !isTerminalStatus;
    let canReschedule = wixCanReschedule && !isPast && !isTerminalStatus;
    let cancelReason: string | undefined = undefined;
    let rescheduleReason: string | undefined = undefined;

    if (booking.status === "CANCELED") {
      canCancel = false;
      canReschedule = false;
      cancelReason = "Esta reserva já foi cancelada.";
      rescheduleReason = "Reservas canceladas não podem ser reagendadas.";
    } else if (booking.status === "DECLINED") {
      canCancel = false;
      canReschedule = false;
      cancelReason = "Esta reserva foi recusada.";
      rescheduleReason = "Reservas recusadas não podem ser reagendadas.";
    } else if (isPast) {
      canCancel = false;
      canReschedule = false;
      cancelReason = "O horário deste atendimento já passou.";
      rescheduleReason = "Atendimentos passados não podem ser reagendados.";
    } else {
      if (!wixCanCancel) {
        cancelReason = "A política da barbearia não permite cancelamento com menos de 2 horas de antecedência.";
      }
      if (!wixCanReschedule) {
        rescheduleReason = "A política da barbearia não permite reagendamento com menos de 2 horas de antecedência.";
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id,
        revision: booking.revision || "1",
        status: booking.status || "CONFIRMED",
        paymentStatus: booking.paymentStatus,
        serviceTitle: booking.bookedEntity?.title || "Atendimento na Barbearia",
        serviceId: booking.bookedEntity?.slot?.serviceId,
        barberName: matchedBarber ? matchedBarber.name : resourceName,
        barberSlug: matchedBarber ? matchedBarber.slug : undefined,
        barberRole: matchedBarber ? matchedBarber.role : "Especialista em Cortes",
        barberImage: matchedBarber ? matchedBarber.photo : undefined,
        barberResourceId: resourceId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        formattedDate: dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1),
        formattedTime: timeFormatted,
        localDate: localDateIso,
        durationMinutes,
        priceFormatted: booking.totalPrice?.value ? `R$ ${booking.totalPrice.value}` : undefined,
        locationName: booking.bookedEntity?.slot?.location?.name || "Rua Joaquim Nogueira Lopes, 180, Pacajus - CE",
        allowedActions: {
          canCancel,
          canReschedule,
          cancelReason,
          rescheduleReason,
        },
        policies: {
          cancellation: "Cancelamentos permitidos com até 2 horas de antecedência do início do horário agendado.",
          reschedule: "Reagendamentos permitidos mediante disponibilidade do profissional escolhido e antecedência mínima de 2 horas.",
        },
      },
    });
  } catch (err: any) {
    console.error("[GET BOOKING DETAILS ERROR]", err);
    const errStatus = err?.status || err?.response?.status;
    const wixCode = err?.details?.applicationError?.code || err?.code;
    const httpStatus = errStatus && errStatus >= 400 && errStatus < 600 ? errStatus : 500;

    return NextResponse.json(
      {
        error: "Erro ao consultar detalhes da reserva no Wix Bookings.",
        code: wixCode || "INTEGRATION_ERROR",
        message: err?.message || "Falha na comunicação com o Wix Bookings Reader V2.",
      },
      { status: httpStatus }
    );
  }
}
