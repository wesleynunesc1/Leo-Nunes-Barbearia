import { NextRequest, NextResponse } from "next/server";
import { validateOwnerSession } from "@/lib/adminAuth";
import { getDynamicBarbers } from "@/lib/wixDynamicSync";

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
    const barbers = await getDynamicBarbers();
    
    // Agrupa todos os serviços disponíveis na barbearia
    const servicesMap = new Map<string, any>();

    for (const barber of barbers) {
      for (const service of barber.services || []) {
        if (!servicesMap.has(service.id)) {
          servicesMap.set(service.id, {
            ...service,
            assignedBarbers: [barber.name],
          });
        } else {
          const existing = servicesMap.get(service.id);
          if (!existing.assignedBarbers.includes(barber.name)) {
            existing.assignedBarbers.push(barber.name);
          }
        }
      }
    }

    const catalogServices = Array.from(servicesMap.values());

    return NextResponse.json({
      success: true,
      services: catalogServices,
      totalServices: catalogServices.length,
    });
  } catch (err: any) {
    console.error("[ADMIN CATALOG API ERROR]", err);
    return NextResponse.json(
      { error: "Falha ao consultar catálogo de serviços: " + (err.message || "") },
      { status: 500 }
    );
  }
}

