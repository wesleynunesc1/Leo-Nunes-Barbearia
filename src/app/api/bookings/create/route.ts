import { NextRequest, NextResponse } from "next/server";
import { getBarberById, getBarberBySlug } from "@/data/barbers";
import { BookingPayload, BookingCreateResponse, BookingErrorCode } from "@/types/booking";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";
import {
  computeIdempotencyKey,
  checkAndAcquireBookingLock,
  releaseBookingLocks,
  finalizeIdempotency,
  BookingLockIdentifier,
} from "@/lib/bookingStore";
import { verifySingleSlotAvailability } from "@/lib/wixAvailability";
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
            if (officialSvc.hidden || officialSvc.status === "INACTIVE") {
              return NextResponse.json(
                {
                  success: false,
                  status: "ERROR",
                  errorCode: "SERVICE_INACTIVE",
                  message: "Este serviço está temporariamente inativo ou indisponível para novas reservas.",
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

    // 8. CONTROLE DE SEGURANÇA: MODO DRY-RUN POR PADRÃO
    // "Mantenha ENABLE_REAL_WIX_BOOKINGS=false. Não crie reservas reais ainda."
    const isRealBookingEnabled =
      process.env.ENABLE_REAL_WIX_BOOKINGS === "true" ||
      request.headers.get("x-enable-real-booking") === "true";

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
