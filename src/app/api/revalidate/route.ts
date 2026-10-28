import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  CACHE_TAG_SERVICES,
  CACHE_TAG_BARBERS,
  CACHE_TAG_INSTITUTIONAL,
} from "@/lib/wixDynamicSync";

export async function POST(request: NextRequest) {
  return handleRevalidation(request);
}

export async function GET(request: NextRequest) {
  return handleRevalidation(request);
}

async function handleRevalidation(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret =
      searchParams.get("secret") ||
      request.headers.get("x-revalidate-secret") ||
      request.headers.get("x-webhook-secret");

    const validSecret =
      process.env.REVALIDATION_SECRET?.trim() ||
      process.env.WIX_SITE_ID?.trim();

    if (!validSecret || secret !== validSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autorizado. Forneça o parâmetro secret válido.",
        },
        { status: 401 }
      );
    }

    const tag = searchParams.get("tag");
    const path = searchParams.get("path");
    const revalidated: string[] = [];

    // Revalidação por Tag
    if (tag) {
      if (tag === "all") {
        revalidateTag(CACHE_TAG_SERVICES);
        revalidateTag(CACHE_TAG_BARBERS);
        revalidateTag(CACHE_TAG_INSTITUTIONAL);
        revalidated.push(CACHE_TAG_SERVICES, CACHE_TAG_BARBERS, CACHE_TAG_INSTITUTIONAL);
      } else {
        revalidateTag(tag);
        revalidated.push(tag);
      }
    }

    // Revalidação por Path
    if (path) {
      if (path === "all") {
        const paths = [
          "/",
          "/agendar",
          "/agendar/leo-nunes",
          "/agendar/aleffer-nunes",
          "/agendar/helio-victor",
          "/agendar/guilherme-oliveira",
        ];
        paths.forEach((p) => revalidatePath(p));
        revalidated.push(...paths);
      } else {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    // Se nem tag nem path foram especificados, revalida tudo por padrão
    if (!tag && !path) {
      revalidateTag(CACHE_TAG_SERVICES);
      revalidateTag(CACHE_TAG_BARBERS);
      revalidateTag(CACHE_TAG_INSTITUTIONAL);
      revalidatePath("/");
      revalidatePath("/agendar");
      revalidated.push(
        CACHE_TAG_SERVICES,
        CACHE_TAG_BARBERS,
        CACHE_TAG_INSTITUTIONAL,
        "/",
        "/agendar"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cache revalidado com sucesso.",
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[REVALIDATE ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno durante a revalidação",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
