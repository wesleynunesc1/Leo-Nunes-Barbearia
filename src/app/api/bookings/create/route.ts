import { NextRequest, NextResponse } from "next/server";
import { getBarberById, getBarberBySlug } from "@/data/barbers";
import { BookingPayload, BookingCreateResponse, BookingErrorCode, SelectedServiceItem } from "@/types/booking";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";
import {
  computeIdempotencyKey,
  checkAndAcquireBookingLock,
  releaseBookingLocks,
  finalizeIdempotency,
  BookingLockIdentifier,
} from "@/lib/bookingStore";
import { verifySingleSlotAvailability, verifySingleMultiServiceSlot } from "@/lib/wixAvailability";
import { AUTH_COOKIE_NAME, getCurrentMemberProfile } from "@/lib/wixAuth";

export async function POST(request: NextRequest) {
  let lockKeysToRelease: BookingLockIdentifier | null = null;
  let idempotencyKey: string | null = null;
  let barberIdParam = "";
  let serviceIdParam = "";
  let dateParam = "";
  let timeParam = "";
  let phoneParam = "";

  try {
    const body: BookingPayload = await request.json();
    const { barberId, barberSlug, serviceId, date, time, customer, idempotencyKey: clientKey } = body;

    barberIdParam = barberId || barberSlug || "";
    serviceIdParam = serviceId || "";
    dateParam = date || "";
    timeParam = time || "";
    phoneParam = (customer?.phone || "").replace(/\D/g, "");

    // Identificação segura de membro autenticado (se houver sessão ativa no backend)
    let authenticatedMemberContactId: string | undefined = undefined;
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (authCookie) {
      try {
        const tokens = JSON.parse(authCookie);
        const member = await getCurrentMemberProfile(tokens);
        if (member?.contactId) {
          authenticatedMemberContactId = member.contactId;
        }
      } catch {
        // Ignora silenciosamente para visitantes
      }
    }

    // 1. Validações fundamentais de entrada
    if (!customer?.name || customer.name.trim().length < 3) {
      const errorResponse: BookingCreateResponse = {
        success: false,
        status: "ERROR",
        errorCode: "INVALID_DATA",
        message: "Informe seu nome completo (mínimo de 3 caracteres).",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (phoneParam.length < 10 || phoneParam.length > 11) {
      const errorResponse: BookingCreateResponse = {
        success: false,
        status: "ERROR",
        errorCode: "INVALID_DATA",
        message: "Informe um número de WhatsApp válido com DDD (ex: (85) 99999-9999).",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!date || !time) {
      const errorResponse: BookingCreateResponse = {
        success: false,
        status: "ERROR",
        errorCode: "INVALID_DATA",
        message: "Data e horário são obrigatórios.",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 2. Identificação do Barbeiro e Resource ID oficial
    const barber = barberId ? getBarberById(barberId) : getBarberBySlug(barberSlug);
    if (!barber || !barber.resourceId) {
      const errorResponse: BookingCreateResponse = {
        success: false,
        status: "ERROR",
        errorCode: "INVALID_DATA",
        message: "Profissional não encontrado no cadastro oficial.",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // 2.1. FLUXO OFICIAL WIX MULTI-SERVICE BOOKING (2 a 5 serviços)
    if (body.services && Array.isArray(body.services) && body.services.length > 1) {
      return await handleMultiServiceBookingFlow({
        body,
        barber,
        customer,
        date,
        time,
        phoneParam,
        clientKey,
        authenticatedMemberContactId,
        request,
      });
    }

    // 3. Resolução e validação do Serviço no servidor
    const isUuid = (id?: string | null) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    const localService = barber.services.find((s) => s.id === serviceId || s.wixServiceId === serviceId);
    const resolvedWixServiceId = isUuid(serviceId)
      ? serviceId
      : localService?.wixServiceId ||
        (barber.id === "leo-nunes"
          ? "71a2e1ca-2bce-410f-8d98-a64a5225a9ab"
          : "5fdf0f3a-8e3e-4009-8421-4467ef3b3871");

    let durationMinutes = localService?.durationMinutes || 40;
    let serviceName = localService?.name || "Serviço Barbearia";
    let formattedPrice = localService?.formattedPrice || "Sob consulta";
    let directWixUrl = localService?.bookingUrl;

    // 3.1. Validação em tempo real do serviço oficial no Wix Bookings
    if (isWixConfigured()) {
      try {
        const wixClient = getWixClient();
        if (wixClient) {
          const officialSvc: any = await wixClient.services.getService(resolvedWixServiceId);
          if (officialSvc) {
            const nameCheck = (officialSvc.name || "").toLowerCase();
            if (
              officialSvc.hidden ||
              officialSvc.status === "INACTIVE" ||
              nameCheck.includes("assinatura") ||
              nameCheck.includes("freestyle")
            ) {
              return NextResponse.json(
                {
                  success: false,
                  status: "ERROR",
                  errorCode: "SERVICE_INACTIVE",
                  message: "Este serviço não está disponível para agendamento online.",
                },
                { status: 400 }
              );
            }
            serviceName = officialSvc.name || serviceName;
            const officialDuration =
              officialSvc.schedule?.availabilityConstraints?.sessionDurations?.[0] ||
              officialSvc.schedule?.availabilityConstraints?.durations?.[0]?.minutes ||
              officialSvc.schedule?.durationInMinutes;
            if (officialDuration) {
              durationMinutes = officialDuration;
            }
            const officialPriceVal =
              officialSvc.payment?.fixed?.price?.value ||
              officialSvc.payment?.fixedPrice?.value ||
              officialSvc.payment?.rate?.price?.value ||
              officialSvc.price?.value;
            if (officialPriceVal !== undefined && officialPriceVal !== null) {
              const num = Number(officialPriceVal);
              formattedPrice =
                num > 0
                  ? `R$ ${num.toFixed(2).replace(".", ",")}`
                  : officialSvc.name?.toLowerCase().includes("assinatura")
                  ? "Plano Assinatura"
                  : "Sob consulta";
            }
          }
        }
      } catch (svcErr) {
        console.warn("[WIX REALTIME SERVICE LOOKUP FALLBACK]", svcErr);
      }
    }

    // 4. CHAVE DE IDEMPOTÊNCIA E TRAVA DE CONCORRÊNCIA DISTRIBUÍDA
    idempotencyKey = computeIdempotencyKey({
      barberId: barber.id,
      serviceId: resolvedWixServiceId,
      date,
      time,
      phone: phoneParam,
      clientKey,
    });

    const lockResult = await checkAndAcquireBookingLock({
      idempotencyKey,
      barberId: barber.id,
      serviceId: resolvedWixServiceId,
      date,
      time,
      phone: phoneParam,
    });

    if (!lockResult.allowed) {
      // Se já existe uma reserva confirmada idêntica associada a esta chave
      if (lockResult.existingRecord && lockResult.existingRecord.responsePayload) {
        return NextResponse.json(lockResult.existingRecord.responsePayload);
      }

      const httpStatus =
        lockResult.errorCode === "STORAGE_UNAVAILABLE"
          ? 503
          : lockResult.errorCode === "CONCURRENT_REQUEST"
          ? 429
          : 409;

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: lockResult.errorCode || "DUPLICATE_BOOKING",
          message: lockResult.message || "Solicitação duplicada ou em andamento. Aguarde alguns instantes.",
        },
        { status: httpStatus }
      );
    }

    lockKeysToRelease = lockResult.lockKeys;

    // 5. Verificação das credenciais administrativas Wix
    if (!isWixConfigured()) {
      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(
        {
          success: false,
          status: "WIX_CREDENTIALS_PENDING",
          errorCode: "AUTH_ERROR",
          wixIntegrationPending: true,
          message: "Credenciais do Wix Bookings não configuradas no backend.",
          directWixUrl,
        },
        { status: 401 }
      );
    }

    const wixClient = getWixClient();
    if (!wixClient) {
      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "AUTH_ERROR",
          message: "Falha na inicialização do cliente administrativo Wix SDK.",
        },
        { status: 500 }
      );
    }

    // 6. REVALIDAÇÃO OBRIGATÓRIA DE DISPONIBILIDADE REAL NO WIX (MESMA FONTE UNIFICADA DA ETAPA 4)
    const verification = await verifySingleSlotAvailability({
      barberId: barber.id,
      serviceId: resolvedWixServiceId,
      dateStr: date,
      timeStr: time,
      durationMinutes,
    });

    if (!verification.valid) {
      await releaseBookingLocks(lockKeysToRelease);
      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
      });

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: verification.errorCode || "SLOT_UNAVAILABLE",
          message:
            verification.message ||
            `O horário ${time} não está disponível na agenda oficial de ${barber.name}.`,
          directWixUrl,
        },
        { status: verification.httpStatus || 409 }
      );
    }

    const matchedSlot = verification.rawSlot || {};

    // 7. Cálculo exato de carimbos UTC no fuso de Pacajus (America/Sao_Paulo / UTC-3)
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const startUtc = new Date(Date.UTC(year, month - 1, day, hour + 3, minute, 0));

    // Determina a duração oficial: se o slot oficial do Wix possui localStartDate e localEndDate,
    // calcula a duração exata do slot fornecida pela API de disponibilidade do Wix
    let effectiveDurationMinutes = durationMinutes;
    if (matchedSlot?.localStartDate && matchedSlot?.localEndDate) {
      const slotStartMs = new Date(matchedSlot.localStartDate).getTime();
      const slotEndMs = new Date(matchedSlot.localEndDate).getTime();
      const slotDiffMinutes = Math.round((slotEndMs - slotStartMs) / 60000);
      if (slotDiffMinutes > 0) {
        effectiveDurationMinutes = slotDiffMinutes;
      }
    }

    const endUtc = new Date(startUtc.getTime() + effectiveDurationMinutes * 60000);

    // 8. CONTROLE DE SEGURANÇA: MODO REAL OU DRY-RUN VIA SERVIDOR
    const isRealBookingEnabled = process.env.ENABLE_REAL_WIX_BOOKINGS === "true";

    if (!isRealBookingEnabled) {
      await releaseBookingLocks(lockKeysToRelease);

      const dryRunResponse: BookingCreateResponse = {
        success: true,
        status: "DRY_RUN_VALIDATED",
        dryRun: true,
        message: `Disponibilidade e dados validados com sucesso com o Wix Bookings! A gravação na agenda oficial está em modo de segurança (dry-run). Defina ENABLE_REAL_WIX_BOOKINGS=true em .env.local para autorizar a gravação direta.`,
        directWixUrl,
        details: {
          barberName: barber.name,
          barberResourceId: barber.resourceId,
          serviceName,
          serviceId: resolvedWixServiceId,
          price: formattedPrice,
          duration: `${durationMinutes} minutos`,
          date,
          time,
          customerName: customer.name,
          customerPhone: customer.phone,
          wixSlotVerified: true,
          startDateUtc: startUtc.toISOString(),
          endDateUtc: endUtc.toISOString(),
          locationId: "c9ff9499-df93-470a-8ece-12f249208d4c",
          memberContactId: authenticatedMemberContactId || null,
          authorizationRequired: "ENABLE_REAL_WIX_BOOKINGS=true",
        },
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "CONFIRMED", // no dry run, gravamos o desfecho validado
        responsePayload: dryRunResponse,
      });

      return NextResponse.json(dryRunResponse);
    }

    // 9. CRIAÇÃO REAL NO WIX RESPEITANDO AS POLÍTICAS DO SERVIÇO
    // Não usamos skipBusinessConfirmation: true para respeitar se o serviço requer aprovação do proprietário
    const slotLocation = matchedSlot.location || {};
    const locationId = slotLocation._id || slotLocation.id || "c9ff9499-df93-470a-8ece-12f249208d4c";

    // locationType no Wix V2 Bookings enum: 'OWNER_BUSINESS' | 'OWNER_CUSTOM' | 'CUSTOM' | 'UNDEFINED'
    // A API de availabilityTimeSlots retorna 'BUSINESS', que mapeia para 'OWNER_BUSINESS' no V2 Writer
    const rawLocType = slotLocation.locationType || "OWNER_BUSINESS";
    const locationType =
      rawLocType === "BUSINESS" || rawLocType === "OWNER_BUSINESS"
        ? "OWNER_BUSINESS"
        : rawLocType;

    // scheduleId oficial: extraído do slot verificado ou do serviço
    let scheduleId = matchedSlot.scheduleId;
    if (!scheduleId) {
      try {
        const svc: any = await wixClient.services.getService(resolvedWixServiceId);
        scheduleId = svc?.schedule?._id || svc?.scheduleId;
      } catch (scheduleErr) {
        console.warn("[WIX RESOLVE SCHEDULE ID FALLBACK]", scheduleErr);
      }
    }

    // Telefone no padrão internacional E.164 (+55...) para envio de SMS e conformidade Wix
    const cleanDigits = phoneParam.replace(/\D/g, "");
    const formattedPhone = cleanDigits.startsWith("55") && cleanDigits.length >= 12
      ? `+${cleanDigits}`
      : `+55${cleanDigits}`;

    let createResponse: any = null;
    try {
      createResponse = await wixClient.bookings.createBooking(
        {
          totalParticipants: 1,
          bookedEntity: {
            slot: {
              serviceId: resolvedWixServiceId,
              scheduleId: scheduleId,
              sessionId: matchedSlot.sessionId || undefined,
              startDate: startUtc.toISOString(),
              endDate: endUtc.toISOString(),
              timezone: "America/Sao_Paulo",
              resource: {
                id: barber.resourceId,
                _id: barber.resourceId,
                name: barber.name,
              },
              location: {
                id: locationId,
                _id: locationId,
                locationType: locationType,
                name: slotLocation.name || "Léo Nunes Barbearia",
                formattedAddress: slotLocation.formattedAddress || undefined,
              },
            },
          },
          contactDetails: {
            contactId: authenticatedMemberContactId || undefined,
            firstName: customer.name.split(" ")[0],
            lastName: customer.name.split(" ").slice(1).join(" ") || "",
            phone: formattedPhone,
            email: customer.email || undefined,
          },
          notes: customer.notes || undefined,
        } as any,
        {
          participantNotification: {
            notifyParticipants: true,
          },
          sendSmsReminder: true,
          flowControlSettings: {
            skipAvailabilityValidation: false,
            // NÃO forçamos skipBusinessConfirmation: respeitamos a política oficial do serviço
            skipBusinessConfirmation: false,
            skipSelectedPaymentOptionValidation: true,
          },
        } as any
      );
    } catch (apiError: any) {
      const errLower = (apiError?.message || "").toLowerCase();
      const errStatus = apiError?.status || apiError?.statusCode;
      const wixErrorDetail =
        apiError?.details?.applicationError?.description ||
        apiError?.response?.data?.message ||
        apiError?.message ||
        "";
      const wixErrorCode = apiError?.details?.applicationError?.code || "";

      console.error("[WIX CREATE BOOKING FAILED]", {
        status: errStatus,
        code: wixErrorCode,
        message: wixErrorDetail,
      });

      await releaseBookingLocks(lockKeysToRelease);

      // Tratamento de Resposta Inconclusiva (timeout de rede durante a escrita)
      const isInconclusive =
        errLower.includes("timeout") ||
        errLower.includes("econnreset") ||
        errLower.includes("socket hang up") ||
        errStatus === 504;

      if (isInconclusive) {
        await finalizeIdempotency({
          idempotencyKey,
          barberId: barber.id,
          serviceId: resolvedWixServiceId,
          date,
          time,
          phone: phoneParam,
          status: "INCONCLUSIVE",
        });

        return NextResponse.json(
          {
            success: false,
            status: "ERROR",
            errorCode: "CONFIRMATION_PENDING",
            message:
              "A solicitação foi transmitida ao Wix, mas a confirmação automática não respondeu a tempo. Para evitar agendamentos duplicados, não repita imediatamente. Consulte a barbearia antes de reenviar.",
            directWixUrl,
          },
          { status: 504 }
        );
      }

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
      });

      let errorCode: BookingErrorCode = "CREATION_FAILED";
      let userMsg = "Não foi possível concluir a reserva no Wix Bookings.";
      let httpStatus = 500;

      if (errLower.includes("permission") || errLower.includes("forbidden") || errStatus === 403) {
        errorCode = "PERMISSION_DENIED";
        userMsg = "Permissão administrativa insuficiente no Wix para criar reservas. Verifique o escopo Manage Bookings na API Key.";
        httpStatus = 403;
      } else if (errLower.includes("auth") || errLower.includes("unauthorized") || errStatus === 401) {
        errorCode = "AUTH_ERROR";
        userMsg = "Falha de autenticação com o Wix. Verifique as credenciais.";
        httpStatus = 401;
      } else if (errLower.includes("conflict") || errLower.includes("already") || errStatus === 409) {
        errorCode = "SLOT_UNAVAILABLE";
        userMsg = "O horário selecionado acabou de ser preenchido na agenda do profissional.";
        httpStatus = 409;
      } else if (errStatus === 428 || wixErrorCode === "FAILED_VALIDATING_AVAILABILITY") {
        errorCode = "SLOT_UNAVAILABLE";
        userMsg = "O horário selecionado não atende à disponibilidade do serviço no Wix ou acabou de ser preenchido.";
        httpStatus = 409;
      } else if (errStatus === 400 || errLower.includes("validation") || errLower.includes("missing argument")) {
        errorCode = "INVALID_DATA";
        userMsg = wixErrorDetail || "Dados de agendamento rejeitados pela validação do Wix Bookings.";
        httpStatus = 400;
      }

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode,
          message: userMsg,
          directWixUrl,
        },
        { status: httpStatus }
      );
    }

    const createdBooking = createResponse?.booking || createResponse;
    const bookingId = createdBooking?._id || createdBooking?.id;
    let currentStatus = createdBooking?.status;

    // Se o resultado for inconclusivo (sem bookingId retornado)
    if (!bookingId) {
      await releaseBookingLocks(lockKeysToRelease);
      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "INCONCLUSIVE",
      });

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "CONFIRMATION_PENDING",
          message: "A solicitação foi enviada, mas o identificador oficial do Wix não pôde ser verificado.",
          directWixUrl,
        },
        { status: 202 }
      );
    }

    // Se a API indicar que checkout online é obrigatório
    if (createResponse?.checkoutUrl) {
      const checkoutResponse: BookingCreateResponse = {
        success: true,
        status: "CHECKOUT_REQUIRED",
        bookingId,
        message: "Reserva registrada no Wix! Conclua a confirmação no checkout oficial do serviço.",
        checkoutUrl: createResponse.checkoutUrl,
        directWixUrl,
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "CHECKOUT_REQUIRED",
        bookingId,
        responsePayload: checkoutResponse,
      });

      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(checkoutResponse);
    }

    // Se a reserva foi criada com status "CREATED":
    // Na documentação do Wix Bookings Writer V2, reservas criadas em fluxo presencial (custom checkout)
    // iniciam como CREATED e exigem confirmOrDeclineBooking para transicionar ao calendário.
    if (currentStatus === "CREATED") {
      try {
        const confirmRes: any = await wixClient.bookings.confirmOrDeclineBooking(
          bookingId,
          {
            paymentStatus: "NOT_PAID", // Pagamento presencial na barbearia
          } as any
        );
        const updatedBooking = confirmRes?.booking || confirmRes;
        if (updatedBooking?.status) {
          currentStatus = updatedBooking.status;
        }
      } catch (confirmErr: any) {
        console.error("[WIX CONFIRM_OR_DECLINE WARNING]", confirmErr?.message || confirmErr);

        // Tentativa não destrutiva de consultar o estado real antes de assumir falha
        let verifiedStatus: string | null = null;
        try {
          const queryRes: any = await (wixClient as any).extendedBookings
            .queryExtendedBookings()
            .eq("_id", bookingId)
            .limit(1)
            .find();
          const found = queryRes?.items?.[0] || queryRes?.bookings?.[0];
          if (found?.status) {
            verifiedStatus = found.status;
          }
        } catch (queryErr) {
          console.warn("[WIX CONSULT STATE FALLBACK WARNING]", queryErr);
        }

        if (verifiedStatus && verifiedStatus !== "CREATED") {
          currentStatus = verifiedStatus;
        } else {
          // Inconclusivo com bookingId conhecido: nunca tente recriar automaticamente
          await releaseBookingLocks(lockKeysToRelease);
          await finalizeIdempotency({
            idempotencyKey,
            barberId: barber.id,
            serviceId: resolvedWixServiceId,
            date,
            time,
            phone: phoneParam,
            status: "INCONCLUSIVE",
            bookingId,
          });

          return NextResponse.json(
            {
              success: false,
              status: "ERROR",
              errorCode: "CONFIRMATION_PENDING",
              bookingId,
              message: `A reserva foi gerada no Wix com o ID #${bookingId}, mas a confirmação presencial não pôde ser concluída a tempo. Não tente agendar novamente para evitar duplicidade. A barbearia verificará a reserva diretamente no painel.`,
              directWixUrl,
            },
            { status: 504 }
          );
        }
      }
    }

    // Tratamento dos status oficiais resultantes: DECLINED, PENDING, CONFIRMED
    if (currentStatus === "DECLINED") {
      await releaseBookingLocks(lockKeysToRelease);
      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
        bookingId,
      });

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "SLOT_UNAVAILABLE",
          bookingId,
          message: "A reserva foi recusada pelas políticas de agendamento do Wix. Por favor, selecione outro horário.",
          directWixUrl,
        },
        { status: 409 }
      );
    }

    if (currentStatus === "PENDING" || currentStatus === "PENDING_APPROVAL") {
      const pendingResponse: BookingCreateResponse = {
        success: true,
        status: "PENDING",
        bookingId,
        message: `Agendamento #${bookingId} registrado no Wix! Aguardando aprovação de ${barber.name}.`,
        details: {
          bookingId,
          barberName: barber.name,
          serviceName,
          date,
          time,
          customerName: customer.name,
          status: "PENDING",
        },
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: resolvedWixServiceId,
        date,
        time,
        phone: phoneParam,
        status: "PENDING",
        bookingId,
        responsePayload: pendingResponse,
      });

      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(pendingResponse);
    }

    // Caso permaneça CONFIRMED (ou auto-confirmado)
    const confirmedResponse: BookingCreateResponse = {
      success: true,
      status: "CONFIRMED",
      bookingId,
      message: `Agendamento #${bookingId} confirmado com sucesso na agenda oficial de ${barber.name}!`,
      details: {
        bookingId,
        barberName: barber.name,
        serviceName,
        date,
        time,
        customerName: customer.name,
        status: "CONFIRMED",
      },
    };

    await finalizeIdempotency({
      idempotencyKey,
      barberId: barber.id,
      serviceId: resolvedWixServiceId,
      date,
      time,
      phone: phoneParam,
      status: "CONFIRMED",
      bookingId,
      responsePayload: confirmedResponse,
    });

    await releaseBookingLocks(lockKeysToRelease);
    return NextResponse.json(confirmedResponse);
  } catch (globalError: any) {
    if (lockKeysToRelease) {
      await releaseBookingLocks(lockKeysToRelease);
    }
    console.error("[API BOOKING CREATE INTERNAL CRITICAL]", globalError);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        errorCode: "CREATION_FAILED",
        message: "Ocorreu um erro interno inesperado ao processar o agendamento.",
      },
      { status: 500 }
    );
  }
}

