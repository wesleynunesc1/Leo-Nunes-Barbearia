import { getAllBarbers } from "@/data/barbers";

export default function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://leonunesbarbearia.vercel.app";

  const barbers = getAllBarbers();
  const buildDate = new Date().toISOString().split("T")[0];

  const barberRoutes = barbers.map((b) => ({
    url: `${baseUrl}/agendar/${b.slug}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: buildDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/agendar`,
      lastModified: buildDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: buildDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...barberRoutes,
  ];
}
