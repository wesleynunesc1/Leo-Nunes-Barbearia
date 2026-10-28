import { unstable_cache } from "next/cache";
import { getWixClient, isWixConfigured } from "@/lib/wixClient";
import { BARBERS, Barber, BarberService, getAllBarbers, getBarberBySlug } from "@/data/barbers";

// Tags oficiais de revalidação granular do Next.js 16
export const CACHE_TAG_SERVICES = "wix-services";
export const CACHE_TAG_BARBERS = "wix-barbers";
export const CACHE_TAG_INSTITUTIONAL = "wix-institutional";

// Mapeamento estável e determinístico por Resource ID do Wix Bookings
// NUNCA altere sem correspondência direta no painel Wix Bookings
export const BARBER_RESOURCE_SLUG_MAP: Record<string, string> = {
  "76570209-101f-409b-af97-b445bdb63125": "leo-nunes",
  "ea570fb8-8b9c-493d-af1b-437f2b7a9883": "aleffer-nunes",
  "9ede92c1-dc85-4536-895f-5a9ec6665612": "helio-victor",
  "106d620c-2150-4558-98bb-ad2777bd32e3": "guilherme-oliveira",
};

export const SLUG_TO_RESOURCE_ID_MAP: Record<string, string> = {
  "leo-nunes": "76570209-101f-409b-af97-b445bdb63125",
  "aleffer-nunes": "ea570fb8-8b9c-493d-af1b-437f2b7a9883",
  "helio-victor": "9ede92c1-dc85-4536-895f-5a9ec6665612",
  "guilherme-oliveira": "106d620c-2150-4558-98bb-ad2777bd32e3",
};

export interface DynamicInstitutionalData {
  hero: {
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    subheadline: string;
  };
  contact: {
    phoneFormatted: string;
    whatsappRaw: string;
    whatsappUrl: string;
    instagramUrl: string;
    instagramHandle: string;
    addressLine1: string;
    addressLine2: string;
    cityStateZip: string;
    googleMapsUrl: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    isOpenToday: boolean;
    badgeText: string;
  };
  footerNotice: string;
}

export const DEFAULT_INSTITUTIONAL_DATA: DynamicInstitutionalData = {
  hero: {
    badge: "BARBEARIA EM PACAJUS",
    headlineLine1: "NA LÉO NUNES",
    headlineLine2: "VOCÊ SAI COM VISUAL ALINHADO",
    subheadline: "Cortes modernos, barbas alinhadas e atendimento pontual no centro de Pacajus.",
  },
  contact: {
    phoneFormatted: "(85) 99222-7064",
    whatsappRaw: "5585992227064",
    whatsappUrl: "https://wa.me/5585992227064",
    instagramUrl: "https://instagram.com/leonunesbarbearia",
    instagramHandle: "@leonunesbarbearia",
    addressLine1: "Rua Joaquim Nogueira Lopes, 180, Centro",
    addressLine2: "CEP 62870-000 — Pacajus / Ceará",
    cityStateZip: "Pacajus — Ceará",
    googleMapsUrl: "https://maps.google.com/?q=Rua+Joaquim+Nogueira+Lopes,+180,+Centro,+Pacajus+-+CE,+62870-000",
  },
  hours: {
    weekdays: "08h às 19h",
    saturday: "08h às 18h",
    sunday: "Fechado",
    isOpenToday: true,
    badgeText: "ABERTO HOJE",
  },
  footerNotice: "Cortes precisos, barbas bem desenhadas e atendimento que respeita o seu tempo. Ambiente moderno e profissionais dedicados à sua melhor versão.",
};

/**
 * Converte URI de imagem do Wix (wix:image://v1/...) para URL pública da CDN Wix
 */
