import { NextRequest, NextResponse } from "next/server";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";
import { getStorageAdapterInfo } from "@/lib/bookingStore";

export async function GET(request: NextRequest) {
  try {
    // Proteção de segurança: requer segredo administrativo se configurado ou em produção
    const secretConfigured = process.env.ADMIN_DIAGNOSTIC_SECRET?.trim();
    const providedToken =
      request.headers.get("x-admin-key") ||
      request.nextUrl.searchParams.get("token") ||
      request.nextUrl.searchParams.get("secret");

    const isProduction = process.env.NODE_ENV === "production";

    if (secretConfigured && providedToken !== secretConfigured) {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }

    if (isProduction && !secretConfigured) {
      return NextResponse.json(
        { success: false, error: "Endpoint desativado em produção." },
        { status: 403 }
      );
    }

    const hasApiKey = Boolean(process.env.WIX_API_KEY?.trim());
    const hasSiteId = Boolean(process.env.WIX_SITE_ID?.trim());
    const hasClientId = Boolean(process.env.WIX_CLIENT_ID?.trim() || process.env.WIX_ACCOUNT_ID?.trim());

    if (!hasApiKey || !hasSiteId) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: "Credenciais do Wix não configuradas.",
      }, { status: 400 });
    }

    const wixClient = getWixClient();
    if (!wixClient) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: "Falha ao instanciar o cliente Wix SDK com ApiKeyStrategy.",
      }, { status: 500 });
    }

    // 1. Consulta de Serviços no Wix Bookings
    let servicesList: any[] = [];
    let servicesError: string | null = null;
    try {
      const servicesResult = await wixClient.services.queryServices().find();
      servicesList = servicesResult.items || [];
    } catch (err: any) {
      servicesError = err?.message || "Erro ao consultar serviços";
      console.warn("[WIX DIAGNOSTIC] Falha ao consultar serviços:", servicesError);
    }

    // 2. Consulta de Recursos / Barbeiros no Wix Bookings
    let resourcesList: any[] = [];
    let resourcesError: string | null = null;
    try {
      const resourcesResult = await wixClient.resources.queryResources().find();
      resourcesList = resourcesResult.items || [];
    } catch (err: any) {
      resourcesError = err?.message || "Erro ao consultar recursos";
      console.warn("[WIX DIAGNOSTIC] Falha ao consultar recursos:", resourcesError);
    }

    // 2.1 Consulta de Membros da Equipe (Staff Members)
    let staffList: any[] = [];
    try {
      const staffResult = await wixClient.staffMembers.queryStaffMembers().find();
      staffList = staffResult.items || [];
    } catch (err: any) {
      console.warn("[WIX DIAGNOSTIC] Consulta staff members opcional:", err?.message);
    }

    const connected = !servicesError && !resourcesError;

    // Mapeamento limpo dos serviços para apresentação (sem dados confidenciais)
    const sanitizedServices = servicesList.map((s: any) => {
      const duration =
        s.schedule?.availabilityConstraints?.sessionDurations?.[0] ||
        s.schedule?.availabilityConstraints?.durations?.[0]?.minutes ||
        s.schedule?.durationInMinutes ||
        s.duration ||
        null;

      const priceVal =
        s.payment?.fixed?.price?.value ||
        s.payment?.fixedPrice?.value ||
        s.payment?.rate?.price?.value ||
        s.payment?.price?.value ||
        s.price?.value ||
        null;

      const currency =
        s.payment?.fixed?.price?.currency ||
        s.payment?.fixedPrice?.currency ||
        s.payment?.rate?.price?.currency ||
        s.payment?.price?.currency ||
        "BRL";

      return {
        id: s._id || s.id,
        name: s.name,
        tagLine: s.tagLine || null,
        description: s.description || null,
        durationMinutes: duration,
        price: priceVal !== null ? Number(priceVal) : "Sob consulta",
        formattedPrice: priceVal !== null ? `R$ ${Number(priceVal).toFixed(2).replace(".", ",")}` : "Sob consulta",
        currency,
        category: s.category?.name || "Geral",
        resourceIds: s.staffMemberIds || s.resourceIds || [],
      };
    });

    // Mapeamento limpo dos recursos/profissionais
    const sanitizedResources = resourcesList.map((r: any) => ({
      id: r._id || r.id,
      name: r.name,
      description: r.description || null,
      schedules: r.schedules || null,
      status: r.status || "ACTIVE",
    }));

    const sanitizedStaff = staffList.map((st: any) => ({
      id: st._id || st.id,
      name: st.name,
      resourceId: st.resourceId || null,
    }));

    return NextResponse.json({
      success: connected,
      connected,
      authMethod: "ApiKeyStrategy",
      envStatus: {
        hasApiKey: true,
        hasSiteId: true,
        hasClientId,
      },
      permissions: {
        servicesQuery: !servicesError,
        resourcesQuery: !resourcesError,
        servicesError: servicesError ? "Permissão de leitura ou erro na API de serviços" : null,
        resourcesError: resourcesError ? "Permissão de leitura ou erro na API de recursos" : null,
      },
      counts: {
        services: sanitizedServices.length,
        resources: sanitizedResources.length,
        staff: sanitizedStaff.length,
      },
      data: {
        services: sanitizedServices,
        resources: sanitizedResources,
        staff: sanitizedStaff,
      },
      storage: await getStorageAdapterInfo(),
    });
  } catch (globalError: any) {
    console.error("[WIX DIAGNOSTIC CRITICAL]", globalError?.message);
    return NextResponse.json({
      success: false,
      connected: false,
      error: "Ocorreu um erro ao executar o teste de conexão administrativa com o Wix.",
      message: globalError?.message,
    }, { status: 500 });
  }
}
