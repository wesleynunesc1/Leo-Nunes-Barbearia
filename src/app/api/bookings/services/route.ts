import { NextRequest, NextResponse } from "next/server";
import { getBarberBySlug, getBarberById, getAllBarbers } from "@/data/barbers";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barberSlug = searchParams.get("barberSlug");
    const barberId = searchParams.get("barberId");

    const wixConfigured = isWixConfigured();

    // Se nenhum barbeiro foi especificado, retorna todos os barbeiros com serviços
    if (!barberSlug && !barberId) {
      const barbers = getAllBarbers();
      return NextResponse.json({
        success: true,
        wixIntegrationPending: !wixConfigured,
        data: barbers,
      });
    }

    const barber = barberSlug ? getBarberBySlug(barberSlug) : getBarberById(barberId!);

    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado" },
        { status: 404 }
      );
    }

    // Se o Wix estiver configurado com credenciais válidas, consulta a API oficial via Wix SDK
    if (wixConfigured && barber.resourceId) {
      try {
        const wixClient = getWixClient();
        if (wixClient) {
          const result = await wixClient.services.queryServices().find();
          const items = result.items || [];

          // Filtra serviços associados ao Resource ID deste profissional
          const matched = items.filter((s: any) => {
            const resIds = s.staffMemberIds || s.resourceIds || [];
            return resIds.includes(barber.resourceId);
          });

          if (matched.length > 0) {
            const mappedServices = matched.map((s: any) => {
              const duration =
                s.schedule?.availabilityConstraints?.sessionDurations?.[0] ||
                s.schedule?.availabilityConstraints?.durations?.[0]?.minutes ||
                s.schedule?.durationInMinutes ||
                40;

              const priceVal =
                s.payment?.fixed?.price?.value ||
                s.payment?.fixedPrice?.value ||
                s.payment?.rate?.price?.value ||
                s.price?.value ||
                "0";

              const numPrice = Number(priceVal);

              let category: "cabelo" | "barba" | "combo" | "tratamento" = "cabelo";
              const lowerName = (s.name || "").toLowerCase();
              if (lowerName.includes("+") || lowerName.includes("combo")) {
                category = "combo";
              } else if (lowerName.includes("barba") && !lowerName.includes("cabelo")) {
                category = "barba";
              } else if (
                lowerName.includes("sobrancelha") ||
                lowerName.includes("hidrata") ||
                lowerName.includes("limpeza") ||
                lowerName.includes("botox") ||
                lowerName.includes("luzes") ||
                lowerName.includes("platinado") ||
                lowerName.includes("colora") ||
                lowerName.includes("penteado")
              ) {
                category = "tratamento";
              }

              const isSubscription = lowerName.includes("assinatura");
              const formattedPrice = isSubscription
                ? "Plano Assinatura"
                : numPrice > 0
                ? `R$ ${numPrice.toFixed(2).replace(".", ",")}`
                : "Sob consulta";

              return {
                id: s._id || s.id,
                wixServiceId: s._id || s.id,
                name: s.name,
                category,
                bookingUrl:
                  s.urls?.bookingPage ||
                  `https://www.leonunesbarbearia.com/booking-calendar/${s.mainSlug?.name || ""}?resource=${barber.resourceId}`,
                description: s.description || s.tagLine || `Serviço com ${barber.name}.`,
                durationMinutes: duration,
                price: numPrice,
                formattedPrice,
              };
            });

            return NextResponse.json({
              success: true,
              wixIntegrationPending: false,
              source: "wix_official_api",
              barber: {
                id: barber.id,
                name: barber.name,
                role: barber.role,
                photo: barber.photo,
                resourceId: barber.resourceId,
              },
              services: mappedServices,
            });
          }
        }
      } catch (err) {
        console.warn("[WIX BOOKINGS API] Falha na consulta de serviços do Wix, usando cache local oficial:", err);
      }
    }

    // Fallback oficial seguro: serviços cadastrados e validados do barbeiro
    return NextResponse.json({
      success: true,
      wixIntegrationPending: !isWixConfigured,
      source: "local_official_registry",
      barber: {
        id: barber.id,
        name: barber.name,
        role: barber.role,
        photo: barber.photo,
      },
      services: barber.services,
    });
  } catch (error) {
    console.error("[API SERVICES ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao carregar serviços" },
      { status: 500 }
    );
  }
}