/**
 * Fluxo Oficial Wix Bookings V2 para Criação de Agendamentos com Múltiplos Serviços.
 * Cria reservas sequenciais sem lacunas utilizando createMultiServiceBooking.
 */
async function handleMultiServiceBookingFlow({
  body,
  barber,
  customer,
  date,
  time,
  phoneParam,
  clientKey,
  authenticatedMemberContactId,
  request,
}: {
  body: BookingPayload;
  barber: NonNullable<ReturnType<typeof getBarberById>>;
  customer: NonNullable<BookingPayload["customer"]>;
  date: string;
  time: string;
  phoneParam: string;
  clientKey?: string;
  authenticatedMemberContactId?: string;
  request: NextRequest;
}): Promise<Response> {
  let lockKeysToRelease: BookingLockIdentifier | null = null;
  let idempotencyKey: string | null = null;

  try {
    const rawServices: SelectedServiceItem[] = body.services || [];

    // 1. Limite de até 5 serviços por atendimento
    if (rawServices.length > 5) {
      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "INVALID_DATA",
          message: "O limite máximo é de 5 serviços por agendamento.",
        },
        { status: 400 }
      );
    }

    // 2. Não permitir duplicidades
    const rawServiceIds = rawServices.map((s) => s.id);
    if (new Set(rawServiceIds).size !== rawServiceIds.length) {
      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "INVALID_DATA",
          message: "Não é permitido selecionar o mesmo serviço mais de uma vez no mesmo agendamento.",
        },
        { status: 400 }
      );
    }

    // 3. Validar se todos os serviços pertencem ao barbeiro selecionado
    const isUuid = (id?: string | null) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    const resolvedServices: SelectedServiceItem[] = [];

    const wixClient = isWixConfigured() ? getWixClient() : null;

    for (const s of rawServices) {
      const localService = barber.services.find(
        (bs) =>
          bs.id === s.id ||
          bs.wixServiceId === s.id ||
          (Boolean(s.wixServiceId) && bs.wixServiceId === s.wixServiceId)
      );

      const resolvedUuid = isUuid(s.wixServiceId)
        ? s.wixServiceId
        : isUuid(s.id)
        ? s.id
        : localService?.wixServiceId;

      if (!localService && !resolvedUuid) {
        return NextResponse.json(
          {
            success: false,
            status: "ERROR",
            errorCode: "INVALID_DATA",
            message: `O serviço "${s.name || s.id}" não está habilitado para o profissional ${barber.name}.`,
          },
          { status: 400 }
        );
      }

      const wixSvcId =
        resolvedUuid ||
        (barber.id === "leo-nunes"
          ? "71a2e1ca-2bce-410f-8d98-a64a5225a9ab"
          : "5fdf0f3a-8e3e-4009-8421-4467ef3b3871");

      let name = s.name || localService?.name || "Serviço Barbearia";
      let duration = s.durationMinutes || localService?.durationMinutes || 30;
      let priceVal = s.price !== undefined ? s.price : (localService?.price || 0);
      let formattedPrice = s.formattedPrice || localService?.formattedPrice || (priceVal > 0 ? `R$ ${priceVal.toFixed(2).replace(".", ",")}` : "Sob consulta");

      // Revalidação em tempo real no Wix
      if (wixClient) {
        try {
          const officialSvc: any = await wixClient.services.getService(wixSvcId);
          if (officialSvc) {
            const nameCheck = (officialSvc.name || "").toLowerCase();
            if (
              officialSvc.hidden ||
              officialSvc.status === "INACTIVE" ||
              nameCheck.includes("assinatura") ||
              nameCheck.includes("freestyle")
            ) {
              return NextResponse.json(
                {
                  success: false,
                  status: "ERROR",
                  errorCode: "SERVICE_INACTIVE",
                  message: `O serviço "${officialSvc.name || name}" não está disponível para agendamento online.`,
                },
                { status: 400 }
              );
            }
            name = officialSvc.name || name;
            const officialDuration =
              officialSvc.schedule?.availabilityConstraints?.sessionDurations?.[0] ||
              officialSvc.schedule?.availabilityConstraints?.durations?.[0]?.minutes ||
              officialSvc.schedule?.durationInMinutes;
            if (officialDuration) duration = officialDuration;

            const officialPriceVal =
              officialSvc.payment?.fixed?.price?.value ||
              officialSvc.payment?.fixedPrice?.value ||
              officialSvc.payment?.rate?.price?.value ||
              officialSvc.price?.value;
            if (officialPriceVal !== undefined && officialPriceVal !== null) {
              priceVal = Number(officialPriceVal);
              formattedPrice = priceVal > 0 ? `R$ ${priceVal.toFixed(2).replace(".", ",")}` : "Sob consulta";
            }
          }
        } catch (svcErr) {
          console.warn(`[WIX MULTI-SERVICE LOOKUP WARN: ${wixSvcId}]`, svcErr);
        }
      }

      resolvedServices.push({
        id: s.id,
        wixServiceId: wixSvcId,
        name,
        durationMinutes: duration,
        price: priceVal,
        formattedPrice,
      });
    }

    const totalDurationMinutes = resolvedServices.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalPriceValue = resolvedServices.reduce((acc, curr) => acc + curr.price, 0);
    const formattedTotalPrice = `R$ ${totalPriceValue.toFixed(2).replace(".", ",")}`;
    const resolvedWixServiceIds = resolvedServices.map((s) => s.wixServiceId || s.id);

    // 4. Chave de idempotência e trava distribuída para o pacote de serviços
    const comboKey = resolvedWixServiceIds.slice().sort().join("+");
    idempotencyKey = computeIdempotencyKey({
      barberId: barber.id,
      serviceId: comboKey,
      date,
      time,
      phone: phoneParam,
      clientKey,
    });

    const lockResult = await checkAndAcquireBookingLock({
      idempotencyKey,
      barberId: barber.id,
      serviceId: comboKey,
      date,
      time,
      phone: phoneParam,
    });

    if (!lockResult.allowed) {
      if (lockResult.existingRecord?.responsePayload) {
        return NextResponse.json(lockResult.existingRecord.responsePayload);
      }
      const httpStatus =
        lockResult.errorCode === "STORAGE_UNAVAILABLE"
          ? 503
          : lockResult.errorCode === "CONCURRENT_REQUEST"
          ? 429
          : 409;
      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: lockResult.errorCode || "DUPLICATE_BOOKING",
          message: lockResult.message || "Solicitação de pacote duplicada ou em andamento. Aguarde alguns instantes.",
        },
        { status: httpStatus }
      );
    }

    lockKeysToRelease = lockResult.lockKeys;

    // 5. Credenciais Wix
    if (!isWixConfigured() || !wixClient) {
      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(
        {
          success: false,
          status: "WIX_CREDENTIALS_PENDING",
          errorCode: "AUTH_ERROR",
          wixIntegrationPending: true,
          message: "Credenciais do Wix Bookings não configuradas no backend.",
        },
        { status: 401 }
      );
    }

    // 6. Revalidação obrigatória de disponibilidade conjunta no Wix
    const verification = await verifySingleMultiServiceSlot({
      barberId: barber.id,
      serviceIds: resolvedWixServiceIds,
      dateStr: date,
      timeStr: time,
    });

    if (!verification.valid) {
      await releaseBookingLocks(lockKeysToRelease);
      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
      });

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: verification.errorCode || "SLOT_UNAVAILABLE",
          message:
            verification.message ||
            `O horário ${time} não possui disponibilidade contínua para os serviços selecionados na agenda de ${barber.name}.`,
        },
        { status: verification.httpStatus || 409 }
      );
    }

    const matchedSlot = verification.rawSlot || {};
    const nestedSlots = matchedSlot.nestedTimeSlots || [];

    // 7. Controle de Modo Real vs Dry-run via Configuração Segura do Servidor
    const isRealBookingEnabled = process.env.ENABLE_REAL_WIX_BOOKINGS === "true";

    const endTime = (matchedSlot.localEndDate || "").slice(11, 16) || "";

    if (!isRealBookingEnabled) {
      await releaseBookingLocks(lockKeysToRelease);

      const dryRunResponse: BookingCreateResponse = {
        success: true,
        status: "DRY_RUN_VALIDATED",
        dryRun: true,
        message: `Disponibilidade do pacote de ${resolvedServices.length} serviços validada com sucesso com o Wix Bookings!`,
        services: resolvedServices,
        totalPrice: formattedTotalPrice,
        totalDuration: `${totalDurationMinutes} minutos`,
        endTime,
        details: {
          barberName: barber.name,
          barberResourceId: barber.resourceId,
          services: resolvedServices,
          totalPrice: formattedTotalPrice,
          totalDuration: `${totalDurationMinutes} minutos`,
          date,
          time,
          endTime,
          customerName: customer.name,
          customerPhone: customer.phone,
          wixSlotVerified: true,
          nestedSlotsCount: nestedSlots.length,
          locationId: "c9ff9499-df93-470a-8ece-12f249208d4c",
          memberContactId: authenticatedMemberContactId || null,
        },
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "CONFIRMED",
        responsePayload: dryRunResponse,
      });

      return NextResponse.json(dryRunResponse);
    }

    // 8. Criação Real do Agendamento Agrupado via Wix Bookings V2
    const cleanDigits = phoneParam.replace(/\D/g, "");
    const formattedPhone =
      cleanDigits.startsWith("55") && cleanDigits.length >= 12
        ? `+${cleanDigits}`
        : `+55${cleanDigits}`;

    const [year, month, day] = date.split("-").map(Number);

    // Monta cada reserva do pacote com horário consecutivo individual oficial
    const bookingsArray = resolvedServices.map((svc, idx) => {
      const nested = nestedSlots[idx];
      let nestedStartUtcIso: string;
      let nestedEndUtcIso: string;

      if (nested?.localStartDate && nested?.localEndDate) {
        const [nStartHour, nStartMin] = (nested.localStartDate as string).slice(11, 16).split(":").map(Number);
        const [nEndHour, nEndMin] = (nested.localEndDate as string).slice(11, 16).split(":").map(Number);
        nestedStartUtcIso = new Date(Date.UTC(year, month - 1, day, nStartHour + 3, nStartMin, 0)).toISOString();
        nestedEndUtcIso = new Date(Date.UTC(year, month - 1, day, nEndHour + 3, nEndMin, 0)).toISOString();
      } else {
        const [h, m] = time.split(":").map(Number);
        const startMs = Date.UTC(year, month - 1, day, h + 3, m, 0);
        nestedStartUtcIso = new Date(startMs).toISOString();
        nestedEndUtcIso = new Date(startMs + svc.durationMinutes * 60000).toISOString();
      }

      return {
        totalParticipants: 1,
        bookedEntity: {
          slot: {
            serviceId: svc.wixServiceId,
            scheduleId: nested?.scheduleId || undefined,
            sessionId: nested?.sessionId || undefined,
            startDate: nestedStartUtcIso,
            endDate: nestedEndUtcIso,
            timezone: "America/Sao_Paulo",
            resource: {
              id: barber.resourceId,
              _id: barber.resourceId,
              name: barber.name,
            },
            location: {
              id: "c9ff9499-df93-470a-8ece-12f249208d4c",
              _id: "c9ff9499-df93-470a-8ece-12f249208d4c",
              locationType: "OWNER_BUSINESS",
              name: "Léo Nunes Barbearia",
            },
          },
        },
        contactDetails: {
          contactId: authenticatedMemberContactId || undefined,
          firstName: customer.name.split(" ")[0],
          lastName: customer.name.split(" ").slice(1).join(" ") || "",
          phone: formattedPhone,
          email: customer.email || undefined,
        },
        notes: customer.notes || undefined,
      };
    });

    let multiBookingResponse: any = null;
    try {
      multiBookingResponse = await wixClient.bookings.createMultiServiceBooking(
        bookingsArray as any,
        {
          returnFullEntity: true,
          participantNotification: {
            notifyParticipants: true,
          },
          sendSmsReminder: true,
          flowControlSettings: {
            skipAvailabilityValidation: false,
            skipBusinessConfirmation: false,
            skipSelectedPaymentOptionValidation: true,
          },
        } as any
      );
    } catch (apiError: any) {
      const errLower = (apiError?.message || "").toLowerCase();
      const errStatus = apiError?.status || apiError?.statusCode;
      const wixErrorDetail =
        apiError?.details?.applicationError?.description ||
        apiError?.response?.data?.message ||
        apiError?.message ||
        "";

      console.error("[WIX CREATE MULTI-SERVICE BOOKING FAILED]", {
        status: errStatus,
        message: wixErrorDetail,
      });

      await releaseBookingLocks(lockKeysToRelease);

      const isInconclusive =
        errLower.includes("timeout") ||
        errLower.includes("econnreset") ||
        errLower.includes("socket hang up") ||
        errStatus === 504;

      if (isInconclusive) {
        await finalizeIdempotency({
          idempotencyKey,
          barberId: barber.id,
          serviceId: comboKey,
          date,
          time,
          phone: phoneParam,
          status: "INCONCLUSIVE",
        });

        return NextResponse.json(
          {
            success: false,
            status: "ERROR",
            errorCode: "CONFIRMATION_PENDING",
            message:
              "A solicitação do pacote foi transmitida ao Wix, mas a confirmação automática não respondeu a tempo. Não tente novamente de imediato para evitar duplicidade.",
          },
          { status: 504 }
        );
      }

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
      });

      let errorCode: BookingErrorCode = "CREATION_FAILED";
      let userMsg = "Não foi possível concluir o agendamento agrupado no Wix Bookings.";
      let httpStatus = 500;

      if (errLower.includes("conflict") || errLower.includes("already") || errStatus === 409) {
        errorCode = "SLOT_UNAVAILABLE";
        userMsg = "Um dos horários do pacote acabou de ser preenchido por outro cliente.";
        httpStatus = 409;
      } else if (errStatus === 428) {
        errorCode = "SLOT_UNAVAILABLE";
        userMsg = "O horário selecionado não atende à disponibilidade de todas as sessões do pacote.";
        httpStatus = 409;
      }

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode,
          message: userMsg,
        },
        { status: httpStatus }
      );
    }

    const multiBooking = multiBookingResponse?.multiServiceBooking || multiBookingResponse;
    const multiBookingId = multiBooking?._id || multiBooking?.id;
    const rawBookings = multiBooking?.bookings || [];
    const subBookings = rawBookings.map((b: any) => ({
      bookingId: b.bookingId || b.booking?._id || b.booking?.id || b._id || b.id,
      revision: String(b.booking?.revision || b.revision || "1"),
      status: b.booking?.status || b.status || "CREATED",
    }));
    const subBookingIds = subBookings.map((b: any) => b.bookingId).filter(Boolean);

    // Se o pacote foi criado e as reservas necessitam de confirmação presencial (custom checkout)
    const needsConfirmation =
      subBookings.some((b: any) => b.status === "CREATED" || b.status === "PENDING") ||
      multiBooking?.status === "CREATED";

    if (needsConfirmation && multiBookingId && subBookings.length > 0) {
      try {
        const confirmBookingsInfo = subBookings.map((b: any) => ({
          bookingId: b.bookingId,
          revision: b.revision,
          paymentStatus: "NOT_PAID" as const,
        }));

        await wixClient.bookings.confirmMultiServiceBooking(multiBookingId, {
          confirmBookingsInfo,
          participantNotification: {
            notifyParticipants: true,
          },
          sendSmsReminder: true,
        });
      } catch (confirmErr: any) {
        console.error("[WIX MULTI-SERVICE CONFIRM ERROR]", confirmErr?.message || confirmErr);
      }
    }

    // Consulta e validação obrigatória do estado oficial no Wix Bookings
    let verifiedBookings: any[] = [];
    let isAllConfirmed = false;
    let isAnyPending = false;
    let isAnyDeclined = false;

    try {
      const verifiedRes: any = await wixClient.bookings.getMultiServiceBooking(multiBookingId);
      const vMulti = verifiedRes?.multiServiceBooking || verifiedRes;
      verifiedBookings = vMulti?.bookings || [];

      if (verifiedBookings.length > 0) {
        isAllConfirmed = verifiedBookings.every((b: any) => {
          const st = b.booking?.status || b.status;
          return st === "CONFIRMED";
        });
        isAnyPending = verifiedBookings.some((b: any) => {
          const st = b.booking?.status || b.status;
          return st === "PENDING" || st === "PENDING_APPROVAL" || st === "CREATED";
        });
        isAnyDeclined = verifiedBookings.some((b: any) => {
          const st = b.booking?.status || b.status;
          return st === "DECLINED" || st === "CANCELED";
        });
      }
    } catch (verifyErr: any) {
      console.warn("[WIX MULTI-SERVICE VERIFY GET WARN]", verifyErr?.message || verifyErr);
    }

    // Se todos os serviços do pacote foram comprovadamente confirmados
    if (isAllConfirmed) {
      const confirmedResponse: BookingCreateResponse = {
        success: true,
        status: "CONFIRMED",
        bookingId: multiBookingId || subBookingIds[0],
        multiServiceBookingId: multiBookingId,
        bookingIds: subBookingIds,
        services: resolvedServices,
        totalPrice: formattedTotalPrice,
        totalDuration: `${totalDurationMinutes} minutos`,
        endTime,
        message: "Agendamento confirmado com sucesso!",
        details: {
          bookingId: multiBookingId,
          barberName: barber.name,
          services: resolvedServices,
          totalPrice: formattedTotalPrice,
          totalDuration: `${totalDurationMinutes} minutos`,
          date,
          time,
          endTime,
          customerName: customer.name,
          status: "CONFIRMED",
        },
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "CONFIRMED",
        bookingId: multiBookingId,
        responsePayload: confirmedResponse,
      });

      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(confirmedResponse);
    }

    // Se algum dos serviços foi recusado pelo Wix
    if (isAnyDeclined) {
      await releaseBookingLocks(lockKeysToRelease);
      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "FAILED",
        bookingId: multiBookingId,
      });

      return NextResponse.json(
        {
          success: false,
          status: "ERROR",
          errorCode: "SLOT_UNAVAILABLE",
          bookingId: multiBookingId,
          message: "Um ou mais serviços foram recusados pelas políticas do Wix. Selecione outro horário.",
        },
        { status: 409 }
      );
    }

    // Se o pacote estiver pendente de aprovação manual pela barbearia
    if (isAnyPending) {
      const pendingResponse: BookingCreateResponse = {
        success: true,
        status: "PENDING",
        bookingId: multiBookingId || subBookingIds[0],
        multiServiceBookingId: multiBookingId,
        bookingIds: subBookingIds,
        services: resolvedServices,
        totalPrice: formattedTotalPrice,
        totalDuration: `${totalDurationMinutes} minutos`,
        endTime,
        message: "Solicitação recebida. Aguardando confirmação da barbearia.",
        details: {
          bookingId: multiBookingId,
          barberName: barber.name,
          services: resolvedServices,
          totalPrice: formattedTotalPrice,
          totalDuration: `${totalDurationMinutes} minutos`,
          date,
          time,
          endTime,
          customerName: customer.name,
          status: "PENDING",
        },
      };

      await finalizeIdempotency({
        idempotencyKey,
        barberId: barber.id,
        serviceId: comboKey,
        date,
        time,
        phone: phoneParam,
        status: "PENDING",
        bookingId: multiBookingId,
        responsePayload: pendingResponse,
      });

      await releaseBookingLocks(lockKeysToRelease);
      return NextResponse.json(pendingResponse);
    }

    // Se o status final for inconclusivo / não confirmado
    await releaseBookingLocks(lockKeysToRelease);
    await finalizeIdempotency({
      idempotencyKey,
      barberId: barber.id,
      serviceId: comboKey,
      date,
      time,
      phone: phoneParam,
      status: "INCONCLUSIVE",
      bookingId: multiBookingId,
    });

    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        errorCode: "CONFIRMATION_PENDING",
        bookingId: multiBookingId,
        message: "Não foi possível confirmar todos os serviços. Verifique o status antes de tentar novamente.",
      },
      { status: 502 }
    );
  } catch (error: any) {
    if (lockKeysToRelease) {
      await releaseBookingLocks(lockKeysToRelease);
    }
    console.error("[HANDLE MULTI-SERVICE CRITICAL ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        errorCode: "CREATION_FAILED",
        message: "Ocorreu um erro ao processar o agendamento com múltiplos serviços.",
      },
      { status: 500 }
    );
  }
}

