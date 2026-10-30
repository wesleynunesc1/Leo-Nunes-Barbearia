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
  const correlationId = `cancel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const startTime = performance.now();
  let lockKey: string | null = null;
  let ownerToken: string | null = null;

  try {
    const { bookingId } = await context.params;

    console.log(`[CANCEL][${correlationId}] Início da solicitação de cancelamento. Target bookingId: ${bookingId}`);

    if (!bookingId) {
      console.warn(`[CANCEL][${correlationId}] Falha: Identificador de reserva ausente.`);
      return NextResponse.json(
        { error: "Identificador de reserva ausente." },
        { status: 400 }
      );
    }

    // 1. Validar sessão autenticada do membro
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!authCookie) {
      console.warn(`[CANCEL][${correlationId}] Falha de autenticação: Cookie ausente.`);
      return NextResponse.json(
        { error: "Acesso restrito. Faça login para cancelar seu agendamento." },
        { status: 401 }
      );
    }

    let tokens: Tokens;
    try {
      tokens = JSON.parse(authCookie);
    } catch {
      console.warn(`[CANCEL][${correlationId}] Falha de autenticação: JSON de tokens inválido.`);
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const activeTokens = await renewMemberTokenIfNeeded(tokens);
    const member = await getCurrentMemberProfile(activeTokens);

    if (!member || !member.id || !member.contactId) {
      console.warn(`[CANCEL][${correlationId}] Falha de sessão: Membro expirado ou sem Contact ID.`);
      return NextResponse.json(
        { error: "Sessão expirada ou membro sem Contact ID vinculado." },
        { status: 401 }
      );
    }

    console.log(`[CANCEL][${correlationId}] Sessão validada. MemberId: ${member.id}`);

    // 2. Adquirir lock atômico no Redis para proteção contra duplo-clique e concorrência
    const lockResult = await acquireBookingMutationLock(bookingId, "cancel");
    if (!lockResult.acquired) {
      console.warn(`[CANCEL][${correlationId}] Concorrência detectada: Lock já ativo para ${bookingId}.`);
      return NextResponse.json(
        { error: lockResult.message || "Uma operação já está em andamento para este agendamento." },
        { status: 409 }
      );
    }
    lockKey = lockResult.lockKey;
    ownerToken = lockResult.ownerToken;

    const adminClient = getWixClient();
    if (!adminClient) {
      console.error(`[CANCEL][${correlationId}] Erro: Cliente administrativo do Wix indisponível.`);
      return NextResponse.json(
        { error: "Sistema de cancelamento temporariamente indisponível." },
        { status: 503 }
      );
    }

    // 3. Buscar a reserva oficial diretamente no Wix (por _id ou multiServiceBookingId)
    const queryBuilder = adminClient.extendedBookings.queryExtendedBookings() as any;
    let queryRes = await queryBuilder
      .eq("_id", bookingId)
      .limit(10)
      .find();

    // Fallback: se não encontrar por _id direto, pode ser um identificador de pacote multi-serviço
    if (!queryRes.items || queryRes.items.length === 0) {
      try {
        const multiQuery = adminClient.extendedBookings.queryExtendedBookings() as any;
        queryRes = await multiQuery
          .eq("multiServiceBookingInfo.multiServiceBookingId", bookingId)
          .limit(10)
          .find();
      } catch (mqErr) {
        console.warn(`[CANCEL][${correlationId}] Multi-query fallback:`, mqErr);
      }
    }

    if (!queryRes.items || queryRes.items.length === 0) {
      console.warn(`[CANCEL][${correlationId}] Agendamento não encontrado no Wix para id: ${bookingId}`);
      return NextResponse.json(
        { error: "Agendamento não encontrado no sistema oficial do Wix." },
        { status: 404 }
      );
    }

    const primaryItem = queryRes.items[0].booking;
    if (!primaryItem || !primaryItem._id) {
      console.warn(`[CANCEL][${correlationId}] Dados da reserva inválidos retornados pelo Wix.`);
      return NextResponse.json(
        { error: "Dados da reserva inválidos." },
        { status: 404 }
      );
    }

    // 4. Confirmar a propriedade da reserva
    const bookingContactId = primaryItem.contactDetails?.contactId;
    if (bookingContactId !== member.contactId) {
      console.warn(`[CANCEL][${correlationId}] Violação de autorização. BookingContact: ${bookingContactId} !== MemberContact: ${member.contactId}`);
      return NextResponse.json(
        { error: "Você não tem autorização para cancelar esta reserva." },
        { status: 403 }
      );
    }

    // Identificar se faz parte de um pacote multisserviço
    const multiId =
      primaryItem.multiServiceBookingInfo?._id ||
      primaryItem.multiServiceBookingInfo?.multiServiceBookingId ||
      primaryItem.multiServiceBookingId;

    let allGroupBookings = queryRes.items.map((it: any) => it.booking).filter(Boolean);

    // Se o multiId existir mas a query inicial trouxe apenas 1 item, busca o restante do grupo
    if (multiId && allGroupBookings.length === 1) {
      try {
        const fullGroupQuery = adminClient.extendedBookings.queryExtendedBookings() as any;
        const fullGroupRes = await fullGroupQuery
          .eq("multiServiceBookingInfo.multiServiceBookingId", multiId)
          .limit(10)
          .find();
        if (fullGroupRes?.items && fullGroupRes.items.length > 0) {
          allGroupBookings = fullGroupRes.items.map((it: any) => it.booking).filter(Boolean);
        }
      } catch (fgErr) {
        console.warn(`[CANCEL][${correlationId}] Erro ao buscar pacote completo:`, fgErr);
      }
    }

    console.log(`[CANCEL][${correlationId}] Reservas localizadas para cancelamento: ${allGroupBookings.length} (Multi-serviço: ${Boolean(multiId)})`);

    // 5. Validar status das reservas
    const allAlreadyCanceled = allGroupBookings.every((b: any) => b.status === "CANCELED");
    if (allAlreadyCanceled) {
      console.log(`[CANCEL][${correlationId}] Reserva(s) já se encontravam canceladas.`);
      return NextResponse.json({
        success: true,
        alreadyCanceled: true,
        status: "CANCELED",
        message: "Esta reserva já se encontra cancelada.",
      });
    }

    if (primaryItem.status === "DECLINED") {
      return NextResponse.json(
        { error: "Reservas recusadas não podem ser canceladas." },
        { status: 400 }
      );
    }

    const startDateObj = new Date(primaryItem.startDate);
    const now = new Date();
    if (startDateObj < now) {
      return NextResponse.json(
        { error: "Não é possível cancelar um agendamento que já ocorreu." },
        { status: 400 }
      );
    }

    // 6. Verificar se o cancelamento é permitido pela política oficial do Wix
    try {
      const allowedRes = await (adminClient.bookings.bulkCalculateAllowedActions as any)([primaryItem._id]);
      if (allowedRes?.results && allowedRes.results.length > 0) {
        const canCancelWix = Boolean(allowedRes.results[0]?.item?.cancel);
        if (!canCancelWix) {
          console.warn(`[CANCEL][${correlationId}] Wix policy recusou o cancelamento (antecedência insuficiente).`);
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
      console.warn(`[CANCEL][${correlationId}] Aviso ao verificar allowed actions:`, e);
    }

    // 7. Executar o cancelamento oficial no Wix Bookings
    console.log(`[CANCEL][${correlationId}] Executando cancelamento no Wix Bookings...`);

    const cancelErrors: string[] = [];

    for (const b of allGroupBookings) {
      if (b.status === "CANCELED") continue;
      const bId = b._id;
      const rev = b.revision || "1";

      try {
        await (adminClient.bookings.cancelBooking as any)(bId, {
          revision: rev,
          participantNotification: {
            notifyParticipants: true,
            message: "Agendamento cancelado pelo cliente no portal Léo Nunes Barbearia.",
          },
        });
        console.log(`[CANCEL][${correlationId}] Item cancelado com sucesso no Wix: ${bId}`);
      } catch (itemErr: any) {
        console.error(`[CANCEL][${correlationId}] Erro ao cancelar item ${bId}:`, itemErr);
        cancelErrors.push(itemErr?.message || `Falha no item ${bId}`);
      }
    }

    if (cancelErrors.length > 0 && cancelErrors.length === allGroupBookings.length) {
      throw new Error(`Falha ao cancelar reserva(s) no Wix: ${cancelErrors.join("; ")}`);
    }

    // 8. Consultar novamente o estado oficial no Wix para confirmar a mutação
    const verifyQuery = adminClient.extendedBookings.queryExtendedBookings() as any;
    const verifyRes = await verifyQuery
      .eq("_id", primaryItem._id)
      .limit(1)
      .find();

    const verifiedBooking = verifyRes?.items?.[0]?.booking;
    const isConfirmedCanceled = verifiedBooking?.status === "CANCELED";

    const elapsedMs = (performance.now() - startTime).toFixed(1);
    console.log(`[CANCEL][${correlationId}] Verificação pós-cancelamento concluída em ${elapsedMs}ms. Status: ${verifiedBooking?.status}`);

    // Disparo assíncrono de Web Push Notification
    try {
      const { sendPushNotification } = await import("@/lib/pushNotifications");
      sendPushNotification(
        { memberId: member.id },
        {
          title: "Léo Nunes Barbearia ✂️",
          body: "Seu horário foi cancelado com sucesso no Wix Bookings.",
          url: "/minha-conta/agendamentos",
        }
      ).catch((e) => console.error(`[CANCEL][${correlationId}] Push notification error:`, e));
    } catch {}

    return NextResponse.json({
      success: true,
      bookingId,
      status: "CANCELED",
      verified: isConfirmedCanceled,
      message: "Seu agendamento foi cancelado com sucesso no Wix Bookings.",
      durationMs: Number(elapsedMs),
    });
  } catch (err: any) {
    const elapsedMs = (performance.now() - startTime).toFixed(1);
    console.error(`[CANCEL][${correlationId}] Erro durante o cancelamento após ${elapsedMs}ms:`, err);

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
