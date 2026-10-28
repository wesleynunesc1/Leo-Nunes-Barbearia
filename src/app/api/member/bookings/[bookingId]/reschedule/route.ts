import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getCurrentMemberProfile,
  renewMemberTokenIfNeeded,
} from "@/lib/wixAuth";
import { getWixClient } from "@/lib/wixClient";
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from "@/lib/bookingStore";
import { verifySingleSlotAvailability } from "@/lib/wixAvailability";
import { BARBERS } from "@/data/barbers";
import { buildV2Slot } from "@/lib/wixLocation";
import { Tokens } from "@wix/sdk";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  let lockKey: string | null = null;
  let ownerToken: string | null = null;

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
        { error: "Acesso restrito. Faça login para reagendar seu agendamento." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { newDate, newTime } = body;

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: "Data e horário para reagendamento são obrigatórios (newDate e newTime)." },
        { status: 400 }
      );
    }

    // Validação de formato da nova data e horário
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(newDate) || !timeRegex.test(newTime)) {
      return NextResponse.json(
        { error: "Formato inválido. Utilize YYYY-MM-DD para data e HH:mm para horário." },
        { status: 400 }
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

    // 2. Adquirir lock atômico no Redis
    const lockResult = await acquireBookingMutationLock(bookingId, "reschedule");
    if (!lockResult.acquired) {
      return NextResponse.json(
        { error: lockResult.message || "Uma operação já está em andamento para este agendamento." },
        { status: 409 }
      );
    }
    lockKey = lockResult.lockKey;
    ownerToken = lockResult.ownerToken;

    const adminClient = getWixClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Sistema de reagendamento temporariamente indisponível." },
        { status: 503 }
      );
    }

    // 3. Buscar a reserva oficial diretamente no Wix
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

    // 4. Confirmar a propriedade da reserva
    const bookingContactId = booking.contactDetails?.contactId;
    if (bookingContactId !== member.contactId) {
      return NextResponse.json(
        { error: "Você não tem autorização para reagendar esta reserva." },
        { status: 403 }
      );
    }

    // 5. Validar status da reserva
    if (booking.status === "CANCELED" || booking.status === "DECLINED") {
      return NextResponse.json(
        { error: "Reservas canceladas ou recusadas não podem ser reagendadas." },
        { status: 400 }
      );
    }

    const currentStartDate = new Date(booking.startDate);
    const now = new Date();
    if (currentStartDate < now) {
      return NextResponse.json(
        { error: "Não é possível reagendar um atendimento do passado." },
        { status: 400 }
      );
    }

    // 6. Verificar se o reagendamento é permitido pela política oficial do Wix
    try {
      const allowedRes = await (adminClient.bookings.bulkCalculateAllowedActions as any)([booking._id]);
      if (allowedRes?.results && allowedRes.results.length > 0) {
        const canRescheduleWix = Boolean(allowedRes.results[0]?.item?.reschedule);
        if (!canRescheduleWix) {
          return NextResponse.json(
            {
              error:
                "O reagendamento não é permitido para este horário conforme a política de antecedência da barbearia.",
            },
            { status: 422 }
          );
        }
      }
    } catch (e) {
      console.warn("[CALCULATE ALLOWED ACTIONS WARNING IN RESCHEDULE]", e);
    }

    // 7. Obter dados do serviço e barbeiro da reserva original
    const serviceId = booking.bookedEntity?.slot?.serviceId;
    const resourceId = booking.bookedEntity?.slot?.resource?._id;
    const resourceName = booking.bookedEntity?.slot?.resource?.name || "";

    if (!serviceId) {
      return NextResponse.json(
        { error: "Identificador de serviço ausente na reserva original." },
        { status: 400 }
      );
    }

    const matchedBarber = BARBERS.find(
      (b) =>
        (resourceId && b.resourceId === resourceId) ||
        b.name.toLowerCase() === resourceName.toLowerCase()
    );

    const barberId = matchedBarber ? matchedBarber.id : "aleffer-nunes";

    // 8. Consultar a disponibilidade real no Wix para a nova data e horário
    const verifyResult = await verifySingleSlotAvailability({
      dateStr: newDate,
      timeStr: newTime,
      barberId,
      barberSlug: matchedBarber?.slug,
      serviceId,
    });

    if (!verifyResult.valid || !verifyResult.rawSlot) {
      return NextResponse.json(
        {
          error:
            verifyResult.message ||
            "O horário selecionado não está mais disponível na agenda do profissional.",
        },
        { status: verifyResult.httpStatus || 409 }
      );
    }

    const rawSlot = verifyResult.rawSlot;

    // Calcular a duração oficial com base no slot retornado ou na reserva original
    const origStart = new Date(booking.startDate);
    const origEnd = booking.endDate ? new Date(booking.endDate) : origStart;
    const origDurationMin = Math.round((origEnd.getTime() - origStart.getTime()) / 60000);

    let slotDurationMin = 0;
    if (rawSlot.localStartDate && rawSlot.localEndDate) {
      slotDurationMin = Math.round(
        (new Date(rawSlot.localEndDate).getTime() - new Date(rawSlot.localStartDate).getTime()) / 60000
      );
    }
    const finalDurationMinutes =
      slotDurationMin > 0 ? slotDurationMin : origDurationMin > 0 ? origDurationMin : 35;

    // Constrói o slot oficial V2Slot estritamente validado
    const originalSlot = booking.bookedEntity?.slot || {};
    const slotBuildResult = buildV2Slot({
      newDate,
      newTime,
      serviceId,
      scheduleId: rawSlot.scheduleId || originalSlot.scheduleId,
      resourceId: resourceId || originalSlot.resource?._id || originalSlot.resource?.id || matchedBarber?.resourceId,
      resourceName: resourceName || originalSlot.resource?.name || matchedBarber?.name || "Profissional",
      resourceScheduleId: originalSlot.resource?.scheduleId,
      durationMinutes: finalDurationMinutes,
      timezone: originalSlot.timezone || "America/Sao_Paulo",
      rawSlotLocation: rawSlot.location,
      originalBookingLocation: originalSlot.location,
    });

    if (!slotBuildResult.valid || !slotBuildResult.v2Slot) {
      console.error("[BUILD V2SLOT ERROR]", slotBuildResult.error);
      return NextResponse.json(
        { error: "Não foi possível validar a localização oficial da barbearia para este reagendamento." },
        { status: 422 }
      );
    }

    const v2Slot = slotBuildResult.v2Slot;

    // 9. Obter a revision mais recente
    const currentRevision = booking.revision || "1";

    // 10. Executar rescheduleBooking oficial do Wix
    // Sem bypass: não usar ignoreReschedulePolicy, skipAvailabilityValidation, skipBusinessConfirmation
    const rescheduleResponse = await (adminClient.bookings.rescheduleBooking as any)(
      bookingId,
      v2Slot,
      {
        revision: currentRevision,
        participantNotification: {
          notifyParticipants: true,
          message: `Agendamento reagendado pelo cliente para ${newDate} às ${newTime} na Léo Nunes Barbearia.`,
        },
      }
    );

    // 11. Consultar novamente no Wix para confirmar a nova data e horário
    const postCheckRes = await (adminClient.extendedBookings.queryExtendedBookings() as any)
      .eq("_id", bookingId)
      .limit(1)
      .find();

    const updatedBooking = postCheckRes.items?.[0]?.booking;

    const confirmedStartDate = updatedBooking?.startDate || v2Slot.startDate;
    const confirmedEndDate = updatedBooking?.endDate || v2Slot.endDate;

    const startDateObj = new Date(confirmedStartDate);
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

    return NextResponse.json({
      success: true,
      bookingId,
      newDate,
      newTime,
      formattedDate: dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1),
      formattedTime: timeFormatted,
      status: updatedBooking?.status || "CONFIRMED",
      revision: updatedBooking?.revision || "2",
      message: "Seu agendamento foi reagendado com sucesso no Wix Bookings.",
    });
  } catch (err: any) {
    console.error("[RESCHEDULE BOOKING ERROR]", {
      message: err?.message,
      status: err?.status || err?.response?.status,
      code: err?.details?.applicationError?.code,
    });

    const errStatus = err?.status || err?.response?.status;
    const wixErrorCode = err?.details?.applicationError?.code;

    let userMessage = "Não foi possível reagendar neste momento. Tente novamente.";
    let httpStatus = 500;

    if (errStatus === 428 || wixErrorCode === "FAILED_VALIDATING_AVAILABILITY") {
      userMessage = "O horário selecionado acabou de ser ocupado ou não atende à disponibilidade do profissional.";
      httpStatus = 409;
    } else if (err?.message?.includes("revision") || wixErrorCode === "REVISION_MISMATCH") {
      userMessage = "A reserva foi modificada recentemente. Por favor, recarregue a página e tente novamente.";
      httpStatus = 409;
    } else if (errStatus === 422 || errStatus === 400 || wixErrorCode === "INVALID_ARGUMENT") {
      userMessage = "Não foi possível reagendar com os dados informados. Tente outro horário.";
      httpStatus = 422;
    } else if (wixErrorCode === "RESCHEDULE_NOT_ALLOWED") {
      userMessage = "O reagendamento não é permitido para esta reserva conforme as políticas da barbearia.";
      httpStatus = 422;
    }

    return NextResponse.json({ error: userMessage }, { status: httpStatus });
  } finally {
    if (lockKey && ownerToken) {
      await releaseBookingMutationLock(lockKey, ownerToken);
    }
  }
}