export function parseWixMediaUrl(wixMediaUri?: string | null): string | null {
  if (!wixMediaUri) return null;
  if (wixMediaUri.startsWith("http://") || wixMediaUri.startsWith("https://") || wixMediaUri.startsWith("/")) {
    return wixMediaUri;
  }
  const match = wixMediaUri.match(/wix:image:\/\/v1\/([^/~#\s]+~[^/~#\s]+\.[a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return `https://static.wixstatic.com/media/${match[1]}`;
  }
  const altMatch = wixMediaUri.match(/wix:image:\/\/v1\/([^/#\s]+)/);
  if (altMatch && altMatch[1]) {
    const rawId = altMatch[1].split("/")[0];
    return `https://static.wixstatic.com/media/${rawId}`;
  }
  return null;
}

/**
 * Consulta direta aos serviços oficiais do Wix Bookings
 */
async function fetchWixOfficialServices(): Promise<BarberService[]> {
  if (!isWixConfigured()) {
    return [];
  }

  const wixClient = getWixClient();
  if (!wixClient) return [];

  try {
    const result = await wixClient.services.queryServices().limit(100).find();
    const items = result.items || [];

    return items
      .filter((s: any) => {
        if (s.hidden || s.status === "INACTIVE") return false;
        const nameLower = (s.name || "").toLowerCase();
        if (nameLower.includes("assinatura") || nameLower.includes("freestyle")) {
          return false;
        }
        return true;
      })
      .map((s: any) => {
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
          lowerName.includes("penteado") ||
          lowerName.includes("freestyle")
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
            `https://www.leonunesbarbearia.com/booking-calendar/${s.mainSlug?.name || ""}`,
          description: s.description || s.tagLine || `Serviço oficial da Léo Nunes Barbearia.`,
          durationMinutes: duration,
          price: numPrice,
          formattedPrice,
          resourceIds: s.staffMemberIds || s.resourceIds || [],
        };
      });
  } catch (error) {
    console.error("[WIX SERVICES SYNC ERROR]", error);
    return [];
  }
}

/**
 * Consulta direta aos profissionais oficiais do Wix (Staff Members & CMS)
 */
async function fetchWixStaffAndCMS(): Promise<{
  staffMap: Record<string, { name: string; photo?: string; resourceId?: string }>;
  cmsBarbersMap: Record<string, Partial<Barber>>;
}> {
  const staffMap: Record<string, { name: string; photo?: string; resourceId?: string }> = {};
  const cmsBarbersMap: Record<string, Partial<Barber>> = {};

  if (!isWixConfigured()) {
    return { staffMap, cmsBarbersMap };
  }

  const wixClient = getWixClient();
  if (!wixClient) return { staffMap, cmsBarbersMap };

  // 1. Staff Members da API Bookings
  try {
    const staffRes = await wixClient.staffMembers.queryStaffMembers().find();
    for (const sm of staffRes.items || []) {
      const resId = sm.resourceId;
      if (resId) {
        const photoUrl = parseWixMediaUrl(sm.mainMedia?.image);
        staffMap[resId] = {
          name: sm.name || "",
          photo: photoUrl || undefined,
          resourceId: resId,
        };
      }
    }
  } catch (staffErr) {
    console.warn("[WIX STAFF SYNC] Não foi possível carregar staffMembers:", staffErr);
  }

  // 2. Wix CMS: Coleção Barbers (se configurada pelo usuário no Wix Studio)
  try {
    const cmsRes = await (wixClient as any).items.query("Barbers").limit(20).find();
    for (const item of cmsRes.items || []) {
      const slug = item.slug || (item.resourceId ? BARBER_RESOURCE_SLUG_MAP[item.resourceId] : undefined);
      if (slug) {
        cmsBarbersMap[slug] = {
          name: item.name || item.title,
          role: item.role || "Barber Profissional",
          tagline: item.tagline || item.bio || item.description,
          photo: parseWixMediaUrl(item.photo || item.image) || undefined,
        };
      }
    }
  } catch {
    // Coleção não existe ou vazia — comportamento normal e esperado
  }

  return { staffMap, cmsBarbersMap };
}

/**
 * Consulta de conteúdo institucional do Wix CMS
 */
async function fetchWixInstitutionalCMS(): Promise<DynamicInstitutionalData> {
  if (!isWixConfigured()) {
    return DEFAULT_INSTITUTIONAL_DATA;
  }

  const wixClient = getWixClient();
  if (!wixClient) return DEFAULT_INSTITUTIONAL_DATA;

  try {
    // Tenta consultar coleção SiteContent ou Institutional no Wix CMS
    const collections = ["SiteContent", "Institutional"];
    for (const col of collections) {
      try {
        const res = await (wixClient as any).items.query(col).limit(1).find();
        if (res.items && res.items.length > 0) {
          const item = res.items[0];
          return {
            hero: {
              badge: item.heroBadge || DEFAULT_INSTITUTIONAL_DATA.hero.badge,
              headlineLine1: item.heroHeadline1 || DEFAULT_INSTITUTIONAL_DATA.hero.headlineLine1,
              headlineLine2: item.heroHeadline2 || DEFAULT_INSTITUTIONAL_DATA.hero.headlineLine2,
              subheadline: item.heroSubheadline || DEFAULT_INSTITUTIONAL_DATA.hero.subheadline,
            },
            contact: {
              phoneFormatted: item.phone || DEFAULT_INSTITUTIONAL_DATA.contact.phoneFormatted,
              whatsappRaw: (item.whatsapp || DEFAULT_INSTITUTIONAL_DATA.contact.whatsappRaw).replace(/\D/g, ""),
              whatsappUrl: item.whatsapp
                ? `https://wa.me/${item.whatsapp.replace(/\D/g, "")}`
                : DEFAULT_INSTITUTIONAL_DATA.contact.whatsappUrl,
              instagramUrl: item.instagramUrl || DEFAULT_INSTITUTIONAL_DATA.contact.instagramUrl,
              instagramHandle: item.instagramHandle || DEFAULT_INSTITUTIONAL_DATA.contact.instagramHandle,
              addressLine1: item.addressLine1 || DEFAULT_INSTITUTIONAL_DATA.contact.addressLine1,
              addressLine2: item.addressLine2 || DEFAULT_INSTITUTIONAL_DATA.contact.addressLine2,
              cityStateZip: item.cityState || DEFAULT_INSTITUTIONAL_DATA.contact.cityStateZip,
              googleMapsUrl: item.googleMapsUrl || DEFAULT_INSTITUTIONAL_DATA.contact.googleMapsUrl,
            },
            hours: {
              weekdays: item.hoursWeekdays || DEFAULT_INSTITUTIONAL_DATA.hours.weekdays,
              saturday: item.hoursSaturday || DEFAULT_INSTITUTIONAL_DATA.hours.saturday,
              sunday: item.hoursSunday || DEFAULT_INSTITUTIONAL_DATA.hours.sunday,
              isOpenToday: item.isOpenToday ?? DEFAULT_INSTITUTIONAL_DATA.hours.isOpenToday,
              badgeText: item.hoursBadge || DEFAULT_INSTITUTIONAL_DATA.hours.badgeText,
            },
            footerNotice: item.footerNotice || DEFAULT_INSTITUTIONAL_DATA.footerNotice,
          };
        }
      } catch {
        // Tenta próxima coleção
      }
    }
  } catch (err) {
    console.warn("[WIX CMS INSTITUTIONAL]", err);
  }

  return DEFAULT_INSTITUTIONAL_DATA;
}

// =============================================================================
// FUNÇÕES CACHED NEXT.JS 16 COM TAGS E REVALIDAÇÃO AUTOMÁTICA EM BACKGROUND
// =============================================================================

export const getDynamicOfficialServices = unstable_cache(
  async (): Promise<BarberService[]> => {
    return await fetchWixOfficialServices();
  },
  ["wix-dynamic-services"],
  {
    tags: [CACHE_TAG_SERVICES],
    revalidate: 180, // revalidação a cada 3 minutos (stale-while-revalidate)
  }
);

export const getDynamicStaffAndCMS = unstable_cache(
  async () => {
    return await fetchWixStaffAndCMS();
  },
  ["wix-dynamic-staff-cms"],
  {
    tags: [CACHE_TAG_BARBERS],
    revalidate: 180,
  }
);

export const getDynamicInstitutional = unstable_cache(
  async (): Promise<DynamicInstitutionalData> => {
    return await fetchWixInstitutionalCMS();
  },
  ["wix-dynamic-institutional"],
  {
    tags: [CACHE_TAG_INSTITUTIONAL],
    revalidate: 300, // revalidação a cada 5 minutos
  }
);

/**
 * Retorna todos os barbeiros sincronizados dinamicamente:
 * - Serviços oficiais do Wix Bookings atribuídos ao Resource ID de cada profissional
 * - Fotos e dados visuais do Wix Staff Members ou CMS
 * - Se a API do Wix estiver indisponível, fallback seguro para BARBERS locais
 */
export async function getDynamicBarbers(): Promise<Barber[]> {
  try {
    const [liveServices, { staffMap, cmsBarbersMap }] = await Promise.all([
      getDynamicOfficialServices(),
      getDynamicStaffAndCMS(),
    ]);

    const baseBarbers = getAllBarbers();

    return baseBarbers.map((b) => {
      const resourceId = b.resourceId || SLUG_TO_RESOURCE_ID_MAP[b.slug];
      const cmsData = cmsBarbersMap[b.slug] || {};
      const staffData = resourceId ? staffMap[resourceId] : undefined;

      // Serviços oficiais do Wix associados a este profissional
      let professionalServices: BarberService[] = [];
      if (liveServices.length > 0 && resourceId) {
        professionalServices = liveServices.filter((s: any) => {
          const rIds: string[] = s.resourceIds || [];
          return rIds.includes(resourceId);
        });
      }

      // Se o Wix retornou serviços para o profissional, usa os oficiais
      // Caso contrário, preserva o fallback local validado
      const services = (professionalServices.length > 0 ? professionalServices : b.services).filter(
        (s) => {
          const lower = (s.name || "").toLowerCase();
          return !lower.includes("assinatura") && !lower.includes("freestyle");
        }
      );

      return {
        ...b,
        name: cmsData.name || b.name,
        role: cmsData.role || b.role || "Barber Profissional",
        tagline: cmsData.tagline || b.tagline,
        // Mantém as fotos oficiais de alta definição originais do site como solicitado
        photo: b.photo,
        resourceId,
        services,
      };
    });
  } catch (err) {
    console.error("[DYNAMIC BARBERS RESOLVE ERROR] Fallback para dados locais:", err);
    return getAllBarbers();
  }
}

/**
 * Retorna um barbeiro específico por slug com seus serviços sincronizados
 */
export async function getDynamicBarberBySlug(slug: string): Promise<Barber | undefined> {
  const barbers = await getDynamicBarbers();
  return barbers.find((b) => b.slug === slug);
}

/**
 * Retorna um barbeiro específico por ID com seus serviços sincronizados
 */
export async function getDynamicBarberById(id: string): Promise<Barber | undefined> {
  const barbers = await getDynamicBarbers();
  return barbers.find((b) => b.id === id);
}
