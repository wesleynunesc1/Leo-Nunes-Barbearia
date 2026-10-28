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
        { error: "Acesso restrito. Faça login para cancelar seu agendamento." },
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

    // 2. Adquirir lock atômico no Redis para proteção contra duplo-clique e concorrência
    const lockResult = await acquireBookingMutationLock(bookingId, "cancel");
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
        { error: "Sistema de cancelamento temporariamente indisponível." },
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
        { error: "Você não tem autorização para cancelar esta reserva." },
        { status: 403 }
      );
    }

    // 5. Validar status da reserva
    if (booking.status === "CANCELED") {
      return NextResponse.json({
        success: true,
        alreadyCanceled: true,
        status: "CANCELED",
        message: "Esta reserva já se encontra cancelada.",
      });
    }

    if (booking.status === "DECLINED") {
      return NextResponse.json(
        { error: "Reservas recusadas não podem ser canceladas." },
        { status: 400 }
      );
    }

    const startDateObj = new Date(booking.startDate);
    const now = new Date();
    if (startDateObj < now) {
      return NextResponse.json(
        { error: "Não é possível cancelar um agendamento que já ocorreu." },
        { status: 400 }
      );
    }

    // 6. Verificar se o cancelamento é permitido pela política oficial do Wix
    try {
      const allowedRes = await (adminClient.bookings.bulkCalculateAllowedActions as any)([booking._id]);
      if (allowedRes?.results && allowedRes.results.length > 0) {
        const canCancelWix = Boolean(allowedRes.results[0]?.item?.cancel);
        if (!canCancelWix) {
          return NextResponse.json(
            {
              error:
                "O cancelamento não é permitido para este horário conforme a política de antecedência da barbearia.",
            },
            { status: 422 }
          );
        }
      }
    } catch (e) {
      console.warn("[CALCULATE ALLOWED ACTIONS WARNING IN CANCEL]", e);
    }

    // 7. Obter revision atualizada
    const currentRevision = booking.revision || "1";

    // 8. Executar cancelBooking oficial do Wix Bookings Writer V2
    // Sem bypass: não usar ignoreCancellationPolicy, withRefund ou waiveCancellationFee
    await (adminClient.bookings.cancelBooking as any)(bookingId, {
      revision: currentRevision,
      participantNotification: {
        notifyParticipants: true,
        message: "Agendamento cancelado pelo cliente no portal Léo Nunes Barbearia.",
      },
    });

    // 9. Consultar novamente a reserva para confirmar que o status realmente mudou para CANCELED
    const verifyRes = await (adminClient.extendedBookings.queryExtendedBookings() as any)
      .eq("_id", bookingId)
      .limit(1)
      .find();

    const updatedBooking = verifyRes.items?.[0]?.booking;
    const isNowCanceled = updatedBooking?.status === "CANCELED";

    if (!isNowCanceled) {
      console.warn("[CANCEL POST-CHECK UNCONFIRMED]", updatedBooking?.status);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: "CANCELED",
      message: "Seu agendamento foi cancelado com sucesso no Wix Bookings.",
    });
  } catch (err: any) {
    console.error("[CANCEL BOOKING ERROR]", err);

    const errorMessage =
      err?.message?.includes("revision") || err?.details?.applicationError?.code === "REVISION_MISMATCH"
        ? "A reserva foi modificada recentemente. Por favor, recarregue a página e tente novamente."
        : err?.message || "Não foi possível cancelar o agendamento no momento.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Libera a trava atômica do Redis
    if (lockKey && ownerToken) {
      await releaseBookingMutationLock(lockKey, ownerToken);
    }
  }
}
